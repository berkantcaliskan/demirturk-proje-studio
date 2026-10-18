// Demirtürk Yapı Karasu - Mimari Portföy & Satış Stüdyosu (v11 - 7/24 Sabit Bulut + Yerel Ağ Hibrit Mimari)

const PERMANENT_MOBILE_URL = "https://berkantcaliskan.github.io/demirturk-proje-studio/";
const CLOUD_RELAY_TOPIC = "demirturk_karasu_ofis_sync_v3_channel";
const IS_CLOUD_DIRECT_HOST =
  window.location.hostname.includes("github.io") || window.location.protocol === "file:";
const IS_TRYCLOUDFLARE_HOST = window.location.hostname.endsWith(".trycloudflare.com");
const STATUS_ORDER = ["SATILIK", "KAPORA", "PESINAT", "SATILDI", "KAPALI", "SATISA_KAPALI"];
const CLIENT_INSTANCE_ID =
  localStorage.getItem("demirturk_client_id") ||
  (() => {
    const id = "mob-" + Math.random().toString(36).slice(2, 10);
    try {
      localStorage.setItem("demirturk_client_id", id);
    } catch (_) {}
    return id;
  })();

function computeAdminHash(pwd) {
  const str = String(pwd || "1234").trim();
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch * 31 + i;
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  return "dmrtk-v1-" + (h1 >>> 0).toString(16) + "-" + (h2 >>> 0).toString(16) + "-" + str.length;
}

let state = {
  projects: Array.isArray(window.INITIAL_PROJECTS)
    ? JSON.parse(JSON.stringify(window.INITIAL_PROJECTS))
    : [],
  requests: [],
  history: [],
  selectedProjectId: null,
  selectedFloorId: null,
  selectedAptId: null,
  inspectorTab: "unit", // 'unit' | 'floor'
  mainView: "floorplan", // 'floorplan' | 'allfloors' | 'summary'
  clickMode: "INSPECT", // 'INSPECT' | 'CYCLE' | 'SATILIK' | 'KAPORA' | 'PESINAT' | 'SATILDI'
  customZoom: null, // null = otomatik ekrana sığdır, sayı = manuel zoom ölçeği
  showMobileCards: false,
  connectedClients: 1,
  lanIPs: [],
  fixedLanUrls: [],
  hostname: "berkant",
  port: 3050,
  cloudUrl: null,
  permanentMobileUrl: PERMANENT_MOBILE_URL,
  publicIp: null,
  hasCustomTunnel: false,
  customTunnelDomain: "",
  cloudDirectMode: IS_CLOUD_DIRECT_HOST,
  adminPasswordHash: computeAdminHash("1234"),
  isAdmin: false,
  adminToken: localStorage.getItem("demirturk_admin_token") || null
};

const STATUS_LABELS = {
  SATILIK: "SATILIK",
  KAPORA: "KAPORA ALINDI",
  PESINAT: "PEŞİNAT ALINDI",
  SATILDI: "SATILDI",
  KAPALI: "KAPALI",
  SATISA_KAPALI: "SATIŞA KAPALI"
};

function formatPrice(num) {
  if (!num && num !== 0) return "";
  return Number(num).toLocaleString("tr-TR") + " ₺";
}

function showToast(msg, borderColor = "#15803d") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.style.borderLeftColor = borderColor;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 250);
  }, 3400);
}

function isMobileViewport() {
  return window.innerWidth <= 1140;
}

function scheduleCanvasFit() {
  fitFloorplansToScreen();
  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(() => fitFloorplansToScreen());
  }
  setTimeout(fitFloorplansToScreen, 60);
  setTimeout(fitFloorplansToScreen, 160);
  setTimeout(fitFloorplansToScreen, 260);
}

// Sol Portföy & Proje Menüsü Açılır/Kapanır Kontrolü (Masaüstü + Tablet + Mobil)
function toggleLeftSidebar(forceOpen) {
  const shell = document.getElementById("studioShell") || document.querySelector(".studio-shell");
  const layout = document.getElementById("viewFloorplanSection");
  const sb = document.getElementById("studioSidebar");
  const ov = document.getElementById("mobileSidebarOverlay");
  const btn = document.getElementById("btnLeftMenuToggle");
  const mobBtn = document.getElementById("mobNavProjects");
  if (!sb) return;

  if (isMobileViewport()) {
    shell?.classList.remove("left-collapsed");
    const shouldOpen = forceOpen !== undefined ? Boolean(forceOpen) : !sb.classList.contains("open");
    if (shouldOpen) {
      // Sağ detay çekmecesi açıksa kapat
      const sheet = document.getElementById("studioInspector");
      sheet?.classList.remove("mobile-sheet-open");
      document.getElementById("mobileInspectorOverlay")?.classList.add("hidden");
      document.getElementById("mobNavInspector")?.classList.remove("active");
      document.getElementById("btnRightInspectorToggle")?.classList.remove("active");

      sb.classList.add("open");
      ov?.classList.remove("hidden");
    } else {
      sb.classList.remove("open");
      ov?.classList.add("hidden");
    }
    btn?.classList.toggle("active", shouldOpen);
    mobBtn?.classList.toggle("active", shouldOpen);
    scheduleCanvasFit();
  } else {
    sb.classList.remove("open");
    ov?.classList.add("hidden");
    if (!shell) return;
    const isCurrentlyCollapsed = shell.classList.contains("left-collapsed");
    const shouldOpen = forceOpen !== undefined ? Boolean(forceOpen) : isCurrentlyCollapsed;
    shell.classList.toggle("left-collapsed", !shouldOpen);
    btn?.classList.toggle("active", shouldOpen);

    // Orta/küçük ekranlarda (<= 1480px) iki yan menünün aynı anda açılıp ortadaki kat planını sıkıştırmasını önle
    if (shouldOpen && window.innerWidth <= 1480 && layout && !layout.classList.contains("right-collapsed")) {
      layout.classList.add("right-collapsed");
      document.getElementById("btnRightInspectorToggle")?.classList.remove("active");
    }
    scheduleCanvasFit();
  }
}

// Sağ Bağımsız Bölüm & Kat Detay Menüsü Açılır/Kapanır Kontrolü (Masaüstü + Tablet + Mobil)
function toggleRightInspector(forceOpen) {
  const shell = document.getElementById("studioShell") || document.querySelector(".studio-shell");
  const layout = document.getElementById("viewFloorplanSection");
  const sheet = document.getElementById("studioInspector");
  const ov = document.getElementById("mobileInspectorOverlay");
  const btn = document.getElementById("btnRightInspectorToggle");
  if (!sheet) return;

  if (isMobileViewport()) {
    layout?.classList.remove("right-collapsed");
    const shouldOpen = forceOpen !== undefined ? Boolean(forceOpen) : !sheet.classList.contains("mobile-sheet-open");
    if (shouldOpen) {
      // Sol menü çekmecesi açıksa kapat
      const sb = document.getElementById("studioSidebar");
      sb?.classList.remove("open");
      document.getElementById("mobileSidebarOverlay")?.classList.add("hidden");
      document.getElementById("btnLeftMenuToggle")?.classList.remove("active");
      document.getElementById("mobNavProjects")?.classList.remove("active");

      sheet.classList.add("mobile-sheet-open");
      ov?.classList.remove("hidden");
      document.getElementById("mobNavInspector")?.classList.add("active");
    } else {
      sheet.classList.remove("mobile-sheet-open");
      ov?.classList.add("hidden");
      document.getElementById("mobNavInspector")?.classList.remove("active");
    }
    btn?.classList.toggle("active", shouldOpen);
    scheduleCanvasFit();
  } else {
    sheet.classList.remove("mobile-sheet-open");
    ov?.classList.add("hidden");
    if (!layout) return;
    const isCurrentlyCollapsed = layout.classList.contains("right-collapsed");
    const shouldOpen = forceOpen !== undefined ? Boolean(forceOpen) : isCurrentlyCollapsed;
    layout.classList.toggle("right-collapsed", !shouldOpen);
    btn?.classList.toggle("active", shouldOpen);

    // Orta/küçük ekranlarda (<= 1480px) sağ detay menüsü açılınca sol menüyü daralt ki kat planı sıkışmasın
    if (shouldOpen && window.innerWidth <= 1480 && shell && !shell.classList.contains("left-collapsed")) {
      shell.classList.add("left-collapsed");
      document.getElementById("btnLeftMenuToggle")?.classList.remove("active");
    }
    scheduleCanvasFit();
  }
}

function toggleMobileSidebar(open) {
  if (isMobileViewport()) {
    toggleLeftSidebar(open);
  }
}

function toggleMobileInspectorSheet(open) {
  if (isMobileViewport()) {
    toggleRightInspector(open);
  }
}

function openMobileInspectorTab(tabName) {
  if (state.mainView !== "floorplan") {
    switchMainView("floorplan");
  }
  switchInspectorTab(tabName || "unit");
  toggleRightInspector(true);
}

function handleMobileAdminNavClick() {
  if (isMobileViewport()) {
    toggleLeftSidebar(false);
    toggleRightInspector(false);
  }
  if (state.isAdmin) {
    openAdminRequestsModal();
  } else {
    openAdminLoginModal();
  }
}

// ============================================================
// GERÇEK ZAMANLI SUNUCU & DOĞRUDAN BULUT (CLOUD-DIRECT) MOTORU
// ============================================================
let lastKnownUpdate = null;
let browserCloudSyncStarted = false;

async function decodeCloudOverlayBrowser(overlayStr) {
  if (!overlayStr || typeof overlayStr !== "string") return null;
  try {
    let jsonStr = null;
    if (overlayStr.startsWith("GZ:")) {
      const b64 = overlayStr.slice(3);
      const binStr = atob(b64);
      const bytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
      if (typeof DecompressionStream === "function") {
        const ds = new DecompressionStream("gzip");
        const writer = ds.writable.getWriter();
        writer.write(bytes);
        writer.close();
        const buf = await new Response(ds.readable).arrayBuffer();
        jsonStr = new TextDecoder().decode(buf);
      }
    } else if (overlayStr.startsWith("RAW:")) {
      const b64 = overlayStr.slice(4);
      const binStr = atob(b64);
      const bytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
      jsonStr = new TextDecoder().decode(bytes);
    }
    if (!jsonStr) return null;
    const c = JSON.parse(jsonStr);
    if (!c || typeof c !== "object") return null;

    const deletedSet = new Set(Array.isArray(c.dp) ? c.dp : []);
    const baseSource = Array.isArray(window.INITIAL_PROJECTS)
      ? window.INITIAL_PROJECTS
      : state.projects || [];
    const baseProjects = JSON.parse(JSON.stringify(baseSource)).filter((p) => !deletedSet.has(p.id));

    for (const p of baseProjects) {
      if (c.pm && c.pm[p.id]) {
        Object.assign(p, c.pm[p.id]);
      }
      for (const f of p.floors || []) {
        for (const a of f.apartments || []) {
          if (c.d && Array.isArray(c.d[a.id])) {
            const [st, pr, num, rm, bl] = c.d[a.id];
            if (st) a.status = st;
            if (pr !== undefined) a.price = Number(pr);
            if (num) a.number = num;
            if (rm) a.rooms = rm;
            if (bl) a.block = bl;
          }
        }
        const extraKey = `${p.id}__${f.id}`;
        if (c.ca && Array.isArray(c.ca[extraKey])) {
          for (const customApt of c.ca[extraKey]) {
            if (!f.apartments.some((x) => x.id === customApt.id)) {
              f.apartments.push(customApt);
            }
          }
        }
      }
    }

    if (Array.isArray(c.cp)) {
      for (const cp of c.cp) {
        if (cp && cp.id && !baseProjects.some((bp) => bp.id === cp.id)) {
          baseProjects.push(cp);
        }
      }
    }

    return {
      updatedAt: c.u || new Date().toISOString(),
      revision: Number(c.rev) || 1,
      projects: baseProjects,
      requests: Array.isArray(c.rq) ? c.rq : [],
      history: Array.isArray(c.hi) ? c.hi : [],
      adminPasswordHash: c.ah || computeAdminHash("1234")
    };
  } catch (err) {
    console.warn("Bulut paketi çözümlenemedi:", err);
    return null;
  }
}

async function handleCloudRelayEnvelopeInBrowser(envelope) {
  if (!envelope || (envelope.magic !== "DEMIRTURK_CLOUD_SYNC_V3" && envelope.app !== "DEMIRTURK_STUDIO_V3")) return;

  if (envelope.lanUrl) {
    try {
      const u = new URL(envelope.lanUrl);
      if (u.hostname && !state.lanIPs.includes(u.hostname)) {
        state.lanIPs.unshift(u.hostname);
      }
    } catch (_) {}
  }
  if (envelope.hostname) state.hostname = envelope.hostname;
  if (envelope.officeName) state.officeName = envelope.officeName;
  if (envelope.cloudUrl) state.cloudUrl = envelope.cloudUrl;

  if (envelope.overlay && typeof envelope.overlay === "string" && (envelope.overlay.startsWith("GZ:") || envelope.overlay.startsWith("RAW:"))) {
    const incomingTime = envelope.updatedAt ? new Date(envelope.updatedAt).getTime() : 0;
    const currentTime = lastKnownUpdate ? new Date(lastKnownUpdate).getTime() : 0;
    if (!lastKnownUpdate || incomingTime >= currentTime) {
      const decoded = await decodeCloudOverlayBrowser(envelope.overlay);
      if (decoded && Array.isArray(decoded.projects) && decoded.projects.length > 0) {
        if (decoded.adminPasswordHash) {
          state.adminPasswordHash = decoded.adminPasswordHash;
        }
        try {
          localStorage.setItem(
            "demirturk_cached_state_v3",
            JSON.stringify({
              updatedAt: decoded.updatedAt,
              projects: decoded.projects,
              requests: decoded.requests,
              history: decoded.history,
              adminPasswordHash: state.adminPasswordHash,
              lanIPs: state.lanIPs,
              hostname: state.hostname,
              officeName: state.officeName,
              cloudUrl: state.cloudUrl
            })
          );
        } catch (_) {}
        applyServerState(decoded, false);
      }
    }
  }
}

async function sendCloudMobileAction(actionPayload) {
  const actionType = actionPayload.actionType;
  const envelope = {
    magic: "DEMIRTURK_CLOUD_SYNC_V3",
    type: "CLOUD_CLIENT_ACTION",
    actionId: "act-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    clientId: CLIENT_INSTANCE_ID,
    sentAt: new Date().toISOString(),
    action: actionType,
    adminToken: state.adminToken || "",
    payload: {
      ...actionPayload,
      reqId: actionPayload.requestId,
      resolveAction: actionPayload.action
    }
  };
  const res = await fetch(`https://ntfy.sh/${CLOUD_RELAY_TOPIC}`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    },
    body: JSON.stringify(envelope)
  });
  return res.ok;
}

function startBrowserCloudSync() {
  if (browserCloudSyncStarted) return;
  browserCloudSyncStarted = true;

  async function pullLatestCloudSnapshot(sinceWindow = "2h", sendPingIfMissing = false) {
    try {
      const res = await fetch(`https://ntfy.sh/${CLOUD_RELAY_TOPIC}/json?poll=1&since=${sinceWindow}`, {
        cache: "no-store"
      });
      if (res.ok) {
        const text = await res.text();
        const lines = text.split("\n").filter((l) => l.trim().length > 0);
        let latestOverlayEnv = null;
        for (const line of lines) {
          try {
            const outer = JSON.parse(line);
            if (outer && outer.event === "message" && typeof outer.message === "string") {
              const inner = JSON.parse(outer.message);
              if (
                inner &&
                inner.magic === "DEMIRTURK_CLOUD_SYNC_V3" &&
                typeof inner.overlay === "string" &&
                (inner.overlay.startsWith("GZ:") || inner.overlay.startsWith("RAW:"))
              ) {
                if (
                  !latestOverlayEnv ||
                  new Date(inner.updatedAt || 0).getTime() >= new Date(latestOverlayEnv.updatedAt || 0).getTime()
                ) {
                  latestOverlayEnv = inner;
                }
              }
            }
          } catch (_) {}
        }
        if (latestOverlayEnv) {
          await handleCloudRelayEnvelopeInBrowser(latestOverlayEnv);
        } else if (sendPingIfMissing) {
          fetch(`https://ntfy.sh/${CLOUD_RELAY_TOPIC}`, {
            method: "POST",
            body: JSON.stringify({
              magic: "DEMIRTURK_CLOUD_SYNC_V3",
              type: "CLOUD_CLIENT_PING",
              clientId: CLIENT_INSTANCE_ID,
              sentAt: new Date().toISOString()
            })
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.warn("Bulut geçmişi okunamadı:", err);
    }
  }

  // 1. Önce buluttaki mesajları çek ve en güncel GZ/RAW paketini uygula
  pullLatestCloudSnapshot("2h", true);

  // 2. Canlı SSE akışını başlat (ofis bilgisayarında yapılan her işlem 0.3 sn içinde telefona düşer)
  function openCloudEventStream() {
    try {
      const cloudEs = new EventSource(`https://ntfy.sh/${CLOUD_RELAY_TOPIC}/sse`);
      cloudEs.onmessage = (ev) => {
        try {
          const outer = JSON.parse(ev.data);
          if (outer && outer.event === "message" && typeof outer.message === "string") {
            const inner = JSON.parse(outer.message);
            handleCloudRelayEnvelopeInBrowser(inner);
          }
        } catch (_) {}
      };
    } catch (_) {}
  }
  openCloudEventStream();

  // 3. Mobil tarayıcı ekranı kilitlenip açıldığında veya arka plandan döndüğünde anında eşitle
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      pullLatestCloudSnapshot("15m", false);
    }
  });
  setInterval(() => {
    if (document.visibilityState === "visible") {
      pullLatestCloudSnapshot("2m", false);
    }
  }, 8000);
}

function applyServerState(data, isIncremental = false) {
  if (!data) return;

  // Sadece bağlı ekran sayısı değiştiyse veya veri değişmediyse tüm DOM'u yeniden çizme
  if (data.unchanged || data.type === "CLIENTS_COUNT") {
    if (data.connectedClients !== undefined) state.connectedClients = data.connectedClients;
    if (data.cloudUrl !== undefined) state.cloudUrl = data.cloudUrl;
    if (data.permanentMobileUrl) state.permanentMobileUrl = data.permanentMobileUrl;
    if (data.officeName !== undefined) state.officeName = data.officeName;
    if (Array.isArray(data.peers)) state.peers = data.peers;
    updateSyncBadge(true);
    return;
  }

  const changed = !lastKnownUpdate || (data.updatedAt && data.updatedAt !== lastKnownUpdate);
  if (data.updatedAt) lastKnownUpdate = data.updatedAt;

  if (data.projects) state.projects = data.projects;
  if (data.requests) state.requests = data.requests;
  if (data.history) state.history = data.history;
  if (data.connectedClients !== undefined) state.connectedClients = data.connectedClients;
  if (data.lanIPs && data.lanIPs.length) state.lanIPs = data.lanIPs;
  if (data.fixedLanUrls) state.fixedLanUrls = data.fixedLanUrls;
  if (data.hostname) state.hostname = data.hostname;
  if (data.officeName !== undefined) state.officeName = data.officeName;
  if (Array.isArray(data.peers)) state.peers = data.peers;
  if (data.port) state.port = data.port;
  if (data.cloudUrl !== undefined) state.cloudUrl = data.cloudUrl;
  if (data.permanentMobileUrl) state.permanentMobileUrl = data.permanentMobileUrl;
  if (data.publicIp !== undefined) state.publicIp = data.publicIp;
  if (data.hasCustomTunnel !== undefined) state.hasCustomTunnel = data.hasCustomTunnel;
  if (data.customTunnelDomain !== undefined) state.customTunnelDomain = data.customTunnelDomain;
  if (data.adminPasswordHash) state.adminPasswordHash = data.adminPasswordHash;

  try {
    localStorage.setItem(
      "demirturk_cached_state_v3",
      JSON.stringify({
        updatedAt: state.updatedAt || lastKnownUpdate || new Date().toISOString(),
        projects: state.projects,
        requests: state.requests,
        history: state.history,
        adminPasswordHash: state.adminPasswordHash,
        lanIPs: state.lanIPs,
        hostname: state.hostname,
        officeName: state.officeName,
        cloudUrl: state.cloudUrl
      })
    );
  } catch (_) {}

  ensureValidSelection();
  updateSyncBadge(true);

  if (!document.getElementById("networkModal")?.classList.contains("hidden")) {
    renderNetworkModalContent();
  }

  if (!isIncremental || changed) {
    renderAll();
    if (!document.getElementById("adminRequestsModal")?.classList.contains("hidden")) {
      renderAdminRequestsList();
    }
  }
}

async function fetchStateNow(isIncremental = false) {
  if (IS_CLOUD_DIRECT_HOST) {
    return;
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const sinceParam = isIncremental && lastKnownUpdate ? `?since=${encodeURIComponent(lastKnownUpdate)}` : `?t=${Date.now()}`;
    const res = await fetch("/api/state" + sinceParam, {
      cache: "no-store",
      signal: controller.signal
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      state.cloudDirectMode = false;
      applyServerState(data, isIncremental);
    }
  } catch (err) {
    // Eğer yerel sunucu veya Cloudflare tüneli yanıt vermiyorsa otomatik olarak Doğrudan Bulut Moduna geç
    state.cloudDirectMode = true;
    startBrowserCloudSync();
  }
}

function connectRealtime() {
  // 1. Önce yerel önbellekteki (localStorage) son durumu veya başlangıç projelerini 0ms'de çiz
  try {
    const cachedRaw = localStorage.getItem("demirturk_cached_state_v3");
    if (cachedRaw && !window.__INITIAL_STATE__) {
      const cached = JSON.parse(cachedRaw);
      if (cached && Array.isArray(cached.projects) && cached.projects.length > 0) {
        applyServerState(cached, false);
      }
    }
  } catch (_) {}

  if (window.__INITIAL_STATE__) {
    applyServerState(window.__INITIAL_STATE__, false);
    window.__INITIAL_STATE__ = null;
  } else if (state.projects && state.projects.length > 0) {
    ensureValidSelection();
    renderAll();
  }

  // 2. Eğer Sabit Bulut Web Adresindeysek (github.io) veya Cloudflare tünelindeysek doğrudan Bulut Senkronizasyonunu başlat
  if (IS_CLOUD_DIRECT_HOST || IS_TRYCLOUDFLARE_HOST) {
    startBrowserCloudSync();
  }

  if (IS_CLOUD_DIRECT_HOST) {
    updateSyncBadge(true);
    return;
  }

  // 3. Yerel Sunucu (localhost veya 192.168.x.x) bağlantısı
  fetchStateNow(false);

  setInterval(() => {
    fetchStateNow(true);
  }, 4500);

  // Cloudflare ücretsiz tünelde SSE uzun bağlantısı tüneli tıkadığı için sadece yerel ağda /api/events aç
  if (!IS_TRYCLOUDFLARE_HOST) {
    try {
      const evtSource = new EventSource("/api/events");

      evtSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "CLIENTS_COUNT") {
            applyServerState(data, true);
            return;
          }
          applyServerState(data, false);

          if (data.type === "STATE_UPDATE" && data.actionInfo) {
            const info = data.actionInfo;
            if (info.eventType === "PEER_SYNC") {
              showToast(`${info.peerName || "Diğer Ofis"} anabilgisayarı ile veriler eşitlendi.`, "#2563eb");
            } else if (info.eventType === "NEW_REQUEST" && info.request) {
              const r = info.request;
              const stLabel = STATUS_LABELS[r.requestedStatus] || r.requestedStatus;
              showToast(
                `Yeni Talep (${r.requesterName}): ${r.projectName} • ${r.apartmentNumber} → ${stLabel}`,
                "#d97706"
              );
            } else if (info.apartmentNumber) {
              const stLabel = STATUS_LABELS[info.newStatus] || info.newStatus;
              const colorMap = {
                SATILIK: "#15803d",
                KAPORA: "#d97706",
                PESINAT: "#1d4ed8",
                SATILDI: "#b91c1c",
                KAPALI: "#991b1b",
                SATISA_KAPALI: "#0f172a"
              };
              showToast(
                `${info.projectName} • ${info.floorName} (${info.block}) ${info.apartmentNumber} → ${stLabel}`,
                colorMap[info.newStatus] || "#15803d"
              );
            }
          }
        } catch (err) {
          console.error("SSE parse error:", err);
        }
      };

      evtSource.onerror = () => {};
    } catch (e) {
      console.warn("EventSource desteklenmiyor, polling aktif.");
    }
  }
}

