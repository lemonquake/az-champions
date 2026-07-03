/* ============================================================
   AZ Champions — PayPal payment verification server
   ============================================================ */
'use strict';

const express = require('express');
const fs = require('fs');

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const SECRET = process.env.PAYPAL_SECRET;
const PORT = process.env.PORT || 8787;

// Toggle this to false when you are ready to launch and accept real payments
const IS_SANDBOX = true;
const API = IS_SANDBOX ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

// Pack catalog — keep in sync with DATA.STORE in js/data.js
const PACK_PRICES = {
  dp1: 0.99, dp2: 4.99, dp3: 9.99, dp4: 19.99, dp5: 49.99, dp6: 99.99,
  buy_ivcan: 9.99, buy_lemonquake: 14.99, buy_aljay: 99.99,
  gx_void: 4.99, gx_crown: 7.99, gx_dawn: 4.99, gx_tide: 4.99,
  founder: 4.99,
};

const USED_FILE = './used-transactions.json';
const used = new Set(fs.existsSync(USED_FILE) ? JSON.parse(fs.readFileSync(USED_FILE, 'utf8')) : []);
const markUsed = txn => { used.add(txn); fs.writeFileSync(USED_FILE, JSON.stringify([...used])); };

async function paypalToken() {
  const res = await fetch(API + '/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + SECRET).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error('PayPal auth failed: ' + res.status);
  return (await res.json()).access_token;
}

/* Look up a captured payment by its transaction (capture) id */
async function lookupCapture(token, txnId) {
  const res = await fetch(`${API}/v2/payments/captures/${encodeURIComponent(txnId)}`, {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('PayPal lookup failed: ' + res.status);
  return res.json();
}

const app = express();
app.use(express.json());

// CORS for the game origin
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.post('/verify', async (req, res) => {
  try {
    const { packId, txnId } = req.body || {};
    const price = PACK_PRICES[packId];
    if (!price || !txnId) return res.json({ verified: false, reason: 'Bad request' });
    if (used.has(txnId)) return res.json({ verified: false, reason: 'Transaction already redeemed' });

    const token = await paypalToken();
    const cap = await lookupCapture(token, txnId);
    if (!cap) return res.json({ verified: false, reason: 'Transaction not found' });
    if (cap.status !== 'COMPLETED') return res.json({ verified: false, reason: 'Payment not completed' });

    const amount = parseFloat(cap.amount && cap.amount.value);
    if (!(Math.abs(amount - price) < 0.01)) {
      return res.json({ verified: false, reason: 'Amount mismatch' });
    }

    markUsed(txnId);
    console.log(`[OK] ${new Date().toISOString()} pack=${packId} txn=${txnId} $${amount}`);
    res.json({ verified: true });
  } catch (e) {
    console.error(e);
    res.json({ verified: false, reason: 'Verification error' });
  }
});

if (!CLIENT_ID || !SECRET) {
  console.error('Set PAYPAL_CLIENT_ID and PAYPAL_SECRET environment variables first.');
  process.exit(1);
}
app.listen(PORT, () => console.log(`AZ Champions verify server on :${PORT}`));
