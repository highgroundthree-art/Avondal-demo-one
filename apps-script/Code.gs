const CONFIG = {
  SHOP_NAME: 'Avondale Dirt Bike & ATV',
  SHOP_PHONE: '(480) 270-4465',
  SHOP_INBOX: 'parts@avondaledirtbikeatv.com',
  SERVICE_INBOX: 'service@avondaledirtbikeatv.com',
  SUPPLIER: 'J&M ATV/UTV Supply (jmatv.com)',
  TOKEN: 'adb-demo-2026',
  DAILY_LIMIT: 40,
  PER_ADDRESS_DAILY_LIMIT: 8,
  BLOCKED_DOMAINS: ['example.com', 'example.org', 'test.com']
};

function doGet() {
  return json_({ ok: true, service: 'ADB demo mailer', time: new Date().toISOString() });
}

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.token !== CONFIG.TOKEN) return json_({ ok: false, error: 'unauthorized' });

    if (d.type === 'shoporder') {
      if (!allow_(CONFIG.SHOP_INBOX)) return json_({ ok: false, error: 'limit reached' });
      const t = shopOrderTicket_(d);
      GmailApp.sendEmail(CONFIG.SHOP_INBOX, t.subject, t.text, { htmlBody: t.html, name: CONFIG.SHOP_NAME + ' website' });
      return json_({ ok: true });
    }

    const to = String(d.to || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return json_({ ok: false, error: 'invalid email' });
    if (CONFIG.BLOCKED_DOMAINS.indexOf(to.split('@')[1]) >= 0) return json_({ ok: false, error: 'demo address' });
    if (!allow_(to)) return json_({ ok: false, error: 'limit reached' });

    let customer, ticket;
    if (d.type === 'receipt') { customer = receipt_(d); ticket = orderTicket_(d); }
    else if (d.type === 'return') { customer = returnMail_(d); ticket = returnTicket_(d); }
    else if (d.type === 'request') { customer = requestMail_(d); ticket = requestTicket_(d); }
    else return json_({ ok: false, error: 'unknown type' });

    GmailApp.sendEmail(to, customer.subject, customer.text, { htmlBody: customer.html, name: CONFIG.SHOP_NAME, replyTo: CONFIG.SHOP_INBOX });
    GmailApp.sendEmail(CONFIG.SHOP_INBOX, ticket.subject, ticket.text, { htmlBody: ticket.html, name: CONFIG.SHOP_NAME + ' website', replyTo: to });
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server error' });
  }
}

/* ===================== CUSTOMER EMAILS ===================== */

function receipt_(d) {
  const items = list_(d.items);
  const total = sum_(items);
  const rows = items.map(i =>
    '<tr><td style="padding:8px 0;border-bottom:1px solid #eee">' + esc_(i.name) +
    '<br><span style="color:#888;font-size:12px">' + esc_(i.sku) + ' · Qty ' + num_(i.qty) + '</span></td>' +
    '<td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">' + money_(num_(i.price) * num_(i.qty)) + '</td></tr>').join('');
  const body =
    '<p>Hi ' + first_(d.name) + ',</p>' +
    '<p>Thanks for your order! Here is your receipt. ' + (d.shipMode === 'pickup' ? 'Your parts ship to our shop, and we will contact you as soon as they arrive.' : 'Your parts ship straight from our supplier to the address below, and we will email tracking once they ship.') + '</p>' +
    '<p><b>Order ' + esc_(d.orderNo) + '</b><br><span style="color:#888">' + esc_(fmtDate_(d.date)) + '</span></p>' +
    '<table style="width:100%;border-collapse:collapse;font-size:14px">' + rows +
    '<tr><td style="padding:10px 0"><b>Total</b></td><td style="padding:10px 0;text-align:right"><b>' + money_(total) + '</b></td></tr></table>' +
    '<p><b>Payment:</b> ' + esc_(d.payment) + '</p>' +
    '<p><b>Ships to:</b><br>' + br_(d.shipTo) + '</p>' +
    (d.vehicle ? '<p><b>Vehicle:</b> ' + esc_(d.vehicle) + '</p>' : '') +
    '<p>Need to return something? Use <b>Help &amp; Returns</b> on our website and give the assistant your order number. Questions? Just reply to this email.</p>';
  return {
    subject: 'Your order ' + d.orderNo + ' from ' + CONFIG.SHOP_NAME,
    html: wrap_(body),
    text: 'Order ' + d.orderNo + '\n' + items.map(i => i.name + ' x' + num_(i.qty) + '  ' + money_(num_(i.price) * num_(i.qty))).join('\n') +
      '\nTotal ' + money_(total) + '\nShips to:\n' + d.shipTo + '\n\nDemonstration only. No payment was taken and no parts will ship.'
  };
}