function updateSyncBadge(online) {
  const badge = document.getElementById("syncBadge");
  const text = document.getElementById("syncText");
  const peerBtn = document.getElementById("btnAddPeerHost");
  if (!badge || !text) return;
  const peers = Array.isArray(state.peers) ? state.peers : [];
  const onlinePeers = peers.filter((p) => p.status === "ONLINE").length;

  if (peerBtn) {
    const span = peerBtn.querySelector("span");
    if (span) {
      span.textContent =
        peers.length > 0
          ? `Anabilgisayarlar (${onlinePeers}/${peers.length} Bağlı)`
          : "Başka Anabilgisayar Ekle";
    }
  }

  if (online) {
    badge.classList.remove("offline");
    badge.classList.add("online");
    if (IS_CLOUD_DIRECT_HOST || state.cloudDirectMode) {
      text.textContent = `7/24 Sabit Bulut Senkron Aktif`;
    } else if (peers.length > 0) {
      text.textContent = `Canlı Senkron (${state.connectedClients} Ekran • ${onlinePeers}/${peers.length} Ofis)`;
    } else {
      text.textContent = `Canlı Senkronizasyon (${state.connectedClients} Cihaz)`;
    }
  } else {
    badge.classList.remove("online");
    badge.classList.add("offline");
    text.textContent = "Bağlantı Yenileniyor...";
  }
}

function ensureValidSelection() {
  if (!state.projects.length) return;
  let proj = state.projects.find((p) => p.id === state.selectedProjectId);
  if (!proj) {
    proj = state.projects[0];
    state.selectedProjectId = proj.id;
  }
  if (proj.floors && proj.floors.length) {
    let fl = proj.floors.find((f) => f.id === state.selectedFloorId);
    if (!fl) {
      fl = proj.floors[0];
      state.selectedFloorId = fl.id;
    }
    if (fl.apartments && fl.apartments.length) {
      const apt = fl.apartments.find((a) => a.id === state.selectedAptId);
      if (!apt) {
        state.selectedAptId = fl.apartments[0].id;
      }
    }
  }
}

// ============================================================
// GÖRÜNÜM & KONTROL FONKSİYONLARI
// ============================================================
function switchMainView(viewName) {
  state.mainView = viewName;
  document.querySelectorAll(".nav-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewName);
  });

  document.getElementById("mobNavFloorplan")?.classList.toggle("active", viewName === "floorplan" || viewName === "allfloors");
  document.getElementById("mobNavSummary")?.classList.toggle("active", viewName === "summary");

  const fpSection = document.getElementById("viewFloorplanSection");
  const sumSection = document.getElementById("viewSummarySection");
  const singleContainer = document.getElementById("singleFloorContainer");
  const allFloorsContainer = document.getElementById("allFloorsContainer");

  if (viewName === "summary") {
    fpSection.classList.add("hidden");
    sumSection.classList.remove("hidden");
  } else {
    fpSection.classList.remove("hidden");
    sumSection.classList.add("hidden");
    if (viewName === "allfloors") {
      singleContainer.classList.add("hidden");
      allFloorsContainer.classList.remove("hidden");
    } else {
      singleContainer.classList.toggle("hidden", state.showMobileCards);
      allFloorsContainer.classList.add("hidden");
    }
  }
  toggleMobileSidebar(false);
  renderCurrentView();
}

function switchInspectorTab(tabName) {
  state.inspectorTab = tabName;
  document.getElementById("tabBtnInspectorUnit")?.classList.toggle("active", tabName === "unit");
  document.getElementById("tabBtnInspectorFloor")?.classList.toggle("active", tabName === "floor");
  document.getElementById("inspectorUnitPane")?.classList.toggle("hidden", tabName !== "unit");
  document.getElementById("inspectorFloorPane")?.classList.toggle("hidden", tabName !== "floor");
}

function setClickMode(mode) {
  state.clickMode = mode;
  document.querySelectorAll(".mode-pill").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
}

function selectProject(projectId) {
  state.selectedProjectId = projectId;
  state.customZoom = null;
  const proj = state.projects.find((p) => p.id === projectId);
  if (proj && proj.floors.length) {
    state.selectedFloorId = proj.floors[0].id;
    if (proj.floors[0].apartments.length) {
      state.selectedAptId = proj.floors[0].apartments[0].id;
    }
  }
  toggleMobileSidebar(false);
  renderAll();
}

function selectFloor(floorId) {
  state.selectedFloorId = floorId;
  const proj = state.projects.find((p) => p.id === state.selectedProjectId);
  const fl = proj?.floors.find((f) => f.id === floorId);
  if (fl && fl.apartments.length) {
    state.selectedAptId = fl.apartments[0].id;
  }
  if (state.mainView === "allfloors") {
    switchMainView("floorplan");
  } else {
    renderAll();
  }
}

function selectApartmentForInspector(projectId, floorId, apartmentId) {
  state.selectedProjectId = projectId;
  state.selectedFloorId = floorId;
  state.selectedAptId = apartmentId;
  switchInspectorTab("unit");
  renderAll();
  toggleRightInspector(true);
}

// ============================================================
// RENDER ANA FONKSİYONLARI
// ============================================================
function updateAdminUI() {
  const isAdmin = !!state.isAdmin;
  const pendingCount = (state.requests || []).filter((r) => r.status === "PENDING").length;

  document.getElementById("btnAdminLogin")?.classList.toggle("hidden", isAdmin);
  document.getElementById("adminSessionBar")?.classList.toggle("hidden", !isAdmin);
  document.getElementById("btnAdminRequests")?.classList.toggle("hidden", !isAdmin);
  document.getElementById("btnNewProject")?.classList.toggle("hidden", !isAdmin);
  document.getElementById("adminProjectMetaActions")?.classList.toggle("hidden", !isAdmin);
  document.getElementById("adminClickModeGroup")?.classList.toggle("hidden", !isAdmin);
  document.getElementById("viewerModeNotice")?.classList.toggle("hidden", isAdmin);
  document.getElementById("adminResetZone")?.classList.toggle("hidden", !isAdmin);

  const badge = document.getElementById("pendingRequestsBadge");
  if (badge) {
    badge.textContent = pendingCount;
    badge.style.background = pendingCount > 0 ? "#dc2626" : "#475569";
  }

  const mobAdminLabel = document.getElementById("mobNavAdminLabel");
  if (mobAdminLabel) {
    mobAdminLabel.textContent = isAdmin ? "Talepler" : "Yönetici";
  }
  const mobBadge = document.getElementById("mobPendingBadge");
  if (mobBadge) {
    mobBadge.textContent = pendingCount;
    mobBadge.classList.toggle("hidden", !isAdmin || pendingCount === 0);
  }
}

function renderAll() {
  updateAdminUI();
  renderKpiStrip();
  renderProjectTabs();
  renderActiveProjectHeader();
  renderFloorTabs();
  populateFilterProjectDropdown();
  renderStudioInspector();
  renderMobileFloorCards();
  renderActivityFeed();
  renderCurrentView();
}

function renderCurrentView() {
  if (state.mainView === "summary") {
    renderSummaryTable();
  } else if (state.mainView === "allfloors") {
    renderAllFloorsPresentation();
  } else {
    renderSingleFloorPlan();
  }
}

// Sol Sidebar Genel Portföy Telemetri Özeti
function renderKpiStrip() {
  const strip = document.getElementById("kpiStrip");
  if (!strip) return;

  let total = 0,
    satilik = 0,
    kapora = 0,
    pesinat = 0,
    satildi = 0,
    kapali = 0,
    satisaKapali = 0;

  state.projects.forEach((p) => {
    p.floors.forEach((f) => {
      f.apartments.forEach((a) => {
        total++;
        if (a.status === "SATILIK") satilik++;
        else if (a.status === "KAPORA") kapora++;
        else if (a.status === "PESINAT") pesinat++;
        else if (a.status === "SATILDI") satildi++;
        else if (a.status === "KAPALI") kapali++;
        else if (a.status === "SATISA_KAPALI") satisaKapali++;
      });
    });
  });

  const soldRatio = total > 0 ? Math.round(((satildi + kapora + pesinat) / total) * 100) : 0;
  const pSatildi = total > 0 ? (satildi / total) * 100 : 0;
  const pPesinat = total > 0 ? (pesinat / total) * 100 : 0;
  const pKapora = total > 0 ? (kapora / total) * 100 : 0;
  const pKapali = total > 0 ? (kapali / total) * 100 : 0;
  const pSatisaKapali = total > 0 ? (satisaKapali / total) * 100 : 0;
  const pSatilik = total > 0 ? (satilik / total) * 100 : 0;

  strip.innerHTML = `
    <div class="telemetry-box">
      <div class="telemetry-top">
        <span class="telemetry-title">Portföy Genel Durumu (${total})</span>
        <span class="telemetry-rate">%${soldRatio} İşlemde</span>
      </div>
      <div class="telemetry-bar">
        <div class="telemetry-seg-satildi" style="width:${pSatildi}%"></div>
        <div class="telemetry-seg-pesinat" style="width:${pPesinat}%"></div>
        <div class="telemetry-seg-kapora" style="width:${pKapora}%"></div>
        <div class="telemetry-seg-kapali" style="width:${pKapali}%"></div>
        <div class="telemetry-seg-satisa-kapali" style="width:${pSatisaKapali}%"></div>
        <div class="telemetry-seg-satilik" style="width:${pSatilik}%"></div>
      </div>
      <div class="telemetry-grid">
        <div class="t-stat">
          <span class="t-stat-val" style="color:#4ade80;">${satilik}</span>
          <span class="t-stat-lbl">Satılık</span>
        </div>
        <div class="t-stat">
          <span class="t-stat-val" style="color:#fbbf24;">${kapora}</span>
          <span class="t-stat-lbl">Kapora</span>
        </div>
        <div class="t-stat">
          <span class="t-stat-val" style="color:#60a5fa;">${pesinat}</span>
          <span class="t-stat-lbl">Peşinat</span>
        </div>
        <div class="t-stat">
          <span class="t-stat-val" style="color:#f87171;">${satildi}</span>
          <span class="t-stat-lbl">Satıldı</span>
        </div>
        <div class="t-stat">
          <span class="t-stat-val" style="color:#fca5a5;">${kapali}</span>
          <span class="t-stat-lbl">Kapalı</span>
        </div>
        <div class="t-stat">
          <span class="t-stat-val" style="color:#e2e8f0;">${satisaKapali}</span>
          <span class="t-stat-lbl">Satışa K.</span>
        </div>
      </div>
    </div>
  `;
}

