export function updatePrices() {
    let subtotal = 0;
    let totalDiscount = 0;

    const productItems = document.querySelectorAll('.product-item');
    productItems.forEach(item => {
        // Obtener el precio base y la cantidad
        const price = parseFloat(item.getAttribute('data-price')) || 0;
        const discountPercentage = parseFloat(item.getAttribute('data-discount')) || 0;
        const quantityInput = item.querySelector('input[type="number"]');
        const quantity = quantityInput ? (parseInt(quantityInput.value) || 1) : 1;

        // Calcular el subtotal para este ítem
        const itemSubtotal = price * quantity;
        subtotal += itemSubtotal;

        // Calcular el descuento aplicando el porcentaje al precio
        const itemDiscount = (price * (discountPercentage / 100)) * quantity;
        totalDiscount += itemDiscount;

        // Actualizar el precio mostrado en el elemento (opcional, si quieres reflejar el descuento por línea)
        const priceElement = item.querySelector('[id^="price-"]');
        if (priceElement) {
            // Mostrar precio sin descuento aplicado (o podrías mostrar el precio final, a elección)
            priceElement.innerHTML = `Precio: <span class="text-green-600">$${itemSubtotal.toFixed(2)}</span>`;
        } else {
            console.warn("No se encontró el elemento de precio en el producto:", item);
        }
    });

    // Calcular el subtotal después del descuento
    const subtotalAfterDiscount = subtotal - totalDiscount;

    // Calcular el impuesto (ITBIS 18%) sobre el subtotal con descuento aplicado
    const tax = subtotalAfterDiscount * 0.18;

    // Calcular el total final
    const total = subtotalAfterDiscount + tax;

    // Actualizar los valores en la interfaz
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('discount').textContent = `$${totalDiscount.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}


export function updateRefund() {
    const cashAmount = parseFloat(document.getElementById('cash-amount').value) || 0;
    const totalElement = document.getElementById('total');
    const totalText = totalElement ? totalElement.textContent.replace('$', '').trim() : '0';
    const total = parseFloat(totalText) || 0;

    const refund = cashAmount - total;
    document.getElementById('refund-amount').textContent = `$${refund.toFixed(2)}`;
}