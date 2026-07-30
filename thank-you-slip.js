/*
 * thank-you-slip.js
 * Populates thank-you-slip.html from data written to localStorage by script.js.
 * Add <script src="thank-you-slip.js"></script> before </body> in thank-you-slip.html.
 */
(function() {
  // Matches the R3,309.50 convention used across the IDJOY quote documents.
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
    var num = parseFloat(n);
    return zarFmt.format(isFinite(num) ? num : 0);
  }

  function escHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  var raw = localStorage.getItem('thankYouSlipData');
  if (!raw) return;

  var data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return;
  }

  // Date
  var dateEl = document.querySelector('.current-date');
  if (dateEl) {
    dateEl.textContent = 'Date: ' + (data.date || new Date().toLocaleDateString('en-ZA'));
  }

  // Review end date (7 days from issue)
  var reviewEl = document.querySelector('.review-end-date');
  if (reviewEl) {
    var reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() + 7);
    reviewEl.textContent = reviewDate.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Client info
  var clientInfoEl = document.querySelector('.client-info');
  if (clientInfoEl && data.client) {
    var c = data.client;
    var parts = [];
    if (c.name) parts.push('<strong>' + escHtml(c.name) + '</strong>');
    if (c.company) parts.push(escHtml(c.company));
    if (c.phone) parts.push(escHtml(c.phone));
    if (c.address) parts.push(escHtml(c.address));
    clientInfoEl.innerHTML = parts.join('<br>');
  }

  // Project table
  var tbodyEl = document.querySelector('.project-table tbody');
  if (tbodyEl && data.rows && data.rows.length) {
    var html = '';
    data.rows.forEach(function(row) {
      html +=
        '<tr>' +
          '<td>' + escHtml(row.description) + '</td>' +
          '<td>' + (row.qty || 1) + '</td>' +
          '<td>' + (row.duration || 0) + ' days</td>' +
          '<td>' + formatZAR(row.cost) + '</td>' +
        '</tr>';
    });
    tbodyEl.innerHTML = html;
  }
})();
