/**
 * ============================================================================
 * KAPHI & VALLE - GESTIÓN Y RENDERIZADO DE PRODUCTOS (PRODUCTS.JS)
 * Carga desde data/products.json, filtrado, ordenamiento y renderizado dinámico.
 * ============================================================================
 */

import { CONFIG } from './config.js';
import { formatPrice, getCurrentCurrency } from './currency.js';
import { getCurrentLanguage, t } from './i18n.js';
import { addToCart } from './cart.js';
import { showToast } from './main.js';

let cachedProducts = null;

/**
 * Obtener la lista completa de productos
 */
export async function getProducts() {
  if (cachedProducts) return cachedProducts;

  try {
    const response = await fetch(`./${CONFIG.paths.productsJson}`);
    if (!response.ok) throw new Error("No se pudo cargar products.json");
    cachedProducts = await response.json();
    return cachedProducts;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
}

/**
 * Buscar producto por ID
 */
export async function getProductById(id) {
  const products = await getProducts();
  return products.find(p => p.id === id) || null;
}

/**
 * Filtrar y ordenar productos
 */
export function filterAndSortProducts(products, { category = 'all', searchQuery = '', sortBy = 'default' }) {
  let filtered = [...products];

  // Filtro por categoría
  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }

  // Búsqueda por texto (nombre en ES o EN, o descripción)
  if (searchQuery && searchQuery.trim() !== '') {
    const query = searchQuery.trim().toLowerCase();
    filtered = filtered.filter(p => {
      const nameEs = (p.name?.es || '').toLowerCase();
      const nameEn = (p.name?.en || '').toLowerCase();
      const descEs = (p.description?.es || '').toLowerCase();
      const descEn = (p.description?.en || '').toLowerCase();
      return nameEs.includes(query) || nameEn.includes(query) || descEs.includes(query) || descEn.includes(query);
    });
  }

  // Ordenamiento
  if (sortBy === 'price_asc') {
    filtered.sort((a, b) => a.price_bob - b.price_bob);
  } else if (sortBy === 'price_desc') {
    filtered.sort((a, b) => b.price_bob - a.price_bob);
  } else if (sortBy === 'name_asc') {
    filtered.sort((a, b) => {
      const nameA = (a.name?.es || '').toLowerCase();
      const nameB = (b.name?.es || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  return filtered;
}

/**
 * Generar HTML de tarjeta de producto
 */
export function createProductCardHtml(product) {
  const lang = getCurrentLanguage();
  const name = product.name[lang] || product.name.es;
  const desc = product.description[lang] || product.description.es;
  const badgeText = product.badge ? (product.badge[lang] || product.badge.es) : null;
  const priceFormatted = formatPrice(product.price_bob);

  const badgeHtml = badgeText ? `<span class="badge badge-bolivia product-card-badge">${badgeText}</span>` : '';

  return `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-card-media">
        ${badgeHtml}
        <a href="producto.html?id=${product.id}">
          <img src="${product.image}" alt="${name}" class="product-card-img" loading="lazy" onerror="this.src='assets/img/logo.png'">
        </a>
      </div>
      <div class="product-card-body">
        <span class="product-card-category">${product.category}</span>
        <h3 class="product-card-title">
          <a href="producto.html?id=${product.id}">${name}</a>
        </h3>
        <p class="product-card-desc">${desc}</p>
        <div class="product-card-meta">
          <div class="product-card-price-box">
            <span class="product-card-price-main">${priceFormatted}</span>
            <span class="product-card-price-sub">${product.weight_g}g</span>
          </div>
          <div class="product-card-actions">
            <button type="button" class="btn btn-primary btn-sm btn-quick-add" data-id="${product.id}" title="${t('shop.add_to_cart', 'Agregar')}">
              🛒 ${t('shop.add_to_cart', 'Agregar')}
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * Vincular eventos a botones rápidos de agregar al carrito
 */
export function bindAddToCartButtons(containerElement, onAddCallback) {
  if (!containerElement) return;

  containerElement.querySelectorAll('.btn-quick-add').forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const prodId = button.getAttribute('data-id');
      const product = await getProductById(prodId);
      if (product) {
        addToCart(product, 1);
        showToast(t('shop.added_toast', '¡Producto agregado al carrito!'), 'success');
        if (typeof onAddCallback === 'function') onAddCallback(product);
      }
    });
  });
}
