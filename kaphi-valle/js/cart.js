/**
 * ============================================================================
 * KAPHI & VALLE - GESTIÓN DEL CARRITO DE COMPRAS (CART.JS)
 * Persistencia en localStorage, cálculo reactivo de subtotales y emisión de eventos.
 * ============================================================================
 */

import { CONFIG } from './config.js';
import { bobToUsd } from './currency.js';

const STORAGE_KEY = CONFIG.paths.cartStorageKey;
let cartItems = loadCartFromStorage();
const changeListeners = [];

/**
 * Carga inicial desde localStorage
 */
function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Error al leer el carrito de localStorage:", err);
    return [];
  }
}

/**
 * Guardar en localStorage y notificar
 */
function saveCartToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  } catch (err) {
    console.error("Error al guardar carrito en localStorage:", err);
  }
  notifyListeners();
}

function notifyListeners() {
  changeListeners.forEach(fn => fn(cartItems));
}

/**
 * Suscribirse a cambios en el carrito
 */
export function onCartChange(callback) {
  if (typeof callback === 'function') {
    changeListeners.push(callback);
  }
}

/**
 * Obtener copia de los ítems actuales del carrito
 */
export function getCart() {
  return [...cartItems];
}

/**
 * Agregar un producto al carrito
 * @param {Object} product - Objeto producto completo desde products.json
 * @param {number} quantity - Cantidad a agregar (default: 1)
 */
export function addToCart(product, quantity = 1) {
  if (!product || !product.id) return false;
  const qty = parseInt(quantity, 10) || 1;

  const existingIndex = cartItems.findIndex(item => item.id === product.id);

  if (existingIndex > -1) {
    const newQty = cartItems[existingIndex].quantity + qty;
    // Validar contra stock disponible
    if (product.stock && newQty > product.stock) {
      cartItems[existingIndex].quantity = product.stock;
    } else {
      cartItems[existingIndex].quantity = newQty;
    }
  } else {
    cartItems.push({
      id: product.id,
      name: product.name,
      category: product.category,
      price_bob: Number(product.price_bob),
      price_usd: Number(product.price_usd || bobToUsd(product.price_bob)),
      image: product.image,
      weight_g: Number(product.weight_g || 0),
      stock: Number(product.stock || 99),
      quantity: Math.min(qty, product.stock || 99)
    });
  }

  saveCartToStorage();
  return true;
}

/**
 * Actualizar la cantidad de un ítem existente
 */
export function updateQuantity(productId, quantity) {
  const item = cartItems.find(i => i.id === productId);
  if (!item) return;

  const qty = parseInt(quantity, 10);
  if (qty <= 0) {
    removeFromCart(productId);
    return;
  }

  item.quantity = Math.min(qty, item.stock || 999);
  saveCartToStorage();
}

/**
 * Eliminar un producto del carrito
 */
export function removeFromCart(productId) {
  cartItems = cartItems.filter(i => i.id !== productId);
  saveCartToStorage();
}

/**
 * Vaciar todo el carrito
 */
export function clearCart() {
  cartItems = [];
  saveCartToStorage();
}

/**
 * Total de unidades en el carrito
 */
export function getCartCount() {
  return cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
}

/**
 * Subtotal en Bolivianos (BOB)
 */
export function getCartSubtotalBob() {
  return cartItems.reduce((acc, item) => acc + (item.price_bob * item.quantity), 0);
}

/**
 * Subtotal en Dólares (USD)
 */
export function getCartSubtotalUsd() {
  return cartItems.reduce((acc, item) => acc + (item.price_usd * item.quantity), 0);
}

/**
 * Peso total del carrito en gramos (para cálculo logístico)
 */
export function getCartTotalWeightGrams() {
  return cartItems.reduce((acc, item) => acc + ((item.weight_g || 0) * item.quantity), 0);
}
