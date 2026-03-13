// Vercel Serverless Function: Stripe Webhook
// Handles checkout.session.completed → sends email with download link via Resend
// Deploy: Vercel auto-detects /api/*.js as serverless functions

const { Resend } = require('resend');
const stripe = require('stripe');

// Product catalog: Stripe price_id → product info
// TODO: Replace these price IDs with your actual Stripe Price IDs from the dashboard
const PRODUCTS = {
  'price_setup_guide': {
    name: 'OpenClaw Setup Guide (Traditional Chinese)',
    nameZh: 'OpenClaw 設定指南（繁體中文）',
    downloadUrl: 'https://openclawhk.io/downloads/openclaw-setup-guide-tc.pdf',
  },
  'price_persona_pack': {
    name: 'Eve Persona Pack',
    nameZh: 'Eve Persona Pack',
    downloadUrl: 'https://openclawhk.io/downloads/eve-persona-pack.zip',
  },
  'price_ecommerce_skill_pack': {
    name: 'E-commerce Skill Pack',
    nameZh: '電商 Skill Pack',
    downloadUrl: 'https://openclawhk.io/downloads/ecommerce-skill-pack.zip',
  },
  'price_content_marketing_skill_pack': {
    name: 'Content Marketing Skill Pack',
    nameZh: '內容行銷 Skill Pack',
    downloadUrl: 'https://openclawhk.io/downloads/content-marketing-skill-pack.zip',
  },
  'price_customer_service_skill_pack': {
    name: 'Content Marketing Skill Pack',
    nameZh: '內容行銷 Skill Pack',
    downloadUrl: 'https://openclawhk.io/downloads/content-marketing-skill-pack.zip',
  },
  'price_customer_service_skill_pack': {
    name: 'Customer Service Skill Pack',
    nameZh: '客服 Skill Pack',
    downloadUrl: 'https://openclawhk.io/downloads/customer-service-skill-pack.zip',
  },
};

// Fallback: also match by product name if price ID not found
function findProductByLineItems(lineItems) {
  if (!lineItems || !lineItems.data) return null;
  for (const item of lineItems.data) {
    const priceId = item.price?.id;
    if (priceId && PRODUCTS[priceId]) return PRODUCTS[priceId];
    // Fallback: match by product name substring
    const productName = (item.description || item.price?.product?.name || '').toLowerCase();
    if (productName.includes('setup guide') || productName.includes('openclaw')) return PRODUCTS['price_setup_guide'];
    if (productName.includes('persona')) return PRODUCTS['price_persona_pack'];
    if (productName.includes('ecommerce') || productName.includes('e-commerce')) return PRODUCTS['price_ecommerce_skill_pack'];
    if (productName.includes('content marketing')) return PRODUCTS['price_content_marketing_skill_pack'];
    if (productName.includes('customer service') || productName.includes('客服')) return PRODUCTS['price_customer_service_skill_pack'];
  }
  return null;
}

async function sendThankYouEmail(resend, customerEmail, customerName, product) {
  const firstName = customerName ? customerName.split(' ')[0] : '你';

  const { data, error } = await resend.emails.send({
    from: 'Eve AI Products <orders@openclawhk.io>',
    to: customerEmail,
    subject: `✅ 你的 ${product.nameZh} 已準備好下載`,
    html: `
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>感謝購買</title>
</head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans TC',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:12px;border:1px solid rgba(59,130,246,0.2);overflow:hidden;max-width:600px;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a5f,#1a2332);padding:32px;text-align:center;border-bottom:1px solid rgba(59,130,246,0.2);">
              <p style="margin:0;font-size:14px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;">Eve AI Products</p>
              <h1 style="margin:8px 0 0;font-size:26px;color:#f8fafc;">感謝你的購買！</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#f8fafc;font-size:16px;">嗨 ${firstName}，</p>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.7;">
                你的 <strong style="color:#60a5fa;">${product.nameZh}</strong> 已準備好，立即點擊下面按鈕下載。
              </p>
              <!-- Download Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="${product.downloadUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#fff;font-size:16px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
                      ⬇️ 立即下載
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a2332;border-radius:8px;border:1px solid rgba(59,130,246,0.15);">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;">購買詳情</p>
                    <p style="margin:0;color:#f8fafc;font-size:15px;">📦 ${product.nameZh}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.6;">
                如有問題，請回覆此電郵或聯絡我們。<br>
                下載連結長期有效。
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(59,130,246,0.1);text-align:center;">
              <p style="margin:0;color:#475569;font-size:12px;">
                © 2026 Eve AI Products · <a href="https://openclawhk.io" style="color:#3b82f6;text-decoration:none;">openclawhk.io</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });

  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);
  return data;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
  const resend = new Resend(process.env.RESEND_API_KEY);

  let event;

  // Verify Stripe webhook signature
  try {
    const rawBody = await getRawBody(req);
    event = stripeClient.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Only handle checkout.session.completed
  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true, skipped: true });
  }

  const session = event.data.object;
  const customerEmail = session.customer_details?.email || session.customer_email;
  const customerName = session.customer_details?.name || '';

  if (!customerEmail) {
    console.error('No customer email in session:', session.id);
    return res.status(200).json({ received: true, error: 'No customer email' });
  }

  // Fetch line items to identify product
  let product = null;
  try {
    const lineItems = await stripeClient.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'],
    });
    product = findProductByLineItems(lineItems);
  } catch (err) {
    console.error('Failed to fetch line items:', err.message);
  }

  // Fallback: use metadata if set in Stripe payment link/product
  if (!product && session.metadata?.product_id) {
    product = PRODUCTS[session.metadata.product_id] || null;
  }

  if (!product) {
    console.warn('Unknown product for session:', session.id);
    // Still send a generic thank-you without download link
    product = {
      name: 'Your Purchase',
      nameZh: '你的產品',
      downloadUrl: 'https://openclawhk.io/download.html',
    };
  }

  try {
    await sendThankYouEmail(resend, customerEmail, customerName, product);
    console.log(`Email sent to ${customerEmail} for product: ${product.name}`);
  } catch (err) {
    console.error('Failed to send email:', err.message);
    // Return 200 to Stripe so it doesn't retry — log and handle separately
    return res.status(200).json({ received: true, emailError: err.message });
  }

  return res.status(200).json({ received: true, emailSent: true });
}

// Helper: get raw request body for Stripe signature verification
// Vercel does not expose raw body by default — use the config export below
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => resolve(Buffer.from(data)));
    req.on('error', reject);
  });
}

// IMPORTANT: Disable Vercel's default body parser so we can verify Stripe signatures
export const config = {
  api: {
    bodyParser: false,
  },
};
