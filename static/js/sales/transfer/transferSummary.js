// Función para actualizar el resumen de productos en el formulario de transferencia
function updateTransferSummary() {
  const transferStep = document.querySelector('#multistep-form .step-content[data-step="1"]');
  const saleItems = document.querySelectorAll('#sale-items .product-item');
  const btnNext = document.getElementById('siguiente');
  const montoInput = document.getElementById('monto'); // Campo de monto transferido
  const productsInput = document.getElementById('products-input'); // Campo oculto para productos

  let summaryHTML = '<h1 class="text-xl font-bold mb-4">Pedido</h1>';
  summaryHTML += '<h3 class="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Resumen de Compra</h3>';

  let grandTotal = 0;
  let productsList = [];

  if (saleItems.length === 0) {
    summaryHTML += '<p>No hay productos agregados.</p>';
    btnNext?.classList.add('cursor-not-allowed', 'bg-blue-400');
    btnNext?.classList.remove('bg-blue-600');
    btnNext.disabled = true;
    montoInput.value = "";
    productsInput.value = "";
  } else {
    btnNext?.classList.remove('cursor-not-allowed', 'bg-blue-400');
    btnNext?.classList.add('bg-blue-600');
    btnNext.disabled = false;

    saleItems.forEach(item => {
      const nombreElement = item.querySelector('p.font-semibold');
      const cantidadElement = item.querySelector('input[type="number"]');
      const precioElement = item.querySelector('[id^="price-"]');
      const descuentoElement = item.querySelector('[id^="discount-"]');

      const productId = item.dataset.id;
      const nombre = nombreElement ? nombreElement.textContent : 'Sin nombre';
      const cantidad = cantidadElement ? parseInt(cantidadElement.value) || 1 : 1;
      const precioText = precioElement ? precioElement.textContent : 'Precio: $0.00';
      const descuentoText = descuentoElement ? descuentoElement.textContent.trim() : '0%';
      
      // Nueva regex corregida
      const priceRegex = /\$([\d,.]+)/;
      const discountRegex = /([\d.]+)%/;  // Corregida para capturar solo números antes del %
      
      let priceMatch = precioText.match(priceRegex);
      let discountMatch = descuentoText.match(discountRegex);
      
      

      let unitPrice = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : 0;
      let discount = discountMatch ? parseFloat(discountMatch[1]) : 0;

      // Aplicar descuento si existe
      let finalUnitPrice = unitPrice * (1 - discount / 100);
      let totalPrice = finalUnitPrice;

      grandTotal += totalPrice;

      productsList.push({
        id: productId,
        quantity: cantidad,
        price: totalPrice,
        discount: discount // Guardamos el descuento aplicado
      });

      summaryHTML += `
        <div class="rounded-lg overflow-hidden bg-gray-50 p-4 mb-4">
            <div class="space-y-3 text-gray-700">
              <div class="flex justify-between items-center border-b pb-2">
                <span class="font-semibold text-gray-600">Producto:</span>
                <span class="font-medium">${nombre}</span>
              </div>
              <div class="flex justify-between items-center border-b pb-2">
                <span class="font-semibold text-gray-600">Cantidad:</span>
                <span class="font-medium">${cantidad}</span>
              </div>
              <div class="flex justify-between items-center border-b pb-2">
                <span class="font-semibold text-gray-600">Precio Unitario:</span>
                <span class="font-medium">$${unitPrice.toFixed(2)}</span>
              </div>
              <div class="flex justify-between items-center border-b pb-2">
                <span class="font-semibold text-green-700">Descuento:</span>
                <span class="text-green-700">${discount}%</span>
              </div>
              <div class="flex justify-between items-center pt-2">
                <span class="text-lg font-bold text-gray-800">Valor Total:</span>
                <span class="text-green-600 text-lg font-bold">$${totalPrice.toFixed(2)}</span>
              </div>
            </div>
        </div>`;
    });

    // Calcular ITBIS (18%)
    let taxAmount = grandTotal * 0.18;
    let totalWithTax2 = grandTotal + taxAmount;
    // Calcular el total de descuento en dólares
    let totalDiscountAmount = productsList.reduce((acc, product) => {
      return acc + (product.price * (product.discount / 100));
    }, 0);

    summaryHTML += `
    <div class="p-6 border-t border-gray-200">
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-gray-700 font-semibold">Total General:</span>
          <span class="font-bold">$${grandTotal.toFixed(2)}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-700 font-semibold">Total Descuentos:</span>
          <span class="text-green-600 font-semibold">$${totalDiscountAmount.toFixed(2)}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-700 font-semibold">ITBIS (18%):</span>
          <span class="text-yellow-600 font-semibold">$${taxAmount.toFixed(2)}</span>
        </div>
        <div class="flex justify-between items-center pt-2 border-t border-gray-300">
          <span class="text-xl font-bold text-gray-900">Total con ITBIS:</span>
          <span class="text-red-600 text-xl font-bold">$${totalWithTax2.toFixed(2)}</span>
        </div>
      </div>
    </div>`;


    montoInput.value = totalWithTax2.toFixed(2);
    productsInput.value = JSON.stringify(productsList);
  }

  transferStep.innerHTML = summaryHTML;
}

// Observador para actualizar los resúmenes cuando cambian los elementos en #sale-items
const saleItemsContainer = document.getElementById('sale-items');
const observer = new MutationObserver(() => {
  updateTransferSummary();
});  
observer.observe(saleItemsContainer, {
  childList: true,
  subtree: true,
}); 
