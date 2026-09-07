/********************************************************************
 * 19's Union — Google Sheets REST-style API (READ + WRITE)
 * --------------------------------------------------------------
 * Sheet : https://docs.google.com/spreadsheets/d/14sStv62NQfcCTBySZDD9Wx5g1LQLXZJhC4VGF8uRVcU
 * Tabs  : Payments, CurrentStatus, Summary, Advances,
 *         MemberStatus, Investment, NetProfit
 *
 * DEPLOY:  Deploy > New deployment > Web app
 *          Execute as: Me | Who has access: Anyone
 *
 * ============ API CONTRACT ============
 *
 * READ ALL (what Index.html uses — GET, no params):
 *   GET  /exec
 *   -> { Summary:[...], CurrentStatus:[...], Advances:[...],
 *        Investment:[...], NetProfit:[...], MemberStatus:[...],
 *        Payments:[...] }
 *
 * READ ONE TAB:
 *   GET  /exec?tab=NetProfit     (tab name or JSON key, case-insensitive)
 *   -> [ {...}, {...} ]
 *
 * WRITE (POST, JSON body; send header Content-Type: text/plain;charset=utf-8
 *        to avoid the CORS preflight — Apps Script accepts it anyway):
 *
 *   INSERT — append rows (keys = real column headers):
 *     { "action":"insert", "token":"<WRITE_TOKEN>", "tab":"Payments",
 *       "rows":[{ "Month":"Oct", "Member Name":"Walid Ehasan",
 *                 "Status":"Paid", "Ammount":1500,
 *                 "Payment Date":"2026-10-05", "Year":2026,
 *                 "Member Id":"M003", "Helper":10 }] }
 *
 *   UPDATE — change rows matched on a key column:
 *     { "action":"update", "token":"<WRITE_TOKEN>", "tab":"Payments",
 *       "key":"Member Id",
 *       "rows":[{ "Member Id":"M006", "Status":"Paid",
 *                 "Payment Date":"2026-09-10" }] }
 *
 *   DELETE — remove rows whose key column matches:
 *     { "action":"delete", "token":"<WRITE_TOKEN>", "tab":"NetProfit",
 *       "key":"Date", "values":["2026-06-29"] }
 *
 *   Every response: { ok:true, ... } or { ok:false, error:"..." }
 ********************************************************************/

var SPREADSHEET_ID = '14sStv62NQfcCTBySZDD9Wx5g1LQLXZJhC4VGF8uRVcU';

// Change this to a long random secret before deploying.
// It must be sent as "token" on every write request.
var WRITE_TOKEN = 'CHANGE_ME_19sUnion_2026';

// tab name (as in the spreadsheet) -> JSON key returned to clients
var TAB_MAP = [
  ['Summary',       'Summary'],
  ['CurrentStatus', 'CurrentStatus'],
  ['Advances',      'Advances'],
  ['Investment',    'Investment'],
  ['NetProfit',     'NetProfit'],
  ['MemberStatus',  'MemberStatus'],
  ['Payments',      'Payments']
];

// Descriptions matching this are expenses -> returned as negative amounts
var EXPENSE_PATTERN = /charge|expense|cost|fee|loss|withdraw/i;

/* =========================== READ =========================== */

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};

    // Single-tab read: /exec?tab=NetProfit
    if (params.tab) {
      var cfg = findTab_(params.tab);
      var sheet = findSheet_(cfg[0]);
      return json_(sheet ? readTab_(sheet, cfg[0]) : []);
    }

    // Default: read every tab (backward compatible with Index.html)
    var out = {};
    TAB_MAP.forEach(function (pair) {
      var s = findSheet_(pair[0]);
      out[pair[1]] = s ? readTab_(s, pair[0]) : [];
    });
    return json_(out);
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

/* =========================== WRITE =========================== */

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    if (body.token !== WRITE_TOKEN) {
      return json_({ ok: false, error: 'Invalid or missing token' });
    }

    var action = String(body.action || '').toLowerCase();
    if (action === 'insert') return json_(writeInsert_(body));
    if (action === 'update') return json_(writeUpdate_(body));
    if (action === 'delete') return json_(writeDelete_(body));
    return json_({ ok: false, error: 'Unknown action: ' + body.action });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

