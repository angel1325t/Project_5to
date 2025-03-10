
export function setupScanner(toggleButton, closeButton, container, addProductToSale, productCounter, updatePrices) {
    let qrScanner = new Html5Qrcode("reader");
    const beepSound = new Audio('/static/sounds/beep.mp3');

    function getScannerConfig() {
        const screenWidth = window.innerWidth;
        return {
            fps: screenWidth <= 480 ? 10 : screenWidth <= 1024 ? 15 : 20,
            qrbox: screenWidth <= 480 ? { width: 100, height: 100 } : 
                   screenWidth <= 1024 ? { width: 200, height: 200 } : 
                   { width: 300, height: 300 }
        };
    }

    toggleButton.addEventListener("click", function () {
        container.classList.remove("hidden");
        if (!qrScanner) {
            qrScanner = new Html5Qrcode("reader");
        }

        const config = getScannerConfig();
        qrScanner.start(
            { facingMode: "environment" },
            { fps: config.fps, qrbox: config.qrbox },
            async (decodedText) => {
                beepSound.play().catch(err => console.warn("Error reproduciendo sonido:", err));
                let productId = null;
                try {
                    const parsedData = JSON.parse(decodedText);
                    productId = parsedData.id;
                } catch (err) {
                    console.error("Error al parsear QR:", err);
                    alert("El código QR no es válido");
                    qrScanner.stop();
                    container.classList.add("hidden");
                    return;
                }

                qrScanner.pause();
                setTimeout(() => qrScanner.resume(), 700);

                fetch(`/empleados/get-producto/${productId}/`)
                    .then(response => response.json())
                    .then(data => addProductToSale(productId, productCounter++, updatePrices))
                    .catch(err => console.error("Error en la petición AJAX:", err));
            },
            (error) => console.warn("Error en escaneo QR:", error)
        );
    });

    closeButton.addEventListener("click", function () {
        container.classList.add("hidden");
        if (qrScanner) {
            qrScanner.stop()
                .then(() => console.log("Escáner detenido."))
                .catch(err => console.warn("Error al detener escáner:", err));
        }
    });
}