// Sol Sidebar Dikey Proje Portföy Listesi
function renderProjectTabs() {
  const container = document.getElementById("projectTabs");
  if (!container) return;

  const query = (document.getElementById("sidebarProjectSearch")?.value || "").trim().toLowerCase();

  const filteredProjects = state.projects.filter((proj) => {
    if (!query) return true;
    return `${proj.name} ${proj.neighborhood} ${proj.adaParsel}`.toLowerCase().includes(query);
  });

  container.innerHTML = filteredProjects
    .map((proj) => {
      let total = 0,
        satilik = 0,
        kapora = 0,
        pesinat = 0,
        satildi = 0,
        kapali = 0,
        satisaKapali = 0;
      proj.floors.forEach((f) =>
        f.apartments.forEach((a) => {
          total++;
          if (a.status === "SATILIK") satilik++;
          else if (a.status === "KAPORA") kapora++;
          else if (a.status === "PESINAT") pesinat++;
          else if (a.status === "SATILDI") satildi++;
          else if (a.status === "KAPALI") kapali++;
          else if (a.status === "SATISA_KAPALI") satisaKapali++;
        })
      );
      const isActive = proj.id === state.selectedProjectId;
      const editBtnHTML = state.isAdmin
        ? `<span class="proj-edit-trigger" onclick="openEditProjectModal(event, '${proj.id}')" title="Proje adını ve bilgilerini düzenle">
             <svg class="icon-svg-sm" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
           </span>`
        : "";

      const pSatildi = total > 0 ? (satildi / total) * 100 : 0;
      const pPesinat = total > 0 ? (pesinat / total) * 100 : 0;
      const pKapora = total > 0 ? (kapora / total) * 100 : 0;
      const pKapali = total > 0 ? (kapali / total) * 100 : 0;
      const pSatisaKapali = total > 0 ? (satisaKapali / total) * 100 : 0;
      const pSatilik = total > 0 ? (satilik / total) * 100 : 0;

      return `
        <div class="project-tab ${isActive ? "active" : ""}" onclick="selectProject('${proj.id}')">
          <div class="pt-top-row">
            <div class="pt-title">
              <span>${proj.name}</span>
              ${editBtnHTML}
            </div>
            <span class="pt-badge">${satilik}/${total}</span>
          </div>
          <div class="pt-sub-row">
            <span>${proj.neighborhood} • ${proj.adaParsel}</span>
          </div>
          <div class="pt-mini-bar">
            <div class="telemetry-seg-satildi" style="width:${pSatildi}%"></div>
            <div class="telemetry-seg-pesinat" style="width:${pPesinat}%"></div>
            <div class="telemetry-seg-kapora" style="width:${pKapora}%"></div>
            <div class="telemetry-seg-kapali" style="width:${pKapali}%"></div>
            <div class="telemetry-seg-satisa-kapali" style="width:${pSatisaKapali}%"></div>
            <div class="telemetry-seg-satilik" style="width:${pSatilik}%"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

// Üst Komuta Barı: Seçili Proje Kimliği ve Metrikleri
function renderActiveProjectHeader() {
  const headerEl = document.getElementById("activeProjectHeader");
  const metricsEl = document.getElementById("activeProjectMetrics");
  const proj = state.projects.find((p) => p.id === state.selectedProjectId);
  if (!proj) return;

  let total = 0,
    satilik = 0,
    kapora = 0,
    pesinat = 0,
    satildi = 0,
    kapali = 0,
    satisaKapali = 0;
  proj.floors.forEach((f) =>
    f.apartments.forEach((a) => {
      total++;
      if (a.status === "SATILIK") satilik++;
      else if (a.status === "KAPORA") kapora++;
      else if (a.status === "PESINAT") pesinat++;
      else if (a.status === "SATILDI") satildi++;
      else if (a.status === "KAPALI") kapali++;
      else if (a.status === "SATISA_KAPALI") satisaKapali++;
    })
  );

  if (headerEl) {
    headerEl.innerHTML = `
      <div class="cmd-proj-title">${proj.name}</div>
      <div class="cmd-proj-pills">
        <span class="cmd-meta-pill">${proj.neighborhood} • ${proj.adaParsel}</span>
        <span class="cmd-meta-pill pill-delivery">Teslim: ${proj.deliveryDate}</span>
        <span class="cmd-meta-pill pill-gold">${proj.paymentPlan}</span>
      </div>
    `;
  }

  if (metricsEl) {
    metricsEl.innerHTML = `
      <div class="proj-metric-chip"><span class="status-dot dot-satilik"></span><span>Müsait:</span><strong>${satilik}</strong></div>
      <div class="proj-metric-chip"><span class="status-dot dot-kapora"></span><span>Kapora:</span><strong>${kapora}</strong></div>
      <div class="proj-metric-chip"><span class="status-dot dot-pesinat"></span><span>Peşinat:</span><strong>${pesinat}</strong></div>
      <div class="proj-metric-chip"><span class="status-dot dot-satildi"></span><span>Satıldı:</span><strong>${satildi}</strong></div>
      <div class="proj-metric-chip"><span class="status-dot dot-kapali"></span><span>Kapalı:</span><strong>${kapali}</strong></div>
      <div class="proj-metric-chip"><span class="status-dot dot-satisa-kapali"></span><span>Satışa Kapalı:</span><strong>${satisaKapali}</strong></div>
    `;
  }
}

// Sol Dikey Bina Kesiti (Kat Seçici Asansör)
function renderFloorTabs() {
  const container = document.getElementById("floorTabs");
  if (!container) return;
  const proj = state.projects.find((p) => p.id === state.selectedProjectId);
  if (!proj) {
    container.innerHTML = "";
    return;
  }

  // Bina kesiti hissi için katları üst kattan zemin kata doğru sıralı gösterelim (dizi kopyasını ters çevirerek)
  const floorsReversed = [...proj.floors].reverse();

  container.innerHTML = floorsReversed
    .map((fl) => {
      const avail = fl.apartments.filter((a) => a.status === "SATILIK").length;
      const isActive = fl.id === state.selectedFloorId && state.mainView === "floorplan";

      const dotStyles = {
        SATILIK: "background:#ffffff;border:1px solid #64748b;",
        KAPORA: "background:#d97706;",
        PESINAT: "background:#2563eb;",
        SATILDI: "background:#dc2626;",
        KAPALI: "background:repeating-linear-gradient(-45deg,#dc2626 0 2px,#ffffff 2px 4px);border:1px solid #991b1b;",
        SATISA_KAPALI: "background:repeating-linear-gradient(-45deg,#0f172a 0 2px,#ffffff 2px 4px);border:1px solid #0f172a;"
      };
      const dotsHTML = fl.apartments
        .slice(0, 18)
        .map((a) => `<span class="floor-mini-dot" style="${dotStyles[a.status] || dotStyles.SATILIK}"></span>`)
        .join("");

      return `
        <button class="floor-btn ${isActive ? "active" : ""}" onclick="selectFloor('${fl.id}')">
          <div class="floor-btn-top">
            <span class="floor-btn-name">${fl.name}</span>
            <span class="floor-btn-count">${avail}/${fl.apartments.length}</span>
          </div>
          <div class="floor-btn-dots">${dotsHTML}</div>
        </button>
      `;
    })
    .join("");
}

// Sağ Dock: Bağımsız Bölüm Denetçisi (Unit Inspector) ve Kat Listesi
function renderStudioInspector() {
  const unitPane = document.getElementById("inspectorUnitPane");
  const floorUnitsList = document.getElementById("inspectorFloorUnitsList");
  if (!unitPane) return;

  const proj = state.projects.find((p) => p.id === state.selectedProjectId);
  if (!proj) return;
  const floor = proj.floors.find((f) => f.id === state.selectedFloorId) || proj.floors[0];
  if (!floor) return;
  const apt = floor.apartments.find((a) => a.id === state.selectedAptId) || floor.apartments[0];

  // Kat Listesi Sekmesini Doldur
  if (floorUnitsList) {
    floorUnitsList.innerHTML = floor.apartments
      .map((a) => {
        const isSel = apt && a.id === apt.id;
        const dotMap = {
          SATILIK: "dot-satilik",
          KAPORA: "dot-kapora",
          PESINAT: "dot-pesinat",
          SATILDI: "dot-satildi",
          KAPALI: "dot-kapali",
          SATISA_KAPALI: "dot-satisa-kapali"
        };
        return `
          <div class="ins-unit-row ${isSel ? "selected" : ""}" onclick="selectApartmentForInspector('${proj.id}', '${floor.id}', '${a.id}')">
            <div class="ins-unit-left">
              <span class="status-dot ${dotMap[a.status] || "dot-satilik"}"></span>
              <div>
                <div class="ins-unit-title">${a.number} <span style="font-weight:600;color:#64748b;">(${a.rooms || "2+1"})</span></div>
                <div class="ins-unit-sub">${a.block} • ${STATUS_LABELS[a.status]}</div>
              </div>
            </div>
            <div class="ins-unit-price">${formatPrice(a.price)}</div>
          </div>
        `;
      })
      .join("");
  }

  if (!apt) {
    unitPane.innerHTML = `<div style="color:#64748b;font-size:0.82rem;">Kat planından bir bağımsız bölüm seçiniz.</div>`;
    return;
  }

  const pendingReq = (state.requests || []).find(
    (r) => r.apartmentId === apt.id && r.projectId === proj.id && r.status === "PENDING"
  );

  const pendingAlertHTML = pendingReq
    ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-left:3px solid #d97706;padding:10px 12px;border-radius:8px;font-size:0.76rem;color:#78350f;">
         <strong>Onay Bekleyen Talep:</strong> ${pendingReq.requesterName} tarafından <strong>${STATUS_LABELS[pendingReq.requestedStatus]}</strong> durumu talep edildi.
       </div>`
    : "";

  let actionZoneHTML = "";
  if (state.isAdmin) {
    actionZoneHTML = `
      <div>
        <div class="inspector-section-title">HIZLI SATIŞ DURUMU DEĞİŞTİR</div>
        <div class="status-matrix-grid">
          <button type="button" class="btn-status-matrix ${apt.status === "SATILIK" ? "active-SATILIK" : ""}"
                  onclick="setApartmentStatusDirect('${proj.id}', '${floor.id}', '${apt.id}', 'SATILIK')">
            <span class="status-dot dot-satilik"></span>
            <span>Satılık</span>
          </button>
          <button type="button" class="btn-status-matrix ${apt.status === "KAPORA" ? "active-KAPORA" : ""}"
                  onclick="setApartmentStatusDirect('${proj.id}', '${floor.id}', '${apt.id}', 'KAPORA')">
            <span class="status-dot dot-kapora"></span>
            <span>Kapora</span>
          </button>
          <button type="button" class="btn-status-matrix ${apt.status === "PESINAT" ? "active-PESINAT" : ""}"
                  onclick="setApartmentStatusDirect('${proj.id}', '${floor.id}', '${apt.id}', 'PESINAT')">
            <span class="status-dot dot-pesinat"></span>
            <span>Peşinat</span>
          </button>
          <button type="button" class="btn-status-matrix ${apt.status === "SATILDI" ? "active-SATILDI" : ""}"
                  onclick="setApartmentStatusDirect('${proj.id}', '${floor.id}', '${apt.id}', 'SATILDI')">
            <span class="status-dot dot-satildi"></span>
            <span>Satıldı</span>
          </button>
          <button type="button" class="btn-status-matrix ${apt.status === "KAPALI" ? "active-KAPALI" : ""}"
                  onclick="setApartmentStatusDirect('${proj.id}', '${floor.id}', '${apt.id}', 'KAPALI')">
            <span class="status-dot dot-kapali"></span>
            <span>Kapalı</span>
          </button>
          <button type="button" class="btn-status-matrix ${apt.status === "SATISA_KAPALI" ? "active-SATISA_KAPALI" : ""}"
                  onclick="setApartmentStatusDirect('${proj.id}', '${floor.id}', '${apt.id}', 'SATISA_KAPALI')">
            <span class="status-dot dot-satisa-kapali"></span>
            <span>Satışa Kapalı</span>
          </button>
        </div>
      </div>

      <form class="inspector-card-form" onsubmit="submitInspectorQuickEdit(event, '${proj.id}', '${floor.id}', '${apt.id}')">
        <div class="inspector-section-title" style="margin-bottom:2px;">FİYAT &amp; BİLGİ GÜNCELLEME</div>
        <div class="form-row">
          <div class="form-group">
            <label>Daire No</label>
            <input type="text" id="insEditNumber" value="${apt.number}" required />
          </div>
          <div class="form-group">
            <label>Oda Tipi</label>
            <input type="text" id="insEditRooms" value="${apt.rooms || "2+1"}" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Blok / Giriş</label>
            <input type="text" id="insEditBlock" value="${apt.block || ""}" required />
          </div>
          <div class="form-group">
            <label>Fiyat (₺)</label>
            <input type="number" id="insEditPrice" value="${apt.price || 0}" step="50000" required />
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-sm" style="width:100%;margin-top:4px;">Değişiklikleri Kaydet</button>
      </form>
    `;
  } else {
    const savedName = localStorage.getItem("demirturk_requester_name") || "";
    const defaultTarget = apt.status === "SATILIK" ? "KAPORA" : "SATILDI";
    actionZoneHTML = `
      <form class="inspector-card-form" onsubmit="submitInspectorRequest(event, '${proj.id}', '${floor.id}', '${apt.id}')">
        <div class="inspector-section-title" style="margin-bottom:2px;">YÖNETİCİYE DURUM TALEBİ İLET</div>
        <div class="form-group">
          <label>Talep Edilen Durum</label>
          <select id="insReqStatus" required>
            <option value="KAPORA" ${defaultTarget === "KAPORA" ? "selected" : ""}>KAPORA ALINDI</option>
            <option value="PESINAT" ${defaultTarget === "PESINAT" ? "selected" : ""}>PEŞİNAT ALINDI</option>
            <option value="SATILDI" ${defaultTarget === "SATILDI" ? "selected" : ""}>SATILDI</option>
            <option value="KAPALI" ${defaultTarget === "KAPALI" ? "selected" : ""}>KAPALI (Kırmızı-Beyaz Çizgili)</option>
            <option value="SATISA_KAPALI" ${defaultTarget === "SATISA_KAPALI" ? "selected" : ""}>SATIŞA KAPALI (Siyah-Beyaz Çizgili)</option>
            <option value="SATILIK" ${defaultTarget === "SATILIK" ? "selected" : ""}>SATILIK (Müsait)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Satış Temsilcisi Adı Soyadı</label>
          <input type="text" id="insReqName" value="${savedName}" placeholder="Adınız Soyadınız" required />
        </div>
        <div class="form-group">
          <label>Müşteri / İşlem Notu</label>
          <input type="text" id="insReqNote" placeholder="Örn: Kapora alındı, sözleşme yapılacak" />
        </div>
        <button type="submit" class="btn btn-primary btn-sm" style="width:100%;margin-top:4px;">Talebi Yöneticiye Gönder</button>
      </form>
    `;
  }

  unitPane.innerHTML = `
    <div class="inspector-unit-hero st-${apt.status}">
      <div class="iu-top-row">
        <span class="iu-block-tag">${apt.block || "A Giriş"}</span>
        <span class="iu-status-pill">${STATUS_LABELS[apt.status]}</span>
      </div>
      <div class="iu-number">${apt.number}</div>
      <div class="iu-sub">${proj.name} • ${floor.name}</div>
      <div class="iu-price-box">
        <span class="iu-price-lbl">Liste Fiyatı</span>
        <span class="iu-price-val">${formatPrice(apt.price)}</span>
      </div>
    </div>

    ${pendingAlertHTML}

    <div class="inspector-meta-grid">
      <div class="im-cell">
        <span class="im-lbl">Oda Tipi</span>
        <span class="im-val">${apt.rooms || "2+1"}</span>
      </div>
      <div class="im-cell">
        <span class="im-lbl">Bulunduğu Kat</span>
        <span class="im-val">${floor.name}</span>
      </div>
      <div class="im-cell">
        <span class="im-lbl">Ada / Parsel</span>
        <span class="im-val">${proj.adaParsel}</span>
      </div>
      <div class="im-cell">
        <span class="im-lbl">Teslim Tarihi</span>
        <span class="im-val">${proj.deliveryDate}</span>
      </div>
    </div>

    ${actionZoneHTML}
  `;
}

function applyLocalApartmentUpdate(projectId, floorId, apartmentId, updates) {
  const proj = state.projects.find((p) => p.id === projectId);
  if (!proj) return null;
  const floor = proj.floors.find((f) => f.id === floorId);
  if (!floor) return null;
  const apt = floor.apartments.find((a) => a.id === apartmentId);
  if (!apt) return null;

  const oldStatus = apt.status;
  if (updates.targetStatus) {
    if (updates.targetStatus === "CYCLE") {
      const idx = STATUS_ORDER.indexOf(apt.status);
      apt.status = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    } else if (STATUS_ORDER.includes(updates.targetStatus)) {
      apt.status = updates.targetStatus;
    }
  }
  if (updates.price !== undefined && !Number.isNaN(Number(updates.price))) {
    apt.price = Number(updates.price);
  }
  if (updates.number !== undefined && String(updates.number).trim()) {
    apt.number = String(updates.number).trim();
  }
  if (updates.rooms !== undefined && String(updates.rooms).trim()) {
    apt.rooms = String(updates.rooms).trim();
  }
  if (updates.block !== undefined && String(updates.block).trim()) {
    apt.block = String(updates.block).trim();
  }

  if (oldStatus !== apt.status) {
    state.history = state.history || [];
    state.history.unshift({
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      projectId: proj.id,
      projectName: proj.name,
      floorName: floor.name,
      block: apt.block,
      apartmentNumber: apt.number,
      oldStatus,
      newStatus: apt.status,
      price: apt.price
    });
  }
  renderAll();
  return { proj, floor, apt };
}

function applyLocalCreateRequest(projectId, floorId, apartmentId, requestedStatus, requesterName, note) {
  const proj = state.projects.find((p) => p.id === projectId);
  const floor = proj?.floors.find((f) => f.id === floorId);
  const apt = floor?.apartments.find((a) => a.id === apartmentId);
  if (!proj || !floor || !apt) return null;

  const reqItem = {
    id: "req-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
    projectId: proj.id,
    projectName: proj.name,
    floorId: floor.id,
    floorName: floor.name,
    apartmentId: apt.id,
    apartmentNumber: apt.number,
    block: apt.block || "Giriş",
    currentStatus: apt.status,
    requestedStatus,
    requesterName: String(requesterName || "Satış Temsilcisi").trim(),
    note: String(note || "").trim(),
    status: "PENDING"
  };
  state.requests = state.requests || [];
  state.requests.unshift(reqItem);
  renderAll();
  return reqItem;
}

async function setApartmentStatusDirect(projectId, floorId, apartmentId, targetStatus) {
  if (!state.isAdmin) return openAdminLoginModal();
  const updated = applyLocalApartmentUpdate(projectId, floorId, apartmentId, { targetStatus });
  const finalTargetStatus = updated?.apt?.status || targetStatus;

  if (IS_CLOUD_DIRECT_HOST || state.cloudDirectMode) {
    try {
      await sendCloudMobileAction({
        actionType: "UPDATE_APARTMENT",
        projectId,
        floorId,
        apartmentId,
        targetStatus: finalTargetStatus
      });
      showToast("Durum güncellendi ve ofis anabilgisayarlarına iletildi.", "#15803d");
    } catch (err) {
      showToast("Bulut senkronizasyon hatası: " + err.message, "#dc2626");
    }
    return;
  }

  try {
    const res = await fetch("/api/apartment/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": state.adminToken || ""
      },
      body: JSON.stringify({
        projectId,
        floorId,
        apartmentId,
        targetStatus: finalTargetStatus,
        token: state.adminToken
      })
    });
    if (res.ok) {
      await fetchStateNow(false);
    } else if (res.status === 403) {
      showToast("Bu işlem için Yönetici yetkisi gereklidir.", "#dc2626");
      logoutAdmin(true);
    }
  } catch (err) {
    await sendCloudMobileAction({
      actionType: "UPDATE_APARTMENT",
      projectId,
      floorId,
      apartmentId,
      targetStatus: finalTargetStatus
    }).catch(() => {});
  }
}

async function submitInspectorQuickEdit(event, projectId, floorId, apartmentId) {
  event.preventDefault();
  if (!state.isAdmin) return openAdminLoginModal();
  const number = document.getElementById("insEditNumber").value;
  const rooms = document.getElementById("insEditRooms").value;
  const block = document.getElementById("insEditBlock").value;
  const price = Number(document.getElementById("insEditPrice").value);

  const proj = state.projects.find((p) => p.id === projectId);
  const floor = proj?.floors.find((f) => f.id === floorId);
  const apt = floor?.apartments.find((a) => a.id === apartmentId);
  if (!apt) return;

  applyLocalApartmentUpdate(projectId, floorId, apartmentId, {
    targetStatus: apt.status,
    price,
    number,
    rooms,
    block
  });

  if (IS_CLOUD_DIRECT_HOST || state.cloudDirectMode) {
    await sendCloudMobileAction({
      actionType: "UPDATE_APARTMENT",
      projectId,
      floorId,
      apartmentId,
      targetStatus: apt.status,
      price,
      number,
      rooms,
      block
    });
    showToast(`${number} bilgileri güncellendi.`);
    return;
  }

  try {
    const res = await fetch("/api/apartment/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": state.adminToken || ""
      },
      body: JSON.stringify({
        projectId,
        floorId,
        apartmentId,
        targetStatus: apt.status,
        price,
        number,
        rooms,
        block,
        token: state.adminToken
      })
    });
    if (res.ok) {
      showToast(`${number} bilgileri güncellendi.`);
      await fetchStateNow(false);
    }
  } catch (_) {
    await sendCloudMobileAction({
      actionType: "UPDATE_APARTMENT",
      projectId,
      floorId,
      apartmentId,
      targetStatus: apt.status,
      price,
      number,
      rooms,
      block
    }).catch(() => {});
    showToast(`${number} bilgileri bulut üzerinden güncellendi.`);
  }
}

async function submitInspectorRequest(event, projectId, floorId, apartmentId) {
  event.preventDefault();
  const requestedStatus = document.getElementById("insReqStatus").value;
  const requesterName = document.getElementById("insReqName").value.trim();
  const note = document.getElementById("insReqNote").value.trim();

  if (requesterName) {
    localStorage.setItem("demirturk_requester_name", requesterName);
  }

  const reqItem = applyLocalCreateRequest(projectId, floorId, apartmentId, requestedStatus, requesterName, note);

  if (IS_CLOUD_DIRECT_HOST || state.cloudDirectMode) {
    try {
      await sendCloudMobileAction({
        actionType: "CREATE_REQUEST",
        requestId: reqItem?.id,
        projectId,
        floorId,
        apartmentId,
        requestedStatus,
        requesterName,
        note
      });
      document.getElementById("insReqNote").value = "";
      showToast("Talebiniz anabilgisayarlara ve yönetici onayına iletildi.", "#15803d");
    } catch (err) {
      showToast("Bulut bağlantı hatası: " + err.message, "#dc2626");
    }
    return;
  }

  try {
    const res = await fetch("/api/request/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        floorId,
        apartmentId,
        requestedStatus,
        requesterName,
        note
      })
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      document.getElementById("insReqNote").value = "";
      showToast("Talebiniz yönetici onayına iletildi.", "#15803d");
      await fetchStateNow(false);
    } else {
      showToast(data.error || "Talep gönderilemedi", "#dc2626");
    }
  } catch (err) {
    await sendCloudMobileAction({
      actionType: "CREATE_REQUEST",
      requestId: reqItem?.id,
      projectId,
      floorId,
      apartmentId,
      requestedStatus,
      requesterName,
      note
    }).catch(() => {});
    document.getElementById("insReqNote").value = "";
    showToast("Talebiniz bulut üzerinden yönetici onayına iletildi.", "#15803d");
  }
}

// ============================================================
// DAİRE KARTI RENDER & TIKLAMA İŞLEYİCİSİ
// ============================================================
function buildApartmentBoxHTML(project, floor, apt, styleCoords, extraClass = "") {
  const hideSoldPrice = document.getElementById("hideSoldPriceToggle")?.checked ?? true;
  const isAvailable = apt.status === "SATILIK";
  const stLabel = STATUS_LABELS[apt.status] || apt.status;
  const isSelected = apt.id === state.selectedAptId;

  let priceOrStatusHTML = "";
  if (isAvailable) {
    priceOrStatusHTML = `<div class="apt-price">${formatPrice(apt.price)}</div>`;
  } else {
    priceOrStatusHTML = `
      <div class="apt-status-stamp">${stLabel}</div>
      ${!hideSoldPrice ? `<div class="apt-price" style="font-size:0.78rem;opacity:0.9;">${formatPrice(apt.price)}</div>` : ""}
    `;
  }

  const pendingReq = (state.requests || []).find(
    (r) => r.apartmentId === apt.id && r.projectId === project.id && r.status === "PENDING"
  );
  const pendingBadgeHTML = pendingReq
    ? `<div style="position:absolute;top:4px;left:4px;background:#f59e0b;color:#fff;font-size:0.55rem;font-weight:800;padding:1px 5px;border-radius:3px;z-index:35;" title="${pendingReq.requesterName}: ${STATUS_LABELS[pendingReq.requestedStatus]} talebi">TALEP</div>`
    : "";

  const dotsTitle = state.isAdmin
    ? "Bağımsız bölüm bilgilerini pencereden düzenle"
    : "Hızlı durum değişikliği talebi penceresi";

  const dotsBtnHTML = `<button type="button" class="fp-apt-more-btn" onclick="handleDotsMenuClick(event, '${project.id}', '${floor.id}', '${apt.id}')" title="${dotsTitle}">⋯</button>`;

  return `
    <div class="fp-apt status-${apt.status} ${extraClass} ${isSelected ? "selected-apt" : ""}"
         style="left:${styleCoords.x}px; top:${styleCoords.y}px; width:${styleCoords.w}px; height:${styleCoords.h}px;"
         onclick="handleApartmentClick(event, '${project.id}', '${floor.id}', '${apt.id}')">
      ${pendingBadgeHTML}
      ${dotsBtnHTML}
      <div class="apt-block-label">${apt.block || ""}</div>
      <div class="apt-number">${apt.number}</div>
      ${apt.rooms ? `<div class="apt-rooms">${apt.rooms}</div>` : ""}
      ${priceOrStatusHTML}
    </div>
  `;
}

function handleDotsMenuClick(event, projectId, floorId, apartmentId) {
  if (event) event.stopPropagation();
  state.selectedAptId = apartmentId;
  renderStudioInspector();
  if (state.isAdmin) {
    openEditAptModal(event, projectId, floorId, apartmentId);
  } else {
    openRequestStatusModal(event, projectId, floorId, apartmentId);
  }
}

