from django.utils import timezone
from django.contrib.auth.decorators import login_required
import stripe
from django.conf import settings
from decimal import Decimal, ROUND_HALF_UP
from django.shortcuts import render
import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from .models import DetalleVenta, Venta, Transferencia
from ..productos.models import Producto
from django.db.models import F
stripe.api_key = settings.STRIPE_SECRET_KEY

@login_required
def ventas(request):
    employe = request.user
    products = Producto.objects.all()
    search_query = request.GET.get('search', '')    

    if search_query:
        products = products.filter(nombre__icontains=search_query)

    context = {
        'empleado': employe,
        'productos': products,
    }

    return render(request, 'ventas/register_sale.html', context)

@login_required
def get_producto(request, producto_id):
    try:
        product = Producto.objects.get(id_producto=producto_id)
    except Producto.DoesNotExist:
        return JsonResponse({"error": "Producto no encontrado"}, status=404)

    product_data = {
        'nombre': product.nombre,
        'precio': product.precio,
        'categoria': product.categoria.nombre_categoria,
        'image': product.image.url,
        'descripcion': product.descripcion if product.descripcion else 'Sin descripción',
        'descuento': product.descuento if product.descuento is not None and product.descuento > 0 else 0,
    }
    return JsonResponse(product_data)
@login_required
def process_sale(request):
    if request.method == "POST":
        try:
            # Intentar cargar los datos JSON
            data = json.loads(request.body)

            employee = request.user

            # Validar datos
            if not data.get("products") or not data.get("total"):
                return JsonResponse({"success": False, "message": "Datos incompletos"}, status=400)

            # Validar que el total sea un número positivo
            try:
                total = Decimal(str(data["total"]))
                if total <= 0:
                    return JsonResponse({"success": False, "message": "El total debe ser mayor que cero"}, status=400)
            except (ValueError, TypeError):
                return JsonResponse({"success": False, "message": "El total debe ser un número válido"}, status=400)

            # Método de pago
            payment_method = data.get("payment_method", "CASH")

            # Crear la venta
            sale = Venta.objects.create(
                empleado=employee,
                total=total,
                metodo_pago=payment_method,
                fecha=now()
            )

            # Obtener productos en una sola consulta
            product_ids = [item["id"] for item in data["products"]]
            products = Producto.objects.filter(id_producto__in=product_ids)
            products_dict = {product.id_producto: product for product in products}

            # Guardar detalles de la venta
            for item in data["products"]:
                product_id = item["id"]
                if product_id not in products_dict:
                    return JsonResponse({"success": False, "message": f"Producto con ID {product_id} no encontrado"}, status=404)

                product = products_dict[product_id]
                
                discount = item["discount"]
                quantity = Decimal(item["quantity"])
                unit_price = Decimal(str(item["price"]))
                subtotal = quantity * unit_price
                tax = subtotal * Decimal("0.18")

                # Verificar si el descuento es 0 o tiene un valor distinto de nulo o vacío
                if discount and Decimal(discount) != 0:
                    DetalleVenta.objects.create(
                        venta=sale,
                        producto=product,
                        cantidad=int(quantity),
                        precio_unitario=unit_price,
                        subtotal=subtotal,
                        itbis=tax,
                        descuento=True,
                        cantidad_descuento=Decimal(discount)
                    )
                else:
                    DetalleVenta.objects.create(
                        venta=sale,
                        producto=product,
                        cantidad=int(quantity),
                        precio_unitario=unit_price,
                        subtotal=subtotal,
                        itbis=tax
                    )

                # Actualizar stock usando update()
                Producto.objects.filter(id_producto=product.id_producto).update(stock=F('stock') - int(quantity))
            return JsonResponse({"success": True, "message": "Venta registrada exitosamente", "sale_id": sale.id_venta})

        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Datos inválidos. JSON mal formado."}, status=400)
        except Exception as e:
            return JsonResponse({"success": False, "message": f"Error inesperado: {str(e)}"}, status=500)

    return JsonResponse({"success": False, "message": "Método no permitido"}, status=405)


