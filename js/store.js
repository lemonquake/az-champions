/* ============================================================
   AZ CHAMPIONS — Store & PayPal Checkout
   ------------------------------------------------------------
   Real-money purchases are routed through PayPal "Buy Now"
   hosted checkout to DATA.STORE.paypalEmail (the merchant).

   BETA MODE: after the player completes checkout in the PayPal
   tab, they return and confirm with their PayPal Transaction ID.
   The item is granted client-side and the order is logged.

   PRODUCTION NOTE (see README.md): client-side granting is
   trustable only for beta. Before public launch, point
   VERIFY_ENDPOINT at a small server that verifies the
   transaction via PayPal's Orders/IPN API before granting.
   server/paypal-verify-example.js is included as a starting point.
   ============================================================ */
'use strict';

const Store = (() => {

  // Optional server-side verification endpoint ('' = beta client-side mode)
  const VERIFY_ENDPOINT = 'http://localhost:8787/verify';

  // Toggle this to false when you are ready to launch and accept real payments
  const IS_SANDBOX = true;

  // Replace this with your Sandbox Business Email from PayPal Developer Dashboard -> Sandbox -> Accounts
  // (It typically looks like: sb-xxxxxx@business.example.com)
  const SANDBOX_BUSINESS_EMAIL = 'sb-zdrew51876237@business.example.com';

  function paypalUrl(itemName, price, orderId) {
    // Strip quotes, parentheses, and special characters to prevent corporate WAF/Proxy blocks
    const cleanName = itemName
      .replace(/['"’‘“”—–]/g, '')
      .replace(/[^a-zA-Z0-9 -]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const merchantEmail = IS_SANDBOX ? SANDBOX_BUSINESS_EMAIL : DATA.STORE.paypalEmail;

    const params = new URLSearchParams({
      cmd: '_xclick',
      business: merchantEmail,
      item_name: `AZ Champions - ${cleanName}`,
      item_number: orderId,
      amount: price.toFixed(2),
      currency_code: DATA.STORE.paypalCurrency,
      no_shipping: '1',
      no_note: '1',
      custom: orderId,
      charset: 'utf-8',
    });
    
    const baseDomain = IS_SANDBOX ? 'www.sandbox.paypal.com' : 'www.paypal.com';
    return `https://${baseDomain}/cgi-bin/webscr?` + params.toString();
  }

  function newOrderId(packId) {
    return 'AZC-' + packId.toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
  }

  /* Open PayPal checkout in a new tab. Returns the order id. */
  function beginCheckout(itemName, price, packId) {
    const orderId = newOrderId(packId);
    const url = paypalUrl(itemName, price, orderId);
    window.open(url, '_blank', 'noopener');
    return orderId;
  }

  /* Grant the contents of a pack after (beta-)confirmed payment */
  function grantPack(packId, txn, price) {
    const S = DATA.STORE;
    let granted = null;

    const dp = S.diamondPacks.find(p => p.id === packId);
    if (dp) {
      State.grant({ diamonds: dp.diamonds + dp.bonus });
      granted = `${(dp.diamonds + dp.bonus).toLocaleString()} Diamonds`;
    }
    const cp = S.championPacks.find(p => p.id === packId);
    if (cp) {
      State.addChampion(cp.champ);
      if (!State.data.unlockedPaid.includes(cp.champ)) State.data.unlockedPaid.push(cp.champ);
      if (cp.bonusDiamonds) State.grant({ diamonds: cp.bonusDiamonds });
      granted = `${DATA.CHAMP_BY_ID[cp.champ].name} + ${cp.bonusDiamonds} Diamonds`;
    }
    const gp = S.gearPacks.find(p => p.id === packId);
    if (gp) {
      State.grantExclusiveGear(gp.gear);
      granted = gp.name;
    }
    const sp = S.specials.find(p => p.id === packId);
    if (sp) {
      State.grant({ diamonds: sp.diamonds || 0, scrolls: sp.scrolls || 0 });
      if (sp.badge && !State.data.player.badges.includes(sp.badge)) State.data.player.badges.push(sp.badge);
      granted = sp.includes;
    }

    State.recordPurchase(packId, price, txn);
    State.save();
    return granted;
  }

  /* Beta confirm flow — production should call VERIFY_ENDPOINT instead */
  async function confirmPayment(packId, price, txnId) {
    if (VERIFY_ENDPOINT) {
      try {
        const res = await fetch(VERIFY_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packId, txnId }),
        });
        const json = await res.json();
        if (!json.verified) return { ok: false, reason: json.reason || 'Payment could not be verified.' };
      } catch (e) {
        return { ok: false, reason: 'Verification server unreachable.' };
      }
    }
    const granted = grantPack(packId, txnId, price);
    return { ok: true, granted };
  }

  function findPack(packId) {
    const S = DATA.STORE;
    return S.diamondPacks.find(p => p.id === packId)
      || S.championPacks.find(p => p.id === packId)
      || S.gearPacks.find(p => p.id === packId)
      || S.specials.find(p => p.id === packId);
  }

  /* Convert a `gives` spec into a concrete grant (idle-rate math keeps
     gold/XP caches relevant at any stage — the shared-curve invariant). */
  function givesToGrant(g) {
    const rates = DATA.idleRates(State.data.campaign.maxStage);
    const grant = {};
    if (g.scrolls) grant.scrolls = g.scrolls;
    if (g.dust) grant.dust = g.dust;
    if (g.diamonds) grant.diamonds = g.diamonds;
    if (g.goldByStage) grant.gold = Math.floor(rates.goldPerMin * g.goldByStage);
    if (g.xpByStage) grant.xp = Math.floor(rates.xpPerMin * g.xpByStage);
    return grant;
  }

  /* Diamond (in-game currency) shop */
  function buyDiamondItem(itemId) {
    const item = DATA.STORE.diamondShop.find(i => i.id === itemId);
    if (!item) return { ok: false, reason: 'Unknown item' };
    if (!State.spend({ diamonds: item.costD })) return { ok: false, reason: 'Not enough Diamonds' };
    const grant = givesToGrant(item.gives);
    State.grant(grant);
    return { ok: true, grant };
  }

  /* Promo bundles — big multi-resource value packs (some once per account) */
  function buyPromo(promoId) {
    State.ensureStoreDay();
    const p = DATA.STORE.promos.find(x => x.id === promoId);
    if (!p) return { ok: false, reason: 'Unknown promo' };
    if (p.onceEver && State.data.storeState.promosBought.includes(p.id)) return { ok: false, reason: 'Already claimed — this promo is once per account' };
    if (!State.spend({ diamonds: p.costD })) return { ok: false, reason: 'Not enough Diamonds' };
    const grant = givesToGrant(p.gives);
    State.grant(grant);
    if (p.gives.chest) State.grantChest(p.gives.chest, 1);
    if (p.onceEver) State.data.storeState.promosBought.push(p.id);
    State.save();
    return { ok: true, grant, chest: p.gives.chest };
  }

  /* Daily flash deals — 3 rotate in each day, one purchase each */
  function buyDeal(dealId) {
    State.ensureStoreDay();
    const deal = DATA.STORE.dealsOfDay(State.dayKey()).find(x => x.id === dealId);
    if (!deal) return { ok: false, reason: 'That deal has expired' };
    if (State.data.storeState.dealsBought.includes(dealId)) return { ok: false, reason: 'Deal already claimed today — fresh deals tomorrow!' };
    if (!State.spend({ diamonds: deal.costD })) return { ok: false, reason: 'Not enough Diamonds' };
    State.data.storeState.dealsBought.push(dealId);
    const grant = givesToGrant(deal.gives);
    State.grant(grant);
    if (deal.gives.chest) State.grantChest(deal.gives.chest, 1);
    State.save();
    return { ok: true, grant, chest: deal.gives.chest };
  }

  /* Free daily gift — the Store pays you to visit */
  function claimFreeGift() {
    State.ensureStoreDay();
    if (State.data.storeState.giftClaimed) return { ok: false, reason: 'Already claimed — come back tomorrow!' };
    State.data.storeState.giftClaimed = true;
    const grant = givesToGrant(DATA.STORE.freeGift.gives);
    State.grant(grant);
    State.save();
    return { ok: true, grant };
  }

  return { beginCheckout, confirmPayment, findPack, buyDiamondItem, buyPromo, buyDeal, claimFreeGift, paypalUrl };
})();
