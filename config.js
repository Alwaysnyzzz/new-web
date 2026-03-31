// ╔══════════════════════════════════════════════════╗
// ║           DzzStore – config.js                   ║
// ║  Isi semua nilai di bawah sesuai milik kamu      ║
// ╚══════════════════════════════════════════════════╝

const CONFIG = {

  // ── SUPABASE ─────────────────────────────────────
  SUPABASE_URL : 'https://XXXXXXXX.supabase.co',
  SUPABASE_KEY : 'eyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',

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