function returnMail_(d) {
  const items = list_(d.items).map(i => '<li>' + esc_(i.name) + ' (' + esc_(i.sku) + ') ×' + num_(i.qty) + '</li>').join('');
  const steps = list_(d.steps).map(s => '<li style="margin-bottom:6px">' + esc_(s) + '</li>').join('');
  const body =
    '<p>Hi ' + first_(d.name) + ',</p>' +
    '<p>We received your return request. Keep this email for your records.</p>' +
    '<div style="border:2px dashed #f26a1b;border-radius:8px;padding:10px 14px;font-size:20px;letter-spacing:1px;margin:12px 0"><b>Return # ' + esc_(d.rma) + '</b></div>' +
    '<p><b>Order:</b> ' + esc_(d.orderNo) + '<br><b>Reason:</b> ' + esc_(d.reason) +
    (d.review ? '<br><b>Type:</b> Warranty review' : '') +
    '<br><b>Return label:</b> ' + (d.freeLabel ? 'Free, prepaid label on the way' : 'Return shipping comes out of your refund') + '</p>' +
    '<p><b>Parts:</b></p><ul>' + items + '</ul>' +
    '<p><b>Next steps:</b></p><ol>' + steps + '</ol>' +
    '<p style="color:#8a5a10;font-size:12px">Sample return policy. The shop sets the final terms.</p>' +
    '<p>Questions? Reply to this email or call ' + CONFIG.SHOP_PHONE + '.</p>';
  return {
    subject: 'Return ' + d.rma + ' received · ' + CONFIG.SHOP_NAME,
    html: wrap_(body),
    text: 'Return ' + d.rma + ' for order ' + d.orderNo + '\nReason: ' + d.reason + '\n\nNext steps:\n' +
      list_(d.steps).map((s, i) => (i + 1) + '. ' + s).join('\n') + '\n\nDemonstration only.'
  };
}

function requestMail_(d) {
  const body =
    '<p>Thanks for your part request! Here is a copy for your records.</p>' +
    '<p><b>Request #:</b> ' + esc_(d.reqNo) + '<br><b>Part:</b> ' + esc_(d.part) + '<br><b>Vehicle:</b> ' + esc_(d.vehicle) + '</p>' +
    '<p>The shop will check price and availability and email you back. If you go ahead, we will set it up so you can order and pay online.</p>' +
    '<p>Questions? Reply to this email or call ' + CONFIG.SHOP_PHONE + '.</p>';
  return {
    subject: 'Part request ' + d.reqNo + ' received · ' + CONFIG.SHOP_NAME,
    html: wrap_(body),
    text: 'Part request ' + d.reqNo + '\nPart: ' + d.part + '\nVehicle: ' + d.vehicle + '\n\nDemonstration only.'
  };
}

/* ===================== OWNER TICKETS (to SHOP_INBOX) ===================== */

