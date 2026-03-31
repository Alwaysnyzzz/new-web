// ╔══════════════════════════════════════════════════╗
// ║       DzzStore – pterodactyl.js                  ║
// ║  Semua fungsi API Pterodactyl Panel              ║
// ╚══════════════════════════════════════════════════╝
// Docs: https://dashflo.net/docs/api/pterodactyl/v1/

// Load config (browser: pastikan config.js dimuat duluan di HTML)
const C = typeof CONFIG !== 'undefined' ? CONFIG : require('./config.js');

const PTERO = {

  // ── HEADERS helper ──────────────────────────────
  _headers() {
    return {
      'Content-Type'  : 'application/json',
      'Accept'        : 'application/json',
      'Authorization' : 'Bearer ' + C.PTERO_API_KEY,
    };
  },

  // ── CREATE USER di panel ─────────────────────────
  // Docs: POST /api/application/users
  async createUser({ username, email, password, firstName = 'Buyer', lastName = 'DzzStore' }) {
    const res = await fetch(`${C.PTERO_URL}/api/application/users`, {
      method : 'POST',
      headers: this._headers(),
      body   : JSON.stringify({
        username,
        email,
        first_name : firstName,
        last_name  : lastName,
        password,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.errors?.[0]?.detail || 'Gagal buat user panel');
    // Returns: { object: 'user', attributes: { id, uuid, username, email, ... } }
    return data.attributes;
  },

  // ── GET USER by username ─────────────────────────
  // Docs: GET /api/application/users?filter[username]=xxx
  async getUserByUsername(username) {
    const res = await fetch(
      `${C.PTERO_URL}/api/application/users?filter[username]=${encodeURIComponent(username)}`,
      { headers: this._headers() }
    );
    const data = await res.json();
    if (!res.ok) throw new Error('Gagal cari user');
    const users = data.data || [];
    return users.find(u => u.attributes.username === username)?.attributes || null;
  },

  // ── UPDATE USER PASSWORD ─────────────────────────
  // Docs: PATCH /api/application/users/{id}
  async updateUserPassword(userId, newPassword) {
    const res = await fetch(`${C.PTERO_URL}/api/application/users/${userId}`, {
      method : 'PATCH',
      headers: this._headers(),
      body   : JSON.stringify({ password: newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error('Gagal update password');
    return data.attributes;
  },

  // ── CREATE SERVER ────────────────────────────────
  // Docs: POST /api/application/servers
  // node, allocation, image dihandle manual oleh admin
  async createServer({ name, userId, gb, cpu = 100 }) {
    const memMB  = gb * 1024;
    const diskMB = gb * 1024;

    const res = await fetch(`${C.PTERO_URL}/api/application/servers`, {
      method : 'POST',
      headers: this._headers(),
      body   : JSON.stringify({
        name,
        user        : userId,
        egg         : C.PTERO_EGG_ID,
        startup     : '{{SERVER_JARFILE}}',
        environment : {
          MINECRAFT_VERSION: 'latest',
          SERVER_JARFILE    : 'server.jar',
          BUILD_NUMBER      : 'latest',
        },
        limits: {
          memory : memMB,
          swap   : 0,
          disk   : diskMB,
          io     : 500,
          cpu    : cpu,
        },
        feature_limits: {
          databases   : 1,
          allocations : 1,
          backups     : 1,
        },
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.errors?.[0]?.detail || 'Gagal buat server');
    return data.attributes;
  },

  // ── GET SERVER ───────────────────────────────────
  async getServer(serverId) {
    const res = await fetch(`${C.PTERO_URL}/api/application/servers/${serverId}`, {
      headers: this._headers(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error('Server tidak ditemukan');
    return data.attributes;
  },

  // ── GET VPS STATS (runtime & spek) ──────────────
  // Ini pakai client API, bukan application API
  // Membutuhkan client API key (dari panel user)
  async getNodeStats() {
    try {
      const res = await fetch(`${C.PTERO_URL}/api/application/nodes/${C.PTERO_NODE_ID}`, {
        headers: this._headers(),
      });
      const data = await res.json();
      if (!res.ok) return { runtime: '~', spek: '~' };
      const attr  = data.attributes;
      const ram   = Math.round(attr.memory / 1024);   // GB
      const disk  = Math.round(attr.disk / 1024);     // GB
      return {
        runtime: attr.maintenance_mode ? 'Maintenance' : 'Online',
        spek   : `R${ram}C${attr.id}`,  // approximate
        raw    : attr,
      };
    } catch {
      return { runtime: '~', spek: '~' };
    }
  },

};

// ── GENERATE PASSWORD random 12 karakter ────────────
function genPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ── MAIN FLOW: Beli panel, langsung create ───────────
async function processBuy({ username, password, pkg, type }) {
  // pkg contoh: "3GB-15hari", type: 15 or 30
  const gbMatch = pkg.match(/^(\d+)GB/);
  const gb      = gbMatch ? parseInt(gbMatch[1]) : 1;
  const is30    = type === 30;
  const cpu     = is30 ? (100 + (gb-1)*25) : (100 + (gb-1)*15);
  const pass    = password || genPassword();
  const email   = username + '@' + C.BUYER_DOMAIN;

  // 1. Cek user sudah ada atau belum
  let panelUser = await PTERO.getUserByUsername(username);

  if (!panelUser) {
    // Buat user baru di panel
    panelUser = await PTERO.createUser({ username, email, password: pass });
  } else if (password) {
    // Update password kalau user isi
    await PTERO.updateUserPassword(panelUser.id, pass);
  }

  // 2. Buat server
  const serverName = `${username}-${gb}gb-${Date.now()}`;
  const server = await PTERO.createServer({
    name  : serverName,
    userId: panelUser.id,
    gb,
    cpu,
  });

  // 3. Return info lengkap
  const expDate = new Date(Date.now() + (is30 ? 30 : 15) * 24*60*60*1000);
  return {
    success   : true,
    username,
    email,
    password  : pass,
    serverName,
    serverId  : server.uuid,
    serverIdNum: server.id,
    ram       : gb + ' GB',
    cpu       : cpu + '%',
    disk      : gb + ' GB',
    panelUrl  : C.PTERO_URL,
    expires   : expDate.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }),
    pkg,
  };
}

if (typeof module !== 'undefined') {
  module.exports = { PTERO, processBuy, genPassword };
}
