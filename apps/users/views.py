from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseForbidden
from django.contrib.auth import logout, authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.contrib.auth.hashers import make_password
from django.views import View
from .models import CustomUser
from django.conf import settings
import os

# Mantener como FBV porque es simple y maneja autenticación
def login_view(request):
    if request.user.is_authenticated:
        return redirect('admin:index' if request.user.is_superuser else 'productos')

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        if not username:
            messages.error(request, "El nombre de usuario es obligatorio.")
            return redirect('login')

        if not password:
            messages.error(request, "La contraseña es obligatoria.")
            return redirect('login')

        # Busca al usuario por nombre de usuario
        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            user = None

        # Si el usuario existe, verifica la contraseña manualmente
        if user and user.check_password(password):
            if not user.is_active:
                return render(request, 'secure/disable_user.html')  # Redirige si está deshabilitado
            
            login(request, user)  # Inicia sesión si todo está correcto
            return redirect('admin:index' if user.is_superuser else 'productos')
        else:
            messages.error(request, "Nombre de usuario o contraseña incorrectos.")
            return redirect('login')

    return render(request, 'secure/login.html')


# Mantener como FBV porque solo cierra sesión y redirige
def logout_view(request):
    logout(request)
    return redirect('/')

# Convertir en CBV porque maneja múltiples métodos HTTP y actualización de datos
from django.shortcuts import redirect
from django.contrib import messages

class CreateCredentialsView(View):
    def get(self, request, id):
        user = get_object_or_404(CustomUser, id=id)

        # Si last_login no es NULL, devolver error 403
        if user.last_login is not None:
            return HttpResponseForbidden("No tienes permiso para acceder a esta página.")

        return render(request, "secure/create_credentials.html", {"user": user, "profile_image": user.profile_image})

    def post(self, request, id):
        user = get_object_or_404(CustomUser, id=id)

        # Si last_login no es NULL, devolver error 403
        if user.last_login is not None:
            return HttpResponseForbidden("No tienes permiso para realizar esta acción.")

        username = request.POST.get("username")
        password = request.POST.get("password")
        profile_image = request.FILES.get("profile_image")

        if username:
            user.username = username

        if password:
            user.password = make_password(password)

        if profile_image:
            ext = profile_image.name.split('.')[-1]
            filename = f"user_{user.id}.{ext}"

            if user.profile_image:
                old_path = user.profile_image.path
                if os.path.exists(old_path):
                    os.remove(old_path)

            user.profile_image.save(filename, profile_image)

        user.save()

        # Agregar mensaje de éxito y redirigir al login
        messages.success(request, "Credenciales creadas exitosamente. Ahora puedes iniciar sesión en tu cuenta.")
        return redirect('login')