@login_required
def process_transfer(request):
    if request.method == "POST":
        try:
            data = request.POST

            # Validar datos
            required_fields = ["name", "phone", "email", "reference", "bank", "monto", "tipo_cuenta"]
            if not all(data.get(field) for field in required_fields):
                return JsonResponse({"success": False, "message": "Faltan datos obligatorios"}, status=400)

            transfer_amount = Decimal(data.get("monto"))
            if transfer_amount <= 0:
                return JsonResponse({"success": False, "message": "El monto debe ser mayor a cero"}, status=400)

            # Crear venta y transferencia
            employee = request.user
            sale = Venta.objects.create(
                empleado=employee,
                total=transfer_amount,
                metodo_pago="TRANSFERENCIA",
                fecha=now()
            )
            transfer = Transferencia.objects.create(
                venta=sale,
                numero_referencia=data.get("reference"),
                banco_emisor=data.get("bank"),
                nombre_cliente=data.get("name"),
                telefono_cliente=data.get("phone"),
                correo_cliente=data.get("email"),
                tipo_cuenta=data.get("tipo_cuenta")
            )

            # Procesar productos (si los hay)
            products_json = data.get("products")
            if products_json:
                products_data = json.loads(products_json)
                product_ids = [int(item["id"]) for item in products_data]
                products = Producto.objects.filter(id_producto__in=product_ids)
                products_dict = {p.id_producto: p for p in products}

                for item in products_data:
                    product_id = int(item["id"])
                    if product_id not in products_dict:
                        return JsonResponse({"success": False, "message": f"Producto con ID {product_id} no encontrado"}, status=404)

                    product = products_dict[product_id]
                    quantity = Decimal(item["quantity"])
                    if product.stock < int(quantity):
                        return JsonResponse({"success": False, "message": f"Stock insuficiente para {product.nombre}"}, status=400)

                    total_price = Decimal(str(item["price"]))
                    unit_price = total_price / quantity
                    subtotal = quantity * unit_price
                    itbis = subtotal * Decimal("0.18")

                    discount = item.get("discount", 0)
                    DetalleVenta.objects.create(
                        venta=sale,
                        producto=product,
                        cantidad=int(quantity),
                        precio_unitario=unit_price,
                        subtotal=subtotal,
                        itbis=itbis,
                        descuento=bool(discount),
                        cantidad_descuento=discount if discount else 0
                    )
                    product.stock -= int(quantity)
                    product.save()

            return JsonResponse({
            "success": True,
            "message": "La transferencia y venta se registraron correctamente",  # Mensaje corregido
            "sale_id": int(sale.id_venta),
            "transfer_id": int(transfer.pk)
        })
        except Exception as e:
            return JsonResponse({"success": False, "message": f"Error inesperado: {str(e)}"}, status=500)

    return JsonResponse({"success": False, "message": "Método no permitido"}, status=405)

@login_required
def process_card_payment(request):
    if request.method == "POST":
        try:
            data = request.POST

            # Validar datos obligatorios
            required_fields = ["stripeToken", "total", "products"]
            if not all(data.get(field) for field in required_fields):
                return JsonResponse({"success": False, "message": "Faltan datos obligatorios"}, status=400)

            total_decimal = Decimal(data.get("total"))
            if total_decimal <= 0:
                return JsonResponse({"success": False, "message": "El monto debe ser mayor a cero"}, status=400)

            products_list = json.loads(data.get("products"))
            if not products_list:
                return JsonResponse({"success": False, "message": "No hay productos en la compra"}, status=400)

            # Calcular total con ITBIS
            calculated_subtotal = sum(Decimal(str(item["price"])) for item in products_list)
            itbis_total = calculated_subtotal * Decimal("0.18")
            calculated_total_with_itbis = (calculated_subtotal + itbis_total).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

            if calculated_total_with_itbis != total_decimal:
                return JsonResponse({"success": False, "message": "El total no coincide con los productos"}, status=400)

            # Crear cargo en Stripe
            charge = stripe.Charge.create(
                amount=int(total_decimal * 100),
                currency="usd",
                source=data.get("stripeToken"),
                description="Pago con tarjeta en POS"
            )

            # Crear venta
            sale = Venta.objects.create(
                empleado=request.user,
                total=total_decimal,
                metodo_pago="TARJETA",
                fecha=timezone.now()
            )

            # Obtener productos desde la BD
            product_ids = [int(item["id"]) for item in products_list]
            products_db = Producto.objects.filter(id_producto__in=product_ids)
            products_dict = {p.id_producto: p for p in products_db}

            # Procesar productos
            for item in products_list:
                product_id = int(item["id"])
                product = products_dict.get(product_id)
                if not product:
                    return JsonResponse({"success": False, "message": f"Producto con ID {product_id} no encontrado"}, status=404)

                quantity = int(item["quantity"])
                if product.stock < quantity:
                    return JsonResponse({"success": False, "message": f"Stock insuficiente para {product.nombre}"}, status=400)

                total_price = Decimal(str(item["price"]))
                unit_price = total_price / quantity
                subtotal = total_price
                itbis = subtotal * Decimal("0.18")
                discount = item.get("discount", 0)

                DetalleVenta.objects.create(
                    venta=sale,
                    producto=product,
                    cantidad=quantity,
                    precio_unitario=unit_price,
                    subtotal=subtotal,
                    itbis=itbis,
                    descuento=bool(discount),
                    cantidad_descuento=discount if discount else 0
                )
                product.stock -= quantity
                product.save()

            return JsonResponse({
                "success": True,
                "message": "El pago y la venta se registraron correctamente",
                "sale_id": int(sale.id_venta),
                "charge_id": charge.id
            })

        except stripe.error.CardError as e:
            return JsonResponse({"success": False, "message": f"Error con la tarjeta: {str(e)}"}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Error en los datos de productos"}, status=400)
        except ValueError:
            return JsonResponse({"success": False, "message": "Error en los datos enviados"}, status=400)
        except Exception as e:
            return JsonResponse({"success": False, "message": f"Error inesperado: {str(e)}"}, status=500)

    return JsonResponse({"success": False, "message": "Método no permitido"}, status=405)
