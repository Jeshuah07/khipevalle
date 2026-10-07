/**
 * ============================================================================
 * KAPHI & VALLE - MOTOR DE INTERNACIONALIZACIÓN (I18N.JS)
 * Soporte bilingüe ES / EN sin dependencias externas.
 * Actualiza textos automáticamente usando atributos data-i18n.
 * ============================================================================
 */

import { CONFIG } from './config.js';

let currentLang = localStorage.getItem(CONFIG.paths.langStorageKey) || CONFIG.i18n.defaultLanguage;
let translations = { es: null, en: null };
const listeners = [];

/**
 * Cargar diccionarios JSON
 */
export async function loadTranslations() {
  try {
    // Si estamos en un subdirectorio o raíz, encontrar la ruta relativa
    const basePath = getBasePath();
    const [esRes, enRes] = await Promise.all([
      fetch(`${basePath}${CONFIG.paths.i18nEsJson}`).then(r => r.json()),
      fetch(`${basePath}${CONFIG.paths.i18nEnJson}`).then(r => r.json())
    ]);

    translations.es = esRes;
    translations.en = enRes;
    applyTranslations();
  } catch (error) {
    console.warn("No se pudieron cargar los archivos de traducción JSON, usando fallbacks:", error);
  }
}

/**
 * Obtener ruta base según la ubicación del script
 */
function getBasePath() {
  // Si la URL actual contiene una subcarpeta o se ejecuta desde local
  return './';
}

/**
 * Idioma activo
 */
export function getCurrentLanguage() {
  return currentLang;
}

/**
 * Cambiar idioma
 */
export async function setLanguage(lang) {
  if (!CONFIG.i18n.supportedLanguages.includes(lang)) return;
  if (lang === currentLang && translations[lang]) return;

  currentLang = lang;
  localStorage.setItem(CONFIG.paths.langStorageKey, currentLang);
  document.documentElement.lang = currentLang;

  if (!translations[lang]) {
    await loadTranslations();
  } else {
    applyTranslations();
  }

  listeners.forEach(fn => fn(currentLang));
}

/**
 * Suscribirse a cambios de idioma
 */
export function onLanguageChange(callback) {
  if (typeof callback === 'function') {
    listeners.push(callback);
  }
}

/**
 * Obtener texto traducido por clave anidada (ej: 'nav.home')
 */
export function t(keyPath, defaultText = '') {
  const dict = translations[currentLang] || translations.es;
  if (!dict) return defaultText || keyPath;

  const parts = keyPath.split('.');
  let current = dict;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return defaultText || keyPath;
    }
  }

  return current || defaultText || keyPath;
}

/**
 * Aplica traducciones a todos los elementos del DOM con [data-i18n]
 */
export function applyTranslations() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = t(key);
    if (translated && translated !== key) {
      el.textContent = translated;
    }
  });

  const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
  placeholders.forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const translated = t(key);
    if (translated && translated !== key) {
      el.setAttribute('placeholder', translated);
    }
  });

  const titles = document.querySelectorAll('[data-i18n-title]');
  titles.forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const translated = t(key);
    if (translated && translated !== key) {
      el.setAttribute('title', translated);
    }
  });
}

// Cargar traducciones al importar el módulo
loadTranslations();
