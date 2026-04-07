/**
 * Environment validation script.
 * 
 * In development (default): only checks that essential vars exist (DATABASE_URL, AUTH_SECRET).
 * In production mode:       enforces strong secrets, non-localhost URLs, etc.
 *
 * Usage:
 *   npx tsx scripts/check-production-env.ts          # dev mode
 *   NODE_ENV=production npx tsx scripts/check-production-env.ts  # production mode
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

const isProd = process.env.NODE_ENV === 'production';

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

// ── DATABASE ─────────────────────────────────────────────────────────
check(
  'DATABASE_URL',
  'error',
  !!process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql'),
  'DATABASE_URL must be set to a PostgreSQL connection string'
);

// ── AUTH ──────────────────────────────────────────────────────────────
check(
  'BETTER_AUTH_SECRET',
  isProd ? 'error' : 'warn',
  !!process.env.BETTER_AUTH_SECRET && (
    isProd
      ? process.env.BETTER_AUTH_SECRET !== 'dev-secret-key-change-in-production' && process.env.BETTER_AUTH_SECRET.length >= 32
      : true
  ),
  isProd
    ? 'BETTER_AUTH_SECRET must be a strong random string (min 32 chars). Generate with: openssl rand -base64 32'
    : 'BETTER_AUTH_SECRET is set (dev mode — strength not enforced)'
);

check(
  'BETTER_AUTH_URL',
  isProd ? 'error' : 'warn',
  !!process.env.BETTER_AUTH_URL && (isProd ? !process.env.BETTER_AUTH_URL.includes('localhost') : true),
  isProd ? 'BETTER_AUTH_URL must be your production URL (not localhost)' : 'BETTER_AUTH_URL is set'
);

check(
  'NEXT_PUBLIC_APP_URL',
  isProd ? 'error' : 'warn',
  !!process.env.NEXT_PUBLIC_APP_URL && (isProd ? !process.env.NEXT_PUBLIC_APP_URL.includes('localhost') : true),
  isProd ? 'NEXT_PUBLIC_APP_URL must be your production URL (not localhost)' : 'NEXT_PUBLIC_APP_URL is set'
);

// ── PAYMENT ──────────────────────────────────────────────────────────
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

check(
  'STRIPE_WEBHOOK_SECRET',
  'warn',
  !!process.env.STRIPE_WEBHOOK_SECRET && !process.env.STRIPE_WEBHOOK_SECRET.includes('whsec_...'),
  'STRIPE_WEBHOOK_SECRET should be set for Stripe webhook verification'
);

// ── EMAIL ────────────────────────────────────────────────────────────
check(
  'RESEND_API_KEY',
  'warn',
  !!process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('your_key'),
  'RESEND_API_KEY should be set for transactional emails'
);

check(
  'RESEND_FROM_EMAIL',
  'warn',
  !!process.env.RESEND_FROM_EMAIL && !process.env.RESEND_FROM_EMAIL.includes('yourdomain'),
  'RESEND_FROM_EMAIL should be set to your verified sender domain'
);

// ── OUTPUT ───────────────────────────────────────────────────────────
const mode = isProd ? '🚀 PRODUCTION' : '🛠️  DEVELOPMENT';
console.log(`\n🔍 Zivara Environment Check (${mode})\n`);
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
    console.log('\n✅ All checks passed!\n');
  }
  process.exit(0);
}
