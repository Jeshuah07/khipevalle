/**
 * ============================================================================
 * KAPHI & VALLE - PASARELA DE PAGO: PAYPAL SMART BUTTONS (PAYPAL.JS)
 * Integración modular del PayPal JavaScript SDK en entorno SANDBOX.
 * Cobro forzado en USD calculado dinámicamente desde el carrito.
 * ============================================================================
 */

import { CONFIG } from '../config.js';

let paypalSdkLoaded = false;
let paypalSdkLoadingPromise = null;

/**
 * Carga dinámica y asíncrona del script oficial de PayPal SDK
 */
export function loadPayPalSdk() {
  if (paypalSdkLoaded && window.paypal) {
    return Promise.resolve(window.paypal);
  }

  if (paypalSdkLoadingPromise) {
    return paypalSdkLoadingPromise;
  }

  paypalSdkLoadingPromise = new Promise((resolve, reject) => {
    // Verificar si ya existe en el DOM
    if (window.paypal) {
      paypalSdkLoaded = true;
      resolve(window.paypal);
      return;
    }

    const clientId = CONFIG.payments.paypal.clientId || "test";
    const script = document.createElement('script');
    script.id = 'paypal-js-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
    script.async = true;

    script.onload = () => {
      paypalSdkLoaded = true;
      resolve(window.paypal);
    };

    script.onerror = (err) => {
      console.error("Error al cargar PayPal SDK:", err);
      reject(new Error("No se pudo conectar con los servidores de PayPal. Verifica tu conexión."));
    };

    document.head.appendChild(script);
  });

  return paypalSdkLoadingPromise;
}

/**
 * Inicializar botones de PayPal dentro de un contenedor DOM
 * 
 * @param {Object} options
 * @param {string} options.containerId - ID del div donde se renderizan los botones
 * @param {Function} options.getOrderData - Función que retorna los datos del pedido (items, subtotalUsd, shippingUsd, totalUsd, customer)
 * @param {Function} options.onApproved - Callback al aprobarse el pago
 * @param {Function} options.onCancelled - Callback si el usuario cancela la ventana
 * @param {Function} options.onErrorOccurred - Callback si ocurre un error
 */
export async function initPayPalPayment({ containerId, getOrderData, onApproved, onCancelled, onErrorOccurred }) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Contenedor #${containerId} no encontrado para PayPal.`);
    return;
  }

  container.innerHTML = '<div style="text-align:center; padding:1.5rem; color:#64748b;">⏳ Conectando con PayPal Sandbox...</div>';

  try {
    const paypal = await loadPayPalSdk();
    container.innerHTML = ''; // Limpiar loader

    paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
        height: 44
      },

      /**
       * Creación de la orden en PayPal (calculada estrictamente en USD desde el carrito)
       */
      createOrder: (data, actions) => {
        const orderData = getOrderData();
        if (!orderData || !orderData.totalUsd || orderData.totalUsd <= 0) {
          throw new Error("El total del pedido debe ser mayor a 0 USD.");
        }

        const formattedTotal = Number(orderData.totalUsd).toFixed(2);

        return actions.order.create({
          purchase_units: [{
            description: `Pedido en KAPHI & VALLE S.R.L. - ${orderData.customer?.fullName || 'Cliente'}`,
            amount: {
              currency_code: 'USD',
              value: formattedTotal,
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: Number(orderData.subtotalUsd).toFixed(2)
                },
                shipping: {
                  currency_code: 'USD',
                  value: Number(orderData.shippingUsd).toFixed(2)
                }
              }
            },
            items: orderData.items.map(item => ({
              name: (typeof item.name === 'object' ? item.name.es : item.name).substring(0, 120),
              unit_amount: {
                currency_code: 'USD',
                value: Number(item.price_usd).toFixed(2)
              },
              quantity: String(item.quantity)
            }))
          }],
          application_context: {
            brand_name: CONFIG.company.brandName,
            shipping_preference: 'NO_SHIPPING' // La dirección se captura previamente en el formulario del sitio
          }
        });
      },

      /**
       * Manejo de la aprobación del pago por parte de PayPal
       */
      onApprove: async (data, actions) => {
        try {
          // Captura de los fondos en el cliente (fines académicos / sandbox)
          const captureDetails = await actions.order.capture();

          const orderData = getOrderData();
          const orderSummary = {
            orderId: captureDetails.id || `PAYPAL-${Date.now()}`,
            paymentMethod: 'paypal',
            status: 'completed',
            statusLabel: 'Pagado con éxito vía PayPal',
            date: new Date().toISOString(),
            transactionId: captureDetails.id,
            payerEmail: captureDetails.payer?.email_address || orderData.customer?.email,
            customer: orderData.customer,
            items: orderData.items,
            subtotalUsd: orderData.subtotalUsd,
            subtotalBob: orderData.subtotalBob,
            shippingUsd: orderData.shippingUsd,
            shippingBob: orderData.shippingBob,
            totalUsd: orderData.totalUsd,
            totalBob: orderData.totalBob,
            shippingZone: orderData.shippingZone
          };

          if (typeof onApproved === 'function') {
            onApproved(orderSummary);
          }
        } catch (err) {
          console.error("Error al capturar la orden en PayPal:", err);
          if (typeof onErrorOccurred === 'function') {
            onErrorOccurred(err);
          }
        }
      },

      /**
       * El usuario cerró o canceló la ventana de PayPal
       */
      onCancel: (data) => {
        console.warn("Transacción cancelada por el usuario en PayPal:", data);
        if (typeof onCancelled === 'function') {
          onCancelled(data);
        }
      },

      /**
       * Error devuelto por el SDK
       */
      onError: (err) => {
        console.error("Error devuelto por PayPal SDK:", err);
        if (typeof onErrorOccurred === 'function') {
          onErrorOccurred(err);
        }
      }
    }).render(`#${containerId}`);

  } catch (error) {
    container.innerHTML = `
      <div class="alert alert-danger">
        <strong>Error de conexión con PayPal:</strong> ${error.message}
        <br><small>Revisa la configuración del Client-ID en config.js.</small>
      </div>
    `;
  }
}