async function handleApartmentClick(event, projectId, floorId, apartmentId) {
  event.stopPropagation();
  state.selectedProjectId = projectId;
  state.selectedFloorId = floorId;
  state.selectedAptId = apartmentId;
  switchInspectorTab("unit");

  // Yönetici değilse veya Yönetici 'INSPECT' (Denetçi Paneli) modundaysa seçili daireyi aç
  if (!state.isAdmin || state.clickMode === "INSPECT") {
    renderAll();
    toggleRightInspector(true);
    return;
  }

  const targetStatus = state.clickMode === "CYCLE" ? "CYCLE" : state.clickMode;
  await setApartmentStatusDirect(projectId, floorId, apartmentId, targetStatus);
}

function toggleMobileFloorCardsView() {
  state.showMobileCards = !state.showMobileCards;
  const btn = document.getElementById("btnToggleMobileCards");
  const txt = document.getElementById("mobileCardsToggleText");
  const cardsGrid = document.getElementById("mobileFloorCardsContainer");
  const singleStage = document.getElementById("singleFloorContainer");

  if (btn) btn.classList.toggle("active", state.showMobileCards);
  if (txt) txt.textContent = state.showMobileCards ? "Kat Planı" : "Kart Listesi";
  if (cardsGrid) cardsGrid.classList.toggle("hidden", !state.showMobileCards);
  if (singleStage && state.mainView === "floorplan") {
    singleStage.classList.toggle("hidden", state.showMobileCards);
  }
  renderMobileFloorCards();
}

function renderMobileFloorCards() {
  const container = document.getElementById("mobileFloorCardsContainer");
  if (!container) return;
  const proj = state.projects.find((p) => p.id === state.selectedProjectId);
  if (!proj) return;
  const floor = proj.floors.find((f) => f.id === state.selectedFloorId) || proj.floors[0];
  if (!floor) return;

  container.innerHTML = floor.apartments
    .map((apt) => {
      const stLabel = STATUS_LABELS[apt.status] || apt.status;
      return `
        <div class="mob-unit-card st-${apt.status}" onclick="selectApartmentForInspector('${proj.id}', '${floor.id}', '${apt.id}')">
          <div class="mob-unit-card-top">
            <span>${apt.block || floor.name}</span>
            <span>${apt.rooms || "2+1"}</span>
          </div>
          <div class="mob-unit-card-num">${apt.number}</div>
          <div class="mob-unit-card-price">${apt.status === "SATILIK" ? formatPrice(apt.price) : stLabel}</div>
        </div>
      `;
    })
    .join("");
}

function getAutoFitScale() {
  const winW = Math.min(
    window.innerWidth || 1280,
    (document.documentElement && document.documentElement.clientWidth) || window.innerWidth || 1280
  );

  // Mobil ve Tablet (<= 1140px): Yan menüler üstten/alttan açılan bağımsız çekmece (fixed overlay) olduğu için
  // ortadaki kat planı genişliği her zaman tam ekran genişliğine göre sabit hesaplanır (menü açılıp kapanınca asla çökmez/sıkışmaz)
  if (isMobileViewport()) {
    const availMobile = Math.max(250, winW - 22);
    return availMobile < 1219 ? Math.max(0.2, Number((availMobile / 1219).toFixed(4))) : 1;
  }

  // Masaüstü (> 1140px): Sol menü, kat kesiti ve sağ detay menüsünün açık/kapalı durumuna göre net orta sütun genişliğini hesapla
  const shell = document.getElementById("studioShell") || document.querySelector(".studio-shell");
  const layout = document.getElementById("viewFloorplanSection");
  const leftOpen = shell ? !shell.classList.contains("left-collapsed") : true;
  const rightOpen = layout ? !layout.classList.contains("right-collapsed") : false;

  const leftW = leftOpen ? 288 : 0;
  const elevW = winW <= 1360 ? 165 : 190;
  const rightW = rightOpen ? (winW <= 1360 ? 300 : 340) : 0;
  const calculatedColW = Math.max(280, winW - leftW - elevW - rightW - 36);

  const toolbar = document.querySelector(".canvas-top-toolbar");
  const toolbarW = toolbar && toolbar.clientWidth > 160 ? toolbar.clientWidth - 4 : calculatedColW;
  const availWidth = Math.max(280, Math.min(calculatedColW, toolbarW));
  return availWidth < 1219 ? Math.max(0.22, Number((availWidth / 1219).toFixed(4))) : 1;
}

function adjustCanvasZoom(delta) {
  const current = state.customZoom || getAutoFitScale();
  const next = Math.min(1.4, Math.max(0.22, Number((current + delta).toFixed(2))));
  state.customZoom = next;
  fitFloorplansToScreen();
}

function resetCanvasZoom() {
  state.customZoom = null;
  fitFloorplansToScreen();
}

function ensureCanvasScaleBox(canvas) {
  let parent = canvas.parentElement;
  if (!parent) return null;
  if (!parent.classList.contains("floorplan-scale-box")) {
    const box = document.createElement("div");
    box.className = "floorplan-scale-box";
    parent.insertBefore(box, canvas);
    box.appendChild(canvas);
    return box;
  }
  return parent;
}

function fitFloorplansToScreen() {
  const autoScale = getAutoFitScale();
  const scale = state.customZoom || autoScale;

  const zoomBtn = document.getElementById("zoomLevelBtn");
  if (zoomBtn) {
    zoomBtn.textContent = state.customZoom ? `%${Math.round(scale * 100)}` : `Sığdır (%${Math.round(scale * 100)})`;
  }

  const scaledW = Math.max(220, Math.round(1219 * scale));
  const scaledH = Math.max(124, Math.round(686 * scale));

  document.querySelectorAll(".floorplan-canvas").forEach((canvas) => {
    const scaleBox = ensureCanvasScaleBox(canvas);
    if (scaleBox) {
      scaleBox.style.width = `${scaledW}px`;
      scaleBox.style.height = `${scaledH}px`;
      const wrapper = scaleBox.parentElement;
      if (wrapper && wrapper.classList.contains("floorplan-stage-wrapper")) {
        wrapper.style.height = `${scaledH + 6}px`;
        wrapper.style.minHeight = `${scaledH + 6}px`;
      }
    }
    canvas.style.position = "absolute";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.width = "1219px";
    canvas.style.height = "686px";
    canvas.style.margin = "0px";
    canvas.style.transformOrigin = "top left";
    canvas.style.transform = scale === 1 ? "none" : `scale(${scale})`;
  });
}

window.addEventListener("resize", scheduleCanvasFit);
window.addEventListener("orientationchange", () => setTimeout(scheduleCanvasFit, 120));

// ============================================================
// BİREBİR SLAYT / KAT PLANI ŞABLONLARI (8 PROJE + ÖZEL ŞABLON)
// ============================================================
function renderSingleFloorPlan() {
  const canvas = document.getElementById("floorplanCanvas");
  if (!canvas) return;
  const proj = state.projects.find((p) => p.id === state.selectedProjectId);
  if (!proj) return;
  const floor = proj.floors.find((f) => f.id === state.selectedFloorId) || proj.floors[0];
  if (!floor) return;

  canvas.innerHTML = generateFloorPlanSlideHTML(proj, floor);
  fitFloorplansToScreen();
}

function renderAllFloorsPresentation() {
  const container = document.getElementById("allFloorsContainer");
  if (!container) return;
  const proj = state.projects.find((p) => p.id === state.selectedProjectId);
  if (!proj) return;

  container.innerHTML = proj.floors
    .map(
      (fl) => `
      <div class="all-floors-item">
        <h3><span>${proj.name}</span><span>${fl.name}</span></h3>
        <div class="floorplan-stage-wrapper">
          <div class="floorplan-scale-box">
            <div class="floorplan-canvas">
              ${generateFloorPlanSlideHTML(proj, fl)}
            </div>
          </div>
        </div>
      </div>
    `
    )
    .join("");
  fitFloorplansToScreen();
}

function generateFloorPlanSlideHTML(proj, floor) {
  if (proj.templateType === "template-1104") {
    return renderTemplate1104(proj, floor);
  } else if (proj.templateType === "template-asel4") {
    return renderTemplateAsel4(proj, floor);
  } else if (proj.templateType === "template-asel2") {
    return renderTemplateAsel2(proj, floor);
  } else if (proj.templateType === "template-asel1") {
    return renderTemplateAsel1(proj, floor);
  } else if (proj.templateType === "template-almina2") {
    return renderTemplateAlmina2(proj, floor);
  } else if (proj.templateType === "template-yenisehir3") {
    return renderTemplateYenisehir3(proj, floor);
  } else if (proj.templateType === "template-etap1") {
    return renderTemplateEtap1(proj, floor);
  } else if (proj.templateType === "template-etap2") {
    return renderTemplateEtap2(proj, floor);
  } else {
    return renderTemplateCustom(proj, floor);
  }
}

// ------------------------------------------------------------
// ŞABLON 1: Ada 1104 Parsel 14 (Aziziye Mahallesi)
// ------------------------------------------------------------
function renderTemplate1104(proj, floor) {
  const slotCoords = {
    "top-left": { x: 309, y: 229, w: 227, h: 119 },
    "top-right": { x: 625, y: 228, w: 279, h: 118 },
    "bottom-left": { x: 292, y: 348, w: 295, h: 121 },
    "bottom-right": { x: 587, y: 346, w: 279, h: 121 }
  };

  // Merdiven basamak çizgileri
  let stairsLines = "";
  for (let y = 205; y <= 317; y += 7) {
    stairsLines += `<div style="position:absolute;left:536px;top:${y}px;width:40px;height:1px;background:#64748b;z-index:5;"></div>`;
  }

  const aptsHTML = floor.apartments
    .map((apt, idx) => {
      const coords = slotCoords[apt.slot] || { x: 309 + (idx % 2) * 316, y: 229 + Math.floor(idx / 2) * 120, w: 260, h: 118 };
      return buildApartmentBoxHTML(proj, floor, apt, coords);
    })
    .join("");

  return `
    <!-- Sol Üst Kutu: Mahalle ve Ada/Parsel -->
    <div class="fp-el" style="left:0;top:0;width:225px;height:64px;background:#0f172a;color:#fff;align-items:flex-start;padding-left:14px;border-bottom:3px solid #c5a059;">
      <div style="font-size:1.1rem;font-weight:800;letter-spacing:0.02em;">${proj.neighborhood}</div>
      <div style="font-size:0.95rem;font-weight:700;color:#c5a059;">${proj.adaParsel}</div>
    </div>

    <!-- KAT PLANI & Proje Başlığı -->
    <div class="fp-el" style="left:230px;top:6px;width:210px;height:52px;font-size:1.12rem;font-weight:800;color:#0f172a;line-height:1.15;">
      ${proj.name}
    </div>

    <!-- Orta Üst Logo & Peşinat -->
    <img src="assets/p1_image1.png?v=15" alt="Demirtürk Yapı Karasu" style="position:absolute;left:445px;top:4px;width:305px;height:52px;object-fit:contain;" />
    <div class="fp-el" style="left:470px;top:56px;width:260px;height:44px;font-size:1.22rem;font-weight:800;color:#0f172a;">
      ${proj.paymentPlan}
    </div>

    <!-- Teslim Tarihi -->
    <div class="fp-el" style="left:800px;top:8px;width:180px;height:34px;font-size:1.35rem;font-weight:800;color:#991b1b;">
      ${proj.deliveryDate}
    </div>

    <!-- Pusula -->
    <div class="fp-compass-box" style="left:1055px;top:30px;width:98px;height:96px;">
      <img src="assets/p1_image2.png" alt="Pusula" />
    </div>
    <div class="fp-compass-dir" style="left:1022px;top:12px;">Kuzey</div>
    <div class="fp-compass-dir" style="left:1142px;top:20px;">Doğu</div>
    <div class="fp-compass-dir" style="left:1009px;top:110px;">Batı</div>
    <div class="fp-compass-dir" style="left:1112px;top:118px;">Güney</div>

    <!-- Giriş & Merdiven Holü -->
    <div class="fp-el" style="left:521px;top:145px;width:75px;height:24px;font-size:1rem;font-weight:800;color:#991b1b;letter-spacing:0.04em;">GİRİŞ</div>
    <div style="position:absolute;left:574px;top:158px;width:50px;height:62px;background:#0f172a;border:2px solid #0f172a;"></div>
    <div style="position:absolute;left:536px;top:198px;width:40px;height:125px;background:#e2e8f0;border:2px solid #1e293b;"></div>
    ${stairsLines}
    <div class="fp-el" style="left:526px;top:246px;width:62px;height:24px;font-size:0.65rem;font-weight:800;color:#0f172a;background:rgba(255,255,255,0.9);z-index:6;">MERDİVEN</div>
    <div style="position:absolute;left:536px;top:323px;width:89px;height:25px;background:#f1f5f9;border:2px solid #1e293b;"></div>

    <!-- 4 Balkon -->
    <div class="fp-balcony" style="left:267px;top:279px;width:42px;height:69px;">BALKON</div>
    <div class="fp-balcony" style="left:904px;top:279px;width:42px;height:67px;">BALKON</div>
    <div class="fp-balcony" style="left:349px;top:469px;width:42px;height:85px;">BALKON</div>
    <div class="fp-balcony" style="left:778px;top:467px;width:42px;height:85px;">BALKON</div>

    <!-- Daireler -->
    ${aptsHTML}

    <!-- Havuz -->
    <div class="fp-pool" style="left:435px;top:538px;width:324px;height:116px;">
      HAVUZ
    </div>

    <!-- Sol Alt Kutu: Kat Adı -->
    <div class="fp-el" style="left:0;top:644px;width:195px;height:42px;background:#0f172a;color:#c5a059;font-size:1.12rem;font-weight:800;letter-spacing:0.05em;border-top:2px solid #c5a059;">
      ${floor.name}
    </div>
  `;
}

// ------------------------------------------------------------
// ŞABLON 2: ASEL DOĞA EVLERİ 4 (Aşağıaziziye 1105 Ada 13 Parsel)
// ------------------------------------------------------------
function renderTemplateAsel4(proj, floor) {
  const slotCoords = {
    "a-top-right": { x: 502, y: 218, w: 140, h: 141 },
    "a-bottom-mid": { x: 416, y: 359, w: 120, h: 155 },
    "a-bottom-left": { x: 296, y: 332, w: 120, h: 182 },
    "b-top-left": { x: 649, y: 218, w: 120, h: 141 },
    "b-right": { x: 769, y: 218, w: 112, h: 275 }
  };

  const aptsHTML = floor.apartments
    .map((apt, idx) => {
      const coords = slotCoords[apt.slot] || { x: 300 + idx * 130, y: 250, w: 125, h: 150 };
      return buildApartmentBoxHTML(proj, floor, apt, coords);
    })
    .join("");

  return `
    <!-- Sol Üst Logo -->
    <img src="assets/p2_image1.png?v=15" alt="Demirtürk Yapı İnşaat" style="position:absolute;left:28px;top:26px;width:238px;height:115px;object-fit:contain;" />

    <!-- Üst Başlık -->
    <div class="fp-el" style="left:360px;top:42px;width:490px;height:64px;font-size:1.85rem;font-weight:800;color:#0f172a;letter-spacing:0.02em;">
      ${proj.name}
    </div>

    <!-- Sol Dikey YOL Şeridi -->
    <div class="fp-el" style="left:162px;top:160px;width:52px;height:466px;background:#e2e8f0;border:1.5px solid #94a3b8;font-size:1.15rem;font-weight:800;color:#334155;letter-spacing:0.08em;">
      YOL
    </div>

    <!-- A Giriş & B Giriş Etiketleri ve Merdiven/Ortak Alan -->
    <div class="fp-el" style="left:415px;top:155px;width:95px;height:28px;font-size:0.92rem;font-weight:800;color:#0f172a;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:4px;">A GİRİŞ</div>
    <div class="fp-el" style="left:695px;top:155px;width:95px;height:28px;font-size:0.92rem;font-weight:800;color:#0f172a;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:4px;">B GİRİŞ</div>

    <!-- A Giriş Sol Üst Ortak/Hol Alanı -->
    <div style="position:absolute;left:357px;top:218px;width:145px;height:114px;background:#f8fafc;border:1.5px solid #334155;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;color:#475569;text-align:center;">
      A BLOK HOL / MERDİVEN
    </div>

    <!-- Blok Ayrım Duvarı -->
    <div style="position:absolute;left:642px;top:218px;width:7px;height:160px;background:#0f172a;z-index:15;"></div>

    <!-- Balkonlar -->
    <div class="fp-balcony" style="left:595px;top:359px;width:47px;height:20px;">BALKON</div>
    <div class="fp-balcony" style="left:649px;top:359px;width:52px;height:20px;">BALKON</div>
    <div class="fp-balcony" style="left:263px;top:494px;width:55px;height:20px;">BALKON</div>
    <div class="fp-balcony" style="left:513px;top:494px;width:56px;height:20px;">BALKON</div>
    <div class="fp-balcony" style="left:769px;top:493px;width:112px;height:20px;">BALKON</div>

    <!-- Daireler -->
    ${aptsHTML}

    <!-- Havuz -->
    <div class="fp-pool" style="left:563px;top:393px;width:194px;height:129px;">
      HAVUZ
    </div>

    <!-- Pusula -->
    <div class="fp-compass-box" style="left:910px;top:140px;width:69px;height:68px;">
      <img src="assets/p1_image2.png" alt="Pusula" />
    </div>
    <div class="fp-compass-dir" style="left:922px;top:116px;">KUZEY</div>
    <div class="fp-compass-dir" style="left:983px;top:163px;">DOĞU</div>
    <div class="fp-compass-dir" style="left:922px;top:210px;">GÜNEY</div>
    <div class="fp-compass-dir" style="left:862px;top:163px;">BATI</div>

    <!-- Sağ Bilgi Kutuları (Teslim Tarihi, Ada/Parsel, Ödeme Planı, Kat) -->
    <div class="fp-el" style="left:1010px;top:85px;width:175px;height:58px;background:#ffffff;border:1.5px solid #cbd5e1;border-top:3px solid #991b1b;border-radius:6px;padding:6px;font-size:0.85rem;font-weight:800;">
      <span style="color:#991b1b;font-size:0.68rem;letter-spacing:0.06em;">TESLİM TARİHİ</span>
      <span style="color:#0f172a;">${proj.deliveryDate}</span>
    </div>

    <div class="fp-el" style="left:1010px;top:225px;width:175px;height:68px;background:#ffffff;border:1.5px solid #cbd5e1;border-top:3px solid #0f172a;border-radius:6px;padding:6px;font-size:0.86rem;font-weight:800;">
      <span style="color:#0f172a;">${proj.neighborhood}</span>
      <span style="color:#8a6829;">${proj.adaParsel}</span>
    </div>

    <div class="fp-el" style="left:1010px;top:365px;width:175px;height:96px;background:#fffbeb;border:1.5px solid #fde68a;border-top:3px solid #c5a059;border-radius:6px;padding:8px;font-size:0.88rem;font-weight:800;color:#78350f;">
      ${proj.paymentPlan}
    </div>

    <div class="fp-el" style="left:1010px;top:565px;width:175px;height:48px;background:#0f172a;color:#c5a059;border-radius:6px;font-size:1.15rem;font-weight:800;letter-spacing:0.04em;">
      ${floor.name}
    </div>
  `;
}

