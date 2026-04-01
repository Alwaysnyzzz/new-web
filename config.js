// ╔══════════════════════════════════════════════════╗
// ║           DzzStore – config.js                   ║
// ║  Isi semua nilai di bawah sesuai milik kamu      ║
// ╚══════════════════════════════════════════════════╝

const CONFIG = {

  // ── SUPABASE ─────────────────────────────────────
  SUPABASE_URL : 'https://ccadysepuoxqeezwvdqu.supabase.co',
  SUPABASE_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjYWR5c2VwdW94cWVlend2ZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MTQ5MjYsImV4cCI6MjA5MDQ5MDkyNn0.F7bms684KoYLqddyaxQ1w8F2t9pIfqKKzOCputs51ss',
  // ── PTERODACTYL PANEL ────────────────────────────
  PTERO_URL    : 'https://panel.namawebmu.com',
  PTERO_API_KEY: 'ptla_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',

  // ── EGG & NEST (cek di Admin → Nests) ───────────
  PTERO_EGG_ID : 15,
  PTERO_NEST_ID: 1,

  // ── LAINNYA ──────────────────────────────────────
  SITE_URL     : 'https://nyzz.my.id',
  BUYER_DOMAIN : 'buyer.dzz',

};

// Jangan ubah di bawah ini
if (typeof module !== 'undefined') module.exports = CONFIG;
