// Configuración de Stripe
var stripe = Stripe('pk_test_51R1rEOAoMPdR1kJ25eyjtM1494RxmkFdyppEsjxHam1D3qXJiBhDXXveFE8UwxhIswbiVZhhReTFOJgt4pEcwdYT00a72XN69h');
var elements = stripe.elements({ locale: 'es' });
var style = {
    base: { color: "#32325d", fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontSize: "16px", "::placeholder": { color: "#aab7c4" } },
    invalid: { color: "#fa755a", iconColor: "#fa755a" }
};
var card = elements.create("card", { style: style });
card.mount("#card-element");

// Mostrar errores en tiempo real
card.addEventListener("change", function (event) {
    var displayError = document.getElementById("card-errors");
    displayError.textContent = event.error ? event.error.message : "";
});

// Obtener lista de productos
function getProductsList() {
    const saleItems = document.querySelectorAll('#sale-items .product-item');
    let productsList = [];
    let grandTotal = 0;

    saleItems.forEach(item => {
        const cantidadElement = item.querySelector('input[type="number"]');
        const precioElement = item.querySelector('[id^="price-"]');
        const productId = item.dataset.id;
        const productDiscount = item.dataset.discount ? parseFloat(item.dataset.discount) : 0;

        const cantidad = cantidadElement ? parseInt(cantidadElement.value) || 1 : 1;
        const precioText = precioElement ? precioElement.textContent : 'Precio: $0.00';
        const priceRegex = /\$([\d,.]+)/;
        const priceMatch = precioText.match(priceRegex);
        let unitPrice = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : 0;

        if (productDiscount > 0) {
            const discountMultiplier = 1 - (productDiscount / 100);
            unitPrice = unitPrice * discountMultiplier;
        }

        const totalPrice = unitPrice;
        productsList.push({
            id: productId,
            quantity: cantidad,
            price: totalPrice,
            unitPrice: unitPrice,
            discount: productDiscount
        });

        grandTotal += totalPrice;
    });

    let taxAmount = grandTotal * 0.18;
    let totalWithTax = grandTotal + taxAmount;

    document.getElementById("total-card").value = totalWithTax.toFixed(2);
    return { productsList, totalWithTax };
}

// Manejo del formulario
const form = document.querySelector("#payment-form");
const payButton = document.getElementById("pay-button");
console.log(payButton);

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const { productsList, totalWithTax } = getProductsList();

    if (!totalWithTax || totalWithTax <= 0) {
        document.getElementById("card-errors").textContent = "Por favor, ingrese un monto válido.";
        hideLoader(); // Ocultar loader si hay error inicial
        return;
    }

    payButton.disabled = true;
    payButton.classList.add("opacity-75");
    payButton.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Procesando...
    `;

    stripe.createToken(card).then(function (result) {
        if (result.error) {
            document.getElementById("card-errors").textContent = result.error.message;
            payButton.disabled = false;
            payButton.classList.remove("opacity-75");
            payButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pagar ahora
            `;
            hideLoader(); // Ocultar loader si hay error en el token
        } else {
            processCardPayment(result.token, productsList, totalWithTax, form, payButton);
        }
    }).catch(function (error) {
        console.error("Error en la promesa:", error);
        hideLoader(); // Ocultar loader si hay error en la promesa
    });
});