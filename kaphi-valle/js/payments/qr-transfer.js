/**
 * ============================================================================
 * KAPHI & VALLE - PASARELA DE PAGO: QR SIMPLE / TRANSFERENCIA BANCARIA (BOLIVIA)
 * Genera código único de referencia de pedido, muestra QR bancario y arma
 * mensaje dinámico directo para confirmación por WhatsApp.
 * ============================================================================
 */

import { CONFIG } from '../config.js';

/**
 * Genera un código de pedido boliviano único legible
 * Formato: KV-2026-XXXXX
 */
export function generateBolivianOrderRef() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `KV-${year}-${randomSuffix}`;
}

/**
 * Renderiza la interfaz de pago por QR y transferencia
 */
export function renderQrTransferPayment({ containerId, orderData, onConfirmOrder }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const qrConfig = CONFIG.payments.qrTransfer;
  const orderRef = orderData.orderRef || generateBolivianOrderRef();
  const totalBobFormatted = Number(orderData.totalBob).toFixed(2);

  // Mensaje estructurado para WhatsApp
  const waMessageText = encodeURIComponent(
    `*¡Hola KAPHI & VALLE S.R.L.!* 👋\n\n` +
    `He realizado una compra y adjunto mi comprobante de pago por QR/Transferencia.\n\n` +
    `📋 *N° de Referencia:* ${orderRef}\n` +
    `👤 *Cliente:* ${orderData.customer?.fullName || 'Cliente'}\n` +
    `📱 *Teléfono:* ${orderData.customer?.phone || ''}\n` +
    `📍 *Ciudad:* ${orderData.customer?.city || 'Bolivia'}\n` +
    `💰 *Monto Transferido:* Bs ${totalBobFormatted}\n\n` +
    `📦 *Productos:* \n` +
    orderData.items.map(i => `• ${i.quantity}x ${(typeof i.name === 'object' ? i.name.es : i.name)}`).join('\n') +
    `\n\nQuedo a la espera de la confirmación para el despacho. ¡Gracias!`
  );

  const waLink = `https://api.whatsapp.com/send?phone=${CONFIG.company.whatsappNumber}&text=${waMessageText}`;

  container.innerHTML = `
    <div class="qr-box">
      <div style="background: var(--color-brand-amber-light); padding: 0.75rem 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-brand-amber); text-transform: uppercase;">
          Referencia de tu Pedido:
        </span>
        <div style="font-size: 1.5rem; font-weight: 900; color: var(--color-brand-navy-dark); letter-spacing: 0.05em;" id="qr-order-code">
          ${orderRef}
        </div>
      </div>

      <p style="font-size: 0.9rem; color: #475569; margin-bottom: 1rem;">
        Monto exacto a pagar en moneda nacional: <strong style="font-size: 1.25rem; color: var(--color-brand-amber);">Bs ${totalBobFormatted}</strong>
      </p>

      <!-- Código QR Vectorial -->
      <div class="qr-image-display">
        <img src="${qrConfig.qrImagePath}" alt="Código QR Simple BNB" style="width: 100%; height: 100%; object-fit: contain;">
      </div>

      <!-- Datos Bancarios -->
      <div class="bank-details-box">
        <div style="font-weight: 800; color: var(--color-brand-navy-dark); margin-bottom: 0.35rem;">
          🏛️ ${qrConfig.bankName}
        </div>
        <div><strong>Tipo de Cuenta:</strong> ${qrConfig.accountType}</div>
        <div><strong>N° de Cuenta:</strong> <code style="font-size: 1rem; font-weight: bold; color: var(--color-brand-navy-dark);">${qrConfig.accountNumber}</code></div>
        <div><strong>Titular:</strong> ${qrConfig.accountHolder}</div>
        <div><strong>NIT:</strong> ${qrConfig.taxId}</div>
      </div>

      <div style="background: #f8fafc; border: 1px dashed var(--color-border); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem; text-align: left; font-size: 0.85rem; color: #64748b;">
        ℹ️ <strong>Instrucciones:</strong>
        <ol style="margin-left: 1.25rem; margin-top: 0.5rem; line-height: 1.5;">
          <li>Escanea el QR o realiza una transferencia por <strong>Bs ${totalBobFormatted}</strong>.</li>
          <li>Coloca en el concepto o glosa: <strong>${orderRef}</strong>.</li>
          <li>Haz clic en el botón verde de abajo para registrar el pedido y enviar el comprobante por WhatsApp.</li>
        </ol>
      </div>

      <button type="button" class="btn btn-whatsapp btn-lg btn-full" id="btn-submit-qr-order">
        📲 Registrar Pedido y Enviar Comprobante por WhatsApp
      </button>
    </div>
  `;

  // Listener para confirmar y redirigir
  const confirmBtn = container.querySelector('#btn-submit-qr-order');
  confirmBtn.addEventListener('click', () => {
    const orderSummary = {
      orderId: orderRef,
      paymentMethod: 'qr_bolivia',
      status: 'pending',
      statusLabel: 'Pendiente de confirmación (Comprobante QR)',
      date: new Date().toISOString(),
      customer: orderData.customer,
      items: orderData.items,
      subtotalBob: orderData.subtotalBob,
      subtotalUsd: orderData.subtotalUsd,
      shippingBob: orderData.shippingBob,
      shippingUsd: orderData.shippingUsd,
      totalBob: orderData.totalBob,
      totalUsd: orderData.totalUsd,
      shippingZone: orderData.shippingZone,
      whatsappLink: waLink
    };

    if (typeof onConfirmOrder === 'function') {
      onConfirmOrder(orderSummary, waLink);
    }
  });
}
