// ╔══════════════════════════════════════════════════╗
// ║           DzzStore – auth.js                     ║
// ║  Muat di semua halaman sebelum </body>           ║
// ╚══════════════════════════════════════════════════╝

// ── Simpan & baca session ────────────────────────────
const Auth = {
  get()  { try { return JSON.parse(localStorage.getItem('dzz_user')); } catch { return null; } },
  set(u) { localStorage.setItem('dzz_user', JSON.stringify(u)); },
  clear(){ localStorage.removeItem('dzz_user'); },
  loggedIn() { return !!this.get(); },
};

// ── Halaman yang butuh login ─────────────────────────
const PROTECTED = ['/riwayat', '/profil'];

// ── Halaman yang harus redirect ke home kalau sudah login ──
const GUEST_ONLY = ['/login', '/register'];

// ── Auto redirect ────────────────────────────────────
(function() {
  const path = location.pathname.replace(/\.html$/, '');
  const user = Auth.get();

  // Sudah login tapi buka login/register → ke home
  if (user && GUEST_ONLY.some(p => path === p || path.startsWith(p))) {
    location.href = '/';
    return;
  }

  // Belum login tapi buka halaman protected → ke login
  if (!user && PROTECTED.some(p => path === p || path.startsWith(p))) {
    location.href = '/login?redirect=' + encodeURIComponent(location.pathname);
    return;
  }
})();

// ── Inisialisasi topbar (avatar + sapaan) ────────────
function initAuth() {
  const user = Auth.get();

  const dropGuest = document.getElementById('drop-guest');
  const dropUser  = document.getElementById('drop-user');
  const dropUname = document.getElementById('drop-uname');

  if (!dropGuest) return; // topbar tidak ada di halaman ini

  if (user) {
    // Sudah login
    if (dropGuest) dropGuest.style.display = 'none';
    if (dropUser)  dropUser.style.display  = 'block';
    if (dropUname) dropUname.textContent   = user.username;
  } else {
    // Belum login
    if (dropGuest) dropGuest.style.display = 'block';
    if (dropUser)  dropUser.style.display  = 'none';
  }
}

// ── Logout ───────────────────────────────────────────
function doLogout() {
  Auth.clear();
  // Kalau pakai Supabase, sign out juga
  if (typeof supabase !== 'undefined') {
    const url = typeof CONFIG !== 'undefined' ? CONFIG.SUPABASE_URL : null;
    const key = typeof CONFIG !== 'undefined' ? CONFIG.SUPABASE_KEY : null;
    if (url && key && !url.includes('XXXX')) {
      try { supabase.createClient(url, key).auth.signOut(); } catch(e) {}
    }
  }
  location.href = '/';
}

// ── Toggle avatar dropdown ───────────────────────────
function toggleAvatarDrop(e) {
  e.stopPropagation();
  document.getElementById('avatar-drop').classList.toggle('open');
}
function closeAvatarDrop() {
  const el = document.getElementById('avatar-drop');
  if (el) el.classList.remove('open');
}

// ── Sidebar helpers ──────────────────────────────────
function openSidebar()  {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('overlay').classList.add('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}
function toggleProdukDrop(btn) {
  const d = document.getElementById('sidebar-produk-drop');
  const c = btn.querySelector('.sidebar-chevron');
  if (!d) return;
  const open = d.classList.toggle('open');
  if (c) c.classList.toggle('open', open);
}

// ── Tutup dropdown kalau klik luar ──────────────────
document.addEventListener('click', closeAvatarDrop);

// ── Jalankan saat DOM siap ───────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}
