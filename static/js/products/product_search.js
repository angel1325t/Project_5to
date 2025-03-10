const closeButton = document.getElementById('close-button');
const noResultsMessage = document.getElementById('no-results-message');

// Añadir el evento de clic para cerrar el mensaje
closeButton.addEventListener('click', function () {
    noResultsMessage.style.display = "none";
});
function filterProducts() {
    let input = document.getElementById("search-product").value.toLowerCase().trim();
    let dropdown = document.getElementById("product-list");
    let items = dropdown.getElementsByClassName("product-item");
    let noResultsMessage = document.getElementById("no-results-message");

    let hasResults = false;

    for (let item of items) {
        if (input !== "" && item.textContent.toLowerCase().includes(input)) {
            item.style.display = "block";
            hasResults = true;
        } else {
            item.style.display = "none";
        }
    }

    if (input === "") {
        dropdown.style.display = "none";
        noResultsMessage.style.display = "none"; // Oculta mensaje si no hay búsqueda
    } else {
        dropdown.style.display = hasResults ? "block" : "none";
        noResultsMessage.style.display = hasResults ? "none" : "block";
    }
}