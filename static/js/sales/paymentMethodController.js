// Control de métodos de pago (efectivo, transferencia, tarjeta)
document.addEventListener('DOMContentLoaded', function () {
    const paymentMethod = document.getElementById('payment-method');
    const transferForm = document.getElementById('multistep-form');
    const productDetails = document.querySelector('#contenedor_cash');
    const refundContainer = document.getElementById('refund-amount-container');
    const cardPayment = document.getElementById('card-payment');
    const cashPayment = document.getElementById('cash-payment');
  
    if (!paymentMethod) {
      console.error('No se encontró #payment-method');
      return;
    }
  
    paymentMethod.addEventListener('change', function () {
      // Ocultar todos los elementos inicialmente
      transferForm?.classList.add('hidden');
      productDetails?.classList.add('hidden');
      refundContainer?.classList.add('hidden');
      cardPayment?.classList.add('hidden');
      cashPayment?.classList.add('hidden');
  
      // Mostrar solo el elemento correspondiente al método seleccionado
      if (this.value === 'transfer') {
        transferForm?.classList.remove('hidden');
        updateTransferSummary();
      } else if (this.value === 'card') {
        cardPayment?.classList.remove('hidden');
        updateCardSummary();
      } else if (this.value === 'cash') {
        productDetails?.classList.remove('hidden');
        refundContainer?.classList.remove('hidden');
        cashPayment?.classList.remove('hidden');
      }
    });
  });