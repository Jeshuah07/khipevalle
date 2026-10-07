/**
 * ============================================================================
 * KAPHI & VALLE INDUSTRIAS S.R.L. - ARCHIVO CENTRAL DE CONFIGURACIÓN
 * ============================================================================
 * Todos los parámetros clave del negocio, pasarelas de pago, tipo de cambio y
 * envíos se configuran en este archivo único para facilitar la sustentación y
 * el mantenimiento.
 */

export const CONFIG = {
  // Datos Generales de la Empresa
  company: {
    name: "KAPHI & VALLE INDUSTRIAS S.R.L.",
    brandName: "KAPHI & VALLE",
    slogan: "Sabor de Altura y Frutas de los Valles",
    country: "Bolivia",
    originCity: "Cochabamba / Valles de Bolivia",
    address: "Av. Melchor Pérez de Olguín #450, Cochabamba, Bolivia",
    email: "ventas@kaphivalle.com.bo",
    phone: "+591 73669959",
    whatsappNumber: "59173669959", // WhatsApp oficial del negocio
    social: {
      facebook: "https://facebook.com/kaphivalle",
      instagram: "https://instagram.com/kaphivalle",
      tiktok: "https://tiktok.com/@kaphivalle"
    }
  },

  // Configuración Monetaria y Tipo de Cambio
  currency: {
    default: "BOB", // 'BOB' (Bolivianos) o 'USD' (Dólares estadounidenses)
    exchangeRateUsdToBob: 6.96, // 1 USD = 6.96 Bs (OFICIAL Y CONFIGURABLE)
    symbols: {
      BOB: "Bs",
      USD: "$"
    }
  },

  // Configuración de Idioma
  i18n: {
    defaultLanguage: "es", // 'es' o 'en'
    supportedLanguages: ["es", "en"]
  },

  // Zonas y Costos de Envío
  shipping: {
    national: {
      id: "national",
      label_es: "Envío Nacional (Toda Bolivia)",
      label_en: "National Shipping (All Bolivia)",
      costBob: 25.00,
      costUsd: 3.59,
      deliveryTime_es: "24 a 48 horas hábiles",
      deliveryTime_en: "24 to 48 business hours"
    },
    international: {
      id: "international",
      label_es: "Envío Internacional (DHL Express / FedEx)",
      label_en: "International Shipping (DHL Express / FedEx)",
      costBob: 174.00,
      costUsd: 25.00,
      deliveryTime_es: "5 a 8 días hábiles",
      deliveryTime_en: "5 to 8 business days"
    }
  },

  // Medios de Pago
  payments: {
    paypal: {
      // ⚠️ REEMPLAZAR POR TU CLIENT ID DE PAYPAL SANDBOX CUANDO TENGAS TU CUENTA DEVELOPER
      // 'sb' o 'test' permite cargar el SDK en modo demostración académica
      clientId: "test", 
      currency: "USD",
      intent: "capture",
      environment: "sandbox" // Cambiar a 'production' en despliegue real
    },
    qrTransfer: {
      bankName: "Banco Nacional de Bolivia (BNB)",
      accountType: "Cuenta Corriente en Bolivianos (Bs)",
      accountNumber: "150-2948192-3",
      accountHolder: "KAPHI & VALLE INDUSTRIAS S.R.L.",
      taxId: "NIT: 3849102018",
      qrImagePath: "assets/img/qr-banco.png",
      instructions_es: "Escanea el código QR Simple con la app de cualquier banco boliviano o realiza una transferencia interbancaria. Luego envía el comprobante por WhatsApp con tu código de pedido.",
      instructions_en: "Scan the Bolivian QR Simple code using any banking app or transfer to the account above. Send the receipt via WhatsApp with your order reference."
    }
  },

  // Servicio de Envío de Correos Automáticos (EmailJS)
  emailjs: {
    publicKey: "LGLksvQnvFNWooB-X",  // Clave Pública de tu cuenta EmailJS
    serviceId: "service_p1jbuyi",    // ID de servicio de Gmail
    templateId: "template_9p3bmh5"   // ID de plantilla configurada
  },

  // Rutas de datos
  paths: {
    productsJson: "data/products.json",
    i18nEsJson: "data/i18n/es.json",
    i18nEnJson: "data/i18n/en.json",
    cartStorageKey: "kaphivalle_cart_v1",
    langStorageKey: "kaphivalle_lang_v1",
    currStorageKey: "kaphivalle_curr_v1",
    lastOrderKey: "kaphivalle_last_order_v1"
  }
};
