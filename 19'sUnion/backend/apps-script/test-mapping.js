/* ---- TEST HARNESS (run with: node backend/apps-script/test-mapping.js) ---- */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

// The REAL header row of the live 'Members' tab.
// ⚠️ FIXTURES BELOW ARE SYNTHETIC. Never put a real member's pass, name,
// phone, email, NID or address in this file — it is committed to a PUBLIC
// repository. Real data lives only in the private spreadsheet.
const HEADERS = [
  "19's Union - Complete Members Directory Member ID",
  'Full Name', 'Phone', 'Email', "Father's Name", "Mother's Name",
  'Nid/Birth No', 'Nominee', 'Address', 'Photos', 'Password'
];
const ROW = [
  'T001', 'Test Member', '000-0000-0000', 'test@example.invalid',
  'Test Father', 'Test Mother', '0000000000', 'Test Nominee [Brother]',
  'Test Address',
  'https://example.invalid/photo.jpg',
  'test-pass-0001'
];
const GRID = [HEADERS, ROW];

const src = fs.readFileSync(path.join(__dirname, 'Code.gs'), 'utf8');

// ---- Sandbox with mocked Google Apps Script services ----
const attempts = [];
const sandbox = {
  Utilities: {
    computeDigest: (algo, str) => Array.from(crypto.createHash('sha256').update(String(str), 'utf8').digest()),
    DigestAlgorithm: { SHA_256: 'SHA_256' },
    Charset: { UTF_8: 'UTF_8' }
  },
  SpreadsheetApp: {
    openById: () => ({
      getSheets: () => [{
        getName: () => 'Members',
        getDataRange: () => ({ getValues: () => GRID })
      }]
    }),
    flush: () => {}
  },
  CacheService: {
    getScriptCache: () => ({
      get: () => null,
      put: () => {},
      remove: () => {}
    })
  },
  PropertiesService: { getScriptProperties: () => ({ getProperty: () => null }) },
  Date,
  JSON,
  Math,
  String,
  Array,
  Object,
  console,
};
vm.createContext(sandbox);

// Evaluate the whole file. Apps Script globals (PropertiesService etc.) are
// mocked above; nothing here should touch the network.
vm.runInContext(src, sandbox);

let failures = 0;
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log((ok ? 'PASS ' : 'FAIL ') + label + ' -> ' + JSON.stringify(actual) +
    (ok ? '' : ' (expected ' + JSON.stringify(expected) + ')'));
}
function checkTrue(label, cond, detail) {
  if (!cond) failures++;
  console.log((cond ? 'PASS ' : 'FAIL ') + label + (cond ? '' : ' -> ' + detail));
}

// ========== 1. memberDirectory_ — public, non-sensitive ==========
const dir = sandbox.memberDirectory_();
check('memberDirectory ok', dir.ok, true);
check('memberDirectory count', dir.members.length, 1);
const d0 = dir.members[0];
check('directory member_id', d0.member_id, 'T001');
check('directory name', d0.name, 'Test Member');
check('directory photo', d0.photo, ROW[9]);

const dirKeys = Object.keys(d0).sort();
check('directory keys are exactly the 3 public fields', dirKeys, ['member_id', 'name', 'photo']);
checkTrue('directory does NOT leak the pass',
  JSON.stringify(dir).indexOf('test-pass-0001') === -1, 'pass found in directory payload');
checkTrue('directory does NOT leak phone/email/NID',
  JSON.stringify(dir).indexOf('000-0000-0000') === -1 &&
  JSON.stringify(dir).indexOf('test@example.invalid') === -1 &&
  JSON.stringify(dir).indexOf('0000000000') === -1,
  'PII found in directory payload');

// ========== 2. unlockMember_ — wrong pass ==========
const bad = sandbox.unlockMember_({ member_id: 'T001', pass: 'wrong-pass' }, null);
check('wrong pass -> ok false', bad.ok, false);
checkTrue('wrong pass -> no member data', !bad.member, 'member data leaked on wrong pass');
checkTrue('wrong pass -> no pass echoed', JSON.stringify(bad).indexOf('test-pass-0001') === -1,
  'pass echoed in wrong-pass response');

// ========== 3. unlockMember_ — unknown member (must look like wrong pass) ==========
const unknown = sandbox.unlockMember_({ member_id: 'T999', pass: 'test-pass-0001' }, null);
check('unknown member -> ok false', unknown.ok, false);
check('unknown member error text matches wrong-pass text', unknown.error, bad.error);

// ========== 4. unlockMember_ — correct pass ==========
const good = sandbox.unlockMember_({ member_id: 'T001', pass: 'test-pass-0001' }, null);
check('correct pass -> ok true', good.ok, true);
checkTrue('correct pass -> member object', !!good.member, 'no member returned');
const g = good.member;
check('unlocked member_id', g.member_id, 'T001');
check('unlocked name', g.name, 'Test Member');
check('unlocked phone', g.phone, ROW[2]);
check('unlocked email', g.email, ROW[3]);
check('unlocked Father', g.Father, ROW[4]);
check('unlocked Mother', g.Mother, ROW[5]);
check('unlocked NidBirth_No', g.NidBirth_No, ROW[6]);
check('unlocked nominee', g.nominee, ROW[7]);
check('unlocked address', g.address, ROW[8]);
check('unlocked photo', g.photo, ROW[9]);
checkTrue('correct pass -> pass NOT echoed',
  !('pass' in g) && JSON.stringify(g).indexOf('test-pass-0001') === -1,
  'pass echoed in successful response');

// The frontend renders these exact keys.
['phone', 'email', 'Mother', 'Father', 'NidBirth_No', 'nominee', 'address'].forEach(k => {
  checkTrue('frontend field "' + k + '" present in unlocked payload', k in g, 'missing ' + k);
});

console.log('\nFAILURES: ' + failures);
process.exit(failures ? 1 : 0);
