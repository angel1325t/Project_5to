// Asegúrate de incluir SweetAlert.js antes de este script en tu HTML:
// <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector('#multistep-form form');
  const payButton = document.querySelector('.pay-step');

  // Función para obtener el token CSRF
  function getCsrfToken() {
      return document.querySelector('[name=csrfmiddlewaretoken]').value;
  }

  // Manejar el clic en el botón "Pagar"
  payButton.addEventListener('click', function (event) {
      event.preventDefault(); // Evitar comportamiento por defecto

      // Validaciones adicionales del paso 3
      const reference = document.querySelector('input[name="reference"]').value.trim();
      const bank = document.querySelector('input[name="bank"]').value.trim();
      const amount = parseFloat(document.querySelector('input[name="monto"]').value);
      const accountType = document.querySelector('select[name="tipo_cuenta"]').value;

      if (reference.length < 6 || reference.length > 20) {
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'El número de referencia debe tener entre 6 y 20 caracteres.',
              confirmButtonText: 'OK'
          });
          return;
      }

      if (!bank) {
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'El campo Banco Emisor no puede estar vacío.',
              confirmButtonText: 'OK'
          });
          return;
      }

      if (isNaN(amount) || amount <= 0) {
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'El monto transferido debe ser un número mayor a cero.',
              confirmButtonText: 'OK'
          });
          return;
      }

      if (!accountType) {
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Debes seleccionar un tipo de cuenta.',
              confirmButtonText: 'OK'
          });
          return;
      }

      // Mostrar mensaje de "procesando"
      Swal.fire({
          title: 'Procesando transferencia...',
          allowOutsideClick: false,
          didOpen: () => {
              Swal.showLoading();
          }
      });

      // Enviar el formulario al backend
      const formData = new FormData(form);
      fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
              'X-CSRFToken': getCsrfToken()
          }
      })
          .then(response => response.json())
          .then(data => {
              Swal.close(); // Cerrar el mensaje de "procesando"

              if (data.success) {
                  // Mostrar mensaje de éxito
                  Swal.fire({
                      icon: 'success',
                      title: '¡Transferencia Exitosa!',
                      text: data.message || 'La transferencia y venta se registraron correctamente.',
                      confirmButtonText: 'OK'
                  }).then(() => {
                      console.log('Alerta de éxito cerrada, recargando la página'); // Depuración
                      form.reset(); // Reiniciar el formulario
                      location.reload(); // Recargar la página inmediatamente
                  });
              } else {
                  // Mostrar mensaje de error
                  Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: data.message || 'Hubo un problema al procesar la transferencia.',
                      confirmButtonText: 'Intentar de nuevo'
                  });
              }
          })
          .catch(error => {
              Swal.close();
              Swal.fire({
                  icon: 'error',
                  title: 'Error de Conexión',
                  text: 'No se pudo conectar con el servidor. Por favor, intenta de nuevo.',
                  confirmButtonText: 'OK'
              });
              console.error('Error en la solicitud:', error);
          });
  });
});