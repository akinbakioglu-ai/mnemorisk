import test from 'node:test';
import assert from 'node:assert/strict';
import {dashboard} from '../src/dashboard.js';
import {archiveMonthly} from '../src/archive.js';
import handler from '../src/index.js';

test('data collection stays disabled with no explicit opt in',async()=>{
 const r=await handler.fetch(new Request('https://analytics.mnemorisk.org/collect',{method:'POST'}),{COLLECTION_ENABLED:'false'});
 assert.equal(r.status,503);
 assert.equal((await r.json()).error,'collection_disabled');
});
test('dashboard is off by default',async()=>{
 const r=await dashboard(new Request('https://stats.mnemorisk.org/dashboard'),{});
 assert.equal(r.status,503);
});
test('dashboard fails closed on incorrect hostname before DB access',async()=>{
 const r=await dashboard(new Request('https://analytics.mnemorisk.org/dashboard'),{DASHBOARD_ENABLED:'true'});
 assert.equal(r.status,404);
});
test('dashboard requires independent secret',async()=>{
 const r=await dashboard(new Request('https://stats.mnemorisk.org/dashboard'),{DASHBOARD_ENABLED:'true'});
 assert.equal(r.status,401);
});
test('archive does not write before enabled',async()=>{
 await archiveMonthly({ARCHIVE_ENABLED:'false'},new Date('2026-12-05T09:00:00Z'));
});
test('archive requires a private bucket binding',async()=>{
 await assert.rejects(()=>archiveMonthly({ARCHIVE_ENABLED:'true'},new Date('2026-12-05T09:00:00Z')),/binding missing/);
});
