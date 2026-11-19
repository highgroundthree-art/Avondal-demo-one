const CONFIG = {
  SHOP_NAME: 'Avondale Dirt Bike & ATV',
  SHOP_PHONE: '(480) 270-4465',
  TOKEN: 'adb-demo-2026',
  DAILY_LIMIT: 30,
  PER_ADDRESS_DAILY_LIMIT: 6,
  NOTIFY_SHOP: true,
  BLOCKED_DOMAINS: ['example.com', 'example.org', 'test.com']
};

function doGet() {
  return json_({ ok: true, service: 'ADB demo mailer', time: new Date().toISOString() });
}

function doPost(e) {
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.token !== CONFIG.TOKEN) return json_({ ok: false, error: 'unauthorized' });
    const to = String(d.to || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return json_({ ok: false, error: 'invalid email' });
    if (CONFIG.BLOCKED_DOMAINS.indexOf(to.split('@')[1]) >= 0) return json_({ ok: false, error: 'demo address' });
    if (!allow_(to)) return json_({ ok: false, error: 'limit reached' });

    let msg;
    if (d.type === 'receipt') msg = receipt_(d);
    else if (d.type === 'return') msg = returnMail_(d);
    else if (d.type === 'request') msg = requestMail_(d);
    else return json_({ ok: false, error: 'unknown type' });

    GmailApp.sendEmail(to, msg.subject, msg.text, { htmlBody: msg.html, name: CONFIG.SHOP_NAME });

    if (CONFIG.NOTIFY_SHOP) {
      const me = Session.getEffectiveUser().getEmail();
      GmailApp.sendEmail(me, msg.shopSubject, msg.text, { htmlBody: msg.html, name: CONFIG.SHOP_NAME + ' website' });
    }
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server error' });
  }
}

function receipt_(d) {
  const items = (d.items || []).slice(0, 50);
  const total = items.reduce((s, i) => s + num_(i.price) * num_(i.qty), 0);
  const first = esc_(String(d.name || '').split(' ')[0] || 'there');
  const rows = items.map(i =>
    '<tr><td style="padding:8px 0;border-bottom:1px solid #eee">' + esc_(i.name) +
    '<br><span style="color:#888;font-size:12px">' + esc_(i.sku) + ' · Qty ' + num_(i.qty) + '</span></td>' +
    '<td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">' + money_(num_(i.price) * num_(i.qty)) + '</td></tr>').join('');
  const body =
    '<p>Hi ' + first + ',</p>' +
    '<p>Thanks for your order! Here is your receipt. Your parts ship straight from our supplier to the address below, and we will email tracking once they ship.</p>' +
    '<p><b>Order ' + esc_(d.orderNo) + '</b><br><span style="color:#888">' + esc_(fmtDate_(d.date)) + '</span></p>' +
    '<table style="width:100%;border-collapse:collapse;font-size:14px">' + rows +
    '<tr><td style="padding:10px 0"><b>Total</b></td><td style="padding:10px 0;text-align:right"><b>' + money_(total) + '</b></td></tr></table>' +
    '<p><b>Payment:</b> ' + esc_(d.payment) + '</p>' +
    '<p><b>Ships to:</b><br>' + esc_(d.shipTo).replace(/\n/g, '<br>') + '</p>' +
    (d.vehicle ? '<p><b>Vehicle:</b> ' + esc_(d.vehicle) + '</p>' : '') +
    '<p>Need to return something? Use <b>Help &amp; Returns</b> on our website and give the assistant your order number.</p>';
  const text = 'Order ' + d.orderNo + '\n' + items.map(i => i.name + ' x' + num_(i.qty) + '  ' + money_(num_(i.price) * num_(i.qty))).join('\n') +
    '\nTotal ' + money_(total) + '\nShips to:\n' + d.shipTo + '\n\nDemonstration only. No payment was taken and no parts will ship.';
  return {
    subject: 'Your order ' + d.orderNo + ' from ' + CONFIG.SHOP_NAME,
    shopSubject: '[ADB-PARTS-ORDER] ' + d.orderNo + ' · ' + (d.name || '') + ' · ' + money_(total),
    html: wrap_(body),
    text: text
  };
}

function returnMail_(d) {
  const first = esc_(String(d.name || '').split(' ')[0] || 'there');
  const items = (d.items || []).slice(0, 50).map(i => '<li>' + esc_(i.name) + ' (' + esc_(i.sku) + ') ×' + num_(i.qty) + '</li>').join('');
  const steps = (d.steps || []).slice(0, 10).map(s => '<li style="margin-bottom:6px">' + esc_(s) + '</li>').join('');
  const body =
    '<p>Hi ' + first + ',</p>' +
    '<p>We received your return request. Keep this email for your records.</p>' +
    '<div style="border:2px dashed #f26a1b;border-radius:8px;padding:10px 14px;font-size:20px;letter-spacing:1px;margin:12px 0"><b>Return # ' + esc_(d.rma) + '</b></div>' +
    '<p><b>Order:</b> ' + esc_(d.orderNo) + '<br><b>Reason:</b> ' + esc_(d.reason) +
    (d.review ? '<br><b>Type:</b> Warranty review' : '') +
    '<br><b>Return label:</b> ' + (d.freeLabel ? 'Free, prepaid label on the way' : 'Return shipping comes out of your refund') + '</p>' +
    '<p><b>Parts:</b></p><ul>' + items + '</ul>' +
    '<p><b>Next steps:</b></p><ol>' + steps + '</ol>' +
    '<p style="color:#8a5a10;font-size:12px">Sample return policy. The shop sets the final terms.</p>' +
    '<p>Questions? Reply to this email or call ' + CONFIG.SHOP_PHONE + '.</p>';
  const text = 'Return ' + d.rma + ' for order ' + d.orderNo + '\nReason: ' + d.reason + '\n\nNext steps:\n' +
    (d.steps || []).map((s, i) => (i + 1) + '. ' + s).join('\n') + '\n\nDemonstration only.';
  return {
    subject: 'Return ' + d.rma + ' received · ' + CONFIG.SHOP_NAME,
    shopSubject: '[ADB-RETURN-REQ] ' + d.rma + ' · order ' + d.orderNo + ' · ' + (d.reason || ''),
    html: wrap_(body),
    text: text
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
    shopSubject: '[ADB-PART-REQUEST] ' + d.reqNo + ' · ' + String(d.part || '').slice(0, 60) + ' · ' + (d.vehicle || ''),
    html: wrap_(body),
    text: 'Part request ' + d.reqNo + '\nPart: ' + d.part + '\nVehicle: ' + d.vehicle + '\n\nDemonstration only.'
  };
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

function num_(v) { const n = Number(v); return isFinite(n) ? n : 0; }
function money_(n) { return '$' + n.toFixed(2); }
function fmtDate_(iso) { try { return Utilities.formatDate(new Date(iso), 'America/Phoenix', 'MMM d, yyyy h:mm a'); } catch (e) { return ''; } }
function esc_(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function testSendToMe() {
  const me = Session.getEffectiveUser().getEmail();
  const r = receipt_({ orderNo: 'ADB-DEMO-0001', date: new Date().toISOString(), name: 'Test Customer', shipTo: 'Test Customer\n123 Sample Trail\nAvondale, AZ 85323', payment: 'Card ending 4242 (simulated)', items: [{ name: 'Sintered front brake pads', sku: 'DEMO-1100', qty: 1, price: 34.95 }] });
  GmailApp.sendEmail(me, r.subject, r.text, { htmlBody: r.html, name: CONFIG.SHOP_NAME });
}
