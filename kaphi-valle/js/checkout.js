/**
 * ============================================================================
 * KAPHI & VALLE - CONTROLADOR DE CHECKOUT (CHECKOUT.JS)
 * Validación de formularios, selección de zonas de envío y orquestación
 * modular de pasarelas de pago (PayPal Sandbox y QR Simple Bolivia).
 * ============================================================================
 */

import { CONFIG } from './config.js';
import { getCart, getCartSubtotalBob, getCartSubtotalUsd, clearCart } from './cart.js';
import { formatPrice, bobToUsd, onCurrencyChange } from './currency.js';
import { getCurrentLanguage, onLanguageChange, applyTranslations, t } from './i18n.js';
import { showToast } from './main.js';
import { initPayPalPayment } from './payments/paypal.js';
import { renderQrTransferPayment, generateBolivianOrderRef } from './payments/qr-transfer.js';

let currentShippingZone = 'national'; // 'national' o 'international'
let currentPaymentMethod = 'qr'; // 'qr' o 'paypal'
let activeOrderRef = generateBolivianOrderRef();

document.addEventListener('DOMContentLoaded', () => {
  initCheckout();

  onCurrencyChange(() => updateCheckoutSummary());
  onLanguageChange(() => {
    updateCheckoutSummary();
    applyTranslations();
  });
});

/**
 * Inicializar Checkout
 */
function initCheckout() {
  const cartItems = getCart();
  if (!cartItems || cartItems.length === 0) {
    // Si no hay productos, redirigir al carrito
    window.location.href = 'carrito.html';
    return;
  }

  // Pre-poblar o escuchar cambios en el país
  const countrySelect = document.getElementById('checkout-country');
  if (countrySelect) {
    countrySelect.addEventListener('change', (e) => {
      const isBolivia = e.target.value === 'BO';
      const shippingRadioNat = document.getElementById('ship-national');
      const shippingRadioInt = document.getElementById('ship-international');

      if (isBolivia) {
        if (shippingRadioNat) shippingRadioNat.checked = true;
        currentShippingZone = 'national';
        showBoliviaPaymentOptions(true);
      } else {
        if (shippingRadioInt) shippingRadioInt.checked = true;
        currentShippingZone = 'international';
        showBoliviaPaymentOptions(false);
      }
      updateCheckoutSummary();
      updatePaymentPanels();
    });
  }

  // Radios de método de envío
  const shippingRadios = document.querySelectorAll('input[name="shipping_option"]');
  shippingRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentShippingZone = e.target.value;
      updateCheckoutSummary();
      updatePaymentPanels();
    });
  });

  // Botones de pestañas de medios de pago
  const tabPaypal = document.getElementById('tab-btn-paypal');
  const tabQr = document.getElementById('tab-btn-qr');

  if (tabPaypal && tabQr) {
    tabPaypal.addEventListener('click', () => {
      currentPaymentMethod = 'paypal';
      tabPaypal.classList.add('active');
      tabQr.classList.remove('active');
      updatePaymentPanels();
    });

    tabQr.addEventListener('click', () => {
      currentPaymentMethod = 'qr';
      tabQr.classList.add('active');
      tabPaypal.classList.remove('active');
      updatePaymentPanels();
    });
  }

  updateCheckoutSummary();
  updatePaymentPanels();
}

/**
 * Adaptar opciones según destino nacional o internacional
 */
function showBoliviaPaymentOptions(isBolivia) {
  const qrTabBtn = document.getElementById('tab-btn-qr');
  const tabPaypal = document.getElementById('tab-btn-paypal');

  if (!isBolivia) {
    // Para internacional, priorizar y activar PayPal
    currentPaymentMethod = 'paypal';
    if (tabPaypal) tabPaypal.classList.add('active');
    if (qrTabBtn) {
      qrTabBtn.classList.remove('active');
      qrTabBtn.style.opacity = '0.4';
      qrTabBtn.title = 'El pago por QR Simple es exclusivo para cuentas bolivianas en moneda nacional (Bs).';
    }
  } else {
    if (qrTabBtn) {
      qrTabBtn.style.opacity = '1';
      qrTabBtn.title = '';
    }
  }
}

/**
 * Obtener datos consolidados del pedido actual
 */
