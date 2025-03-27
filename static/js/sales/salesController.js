
import { addProductToSale } from './filterManager.js';
import { setupScanner } from './qrScanner.js';
import { updatePrices, updateRefund } from './pricesCalculator.js';
import { setupNotifications } from './notification.js';

document.addEventListener("DOMContentLoaded", function () {
    const notyf = setupNotifications();
    let productCounter = 0;

    // Basic element references
    const scannerContainer = document.getElementById("scanner-container");
    const toggleScannerButton = document.getElementById("toggle-scanner");
    const closeScannerButton = document.getElementById("close-scanner");
    const clearSaleButton = document.getElementById("clear-sale");


    // Product list click handlers
    const productItems = document.querySelectorAll("#product-list .product-item");
    productItems.forEach(item => {
        item.addEventListener("click", function () {
            const productId = item.getAttribute("data-id");
            addProductToSale(productId, productCounter++, updatePrices);
        });
    });

    // Scanner setup
    setupScanner(toggleScannerButton, closeScannerButton, scannerContainer, addProductToSale, productCounter, updatePrices);

    // Clear sale
    clearSaleButton.addEventListener("click", function () {
        const saleItemsContainer = document.getElementById('sale-items');
        saleItemsContainer.innerHTML = '';
        document.getElementById('empty-sale-message')?.classList.remove('hidden');
        updatePrices();
    });

    // Setup price observer
    const saleItems = document.getElementById('sale-items');
    const observer = new MutationObserver(updateRefund);
    observer.observe(saleItems, { childList: true, subtree: true });

    // Cash amount listener
    document.getElementById('cash-amount').addEventListener('input', updateRefund);
});