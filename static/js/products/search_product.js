const searchInput = document.getElementById("search-product");
const clearButton = document.getElementById("clear-button");
const closeButton = document.getElementById('close-button');
const noResultsMessage = document.getElementById('no-results-message');

// Añadir el evento de clic para cerrar el mensaje
closeButton.addEventListener('click', function () {
    noResultsMessage.style.display = "none";
});

function filterProducts() {
    let input = searchInput.value.toLowerCase().trim();
    let dropdown = document.getElementById("product-list");
    let items = dropdown.getElementsByClassName("product-item");

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
        noResultsMessage.style.display = "none";
        clearButton.style.display = "none";
    } else {
        dropdown.style.display = hasResults ? "block" : "none";
        noResultsMessage.style.display = hasResults ? "none" : "block";
        clearButton.style.display = "block";
    }
}

// Evento para limpiar el input al hacer clic en la "X"
clearButton.addEventListener("click", function () {
    searchInput.value = "";
    filterProducts();
    searchInput.focus();
});