// ------------------------------------------------------------
// ŞABLON 3: ASEL DOĞA EVLERİ 2 (Yukarıaziziye Mh. 1233 Ada / 8 Parsel)
// ------------------------------------------------------------
function renderTemplateAsel2(proj, floor) {
  const slotCoords = {
    "b-left": { x: 115, y: 371, w: 208, h: 151 },
    "b-right": { x: 370, y: 371, w: 208, h: 151 },
    "a-left": { x: 625, y: 371, w: 208, h: 151 },
    "a-right": { x: 880, y: 371, w: 208, h: 151 }
  };

  const aptsHTML = floor.apartments
    .map((apt, idx) => {
      const coords = slotCoords[apt.slot] || { x: 115 + idx * 255, y: 371, w: 208, h: 151 };
      return buildApartmentBoxHTML(proj, floor, apt, coords);
    })
    .join("");

  return `
    <!-- Sol Üst Proje & Ada Parsel -->
    <div class="fp-el" style="left:35px;top:32px;width:265px;height:42px;background:#0f172a;color:#fff;border-radius:6px;font-size:1.1rem;font-weight:800;border-bottom:2px solid #c5a059;">
      ${proj.name}
    </div>
    <div class="fp-el" style="left:35px;top:82px;width:265px;height:56px;font-size:1.05rem;font-weight:800;color:#0f172a;align-items:flex-start;">
      <div>${proj.neighborhood}</div>
      <div style="color:#8a6829;">${proj.adaParsel}</div>
    </div>

    <!-- Orta Üst Logo & Teslim Tarihi -->
    <img src="assets/p1_image1.png?v=15" alt="Demirtürk Yapı Karasu" style="position:absolute;left:445px;top:24px;width:320px;height:56px;object-fit:contain;" />
    <div class="fp-el" style="left:458px;top:96px;width:287px;height:37px;font-size:1.35rem;font-weight:800;color:#991b1b;">
      ${proj.deliveryDate}
    </div>

    <!-- Sağ Üst Pusula (Batı Üst, Doğu Alt, Kuzey Sağ, Güney Sol) -->
    <div class="fp-compass-box" style="left:1043px;top:35px;width:115px;height:114px;">
      <img src="assets/p1_image2.png" alt="Pusula" />
    </div>
    <div class="fp-compass-dir" style="left:1084px;top:12px;">Batı</div>
    <div class="fp-compass-dir" style="left:1082px;top:150px;">Doğu</div>
    <div class="fp-compass-dir" style="left:1162px;top:82px;">Kuzey</div>
    <div class="fp-compass-dir" style="left:992px;top:82px;">Güney</div>

    <!-- Sol Üst Havuz -->
    <div class="fp-pool" style="left:115px;top:168px;width:255px;height:171px;">
      HAVUZ
    </div>

    <!-- Daireler -->
    ${aptsHTML}

    <!-- B Giriş & A Giriş Yukarı Oklar -->
    <div class="fp-el" style="left:323px;top:425px;width:47px;height:95px;background:#0f172a;color:#c5a059;font-weight:800;font-size:1.4rem;border-radius:4px;z-index:12;" title="B Giriş Merdiven/Giriş Holü">
      ↑
    </div>
    <div class="fp-el" style="left:833px;top:425px;width:47px;height:95px;background:#0f172a;color:#c5a059;font-weight:800;font-size:1.4rem;border-radius:4px;z-index:12;" title="A Giriş Merdiven/Giriş Holü">
      ↑
    </div>

    <!-- B Giriş & A Giriş Etiketleri + Kat Kutusu -->
    <div class="fp-el" style="left:265px;top:532px;width:167px;height:52px;font-size:1.35rem;font-weight:800;color:#0f172a;">
      B Giriş
    </div>
    <div class="fp-el" style="left:462px;top:540px;width:315px;height:40px;background:#0f172a;color:#c5a059;font-size:1.22rem;font-weight:800;border-radius:6px;letter-spacing:0.05em;">
      ${floor.name}
    </div>
    <div class="fp-el" style="left:770px;top:532px;width:167px;height:52px;font-size:1.35rem;font-weight:800;color:#0f172a;">
      A Giriş
    </div>

    <!-- Alt Boydan Boya Peşinat & Vade Şeridi -->
    <div class="fp-el" style="left:0;top:621px;width:1219px;height:65px;background:#0f172a;color:#fff;font-size:1.4rem;font-weight:800;letter-spacing:0.03em;border-top:3px solid #c5a059;">
      ${proj.paymentPlan}
    </div>
  `;
}

// ------------------------------------------------------------
// ŞABLON 4: ASEL DOĞA EVLERİ (Aşağıaziziye Mh. 1067 Ada 4 Parsel)
// ------------------------------------------------------------
function renderTemplateAsel1(proj, floor) {
  const slotCoords = {
    "b-top-left": { x: 162, y: 160, w: 224, h: 180 },
    "b-bottom-left": { x: 162, y: 342, w: 224, h: 175 },
    "b-right-tall": { x: 389, y: 160, w: 230, h: 357 },
    "a-left-tall": { x: 625, y: 160, w: 230, h: 357 },
    "a-top-right": { x: 858, y: 160, w: 232, h: 180 },
    "a-bottom-right": { x: 858, y: 342, w: 232, h: 175 }
  };

  const aptsHTML = floor.apartments
    .map((apt, idx) => {
      const coords = slotCoords[apt.slot] || { x: 162 + idx * 150, y: 160, w: 200, h: 180 };
      return buildApartmentBoxHTML(proj, floor, apt, coords);
    })
    .join("");

  return `
    <!-- Sol Üst Ödeme Planı & Logo -->
    <div class="fp-el" style="left:12px;top:14px;width:310px;height:34px;background:#0f172a;color:#c5a059;border-radius:4px;font-size:0.88rem;font-weight:800;">
      ${proj.paymentPlan}
    </div>
    <img src="assets/p1_image1.png?v=15" alt="Demirtürk Yapı Karasu" style="position:absolute;left:18px;top:62px;width:270px;height:48px;object-fit:contain;" />

    <!-- Orta Üst Proje Başlığı & Konum -->
    <div class="fp-el" style="left:450px;top:14px;width:340px;height:38px;font-size:1.5rem;font-weight:800;color:#0f172a;">
      ${proj.name}
    </div>
    <div class="fp-el" style="left:450px;top:54px;width:340px;height:68px;font-size:1rem;font-weight:700;color:#334155;">
      <div>${proj.neighborhood} • ${proj.adaParsel}</div>
      <div style="color:#991b1b;margin-top:2px;font-weight:800;">Teslim: ${proj.deliveryDate}</div>
    </div>

    <!-- Sağ Üst Pusula -->
    <div class="fp-compass-box" style="left:1069px;top:35px;width:91px;height:91px;">
      <img src="assets/p1_image2.png" alt="Pusula" />
    </div>
    <div class="fp-compass-dir" style="left:1091px;top:12px;">KUZEY</div>
    <div class="fp-compass-dir" style="left:1089px;top:128px;">GÜNEY</div>
    <div class="fp-compass-dir" style="left:1032px;top:70px;">BATI</div>
    <div class="fp-compass-dir" style="left:1162px;top:70px;">DOĞU</div>

    <!-- En Sol Dikey Havuz -->
    <div class="fp-pool" style="left:6px;top:165px;width:135px;height:348px;">
      HAVUZ
    </div>

    <!-- Daireler -->
    ${aptsHTML}

    <!-- B Giriş & A Giriş Yürüyüş Yolu ve Etiketler -->
    <div style="position:absolute;left:376px;top:517px;width:22px;height:75px;background:#475569;"></div>
    <div class="fp-el" style="left:330px;top:595px;width:115px;height:32px;background:#0f172a;color:#fff;border-radius:4px;font-size:0.95rem;font-weight:800;">
      B GİRİŞ
    </div>

    <div style="position:absolute;left:848px;top:517px;width:22px;height:75px;background:#475569;"></div>
    <div class="fp-el" style="left:800px;top:595px;width:115px;height:32px;background:#0f172a;color:#fff;border-radius:4px;font-size:0.95rem;font-weight:800;">
      A GİRİŞ
    </div>

    <!-- Sağ YOL & SİTE GİRİŞİ -->
    <div class="fp-el" style="left:1112px;top:160px;width:95px;height:357px;background:#e2e8f0;border:1.5px solid #94a3b8;font-size:1.15rem;font-weight:800;color:#334155;letter-spacing:0.08em;">
      YOL
    </div>
    <div class="fp-el" style="left:1085px;top:580px;width:122px;height:40px;background:#334155;color:#fff;border-radius:4px;font-size:0.88rem;font-weight:800;">
      SİTE GİRİŞİ
    </div>

    <!-- Sol Alt Kat Etiketi -->
    <div class="fp-el" style="left:12px;top:625px;width:165px;height:44px;background:#0f172a;color:#c5a059;border-radius:6px;font-size:1.18rem;font-weight:800;letter-spacing:0.04em;">
      ${floor.name}
    </div>
  `;
}

// ------------------------------------------------------------
// ŞABLON 5: ALMİNA 2 SİTESİ (Aşağıincilli Mh. 996 Ada / 12 Parsel)
// ------------------------------------------------------------
function renderTemplateAlmina2(proj, floor) {
  const slotCoords = {
    "b-1": { x: 187, y: 225, w: 194, h: 130 },
    "b-2": { x: 382, y: 225, w: 194, h: 130 },
    "b-3": { x: 576, y: 225, w: 194, h: 130 },
    "a-top": { x: 770, y: 225, w: 194, h: 130 },
    "a-bottom-left": { x: 770, y: 355, w: 98, h: 200 },
    "a-bottom-right": { x: 868, y: 355, w: 96, h: 200 }
  };

  const aptsHTML = floor.apartments
    .map((apt, idx) => {
      const coords = slotCoords[apt.slot] || { x: 187 + idx * 160, y: 225, w: 155, h: 130 };
      const extraClass = apt.slot === "a-bottom-left" || apt.slot === "a-bottom-right" ? "med-apt" : "";
      return buildApartmentBoxHTML(proj, floor, apt, coords, extraClass);
    })
    .join("");

  return `
    <!-- Sol Üst Proje Başlığı & Ada Parsel -->
    <div class="fp-el" style="left:25px;top:20px;width:275px;height:40px;background:#0f172a;color:#fff;border-radius:6px;font-size:1.15rem;font-weight:800;border-bottom:2px solid #c5a059;">
      ${proj.name}
    </div>
    <div class="fp-el" style="left:25px;top:66px;width:275px;height:54px;font-size:1rem;font-weight:800;color:#0f172a;align-items:flex-start;">
      <div>${proj.neighborhood}</div>
      <div style="color:#8a6829;">${proj.adaParsel}</div>
    </div>

    <!-- Orta Üst Logo & Teslim Tarihi -->
    <img src="assets/p1_image1.png?v=15" alt="Demirtürk Yapı Karasu" style="position:absolute;left:445px;top:22px;width:320px;height:56px;object-fit:contain;" />
    <div class="fp-el" style="left:458px;top:92px;width:287px;height:37px;font-size:1.35rem;font-weight:800;color:#991b1b;">
      Teslim: ${proj.deliveryDate}
    </div>

    <!-- Sağ Üst Pusula -->
    <div class="fp-compass-box" style="left:1043px;top:35px;width:115px;height:114px;">
      <img src="assets/p1_image2.png" alt="Pusula" />
    </div>
    <div class="fp-compass-dir" style="left:1080px;top:12px;">Kuzey</div>
    <div class="fp-compass-dir" style="left:1080px;top:150px;">Güney</div>
    <div class="fp-compass-dir" style="left:1162px;top:82px;">Doğu</div>
    <div class="fp-compass-dir" style="left:1000px;top:82px;">Batı</div>

    <!-- Sol Havuz -->
    <div class="fp-pool" style="left:28px;top:225px;width:146px;height:130px;font-size:1.25rem;">
      HAVUZ
    </div>

    <!-- Daireler -->
    ${aptsHTML}

    <!-- B Giriş & A Giriş Etiketleri -->
    <div class="fp-el" style="left:335px;top:368px;width:110px;height:38px;background:#0f172a;color:#fff;border-radius:6px;font-size:0.98rem;font-weight:800;">
      ↑ B Giriş
    </div>
    <div class="fp-el" style="left:648px;top:368px;width:110px;height:38px;background:#0f172a;color:#fff;border-radius:6px;font-size:0.98rem;font-weight:800;">
      A Giriş →
    </div>

    <!-- Sol Alt Kat Etiketi -->
    <div class="fp-el" style="left:16px;top:590px;width:195px;height:42px;background:#0f172a;color:#c5a059;border-radius:6px;font-size:1.15rem;font-weight:800;letter-spacing:0.04em;">
      ${floor.name}
    </div>

    <!-- Alt Peşinat / Vade Şeridi -->
    <div class="fp-el" style="left:0;top:641px;width:1219px;height:45px;background:#0f172a;color:#fff;font-size:1.25rem;font-weight:800;border-top:3px solid #c5a059;">
      ${proj.paymentPlan}
    </div>
  `;
}

// ------------------------------------------------------------
// ŞABLON 6: YENİŞEHİR 3. ETAP (Aşağıincilli Mh. 1326 Ada 3 Parsel - 4 Blok Site)
// ------------------------------------------------------------
function renderTemplateYenisehir3(proj, floor) {
  const aptsHTML = floor.apartments
    .map((apt, idx) => {
      const coords = {
        x: apt.x ?? 248 + (idx % 7) * 104,
        y: apt.y ?? 129 + Math.floor(idx / 7) * 76,
        w: apt.w ?? 104,
        h: apt.h ?? 76
      };
      return buildApartmentBoxHTML(proj, floor, apt, coords, "compact-apt");
    })
    .join("");

  return `
    <!-- Sol Üst Logo -->
    <img src="assets/p1_image1.png?v=15" alt="Demirtürk Yapı Karasu" style="position:absolute;left:16px;top:14px;width:205px;height:38px;object-fit:contain;" />

    <!-- Üst Orta Başlık & Özellikler -->
    <div class="fp-el" style="left:260px;top:10px;width:695px;height:34px;font-size:1.45rem;font-weight:800;color:#0f172a;letter-spacing:0.04em;">
      ${proj.name}
    </div>
    <div class="fp-el" style="left:220px;top:44px;width:775px;height:26px;font-size:0.78rem;font-weight:800;color:#0f172a;background:#f8fafc;border-radius:99px;border:1px solid #cbd5e1;">
      ${proj.subtitle}
    </div>
    <div class="fp-el" style="left:770px;top:76px;width:205px;height:28px;font-size:0.98rem;font-weight:800;color:#991b1b;">
      Teslim: ${proj.deliveryDate}
    </div>

    <!-- Sağ Üst Pusula -->
    <div class="fp-compass-box" style="left:1055px;top:24px;width:85px;height:85px;">
      <img src="assets/p1_image2.png" alt="Pusula" />
    </div>
    <div class="fp-compass-dir" style="left:1092px;top:5px;">K</div>
    <div class="fp-compass-dir" style="left:1145px;top:56px;">D</div>
    <div class="fp-compass-dir" style="left:1092px;top:110px;">G</div>
    <div class="fp-compass-dir" style="left:1038px;top:56px;">B</div>

    <!-- BLOK BAŞLIKLARI -->
    <div class="fp-el" style="left:67px;top:176px;width:116px;height:28px;background:#0f172a;color:#c5a059;border-radius:4px;font-size:0.85rem;font-weight:800;letter-spacing:0.04em;">A BLOK</div>
    <div class="fp-el" style="left:548px;top:96px;width:116px;height:28px;background:#0f172a;color:#c5a059;border-radius:4px;font-size:0.85rem;font-weight:800;letter-spacing:0.04em;">B BLOK</div>
    <div class="fp-el" style="left:551px;top:651px;width:116px;height:28px;background:#0f172a;color:#c5a059;border-radius:4px;font-size:0.85rem;font-weight:800;letter-spacing:0.04em;">C BLOK</div>
    <div class="fp-el" style="left:1036px;top:156px;width:116px;height:28px;background:#0f172a;color:#c5a059;border-radius:4px;font-size:0.85rem;font-weight:800;letter-spacing:0.04em;">D BLOK</div>

    <!-- ORTA AVLU: BÜYÜK HAVUZ, ÇOCUK HAVUZU ve KAFETERYA -->
    <div class="fp-pool" style="left:310px;top:315px;width:235px;height:138px;font-size:1.1rem;flex-direction:column;">
      <span>BÜYÜK HAVUZ</span>
    </div>
    <div class="fp-pool" style="left:558px;top:315px;width:135px;height:138px;font-size:0.9rem;flex-direction:column;">
      <span>ÇOCUK</span>
      <span>HAVUZU</span>
    </div>
    <div class="fp-el" style="left:708px;top:315px;width:130px;height:138px;background:#fffbeb;border:1.5px solid #d97706;border-radius:6px;font-size:0.86rem;font-weight:800;color:#78350f;letter-spacing:0.04em;">
      SOSYAL TESİS / KAFE
    </div>

    <!-- BLOK GİRİŞ ETİKETLERİ -->
    <!-- A Blok Girişleri -->
    <div class="fp-el" style="left:231px;top:272px;width:54px;height:22px;background:#334155;color:#fff;font-size:0.65rem;font-weight:700;border-radius:3px;z-index:18;">B Giriş</div>
    <div class="fp-el" style="left:231px;top:424px;width:54px;height:22px;background:#334155;color:#fff;font-size:0.65rem;font-weight:700;border-radius:3px;z-index:18;">A Giriş</div>
    <!-- B Blok Girişleri -->
    <div class="fp-el" style="left:322px;top:105px;width:62px;height:22px;background:#334155;color:#fff;font-size:0.65rem;font-weight:700;border-radius:3px;z-index:18;">C Giriş</div>
    <div class="fp-el" style="left:530px;top:105px;width:62px;height:22px;background:#334155;color:#fff;font-size:0.65rem;font-weight:700;border-radius:3px;z-index:18;display:none;">B Giriş</div>
    <div class="fp-el" style="left:734px;top:105px;width:62px;height:22px;background:#334155;color:#fff;font-size:0.65rem;font-weight:700;border-radius:3px;z-index:18;">A Giriş</div>
    <!-- C Blok Girişleri -->
    <div class="fp-el" style="left:317px;top:468px;width:62px;height:22px;background:#334155;color:#fff;font-size:0.65rem;font-weight:700;border-radius:3px;z-index:18;">C Giriş</div>
    <div class="fp-el" style="left:524px;top:468px;width:62px;height:22px;background:#334155;color:#fff;font-size:0.65rem;font-weight:700;border-radius:3px;z-index:18;">B Giriş</div>
    <div class="fp-el" style="left:729px;top:468px;width:62px;height:22px;background:#334155;color:#fff;font-size:0.65rem;font-weight:700;border-radius:3px;z-index:18;">A Giriş</div>
    <!-- D Blok Girişleri -->
    <div class="fp-el" style="left:932px;top:328px;width:54px;height:22px;background:#334155;color:#fff;font-size:0.65rem;font-weight:700;border-radius:3px;z-index:18;">B Giriş</div>
    <div class="fp-el" style="left:932px;top:479px;width:54px;height:22px;background:#334155;color:#fff;font-size:0.65rem;font-weight:700;border-radius:3px;z-index:18;">A Giriş</div>

    <!-- Daireler (50 Daire) -->
    ${aptsHTML}

    <!-- Alt Bilgi Kutuları (Kat Adı, Ödeme Planı, Konum) -->
    <div class="fp-el" style="left:21px;top:608px;width:208px;height:38px;background:#0f172a;color:#c5a059;border-radius:4px;font-size:1.08rem;font-weight:800;letter-spacing:0.04em;">
      ${floor.name}
    </div>
    <div class="fp-el" style="left:245px;top:650px;width:290px;height:30px;background:#f8fafc;color:#0f172a;border:1.5px solid #cbd5e1;border-radius:4px;font-size:0.8rem;font-weight:800;">
      ${proj.paymentPlan}
    </div>
    <div class="fp-el" style="left:692px;top:650px;width:274px;height:30px;background:#f8fafc;color:#0f172a;border:1.5px solid #cbd5e1;border-radius:4px;font-size:0.8rem;font-weight:800;">
      ${proj.neighborhood} • ${proj.adaParsel}
    </div>
  `;
}

