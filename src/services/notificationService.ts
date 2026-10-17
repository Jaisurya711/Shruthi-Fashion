import { Address, CartItem, UserOrder } from '../types/store';

export const STORE_OWNER_EMAIL = 'shruthifashion01@gmail.com';
export const STORE_OWNER_WHATSAPP = '9894088349';

export interface CustomerRegistrationPayload {
  name: string;
  phone: string;
  email?: string;
  locality?: string;
}

/**
 * Sends registered customer details directly to store owner email: shruthifashion01@gmail.com
 */
export async function sendCustomerRegistrationEmail(data: CustomerRegistrationPayload): Promise<boolean> {
  try {
    const payload = {
      _subject: `🎉 New Customer Registered on Shruthi Fashion Website: ${data.name}`,
      _template: 'table',
      _captcha: 'false',
      store: 'Shruthi Fashion (Kovundampalayam, Coimbatore - 641030)',
      customer_name: data.name,
      customer_phone: data.phone,
      registration_method: 'Mobile Phone Registration',
      registration_time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      notes: 'Customer registered on the Shruthi Fashion web store.'
    };

    const response = await fetch(`https://formsubmit.co/ajax/${STORE_OWNER_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('Customer registration email dispatched to', STORE_OWNER_EMAIL);
      return true;
    }
  } catch (error) {
    console.warn('Notification email dispatch error (offline or network blocked):', error);
  }
  return false;
}

/**
 * Sends new order details to store owner email: shruthifashion01@gmail.com
 */
export async function sendOrderNotificationEmail(order: UserOrder): Promise<boolean> {
  try {
    const itemsSummary = order.items
      .map((item, idx) => `${idx + 1}. ${item.product.title} (Size: ${item.selectedSize}, Color: ${item.selectedColor}, Qty: ${item.quantity}) - ₹${item.product.price * item.quantity}`)
      .join('\n');

    const payload = {
      _subject: `🛍️ New Order #${order.orderNumber} (₹${order.total}) - Shruthi Fashion`,
      _template: 'table',
      _captcha: 'false',
      order_number: order.orderNumber,
      order_date: order.date,
      items_subtotal: `₹${order.subtotal.toLocaleString('en-IN')}`,
      shipping_fee: `₹${order.shippingFee}`,
      order_total: `₹${order.total.toLocaleString('en-IN')}`,
      payment_method: order.paymentMethod,
      customer_name: order.address.fullName,
      customer_phone: order.address.phone,
      delivery_address: `${order.address.street}, ${order.address.area}, ${order.address.city} - ${order.address.pincode}`,
      order_items: itemsSummary,
      dispatch_method: 'Courier Doorstep Delivery to customer address',
      tracking_id: order.trackingNumber
    };

    const response = await fetch(`https://formsubmit.co/ajax/${STORE_OWNER_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('Order notification email dispatched to', STORE_OWNER_EMAIL);
      return true;
    }
  } catch (error) {
    console.warn('Order email notification error:', error);
  }
  return false;
}

/**
 * Generates an automated WhatsApp message link to send order directly to owner's WhatsApp (9894088349)
 */
export function getOwnerWhatsAppOrderUrl(order: UserOrder): string {
  const itemsText = order.items
    .map((item, i) => `${i + 1}. *${item.product.title}*\n   Size: ${item.selectedSize} | Qty: ${item.quantity} | ₹${item.product.price * item.quantity}`)
    .join('\n');

  const message = `*NEW ORDER - SHURTHI FASHION* 🛍️\n\n` +
    `*Order ID:* ${order.orderNumber}\n` +
    `*Customer Name:* ${order.address.fullName}\n` +
    `*Phone:* ${order.address.phone}\n` +
    `*Delivery Address:* ${order.address.street}, ${order.address.area}, ${order.address.city} - ${order.address.pincode}\n` +
    `*Payment Mode:* ${order.paymentMethod}\n\n` +
    `*Items Ordered:*\n${itemsText}\n\n` +
    `*Items Subtotal:* ₹${order.subtotal.toLocaleString('en-IN')}\n` +
    `*Shipping Cost:* ₹${order.shippingFee}\n` +
    `*Total Bill:* ₹${order.total.toLocaleString('en-IN')}\n\n` +
    `Please confirm order dispatch. Thank you!`;

  return `https://wa.me/91${STORE_OWNER_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates an automated WhatsApp message link sent to customer's WhatsApp number from Shruthi Fashion
 */
export function getCustomerWhatsAppOrderUrl(order: UserOrder): string {
  const cleanPhone = (order.address?.phone || '').replace(/\D/g, '');
  const phoneFormatted = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const itemsText = order.items
    .map(
      (item, i) =>
        `  ${i + 1}. *${item.product.title}*\n     Size: ${item.selectedSize} | Qty: ${item.quantity} | ₹${(item.product.price * item.quantity).toLocaleString('en-IN')}`
    )
    .join('\n');

  const message =
    `*SHRUTHI FASHION - ORDER CONFIRMATION* 🛍️\n\n` +
    `Vanakkam *${order.address.fullName || 'Customer'}*! Thank you for placing your order with *Shruthi Fashion, Coimbatore*.\n\n` +
    `📋 *Order Information:*\n` +
    `• *Order ID:* #${order.orderNumber}\n` +
    `• *Order Date:* ${order.date}\n` +
    `• *Status:* ${order.deliveryStatus || 'Confirmed (Processing for Dispatch)'}\n` +
    (order.courierPartner ? `• *Courier Partner:* ${order.courierPartner}\n` : '') +
    `• *Tracking No:* ${order.trackingNumber || 'Assigned on Dispatch'}\n\n` +
    `👗 *Items Ordered:*\n${itemsText}\n\n` +
    `💳 *Payment Summary:*\n` +
    `• Items Subtotal: ₹${order.subtotal.toLocaleString('en-IN')}\n` +
    `• Courier Shipping: ₹${order.shippingFee}\n` +
    `• *Total Paid:* ₹${order.total.toLocaleString('en-IN')}\n` +
    `• Payment Mode: ${order.paymentMethod}\n\n` +
    `📍 *Delivery Address:* \n` +
    `${order.address.fullName}\n` +
    `${order.address.street}, ${order.address.area}\n` +
    `${order.address.city} - ${order.address.pincode}, ${order.address.state || 'Tamil Nadu'}\n` +
    `Mobile: ${order.address.phone}\n\n` +
    `🚚 *Doorstep Delivery:* Expected in 2 - 4 business days.\n\n` +
    `🏪 *Shruthi Fashion Store:*\n` +
    `Edayarpalayam Road, Kovundampalayam, Coimbatore - 641030\n` +
    `Helpline / WhatsApp: +91 9894088349\n` +
    `Email: shruthifashion01@gmail.com\n\n` +
    `_Thank you for supporting authentic handloom & festive fashion!_`;

  return `https://wa.me/${phoneFormatted}?text=${encodeURIComponent(message)}`;
}

/**
 * Open Customer WhatsApp message in new window
 */
export function openCustomerWhatsAppOrder(order: UserOrder): void {
  const url = getCustomerWhatsAppOrderUrl(order);
  window.open(url, '_blank', 'noopener,noreferrer');
}
