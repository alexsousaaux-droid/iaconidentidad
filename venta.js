// Data dinâmica da barra de desconto
document.addEventListener("DOMContentLoaded", function () {
  const promoDateSpan = document.getElementById("promo-date");
  if (promoDateSpan) {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    promoDateSpan.textContent = new Date().toLocaleDateString("es-ES", options);
  }
});