/** INSERT: append rows. body = { tab, rows:[{header:value,...}] } */
function writeInsert_(body) {
  var target = getTarget_(body.tab);
  var rows = asArray_(body.rows);
  if (!rows.length) throw new Error('rows[] required');

  var lastCol = Math.max(target.headers.length, 1);
  var toAppend = rows.map(function (row) {
    var line = new Array(lastCol).fill('');
    Object.keys(row).forEach(function (k) {
      var idx = headerIndex_(target.headers, k);
      if (idx >= 0) line[idx] = toCellValue_(row[k]);
    });
    return line;
  });

  target.sheet
    .getRange(target.lastRow + 1, 1, toAppend.length, lastCol)
    .setValues(toAppend);
  SpreadsheetApp.flush();
  return { ok: true, inserted: toAppend.length };
}

/** UPDATE: body = { tab, key:"Member Id", rows:[{keyField, fields...}] } */
function writeUpdate_(body) {
  var target = getTarget_(body.tab);
  if (!body.key) throw new Error('key field required, e.g. "Member Id"');
  var rows = asArray_(body.rows);
  if (!rows.length) throw new Error('rows[] required');

  var keyIdx = headerIndex_(target.headers, body.key);
  if (keyIdx < 0) throw new Error('key column not found: ' + body.key);

  var grid = target.sheet.getDataRange().getValues();
  var updated = 0;

  for (var r = 1; r < grid.length; r++) {          // skip header row
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][body.key]) === String(grid[r][keyIdx])) {
        Object.keys(rows[i]).forEach(function (k) {
          if (k === body.key) return;              // never overwrite the key
          var idx = headerIndex_(target.headers, k);
          if (idx >= 0) grid[r][idx] = toCellValue_(rows[i][k]);
        });
        updated++;
        break;
      }
    }
  }

  if (updated) {
    target.sheet.getRange(1, 1, grid.length, grid[0].length).setValues(grid);
    SpreadsheetApp.flush();
  }
  return { ok: true, updated: updated };
}

/** DELETE: body = { tab, key:"Date", values:["2026-06-29", ...] } */
function writeDelete_(body) {
  var target = getTarget_(body.tab);
  if (!body.key) throw new Error('key field required, e.g. "Date"');
  var values = asArray_(body.values);
  if (!values.length) throw new Error('values[] required');

  var keyIdx = headerIndex_(target.headers, body.key);
  if (keyIdx < 0) throw new Error('key column not found: ' + body.key);

  var grid = target.sheet.getDataRange().getValues();
  var kept = [grid[0]];                            // keep the header row
  var removed = 0;

  for (var r = 1; r < grid.length; r++) {
    var drop = false;
    for (var i = 0; i < values.length; i++) {
      if (String(values[i]) === String(grid[r][keyIdx])) { drop = true; break; }
    }
    if (drop) removed++; else kept.push(grid[r]);
  }

  if (removed) {
    target.sheet.getRange(1, 1, kept.length, grid[0].length).setValues(kept);
    var leftover = grid.length - kept.length;
    if (leftover > 0) target.sheet.deleteRows(kept.length + 1, leftover);
    SpreadsheetApp.flush();
  }
  return { ok: true, removed: removed };
}
/* ========================= READ HELPERS ========================= */

/**
 * Reads any tab into an array of {header: value} objects.
 * The NetProfit tab gets special treatment because it holds TWO
 * side-by-side tables (Description|Amounts|Date|Total and
 * Description|Amount|Date|Total) — both are merged into clean rows:
 *   { "Date":"2026-02-01", "Net Profit":1997.5, "Description":"Bkash" }
 * Expense rows (Bank Charge etc.) come back NEGATIVE so monthly sums
 * on the frontend chart are true "net" values.
 */
function readTab_(sheet, tabName) {
  if (norm_(tabName) === 'netprofit') return readNetProfit_(sheet);

  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0].map(function (h) { return String(h).trim(); });

  var rows = [];
  for (var r = 1; r < values.length; r++) {
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var v = values[r][c];
      if (v === '' || v === null || v === undefined) continue;
      obj[headers[c] || ('Column ' + (c + 1))] = serialize_(v);
    }
    if (Object.keys(obj).length) rows.push(obj);
  }
  return rows;
}

