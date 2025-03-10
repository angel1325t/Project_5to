export function updatePrices() {
    let subtotal = 0;
    const productItems = document.querySelectorAll('.product-item');
    productItems.forEach(item => {
        const priceElement = item.querySelector('[id^="price-"]');
        if (!priceElement) {
            console.warn("No se encontró el elemento de precio en el producto:", item);
            return;
        }
        const priceText = priceElement.textContent.trim();
        
        // Verifica si el texto tiene el formato esperado, ej: "Precio: $12.34"
        const priceMatch = priceText.match(/Precio:\s*\$(\d+(\.\d{1,2})?)/);
        if (priceMatch) {
            const price = parseFloat(priceMatch[1]);
            if (!isNaN(price)) {
                subtotal += price;
            } else {
                console.warn("Precio inválido detectado:", priceText);
            }
        } else {
            console.warn("Formato de precio no esperado:", priceText);
        }
    });

    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    // Actualizar los valores de subtotal, impuesto y total en la UI
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
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
