# 🍓 KAPHI & VALLE INDUSTRIAS S.R.L.
### Plataforma de Comercio Electrónico Bilingüe y Bimonetaria (Hecho en Bolivia)

> **Proyecto Universitario:** Materia *Comercio Electrónico*  
> **Empresa:** KAPHI & VALLE INDUSTRIAS S.R.L.  
> **Rubro:** Producción artesanal de mermeladas, miel pura y derivados de fruta  
> **Origen:** Cochabamba / Valles de Bolivia 🇧🇴  
> **Idiomas:** Español (Principal) e Inglés  
> **Monedas:** Bolivianos (Bs - BOB) y Dólares Estadounidenses ($ - USD)  
> **Hosting Compatible:** GitHub Pages, Netlify o cualquier servidor web estático/Apache (100% gratuito)

---

## 📋 1. Descripción del Proyecto

Este proyecto consiste en el desarrollo integral de una tienda de comercio electrónico profesional, ágil, accesible y mobile-first para **KAPHI & VALLE INDUSTRIAS S.R.L.**, una empresa boliviana que transforma frutas de los valles andinos en productos gourmet.

La arquitectura fue diseñada bajo el principio de **cero costos operativos (100% gratuita)**, prescindiendo de servidores de pago o CMS pesados, utilizando exclusivamente estándares web nativos (**HTML5 semántico, CSS3 puro y JavaScript modular ES6**).

---

## 📂 2. Estructura de Archivos y Carpetas

```text
/kaphi-valle
│
├── index.html                  # Página de inicio (Hero, Hecho en Bolivia, Destacados)
├── tienda.html                 # Catálogo interactivo (Filtros, búsqueda, orden)
├── producto.html               # Detalle dinámico del producto (?id=...)
├── carrito.html                # Carrito de compras reactivo y persistente
├── checkout.html               # Finalización de compra y selección de pagos
├── gracias.html                # Pantalla de confirmación y comprobante
├── nosotros.html               # Historia de la empresa y proceso artesanal
├── envios.html                 # Políticas de envíos Nacionales e Internacionales
├── contacto.html               # Formulario, mapa y botón directo a WhatsApp
├── ebook.html                  # Página promocional de E-book culinario
├── README.md                   # Documentación y guía de sustentación
│
├── css/
│   ├── variables.css           # Paleta de color oficial del logo, tipografías, espaciados
│   ├── base.css                # Reset moderno, utilidades, tipografía y accesibilidad
│   ├── components.css          # Navbar, footer, botones, tarjetas, alertas y toasts
│   └── pages.css               # Layouts específicos (Hero, Catálogo, Checkout, etc.)
│
├── js/
│   ├── config.js               # CONFIGURACIÓN CENTRAL (Empresa, tipo de cambio, sandbox, envíos)
│   ├── main.js                 # Control común del navbar, menú móvil, switchers y toasts
│   ├── products.js             # Carga de catálogo JSON, renderizado y filtros
│   ├── cart.js                 # Lógica de carrito con persistencia en localStorage
│   ├── currency.js             # Conversión y formateo automático Bs / USD
│   ├── i18n.js                 # Motor de internacionalización ES / EN
│   ├── checkout.js             # Orquestador del formulario y pasarelas de pago
│   └── payments/
│       ├── paypal.js           # Integración modular con PayPal JS SDK (Sandbox)
│       └── qr-transfer.js      # Pasarela local boliviana (QR Simple + WhatsApp)
│
├── data/
│   ├── products.json           # Catálogo de 7 productos con datos completos
│   └── i18n/
│       ├── es.json             # Textos oficiales en Español
│       └── en.json             # Textos oficiales en Inglés
│
└── assets/
    ├── img/                    # Logotipo oficial, QR bancario SVG y fotografías de productos
    └── icons/                  # Recursos gráficos
```

---

## 🚀 3. Cómo Ejecutar el Proyecto en Local