function orderTicket_(d) {
  const items = list_(d.items);
  const total = sum_(items);
  const needsFit = items.some(i => /CHECK/.test(String(i.fit)));
  const pickup = d.shipMode === 'pickup';
  const install = pickup && d.pickupOpt === 'install';
  const html = ticket_('NEW ONLINE PARTS ORDER', pickup ? 'Customer order · ship to SHOP (' + (install ? 'shop installs' : 'customer pickup') + ')' : 'Customer order · drop-ship to customer', d.orderNo, d.date, [
    ['Customer', esc_(d.name)],
    ['Email', esc_(d.to)],
    ['Phone', esc_(d.phone || 'not given')],
    [pickup ? 'Ship to' : 'Ship to (drop-ship)', pickup ? '<b>THE SHOP</b> · ' + (install ? 'install for customer' : 'customer pickup') : br_(d.shipTo)],
    ['Vehicle', esc_(d.vehicle || 'not given')],
    ['VIN / frame #', esc_(d.vin || 'not given')],
    ['Customer notes', esc_(d.notes || 'none')],
    ['Paid', money_(total) + ' · ' + esc_(d.payment)],
    ['Promos', (d.freeShip ? 'FREE SHIPPING (order over $175, items under 10 lb)' : 'Shipping charged') + (d.gift ? ' · FREE foam filter oil (order over $250)' : '')],
    ['Fitment', d.ownFit ? 'Customer confirmed the parts fit their machine (their responsibility)' : 'Not confirmed by customer']
  ], itemTable_(items, true), [
    d.gift ? 'Add the free foam filter oil (UFF100) to the supplier order' : 'Review the parts and the vehicle above',
    pickup ? 'Place the order with ' + CONFIG.SUPPLIER + ' and ship it to the SHOP' : 'Place the order with ' + CONFIG.SUPPLIER + ' and ship it to the CUSTOMER address above',
    'Write the J&M order # here: ______________________',
    pickup ? 'When it arrives, call or text the customer: ' + esc_(d.phone || 'see email') : 'When J&M ships, write the tracking # here: ______________________',
    install ? 'Quote and schedule the install labor' : 'Hit REPLY. It goes straight to the customer' + (pickup ? '' : '. Paste in the tracking #')
  ]);
  return {
    subject: '[ADB-PARTS-ORDER] ' + d.orderNo + ' · ' + (d.name || '') + ' · ' + money_(total) + (pickup ? ' · SHIP TO SHOP' : '') + (needsFit ? ' · FITMENT CHECK' : ''),
    html: html,
    text: 'NEW ONLINE PARTS ORDER ' + d.orderNo + '\nCustomer: ' + d.name + ' <' + d.to + '>\nShip to:\n' + d.shipTo + '\nVehicle: ' + (d.vehicle || '') +
      '\n\n' + items.map(i => i.qty + ' x ' + i.name + ' (' + i.sku + ') ' + i.fit).join('\n') + '\nTotal ' + money_(total)
  };
}

function shopOrderTicket_(d) {
  const items = list_(d.items);
  const total = sum_(items);
  const html = ticket_('SHOP PARTS ORDER', 'Mechanic order · drop-ship to the workshop', d.orderNo, d.date, [
    ['Work order #', esc_(d.wo)],
    ['Technician', esc_(d.tech)],
    ['Customer on ticket', esc_(d.cust || 'not given')],
    ['Needed by', esc_(d.needBy || 'not given')],
    ['Vehicle', esc_(d.vehicle || 'not given')],
    ['VIN / frame #', esc_(d.vin || 'not given')],
    ['Notes', esc_(d.notes || 'none')],
    ['Ship to', 'WORKSHOP']
  ], itemTable_(items, true), [
    'Approve the parts for work order #' + esc_(d.wo),
    'Place the order with ' + CONFIG.SUPPLIER + ' and ship it to the WORKSHOP',
    'Write the J&M order # here: ______________________',
    'Expected arrival: ______________________',
    'Add the parts cost to the customer\'s repair ticket'
  ]);
  return {
    subject: '[ADB-SHOP-ORDER] ' + d.orderNo + ' · WO ' + (d.wo || '') + ' · ' + (d.tech || '') + ' · ' + money_(total),
    html: html,
    text: 'SHOP PARTS ORDER ' + d.orderNo + '\nWO: ' + d.wo + '\nTech: ' + d.tech + '\n' + items.map(i => i.qty + ' x ' + i.name + ' (' + i.sku + ')').join('\n')
  };
}

function returnTicket_(d) {
  const items = list_(d.items);
  const html = ticket_('RETURN REQUEST', d.review ? 'Warranty review' : 'Return', d.rma, new Date().toISOString(), [
    ['Original order', esc_(d.orderNo)],
    ['Customer', esc_(d.name)],
    ['Email', esc_(d.to)],
    ['Phone', esc_(d.phone || 'not given')],
    ['Vehicle', esc_(d.vehicle || 'not given')],
    ['Reason', esc_(d.reason)],
    ['Damage photo', d.photo ? 'Customer attached one in the chat (not included in the demo)' : 'none'],
    ['Return label', d.freeLabel ? 'FREE: shop or supplier pays' : 'Deduct return shipping from the refund']
  ], itemTable_(items, false), [
    'Approve or deny under the shop\'s return policy',
    d.review ? 'Start the warranty claim with ' + CONFIG.SUPPLIER : 'Ask ' + CONFIG.SUPPLIER + ' for a return authorization',
    'Email the customer the return label (hit REPLY)',
    'When the part comes back, inspect it: ☐ OK  ☐ Damaged  ☐ Installed',
    'Issue the refund: $__________  Date: __________'
  ]);
  return {
    subject: '[ADB-RETURN-REQ] ' + d.rma + ' · order ' + d.orderNo + ' · ' + (d.reason || '') + ' · ' + (d.name || ''),
    html: html,
    text: 'RETURN ' + d.rma + '\nOrder ' + d.orderNo + '\nCustomer ' + d.name + ' <' + d.to + '>\nReason: ' + d.reason
  };
}