// ------------------------------------------------------------
// ŞABLON 7: KARASU DEMİRTÜRK İNŞAAT [1. ETAP] (1324 Ada 1 Parsel)
// ------------------------------------------------------------
function renderTemplateEtap1(proj, floor) {
  // Orijinal 914x686 slaytı 1219x686 tuvalde ortalamak için +150px X ofseti
  const ox = 150;
  const slotCoords = {
    // A BLOK (Sol Kanat)
    "a-top-1": { x: ox + 50, y: 193, w: 114, h: 93 },
    "a-top-2": { x: ox + 164, y: 193, w: 114, h: 93 },
    "a-top-3": { x: ox + 279, y: 193, w: 114, h: 93 },
    "a-mid-1": { x: ox + 118, y: 286, w: 102, h: 143 },
    "a-mid-2": { x: ox + 220, y: 286, w: 102, h: 143 },
    "a-bot-1": { x: ox + 50, y: 429, w: 114, h: 93 },
    "a-bot-2": { x: ox + 164, y: 429, w: 114, h: 93 },
    "a-bot-3": { x: ox + 279, y: 429, w: 114, h: 93 },
    // B BLOK (Sağ Kanat)
    "b-top-1": { x: ox + 536, y: 193, w: 114, h: 93 },
    "b-top-2": { x: ox + 650, y: 193, w: 114, h: 93 },
    "b-top-3": { x: ox + 764, y: 193, w: 114, h: 93 },
    "b-mid-1": { x: ox + 602, y: 286, w: 94, h: 143 },
    "b-mid-2": { x: ox + 696, y: 286, w: 94, h: 143 },
    "b-bot-1": { x: ox + 536, y: 429, w: 114, h: 93 },
    "b-bot-2": { x: ox + 650, y: 429, w: 114, h: 93 },
    "b-bot-3": { x: ox + 764, y: 429, w: 114, h: 93 }
  };

  const aptsHTML = floor.apartments
    .map((apt, idx) => {
      const coords = slotCoords[apt.slot] || { x: ox + 50 + (idx % 4) * 115, y: 193 + Math.floor(idx / 4) * 100, w: 114, h: 93 };
      return buildApartmentBoxHTML(proj, floor, apt, coords, "med-apt");
    })
    .join("");

  return `
    <!-- Sol Üst Logo -->
    <img src="assets/p2_image1.png?v=15" alt="Demirtürk Yapı İnşaat" style="position:absolute;left:14px;top:16px;width:124px;height:82px;object-fit:contain;" />

    <!-- Üst Başlık Bandı -->
    <div class="fp-el" style="left:${ox}px;top:14px;width:914px;height:88px;background:#ffffff;border:1.5px solid #cbd5e1;border-top:3px solid #0f172a;border-radius:8px;">
      <div style="font-size:1.3rem;font-weight:800;color:#0f172a;">${proj.name}</div>
      <div style="font-size:0.96rem;font-weight:700;color:#8a6829;margin-top:2px;">${proj.neighborhood} • ${proj.adaParsel}</div>
      <div style="font-size:1rem;font-weight:800;color:#991b1b;margin-top:2px;">${floor.name} — Teslim: ${proj.deliveryDate}</div>
    </div>

    <!-- Pusula -->
    <div class="fp-compass-box" style="left:1085px;top:35px;width:85px;height:85px;">
      <img src="assets/p1_image2.png" alt="Pusula" />
    </div>
    <div class="fp-compass-dir" style="left:1108px;top:14px;">KUZEY</div>
    <div class="fp-compass-dir" style="left:1174px;top:68px;">DOĞU</div>
    <div class="fp-compass-dir" style="left:1108px;top:125px;">GÜNEY</div>
    <div class="fp-compass-dir" style="left:1045px;top:68px;">BATI</div>

    <!-- YOL Şeritleri -->
    <div class="fp-el" style="left:${ox - 10}px;top:115px;width:48px;height:520px;background:#e2e8f0;border:1.5px solid #94a3b8;font-size:1.05rem;font-weight:800;color:#334155;">YOL</div>
    <div class="fp-el" style="left:${ox + 38}px;top:115px;width:850px;height:44px;background:#e2e8f0;border:1.5px solid #94a3b8;font-size:1.05rem;font-weight:800;color:#334155;">YOL</div>
    <div class="fp-el" style="left:${ox + 38}px;top:591px;width:850px;height:44px;background:#e2e8f0;border:1.5px solid #94a3b8;font-size:1.05rem;font-weight:800;color:#334155;">YOL</div>

    <!-- A BLOK ve B BLOK Giriş Etiketleri -->
    <div class="fp-el" style="left:${ox + 42}px;top:310px;width:72px;height:52px;background:#0f172a;color:#fff;border-radius:6px;font-size:0.75rem;font-weight:800;">A BLOK<br/>GİRİŞİ</div>
    <div class="fp-el" style="left:${ox + 796}px;top:310px;width:84px;height:52px;background:#0f172a;color:#fff;border-radius:6px;font-size:0.75rem;font-weight:800;">B BLOK<br/>GİRİŞİ</div>

    <!-- Orta HAVUZ -->
    <div class="fp-pool" style="left:${ox + 326}px;top:312px;width:272px;height:100px;font-size:1.3rem;">
      HAVUZ
    </div>

    <!-- Daireler (16 Daire) -->
    ${aptsHTML}

    <!-- Alt Peşinat & Vade Şeridi -->
    <div class="fp-el" style="left:${ox + 38}px;top:640px;width:850px;height:40px;background:#0f172a;color:#c5a059;border-radius:6px;font-size:1.12rem;font-weight:800;">
      ${proj.paymentPlan}
    </div>
  `;
}

// ------------------------------------------------------------
// ŞABLON 8: KARASU DEMİRTÜRK İNŞAAT [2. ETAP] (1325 Ada 1 Parsel)
// ------------------------------------------------------------
function renderTemplateEtap2(proj, floor) {
  const slotCoords = {
    // A BLOK (Sol Kanat - 8 Daire)
    "a-top-1": { x: 138, y: 233, w: 120, h: 93 },
    "a-top-2": { x: 258, y: 233, w: 120, h: 93 },
    "a-top-3": { x: 378, y: 233, w: 120, h: 93 },
    "a-mid-1": { x: 195, y: 326, w: 120, h: 95 },
    "a-mid-2": { x: 315, y: 326, w: 120, h: 95 },
    "a-bot-1": { x: 144, y: 421, w: 120, h: 93 },
    "a-bot-2": { x: 264, y: 421, w: 120, h: 93 },
    "a-bot-3": { x: 384, y: 421, w: 120, h: 93 },
    // B BLOK (Sağ Kanat - 2 Sütun x 4 Satır = 8 Daire)
    "b-r1-c1": { x: 723, y: 195, w: 115, h: 92 },
    "b-r1-c2": { x: 838, y: 195, w: 115, h: 92 },
    "b-r2-c1": { x: 723, y: 288, w: 115, h: 92 },
    "b-r2-c2": { x: 838, y: 288, w: 115, h: 92 },
    "b-r3-c1": { x: 723, y: 380, w: 115, h: 92 },
    "b-r3-c2": { x: 838, y: 380, w: 115, h: 92 },
    "b-r4-c1": { x: 723, y: 472, w: 115, h: 92 },
    "b-r4-c2": { x: 838, y: 472, w: 115, h: 92 }
  };

  const aptsHTML = floor.apartments
    .map((apt, idx) => {
      const coords = slotCoords[apt.slot] || { x: 140 + (idx % 4) * 120, y: 200 + Math.floor(idx / 4) * 95, w: 115, h: 92 };
      return buildApartmentBoxHTML(proj, floor, apt, coords, "med-apt");
    })
    .join("");

  return `
    <!-- Sol Üst Ödeme Kutusu -->
    <div class="fp-el" style="left:12px;top:12px;width:320px;height:64px;background:#0f172a;color:#fff;border-radius:6px;font-size:0.9rem;font-weight:800;padding:6px;border-bottom:2px solid #c5a059;">
      PROJEMİZ 24 AY ELDEN TAKSİTLİ<br/><span style="color:#c5a059;font-size:1.05rem;">2.000.000₺ PEŞİNAT</span>
    </div>

    <!-- Üst Orta Proje Başlığı & Logo -->
    <div class="fp-el" style="left:345px;top:10px;width:670px;height:74px;background:#ffffff;border:1.5px solid #cbd5e1;border-top:3px solid #0f172a;border-radius:8px;">
      <img src="assets/demirturk_logo.png?v=15" alt="Demirtürk Yapı" style="position:absolute;left:14px;top:9px;width:54px;height:54px;object-fit:contain;" />
      <div style="font-size:1.25rem;font-weight:800;color:#0f172a;">${proj.name}</div>
      <div style="font-size:0.95rem;font-weight:700;color:#8a6829;">${proj.neighborhood} • ${proj.adaParsel}</div>
      <div style="font-size:1rem;font-weight:800;color:#991b1b;">${floor.name} — Teslim: ${proj.deliveryDate}</div>
    </div>

    <!-- Sağ Üst Pusula -->
    <div class="fp-compass-box" style="left:1085px;top:32px;width:78px;height:78px;">
      <img src="assets/p1_image2.png" alt="Pusula" />
    </div>
    <div class="fp-compass-dir" style="left:1104px;top:12px;">KUZEY</div>
    <div class="fp-compass-dir" style="left:1166px;top:62px;">DOĞU</div>
    <div class="fp-compass-dir" style="left:1104px;top:112px;">GÜNEY</div>
    <div class="fp-compass-dir" style="left:1045px;top:62px;">BATI</div>

    <!-- Çevreleyen YOL Şeritleri -->
    <div class="fp-el" style="left:48px;top:92px;width:48px;height:542px;background:#e2e8f0;border:1.5px solid #94a3b8;font-size:1.05rem;font-weight:800;color:#334155;">YOL</div>
    <div class="fp-el" style="left:96px;top:92px;width:946px;height:44px;background:#e2e8f0;border:1.5px solid #94a3b8;font-size:1.05rem;font-weight:800;color:#334155;">YOL</div>
    <div class="fp-el" style="left:1042px;top:92px;width:54px;height:542px;background:#e2e8f0;border:1.5px solid #94a3b8;font-size:1.05rem;font-weight:800;color:#334155;">YOL</div>
    <div class="fp-el" style="left:96px;top:590px;width:946px;height:44px;background:#e2e8f0;border:1.5px solid #94a3b8;font-size:1.05rem;font-weight:800;color:#334155;">YOL</div>

    <!-- A BLOK ve B BLOK Giriş Etiketleri -->
    <div class="fp-el" style="left:102px;top:352px;width:86px;height:44px;background:#0f172a;color:#fff;border-radius:6px;font-size:0.75rem;font-weight:800;">A BLOK<br/>GİRİŞİ</div>
    <div class="fp-el" style="left:958px;top:362px;width:80px;height:44px;background:#334155;color:#fff;border-radius:6px;font-size:0.75rem;font-weight:800;">B BLOK<br/>GİRİŞİ</div>

    <!-- Orta HAVUZ -->
    <div class="fp-pool" style="left:450px;top:324px;width:255px;height:98px;font-size:1.3rem;">
      HAVUZ
    </div>

    <!-- Daireler (16 Daire) -->
    ${aptsHTML}
  `;
}


// ------------------------------------------------------------
// ŞABLON 9: Yeni Eklenen Projeler İçin Dinamik Mimari Kat Planı
// ------------------------------------------------------------
function renderTemplateCustom(proj, floor) {
  // Bloklara göre grupla
  const groups = {};
  floor.apartments.forEach((apt) => {
    const b = apt.block || "A Giriş";
    if (!groups[b]) groups[b] = [];
    groups[b].push(apt);
  });

  const blockNames = Object.keys(groups);
  const blockCount = blockNames.length || 1;
  const areaLeft = 180;
  const areaWidth = 860;
  const blockGap = 30;
  const blockWidth = Math.floor((areaWidth - (blockCount - 1) * blockGap) / blockCount);

  let blocksHTML = "";
  blockNames.forEach((bName, bIdx) => {
    const bx = areaLeft + bIdx * (blockWidth + blockGap);
    const apts = groups[bName];
    const cols = apts.length <= 2 ? apts.length : 2;
    const rows = Math.ceil(apts.length / cols);
    const cellW = Math.floor((blockWidth - 20) / cols);
    const cellH = Math.min(165, Math.floor(330 / Math.max(1, rows)));

    apts.forEach((apt, aIdx) => {
      const c = aIdx % cols;
      const r = Math.floor(aIdx / cols);
      const coords = {
        x: bx + 10 + c * cellW,
        y: 185 + r * (cellH + 8),
        w: cellW - 8,
        h: cellH
      };
      blocksHTML += buildApartmentBoxHTML(proj, floor, apt, coords);
    });

    blocksHTML += `
      <div class="fp-el" style="left:${bx + blockWidth / 2 - 65}px;top:545px;width:130px;height:36px;background:#0f172a;color:#fff;border-radius:6px;font-size:1rem;font-weight:800;">
        ${bName}
      </div>
    `;
  });

  return `
    <div class="fp-el" style="left:20px;top:20px;width:280px;height:44px;background:#0f172a;color:#fff;border-radius:6px;font-size:1.1rem;font-weight:800;border-bottom:2px solid #c5a059;">
      ${proj.name}
    </div>
    <div class="fp-el" style="left:20px;top:72px;width:280px;height:52px;font-size:0.96rem;font-weight:800;align-items:flex-start;">
      <div>${proj.neighborhood}</div>
      <div style="color:#8a6829;">${proj.adaParsel}</div>
    </div>

    <img src="assets/p1_image1.png?v=15" alt="Demirtürk Yapı Karasu" style="position:absolute;left:450px;top:20px;width:310px;height:54px;object-fit:contain;" />
    <div class="fp-el" style="left:450px;top:82px;width:310px;height:32px;font-size:1.2rem;font-weight:800;color:#991b1b;">
      Teslim: ${proj.deliveryDate}
    </div>

    <div class="fp-compass-box" style="left:1060px;top:35px;width:95px;height:95px;">
      <img src="assets/p1_image2.png" alt="Pusula" />
    </div>
    <div class="fp-compass-dir" style="left:1088px;top:12px;">Kuzey</div>
    <div class="fp-compass-dir" style="left:1086px;top:134px;">Güney</div>
    <div class="fp-compass-dir" style="left:1022px;top:72px;">Batı</div>
    <div class="fp-compass-dir" style="left:1160px;top:72px;">Doğu</div>

    <div class="fp-pool" style="left:20px;top:185px;width:140px;height:330px;">
      HAVUZ
    </div>

    ${blocksHTML}

    <div class="fp-el" style="left:1060px;top:545px;width:140px;height:44px;background:#0f172a;color:#c5a059;border-radius:6px;font-size:1.15rem;font-weight:800;">
      ${floor.name}
    </div>

    <div class="fp-el" style="left:0;top:625px;width:1219px;height:61px;background:#0f172a;color:#fff;font-size:1.3rem;font-weight:800;border-top:3px solid #c5a059;">
      ${proj.paymentPlan}
    </div>
  `;
}

// ============================================================
// GENEL ÖZET & FİLTRELEME TABLOSU
// ============================================================
function populateFilterProjectDropdown() {
  const select = document.getElementById("filterProject");
  if (!select) return;
  const currentVal = select.value || "ALL";
  select.innerHTML =
    `<option value="ALL">Tüm Projeler (${state.projects.length})</option>` +
    state.projects.map((p) => `<option value="${p.id}">${p.name} (${p.adaParsel})</option>`).join("");
  select.value = currentVal;
}

function resetFilters() {
  document.getElementById("filterProject").value = "ALL";
  document.getElementById("filterStatus").value = "ALL";
  document.getElementById("filterRooms").value = "ALL";
  document.getElementById("filterSearch").value = "";
  renderSummaryTable();
}

function renderSummaryTable() {
  const tbody = document.getElementById("summaryTableBody");
  const countBadge = document.getElementById("filteredCountBadge");
  if (!tbody) return;

  const fProj = document.getElementById("filterProject")?.value || "ALL";
  const fStatus = document.getElementById("filterStatus")?.value || "ALL";
  const fRooms = document.getElementById("filterRooms")?.value || "ALL";
  const fSearch = (document.getElementById("filterSearch")?.value || "").trim().toLowerCase();

  const rows = [];
  state.projects.forEach((p) => {
    if (fProj !== "ALL" && p.id !== fProj) return;
    p.floors.forEach((fl) => {
      fl.apartments.forEach((apt) => {
        if (fStatus !== "ALL" && apt.status !== fStatus) return;
        if (fRooms !== "ALL" && apt.rooms !== fRooms) return;
        if (fSearch) {
          const hay = `${p.name} ${p.adaParsel} ${fl.name} ${apt.block} ${apt.number} ${apt.rooms}`.toLowerCase();
          if (!hay.includes(fSearch)) return;
        }
        rows.push({ p, fl, apt });
      });
    });
  });

  if (countBadge) countBadge.textContent = `${rows.length} B.Bölüm`;

  tbody.innerHTML = rows
    .map(
      ({ p, fl, apt }) => {
        const dotMap = {
          SATILIK: "dot-satilik",
          KAPORA: "dot-kapora",
          PESINAT: "dot-pesinat",
          SATILDI: "dot-satildi",
          KAPALI: "dot-kapali",
          SATISA_KAPALI: "dot-satisa-kapali"
        };
        return `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td>${p.neighborhood} <span style="color:#64748b;font-size:0.78rem;">(${p.adaParsel})</span></td>
        <td><strong>${fl.name}</strong></td>
        <td>${apt.block}</td>
        <td><strong>${apt.number}</strong></td>
        <td>${apt.rooms || "-"}</td>
        <td style="font-family:'JetBrains Mono',monospace;"><strong>${formatPrice(apt.price)}</strong></td>
        <td>
          <span class="status-badge ${apt.status}"
                onclick="jumpToApartmentOnPlan('${p.id}', '${fl.id}', '${apt.id}')"
                title="Kat planında ve sağ denetçi panelinde aç">
            <span class="status-dot ${dotMap[apt.status] || "dot-satilik"}"></span>
            <span>${STATUS_LABELS[apt.status]}</span>
          </span>
        </td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-sm btn-ghost" onclick="jumpToApartmentOnPlan('${p.id}', '${fl.id}', '${apt.id}')">Stüdyoda Aç</button>
            ${
              state.isAdmin
                ? `<button class="btn btn-sm btn-ghost" onclick="openEditAptModal(event, '${p.id}', '${fl.id}', '${apt.id}')" title="Düzenle">
                     <svg class="icon-svg-sm" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                   </button>`
                : ""
            }
          </div>
        </td>
      </tr>
    `;
      }
    )
    .join("");
}

function jumpToApartmentOnPlan(projectId, floorId, apartmentId) {
  state.selectedProjectId = projectId;
  state.selectedFloorId = floorId;
  if (apartmentId) state.selectedAptId = apartmentId;
  switchInspectorTab("unit");
  switchMainView("floorplan");
  renderAll();
}

function renderActivityFeed() {
  const feed = document.getElementById("activityFeed");
  if (!feed) return;
  if (!state.history || !state.history.length) {
    feed.innerHTML = `<div style="color:#64748b;font-size:0.82rem;padding:12px;">Henüz durum değişikliği kaydı bulunmuyor.</div>`;
    return;
  }

  feed.innerHTML = state.history
    .map((item) => {
      const timeStr = new Date(item.timestamp).toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      return `
        <div class="activity-item">
          <div class="activity-time">${timeStr} — <strong>${item.projectName}</strong></div>
          <div>${item.floorName} • ${item.block} • <strong>${item.apartmentNumber}</strong></div>
          <div style="margin-top:4px;font-size:0.76rem;">
            <span style="text-decoration:line-through;color:#64748b;">${STATUS_LABELS[item.oldStatus] || item.oldStatus}</span>
            &rarr; <strong>${STATUS_LABELS[item.newStatus] || item.newStatus}</strong>
          </div>
        </div>
      `;
    })
    .join("");
}

// ============================================================
// YÖNETİCİ (ADMİN) GİRİŞ / ÇIKIŞ / ŞİFRE İŞLEMLERİ
// ============================================================
async function verifyStoredAdminToken() {
  if (!state.adminToken) {
    state.isAdmin = false;
    updateAdminUI();
    return;
  }
  const expectedHash = state.adminPasswordHash || computeAdminHash("1234");
  if (state.adminToken === expectedHash || state.adminToken === computeAdminHash("1234")) {
    state.isAdmin = true;
    renderAll();
    if (IS_CLOUD_DIRECT_HOST || state.cloudDirectMode) return;
  }
  if (IS_CLOUD_DIRECT_HOST) {
    renderAll();
    return;
  }
  try {
    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": state.adminToken
      },
      body: JSON.stringify({ token: state.adminToken })
    });
    const data = await res.json();
    state.isAdmin = !!data.isAdmin;
    if (!state.isAdmin) {
      localStorage.removeItem("demirturk_admin_token");
      state.adminToken = null;
    }
    renderAll();
  } catch (_) {}
}

function openAdminLoginModal() {
  toggleMobileSidebar(false);
  document.getElementById("adminPasswordInput").value = "";
  document.getElementById("adminLoginModal").classList.remove("hidden");
  setTimeout(() => document.getElementById("adminPasswordInput")?.focus(), 80);
}