### Opción A: Usando XAMPP (Apache) - Entorno Actual
Dado que los archivos están en `c:\xampp\htdocs\housetienda\kaphi-valle`:
1. Asegúrate de tener **Apache encendido** en el Panel de Control de XAMPP.
2. Abre tu navegador web favorito (Chrome, Edge, Firefox).
3. Ingresa a la URL:
   ```text
   http://localhost/housetienda/kaphi-valle/
   ```

### Opción B: Usando VS Code Live Server
1. Abre la carpeta `/kaphi-valle` en VS Code.
2. Haz clic derecho en `index.html` y selecciona **"Open with Live Server"**.
3. Se abrirá automáticamente en `http://127.0.0.1:5500/`.

### Opción C: Usando Node / npx serve (Opcional)
En la terminal de la carpeta ejecuta:
```bash
npx serve .
```

---

## 💳 4. Sistema de Pagos (Explicación para Exposición)

La arquitectura de pagos es **modular**; cada método está encapsulado en su propio archivo dentro de `js/payments/` con una interfaz desacoplada.

### A. Medio 1: PayPal Smart Payment Buttons (Internacional)
* **Archivo:** `js/payments/paypal.js`
* **Entorno:** **SANDBOX** (Pruebas).
* **Moneda de Cobro:** **USD**. PayPal liquida en dólares; el monto se calcula estrictamente desde el subtotal del carrito y la zona de envío seleccionada.
* **Estados Gestionados:**
  * `createOrder`: Arma la orden con items, subtotales y flete.
  * `onApprove`: Captura la transacción, genera el resumen con ID de transacción, vacía el carrito y redirige a `gracias.html`.
  * `onCancel`: Notifica al usuario de la cancelación sin perder su carrito.
  * `onError`: Muestra alertas claras y permite reintentar.

#### ⚙️ ¿Cómo cambiar el Client ID de PayPal Sandbox a Producción?
En `js/config.js`, ubica la sección `payments.paypal`:
```javascript
payments: {
  paypal: {
    // 1. Reemplaza 'test' por tu Client ID generado en developer.paypal.com:
    clientId: "TU_CLIENT_ID_DE_SANDBOX_AQUI",
    currency: "USD",
    intent: "capture",
    environment: "sandbox" // 2. Para pasar a producción real, cambia a 'production'
  }
}
```

> 🎓 **Sustentación Académica de Seguridad:**  
> Al tratarse de un sitio web estático (frontend puro sin backend de cobro), la captura se realiza del lado del cliente (`actions.order.capture()`), lo cual es el estándar para prototipos y entornos Sandbox. En un entorno de producción corporativo de alta escala, la orden se crea en el cliente, pero la captura y verificación del webhook debe delegarse a una función serverless o servidor seguro (Node.js, PHP, Python) para validar firmas criptográficas y prevenir manipulación de precios.

### B. Medio 2: Pago Local Boliviano (QR Simple / Transferencia Bancaria)
* **Archivo:** `js/payments/qr-transfer.js`
* **Entorno:** Pagos locales en Bolivia vía código QR Simple interoperable o transferencia interbancaria BNB / Banco Unión.
* **Moneda de Cobro:** **Bolivianos (Bs)**.
* **Generación de Código:** Genera una clave alfanumérica única (Ej. `KV-2026-X7K2A`).
* **Integración WhatsApp:** Un botón pre-arma un mensaje dinámico con los productos, monto exacto y código de referencia para enviar al número oficial de la empresa (`CONFIG.company.whatsappNumber`).
* **Estado:** *"Pendiente de confirmación"*.

---

## 💱 5. Configuración de Tipo de Cambio y Datos Bancarios

Toda la configuración del negocio está unificada en `js/config.js`:

* **Tipo de Cambio (1 USD = 6.96 Bs):**
  ```javascript
  currency: {
    default: "BOB",
    exchangeRateUsdToBob: 6.96, // <-- Editar aquí para cambiar el tipo de cambio
    symbols: { BOB: "Bs", USD: "$" }
  }
  ```
