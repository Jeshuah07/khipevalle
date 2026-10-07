/**
 * ============================================================================
 * KAPHI & VALLE - GESTIÓN MULTI-DIVISA (CURRENCY.JS)
 * Soporte transparente para Bolivianos (Bs - BOB) y Dólares (USD).
 * Tipo de cambio configurable en config.js (ej. 1 USD = 6.96 Bs).
 * ============================================================================
 */

import { CONFIG } from './config.js';

let activeCurrency = localStorage.getItem(CONFIG.paths.currStorageKey) || CONFIG.currency.default;
const listeners = [];

/**
 * Obtener la moneda actualmente activa ('BOB' o 'USD')
 */
export function getCurrentCurrency() {
  return activeCurrency;
}

/**
 * Cambiar la moneda y notificar a los observadores
 */
export function setCurrency(newCurrency) {
  if (newCurrency !== 'BOB' && newCurrency !== 'USD') return;
  if (newCurrency === activeCurrency) return;

  activeCurrency = newCurrency;
  localStorage.setItem(CONFIG.paths.currStorageKey, activeCurrency);

  // Disparar listeners
  listeners.forEach(fn => fn(activeCurrency));
}

/**
 * Suscribirse a cambios de moneda
 */
export function onCurrencyChange(callback) {
  if (typeof callback === 'function') {
    listeners.push(callback);
  }
}

/**
 * Convierte un monto base en Bolivianos (BOB) a Dólares (USD)
 */
export function bobToUsd(amountBob) {
  const rate = CONFIG.currency.exchangeRateUsdToBob;
  return Number((amountBob / rate).toFixed(2));
}

/**
 * Convierte un monto en Dólares (USD) a Bolivianos (BOB)
 */
export function usdToBob(amountUsd) {
  const rate = CONFIG.currency.exchangeRateUsdToBob;
  return Number((amountUsd * rate).toFixed(2));
}

/**
 * Formatea un valor base en BOB a la moneda seleccionada con su símbolo
 * @param {number} amountBob - Monto base en Bolivianos
 * @param {string|null} forcedCurrency - Forzar 'BOB' o 'USD' (opcional)
 * @returns {string} Ejemplo: "Bs 35.00" o "$ 5.03"
 */
export function formatPrice(amountBob, forcedCurrency = null) {
  const curr = forcedCurrency || activeCurrency;
  const num = Number(amountBob) || 0;

  if (curr === 'USD') {
    const usdVal = bobToUsd(num);
    return `${CONFIG.currency.symbols.USD} ${usdVal.toFixed(2)}`;
  } else {
    return `${CONFIG.currency.symbols.BOB} ${num.toFixed(2)}`;
  }
}

/**
 * Devuelve el precio en formato dual para visualización de referencia
 * Ejemplo: "Bs 35.00 (~$5.03 USD)"
 */
export function formatDualPrice(amountBob) {
  const num = Number(amountBob) || 0;
  const usdVal = bobToUsd(num);
  return `${CONFIG.currency.symbols.BOB} ${num.toFixed(2)} (~$ ${usdVal.toFixed(2)} USD)`;
}
