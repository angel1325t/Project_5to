// Función para actualizar el resumen de productos en el formulario de transferencia
function updateTransferSummary() {
  const transferStep = document.querySelector('#multistep-form .step-content[data-step="1"]');
  const saleItems = document.querySelectorAll('#sale-items .product-item');
  const btnNext = document.getElementById('siguiente');
  const montoInput = document.getElementById('monto'); // Campo de monto transferido

  let summaryHTML = '<h1 class="text-xl font-bold mb-4">Pedido</h1>';
  summaryHTML += '<h3 class="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Resumen de Compra</h3>';

  let grandTotal = 0;
  if (saleItems.length === 0) {
      summaryHTML += '<p>No hay productos agregados.</p>';
      btnNext.classList.add('cursor-not-allowed');
      btnNext.classList.remove('bg-blue-600');
      btnNext.classList.add('bg-blue-400');
      btnNext.disabled = true;
      montoInput.value = ""; // Limpiar monto si no hay productos
  } else {
      btnNext.classList.remove('cursor-not-allowed');
      btnNext.classList.add('bg-blue-600');
      btnNext.classList.remove('bg-blue-400');
      btnNext.disabled = false;

      saleItems.forEach(item => {
          const nombreElement = item.querySelector('p.font-semibold');
          const cantidadElement = item.querySelector('input[type="number"]');
          const precioElement = item.querySelector('[id^="price-"]');

          const nombre = nombreElement ? nombreElement.textContent : 'Sin nombre';
          const cantidad = cantidadElement ? parseInt(cantidadElement.value) || 1 : 1;
          const precioText = precioElement ? precioElement.textContent : 'Precio: $0.00';

          // Extraer el precio numérico total del DOM
          const priceRegex = /\$([\d,.]+)/;
          const priceMatch = precioText.match(priceRegex);
          let totalPrice = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : 0;

          // Calcular el precio unitario correctamente
          let unitPrice = cantidad > 0 ? totalPrice / cantidad : 0;

          grandTotal += totalPrice;

          summaryHTML += `
              <div class="space-y-2 text-gray-600">
                <p class="flex justify-between"><span class="font-medium">Producto:</span> <span>${nombre}</span></p>
                <p class="flex justify-between"><span class="font-medium">Cantidad:</span> <span>${cantidad}</span></p>
                <p class="flex justify-between"><span class="font-medium">Precio Unitario:</span> <span>$${unitPrice.toFixed(2)}</span></p>
                <p class="flex justify-between text-lg font-semibold text-gray-800">
                  <span>Valor Total:</span> <span class="text-green-600">$${totalPrice.toFixed(2)}</span>
                </p>
              </div>
          `;
      });

      // Calcular ITBIS (18%)
      let taxAmount = grandTotal * 0.18;
      let totalWithTax = grandTotal + taxAmount;

      summaryHTML += `
          <div class="p-4 border-t border-gray-300 mt-4 space-y-2">
            <p class="text-lg font-semibold flex justify-between">
              <span>Total General:</span> <span>$${grandTotal.toFixed(2)}</span>
            </p>
            <p class="text-lg font-semibold flex justify-between">
              <span>ITBIS (18%):</span> <span class="text-yellow-600">$${taxAmount.toFixed(2)}</span>
            </p>
            <p class="text-xl font-bold flex justify-between text-gray-900">
              <span>Total con ITBIS:</span> <span class="text-red-600">$${totalWithTax.toFixed(2)}</span>
            </p>
          </div>
      `;

      // Actualizar el monto transferido con el total con ITBIS
      montoInput.value = totalWithTax.toFixed(2);
  }

  transferStep.innerHTML = summaryHTML;
}


// Crear un MutationObserver para observar cambios en el contenedor de productos (sale-items)
const saleItemsContainer = document.getElementById('sale-items');

const observer = new MutationObserver(() => {
  updateTransferSummary();  // Actualizar el resumen cuando cambian los elementos dentro de #sale-items
});

// Configuración del observer para observar cambios en los hijos y texto de los elementos
observer.observe(saleItemsContainer, {
  childList: true,  // Observar la adición/eliminación de hijos
  subtree: true,    // Observar los cambios dentro de todos los elementos descendientes
});

// Control de métodos de pago (efectivo, transferencia, tarjeta)
document.getElementById('payment-method').addEventListener('change', function () {
  const transferForm = document.getElementById('multistep-form');
  const productDetails = document.querySelector('.mt-4.p-4.border-t');
  const refundContainer = document.getElementById('refund-amount-container');

  if (this.value === 'transfer') {
      transferForm.classList.remove('hidden');
      updateTransferSummary();  // Actualizar el resumen de productos en el formulario de transferencia
      productDetails.classList.add('hidden');
      refundContainer.classList.add('hidden');
  } else {
      transferForm.classList.add('hidden');
      productDetails.classList.remove('hidden');
      refundContainer.classList.toggle('hidden', this.value !== 'cash');
  }
});
