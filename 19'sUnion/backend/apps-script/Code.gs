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
 * MEMBER UNLOCK (POST, JSON body, NO write token required — own rate limit):
 *   { "action":"unlockMember", "member_id":"M003", "pass":"<MEMBER_PASS>" }
 *   -> { ok:true, member:{ member_id, name, phone, email, ... } }
 *   Wrong pass / unknown member / too many attempts -> { ok:false, ... }
 *   (The 'Members' tab is NEVER included in doGet output.)
 *   NOTE: never paste a real member pass into this file or any other file
 *   committed to the repo — real passes live only in the private sheet.
 *
 * WRITE (POST, JSON body; send header Content-Type: text/plain;charset=utf-8
 *        to avoid the CORS preflight — Apps Script accepts it anyway):
 *
 *   INSERT — append rows (keys = real column headers):
 *     { "action":"insert", "token":"<WRITE_TOKEN>", "tab":"Payments",
 *       "rows":[{ "Month":"Oct", "Member Name":"<Member Name>",
 *                 "Status":"Paid", "Amount":1500,
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

// WRITE TOKEN — SECURITY
// The secret is intentionally NOT stored in this file, so the code stays
// safe to keep in a repository. Configure it once:
//   Apps Script editor > Project Settings (gear icon) > Script Properties
//   Property name : WRITE_TOKEN
//   Property value: a long random secret (40+ random characters)
// Until it is configured, ALL write requests are rejected.
// Every write request must send it as "token".

// tab name (as in the spreadsheet) -> JSON key returned to clients
// NOTE: 'Members' (photo/name/id/pass/PII) is NEVER returned by doGet —
// unlocks happen only through the POST unlockMember action below.
var TAB_MAP = [
  ['Summary',       'Summary'],
  ['CurrentStatus', 'CurrentStatus'],
  ['Advances',      'Advances'],
  ['Investment',    'Investment'],
  ['NetProfit',     'NetProfit'],
  ['MemberStatus',  'MemberStatus'],
  ['Payments',      'Payments']
];

// Rate limiting for the unlockMember action (per IP + member) so a leaked
// endpoint URL cannot be brute-forced for passes or member PII.
var UNLOCK_MAX_ATTEMPTS = 8;
var UNLOCK_WINDOW_MS = 10 * 60 * 1000;

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

/* The write secret lives in Script Properties — never in the code. */
function getWriteToken_() {
  var t = PropertiesService.getScriptProperties().getProperty('WRITE_TOKEN');
  if (!t || t.length < 24) {
    throw new Error('WRITE_TOKEN is not configured (or too short) in Script Properties — writes are disabled.');
  }
  return t;
}

/* Constant-time style comparison (compares SHA-256 digests byte-by-byte)
   so response timing cannot leak how many characters were correct. */
function tokenMatches_(given) {
  if (typeof given !== 'string' || !given.length) return false;
  var expected = getWriteToken_();
  var a = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, given, Utilities.Charset.UTF_8);
  var b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, expected, Utilities.Charset.UTF_8);
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var action = String(body.action || '').toLowerCase();

    // unlockMember has its own rate limit, NOT the write token — members
    // must unlock with only their member pass, never the admin secret.
    // This branch MUST come before the write-token gate below, otherwise
    // every unlock request is rejected as "Invalid or missing token".
    if (action === 'unlockmember') return json_(unlockMember_(body, e));

    // Public directory: photo + name + member id only. No pass, no PII.
    if (action === 'memberdirectory') return json_(memberDirectory_());

    if (!tokenMatches_(body.token)) {
      return json_({ ok: false, error: 'Invalid or missing token' });
    }

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

/** Public, non-sensitive member directory: photo + name + member id only.
 *  No pass, no phone/email/NID/address — those are released one member at a
 *  time by unlockMember_ after the correct pass is supplied. */
function memberDirectory_() {
  var sheet = findSheet_('Members');
  if (!sheet) throw new Error('Members tab not configured');
  var grid = sheet.getDataRange().getValues();
  if (grid.length < 2) return { ok: true, members: [] };
  var headers = grid[0].map(function (h) { return String(h).trim(); });
  var idIdx = findColumnLoose_(headers, ['Member Id', 'Member ID', 'ID', 'Member Code']);
  var nameIdx = findColumnLoose_(headers, ['Full Name', 'Member Name', 'Name']);
  var photoIdx = findColumnLoose_(headers, ['Photos', 'Photo', 'Photo URL']);
  if (idIdx < 0 || nameIdx < 0) throw new Error('Members tab needs "Member Id" and "Full Name" columns');

  var members = [];
  for (var r = 1; r < grid.length; r++) {
    var id = String(grid[r][idIdx] === null || grid[r][idIdx] === undefined ? '' : grid[r][idIdx]).trim();
    if (!id) continue;
    var entry = { member_id: id, name: String(grid[r][nameIdx] || '').trim() };
    if (photoIdx >= 0) entry.photo = serialize_(grid[r][photoIdx]);
    members.push(entry);
  }
  return { ok: true, members: members };
}


/* ========================= MEMBER UNLOCK ========================= */
/* Verifies ONE member's pass against the private 'Members' tab and, on
 * success only, returns that member's row (PII). The tab is deliberately
 * NOT in TAB_MAP, so doGet can never leak it — not in the bulk payload,
 * not via ?tab=Members. Rate limit: UNLOCK_MAX_ATTEMPTS wrong tries per
 * (IP + member) inside UNLOCK_WINDOW_MS. Responses are identical-speed
 * and identical-shape for wrong pass vs unknown member, so neither leaks.
 *
 * Sheet setup (create a 'Members' tab, copy from the current membersData):
 *   Member Id | Member Name | Photo | Pass | Phone | Email | Mother |
 *   Father | NidBirth_No | Nominee | Address
 */
function unlockMember_(body, e) {
  var memberId = String((body && body.member_id) || '').trim().toUpperCase();
  var given = String((body && body.pass) || '');
  if (!memberId || !given) {
    return { ok: false, error: 'member_id and pass required' };
  }

  // Identify the caller loosely (no login system): IP if Apps Script
  // exposes it, else a caller-supplied client id, else a shared bucket.
  var ip = '';
  try { ip = String((e && e.parameters && e.parameters.ip) || ''); } catch (err) { ip = ''; }
  var cid = String((body && body.client) || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
  var who = (ip || 'anon') + '|' + (cid || 'noclient');
  checkUnlockRateLimit_(who, memberId);

  var sheet = findSheet_('Members');
  if (!sheet) throw new Error('Members tab not configured');
  var grid = sheet.getDataRange().getValues();
  if (grid.length < 2) { recordUnlockAttempt_(who, memberId, false); return { ok: false, error: 'Incorrect pass.' }; }
  var headers = grid[0].map(function (h) { return String(h).trim(); });
  // The Members tab uses slightly different header spellings than the rest
  // of the workbook, so accept aliases for every column we need.
  var idIdx = findColumnLoose_(headers, ['Member Id', 'Member ID', 'ID', 'Member Code']);
  var passIdx = findColumnLoose_(headers, ['Pass', 'Password', 'Member Pass']);
  if (idIdx < 0 || passIdx < 0) throw new Error('Members tab needs "Member Id" and "Pass" columns');

  var row = null;
  for (var r = 1; r < grid.length; r++) {
    if (String(grid[r][idIdx]).trim().toUpperCase() === memberId) { row = grid[r]; break; }
  }
  // Constant-time compare so pass-prefix probing via timing fails.
  var expected = row ? String(row[passIdx] === null || row[passIdx] === undefined ? '' : row[passIdx]) : '';
  var a = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, given, Utilities.Charset.UTF_8);
  var b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, expected, Utilities.Charset.UTF_8);
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  var ok = !!row && diff === 0 && expected.length > 0;
  if (!recordUnlockAttempt_(who, memberId, ok)) {
    return { ok: false, error: 'Too many attempts. Try again later.' };
  }
  if (!ok) return { ok: false, error: 'Incorrect pass.' };

  // Success: return exactly this member's row (PII), keyed by the
  // canonical field names the frontend renders.
  var member = {};
  for (var c = 0; c < headers.length; c++) {
    var key = memberFieldKey_(headers[c]);
    if (!key) continue;          // unknown column -> not part of the profile
    if (key === 'pass') continue; // never echo the pass back
    var v = row[c];
    if (v === '' || v === null || v === undefined) continue;
    member[key] = serialize_(v);
  }
  recordUnlockAttempt_(who, memberId, true);
  return { ok: true, member: member };
}

/** Resolves a Members-tab header to its canonical profile field name.
 *  Exact alias match first; then a SAFE suffix match so a column titled
 *  "19's Union - Complete Members Directory Member ID" still resolves to
 *  'member_id'. Bare 'id' is NOT accepted as a suffix because 'Nid' would
 *  match it and be mislabelled as the member id. */
function memberFieldKey_(header) {
  var n = norm_(header);
  if (!n) return null;
  var exact = MEMBER_FIELD_ALIASES[n];
  if (exact) return exact;
  var safe = ['memberid', 'membercode', 'fullname', 'membername'];
  for (var i = 0; i < safe.length; i++) {
    var s = safe[i];
    if (n.length > s.length && n.slice(-s.length) === s) {
      return MEMBER_FIELD_ALIASES[s];
    }
  }
  return null;
}

/* Maps the Members tab's header spellings to the canonical field names the
 * dashboard renders. Anything not listed here is dropped from the response.
 * 'pass' is listed only so it can be explicitly skipped before echoing. */
var MEMBER_FIELD_ALIASES = {
  memberid: 'member_id', membercode: 'member_id', id: 'member_id',
  fullname: 'name', membername: 'name', name: 'name',
  photos: 'photo', photo: 'photo', photourl: 'photo',
  phone: 'phone', phonenumber: 'phone', mobile: 'phone',
  email: 'email', emailaddress: 'email',
  fathersname: 'Father', father: 'Father',
  mothersname: 'Mother', mother: 'Mother',
  nidbirthno: 'NidBirth_No', nidbirthcertificateno: 'NidBirth_No',
  nidbirthcertificatenumber: 'NidBirth_No', nid: 'NidBirth_No',
  nominee: 'nominee',
  address: 'address',
  pass: 'pass', password: 'pass', memberpass: 'pass'
};

/** Sliding-window (IP + member) attempt counter in CacheService.
 *  Returns true if the just-recorded outcome keeps the caller allowed. */
function recordUnlockAttempt_(who, memberId, success) {
  var key = 'unlock_' + Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
    who + '|' + memberId, Utilities.Charset.UTF_8).map(function (x) {
      return ('0' + ((x + 256) % 256).toString(16)).slice(-2);
    }).join('');
  var cache = CacheService.getScriptCache();
  var raw = cache.get(key);
  var entry = { n: 0, t0: Date.now() };
  if (raw) { try { entry = JSON.parse(raw); } catch (err) { entry = { n: 0, t0: Date.now() }; } }
  if (Date.now() - entry.t0 > UNLOCK_WINDOW_MS) entry = { n: 0, t0: Date.now() };
  if (success) { cache.remove(key); return true; }
  entry.n += 1;
  cache.put(key, JSON.stringify(entry), Math.ceil(UNLOCK_WINDOW_MS / 1000));
  return entry.n <= UNLOCK_MAX_ATTEMPTS;
}