export function getCurrentOrderData() {
  const items = getCart();
  const subtotalBob = getCartSubtotalBob();
  const subtotalUsd = getCartSubtotalUsd();

  const isNational = currentShippingZone === 'national';
  const shippingCostBob = isNational ? CONFIG.shipping.national.costBob : CONFIG.shipping.international.costBob;
  const shippingCostUsd = isNational ? CONFIG.shipping.national.costUsd : CONFIG.shipping.international.costUsd;

  const totalBob = Number((subtotalBob + shippingCostBob).toFixed(2));
  const totalUsd = Number((subtotalUsd + shippingCostUsd).toFixed(2));

  // Datos del cliente desde el formulario
  const customer = {
    fullName: document.getElementById('cust-name')?.value.trim() || '',
    email: document.getElementById('cust-email')?.value.trim() || '',
    phone: document.getElementById('cust-phone')?.value.trim() || '',
    country: document.getElementById('checkout-country')?.value || 'BO',
    countryName: document.getElementById('checkout-country')?.selectedOptions[0]?.text || 'Bolivia',
    city: document.getElementById('cust-city')?.value.trim() || '',
    address: document.getElementById('cust-address')?.value.trim() || '',
    notes: document.getElementById('cust-notes')?.value.trim() || ''
  };

  return {
    orderRef: activeOrderRef,
    customer,
    items,
    shippingZone: currentShippingZone,
    subtotalBob,
    subtotalUsd,
    shippingBob: shippingCostBob,
    shippingUsd: shippingCostUsd,
    totalBob,
    totalUsd
  };
}

/**
 * Actualiza el desglose en el resumen lateral
 */
function updateCheckoutSummary() {
  const orderData = getCurrentOrderData();
  const lang = getCurrentLanguage();

  // Lista de items resumida
  const itemsContainer = document.getElementById('checkout-items-list');
  if (itemsContainer) {
    itemsContainer.innerHTML = orderData.items.map(i => {
      const name = (typeof i.name === 'object') ? (i.name[lang] || i.name.es) : i.name;
      return `
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.5rem;">
          <span>${i.quantity}x ${name}</span>
          <strong>${formatPrice(i.price_bob * i.quantity)}</strong>
        </div>
      `;
    }).join('');
  }

  // Subtotal, Envío y Total
  const subtotalEl = document.getElementById('summary-subtotal-val');
  const shippingEl = document.getElementById('summary-shipping-val');
  const totalEl = document.getElementById('summary-total-val');
  const totalDualEl = document.getElementById('summary-total-dual');

  if (subtotalEl) subtotalEl.textContent = formatPrice(orderData.subtotalBob);
  if (shippingEl) shippingEl.textContent = formatPrice(orderData.shippingBob);
  if (totalEl) totalEl.textContent = formatPrice(orderData.totalBob);

  if (totalDualEl) {
    totalDualEl.textContent = `(Equivalente: $ ${orderData.totalUsd} USD / Bs ${orderData.totalBob})`;
  }
}

/**
 * Validar campos obligatorios del formulario
 */
export function validateCustomerForm() {
  const requiredIds = ['cust-name', 'cust-email', 'cust-phone', 'cust-city', 'cust-address'];
  let isValid = true;

  requiredIds.forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;

    const group = input.closest('.form-group');
    if (!input.value.trim()) {
      isValid = false;
      if (group) group.classList.add('has-error');
    } else {
      if (group) group.classList.remove('has-error');
    }
  });

  // Validar formato de email
  const emailInput = document.getElementById('cust-email');
  if (emailInput && emailInput.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      isValid = false;
      emailInput.closest('.form-group')?.classList.add('has-error');
    }
  }

  return isValid;
}

/**
 * Actualizar visibilidad de paneles de pago
 */
function updatePaymentPanels() {
  const panelPaypal = document.getElementById('panel-paypal');
  const panelQr = document.getElementById('panel-qr');

  if (currentPaymentMethod === 'paypal') {
    if (panelPaypal) panelPaypal.classList.add('active');
    if (panelQr) panelQr.classList.remove('active');

    // Inicializar PayPal SDK
    initPayPalPayment({
      containerId: 'paypal-buttons-container',
      getOrderData: getCurrentOrderData,
      onApproved: (orderSummary) => {
        handleOrderSuccess(orderSummary);
      },
      onCancelled: () => {
        showToast('Transacción de PayPal cancelada.', 'info');
      },
      onErrorOccurred: (err) => {
        showToast('Error en PayPal: ' + err.message, 'danger');
      }
    });

  } else {
    if (panelQr) panelQr.classList.add('active');
    if (panelPaypal) panelPaypal.classList.remove('active');

    // Renderizar QR y datos bancarios
    renderQrTransferPayment({
      containerId: 'qr-payment-container',
      orderData: getCurrentOrderData(),
      onConfirmOrder: (orderSummary, waLink) => {
        if (!validateCustomerForm()) {
          showToast('Por favor completa todos tus datos de envío antes de continuar.', 'danger');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        // Abrir WhatsApp en nueva pestaña con el mensaje armado
        window.open(waLink, '_blank');
        handleOrderSuccess(orderSummary);
      }
    });
  }
}

/**
 * Almacenar orden, vaciar carrito y redirigir
 */
function handleOrderSuccess(orderSummary) {
  try {
    localStorage.setItem(CONFIG.paths.lastOrderKey, JSON.stringify(orderSummary));
  } catch (err) {
    console.error("No se pudo guardar la orden:", err);
  }

  clearCart();
  window.location.href = 'gracias.html';
}
