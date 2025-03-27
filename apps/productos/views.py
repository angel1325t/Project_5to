from django.core.paginator import Paginator
from django.shortcuts import render
from .forms import AddProductForm
from django.contrib import messages
from django.shortcuts import redirect
from .models import Producto, Categoria

# Create your views here.
def add_product_view(request):
    if request.method == 'POST':
        form = AddProductForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                form.save()
            except:
                messages(request, 'Error al guardar el producto')
                return redirect('products')
    return redirect('products')

def product_view(request):
    empleado = request.user

    # Obtener todos los productos activos
    products_list = Producto.objects.filter(activo=True)

    # Paginación
    paginator = Paginator(products_list, 5)  # 5 productos por página
    page_number = request.GET.get('page')  # Número de página desde la URL
    products = paginator.get_page(page_number)

    # Obtener todas las categorías
    categories = Categoria.objects.all()

    # Contexto para el template
    context = {
        'products': products,
        'categories': categories,
        'empleado': empleado
    }

    return render(request, 'products/products.html', context)
