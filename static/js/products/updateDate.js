// Actualizar fecha y hora actual
function updateDateTime() {
    const dateTimeElement = document.getElementById('current-date-time');
    const now = new Date();
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    dateTimeElement.textContent = now.toLocaleString('es-MX', { ...options, timeZone: 'America/Santo_Domingo' });
}

// Actualiza cada minuto
setInterval(updateDateTime, 60000);

// Llamar a la función una vez al cargar la página para mostrar la hora de inmediato
updateDateTime();
