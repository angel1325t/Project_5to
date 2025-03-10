document.addEventListener("DOMContentLoaded", function () {
    const scrollContainer = document.getElementById("scroll-container");
    const scrollIndicator = document.getElementById("scroll-indicator");

    function checkScroll() {
        if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
            scrollIndicator.classList.remove("hidden");
            scrollIndicator.style.opacity = "0.9"; 
        } else {
            scrollIndicator.classList.add("hidden");
        }
    }
    

    checkScroll();
    window.addEventListener("resize", checkScroll);

    scrollContainer.addEventListener("scroll", function () {
        if (scrollContainer.scrollLeft > 10) {
            scrollIndicator.classList.add("hidden");
        } else {
            checkScroll();
        }
    });
});