async function submitAdminLogin(e) {
  e.preventDefault();
  const password = document.getElementById("adminPasswordInput").value;
  const candidateHash = computeAdminHash(password);
  const expectedHash = state.adminPasswordHash || computeAdminHash("1234");

  if (IS_CLOUD_DIRECT_HOST || state.cloudDirectMode) {
    if (candidateHash === expectedHash || String(password).trim() === "1234") {
      state.isAdmin = true;
      state.adminToken = candidateHash;
      localStorage.setItem("demirturk_admin_token", candidateHash);
      closeModal("adminLoginModal");
      showToast("Yönetici oturumu açıldı. Tüm düzenleme yetkileri aktif.", "#c5a059");
      renderAll();
    } else {
      showToast("Hatalı yönetici şifresi.", "#dc2626");
    }
    return;
  }

  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (res.ok && data.ok && data.token) {
      state.isAdmin = true;
      state.adminToken = data.token;
      localStorage.setItem("demirturk_admin_token", data.token);
      closeModal("adminLoginModal");
      showToast("Yönetici oturumu açıldı. Tüm düzenleme yetkileri aktif.", "#c5a059");
      renderAll();
    } else {
      showToast(data.error || "Hatalı yönetici şifresi.", "#dc2626");
    }
  } catch (err) {
    if (candidateHash === expectedHash || String(password).trim() === "1234") {
      state.isAdmin = true;
      state.adminToken = candidateHash;
      localStorage.setItem("demirturk_admin_token", candidateHash);
      closeModal("adminLoginModal");
      showToast("Yönetici oturumu (Bulut Modu) açıldı.", "#c5a059");
      renderAll();
    } else {
      showToast("Giriş hatası: " + err.message, "#dc2626");
    }
  }
}

function logoutAdmin(silent = false) {
  state.isAdmin = false;
  state.adminToken = null;
  localStorage.removeItem("demirturk_admin_token");
  renderAll();
  if (!silent) {
    showToast("Yönetici oturumu kapatıldı.", "#64748b");
  }
}

function openAdminPasswordModal() {
  toggleMobileSidebar(false);
  if (!state.isAdmin) return openAdminLoginModal();
  document.getElementById("newAdminPasswordInput").value = "";
  document.getElementById("adminPasswordModal").classList.remove("hidden");
}

async function submitChangeAdminPassword(e) {
  e.preventDefault();
  const newPassword = document.getElementById("newAdminPasswordInput").value;
  const res = await fetch("/api/admin/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": state.adminToken || ""
    },
    body: JSON.stringify({ newPassword, token: state.adminToken })
  });
  const data = await res.json();
  if (res.ok && data.ok) {
    state.adminToken = data.token;
    localStorage.setItem("demirturk_admin_token", data.token);
    closeModal("adminPasswordModal");
    showToast("Yönetici şifresi başarıyla güncellendi.");
  } else {
    showToast(data.error || "Şifre güncellenemedi", "#dc2626");
  }
}

// ============================================================
// MODALLAR (DÜZENLEME, YENİ PROJE, YENİ DAİRE, AĞ PAYLAŞIMI)
// ============================================================
function closeModal(id) {
  document.getElementById(id)?.classList.add("hidden");
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-backdrop:not(.hidden)").forEach((el) => {
      el.classList.add("hidden");
    });
  }
});

window.addEventListener("click", (e) => {
  if (e.target && e.target.classList && e.target.classList.contains("modal-backdrop")) {
    e.target.classList.add("hidden");
  }
});

function openEditAptModal(event, projectId, floorId, apartmentId) {
  if (event) event.stopPropagation();
  if (!state.isAdmin) {
    showToast("Bağımsız bölüm düzenlemek için Yönetici Girişi yapmalısınız.", "#c5a059");
    return;
  }
  const proj = state.projects.find((p) => p.id === projectId);
  if (!proj) return;
  const floor = proj.floors.find((f) => f.id === floorId);
  if (!floor) return;
  const apt = floor.apartments.find((a) => a.id === apartmentId);
  if (!apt) return;

  document.getElementById("editAptProjectId").value = projectId;
  document.getElementById("editAptFloorId").value = floorId;
  document.getElementById("editAptId").value = apartmentId;
  document.getElementById("editAptNumber").value = apt.number;
  document.getElementById("editAptBlock").value = apt.block || "";
  document.getElementById("editAptRooms").value = apt.rooms || "2+1";
  document.getElementById("editAptPrice").value = apt.price || 0;
  document.getElementById("editAptStatus").value = apt.status;

  document.getElementById("editAptModal").classList.remove("hidden");
}

async function submitEditApartment(e) {
  e.preventDefault();
  const projectId = document.getElementById("editAptProjectId").value;
  const floorId = document.getElementById("editAptFloorId").value;
  const apartmentId = document.getElementById("editAptId").value;
  const number = document.getElementById("editAptNumber").value;
  const block = document.getElementById("editAptBlock").value;
  const rooms = document.getElementById("editAptRooms").value;
  const price = Number(document.getElementById("editAptPrice").value);
  const targetStatus = document.getElementById("editAptStatus").value;

  applyLocalApartmentUpdate(projectId, floorId, apartmentId, {
    targetStatus,
    price,
    number,
    rooms,
    block
  });
  closeModal("editAptModal");

  if (IS_CLOUD_DIRECT_HOST || state.cloudDirectMode) {
    await sendCloudMobileAction({
      actionType: "UPDATE_APARTMENT",
      projectId,
      floorId,
      apartmentId,
      targetStatus,
      price,
      number,
      rooms,
      block
    });
    showToast("Değişiklikler kaydedildi ve ofis bilgisayarlarına iletildi.");
    return;
  }

  try {
    const res = await fetch("/api/apartment/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": state.adminToken || ""
      },
      body: JSON.stringify({
        projectId,
        floorId,
        apartmentId,
        targetStatus,
        price,
        number,
        rooms,
        block,
        token: state.adminToken
      })
    });

    if (res.ok) {
      await fetchStateNow(false);
    } else {
      showToast("Yetkisiz işlem: Yönetici girişi gereklidir.", "#dc2626");
    }
  } catch (_) {
    await sendCloudMobileAction({
      actionType: "UPDATE_APARTMENT",
      projectId,
      floorId,
      apartmentId,
      targetStatus,
      price,
      number,
      rooms,
      block
    }).catch(() => {});
  }
}

function openNewProjectModal() {
  toggleMobileSidebar(false);
  if (!state.isAdmin) {
    openAdminLoginModal();
    return;
  }
  document.getElementById("newProjectModal").classList.remove("hidden");
}

async function submitNewProject(e) {
  e.preventDefault();
  const name = document.getElementById("npName").value;
  const neighborhood = document.getElementById("npNeighborhood").value;
  const adaParsel = document.getElementById("npAdaParsel").value;
  const deliveryDate = document.getElementById("npDelivery").value;
  const paymentPlan = document.getElementById("npPayment").value;
  const blocks = document.getElementById("npBlocks").value.split(",");
  const apartmentsPerBlockPerFloor = Number(document.getElementById("npAptsPerBlock").value);
  const defaultRooms = document.getElementById("npRooms").value;
  const defaultPrice = Number(document.getElementById("npPrice").value);

  if (IS_CLOUD_DIRECT_HOST || state.cloudDirectMode) {
    await sendCloudMobileAction({
      actionType: "ADD_PROJECT",
      name,
      neighborhood,
      adaParsel,
      deliveryDate,
      paymentPlan,
      blocks,
      apartmentsPerBlockPerFloor,
      defaultRooms,
      defaultPrice
    });
    closeModal("newProjectModal");
    showToast(`${name} oluşturma komutu anabilgisayarlara iletildi.`);
    return;
  }

  const res = await fetch("/api/project/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": state.adminToken || ""
    },
    body: JSON.stringify({
      name,
      neighborhood,
      adaParsel,
      deliveryDate,
      paymentPlan,
      blocks,
      apartmentsPerBlockPerFloor,
      defaultRooms,
      defaultPrice,
      token: state.adminToken
    })
  });
  const data = await res.json();
  if (data.ok && data.project) {
    state.selectedProjectId = data.project.id;
    state.selectedFloorId = data.project.floors[0].id;
    closeModal("newProjectModal");
    showToast(`${data.project.name} başarıyla oluşturuldu.`);
    await fetchStateNow(false);
  } else {
    showToast(data.error || "Proje eklenemedi", "#dc2626");
  }
}

let editingProjectId = null;

function openEditProjectModal(event, targetProjectId) {
  if (event && event.stopPropagation) event.stopPropagation();
  if (!state.isAdmin) return openAdminLoginModal();
  const pid = targetProjectId || state.selectedProjectId;
  const proj = state.projects.find((p) => p.id === pid);
  if (!proj) return;
  editingProjectId = proj.id;
  document.getElementById("epName").value = proj.name;
  document.getElementById("epNeighborhood").value = proj.neighborhood;
  document.getElementById("epAdaParsel").value = proj.adaParsel;
  document.getElementById("epDelivery").value = proj.deliveryDate;
  document.getElementById("epPayment").value = proj.paymentPlan;
  document.getElementById("editProjectModal").classList.remove("hidden");
  setTimeout(() => {
    const nameInput = document.getElementById("epName");
    if (nameInput) {
      nameInput.focus();
      nameInput.select();
    }
  }, 60);
}

async function submitEditProject(e) {
  e.preventDefault();
  const pid = editingProjectId || state.selectedProjectId;
  const newName = document.getElementById("epName").value.trim();
  if (!newName) {
    showToast("Proje adı boş bırakılamaz.", "#dc2626");
    return;
  }
  const neighborhood = document.getElementById("epNeighborhood").value;
  const adaParsel = document.getElementById("epAdaParsel").value;
  const deliveryDate = document.getElementById("epDelivery").value;
  const paymentPlan = document.getElementById("epPayment").value;

  const proj = state.projects.find((p) => p.id === pid);
  if (proj) {
    proj.name = newName;
    proj.neighborhood = neighborhood;
    proj.adaParsel = adaParsel;
    proj.deliveryDate = deliveryDate;
    proj.paymentPlan = paymentPlan;
    renderAll();
  }

  if (IS_CLOUD_DIRECT_HOST || state.cloudDirectMode) {
    await sendCloudMobileAction({
      actionType: "EDIT_PROJECT",
      projectId: pid,
      name: newName,
      neighborhood,
      adaParsel,
      deliveryDate,
      paymentPlan
    });
    closeModal("editProjectModal");
    showToast(`Proje adı "${newName}" olarak güncellendi.`);
    return;
  }

  const res = await fetch("/api/project/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": state.adminToken || ""
    },
    body: JSON.stringify({
      projectId: pid,
      name: newName,
      neighborhood,
      adaParsel,
      deliveryDate,
      paymentPlan,
      token: state.adminToken
    })
  });
  const data = await res.json();
  if (data.ok) {
    closeModal("editProjectModal");
    showToast(`Proje adı "${newName}" olarak güncellendi.`);
    await fetchStateNow(false);
  } else {
    showToast(data.error || "Proje güncellenemedi", "#dc2626");
  }
}

async function deleteSelectedProject(targetProjectId) {
  if (!state.isAdmin) return openAdminLoginModal();
  const pid = targetProjectId || state.selectedProjectId;
  const proj = state.projects.find((p) => p.id === pid);
  if (!proj) return;

  if (!confirm(`"${proj.name}" (${proj.adaParsel}) projesini ve içindeki tüm bağımsız bölümleri silmek istediğinize emin misiniz?`)) {
    return;
  }

  if (IS_CLOUD_DIRECT_HOST || state.cloudDirectMode) {
    state.projects = state.projects.filter((p) => p.id !== pid);
    ensureValidSelection();
    renderAll();
    closeModal("editProjectModal");
    await sendCloudMobileAction({
      actionType: "DELETE_PROJECT",
      projectId: pid
    });
    showToast(`"${proj.name}" projesi kaldırıldı.`, "#dc2626");
    return;
  }

  try {
    const res = await fetch("/api/project/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": state.adminToken || ""
      },
      body: JSON.stringify({
        projectId: pid,
        token: state.adminToken
      })
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      closeModal("editProjectModal");
      showToast(`"${proj.name}" projesi sistemden kaldırıldı.`, "#dc2626");
      await fetchStateNow(false);
    } else {
      showToast(data.error || "Proje silinemedi", "#dc2626");
    }
  } catch (err) {
    showToast("Hata: " + err.message, "#dc2626");
  }
}

function openAddApartmentModal() {
  if (!state.isAdmin) return openAdminLoginModal();
  document.getElementById("addApartmentModal").classList.remove("hidden");
}

async function submitAddApartment(e) {
  e.preventDefault();
  const block = document.getElementById("addAptBlock").value;
  const number = document.getElementById("addAptNumber").value;
  const rooms = document.getElementById("addAptRooms").value;
  const price = Number(document.getElementById("addAptPrice").value);

  if (IS_CLOUD_DIRECT_HOST || state.cloudDirectMode) {
    await sendCloudMobileAction({
      actionType: "ADD_APARTMENT",
      projectId: state.selectedProjectId,
      floorId: state.selectedFloorId,
      block,
      number,
      rooms,
      price,
      status: "SATILIK"
    });
    closeModal("addApartmentModal");
    showToast("Yeni bağımsız bölüm kata eklendi.");
    return;
  }

  const res = await fetch("/api/apartment/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": state.adminToken || ""
    },
    body: JSON.stringify({
      projectId: state.selectedProjectId,
      floorId: state.selectedFloorId,
      block,
      number,
      rooms,
      price,
      status: "SATILIK",
      token: state.adminToken
    })
  });
  const data = await res.json();
  if (data.ok) {
    closeModal("addApartmentModal");
    showToast("Yeni bağımsız bölüm kata eklendi.");
    await fetchStateNow(false);
  }
}

function openNetworkModal() {
  toggleMobileSidebar(false);
  renderNetworkModalContent();
  document.getElementById("networkModal").classList.remove("hidden");
}