function checkUnlockRateLimit_(who, memberId) {
  var cache = CacheService.getScriptCache();
  var probe = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
    who + '|' + memberId, Utilities.Charset.UTF_8).map(function (x) {
      return ('0' + ((x + 256) % 256).toString(16)).slice(-2);
    }).join('');
  var raw = cache.get('unlock_' + probe);
  if (!raw) return;
  var entry = null;
  try { entry = JSON.parse(raw); } catch (err) { return; }
  if (Date.now() - entry.t0 <= UNLOCK_WINDOW_MS && entry.n >= UNLOCK_MAX_ATTEMPTS) {
    throw new Error('Too many attempts. Try again later.');
  }
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

/** First header matching ANY alias (case/space-insensitive). Returns -1 if none. */
function findColumn_(headers, aliases) {
  for (var a = 0; a < aliases.length; a++) {
    var idx = headerIndex_(headers, aliases[a]);
    if (idx >= 0) return idx;
  }
  return -1;
}

/** Like findColumn_ but also accepts a header that merely ENDS WITH the alias.
 *  The 'Members' tab titles its first column
 *  "19's Union - Complete Members Directory Member ID", so a strict
 *  equality check would never find the member id column. */
function findColumnLoose_(headers, aliases) {
  var exact = findColumn_(headers, aliases);
  if (exact >= 0) return exact;
  for (var a = 0; a < aliases.length; a++) {
    var n = norm_(aliases[a]);
    if (!n) continue;
    for (var i = 0; i < headers.length; i++) {
      var h = norm_(headers[i]);
      if (h && h !== n && h.length > n.length && h.slice(-n.length) === n) return i;
    }
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