* **Datos de Cuenta Bancaria:**
  ```javascript
  qrTransfer: {
    bankName: "Banco Nacional de Bolivia (BNB)",
    accountType: "Cuenta Corriente en Bolivianos (Bs)",
    accountNumber: "150-2948192-3",
    accountHolder: "KAPHI & VALLE INDUSTRIAS S.R.L.",
    taxId: "NIT: 3849102018",
    qrImagePath: "assets/img/qr-banco.svg"
  }
  ```
* **Tarifas y Tiempos de Envío:**
  ```javascript
  shipping: {
    national: { costBob: 25.00, costUsd: 3.59, deliveryTime_es: "24 a 48 horas" },
    international: { costBob: 174.00, costUsd: 25.00, deliveryTime_es: "5 a 8 días hábiles" }
  }
  ```

---

## 🍎 6. Cómo Modificar o Agregar Productos al Catálogo

Los productos **NO están escritos a mano en el HTML**. Se gestionan en el archivo `data/products.json`.

Cada producto tiene la siguiente estructura estandarizada:
```json
{
  "id": "prod-08",
  "name": {
    "es": "Mermelada de Durazno de San Benito",
    "en": "San Benito Peach Jam"
  },
  "description": {
    "es": "Duraznos madurados al sol en los huertos de San Benito, Cochabamba.",
    "en": "Sun-ripened peaches from heritage orchards in San Benito, Cochabamba."
  },
  "category": "mermeladas",
  "price_bob": 35.00,
  "price_usd": 5.03,
  "image": "assets/img/tu_imagen.png",
  "stock": 30,
  "weight_g": 320,
  "badge": { "es": "Nuevo", "en": "New" },
  "ingredients": { "es": "Durazno criollo, azúcar rubia, limón.", "en": "Peaches, cane sugar, lime." },
  
  /* Campos arquitectónicos listos para modelo Dropshipping */
  "supplier": "Asociación Fruticultores de San Benito / Kaphi & Valle",
  "dispatch_time_days": 2
}
```

---

## 🌐 7. Publicación Gratuita en Internet (Despliegue)

### Método 1: GitHub Pages (100% Gratis)
1. Crea un nuevo repositorio público en [github.com](https://github.com) llamado `kaphi-valle`.
2. En la terminal dentro de `/kaphi-valle`:
   ```bash
   git init
   git add .
   git commit -m "Lanzamiento Kaphi & Valle E-Commerce"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/kaphi-valle.git
   git push -u origin main
   ```
3. En el repositorio de GitHub, ve a **Settings** > **Pages**.
4. En **Branch**, selecciona `main` y guarda.
5. En 1 minuto tendrás tu enlace en vivo: `https://TU_USUARIO.github.io/kaphi-valle/`.

### Método 2: Netlify (Arrastrar y Soltar)
1. Ve a [app.netlify.com](https://app.netlify.com).
2. Arrastra la carpeta `kaphi-valle` al panel de "Deploy manually".
3. Tendrás una URL instantánea con HTTPS gratuito (ej. `https://kaphi-valle.netlify.app`).

---

## 🎓 8. Puntos Clave para la Sustentación Universitaria

1. **Diseño Identitario:** La paleta cromática se extrajo directamente del logotipo oficial:
   * **Azul Noche Andino (`#121927`):** Fondo del isotipo y elemento de seriedad corporativa.
   * **Ámbar / Ocre Tostado (`#e07a16`):** Representa el sol de los valles y los picos montañosos.
   * **Blanco y Pizarra (`#ffffff`, `#8ea1b6`):** Tipografía nítida de alta legibilidad.
2. **Internacionalización y Bimonetario:** Sin librerías pesadas, el sistema almacena preferencias en `localStorage` y actualiza reactivamente los símbolos monetarios y textos mediante diccionarios JSON.
3. **Validación Accesible:** Todos los formularios cuentan con validación semántica, atributos `aria-*` y soporte de contraste WCAG AA.
4. **Preparación Futura:** Se dejó preparado el modelo de Dropshipping a nivel de esquema de datos y la página reservada `/ebook.html` para la etapa 2 del proyecto.

---
*KAPHI & VALLE INDUSTRIAS S.R.L. — Hecho con orgullo en Bolivia 🇧🇴*