function requestTicket_(d) {
  const html = ticket_('PART REQUEST', 'Not in the online catalog · customer wants a quote', d.reqNo, new Date().toISOString(), [
    ['Customer email', esc_(d.to)],
    ['Part wanted', esc_(d.part)],
    ['Vehicle', esc_(d.vehicle || 'not given')]
  ], '', [
    'Look it up at ' + CONFIG.SUPPLIER,
    'Cost: $__________   Your price: $__________   Available? ☐ Yes ☐ No',
    'Hit REPLY with the price and availability. It goes straight to the customer',
    'If the customer says yes, add the part to the online store or send a payment link'
  ]);
  return {
    subject: '[ADB-PART-REQUEST] ' + d.reqNo + ' · ' + String(d.part || '').slice(0, 60) + ' · ' + (d.vehicle || ''),
    html: html,
    text: 'PART REQUEST ' + d.reqNo + '\nFrom: ' + d.to + '\nPart: ' + d.part + '\nVehicle: ' + d.vehicle
  };
}

/* ===================== LAYOUT HELPERS ===================== */

function ticket_(title, sub, number, date, fields, itemsHtml, checklist) {
  const rows = fields.map(f =>
    '<tr><td style="padding:6px 10px;border:1px solid #ccc;background:#f4f1ea;width:34%;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;vertical-align:top">' + f[0] +
    '</td><td style="padding:6px 10px;border:1px solid #ccc;font-size:14px">' + f[1] + '</td></tr>').join('');
  const checks = checklist.map(c =>
    '<tr><td style="width:28px;padding:8px 0;vertical-align:top;font-size:18px">☐</td><td style="padding:8px 0;border-bottom:1px dotted #bbb;font-size:14px">' + c + '</td></tr>').join('');
  return '<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#111;border:2px solid #111">' +
    '<div style="background:#111;color:#fff;padding:12px 16px"><div style="font-size:12px;letter-spacing:2px;color:#f26a1b;font-weight:bold">' + esc_(CONFIG.SHOP_NAME).toUpperCase() + '</div>' +
    '<div style="font-size:22px;font-weight:bold;letter-spacing:1px">' + title + '</div><div style="font-size:13px;color:#ccc">' + esc_(sub) + '</div></div>' +
    '<div style="padding:10px 16px;border-bottom:2px solid #111;font-size:14px"><b style="font-size:18px">#' + esc_(number) + '</b> &nbsp;·&nbsp; ' + esc_(fmtDate_(date)) + '</div>' +
    '<div style="padding:14px 16px"><table style="width:100%;border-collapse:collapse">' + rows + '</table>' +
    (itemsHtml ? '<div style="margin-top:14px;font-size:12px;font-weight:bold;letter-spacing:1px">PARTS</div>' + itemsHtml : '') +
    '<div style="margin-top:16px;font-size:12px;font-weight:bold;letter-spacing:1px">TO DO</div><table style="width:100%;border-collapse:collapse">' + checks + '</table>' +
    '<div style="margin-top:16px;font-size:12px;color:#666">Print this email, or keep it in your inbox and archive it when every box is checked. Demonstration only: no payment was taken.</div></div></div>';
}

