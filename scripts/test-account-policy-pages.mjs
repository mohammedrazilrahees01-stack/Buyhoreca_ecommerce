import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const results = [];
const check = (name, fn) => {
  try { const result = fn(); results.push({ name, pass: result === true, detail: result === true ? '' : String(result || 'assertion returned false') }); }
  catch (error) { results.push({ name, pass: false, detail: error instanceof Error ? error.message : String(error) }); }
};
function loadTypeScriptModule(relativePath) {
  let ts;
  try { ts = require('typescript'); }
  catch { ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js'); }
  const source = fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'buyhoreca-test-'));
  const target = path.join(tempDir, 'module.cjs');
  fs.writeFileSync(target, output);
  try { return require(target); }
  finally { fs.rmSync(tempDir, { recursive: true, force: true }); }
}
const account = loadTypeScriptModule('lib/customer-account.ts');
const policies = loadTypeScriptModule('lib/shopify-policies.ts');
check('Valid external HTTPS customer account URL is accepted', () => account.safeCustomerAccountUrl('https://accounts.example.com/account', 'https://buyhoreca.com') === 'https://accounts.example.com/account');
check('Plain HTTP account URL is rejected', () => account.safeCustomerAccountUrl('http://accounts.example.com/account') === null);
check('Javascript scheme account URL is rejected', () => account.safeCustomerAccountUrl('javascript:alert(1)') === null);
check('Credential-bearing account URL is rejected', () => account.safeCustomerAccountUrl('https://user:pass@accounts.example.com/account') === null);
check('Same-origin account URL loop is rejected', () => account.safeCustomerAccountUrl('https://buyhoreca.com/account', 'https://buyhoreca.com') === null);
check('Malformed account URL is rejected', () => account.safeCustomerAccountUrl('/account') === null);
check('Default hosted account URL works without vanity-domain configuration', () => account.shopifyCustomerLoginUrl('buyhoreca.myshopify.com', null, 'https://buyhoreca.com') === 'https://buyhoreca.myshopify.com/account/login');
check('Hosted account URL is derived from a valid Shopify store domain', () => account.shopifyCustomerLoginUrl('example-horeca.myshopify.com') === 'https://example-horeca.myshopify.com/account/login');
check('Unsafe store domain cannot become an external login redirect', () => account.shopifyCustomerLoginUrl('evil.example') === 'https://buyhoreca.myshopify.com/account/login');
check('Configured valid account vanity URL takes precedence', () => account.shopifyCustomerLoginUrl('buyhoreca.myshopify.com', 'https://accounts.buyhoreca.com') === 'https://accounts.buyhoreca.com/');
check('Shopify policy HTML becomes safe readable text with paragraphs and lists', () => {
  const value = policies.policyHtmlToText('<p>Return &amp; refund terms</p><ul><li>Keep receipt</li><li>Contact <a href="https://example.com">support</a></li></ul>');
  return value.includes('Return & refund terms') && value.includes('• Keep receipt') && value.includes('support (https://example.com)') && !/<[^>]+>/.test(value);
});
check('Executable or embedded content is removed from policy text', () => {
  const value = policies.policyHtmlToText('<p>Policy</p><script>alert(1)</script><iframe src="https://bad.test"></iframe><p>Safe text</p>');
  return value.includes('Policy') && value.includes('Safe text') && !value.includes('alert(1)') && !value.includes('bad.test') && !/[<>]/.test(value);
});
check('Invalid numeric HTML entities do not crash policy rendering', () => policies.policyHtmlToText('x&#x110000;y') === 'xy');
check('Exactly four supported policy routes are defined', () => Object.keys(policies.POLICY_ROUTES).sort().join(',') === 'privacy-policy,refund-policy,shipping-policy,terms-of-service');
const storefront = fs.readFileSync(path.join(ROOT, 'app/[[...slug]]/Storefront.tsx'), 'utf8');
const page = fs.readFileSync(path.join(ROOT, 'app/[[...slug]]/page.tsx'), 'utf8');
const sitemap = fs.readFileSync(path.join(ROOT, 'app/sitemap.ts'), 'utf8');
check('Account page always exposes a real Shopify-hosted sign-in/create-account link', () => storefront.includes('shopifyCustomerLoginUrl(') && storefront.includes('Sign in or create an account') && storefront.includes('href={accountUrl}') && !storefront.includes('Customer accounts need configuration'));
check('Account page no longer treats a missing vanity domain as disabled accounts', () => !storefront.includes('query CustomerAccountSettings{shop{customerAccountUrl}}') && !storefront.includes('status==="unconfigured"'));
check('Policy route reads Shopify policies and renders plain text rather than raw merchant HTML', () => storefront.includes('SHOP_POLICIES_QUERY') && storefront.includes('policyHtmlToText(policy?.body||"")') && !(/function PolicyPage[\s\S]*?function BrandLogoVisual/.exec(storefront)?.[0] || '').includes('dangerouslySetInnerHTML'));
check('Policy metadata is noindex until published and published policy routes are canonical', () => page.includes('robots: bodyText ? undefined : NO_INDEX_ROBOTS') && page.includes('url: `${baseUrl}/policies/${handle}`'));
check('Only published policy pages are emitted in the sitemap', () => sitemap.includes('policy.body.trim()') && sitemap.includes('...policyEntries'));
const failCount = results.filter(item => !item.pass).length;
for (const item of results) console.log(`${item.pass ? '[PASS]' : '[FAIL]'} ${item.name}${item.detail ? ` — ${item.detail}` : ''}`);
console.log(`ACCOUNT/POLICY TESTS: ${results.length - failCount}/${results.length} passed`);
if (failCount) process.exit(1);
