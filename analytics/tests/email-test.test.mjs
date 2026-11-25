import test from 'node:test';
import assert from 'node:assert/strict';
import {emailTest} from '../src/email-test.js';

test('GET cannot send email',async()=>{
 const res=await emailTest(new Request('https://example.com/email-test'),{});
 assert.equal(res.status,405);
});
test('POST without secret cannot send email',async()=>{
 const res=await emailTest(new Request('https://example.com/email-test',{method:'POST'}),{});
 assert.equal(res.status,401);
});
test('Invalid secret cannot send email',async()=>{
 const res=await emailTest(new Request('https://example.com/email-test',{method:'POST',headers:{'x-mnemorisk-test-key':'x'.repeat(64)}}),{EMAIL_TEST_TOKEN:'y'.repeat(64)});
 assert.equal(res.status,401);
});
test('Correct secret needs bindings before any attempt',async()=>{
 const res=await emailTest(new Request('https://example.com/email-test',{method:'POST',headers:{'x-mnemorisk-test-key':'x'.repeat(64)}}),{EMAIL_TEST_TOKEN:'x'.repeat(64)});
 assert.equal(res.status,503);
});
