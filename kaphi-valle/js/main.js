/**
 * ============================================================================
 * KAPHI & VALLE - JS PRINCIPAL (MAIN.JS)
 * Inicialización de componentes comunes: Header, Footer, Idioma, Moneda, Menú
 * ============================================================================
 */

import { CONFIG } from './config.js';
import { getCurrentCurrency, setCurrency, onCurrencyChange } from './currency.js';
import { getCurrentLanguage, setLanguage, onLanguageChange, t } from './i18n.js';
import { getCartCount, onCartChange } from './cart.js';

// Inicializador DOM
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initLanguageSwitchers();
  initCurrencySwitchers();
  updateCartBadge();
  initFooterYear();

  // Escuchar cambios reactivos en el carrito
  onCartChange(() => {
    updateCartBadge();
  });

  // Escuchar cambios en la moneda
  onCurrencyChange(() => {
    updateActiveCurrencyButtons();
  });

  // Escuchar cambios en el idioma
  onLanguageChange(() => {
    updateActiveLanguageButtons();
  });
});

/**
 * Menú Móvil Hamburguesa
 */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.main-nav');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
      toggleBtn.innerHTML = isOpen ? '✕' : '☰';
    });

    // Cerrar al hacer clic en un enlace
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        toggleBtn.innerHTML = '☰';
      });
    });
  }
}

/**
 * Switcher de Idiomas (ES / EN)
 */
function initLanguageSwitchers() {
  const langButtons = document.querySelectorAll('[data-set-lang]');
  updateActiveLanguageButtons();

  langButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetLang = btn.getAttribute('data-set-lang');
      setLanguage(targetLang);
    });
  });
}

function updateActiveLanguageButtons() {
  const currentLang = getCurrentLanguage();
  document.querySelectorAll('[data-set-lang]').forEach(btn => {
    if (btn.getAttribute('data-set-lang') === currentLang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * Switcher de Monedas (BOB / USD)
 */
function initCurrencySwitchers() {
  const currButtons = document.querySelectorAll('[data-set-curr]');
  updateActiveCurrencyButtons();

  currButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetCurr = btn.getAttribute('data-set-curr');
      setCurrency(targetCurr);
    });
  });
}

function updateActiveCurrencyButtons() {
  const currentCurr = getCurrentCurrency();
  document.querySelectorAll('[data-set-curr]').forEach(btn => {
    if (btn.getAttribute('data-set-curr') === currentCurr) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * Actualizar contador flotante del carrito
 */
export function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-counter-badge');
  const count = getCartCount();
  badges.forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'inline-flex' : 'inline-flex';
  });
}

/**
 * Utilidad Toast de notificaciones
 */
export function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button style="background:none; border:none; color:#cbd5e1; cursor:pointer; font-weight:bold;">✕</button>
  `;

  const closeBtn = toast.querySelector('button');
  closeBtn.addEventListener('click', () => toast.remove());

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/**
 * Actualizar año dinámico de copyright
 */
function initFooterYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