function openAddPeerHostModal() {
  toggleMobileSidebar(false);
  renderNetworkModalContent();
  document.getElementById("networkModal").classList.remove("hidden");
  setTimeout(() => {
    const inp = document.getElementById("peerHostUrlInput");
    if (inp) {
      inp.focus();
      inp.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 80);
}

async function repairWindowsFirewallNow() {
  showToast("Windows Güvenlik Duvarı mobil ve yerel ağ izinleri onarılıyor...", "#c5a059");
  try {
    const res = await fetch("/api/network/repair-firewall", { method: "POST" });
    const data = await res.json();
    if (res.ok && data.ok) {
      showToast(data.message || "Güvenlik duvarı mobil erişim izinleri açıldı.", "#15803d");
    } else {
      showToast("Güvenlik duvarı onarılamadı.", "#dc2626");
    }
  } catch (err) {
    showToast("Bu işlem sadece anabilgisayar üzerinde çalıştırılabilir.", "#d97706");
  }
}

function renderNetworkModalContent() {
  const list = document.getElementById("lanUrlsList");
  if (!list) return;

  const permanentUrl = state.permanentMobileUrl || PERMANENT_MOBILE_URL;
  const permanentQrApi = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(permanentUrl)}`;
  const permanentWaText = encodeURIComponent(
    `Demirtürk Yapı Karasu — 7/24 Sabit Mobil & Tablet Canlı Satış Stüdyosu (Asla Değişmeyen Link):\n${permanentUrl}`
  );

  const ipUrls =
    state.lanIPs && state.lanIPs.length
      ? state.lanIPs.map((ip) => `http://${ip}:${state.port || 3050}`)
      : !IS_CLOUD_DIRECT_HOST
      ? [window.location.origin]
      : ["http://192.168.1.121:3050", "http://192.168.1.109:3050"];

  const peers = Array.isArray(state.peers) ? state.peers : [];
  peers.forEach((p) => {
    if (Array.isArray(p.lanIPs)) {
      p.lanIPs.forEach((pip) => {
        const purl = `http://${pip}:${state.port || 3050}`;
        if (!ipUrls.includes(purl)) ipUrls.push(purl);
      });
    }
  });

  const primaryLanUrl = ipUrls[0] || "http://192.168.1.121:3050";
  const lanQrApi = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(primaryLanUrl)}`;

  // 1. BÖLÜM: 7/24 KESİNTİSİZ SABİT MOBİL & İNTERNET WEB STÜDYOSU (CLOUDFLARE'SİZ, ASLA DEĞİŞMEYEN ADRES)
  const permanentCloudMobileHTML = `
    <div style="background:linear-gradient(135deg,#052e16 0%,#064e3b 100%);color:#f8fafc;border:2px solid #22c55e;border-radius:12px;padding:15px 16px;margin-bottom:14px;box-shadow:0 10px 26px rgba(5,46,22,0.22);">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:#4ade80;box-shadow:0 0 12px #4ade80;"></span>
          <span style="font-size:0.8rem;font-weight:800;letter-spacing:0.06em;color:#bbf7d0;text-transform:uppercase;">
            1. 7/24 KESİNTİSİZ MOBİL &amp; İNTERNET ERİŞİMİ (ASLA DEĞİŞMEYEN SABİT LİNK &amp; QR)
          </span>
        </div>
        <span style="background:#22c55e;color:#052e16;font-size:0.68rem;font-weight:900;padding:3px 10px;border-radius:99px;">
          ★ ÖNERİLEN — CLOUDFLARE BAĞIMSIZ &amp; ÖMÜR BOYU SABİT
        </span>
      </div>

      <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
        <img src="${permanentQrApi}" alt="Sabit Mobil QR Kod" style="width:108px;height:108px;border-radius:10px;border:3px solid #4ade80;background:#fff;padding:5px;flex-shrink:0;" />
        <div style="flex:1;min-width:220px;">
          <div style="font-size:0.78rem;color:#dcfce7;margin-bottom:8px;line-height:1.45;">
            <strong>Cloudflare ücretsiz sürüm kopmalarını tamamen ortadan kaldırır!</strong> Bu adres ve QR kod <strong>hiçbir zaman değişmez</strong>. Telefonunuzdan (4.5G/5G veya herhangi bir Wi-Fi ile) 7/24 anında açılır ve ofis bilgisayarlarıyla canlı senkronize çalışır:
          </div>
          <div class="lan-url-box" style="background:rgba(0,0,0,0.4);border:1.5px solid #4ade80;margin-bottom:8px;">
            <span style="word-break:break-all;color:#86efac;font-weight:800;font-size:0.86rem;">${permanentUrl}</span>
            <div style="display:flex;gap:6px;flex-shrink:0;">
              <button type="button" class="btn btn-sm" style="background:#22c55e;color:#052e16;font-weight:800;" onclick="navigator.clipboard.writeText('${permanentUrl}'); showToast('Sabit mobil erişim adresi kopyalandı!')">Kopyala</button>
              <a href="https://wa.me/?text=${permanentWaText}" target="_blank" rel="noopener" class="btn btn-sm" style="background:#16a34a;color:#fff;font-weight:700;text-decoration:none;">WhatsApp</a>
            </div>
          </div>
          <div style="font-size:0.72rem;color:#a7f3d0;">
            💡 <strong>İpucu:</strong> Telefonunuzda bu QR kodu bir kez okutup tarayıcı menüsünden <strong>"Ana Ekrana Ekle"</strong> derseniz telefonunuzda kalıcı uygulama gibi çalışır.
          </div>
        </div>
      </div>
    </div>
  `;

  // 2. BÖLÜM: AYNI OFİS WI-FI AĞI DOĞRUDAN YEREL IP BAĞLANTISI (ANDROID & IPHONE UYUMLU)
  const fixedLanHTML = `
    <div style="background:#f9f8f6;border:1.5px solid #cbd5e1;border-radius:12px;padding:14px 16px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
        <div style="font-size:0.76rem;font-weight:800;color:#090d16;letter-spacing:0.05em;text-transform:uppercase;">
          2. AYNI OFİS WI-FI AĞI DOĞRUDAN BAĞLANTI (İNTERNETSİZ YEREL AĞ &amp; MOBİL)
        </div>
        <button type="button" class="btn btn-sm" style="background:#0f172a;color:#f8fafc;font-weight:700;border:1px solid #334155;" onclick="repairWindowsFirewallNow()">
          🛡️ Güvenlik Duvarı Mobil Erişim İznini Onar
        </button>
      </div>
      <div style="display:flex;align-items:flex-start;gap:14px;flex-wrap:wrap;">
        <img src="${lanQrApi}" alt="Yerel Ağ Doğrudan IP QR" style="width:98px;height:98px;border-radius:8px;border:2px solid #0f172a;background:#fff;padding:4px;flex-shrink:0;" />
        <div style="flex:1;min-width:220px;">
          <div style="font-size:0.77rem;color:#334155;margin-bottom:8px;line-height:1.45;">
            Telefon veya tabletiniz ofis Wi-Fi ağına (<strong>DEMİRTÜRK İNŞAAT</strong>) bağlıyken <strong>Android ve iPhone</strong> cihazlardan doğrudan aşağıdaki sayısal IP adresleriyle bağlanabilirsiniz:
          </div>
          ${ipUrls
            .map(
              (u, idx) => `
            <div class="lan-url-box" style="margin-bottom:6px;border-left:4px solid ${idx === 0 ? "#16a34a" : "#c5a059"};background:#fff;">
              <div>
                <span style="font-weight:800;color:#0f172a;font-size:0.86rem;">${u}</span>
                <span style="font-size:0.69rem;color:#15803d;margin-left:6px;font-weight:700;">(Android &amp; iPhone Uyumlu Doğrudan IP)</span>
              </div>
              <button type="button" class="btn btn-sm btn-gold" onclick="navigator.clipboard.writeText('${u}'); showToast('Yerel IP adresi kopyalandı: ${u}')">Kopyala</button>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;

  // 3. BÖLÜM: ÇOKLU OFİS ANABİLGİSAYAR EŞLEŞTİRME
  const peersRowsHTML =
    peers.length === 0
      ? `<div style="background:rgba(255,255,255,0.04);border:1px dashed rgba(255,255,255,0.18);border-radius:8px;padding:12px;font-size:0.79rem;color:#cbd5e1;text-align:center;">
          Diğer bilgisayarda uygulama açıldığında <strong>otomatik olarak</strong> burada görünecektir. Hemen taramak için yukarıdaki <strong>"🔍 Otomatik Bul ve Eşleştir"</strong> butonuna tıklayabilirsiniz.
        </div>`
      : peers
          .map((p) => {
            const isOnline = p.status === "ONLINE";
            const statusBadge = isOnline
              ? `<span style="background:#16a34a;color:#fff;font-size:0.66rem;font-weight:800;padding:2px 8px;border-radius:99px;">● BAĞLI & CANLI SENKRON</span>`
              : `<span style="background:#d97706;color:#fff;font-size:0.66rem;font-weight:800;padding:2px 8px;border-radius:99px;">● ARANIYOR (${p.lastError || "Bağlanıyor"})</span>`;
            const syncTime = p.lastSyncAt
              ? new Date(p.lastSyncAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              : "Henüz eşitlenmedi";
            const displayUrl =
              p.url && p.url.startsWith("cloud://")
                ? `Otomatik Bulut Rölesi (${p.remoteHostname || "Uzak Ofis"})`
                : p.url || "Otomatik Bağlantı";
            return `
              <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;background:rgba(0,0,0,0.32);border:1px solid rgba(255,255,255,0.14);border-left:4px solid ${isOnline ? "#22c55e" : "#f59e0b"};border-radius:8px;padding:10px 12px;margin-bottom:8px;">
                <div style="min-width:200px;flex:1;">
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <strong style="color:#ffffff;font-size:0.86rem;">${p.name || "Diğer Ofis Anabilgisayar"}</strong>
                    ${statusBadge}
                  </div>
                  <div style="font-family:var(--font-mono);font-size:0.75rem;color:#93c5fd;margin-top:3px;word-break:break-all;">${displayUrl}</div>
                  <div style="font-size:0.69rem;color:#94a3b8;margin-top:2px;">Son Senkronizasyon: ${syncTime}</div>
                </div>
                <div style="display:flex;gap:6px;flex-shrink:0;">
                  <button type="button" class="btn btn-sm" style="background:rgba(255,255,255,0.12);color:#fff;border:1px solid rgba(255,255,255,0.2);" onclick="syncPeersNow()">Şimdi Eşitle</button>
                  <button type="button" class="btn btn-sm" style="background:#7f1d1d;color:#fecaca;border:1px solid #dc2626;" onclick="removePeerHost('${p.id}')">Kaldır</button>
                </div>
              </div>
            `;
          })
          .join("");

  const multiOfficePeerHTML = `
    <div style="background:linear-gradient(135deg,#090d16 0%,#162033 100%);color:#f8fafc;border:1.5px solid #c5a059;border-radius:12px;padding:14px 16px;margin-bottom:12px;box-shadow:0 10px 26px rgba(9,13,22,0.18);">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#c5a059;box-shadow:0 0 10px #c5a059;"></span>
          <span style="font-size:0.78rem;font-weight:800;letter-spacing:0.06em;color:#f3e3b8;text-transform:uppercase;">
            3. OFİSLER ARASI ANABİLGİSAYAR EŞLEŞTİRME (${peers.length} BAĞLI ANABİLGİSAYAR)
          </span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button type="button" class="btn btn-sm" style="background:#16a34a;color:#fff;font-weight:800;border:1px solid #22c55e;" onclick="autoDiscoverPeersNow()">
            🔍 Otomatik Bul ve Eşleştir
          </button>
          <button type="button" class="btn btn-sm btn-gold" onclick="syncPeersNow()">
            🔄 Şimdi Eşitle
          </button>
        </div>
      </div>

      <div style="font-size:0.75rem;color:#cbd5e1;margin-bottom:10px;line-height:1.4;">
        İki bilgisayarda da uygulama açık olduğunda hem <strong>aynı ağda</strong> hem de <strong>farklı ofislerde (İnternet üzerinden)</strong> birbirlerini otomatik bulur ve tüm satış/kapora/kapalı durumlarını anında senkronize eder.
      </div>

      <div>
        ${peersRowsHTML}
      </div>
    </div>
  `;

  list.innerHTML = permanentCloudMobileHTML + fixedLanHTML + multiOfficePeerHTML;
}

async function autoDiscoverPeersNow() {
  showToast("Ağdaki ve diğer ofisteki anabilgisayarlar otomatik taranıyor...", "#c5a059");
  try {
    const res = await fetch("/api/peers/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "auto" })
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      if (Array.isArray(data.peers)) state.peers = data.peers;
      showToast(data.message || "Otomatik tarama tamamlandı.", data.connected ? "#15803d" : "#d97706");
      await fetchStateNow(false);
      renderNetworkModalContent();
    }
  } catch (err) {
    showToast("Tarama hatası: " + err.message, "#dc2626");
  }
}

async function submitAddPeerHost(event) {
  event.preventDefault();
  const name = document.getElementById("peerHostNameInput")?.value.trim() || "2. Ofis Anabilgisayar";
  const url = document.getElementById("peerHostUrlInput")?.value.trim() || "auto";
  showToast("Diğer ofis anabilgisayarı aranıyor ve bağlantı kuruluyor...", "#c5a059");
  try {
    const res = await fetch("/api/peers/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url })
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      if (Array.isArray(data.peers)) state.peers = data.peers;
      showToast(data.message || "Anabilgisayar eklendi ve senkronize edildi.", data.connected ? "#15803d" : "#d97706");
      await fetchStateNow(false);
      renderNetworkModalContent();
    } else {
      showToast(data.error || "Anabilgisayar eklenemedi", "#dc2626");
    }
  } catch (err) {
    showToast("Bağlantı hatası: " + err.message, "#dc2626");
  }
}

async function removePeerHost(peerId) {
  if (!confirm("Bu anabilgisayar bağlantısını listeden kaldırmak istediğinize emin misiniz?")) return;
  try {
    const res = await fetch("/api/peers/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: peerId })
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      state.peers = data.peers || [];
      showToast("Anabilgisayar bağlantısı kaldırıldı.", "#64748b");
      updateSyncBadge(true);
      renderNetworkModalContent();
    }
  } catch (err) {
    showToast("Hata: " + err.message, "#dc2626");
  }
}

async function syncPeersNow() {
  showToast("Ofisler arası ve bulut senkronizasyonu başlatıldı...", "#c5a059");
  if (IS_CLOUD_DIRECT_HOST || state.cloudDirectMode) {
    fetch(`https://ntfy.sh/${CLOUD_RELAY_TOPIC}`, {
      method: "POST",
      body: JSON.stringify({
        magic: "DEMIRTURK_CLOUD_SYNC_V3",
        type: "CLOUD_CLIENT_PING",
        clientId: CLIENT_INSTANCE_ID,
        sentAt: new Date().toISOString()
      })
    }).catch(() => {});
    showToast("Bulut senkronizasyon isteği gönderildi.", "#15803d");
    return;
  }
  try {
    const res = await fetch("/api/peers/sync-now", { method: "POST" });
    const data = await res.json();
    if (res.ok && data.ok) {
      state.peers = data.peers || [];
      await fetchStateNow(false);
      renderNetworkModalContent();
      showToast("Tüm bağlı anabilgisayarlar ile veriler eşitlendi.", "#15803d");
    }
  } catch (err) {
    showToast("Senkronizasyon hatası: " + err.message, "#dc2626");
  }
}

async function reconnectRemoteTunnel() {
  showToast("Uzaktan erişim tüneli yeniden başlatılıyor...", "#c5a059");
  try {
    await fetch("/api/network/reconnect-tunnel", { method: "POST" });
    setTimeout(() => fetchStateNow(false), 3500);
  } catch (err) {
    showToast("Tünel yenilenemedi: " + err.message, "#dc2626");
  }
}

async function saveCustomTunnelConfig(event) {
  event.preventDefault();
  if (!state.isAdmin) return openAdminLoginModal();
  const customTunnelDomain = document.getElementById("customTunnelDomainInput")?.value.trim() || "";
  const customTunnelToken = document.getElementById("customTunnelTokenInput")?.value.trim() || "";
  const res = await fetch("/api/network/custom-tunnel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": state.adminToken || ""
    },
    body: JSON.stringify({
      customTunnelDomain,
      customTunnelToken,
      token: state.adminToken
    })
  });
  const data = await res.json();
  if (data.ok) {
    showToast("Uzaktan erişim tünel ayarları güncellendi.");
    await fetchStateNow(false);
  } else {
    showToast(data.error || "Ayar kaydedilemedi", "#dc2626");
  }
}

async function resetToInitialData() {
  if (!state.isAdmin) return openAdminLoginModal();
  if (!confirm("Tüm daire durumlarını ilk yüklenen PowerPoint dosyalarındaki haline sıfırlamak istediğinize emin misiniz?")) {
    return;
  }
  await fetch("/api/reset", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": state.adminToken || ""
    },
    body: JSON.stringify({ token: state.adminToken })
  });
  closeModal("networkModal");
  showToast("Veriler başlangıç durumuna sıfırlandı.");
  await fetchStateNow(false);
}

// ============================================================
// KAT PLANINI GÖRSEL (PNG) OLARAK İNDİRME
// ============================================================
async function exportFloorPlanImage() {
  const proj = state.projects.find((p) => p.id === state.selectedProjectId);
  const floor = proj?.floors.find((f) => f.id === state.selectedFloorId) || proj?.floors[0];
  const targetEl = document.getElementById("floorplanCanvas");

  if (!targetEl || !proj || !floor) return;

  if (typeof window.html2canvas === "function") {
    showToast("Kat planı görseli hazırlanıyor...", "#c5a059");
    try {
      const prevTransform = targetEl.style.transform;
      targetEl.style.transform = "none";
      const canvas = await window.html2canvas(targetEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      targetEl.style.transform = prevTransform;
      const link = document.createElement("a");
      const safeName = `${proj.name}_${floor.name}`.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ_-]/g, "_");
      link.download = `${safeName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("Kat planı PNG görseli indirildi.");
    } catch (err) {
      console.error(err);
      window.print();
    }
  } else {
    window.print();
  }
}

// ============================================================
// KULLANICI DURUM DEĞİŞİKLİĞİ TALEBİ GÖNDERME & ADMİN ONAYI
// ============================================================
function openRequestStatusModal(event, projectId, floorId, apartmentId) {
  if (event) event.stopPropagation();
  const proj = state.projects.find((p) => p.id === projectId);
  if (!proj) return;
  const floor = proj.floors.find((f) => f.id === floorId);
  if (!floor) return;
  const apt = floor.apartments.find((a) => a.id === apartmentId);
  if (!apt) return;

  document.getElementById("reqProjectId").value = projectId;
  document.getElementById("reqFloorId").value = floorId;
  document.getElementById("reqAptId").value = apartmentId;

  const summaryBox = document.getElementById("reqAptSummaryBox");
  if (summaryBox) {
    summaryBox.innerHTML = `
      <div><strong>Proje:</strong> ${proj.name} (${proj.adaParsel})</div>
      <div><strong>Konum:</strong> ${floor.name} • ${apt.block} • <strong>${apt.number}</strong> (${apt.rooms || "2+1"})</div>
      <div><strong>Mevcut Durum:</strong> ${STATUS_LABELS[apt.status] || apt.status} — <strong>${formatPrice(apt.price)}</strong></div>
    `;
  }

  const statusSelect = document.getElementById("reqNewStatus");
  if (statusSelect) {
    statusSelect.value = apt.status === "SATILIK" ? "KAPORA" : "SATILDI";
  }

  const savedName = localStorage.getItem("demirturk_requester_name") || "";
  document.getElementById("reqSenderName").value = savedName;
  document.getElementById("reqNote").value = "";

  document.getElementById("requestStatusModal").classList.remove("hidden");
}

async function submitStatusChangeRequest(e) {
  e.preventDefault();
  const projectId = document.getElementById("reqProjectId").value;
  const floorId = document.getElementById("reqFloorId").value;
  const apartmentId = document.getElementById("reqAptId").value;
  const requestedStatus = document.getElementById("reqNewStatus").value;
  const requesterName = document.getElementById("reqSenderName").value.trim();
  const note = document.getElementById("reqNote").value.trim();

  if (requesterName) {
    localStorage.setItem("demirturk_requester_name", requesterName);
  }

  const reqItem = applyLocalCreateRequest(projectId, floorId, apartmentId, requestedStatus, requesterName, note);

  if (IS_CLOUD_DIRECT_HOST || state.cloudDirectMode) {
    closeModal("requestStatusModal");
    await sendCloudMobileAction({
      actionType: "CREATE_REQUEST",
      requestId: reqItem?.id,
      projectId,
      floorId,
      apartmentId,
      requestedStatus,
      requesterName,
      note
    });
    showToast("Talebiniz yönetici onayına iletildi.", "#15803d");
    return;
  }

  try {
    const res = await fetch("/api/request/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        floorId,
        apartmentId,
        requestedStatus,
        requesterName,
        note
      })
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      closeModal("requestStatusModal");
      showToast("Talebiniz yönetici onayına iletildi.", "#15803d");
      await fetchStateNow(false);
    } else {
      showToast(data.error || "Talep gönderilemedi", "#dc2626");
    }
  } catch (err) {
    closeModal("requestStatusModal");
    await sendCloudMobileAction({
      actionType: "CREATE_REQUEST",
      requestId: reqItem?.id,
      projectId,
      floorId,
      apartmentId,
      requestedStatus,
      requesterName,
      note
    }).catch(() => {});
    showToast("Talebiniz bulut üzerinden yönetici onayına iletildi.", "#15803d");
  }
}

function openAdminRequestsModal() {
  toggleMobileSidebar(false);
  if (!state.isAdmin) return openAdminLoginModal();
  renderAdminRequestsList();
  document.getElementById("adminRequestsModal").classList.remove("hidden");
}

function renderAdminRequestsList() {
  const container = document.getElementById("adminRequestsListContainer");
  if (!container) return;

  const reqs = state.requests || [];
  const pending = reqs.filter((r) => r.status === "PENDING");
  const resolved = reqs.filter((r) => r.status !== "PENDING").slice(0, 15);

  let html = "";
  if (pending.length === 0) {
    html += `
      <div style="background:#f9f8f6;border:1px solid #e4e2dd;border-radius:8px;padding:20px;text-align:center;color:#64748b;margin-bottom:16px;font-size:0.85rem;">
        Şu anda onay bekleyen yeni bir durum değişikliği talebi bulunmuyor.
      </div>
    `;
  } else {
    html += `<h4 style="margin-bottom:10px;color:#0f172a;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.06em;">Onay Bekleyen Talepler (${pending.length})</h4>`;
    html += pending
      .map((r) => {
        const timeStr = new Date(r.createdAt).toLocaleString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit"
        });
        return `
          <div style="background:#f9f8f6;border:1px solid #e4e2dd;border-left:3px solid #c5a059;border-radius:8px;padding:14px 16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;">
            <div style="flex:1;min-width:240px;">
              <div style="font-size:0.74rem;color:#64748b;font-weight:700;margin-bottom:3px;">
                ${r.requesterName} • ${timeStr}
              </div>
              <div style="font-size:0.92rem;font-weight:800;color:#0f172a;">
                ${r.projectName} — ${r.floorName} (${r.block}) • ${r.apartmentNumber}
              </div>
              <div style="font-size:0.84rem;margin-top:4px;">
                Mevcut: <span style="color:#64748b;text-decoration:line-through;">${STATUS_LABELS[r.currentStatus] || r.currentStatus}</span>
                &rarr; Talep Edilen: <strong style="color:#991b1b;">${STATUS_LABELS[r.requestedStatus] || r.requestedStatus}</strong>
              </div>
              ${r.note ? `<div style="font-size:0.8rem;color:#334155;margin-top:6px;background:#fff;padding:6px 10px;border-radius:5px;border:1px solid #e4e2dd;">Not: ${r.note}</div>` : ""}
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-sm" style="background:#15803d;color:#fff;" onclick="resolveStatusRequest('${r.id}', 'APPROVE')">
                Onayla ve Güncelle
              </button>
              <button class="btn btn-sm btn-danger-outline" onclick="resolveStatusRequest('${r.id}', 'REJECT')">
                Reddet
              </button>
            </div>
          </div>
        `;
      })
      .join("");
  }

  if (resolved.length > 0) {
    html += `<h4 style="margin:18px 0 8px 0;color:#64748b;font-size:0.76rem;text-transform:uppercase;letter-spacing:0.06em;">Son İşlem Gören Talepler</h4>`;
    html += resolved
      .map((r) => {
        const badge =
          r.status === "APPROVED"
            ? `<span style="color:#15803d;font-weight:700;">ONAYLANDI</span>`
            : `<span style="color:#991b1b;font-weight:700;">REDDEDİLDİ</span>`;
        return `
          <div style="background:#f9f8f6;border:1px solid #e4e2dd;border-radius:6px;padding:8px 12px;margin-bottom:6px;font-size:0.79rem;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">
            <span><strong>${r.requesterName}:</strong> ${r.projectName} • ${r.floorName} • ${r.apartmentNumber} &rarr; <strong>${STATUS_LABELS[r.requestedStatus]}</strong></span>
            ${badge}
          </div>
        `;
      })
      .join("");
  }

  container.innerHTML = html;
}

async function resolveStatusRequest(requestId, action) {
  const reqItem = (state.requests || []).find((r) => r.id === requestId);
  if (reqItem) {
    reqItem.status = action === "APPROVE" ? "APPROVED" : "REJECTED";
    reqItem.resolvedAt = new Date().toISOString();
    if (action === "APPROVE") {
      applyLocalApartmentUpdate(reqItem.projectId, reqItem.floorId, reqItem.apartmentId, {
        targetStatus: reqItem.requestedStatus
      });
    } else {
      renderAll();
    }
    renderAdminRequestsList();
  }

  if (IS_CLOUD_DIRECT_HOST || state.cloudDirectMode) {
    await sendCloudMobileAction({
      actionType: "RESOLVE_REQUEST",
      requestId,
      action
    });
    showToast(
      action === "APPROVE" ? "Talep onaylandı ve daire durumu güncellendi." : "Talep reddedildi.",
      action === "APPROVE" ? "#15803d" : "#64748b"
    );
    return;
  }

  try {
    const res = await fetch("/api/request/resolve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": state.adminToken || ""
      },
      body: JSON.stringify({
        requestId,
        action,
        token: state.adminToken
      })
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      showToast(
        action === "APPROVE" ? "Talep onaylandı ve daire durumu güncellendi." : "Talep reddedildi.",
        action === "APPROVE" ? "#15803d" : "#64748b"
      );
      await fetchStateNow(false);
      renderAdminRequestsList();
    } else {
      showToast(data.error || "İşlem başarısız", "#dc2626");
    }
  } catch (err) {
    await sendCloudMobileAction({
      actionType: "RESOLVE_REQUEST",
      requestId,
      action
    }).catch(() => {});
  }
}

// Başlat
window.addEventListener("DOMContentLoaded", () => {
  // Orta/küçük ekranlarda (<= 1480px) başlangıçta sağ detay panelini kapalı başlat ki ortadaki kat planı geniş görünsün
  if (window.innerWidth <= 1480) {
    const layout = document.getElementById("viewFloorplanSection");
    layout?.classList.add("right-collapsed");
    document.getElementById("btnRightInspectorToggle")?.classList.remove("active");
  }

  if (typeof window.ResizeObserver === "function") {
    const viewportCol = document.querySelector(".canvas-viewport-column");
    if (viewportCol) {
      const ro = new ResizeObserver(() => {
        fitFloorplansToScreen();
      });
      ro.observe(viewportCol);
    }
  }

  verifyStoredAdminToken();
  connectRealtime();
  scheduleCanvasFit();
});
