document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".alert-box").forEach((alert) => {
        setTimeout(() => {
            alert.style.animation = "slide-out 0.3s ease-in";
            setTimeout(() => alert.remove(), 300);
        }, 1500);
    });
});