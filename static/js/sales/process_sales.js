document.getElementById("pay-button").addEventListener("click", async function () {
    // Obtener los productos agregados
    let products = [];
    document.querySelectorAll("#sale-items .product-item").forEach(item => {
        // Obtener la cantidad directamente del input
        let quantity = parseInt(item.querySelector("input[type='number']").value) || 1;
        
        // Extraer el uniqueId a partir del id del botón "remove"
        let removeButton = item.querySelector("button[id^='remove-']");
        let uniqueId = removeButton ? removeButton.id.replace("remove-", "") : "";
        
        // Extraer el id del producto: se asume que el id es la parte antes del primer guion
        let id = parseInt(uniqueId.split("-")[0]);
        
        // Obtener el precio desde el elemento con id "price-${uniqueId}"
        let priceElem = item.querySelector(`#price-${uniqueId} span.text-green-600`);
        let priceText = priceElem ? priceElem.textContent : "";
        let price = parseFloat(priceText.replace("$", ""));
        
        // Obtener el nombre del producto desde el párrafo con clase "font-semibold"
        let nameElem = item.querySelector("p.font-semibold");
        let name = nameElem ? nameElem.textContent.trim() : "";
        
        console.log("Producto:", { id, name, price, quantity });
        
        // Verificar que el precio sea válido
        if (!price) {
            console.error("El precio del producto es inválido:", item);
            alert("El precio de uno o más productos es inválido.");
            return; // Detener el proceso si hay un error de precio
        }
        
        products.push({
            id: id,
            name: name,
            price: price,
            quantity: quantity
        });
    });
    
    // Verificar si no hay productos seleccionados
    if (products.length === 0) {
        alert("No hay productos seleccionados.");
        return;
    }
    
    // Capturar los valores de pago
    let subtotal = parseFloat(document.getElementById("subtotal").textContent.replace("$", "")) || 0;
    let tax = parseFloat(document.getElementById("tax").textContent.replace("$", "")) || 0;
    let total = parseFloat(document.getElementById("total").textContent.replace("$", "")) || 0;
    let received = parseFloat(document.getElementById("cash-amount").value) || 0;
    let refund = parseFloat(document.getElementById("refund-amount").textContent.replace("$", "")) || 0;
    
    // Verificar si el monto recibido es suficiente
    if (received < total) {
        alert("El monto recibido es insuficiente para cubrir el total de la venta.");
        return;
    }
    
    // Crear el objeto de venta
    let saleData = {
        products: products,
        subtotal: subtotal,
        tax: tax,
        total: total,
        received: received,
        refund: refund
    };
    
    try {
        let response = await fetch("/empleados/procesar-venta/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCsrfToken()
            },
            body: JSON.stringify(saleData)
        });
    
        let result = await response.json();
        if (result.success) {
            alert("Venta procesada correctamente");
            // Opcional: limpiar la interfaz
            location.reload();
        } else {
            alert("Error al procesar la venta");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un problema con la venta");
    }
});
    
function getCsrfToken() {
    return document.cookie.split("; ")
        .find(row => row.startsWith("csrftoken="))
        ?.split("=")[1];
}
