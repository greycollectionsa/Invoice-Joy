/*
 * script.js - Invoice Joy
 * Full implementation replacing the stub.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
// Rand formatting follows the convention already in use on IDJOY's quote
// documents (R3,309.50): comma thousands, full stop decimal. Intl's en-ZA
// locale renders "R 3 309,50" instead, which would not match the invoices
// this business already has in the field.
var zarFmt = {
  format: function (n) {
    var v = Number(n);
    if (!isFinite(v)) v = 0;
    return 'R' + v.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
};

function formatZAR(n) {
  return zarFmt.format(isFinite(n) ? n : 0);
}

function safeNum(v) {
  var n = parseFloat(v);
  return (isFinite(n) && n >= 0) ? n : 0;
}

function animateValue(el, fromVal, toVal, duration) {
  if (typeof Easings === 'undefined') {
    el.textContent = formatZAR(toVal);
    return;
  }
  Easings.animate(el, {
    ease: 'easeOutExpo',
    duration: duration || 500,
    apply: function(v) {
      el.textContent = formatZAR(fromVal + (toVal - fromVal) * v);
    }
  });
}

// Per-element last value tracking for totals animation
var _lastTotalsValues = {};

function animateTotalsCell(el, toVal) {
  var key = el.dataset.key || '';
  var fromVal = _lastTotalsValues[key] !== undefined ? _lastTotalsValues[key] : toVal;
  _lastTotalsValues[key] = toVal;
  if (Math.abs(toVal - fromVal) < 0.001) {
    el.textContent = formatZAR(toVal);
    return;
  }
  animateValue(el, fromVal, toVal, 500);
}

// ---------------------------------------------------------------------------
// Date
// ---------------------------------------------------------------------------
(function setCurrentDate() {
  var el = document.getElementById('currentDate');
  if (!el) return;
  if (!el.textContent.trim()) {
    var now = new Date();
    el.textContent = now.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
  }
})();

// ---------------------------------------------------------------------------
// Services data  (50GB - canonical wording)
// ---------------------------------------------------------------------------
var services = [
  { name: 'Logo Design', cost: 400.00, duration: 4 },
  { name: 'Business Card Design', cost: 300.00, duration: 3 },
  { name: 'Letterhead Design', cost: 300.00, duration: 2 },
  { name: 'Email Signature Design', cost: 300.00, duration: 1 },
  { name: 'Company Profile Design (5-10 pages)', cost: 700.00, duration: 4 },
  { name: 'Brand Mock-ups', cost: 300.00, duration: 2 },
  { name: 'Flyer/Poster Design', cost: 300.00, duration: 3 },
  { name: 'Marketing Brochure', cost: 300.00, duration: 3 },
  { name: 'Website Design & Development', cost: 3500.00, duration: 10 },
  { name: 'Website Hosting (12 months)', cost: 2499.00, duration: 1 },
  { name: 'Professional Business Email (5 mailboxes included, 50GB, mobile sync, Docs, Sheets & Presentations, Premium Email Delivery, 12 months)', cost: 1609.50, duration: 1 },
  { name: 'Excel Quotation/Invoice Template Design', cost: 400.00, duration: 2 },
  { name: 'Custom Lead Generation Form (automated email notification on submission)', cost: 1200.00, duration: 1 },
  { name: 'Domain Registration and configuration (12 months)', cost: 715.33, duration: 1 },
  { name: 'Brand Guidelines', cost: 1650.00, duration: 7 },
  { name: 'LinkedIn Header', cost: 300.00, duration: 3 },
  { name: 'Social Media Profile Picture Design', cost: 200.00, duration: 2 },
  { name: 'Content Copy', cost: 600.00, duration: 5 }
];

var serviceRegistry = new Map();
services.forEach(function(s) { serviceRegistry.set(s.name, s); });

// ---------------------------------------------------------------------------
// Packages  (50GB - matches services array exactly)
// ---------------------------------------------------------------------------
var packages = {
  essential: [
    { name: 'Logo Design', cost: 400.00, duration: 4 },
    { name: 'Business Card Design', cost: 300.00, duration: 3 },
    { name: 'Letterhead Design', cost: 300.00, duration: 2 },
    { name: 'Email Signature Design', cost: 300.00, duration: 1 },
    { name: 'Excel Quotation/Invoice Template Design', cost: 400.00, duration: 2 },
    { name: 'Professional Business Email (5 mailboxes included, 50GB, mobile sync, Docs, Sheets & Presentations, Premium Email Delivery, 12 months)', cost: 1609.50, duration: 1 }
  ],
  standard: [
    { name: 'Logo Design', cost: 400.00, duration: 4 },
    { name: 'Business Card Design', cost: 300.00, duration: 3 },
    { name: 'Letterhead Design', cost: 300.00, duration: 2 },
    { name: 'Email Signature Design', cost: 300.00, duration: 1 },
    { name: 'Company Profile Design (5-10 pages)', cost: 700.00, duration: 4 },
    { name: 'Excel Quotation/Invoice Template Design', cost: 400.00, duration: 2 },
    { name: 'Professional Business Email (5 mailboxes included, 50GB, mobile sync, Docs, Sheets & Presentations, Premium Email Delivery, 12 months)', cost: 1609.50, duration: 1 }
  ],
  professional: [
    { name: 'Logo Design', cost: 400.00, duration: 4 },
    { name: 'Business Card Design', cost: 300.00, duration: 3 },
    { name: 'Letterhead Design', cost: 300.00, duration: 2 },
    { name: 'Email Signature Design', cost: 300.00, duration: 1 },
    { name: 'Company Profile Design (5-10 pages)', cost: 700.00, duration: 4 },
    { name: 'Excel Quotation/Invoice Template Design', cost: 400.00, duration: 2 },
    { name: 'Website Design & Development', cost: 3500.00, duration: 10 },
    { name: 'Website Hosting (12 months)', cost: 2499.00, duration: 1 },
    { name: 'Custom Lead Generation Form (automated email notification on submission)', cost: 1200.00, duration: 1 }
  ]
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
var showDeposit = true;   // toggle between deposit and subtotal-only view
var activePackage = null; // currently selected package key

// ---------------------------------------------------------------------------
// JSON persistence helpers
// ---------------------------------------------------------------------------
var SERVER_BASE = (function() {
  if (typeof location !== 'undefined' && location.protocol !== 'file:') {
    return location.origin;
  }
  return null;
})();

function fetchJSON(path, fallbackKey) {
  if (!SERVER_BASE) {
    return Promise.resolve(JSON.parse(localStorage.getItem(fallbackKey) || 'null'));
  }
  return fetch(SERVER_BASE + path)
    .then(function(r) { return r.json(); })
    .catch(function() {
      return JSON.parse(localStorage.getItem(fallbackKey) || 'null');
    });
}

function postJSON(path, data, fallbackKey) {
  localStorage.setItem(fallbackKey, JSON.stringify(data));
  if (!SERVER_BASE) return Promise.resolve(data);
  return fetch(SERVER_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(function(r) { return r.json(); })
    .catch(function() { return data; });
}

// ---------------------------------------------------------------------------
// Row management
// ---------------------------------------------------------------------------
var tbody = document.querySelector('#invoiceTable tbody');

function buildServiceOptions(selectedName) {
  var html = '<option value="">-- Select service --</option>';
  services.forEach(function(s) {
    var sel = (s.name === selectedName) ? ' selected' : '';
    html += '<option value="' + escHtml(s.name) + '"' + sel + '>' + escHtml(s.name) + '</option>';
  });
  html += '<option value="__custom__"' + (selectedName === '__custom__' ? ' selected' : '') + '>Custom item</option>';
  return html;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function addRow(itemData) {
  // itemData: optional { name, cost, duration, qty }
  if (!tbody) return null;
  var tr = document.createElement('tr');
  tr.style.opacity = '0';
  tr.style.transform = 'translateY(-12px)';

  var isCustom = itemData && itemData.isCustom;
  var selectedName = (itemData && !isCustom) ? itemData.name : '';
  var qty = (itemData && itemData.qty) ? itemData.qty : 1;
  var cost = (itemData && itemData.cost !== undefined) ? itemData.cost : 0;
  var duration = (itemData && itemData.duration !== undefined) ? itemData.duration : 0;
  var customDesc = (itemData && itemData.customDesc) ? itemData.customDesc : '';

  tr.innerHTML =
    '<td class="desc-cell">' +
      '<select class="service-select">' + buildServiceOptions(isCustom ? '__custom__' : selectedName) + '</select>' +
      '<div class="custom-desc-wrap" style="' + (isCustom ? '' : 'display:none') + '">' +
        '<span class="editable custom-desc" contenteditable="true">' + escHtml(customDesc) + '</span>' +
      '</div>' +
    '</td>' +
    '<td><input type="number" class="row-qty" min="1" value="' + qty + '" style="width:60px;padding:4px;border:1px solid #ddd;border-radius:4px;"></td>' +
    '<td class="row-duration">' + (duration || 0) + ' days</td>' +
    '<td class="row-cost">' + formatZAR(cost) + '</td>' +
    '<td class="row-total">' + formatZAR(safeNum(qty) * safeNum(cost)) + '</td>' +
    '<td><button class="delete-btn" type="button">Delete</button></td>';

  // Store raw numeric data on the row
  tr.dataset.cost = cost;
  tr.dataset.duration = duration;

  tbody.appendChild(tr);

  // Bind select change
  var sel = tr.querySelector('.service-select');
  sel.addEventListener('change', function() {
    var val = sel.value;
    var wrap = tr.querySelector('.custom-desc-wrap');
    if (val === '__custom__') {
      wrap.style.display = '';
      tr.dataset.cost = 0;
      tr.dataset.duration = 0;
      tr.querySelector('.row-duration').textContent = '0 days';
      tr.querySelector('.row-cost').textContent = formatZAR(0);
    } else if (val === '') {
      wrap.style.display = 'none';
      tr.dataset.cost = 0;
      tr.dataset.duration = 0;
      tr.querySelector('.row-duration').textContent = '0 days';
      tr.querySelector('.row-cost').textContent = formatZAR(0);
    } else {
      wrap.style.display = 'none';
      var svc = serviceRegistry.get(val);
      if (svc) {
        tr.dataset.cost = svc.cost;
        tr.dataset.duration = svc.duration;
        tr.querySelector('.row-duration').textContent = svc.duration + ' days';
        tr.querySelector('.row-cost').textContent = formatZAR(svc.cost);
      }
    }
    recalcRow(tr);
    recalcTotals();
  });

  // Bind qty change
  var qtyInput = tr.querySelector('.row-qty');
  qtyInput.addEventListener('input', function() {
    recalcRow(tr);
    recalcTotals();
  });

  // Bind custom description change
  var customDescEl = tr.querySelector('.custom-desc');
  if (customDescEl) {
    customDescEl.addEventListener('input', function() {
      recalcRow(tr);
      recalcTotals();
    });
  }

  // Delete button
  var delBtn = tr.querySelector('.delete-btn');
  delBtn.addEventListener('click', function() {
    deleteRow(tr);
  });

  // Animate entry
  if (typeof Easings !== 'undefined') {
    Easings.animate(tr, {
      ease: 'easeOutBack',
      duration: 420,
      apply: function(v) {
        tr.style.opacity = String(v);
        tr.style.transform = 'translateY(' + ((1 - v) * -12) + 'px)';
      },
      onDone: function() {
        tr.style.transform = '';
      }
    });
  } else {
    tr.style.opacity = '1';
    tr.style.transform = '';
  }

  recalcTotals();
  return tr;
}

function deleteRow(tr) {
  if (typeof Easings !== 'undefined') {
    Easings.animate(tr, {
      ease: 'easeInCubic',
      duration: 260,
      apply: function(v) {
        tr.style.opacity = String(1 - v);
        tr.style.transform = 'translateX(' + (v * 40) + 'px)';
      },
      onDone: function() {
        tr.parentNode && tr.parentNode.removeChild(tr);
        recalcTotals();
      }
    });
  } else {
    tr.parentNode && tr.parentNode.removeChild(tr);
    recalcTotals();
  }
}

function recalcRow(tr) {
  var qty = safeNum(tr.querySelector('.row-qty').value);
  var cost = safeNum(tr.dataset.cost);
  tr.querySelector('.row-total').textContent = formatZAR(qty * cost);
}

function getRowTotal(tr) {
  var qty = safeNum(tr.querySelector('.row-qty').value);
  var cost = safeNum(tr.dataset.cost);
  return qty * cost;
}

// ---------------------------------------------------------------------------
// Totals
// ---------------------------------------------------------------------------
var totalsContainer = document.getElementById('totalsContainer');

function recalcTotals() {
  if (!tbody) return;
  var rows = tbody.querySelectorAll('tr');
  var subtotal = 0;
  rows.forEach(function(tr) { subtotal += getRowTotal(tr); });

  var markupPct = safeNum(document.getElementById('markupPercentage') ? document.getElementById('markupPercentage').value : 0);
  var markupAmt = subtotal * (markupPct / 100);
  var total = subtotal + markupAmt;
  var deposit = total * 0.5;

  renderTotals(subtotal, markupAmt, total, deposit);
}

function renderTotals(subtotal, markupAmt, total, deposit) {
  if (!totalsContainer) return;

  var existing = totalsContainer.querySelector('table');
  if (!existing) {
    totalsContainer.innerHTML =
      '<table>' +
        '<tbody>' +
          '<tr><td class="totals-label">Subtotal:</td><td class="totals-value" data-key="subtotal"></td></tr>' +
          '<tr class="markup-row"><td class="totals-label">Markup:</td><td class="totals-value" data-key="markup"></td></tr>' +
          '<tr class="totals-grand"><td class="totals-label">Total:</td><td class="totals-value" data-key="total"></td></tr>' +
          '<tr class="deposit-row"><td class="totals-label">50% Deposit:</td><td class="totals-value" data-key="deposit"></td></tr>' +
        '</tbody>' +
      '</table>';
  }

  // Refresh data-key references (in case table was just created)
  var cells = {};
  totalsContainer.querySelectorAll('[data-key]').forEach(function(el) {
    cells[el.dataset.key] = el;
  });

  if (cells['subtotal']) animateTotalsCell(cells['subtotal'], subtotal);
  if (cells['markup']) animateTotalsCell(cells['markup'], markupAmt);
  if (cells['total']) animateTotalsCell(cells['total'], total);
  if (cells['deposit']) animateTotalsCell(cells['deposit'], deposit);

  // Handle visibility of deposit row
  var depositRow = totalsContainer.querySelector('.deposit-row');
  if (depositRow) {
    depositRow.style.display = showDeposit ? '' : 'none';
  }

  // Hide markup row if 0
  var markupRow = totalsContainer.querySelector('.markup-row');
  if (markupRow) {
    markupRow.style.display = (markupAmt === 0) ? 'none' : '';
  }
}

// ---------------------------------------------------------------------------
// Toggle deposit
// ---------------------------------------------------------------------------
(function() {
  var btn = document.getElementById('toggleTotalsBtn');
  if (!btn) return;
  btn.addEventListener('click', function() {
    showDeposit = !showDeposit;
    recalcTotals();
  });
})();

// ---------------------------------------------------------------------------
// Add row button
// ---------------------------------------------------------------------------
(function() {
  var btn = document.getElementById('addRowBtn');
  if (!btn) return;
  btn.addEventListener('click', function() {
    addRow(null);
  });
})();

// ---------------------------------------------------------------------------
// Markup input
// ---------------------------------------------------------------------------
(function() {
  var inp = document.getElementById('markupPercentage');
  if (!inp) return;
  inp.addEventListener('input', function() { recalcTotals(); });
})();

// ---------------------------------------------------------------------------
// Package buttons
// ---------------------------------------------------------------------------
(function() {
  document.querySelectorAll('.package-btn[data-package]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var pkgName = btn.dataset.package;
      var pkgItems = packages[pkgName];
      if (!pkgItems) return;

      // Deselect all
      document.querySelectorAll('.package-btn').forEach(function(b) {
        b.classList.remove('selected');
      });
      btn.classList.add('selected');
      activePackage = pkgName;

      // Clear table
      while (tbody.firstChild) tbody.removeChild(tbody.firstChild);
      _lastTotalsValues = {};

      // Load items
      pkgItems.forEach(function(item) {
        addRow(item);
      });

      // Animate button pop
      if (typeof Easings !== 'undefined') {
        Easings.animate(btn, {
          ease: 'easeOutBack',
          duration: 380,
          apply: function(v) {
            btn.style.transform = 'scale(' + (0.92 + 0.08 * v) + ')';
          },
          onDone: function() {
            btn.style.transform = '';
          }
        });
      }

      recalcTotals();
    });
  });
})();

// ---------------------------------------------------------------------------
// Quote/Invoice conversion
// ---------------------------------------------------------------------------
function getDocumentType() {
  var h2 = document.querySelector('#invoice-content h2.editable');
  return h2 ? h2.textContent.trim().toUpperCase() : 'QUOTE';
}

function getQuoteNumberSpan() {
  var spans = document.querySelectorAll('#quoteDetails .editable');
  // spans[0] = label (QUOTE NO: / INVOICE NO:), spans[1] = number
  return spans.length >= 2 ? spans[1] : null;
}

function getQuoteLabelSpan() {
  var spans = document.querySelectorAll('#quoteDetails .editable');
  return spans.length >= 1 ? spans[0] : null;
}

function convertTo(type) {
  // type = 'QUOTE' or 'INVOICE'
  var h2 = document.querySelector('#invoice-content h2.editable');
  if (h2) h2.textContent = type;

  var labelSpan = getQuoteLabelSpan();
  if (labelSpan) labelSpan.textContent = type + ' NO:';

  var detailsLabel = document.querySelector('#invoice-content .invoice-details p.editable');
  if (detailsLabel) detailsLabel.textContent = type + ' DETAILS:';

  // Fetch tracker and increment
  fetchJSON('/number_tracker.json', 'numberTracker').then(function(data) {
    if (!data) {
      data = { lastQuoteNumber: 99, lastInvoiceNumber: 99, usedQuoteNumbers: [], usedInvoiceNumbers: [] };
    }

    var newNum;
    if (type === 'INVOICE') {
      data.lastInvoiceNumber = (data.lastInvoiceNumber || 99) + 1;
      newNum = data.lastInvoiceNumber;
      if (!data.usedInvoiceNumbers) data.usedInvoiceNumbers = [];
      data.usedInvoiceNumbers.push(newNum);
    } else {
      data.lastQuoteNumber = (data.lastQuoteNumber || 99) + 1;
      newNum = data.lastQuoteNumber;
      if (!data.usedQuoteNumbers) data.usedQuoteNumbers = [];
      data.usedQuoteNumbers.push(newNum);
    }

    var numStr = String(newNum).padStart(3, '0');
    var numSpan = getQuoteNumberSpan();
    if (numSpan) numSpan.textContent = numStr;

    postJSON('/number_tracker.json', data, 'numberTracker');
  });
}

(function() {
  var toInvoice = document.getElementById('convertToInvoiceBtn');
  if (toInvoice) {
    toInvoice.addEventListener('click', function() { convertTo('INVOICE'); });
  }
  var toQuote = document.getElementById('convertToQuoteBtn');
  if (toQuote) {
    toQuote.addEventListener('click', function() { convertTo('QUOTE'); });
  }
})();

// ---------------------------------------------------------------------------
// Client management
// ---------------------------------------------------------------------------
var clientDropdown = document.getElementById('clientDropdown');

function getBillingData() {
  var spans = document.querySelectorAll('#billingInfo .editable');
  return {
    name: spans[0] ? spans[0].textContent.trim() : '',
    company: spans[1] ? spans[1].textContent.trim() : '',
    phone: spans[2] ? spans[2].textContent.trim() : '',
    address: spans[3] ? spans[3].textContent.trim() : ''
  };
}

function setBillingData(data) {
  var spans = document.querySelectorAll('#billingInfo .editable');
  if (spans[0]) spans[0].textContent = data.name || '';
  if (spans[1]) spans[1].textContent = data.company || '';
  if (spans[2]) spans[2].textContent = data.phone || '';
  if (spans[3]) spans[3].textContent = data.address || '';
}

function showClientError(msg) {
  var container = document.querySelector('.client-buttons') || document.querySelector('.client-management-controls');
  if (!container) return;
  var existing = container.querySelector('.error-message');
  if (existing) existing.parentNode.removeChild(existing);
  var err = document.createElement('span');
  err.className = 'error-message';
  err.textContent = msg;
  container.appendChild(err);
  setTimeout(function() { err.parentNode && err.parentNode.removeChild(err); }, 4000);
}

// Generic inline error for the app action bar (Save PDF, Save/Load Form).
// Kept separate from showClientError so a load failure does not surface
// inside the client controls, which would read as a client problem.
function showActionError(msg) {
  var container = document.querySelector('.app-actions') || document.body;
  var existing = container.querySelector('.error-message');
  if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
  var err = document.createElement('span');
  err.className = 'error-message';
  err.textContent = msg;
  container.appendChild(err);
  setTimeout(function() {
    if (err.parentNode) err.parentNode.removeChild(err);
  }, 5000);
}

function populateClientDropdown(clients) {
  if (!clientDropdown) return;
  var prev = clientDropdown.value;
  while (clientDropdown.options.length) clientDropdown.remove(0);

  var placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '-- Select client --';
  clientDropdown.appendChild(placeholder);

  (clients || []).forEach(function(c, i) {
    var opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = c.name + (c.company ? ' (' + c.company + ')' : '');
    clientDropdown.appendChild(opt);
  });

  if (prev) clientDropdown.value = prev;
}

var _clients = [];

function loadClients() {
  fetchJSON('/clients.json', 'clientsData').then(function(data) {
    _clients = (data && data.clients) ? data.clients : [];
    populateClientDropdown(_clients);
  });
}

(function() {
  if (clientDropdown) {
    clientDropdown.addEventListener('change', function() {
      var idx = parseInt(clientDropdown.value, 10);
      if (!isNaN(idx) && _clients[idx]) {
        setBillingData(_clients[idx]);
      }
    });
  }

  var saveBtn = document.getElementById('saveClientBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      var data = getBillingData();
      if (!data.name) {
        showClientError('Please enter a client name before saving.');
        return;
      }
      // Check for existing by name
      var existIdx = _clients.findIndex(function(c) { return c.name === data.name; });
      if (existIdx >= 0) {
        _clients[existIdx] = data;
      } else {
        _clients.push(data);
      }
      postJSON('/clients.json', { clients: _clients }, 'clientsData').then(function() {
        populateClientDropdown(_clients);
      });
    });
  }

  var deleteBtn = document.getElementById('deleteClientBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function() {
      var idx = parseInt(clientDropdown ? clientDropdown.value : '', 10);
      if (isNaN(idx) || !_clients[idx]) return;
      _clients.splice(idx, 1);
      postJSON('/clients.json', { clients: _clients }, 'clientsData').then(function() {
        populateClientDropdown(_clients);
      });
    });
  }
})();

loadClients();

// ---------------------------------------------------------------------------
// Save as PDF
// ---------------------------------------------------------------------------
(function() {
  var btn = document.getElementById('savePdfBtn');
  if (!btn) return;
  btn.addEventListener('click', function() {
    var docType = getDocumentType();
    var numSpan = getQuoteNumberSpan();
    var num = numSpan ? numSpan.textContent.trim() : '000';
    var filename = docType + '-' + num + '.pdf';

    var content = document.getElementById('invoice-content');
    if (!content) return;

    if (typeof html2pdf === 'undefined') {
      console.warn('html2pdf not loaded');
      return;
    }

    var opt = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(content).save();
  });
})();

// ---------------------------------------------------------------------------
// Save Form / Load Form
// ---------------------------------------------------------------------------
function serializeForm() {
  var rows = [];
  tbody.querySelectorAll('tr').forEach(function(tr) {
    var sel = tr.querySelector('.service-select');
    var qtyEl = tr.querySelector('.row-qty');
    var customEl = tr.querySelector('.custom-desc');
    rows.push({
      service: sel ? sel.value : '',
      qty: qtyEl ? safeNum(qtyEl.value) : 1,
      cost: safeNum(tr.dataset.cost),
      duration: safeNum(tr.dataset.duration),
      customDesc: customEl ? customEl.textContent.trim() : '',
      isCustom: sel && sel.value === '__custom__'
    });
  });

  var editables = [];
  document.querySelectorAll('#invoice-content .editable').forEach(function(el) {
    editables.push({ id: el.id || '', text: el.textContent });
  });

  return {
    editables: editables,
    rows: rows,
    markup: document.getElementById('markupPercentage') ? document.getElementById('markupPercentage').value : '0',
    showDeposit: showDeposit,
    activePackage: activePackage
  };
}

function deserializeForm(data) {
  if (!data) return;

  // Restore editables
  var editableEls = document.querySelectorAll('#invoice-content .editable');
  if (data.editables) {
    data.editables.forEach(function(saved, i) {
      if (saved.id) {
        var el = document.getElementById(saved.id);
        if (el) { el.textContent = saved.text; return; }
      }
      if (editableEls[i]) editableEls[i].textContent = saved.text;
    });
  }

  // Restore markup
  var markupEl = document.getElementById('markupPercentage');
  if (markupEl && data.markup !== undefined) markupEl.value = data.markup;

  showDeposit = data.showDeposit !== undefined ? data.showDeposit : true;

  // Clear and restore rows
  if (tbody) { while (tbody.firstChild) tbody.removeChild(tbody.firstChild); }
  _lastTotalsValues = {};

  if (data.rows) {
    data.rows.forEach(function(rowData) {
      addRow(rowData);
      // If a known service, pre-fill the select
      var lastRow = tbody.lastElementChild;
      if (lastRow && rowData.service && rowData.service !== '__custom__') {
        var sel = lastRow.querySelector('.service-select');
        if (sel) {
          sel.value = rowData.service;
          lastRow.dataset.cost = rowData.cost;
          lastRow.dataset.duration = rowData.duration;
          lastRow.querySelector('.row-duration').textContent = rowData.duration + ' days';
          lastRow.querySelector('.row-cost').textContent = formatZAR(rowData.cost);
          recalcRow(lastRow);
        }
      }
    });
  }

  // Restore package selection
  document.querySelectorAll('.package-btn').forEach(function(b) { b.classList.remove('selected'); });
  if (data.activePackage) {
    var pkgBtn = document.querySelector('.package-btn[data-package="' + data.activePackage + '"]');
    if (pkgBtn) pkgBtn.classList.add('selected');
    activePackage = data.activePackage;
  }

  recalcTotals();
}

(function() {
  var saveBtn = document.getElementById('saveFormBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function() {
      var data = serializeForm();
      var json = JSON.stringify(data, null, 2);
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      var docType = getDocumentType();
      var numSpan = getQuoteNumberSpan();
      var num = numSpan ? numSpan.textContent.trim() : '000';
      a.download = docType + '-' + num + '-form.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  var loadBtn = document.getElementById('loadFormBtn');
  if (loadBtn) {
    loadBtn.addEventListener('click', function() {
      var fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json,application/json';
      // Keep it off screen but IN the DOM. Removing the input in the same tick
      // as .click() cancels the picker in several browsers, so it is only torn
      // down once the change event has fired or the window regains focus.
      fileInput.style.position = 'fixed';
      fileInput.style.left = '-9999px';

      function teardown() {
        window.removeEventListener('focus', onFocus);
        if (fileInput.parentNode) fileInput.parentNode.removeChild(fileInput);
      }
      function onFocus() { setTimeout(teardown, 400); }

      fileInput.addEventListener('change', function() {
        var file = fileInput.files[0];
        if (!file) { teardown(); return; }
        var reader = new FileReader();
        reader.onload = function(e) {
          try {
            deserializeForm(JSON.parse(e.target.result));
          } catch (err) {
            showActionError('That file could not be read as a saved form.');
          }
          teardown();
        };
        reader.onerror = function() {
          showActionError('That file could not be opened.');
          teardown();
        };
        reader.readAsText(file);
      });

      window.addEventListener('focus', onFocus);
      document.body.appendChild(fileInput);
      fileInput.click();
    });
  }
})();

// ---------------------------------------------------------------------------
// Thank-You Slip
// ---------------------------------------------------------------------------
(function() {
  var btn = document.getElementById('generateThankYouSlipBtn');
  if (!btn) return;
  btn.addEventListener('click', function() {
    var rows = [];
    if (tbody) tbody.querySelectorAll('tr').forEach(function(tr) {
      var sel = tr.querySelector('.service-select');
      var qtyEl = tr.querySelector('.row-qty');
      var customEl = tr.querySelector('.custom-desc');
      var description = (sel && sel.value === '__custom__')
        ? (customEl ? customEl.textContent.trim() : 'Custom item')
        : (sel ? sel.value : '');
      if (!description) return;
      rows.push({
        description: description,
        qty: qtyEl ? safeNum(qtyEl.value) : 1,
        duration: safeNum(tr.dataset.duration),
        cost: safeNum(tr.dataset.cost)
      });
    });

    var billing = getBillingData();

    var slip = {
      client: billing,
      rows: rows,
      date: new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }),
      docType: getDocumentType(),
      docNumber: (getQuoteNumberSpan() || {}).textContent || ''
    };

    localStorage.setItem('thankYouSlipData', JSON.stringify(slip));
    window.open('thank-you-slip.html', '_blank');
  });
})();

// ---------------------------------------------------------------------------
// Initial totals render
// ---------------------------------------------------------------------------
recalcTotals();