function readNetProfit_(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  // Two side-by-side tables: cols A-D and F-I (0-based: 0-3 and 5-8)
  var groups = [[0, 3], [5, 8]];
  var rows = [];

  for (var r = 1; r < values.length; r++) {
    groups.forEach(function (g) {
      var desc = values[r][g[0]];
      var amount = values[r][g[0] + 1];
      var date = values[r][g[0] + 2];
      var total = values[r][g[0] + 3];
      if ((desc === '' || desc === null) &&
          (amount === '' || amount === null)) return;

      var amt = toNumber_(amount);
      var d = parseDate_(date);
      if (amt === null && !d) return;

      var descStr = desc ? String(desc).trim() : '';
      if (amt !== null && descStr && EXPENSE_PATTERN.test(descStr)) amt = -Math.abs(amt);

      var row = {};
      if (d) row['Date'] = d;
      if (amt !== null) row['Net Profit'] = amt;
      if (descStr) row['Description'] = descStr;
      var tot = toNumber_(total);
      if (tot !== null) row['RunningTotal'] = tot;
      if (Object.keys(row).length) rows.push(row);
    });
  }

  rows.sort(function (a, b) { return String(a.Date).localeCompare(String(b.Date)); });
  return rows;
}

/* ========================= SHARED HELPERS ========================= */

/** Locates a tab config by tab name OR JSON key, case-insensitive. */
function findTab_(name) {
  var n = norm_(name);
  for (var i = 0; i < TAB_MAP.length; i++) {
    if (norm_(TAB_MAP[i][0]) === n || norm_(TAB_MAP[i][1]) === n) return TAB_MAP[i];
  }
  throw new Error('Unknown tab: ' + name);
}

/** Case-insensitive sheet lookup ("Netprofit" finds "NetProfit"). */
function findSheet_(name) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheets = ss.getSheets();
  var n = norm_(name);
  for (var i = 0; i < sheets.length; i++) {
    if (norm_(sheets[i].getName()) === n) return sheets[i];
  }
  return null;
}

/** { tab } -> { sheet, headers, lastRow } for write operations. */
function getTarget_(tabName) {
  var cfg = findTab_(tabName);
  var sheet = findSheet_(cfg[0]);
  if (!sheet) throw new Error('Tab not found in spreadsheet: ' + cfg[0]);

  var lastRow = sheet.getLastRow();
  var headers = [];
  if (lastRow >= 1 && sheet.getLastColumn() > 0) {
    headers = sheet.getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0].map(function (h) { return String(h).trim(); });
  }
  return { sheet: sheet, headers: headers, lastRow: lastRow };
}

/** Header match ignoring case/spaces ("Total " == "total"). */
function headerIndex_(headers, name) {
  var n = norm_(name);
  for (var i = 0; i < headers.length; i++) {
    if (norm_(headers[i]) === n) return i;
  }
  return -1;
}

function norm_(s) {
  return String(s === null || s === undefined ? '' : s)
    .toLowerCase().replace(/[^\w]/g, '');
}

function asArray_(v) {
  if (Array.isArray(v)) return v;
  if (v && typeof v === 'object') return [v];
  return [];
}

/** JSON-safe cell: Date -> "yyyy-MM-dd", numbers stay numbers, rest as-is. */
function serialize_(v) {
  if (v instanceof Date) return formatDate_(v);
  return v;
}

/** Write-side cell: "2026-02-15" string -> a real Date cell for the sheet. */
function toCellValue_(v) {
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.trim())) {
    var p = v.trim().split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }
  return v;
}

/** Accepts Date objects or text like "1-Feb-2026", "2026-02-01" -> ISO. */
function parseDate_(v) {
  if (v instanceof Date) return formatDate_(v);
  if (v === '' || v === null || v === undefined) return null;
  var s = String(v).trim();

  var m = s.match(/^(\d{1,2})[-\/ ]([A-Za-z]{3,9})[-\/ ](\d{4})$/); // 1-Feb-2026
  if (m) {
    var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
                  'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    var idx = months.indexOf(m[2].toLowerCase().slice(0, 3));
    if (idx >= 0) {
      return formatDate_(new Date(Number(m[3]), idx, Number(m[1])));
    }
  }
  var d = new Date(s);                              // last resort
  return isNaN(d.getTime()) ? s : formatDate_(d);
}

function formatDate_(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone() || 'GMT', 'yyyy-MM-dd');
}

function toNumber_(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (typeof v === 'number') return isNaN(v) ? null : v;
  var cleaned = String(v).replace(/[৳,\s]/g, '');
  if (cleaned === '') return null;
  var n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
