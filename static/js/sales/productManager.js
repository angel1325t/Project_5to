// productManager.js
export function filterProducts() {
    const searchTerm = document.getElementById("search-product").value.toLowerCase();
    const productList = document.getElementById("product-list");
    const productItems = productList.getElementsByClassName("product-item");
    let noResultsMessage = document.getElementById("no-results-message");
    let found = false;

    for (let item of productItems) {
        const productName = item.innerText.toLowerCase();
        if (productName.includes(searchTerm)) {
            item.classList.remove("hidden");
            found = true;
        } else {
            item.classList.add("hidden");
        }
    }

    if (found) {
        noResultsMessage.classList.add("hidden");
    } else {
        noResultsMessage.classList.remove("hidden");
    }

    if (searchTerm === "") {
        productList.classList.add("hidden");
    } else {
        productList.classList.remove("hidden");
    }
}

export function addProductToSale(productId, productCounter, updatePrices) {
    fetch(`/empleados/get-producto/${productId}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Producto no encontrado. Error ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const uniqueId = `${productId}-${productCounter}`;
            const productItem = document.createElement('div');
            productItem.classList.add('product-item');
            productItem.innerHTML = `
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <div class="flex items-center space-x-4 w-full sm:w-auto">
                        <img src="${data.image}" alt="Producto" class="w-12 h-12 object-cover rounded-md">
                        <div>
                            <p class="font-semibold">${data.nombre}</p>
                            <p class="text-gray-500">${data.descripcion}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                        <p class="text-black-500 font-bold py-2" id="price-${uniqueId}">Precio: <span class="text-green-600">$${data.precio}</span></p>
                        <p class="text-black-500 font-bold py-2 hidden sm:block">Categoría: <span class="text-gray-500">${data.categoria}</span></p>
                        <div class="flex items-center space-x-2">
                            <input type="number" value="1" min="1" class="w-16 p-1 border rounded text-center" id="quantity-${uniqueId}">
                            <button class="text-red-500 hover:text-red-700" id="remove-${uniqueId}">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <hr class="border-t border-gray-200 pt-2">
            `;

            document.getElementById('sale-items').appendChild(productItem);
            document.getElementById('empty-sale-message')?.classList.add('hidden');

            document.getElementById(`remove-${uniqueId}`).addEventListener("click", function () {
                productItem.remove();
                if (document.getElementById('sale-items').children.length === 0) {
                    document.getElementById('empty-sale-message')?.classList.remove('hidden');
                }
                updatePrices();
            });

            const quantityInput = document.getElementById(`quantity-${uniqueId}`);
            quantityInput.addEventListener("input", function () {
                const quantity = parseInt(quantityInput.value) || 1;
                const newPrice = data.precio * quantity;
                document.getElementById(`price-${uniqueId}`).innerHTML = `Precio: <span class="text-green-600">$${newPrice.toFixed(2)}</span>`;
                updatePrices();
            });

            updatePrices();
        })
        .catch(err => {
            console.error("Error en la petición AJAX:", err);
            // Note: notyf needs to be passed or imported if used here
        });
}