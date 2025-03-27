export async function addProductToSale(productId, productCounter, updatePrices) {
    try {
        const response = await fetch(`/empleados/get-producto/${productId}/`);
        if (!response.ok) {
            throw new Error(`Producto no encontrado. Error ${response.status}`);
        }
        const data = await response.json();
        const uniqueId = `${productId}-${productCounter}`;
        const productItem = document.createElement("div");
        productItem.classList.add("product-item");
        productItem.setAttribute("data-id", productId);
        productItem.setAttribute("data-price", data.precio);
        productItem.setAttribute("data-discount", data.descuento); // Guardar el descuento

        // Mostrar el descuento si existe
        let discountHtml = '';
        if (data.descuento > 0) {
            discountHtml = `<p class="text-black-500 font-bold py-2" id="discount-">Descuento: <span class="text-red-600">${data.descuento}%</span></p>`;
        }

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

            <div class="flex items-center space-x-2">
                <p class="text-black-500 font-bold py-2" id="price-${uniqueId}"><span class="text-green-600 font-bold text-lg">$${data.precio}</span></p>
                <p class="text-black-500 font-bold py-2 hidden sm:block"><span class="text-xs text-gray-400 hidden sm:inline">${data.categoria}</span></p>
                ${discountHtml}
            </div>
            
                    <div class="flex items-center space-x-2">
                        <input type="number" value="1" min="1" class="w-16 p-1 border rounded text-center" id="quantity-${uniqueId}">
                        <button class="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors" id="remove-${uniqueId}">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                        </button>
                    </div>
                </div>
            </div>
            <hr class="border-t border-gray-200 pt-2">



        `;

        const saleItemsContainer = document.getElementById("sale-items");
        saleItemsContainer.appendChild(productItem);

        const emptySaleMessage = document.getElementById("empty-sale-message");
        if (emptySaleMessage) {
            emptySaleMessage.classList.add("hidden");
        }

        document.getElementById(`remove-${uniqueId}`).addEventListener("click", function () {
            productItem.remove();
            if (saleItemsContainer.children.length === 0) {
                emptySaleMessage?.classList.remove("hidden");
            }
            updatePrices();
        });

        const quantityInput = document.getElementById(`quantity-${uniqueId}`);
        quantityInput.addEventListener("input", function () {
            let quantity = parseInt(quantityInput.value) || 1;
            if (quantity < 1) {
                quantity = 1;
                quantityInput.value = 1;
            }
            const newPrice = data.precio * quantity; // Precio sin descuento aplicado aquí
            document.getElementById(`price-${uniqueId}`).innerHTML = `<span class="text-green-600">$${newPrice.toFixed(2)}</span>`;
            updatePrices();
        });

        updatePrices();
    } catch (err) {
        console.error("Error en la petición AJAX:", err);
    }
}