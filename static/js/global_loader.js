function showLoader() {
    document.getElementById('loading-spinner').style.display = 'flex';
    document.body.classList.add('disable-interaction'); // Bloquea interacciones
}

function hideLoader() {
    document.getElementById('loading-spinner').style.display = 'none';
    document.body.classList.remove('disable-interaction'); // Restaura interacciones
}

// Ocultar el loader solo si la página se ha cargado completamente
window.addEventListener("load", function () {
    hideLoader();
});

// Mostrar el loader al enviar formularios
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function () {
        showLoader();
    });
});