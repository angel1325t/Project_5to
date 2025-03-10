from decimal import Decimal
from django.shortcuts import render
import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from .models import Venta, DetalleVenta, Transferencia
from ..productos.models import Producto

def ventas(request):
    empleado = request.user
    productos = Producto.objects.all()
    search_query = request.GET.get('search', '')

    if search_query:
        productos = productos.filter(nombre__icontains=search_query)

    context = {
        'empleado': empleado,
        'productos': productos,
    }

    return render(request, 'ventas/register_sale.html', context)

def get_producto(request, producto_id):
    print(f"Producto ID recibido: {producto_id}")
    try:
        producto = Producto.objects.get(id_producto=producto_id)
    except Producto.DoesNotExist:
        print(f"Producto con id {producto_id} no encontrado.")
        return JsonResponse({"error": "Producto no encontrado"}, status=404)

    producto_data = {
        'nombre': producto.nombre,
        'precio': producto.precio,
        'categoria': producto.categoria.nombre_categoria,
        'image': producto.image.url,
        'descripcion': producto.descripcion if producto.descripcion else 'Sin descripción',
    }
    return JsonResponse(producto_data)

def process_sale(request):
    if request.method == "POST":
        try:
            print("=== Iniciando proceso de venta ===")
            print("Método POST recibido")

            # Intentamos cargar los datos JSON
            data = json.loads(request.body)
            print("Datos recibidos:", data)

            empleado = request.user  # Usuario autenticado que realiza la venta
            print("Empleado autenticado:", empleado)

            # Validar datos
            if not data.get("products") or not data.get("total"):
                print("Error: Datos incompletos. Faltan 'products' o 'total'")
                return JsonResponse({"success": False, "message": "Datos incompletos"}, status=400)

            # Validar que el total sea un número positivo
            try:
                total = Decimal(str(data["total"]))
                if total <= 0:
                    return JsonResponse({"success": False, "message": "El total debe ser un número mayor a cero"}, status=400)
            except (ValueError, TypeError):
                return JsonResponse({"success": False, "message": "El total debe ser un número válido"}, status=400)

            # Método de pago (por defecto 'EFECTIVO')
            metodo_pago = data.get("payment_method", "EFECTIVO")
            print("Método de pago:", metodo_pago)

            # Si es una transferencia, puedes agregar un proceso extra como la validación del pago
            if metodo_pago == "TRANSFERENCIA":
                transferencia_completa = data.get("transferencia_completa", False)
                if not transferencia_completa:
                    return JsonResponse({"success": False, "message": "La transferencia no ha sido confirmada."}, status=400)

            # Crear la venta
            print("Creando venta con total:", total)
            venta = Venta.objects.create(
                empleado=empleado,
                total=total,
                metodo_pago=metodo_pago,  # Usamos el método de pago recibido (EFECTIVO o TRANSFERENCIA)
                fecha=now()
            )
            print("Venta creada exitosamente. ID:", venta.id_venta)

            # Obtener productos en una sola consulta
            producto_ids = [item["id"] for item in data["products"]]
            productos = Producto.objects.filter(id_producto__in=producto_ids)
            productos_dict = {producto.id_producto: producto for producto in productos}

            # Guardar los detalles de la venta
            for item in data["products"]:
                producto_id = item["id"]
                if producto_id not in productos_dict:
                    print(f"Error: Producto con ID {producto_id} no encontrado.")
                    return JsonResponse({"success": False, "message": f"Producto con ID {producto_id} no encontrado"}, status=404)

                producto = productos_dict[producto_id]
                print(f"Producto obtenido: {producto.nombre}")

                cantidad = Decimal(item["quantity"])
                precio_unitario = Decimal(str(item["price"]))
                subtotal = cantidad * precio_unitario
                # Calcular ITBIS como el 18% del subtotal
                itbis = subtotal * Decimal("0.18")
                print(f"Detalle - Cantidad: {cantidad}, Precio Unitario: {precio_unitario}, Subtotal: {subtotal}, ITBIS: {itbis}")

                DetalleVenta.objects.create(
                    venta=venta,
                    producto=producto,
                    cantidad=int(cantidad),
                    precio_unitario=precio_unitario,
                    subtotal=subtotal,
                    itbis=itbis
                )
                print("Detalle de venta creado para el producto con id:", producto.id_producto)

            print("Venta registrada correctamente con ID:", venta.id_venta)
            return JsonResponse({"success": True, "message": "Venta registrada correctamente", "sale_id": venta.id_venta})

        except json.JSONDecodeError:
            print("Error: JSON mal formado.")
            return JsonResponse({"success": False, "message": "Datos no válidos. JSON mal formado."}, status=400)
        except Exception as e:
            print("Excepción encontrada:", str(e))
            return JsonResponse({"success": False, "message": f"Error inesperado: {str(e)}"}, status=500)

    print("Método no permitido. Se esperaba POST.")
    return JsonResponse({"success": False, "message": "Método no permitido"}, status=405)





def process_transferencia(request):
    if request.method == "POST":
        try:
            print("=== Iniciando proceso de transferencia ===")
            print("Método POST recibido")

            # Leer los datos del formulario
            data = request.POST
            print("Datos recibidos:", data)

            # Validar datos: asegurarse de que no falte información clave
            nombre_cliente = data.get("name")
            telefono_cliente = data.get("phone")
            correo_cliente = data.get("email")
            numero_referencia = data.get("reference")
            banco_emisor = data.get("bank")
            monto_transferencia = data.get("monto")

            if not all([nombre_cliente, telefono_cliente, correo_cliente, numero_referencia, banco_emisor, monto_transferencia]):
                print("Error: Faltan datos obligatorios en la solicitud.")
                return JsonResponse({"success": False, "message": "Faltan datos obligatorios"}, status=400)

            # Validar que el monto de la transferencia sea válido
            try:
                monto_transferencia = Decimal(monto_transferencia)
                if monto_transferencia <= 0:
                    return JsonResponse({"success": False, "message": "El monto transferido debe ser mayor a cero"}, status=400)
            except (ValueError, TypeError):
                return JsonResponse({"success": False, "message": "El monto transferido debe ser un número válido"}, status=400)

            # Crear la venta
            empleado = request.user  # Usuario autenticado que realiza la venta
            venta = Venta.objects.create(
                empleado=empleado,
                total=monto_transferencia,
                metodo_pago="TRANSFERENCIA",
                fecha=now()
            )

            # Crear la transferencia con la información del cliente
            transferencia = Transferencia.objects.create(
                venta=venta,
                numero_referencia=numero_referencia,
                banco_emisor=banco_emisor,
                nombre_cliente=nombre_cliente,
                telefono_cliente=telefono_cliente,
                correo_cliente=correo_cliente
            )

            print(f"Transferencia procesada correctamente para la venta #{venta.id_venta} con referencia {transferencia.numero_referencia}")

            return JsonResponse({
                "success": True,
                "message": "Transferencia procesada correctamente.",
                "sale_id": venta.id_venta,
                "transferencia_id": transferencia.id
            })

        except Exception as e:
            print("Excepción encontrada:", str(e))
            return JsonResponse({"success": False, "message": f"Error inesperado: {str(e)}"}, status=500)

    print("Método no permitido. Se esperaba POST.")
    return JsonResponse({"success": False, "message": "Método no permitido"}, status=405)
