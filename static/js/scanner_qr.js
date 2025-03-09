document.addEventListener("DOMContentLoaded", function() {
    let productCounter = 0;

    const scannerContainer = document.getElementById("scanner-container");
    const toggleScannerButton = document.getElementById("toggle-scanner");
    const closeScannerButton = document.getElementById("close-scanner");
    const clearSaleButton = document.getElementById("clear-sale");

    // Configuración de Notyf
    const notyf = new Notyf({
        duration: 3000, // Tiempo que estará visible el mensaje
        position: { x: 'right', y: 'top' }, // Posición en la pantalla
        dismissible: true, // Si el mensaje se puede cerrar manualmente
    });

    let qrScanner = new Html5Qrcode("reader");
    const beepSound = new Audio('/static/sounds/beep.mp3');  // Ruta de tu sonido

    function getScannerConfig() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        let fps, qrbox;

        if (screenWidth <= 480) {
            // Para pantallas pequeñas (móviles)
            fps = 10;
            qrbox = { width: 100, height: 100 };
        } else if (screenWidth <= 1024) {
            // Para pantallas medianas (tabletas)
            fps = 15;
            qrbox = { width: 200, height: 200 };
        } else {
            // Para pantallas grandes (escritorios)
            fps = 20;
            qrbox = { width: 300, height: 300 };
        }

        return { fps, qrbox };
    }

    toggleScannerButton.addEventListener("click", function() {
        console.log("Iniciando escáner...");
        scannerContainer.classList.remove("hidden");

        // Reiniciamos el escáner si ya fue limpiado
        if (!qrScanner) {
            qrScanner = new Html5Qrcode("reader");
        }

        const config = getScannerConfig();

        qrScanner.start(
            { facingMode: "environment" },
            { fps: config.fps, qrbox: config.qrbox },
            async (decodedText) => {
                console.log("Contenido QR:", decodedText);

                // Reproducir sonido al escanear
                beepSound.play().catch(err => console.warn("Error reproduciendo sonido:", err));

                let productId = null;
                try {
                    const parsedData = JSON.parse(decodedText);
                    productId = parsedData.id;
                } catch (err) {
                    console.error("Error al parsear QR:", err);
                    alert("El código QR no es válido");
                    qrScanner.stop();
                    scannerContainer.classList.add("hidden");
                    return;
                }

                console.log("ID escaneado:", productId);

                // Pausamos brevemente para evitar lecturas duplicadas
                qrScanner.pause();
                setTimeout(() => qrScanner.resume(), 700);

                fetch(`/empleados/get-producto/${productId}/`)
                    .then(response => {
                        if (!response.ok) {
                            // Si el código de respuesta no es exitoso (404, 500, etc.)
                            throw new Error(`Producto no encontrado. Error ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Si la respuesta es correcta, continuamos procesando
                        productCounter++;
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

                        const emptyMessage = document.getElementById('empty-sale-message');
                        if (emptyMessage) {
                            emptyMessage.classList.add('hidden');
                        }

                        document.getElementById(`remove-${uniqueId}`).addEventListener("click", function() {
                            productItem.remove();
                            if (document.getElementById('sale-items').children.length === 0) {
                                emptyMessage.classList.remove('hidden');
                            }
                            updatePrices();
                        });

                        const quantityInput = document.getElementById(`quantity-${uniqueId}`);
                        quantityInput.addEventListener("input", function() {
                            const quantity = parseInt(quantityInput.value) || 1;
                            const newPrice = data.precio * quantity;
                            document.getElementById(`price-${uniqueId}`).innerHTML = `<span class="text-green-600">$${newPrice.toFixed(2)}</span>`;
                            updatePrices();
                        });

                        updatePrices();
                    })
                    .catch(err => {
                        console.error("Error en la petición AJAX:", err);
                        notyf.error("Producto no encontrado o error en la solicitud.");
                    });
            },
            (error) => {
                console.warn("Error en escaneo QR:", error);
            }
        );
    });

    closeScannerButton.addEventListener("click", function() {
        scannerContainer.classList.add("hidden");
        if (qrScanner) {
            qrScanner.stop().then(() => {
                console.log("Escáner detenido.");
            }).catch(err => console.warn("Error al detener escáner:", err));
        }
    });

    // Función para limpiar la venta
    clearSaleButton.addEventListener("click", function() {
        // Eliminar todos los productos de la venta
        const saleItemsContainer = document.getElementById('sale-items');
        saleItemsContainer.innerHTML = ''; // Vaciar el contenedor de productos

        // Mostrar el mensaje de "No hay productos agregados"
        const emptyMessage = document.getElementById('empty-sale-message');
        if (emptyMessage) {
            emptyMessage.classList.remove('hidden');
        }

        // Reiniciar los precios
        updatePrices();
    });

    function updatePrices() {
        let subtotal = 0;
        const productItems = document.querySelectorAll('.product-item');
        productItems.forEach(item => {
            const priceElement = item.querySelector('[id^="price-"]');
            if (!priceElement) {
                console.warn("No se encontró el elemento de precio en el producto:", item);
                return;
            }
            const priceText = priceElement.textContent;
            const price = parseFloat(priceText.replace('Precio: $', '').trim());
            subtotal += price;
        });

        const tax = subtotal * 0.18;
        const total = subtotal + tax;

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    }
});
