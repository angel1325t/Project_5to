document.addEventListener("DOMContentLoaded", function () {
  // Control del flujo multistep
  const steps = document.querySelectorAll('.step-content');
  const indicators = document.querySelectorAll('.step-indicator');
  const btnNext = document.querySelector('.next-step');
  const btnPrev = document.querySelector('.prev-step');
  const btnPay = document.querySelector('.pay-step');

  let currentStep = 1;

  function showStep(step) {
    steps.forEach((div) => div.classList.add('hidden'));
    steps[step - 1].classList.remove('hidden');

    indicators.forEach((ind, idx) => {
      ind.classList.toggle('bg-blue-600', idx < step);
      ind.classList.toggle('bg-gray-300', idx >= step);
    });

    btnPrev.classList.toggle('hidden', step === 1);
    btnNext.classList.toggle('hidden', step === steps.length);
    btnPay.classList.toggle('hidden', step !== steps.length);
  }

  function showValidationMessage(message) {
    const step2 = document.querySelector('.step-content[data-step="2"]');
    
    const existingMessage = step2.querySelector('.validation-message');
    if (existingMessage) existingMessage.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = 'validation-message bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mt-4';
    messageDiv.innerText = message;

    step2.appendChild(messageDiv);
  }

  function formatPhoneNumber(event) {
    let phoneNumber = event.target.value.replace(/\D/g, ''); // Solo números
    
    if (phoneNumber.length === 1) {
        phoneNumber = `+1 ${phoneNumber}`;
    } else if (phoneNumber.startsWith('1')) {
        phoneNumber = `+1 ${phoneNumber.slice(1)}`;
    }

    phoneNumber = phoneNumber.replace(/^\+1 1/, '+1 '); // Evita que se agregue un '1' extra

    if (phoneNumber.length > 6) {
        phoneNumber = phoneNumber.slice(0, 6) + '-' + phoneNumber.slice(6);
    }
    if (phoneNumber.length > 10) {
        phoneNumber = phoneNumber.slice(0, 10) + '-' + phoneNumber.slice(10);
    }

    event.target.value = phoneNumber;
  }

  const phoneInput = document.querySelector('input[name="phone"]');
  if (phoneInput) {
    phoneInput.addEventListener('input', formatPhoneNumber);
  }

  // Validación de paso 2
  function validateStep2() {
    const step2 = document.querySelector('.step-content[data-step="2"]');
    const inputs = step2.querySelectorAll('input[required], select[required], textarea[required]');
    
    for (const input of inputs) {
      if (!input.value.trim()) {
        showValidationMessage('Por favor, completa todos los campos requeridos antes de continuar.');
        return false;
      }

      if (input.name === 'phone') {
        const phonePattern = /^\+1 \d{3}-\d{3}-\d{4}$/;
        if (!phonePattern.test(input.value.trim())) {
          showValidationMessage('El formato del teléfono debe ser +1 000-000-0000.');
          return false;
        }
      }

      if (input.name === 'email') {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailPattern.test(input.value.trim())) {
          showValidationMessage('El correo electrónico debe ser una dirección válida de Gmail.');
          return false;
        }
      }
    }

    const existingMessage = step2.querySelector('.validation-message');
    if (existingMessage) existingMessage.remove();

    return true;
  }

  btnNext.addEventListener('click', () => {
    if (currentStep === 2) {
      if (!validateStep2()) {
        return;
      }
    }

    if (currentStep < steps.length) showStep(++currentStep);
  });
  btnPrev.addEventListener('click', () => {
    if (currentStep > 1) showStep(--currentStep);
  });

  // Inicialización
  showStep(currentStep);
});

// Validaciones del formulario
document.querySelector('form').addEventListener('submit', function(event) {
  // Validar Número de Referencia
  const referencia = document.querySelector('input[placeholder="Número de Referencia"]');
  if (referencia.value.trim().length < 6 || referencia.value.trim().length > 20) {
    alert("El número de referencia debe tener entre 6 y 20 caracteres.");
    event.preventDefault();
    return;
  }

  // Validar Banco Emisor
  const bancoEmisor = document.querySelector('input[placeholder="Banco Emisor"]');
  if (bancoEmisor.value.trim() === "") {
    alert("El campo Banco Emisor no puede estar vacío.");
    event.preventDefault();
    return;
  }

  // Validar Monto Transferido
  const monto = document.querySelector('input[placeholder="Monto Transferido"]');
  const montoValor = parseFloat(monto.value);
  if (isNaN(montoValor) || montoValor <= 0) {
    alert("El monto transferido debe ser un número mayor a cero.");
    event.preventDefault();
    return;
  }
});
