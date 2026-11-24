import test from 'node:test';
import assert from 'node:assert/strict';
import { reportTesting } from '../src/reports.js';

test('Monday report covers preceding Monday to Sunday and preceding calendar month', () => {
  const [week,month] = reportTesting.periodsFor('2026-12-07');
  assert.deepEqual(week,{kind:'weekly',start:'2026-11-30',end:'2026-12-06'});
  assert.deepEqual(month,{kind:'monthly',start:'2026-11-01',end:'2026-11-30'});
});
test('Year change periods are correct', () => {
  const [week,month] = reportTesting.periodsFor('2027-01-01');
  assert.deepEqual(week,{kind:'weekly',start:'2026-12-21',end:'2026-12-27'});
  assert.deepEqual(month,{kind:'monthly',start:'2026-12-01',end:'2026-12-31'});
});
test('No individual visit identity is included in report; missing days are explicit', () => {
  const input={totals:{pageviews:3,visits:2,daily_unique_visitors:2,total_active_seconds:150,timed_pageviews:3},
    missing:['2026-11-08'],pages:[{label:'/arastirma/',hits:3}],
    countries:[],sources:[],regions:[],devices:[],languages:[],campaigns:[],scroll:[],events:[]};
  const msg=reportTesting.render({kind:'weekly',start:'2026-11-02',end:'2026-11-08'},input);
  assert.match(msg.text,/Veri kontrolü:/);
  assert.match(msg.text,/2026-11-08/);
  assert.match(msg.text,/tekil kişi değildir/);
  assert.match(msg.html,/MNEMORİSK/);
});
