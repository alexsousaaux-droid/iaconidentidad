// Data dinâmica da barra de desconto
document.addEventListener("DOMContentLoaded", function () {
  const promoDateSpan = document.getElementById("promo-date");
  if (promoDateSpan) {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    promoDateSpan.textContent = new Date().toLocaleDateString("es-ES", options);
  }
});

// SCRIPT TÉCNICO GEO-LOCALIZAÇÃO DE PREÇOS (APENAS NA LP)
(function () {
  // Configuração visual de textos de preço por país (Base: 12.90 regular / 9.90 no exit popup)
  const geoTextConfig = {
    MX: {
      price: "MX$ 249,00",
      exitOld: "De MX$ 249,00",
      exitNew: "MX$ 189,00",
      exitBtn: "MX$ 189,00",
      hideLocalNotice: true
    },
    CO: {
      price: "COP 49.900",
      exitOld: "De COP 49.900",
      exitNew: "COP 37.900",
      exitBtn: "COP 37.900",
      hideLocalNotice: true
    },
    AR: {
      price: "ARS 19.900,00",
      exitOld: "De ARS 19.900,00",
      exitNew: "ARS 14.900,00",
      exitBtn: "ARS 14.900,00",
      hideLocalNotice: true
    },
    CL: {
      price: "CLP 12.990",
      exitOld: "De CLP 12.990",
      exitNew: "CLP 9.990",
      exitBtn: "CLP 9.990",
      hideLocalNotice: true
    },
    PE: {
      price: "PEN 49,00",
      exitOld: "De PEN 49,00",
      exitNew: "PEN 37,00",
      exitBtn: "PEN 37,00",
      hideLocalNotice: true
    },
    default: {
      price: "US$ 12,90",
      exitOld: "De US$ 12,90",
      exitNew: "US$ 9,90",
      exitBtn: "US$ 9,90",
      hideLocalNotice: false
    }
  };

  const updateGeoTexts = (countryCode) => {
    const cfg = geoTextConfig[countryCode] || geoTextConfig["default"];

    // Preço principal no Card da Oferta
    const elPrice = document.getElementById("price-val");
    if (elPrice && cfg.price) {
      elPrice.textContent = cfg.price;
    }

    // Modal de Retenção (Exit Popup / Back Redirect)
    const elExitOld = document.getElementById("exit-price-old");
    const elExitNew = document.getElementById("exit-price-new");
    const elExitBtn = document.getElementById("exit-btn-price");

    if (elExitOld && cfg.exitOld) elExitOld.textContent = cfg.exitOld;
    if (elExitNew && cfg.exitNew) elExitNew.textContent = cfg.exitNew;
    if (elExitBtn && cfg.exitBtn) elExitBtn.textContent = cfg.exitBtn;

    // Aviso de moeda local
    const localNotices = document.querySelectorAll(".local-currency-notice");
    localNotices.forEach((el) => {
      el.style.display = cfg.hideLocalNotice ? "none" : "";
    });
  };

  const fetchCountryCode = () => {
    return new Promise((resolve) => {
      fetch("https://ipapi.co/json/")
        .then((r) => r.json())
        .then((data) => {
          const code = data && (data.country_code || data.countryCode);
          if (code) resolve(code.toUpperCase());
          else throw new Error("Invalid format");
        })
        .catch(() => {
          fetch("https://ipinfo.io/json")
            .then((r) => r.json())
            .then((data) => {
              const code = data && (data.country || data.country_code || data.countryCode);
              if (code) resolve(code.toUpperCase());
              else resolve("DEFAULT");
            })
            .catch(() => {
              resolve("DEFAULT");
            });
        });
    });
  };

  const initPricing = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const testCountry = urlParams.get("country");
    if (testCountry) {
      updateGeoTexts(testCountry.toUpperCase());
    } else {
      fetchCountryCode().then((detectedCountry) => {
        updateGeoTexts(detectedCountry);
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPricing);
  } else {
    initPricing();
  }
})();

// SCRIPT BACK REDIRECT — MODAL DE RETENÇÃO (EXIT POPUP COM OFERTA DE US$ 9,90)
(function () {
  const exitModal = document.getElementById("exit-popup");
  if (!exitModal) return;

  let hasIntercepted = false;

  function setupHistoryTrap() {
    try {
      history.replaceState({ exitTrap: true, page: "landing" }, "", location.href);
      history.pushState({ exitTrap: true, step: 1 }, "", location.href);
    } catch (e) {
      console.warn("History pushState error:", e);
    }
  }

  setupHistoryTrap();

  // Reforça a armadilha do histórico na primeira interação do usuário na página
  const armTrapOnInteraction = function () {
    setupHistoryTrap();
    window.removeEventListener("click", armTrapOnInteraction);
    window.removeEventListener("touchstart", armTrapOnInteraction);
    window.removeEventListener("scroll", armTrapOnInteraction);
  };
  window.addEventListener("click", armTrapOnInteraction, { passive: true });
  window.addEventListener("touchstart", armTrapOnInteraction, { passive: true });
  window.addEventListener("scroll", armTrapOnInteraction, { passive: true });

  function triggerExitModal() {
    if (!exitModal) return;
    if (!exitModal.open) {
      if (typeof exitModal.showModal === "function") {
        exitModal.showModal();
      } else {
        exitModal.setAttribute("open", "");
      }
    }
  }

  window.addEventListener("popstate", function () {
    if (!hasIntercepted) {
      hasIntercepted = true;
      // Re-insere estado para manter na página enquanto o card está em foco
      history.pushState({ exitTrap: true, step: 2 }, "", location.href);
      triggerExitModal();
    }
  });

  // Desktop: Detecta saída do cursor pelo topo da janela como gatilho complementar
  document.addEventListener("mouseleave", function (e) {
    if (e.clientY <= 10 && !hasIntercepted) {
      hasIntercepted = true;
      triggerExitModal();
    }
  });
})();
