/**
 * ═══════════════════════════════════════════════════════════════════
 *  19's UNION — ACCOUNTS DASHBOARD (Google Apps Script back-end)
 *  Powers the "Accounts" page of Index.html with LIVE Google Sheets data
 * ═══════════════════════════════════════════════════════════════════
 *
 *  SETUP STEPS (do this in Google, it fixes the current 403 error)
 *  ----------------------------------------------------------------
 *  1. Open  https://script.google.com  →  + New project
 *  2. Delete the default "myFunction" and paste this whole file in.
 *  3. Confirm SPREADSHEET_ID below matches YOUR spreadsheet id.
 *  4. Click  Run ▸ Run function ▸ doGet  once, and authorize
 *     (the script needs permission to READ your spreadsheet).
 *  5. Click  Deploy ▸ New deployment ▸
 *        Type:            Web app
 *        Execute as:      Me
 *        Who has access:  Anyone
 *     → Deploy, then copy the blue  /exec  URL.
 *  6. Paste that URL into  Index.html  (API_URL constant, ~line 2149).
 *  7. IMPORTANT — after ANY edit to this script:
 *        Deploy ▸ Manage deployments ▸ ✏️ Edit ▸ New version ▸ Deploy
 *     If you skip this, the OLD version keeps running (403 / stale data).
 *
 *  ⚠️  Sharing the spreadsheet alone does NOT update the dashboard.
 *      The page reads the WEB APP above, not the sheet directly.
 *
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
