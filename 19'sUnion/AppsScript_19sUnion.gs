/**
 * ═══════════════════════════════════════════════════════════════════
 *  19's UNION — ACCOUNTS DASHBOARD (Google Apps Script back-end)
 *  Powers the "Accounts" page of Index.html with LIVE Google Sheets data
 * ═══════════════════════════════════════════════════════════════════

 *  SPREADSHEET STRUCTURE THE PAGE EXPECTS
 *  --------------------------------------
 *  Tab "Summary"        → columns:  Description | Context
 *                         rows: "Total Amounts", "Monthly Deposit",
 *                               "Advances", "Profits", "Active Investment",
 *                               "Remainning Cash" (or "Remaining Cash")
 *  Tab "CurrentStatus"  → columns:  Member Name | Status | Amount
 *                         Status must be "Paid" or "Partial"
 *  Tab "Advances"       → columns:  Name | Advance 1st | Advance 2nd
 *  Tab "Investment"     → columns:  Description | Status | Amount
 *                         Status must be "Running" to appear on the pie chart
 *  Tab "MemberStatus"   → columns:  Member Name | Expected payments | Total Unpaid
 *  ───────────────────────────────────────────────────────────────────
 */

var SPREADSHEET_ID = '14sStv62NQfcCTBySZDD9Wx5g1LQLXZJhC4VGF8uRVcU';

// sheet-tab name → JSON key returned to Index.html
var TAB_MAP = [
  ['Summary',        'Summary'],
  ['CurrentStatus',  'CurrentStatus'],
  ['Advances',       'Advances'],
  ['Investment',     'Investment'],
  ['MemberStatus',   'MemberStatus']
];

function doGet() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var out = {};
    TAB_MAP.forEach(function (pair) {
      var sheet = ss.getSheetByName(pair[0]);
      out[pair[1]] = sheet ? sheetToObjects_(sheet) : [];
    });
    return json_(out);
  } catch (e) {
    // Visible JSON error instead of a bare 403/500 page
    return json_({ error: String(e) });
  }
}

/** Converts a sheet (1st row = headers) into an array of objects. */
function sheetToObjects_(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0].map(function (h) { return String(h).trim(); });
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var obj = {};
    var hasValue = false;
    for (var c = 0; c < headers.length; c++) {
      var v = values[i][c];
      if (v !== '' && v !== null && v !== undefined) {
        obj[headers[c]] = v;
        hasValue = true;
      }
    }
    if (hasValue) rows.push(obj);
  }
  return rows;
}

/** Returns a JSON text response. */
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
