/**
 * Production environment validation script.
 * Run before deploying: npx tsx scripts/check-production-env.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

interface Check {
  name: string;
  pass: boolean;
  severity: 'error' | 'warn';
  message: string;
}

const checks: Check[] = [];

function check(name: string, severity: 'error' | 'warn', pass: boolean, message: string) {
  checks.push({ name, severity, pass, message });
}

// ── Required env vars ────────────────────────────────────────────────
check(
  'DATABASE_URL',
  'error',
  !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('password@host'),
  'DATABASE_URL must be set to a real PostgreSQL connection string'
);

check(
  'BETTER_AUTH_SECRET',
  'error',
  !!process.env.BETTER_AUTH_SECRET &&
    process.env.BETTER_AUTH_SECRET !== 'dev-secret-key-change-in-production' &&
    process.env.BETTER_AUTH_SECRET.length >= 32,
  'BETTER_AUTH_SECRET must be a strong random string (min 32 chars). Generate with: openssl rand -base64 32'
);

check(
  'BETTER_AUTH_URL',
  'error',
  !!process.env.BETTER_AUTH_URL && !process.env.BETTER_AUTH_URL.includes('localhost'),
  'BETTER_AUTH_URL must be your production URL (not localhost)'
);

check(
  'NEXT_PUBLIC_APP_URL',
  'error',
  !!process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost'),
  'NEXT_PUBLIC_APP_URL must be your production URL (not localhost)'
);

// ── Payment ──────────────────────────────────────────────────────────
check(
  'STRIPE_SECRET_KEY',
  'warn',
  !!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your_key'),
  'STRIPE_SECRET_KEY should be set for payment processing'
);

check(
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'warn',
  !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes('your_key'),
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY should be set for payment processing'
);

// ── Email ────────────────────────────────────────────────────────────
check(
  'RESEND_API_KEY',
  'warn',
  !!process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('your_key'),
  'RESEND_API_KEY should be set for transactional emails (password reset, order confirmations)'
);

check(
  'RESEND_FROM_EMAIL',
  'warn',
  !!process.env.RESEND_FROM_EMAIL && !process.env.RESEND_FROM_EMAIL.includes('yourdomain'),
  'RESEND_FROM_EMAIL should be set to your verified sender domain (e.g. noreply@zivara.com)'
);

// ── Output ───────────────────────────────────────────────────────────
console.log('\n🔍 Zivara Production Environment Check\n');
console.log('─'.repeat(60));

let hasErrors = false;

for (const c of checks) {
  const icon = c.pass ? '✅' : c.severity === 'error' ? '❌' : '⚠️';
  console.log(`${icon} ${c.name}`);
  if (!c.pass) {
    console.log(`   ${c.message}`);
    if (c.severity === 'error') hasErrors = true;
  }
}

console.log('─'.repeat(60));

if (hasErrors) {
  console.log('\n❌ FAILED — fix the errors above before deploying.\n');
  process.exit(1);
} else {
  const warnings = checks.filter(c => !c.pass && c.severity === 'warn');
  if (warnings.length > 0) {
    console.log(`\n⚠️  PASSED with ${warnings.length} warning(s). Review above.\n`);
  } else {
    console.log('\n✅ All checks passed. Ready to deploy.\n');
  }
  process.exit(0);
}
