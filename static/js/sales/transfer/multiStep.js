document.addEventListener("DOMContentLoaded", function () {
  // Control del flujo multistep
  const steps = document.querySelectorAll('.step-content');
  const indicators = document.querySelectorAll('.step-indicator');
  const btnNext = document.querySelector('.next-step');
  const btnPrev = document.querySelector('.prev-step');
  const btnPay = document.querySelector('.pay-step');

  window.currentStep = 1; // Hacer currentStep global para que transferAlerts.js lo use

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
    phoneNumber = phoneNumber.replace(/^\+1 1/, '+1 ');
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
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?$/;
        if (!emailPattern.test(input.value.trim())) {
          showValidationMessage('El correo electrónico debe ser una dirección válida.');
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
      if (!validateStep2()) return;
    }
    if (currentStep < steps.length) showStep(++window.currentStep);
  });

  btnPrev.addEventListener('click', () => {
    if (currentStep > 1) showStep(--window.currentStep);
  });

  // Inicialización
  showStep(window.currentStep);
});