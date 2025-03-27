document.getElementById("pay-button").addEventListener("click", async function () {
    let products = [];
    document.querySelectorAll("#sale-items .product-item").forEach(item => {
        let removeButton = item.querySelector("button[id^='remove-']");
        let uniqueId = removeButton ? removeButton.id.replace("remove-", "") : "";
        let id = parseInt(uniqueId.split("-")[0]);
        let quantity = parseInt(item.querySelector("input[type='number']").value) || 1;
        let price = parseFloat(item.getAttribute("data-price"));
        let discount = parseFloat(item.getAttribute("data-discount")) || 0;
        let nameElem = item.querySelector("p.font-semibold");
        let name = nameElem ? nameElem.textContent.trim() : "";

        if (!price) {
            console.error("El precio del producto es inválido:", item);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'El precio de uno o más productos es inválido.',
                timer: 3000,
                timerProgressBar: true,
                customClass: {
                    confirmButton: 'bg-primary text-white'  // Aplicamos la clase bg-primary y el color blanco al texto
                }
            });
            return;
        }

        products.push({
            id: id,
            name: name,
            price: price,
            discount: discount, // Incluir el descuento por unidad
            quantity: quantity
        });
    });

    if (products.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No hay productos seleccionados.',
            timer: 3000,
            timerProgressBar: true,
            customClass: {
                confirmButton: 'bg-primary text-white'  // Aplicamos la clase bg-primary y el color blanco al texto
            }
        });
        return;
    }

    let subtotal = parseFloat(document.getElementById("subtotal").textContent.replace("$", "")) || 0;
    let discount = parseFloat(document.getElementById("discount").textContent.replace("$", "")) || 0;
    let tax = parseFloat(document.getElementById("tax").textContent.replace("$", "")) || 0;
    let total = parseFloat(document.getElementById("total").textContent.replace("$", "")) || 0;
    let received = parseFloat(document.getElementById("cash-amount").value) || 0;
    let refund = parseFloat(document.getElementById("refund-amount").textContent.replace("$", "")) || 0;

    if (received < total) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El monto recibido es insuficiente para cubrir el total de la venta.',
            timer: 3000,
            timerProgressBar: true,
            customClass: {
                confirmButton: 'bg-primary text-white'  // Aplicamos la clase bg-primary y el color blanco al texto
            }
        });
        return;
    }

    let saleData = {
        products: products,
        subtotal: subtotal,
        discount: discount,
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
            Swal.fire({
                icon: 'success',
                title: 'Venta procesada correctamente',
                text: 'La venta ha sido procesada exitosamente.',
                timer: 3000,
                timerProgressBar: true,
                customClass: {
                    confirmButton: 'bg-primary text-white'  // Aplicamos la clase bg-primary y el color blanco al texto
                }
            }).then(() => {
                location.reload(); // Esperamos a que la alerta termine antes de recargar
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al procesar la venta.',
                timer: 3000,
                timerProgressBar: true,
                customClass: {
                    confirmButton: 'bg-primary text-white'  // Aplicamos la clase bg-primary y el color blanco al texto
                }
            });
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Hubo un problema con la venta',
            text: 'No se pudo procesar la venta debido a un error.',
            timer: 3000,
            timerProgressBar: true,
            customClass: {
                confirmButton: 'bg-primary text-white'  // Aplicamos la clase bg-primary y el color blanco al texto
            }
        });
    }
});

function getCsrfToken() {
    return document.cookie.split("; ")
        .find(row => row.startsWith("csrftoken="))
        ?.split("=")[1];
}