function itemTable_(items, withPrice) {
  const head = '<tr style="background:#f4f1ea"><th style="text-align:left;padding:6px;border:1px solid #ccc;font-size:12px">QTY</th><th style="text-align:left;padding:6px;border:1px solid #ccc;font-size:12px">PART</th><th style="text-align:left;padding:6px;border:1px solid #ccc;font-size:12px">FITMENT</th>' +
    (withPrice ? '<th style="text-align:right;padding:6px;border:1px solid #ccc;font-size:12px">PRICE</th>' : '') + '</tr>';
  const rows = items.map(i => {
    const flag = /CHECK/.test(String(i.fit));
    return '<tr><td style="padding:6px;border:1px solid #ccc;font-size:14px;font-weight:bold">' + num_(i.qty) + '</td>' +
      '<td style="padding:6px;border:1px solid #ccc;font-size:14px">' + esc_(i.name) + '<br><span style="color:#777;font-size:12px">' + esc_(i.sku) + '</span></td>' +
      '<td style="padding:6px;border:1px solid #ccc;font-size:12px;' + (flag ? 'color:#b42318;font-weight:bold' : 'color:#17653a') + '">' + esc_(i.fit || '') + '</td>' +
      (withPrice ? '<td style="padding:6px;border:1px solid #ccc;font-size:14px;text-align:right">' + money_(num_(i.price) * num_(i.qty)) + '</td>' : '') + '</tr>';
  }).join('');
  return '<table style="width:100%;border-collapse:collapse;margin-top:6px">' + head + rows + '</table>';
}

function wrap_(inner) {
  return '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1c1e21;font-size:14.5px;line-height:1.5">' +
    '<div style="background:#16181b;color:#fff;padding:16px 20px;border-bottom:4px solid #f26a1b;font-size:20px;font-weight:bold;letter-spacing:1px;text-transform:uppercase">' +
    esc_(CONFIG.SHOP_NAME) + '</div><div style="padding:18px 20px;background:#fff">' + inner + '</div>' +
    '<div style="background:#fff3c4;color:#5b4500;padding:10px 20px;font-size:12px">Demonstration only. No payment was taken and no parts will ship.</div></div>';
}

function allow_(to) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties();
    const day = Utilities.formatDate(new Date(), 'America/Phoenix', 'yyyy-MM-dd');
    const totalKey = 'n_' + day;
    const addrKey = 'a_' + day + '_' + Utilities.base64EncodeWebSafe(to);
    const total = Number(props.getProperty(totalKey) || 0);
    const perAddr = Number(props.getProperty(addrKey) || 0);
    if (total >= CONFIG.DAILY_LIMIT || perAddr >= CONFIG.PER_ADDRESS_DAILY_LIMIT) return false;
    props.setProperty(totalKey, String(total + 1));
    props.setProperty(addrKey, String(perAddr + 1));
    return true;
  } finally {
    lock.releaseLock();
  }
}

function list_(a) { return Array.isArray(a) ? a.slice(0, 50) : []; }
function sum_(items) { return items.reduce((s, i) => s + num_(i.price) * num_(i.qty), 0); }
function first_(name) { return esc_(String(name || '').split(' ')[0] || 'there'); }
function br_(s) { return esc_(s).replace(/\n/g, '<br>'); }
function num_(v) { const n = Number(v); return isFinite(n) ? n : 0; }
function money_(n) { return '$' + n.toFixed(2); }
function fmtDate_(iso) { try { return Utilities.formatDate(new Date(iso), 'America/Phoenix', 'MMM d, yyyy h:mm a'); } catch (e) { return ''; } }
function esc_(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function testSendToMe() {
  const me = Session.getEffectiveUser().getEmail();
  const d = { to: me, orderNo: 'ADB-DEMO-0001', date: new Date().toISOString(), name: 'Test Customer', phone: '', vehicle: '1981 Honda CR250R', vin: '', notes: 'Test order',
    shipTo: 'Test Customer\n123 Sample Trail\nAvondale, AZ 85323', payment: 'Card ending 4242 (simulated)',
    items: [{ name: 'Sintered front brake pads', sku: 'DEMO-1100', qty: 1, price: 34.95, fit: 'FITMENT CHECK REQUIRED' }, { name: 'Chain lube, 6 oz', sku: 'DEMO-1296', qty: 2, price: 11.95, fit: 'Universal / multi-fit' }] };
  const c = receipt_(d), t = orderTicket_(d);
  GmailApp.sendEmail(me, c.subject, c.text, { htmlBody: c.html, name: CONFIG.SHOP_NAME });
  GmailApp.sendEmail(me, '(TEST) ' + t.subject, t.text, { htmlBody: t.html, name: CONFIG.SHOP_NAME + ' website' });
}
