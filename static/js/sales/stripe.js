var stripe = Stripe('pk_test_51R1rEOAoMPdR1kJ25eyjtM1494RxmkFdyppEsjxHam1D3qXJiBhDXXveFE8UwxhIswbiVZhhReTFOJgt4pEcwdYT00a72XN69h');

// Configurar los elementos con el idioma en español
var elements = stripe.elements({
    locale: 'es' // Esto establece los mensajes en español
});

var style = {
    base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: "16px",
        "::placeholder": { color: "#aab7c4" }
    },
    invalid: {
        color: "#fa755a",
        iconColor: "#fa755a"
    }
};

// Crear el elemento de la tarjeta
var card = elements.create("card", { style: style });
card.mount("#card-element");

// Mostrar errores en tiempo real
card.addEventListener("change", function (event) {
    var displayError = document.getElementById("card-errors");
    displayError.textContent = event.error ? event.error.message : "";
});

const form = document.querySelector("#payment-form");
const payButton = document.getElementById("pay-button");
form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Validación del total
    var total = document.getElementById("total-card").value;
    if (!total || total <= 0) {
        document.getElementById("card-errors").textContent = "Por favor, ingrese un monto válido.";
        hideLoader(); // Ocultar el loader si hay un error de validación
        return;
    }

    // Deshabilitar el botón y mostrar el spinner en el botón
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
            // Reactivar el botón
            payButton.disabled = false;
            payButton.classList.remove("opacity-75");
            payButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pagar ahora
          `;
            hideLoader(); // Ocultar el loader general en caso de error
        } else {
            stripeTokenHandler(result.token);
            // Nota: Si stripeTokenHandler no recarga la página, también deberías llamar a hideLoader() aquí
        }
    }).catch(function (error) {
        console.error("Error en la promesa:", error);
        hideLoader(); // Ocultar el loader si la promesa falla por alguna razón
    });
});

function stripeTokenHandler(token) {
    console.log("✅ Token generado:", token.id);
    var hiddenInput = document.createElement("input");
    hiddenInput.setAttribute("type", "hidden");
    hiddenInput.setAttribute("name", "stripeToken");
    hiddenInput.setAttribute("value", token.id);
    form.appendChild(hiddenInput);

    console.log("Enviando formulario...");
    form.submit();
    // Si el envío del formulario no recarga la página (por ejemplo, si usas AJAX), llama a hideLoader() aquí
}