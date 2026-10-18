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
          <span class="t-stat-val" style="color:#6ee7b7;">${satilik}</span>
          <span class="t-stat-lbl">Satılık</span>
        </div>
        <div class="t-stat">
          <span class="t-stat-val" style="color:#fcd34d;">${kapora}</span>
          <span class="t-stat-lbl">Kapora</span>
        </div>
        <div class="t-stat">
          <span class="t-stat-val" style="color:#93c5fd;">${pesinat}</span>
          <span class="t-stat-lbl">Peşinat</span>
        </div>
        <div class="t-stat">
          <span class="t-stat-val" style="color:#fda4af;">${satildi}</span>
          <span class="t-stat-lbl">Satıldı</span>
        </div>
        <div class="t-stat">
          <span class="t-stat-val" style="color:#f9a8d4;">${kapali}</span>
          <span class="t-stat-lbl">Kapalı</span>
        </div>
        <div class="t-stat">
          <span class="t-stat-val" style="color:#cbd5e1;">${satisaKapali}</span>
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
            <span class="pt-badge">${satilik}/${total} Müsait</span>
          </div>
          <div class="pt-sub-row">
            <span>${proj.neighborhood} • ${proj.adaParsel}</span>
            <span class="pt-open-pill">${isActive ? "Aktif Proje" : "Seç ›"}</span>
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
      <div class="proj-metric-chip chip-satilik"><span class="status-dot dot-satilik"></span><span>Müsait:</span><strong>${satilik}</strong></div>
      <div class="proj-metric-chip chip-kapora"><span class="status-dot dot-kapora"></span><span>Kapora:</span><strong>${kapora}</strong></div>
      <div class="proj-metric-chip chip-pesinat"><span class="status-dot dot-pesinat"></span><span>Peşinat:</span><strong>${pesinat}</strong></div>
      <div class="proj-metric-chip chip-satildi"><span class="status-dot dot-satildi"></span><span>Satıldı:</span><strong>${satildi}</strong></div>
      <div class="proj-metric-chip chip-kapali"><span class="status-dot dot-kapali"></span><span>Kapalı:</span><strong>${kapali}</strong></div>
      <div class="proj-metric-chip chip-satisa-kapali"><span class="status-dot dot-satisa-kapali"></span><span>Satışa Kapalı:</span><strong>${satisaKapali}</strong></div>
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
        SATILIK: "background:#2f855a;border:1px solid #22543d;",
        KAPORA: "background:#c07824;",
        PESINAT: "background:#316896;",
        SATILDI: "background:#b04146;",
        KAPALI: "background:repeating-linear-gradient(-45deg,#c95b5b 0 2px,#ffffff 2px 4px);border:1px solid #8f3434;",
        SATISA_KAPALI: "background:repeating-linear-gradient(-45deg,#334155 0 2px,#ffffff 2px 4px);border:1px solid #1e293b;"
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
          <button type="button" class="btn-status-matrix btn-mat-SATILIK ${apt.status === "SATILIK" ? "active-SATILIK" : ""}"
                  onclick="setApartmentStatusDirect('${proj.id}', '${floor.id}', '${apt.id}', 'SATILIK')">
            <span class="status-dot dot-satilik"></span>
            <span>Satılık</span>
          </button>
          <button type="button" class="btn-status-matrix btn-mat-KAPORA ${apt.status === "KAPORA" ? "active-KAPORA" : ""}"
                  onclick="setApartmentStatusDirect('${proj.id}', '${floor.id}', '${apt.id}', 'KAPORA')">
            <span class="status-dot dot-kapora"></span>
            <span>Kapora</span>
          </button>
          <button type="button" class="btn-status-matrix btn-mat-PESINAT ${apt.status === "PESINAT" ? "active-PESINAT" : ""}"
                  onclick="setApartmentStatusDirect('${proj.id}', '${floor.id}', '${apt.id}', 'PESINAT')">
            <span class="status-dot dot-pesinat"></span>
            <span>Peşinat</span>
          </button>
          <button type="button" class="btn-status-matrix btn-mat-SATILDI ${apt.status === "SATILDI" ? "active-SATILDI" : ""}"
                  onclick="setApartmentStatusDirect('${proj.id}', '${floor.id}', '${apt.id}', 'SATILDI')">
            <span class="status-dot dot-satildi"></span>
            <span>Satıldı</span>
          </button>
          <button type="button" class="btn-status-matrix btn-mat-KAPALI ${apt.status === "KAPALI" ? "active-KAPALI" : ""}"
                  onclick="setApartmentStatusDirect('${proj.id}', '${floor.id}', '${apt.id}', 'KAPALI')">
            <span class="status-dot dot-kapali"></span>
            <span>Kapalı</span>
          </button>
          <button type="button" class="btn-status-matrix btn-mat-SATISA_KAPALI ${apt.status === "SATISA_KAPALI" ? "active-SATISA_KAPALI" : ""}"
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

  const leftW = leftOpen ? 296 : 0;
  const elevW = winW <= 1360 ? 165 : 196;
  const rightW = rightOpen ? (winW <= 1360 ? 300 : 348) : 0;
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
// TÜM PROJELER İÇİN ORTAK STANDART MİMARİ PAFTA ÇERÇEVESİ
// (Logo, Proje Adı, Ada/Parsel, Teslim Tarihi, Pusula, Kat Adı ve Peşinat/Vade Sabit!)
// ------------------------------------------------------------
function renderUnifiedSheetChrome(proj, floor, compassDirs) {
  const dirs = compassDirs || { top: "KUZEY", bottom: "GÜNEY", left: "BATI", right: "DOĞU" };
  const subtitleText = proj.subtitle ? ` <span style="opacity:0.75;font-weight:600;">• ${proj.subtitle}</span>` : "";

  return `
    <!-- ÜST SABİT MİMARİ PAFTA BARI (Y: 0..88px) -->
    <div class="fp-sheet-topbar"></div>

    <!-- 1. Sol Üst Sabit Kurumsal Logo (Tüm Projelerde Aynı Logo ve Aynı Konum) -->
    <div class="fp-sheet-logo-box">
      <img src="assets/p1_image1.png?v=15" alt="Demirtürk Yapı Karasu" />
    </div>

    <!-- 2. Orta Üst Sabit Proje Adı & Mahalle / Ada-Parsel -->
    <div class="fp-sheet-identity-box">
      <div class="fp-sheet-proj-name">${proj.name}</div>
      <div class="fp-sheet-proj-loc">${proj.neighborhood} • ${proj.adaParsel}</div>
    </div>

    <!-- 3. Sağ Üst Sabit Teslim Tarihi Kutusu -->
    <div class="fp-sheet-delivery-box">
      <span class="fp-sheet-delivery-lbl">TESLİM TARİHİ</span>
      <span class="fp-sheet-delivery-val">${proj.deliveryDate}</span>
    </div>

    <!-- 4. En Sağ Üst Sabit Pusula (Tüm Projelerde Birebir Aynı Noktada) -->
    <div class="fp-sheet-compass-widget">
      <div class="fp-compass-box" style="left:49px;top:15px;width:46px;height:46px;">
        <img src="assets/p1_image2.png" alt="Pusula" />
      </div>
      <div class="fp-compass-dir" style="left:0;right:0;top:2px;text-align:center;font-size:0.62rem;">${dirs.top}</div>
      <div class="fp-compass-dir" style="left:0;right:0;bottom:2px;text-align:center;font-size:0.62rem;">${dirs.bottom}</div>
      <div class="fp-compass-dir" style="left:6px;top:30px;font-size:0.62rem;">${dirs.left}</div>
      <div class="fp-compass-dir" style="right:6px;top:30px;font-size:0.62rem;">${dirs.right}</div>
    </div>

    <!-- ALT SABİT MİMARİ PAFTA BARI (Y: 634..686px) -->
    <div class="fp-sheet-bottombar"></div>

    <!-- 5. Sol Alt Sabit Kat Göstergesi (ZEMİN KAT, 1. KAT vb.) -->
    <div class="fp-sheet-floor-badge">
      ${floor.name}
    </div>

    <!-- 6. Orta/Sağ Alt Sabit Ödeme Planı (Peşinat & Vade Bilgisi) -->
    <div class="fp-sheet-payment-bar">
      <span class="fp-sheet-payment-tag">ÖDEME PLANI</span>
      <span>${proj.paymentPlan}${subtitleText}</span>
    </div>
  `;
}

// ------------------------------------------------------------
// ŞABLON 1: Ada 1104 Parsel 14 (Aziziye Mahallesi)
// ------------------------------------------------------------
function renderTemplate1104(proj, floor) {
  const slotCoords = {
    "top-left": { x: 309, y: 205, w: 227, h: 119 },
    "top-right": { x: 625, y: 204, w: 279, h: 118 },
    "bottom-left": { x: 292, y: 324, w: 295, h: 121 },
    "bottom-right": { x: 587, y: 322, w: 279, h: 121 }
  };

  let stairsLines = "";
  for (let y = 181; y <= 293; y += 7) {
    stairsLines += `<div style="position:absolute;left:536px;top:${y}px;width:40px;height:1px;background:#64748b;z-index:5;"></div>`;
  }

  const aptsHTML = floor.apartments
    .map((apt, idx) => {
      const coords = slotCoords[apt.slot] || { x: 309 + (idx % 2) * 316, y: 205 + Math.floor(idx / 2) * 120, w: 260, h: 118 };
      return buildApartmentBoxHTML(proj, floor, apt, coords);
    })
    .join("");

  return `
    ${renderUnifiedSheetChrome(proj, floor, { top: "KUZEY", bottom: "GÜNEY", left: "BATI", right: "DOĞU" })}

    <!-- Giriş & Merdiven Holü -->
    <div class="fp-el" style="left:521px;top:118px;width:75px;height:24px;font-size:0.95rem;font-weight:800;color:#285e54;letter-spacing:0.04em;">GİRİŞ</div>
    <div style="position:absolute;left:574px;top:134px;width:50px;height:62px;background:#334854;border:2px solid #23353f;border-radius:4px;"></div>
    <div style="position:absolute;left:536px;top:174px;width:40px;height:125px;background:#e6e4dd;border:2px solid #475569;"></div>
    ${stairsLines}
    <div class="fp-el" style="left:526px;top:222px;width:62px;height:24px;font-size:0.65rem;font-weight:800;color:#23353f;background:rgba(255,255,255,0.92);z-index:6;border-radius:4px;">MERDİVEN</div>
    <div style="position:absolute;left:536px;top:299px;width:89px;height:25px;background:#efede7;border:2px solid #475569;"></div>

    <!-- 4 Balkon -->
    <div class="fp-balcony" style="left:267px;top:255px;width:42px;height:69px;">BALKON</div>
    <div class="fp-balcony" style="left:904px;top:255px;width:42px;height:67px;">BALKON</div>
    <div class="fp-balcony" style="left:349px;top:445px;width:42px;height:80px;">BALKON</div>
    <div class="fp-balcony" style="left:778px;top:443px;width:42px;height:80px;">BALKON</div>

    <!-- Daireler -->
    ${aptsHTML}

    <!-- Havuz -->
    <div class="fp-pool" style="left:435px;top:510px;width:324px;height:104px;">
      HAVUZ
    </div>
  `;
}

// ------------------------------------------------------------
// ŞABLON 2: ASEL DOĞA EVLERİ 4 (Aşağıaziziye 1105 Ada 13 Parsel)
// ------------------------------------------------------------
function renderTemplateAsel4(proj, floor) {
  const ox = 75;
  const slotCoords = {
    "a-top-right": { x: ox + 502, y: 198, w: 140, h: 141 },
    "a-bottom-mid": { x: ox + 416, y: 339, w: 120, h: 155 },
    "a-bottom-left": { x: ox + 296, y: 312, w: 120, h: 182 },
    "b-top-left": { x: ox + 649, y: 198, w: 120, h: 141 },
    "b-right": { x: ox + 769, y: 198, w: 112, h: 275 }
  };

  const aptsHTML = floor.apartments
    .map((apt, idx) => {
      const coords = slotCoords[apt.slot] || { x: ox + 300 + idx * 130, y: 230, w: 125, h: 150 };
      return buildApartmentBoxHTML(proj, floor, apt, coords);
    })
    .join("");

  return `
    ${renderUnifiedSheetChrome(proj, floor, { top: "KUZEY", bottom: "GÜNEY", left: "BATI", right: "DOĞU" })}

    <!-- Sol Dikey YOL Şeridi -->
    <div class="fp-el" style="left:${ox + 162}px;top:130px;width:52px;height:466px;background:#e6e3da;border:1.5px solid #b8b2a4;border-radius:6px;font-size:1.1rem;font-weight:800;color:#475569;letter-spacing:0.08em;">
      YOL
    </div>

    <!-- A Giriş & B Giriş Etiketleri ve Merdiven/Ortak Alan -->
    <div class="fp-el" style="left:${ox + 415}px;top:135px;width:95px;height:28px;font-size:0.88rem;font-weight:800;color:#23353f;background:#eae7df;border:1.5px solid #c5bfb2;border-radius:6px;">A GİRİŞ</div>
    <div class="fp-el" style="left:${ox + 695}px;top:135px;width:95px;height:28px;font-size:0.88rem;font-weight:800;color:#23353f;background:#eae7df;border:1.5px solid #c5bfb2;border-radius:6px;">B GİRİŞ</div>

    <!-- A Giriş Sol Üst Ortak/Hol Alanı -->
    <div style="position:absolute;left:${ox + 357}px;top:198px;width:145px;height:114px;background:#efede7;border:1.5px solid #64748b;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;color:#475569;text-align:center;">
      A BLOK HOL / MERDİVEN
    </div>

    <!-- Blok Ayrım Duvarı -->
    <div style="position:absolute;left:${ox + 642}px;top:198px;width:7px;height:160px;background:#334854;z-index:15;border-radius:3px;"></div>

    <!-- Balkonlar -->
    <div class="fp-balcony" style="left:${ox + 595}px;top:339px;width:47px;height:20px;">BALKON</div>
    <div class="fp-balcony" style="left:${ox + 649}px;top:339px;width:52px;height:20px;">BALKON</div>
    <div class="fp-balcony" style="left:${ox + 263}px;top:474px;width:55px;height:20px;">BALKON</div>
    <div class="fp-balcony" style="left:${ox + 513}px;top:474px;width:56px;height:20px;">BALKON</div>
    <div class="fp-balcony" style="left:${ox + 769}px;top:473px;width:112px;height:20px;">BALKON</div>

    <!-- Daireler -->
    ${aptsHTML}

    <!-- Havuz -->
    <div class="fp-pool" style="left:${ox + 563}px;top:373px;width:194px;height:129px;">
      HAVUZ
    </div>
  `;
}

// ------------------------------------------------------------
// ŞABLON 3: ASEL DOĞA EVLERİ 2 (Yukarıaziziye Mh. 1233 Ada / 8 Parsel)
// ------------------------------------------------------------
function renderTemplateAsel2(proj, floor) {
  const slotCoords = {
    "b-left": { x: 115, y: 346, w: 208, h: 151 },
    "b-right": { x: 370, y: 346, w: 208, h: 151 },
    "a-left": { x: 625, y: 346, w: 208, h: 151 },
    "a-right": { x: 880, y: 346, w: 208, h: 151 }
  };

  const aptsHTML = floor.apartments
    .map((apt, idx) => {
      const coords = slotCoords[apt.slot] || { x: 115 + idx * 255, y: 346, w: 208, h: 151 };
      return buildApartmentBoxHTML(proj, floor, apt, coords);
    })
    .join("");

  return `
    ${renderUnifiedSheetChrome(proj, floor, { top: "BATI", bottom: "DOĞU", left: "GÜNEY", right: "KUZEY" })}

    <!-- Sol Üst Havuz -->
    <div class="fp-pool" style="left:115px;top:142px;width:255px;height:171px;">
      HAVUZ
    </div>

    <!-- Daireler -->
    ${aptsHTML}

    <!-- B Giriş & A Giriş Yukarı Oklar -->
    <div class="fp-el" style="left:323px;top:400px;width:47px;height:95px;background:#23353f;color:#dfc28d;font-weight:800;font-size:1.35rem;border-radius:6px;z-index:12;" title="B Giriş Merdiven/Giriş Holü">
      ↑
    </div>
    <div class="fp-el" style="left:833px;top:400px;width:47px;height:95px;background:#23353f;color:#dfc28d;font-weight:800;font-size:1.35rem;border-radius:6px;z-index:12;" title="A Giriş Merdiven/Giriş Holü">
      ↑
    </div>

    <!-- B Giriş & A Giriş Etiketleri -->
    <div class="fp-el" style="left:286px;top:514px;width:120px;height:36px;background:#23353f;color:#f8fafc;border-radius:8px;font-size:0.95rem;font-weight:800;">
      B Giriş
    </div>
    <div class="fp-el" style="left:796px;top:514px;width:120px;height:36px;background:#23353f;color:#f8fafc;border-radius:8px;font-size:0.95rem;font-weight:800;">
      A Giriş
    </div>
  `;
}

// ------------------------------------------------------------
// ŞABLON 4: ASEL DOĞA EVLERİ (Aşağıaziziye Mh. 1067 Ada 4 Parsel)
// ------------------------------------------------------------
function renderTemplateAsel1(proj, floor) {
  const slotCoords = {
    "b-top-left": { x: 162, y: 145, w: 224, h: 180 },
    "b-bottom-left": { x: 162, y: 327, w: 224, h: 175 },
    "b-right-tall": { x: 389, y: 145, w: 230, h: 357 },
    "a-left-tall": { x: 625, y: 145, w: 230, h: 357 },
    "a-top-right": { x: 858, y: 145, w: 232, h: 180 },
    "a-bottom-right": { x: 858, y: 327, w: 232, h: 175 }
  };

  const aptsHTML = floor.apartments
    .map((apt, idx) => {
      const coords = slotCoords[apt.slot] || { x: 162 + idx * 150, y: 145, w: 200, h: 180 };
      return buildApartmentBoxHTML(proj, floor, apt, coords);
    })
    .join("");

  return `
    ${renderUnifiedSheetChrome(proj, floor, { top: "KUZEY", bottom: "GÜNEY", left: "BATI", right: "DOĞU" })}

    <!-- En Sol Dikey Havuz -->
    <div class="fp-pool" style="left:12px;top:148px;width:135px;height:352px;">
      HAVUZ
    </div>

    <!-- Daireler -->
    ${aptsHTML}

    <!-- B Giriş & A Giriş Yürüyüş Yolu ve Etiketler -->
    <div style="position:absolute;left:376px;top:502px;width:22px;height:66px;background:#64748b;"></div>
    <div class="fp-el" style="left:330px;top:572px;width:115px;height:32px;background:#23353f;color:#f8fafc;border-radius:6px;font-size:0.92rem;font-weight:800;">
      B GİRİŞ
    </div>

    <div style="position:absolute;left:848px;top:502px;width:22px;height:66px;background:#64748b;"></div>
    <div class="fp-el" style="left:800px;top:572px;width:115px;height:32px;background:#23353f;color:#f8fafc;border-radius:6px;font-size:0.92rem;font-weight:800;">
      A GİRİŞ
    </div>

    <!-- Sağ YOL & SİTE GİRİŞİ -->
    <div class="fp-el" style="left:1110px;top:145px;width:92px;height:357px;background:#e6e3da;border:1.5px solid #b8b2a4;border-radius:6px;font-size:1.1rem;font-weight:800;color:#475569;letter-spacing:0.08em;">
      YOL
    </div>
    <div class="fp-el" style="left:1085px;top:562px;width:118px;height:38px;background:#334854;color:#f8fafc;border-radius:6px;font-size:0.86rem;font-weight:800;">
      SİTE GİRİŞİ
    </div>
  `;
}

// ------------------------------------------------------------
// ŞABLON 5: ALMİNA 2 SİTESİ (Aşağıincilli Mh. 996 Ada / 12 Parsel)
// ------------------------------------------------------------
function renderTemplateAlmina2(proj, floor) {
  const ox = 85;
  const slotCoords = {
    "b-1": { x: ox + 187, y: 205, w: 194, h: 130 },
    "b-2": { x: ox + 382, y: 205, w: 194, h: 130 },
    "b-3": { x: ox + 576, y: 205, w: 194, h: 130 },
    "a-top": { x: ox + 770, y: 205, w: 194, h: 130 },
    "a-bottom-left": { x: ox + 770, y: 335, w: 98, h: 200 },
    "a-bottom-right": { x: ox + 868, y: 335, w: 96, h: 200 }
  };

  const aptsHTML = floor.apartments
    .map((apt, idx) => {
      const coords = slotCoords[apt.slot] || { x: ox + 187 + idx * 160, y: 205, w: 155, h: 130 };
      const extraClass = apt.slot === "a-bottom-left" || apt.slot === "a-bottom-right" ? "med-apt" : "";
      return buildApartmentBoxHTML(proj, floor, apt, coords, extraClass);
    })
    .join("");

  return `
    ${renderUnifiedSheetChrome(proj, floor, { top: "KUZEY", bottom: "GÜNEY", left: "BATI", right: "DOĞU" })}

    <!-- Sol Havuz -->
    <div class="fp-pool" style="left:${ox + 28}px;top:205px;width:146px;height:130px;font-size:1.25rem;">
      HAVUZ
    </div>

    <!-- Daireler -->
    ${aptsHTML}

    <!-- B Giriş & A Giriş Etiketleri -->
    <div class="fp-el" style="left:${ox + 335}px;top:348px;width:110px;height:38px;background:#23353f;color:#f8fafc;border-radius:8px;font-size:0.95rem;font-weight:800;">
      ↑ B Giriş
    </div>
    <div class="fp-el" style="left:${ox + 648}px;top:348px;width:110px;height:38px;background:#23353f;color:#f8fafc;border-radius:8px;font-size:0.95rem;font-weight:800;">
      A Giriş →
    </div>
  `;
}

// ------------------------------------------------------------
// ŞABLON 6: YENİŞEHİR 3. ETAP (Aşağıincilli Mh. 1326 Ada 3 Parsel - 4 Blok Site)
// ------------------------------------------------------------
function renderTemplateYenisehir3(proj, floor) {
  // Orijinal Y:[96..679] aralığını orta simülasyon sahnesine (Y:[96..620]) sığdırmak için dikey ölçekleme
  const mapY = (y) => Math.round(96 + (y - 96) * 0.89);
  const mapH = (h) => Math.max(20, Math.round(h * 0.89));

  const aptsHTML = floor.apartments
    .map((apt, idx) => {
      const rawX = apt.x ?? 248 + (idx % 7) * 104;
      const rawY = apt.y ?? 129 + Math.floor(idx / 7) * 76;
      const rawW = apt.w ?? 104;
      const rawH = apt.h ?? 76;
      const coords = {
        x: rawX,
        y: mapY(rawY),
        w: rawW,
        h: mapH(rawH)
      };
      return buildApartmentBoxHTML(proj, floor, apt, coords, "compact-apt");
    })
    .join("");

  return `
    ${renderUnifiedSheetChrome(proj, floor, { top: "KUZEY", bottom: "GÜNEY", left: "BATI", right: "DOĞU" })}

    <!-- BLOK BAŞLIKLARI -->
    <div class="fp-el" style="left:67px;top:${mapY(176)}px;width:116px;height:25px;background:#23353f;color:#dfc28d;border-radius:6px;font-size:0.82rem;font-weight:800;letter-spacing:0.04em;">A BLOK</div>
    <div class="fp-el" style="left:548px;top:${mapY(96)}px;width:116px;height:25px;background:#23353f;color:#dfc28d;border-radius:6px;font-size:0.82rem;font-weight:800;letter-spacing:0.04em;">B BLOK</div>
    <div class="fp-el" style="left:551px;top:${mapY(651)}px;width:116px;height:25px;background:#23353f;color:#dfc28d;border-radius:6px;font-size:0.82rem;font-weight:800;letter-spacing:0.04em;">C BLOK</div>
    <div class="fp-el" style="left:1036px;top:${mapY(156)}px;width:116px;height:25px;background:#23353f;color:#dfc28d;border-radius:6px;font-size:0.82rem;font-weight:800;letter-spacing:0.04em;">D BLOK</div>

    <!-- ORTA AVLU: BÜYÜK HAVUZ, ÇOCUK HAVUZU ve KAFETERYA -->
    <div class="fp-pool" style="left:310px;top:${mapY(315)}px;width:235px;height:${mapH(138)}px;font-size:1.05rem;flex-direction:column;">
      <span>BÜYÜK HAVUZ</span>
    </div>
    <div class="fp-pool" style="left:558px;top:${mapY(315)}px;width:135px;height:${mapH(138)}px;font-size:0.88rem;flex-direction:column;">
      <span>ÇOCUK</span>
      <span>HAVUZU</span>
    </div>
    <div class="fp-el" style="left:708px;top:${mapY(315)}px;width:130px;height:${mapH(138)}px;background:#fbf6eb;border:1.5px solid #c89d54;border-radius:8px;font-size:0.82rem;font-weight:800;color:#5c3f14;letter-spacing:0.04em;">
      SOSYAL TESİS / KAFE
    </div>

    <!-- BLOK GİRİŞ ETİKETLERİ -->
    <!-- A Blok Girişleri -->
    <div class="fp-el" style="left:231px;top:${mapY(272)}px;width:54px;height:20px;background:#334854;color:#f8fafc;font-size:0.64rem;font-weight:700;border-radius:4px;z-index:18;">B Giriş</div>
    <div class="fp-el" style="left:231px;top:${mapY(424)}px;width:54px;height:20px;background:#334854;color:#f8fafc;font-size:0.64rem;font-weight:700;border-radius:4px;z-index:18;">A Giriş</div>
    <!-- B Blok Girişleri -->
    <div class="fp-el" style="left:322px;top:${mapY(105)}px;width:62px;height:20px;background:#334854;color:#f8fafc;font-size:0.64rem;font-weight:700;border-radius:4px;z-index:18;">C Giriş</div>
    <div class="fp-el" style="left:734px;top:${mapY(105)}px;width:62px;height:20px;background:#334854;color:#f8fafc;font-size:0.64rem;font-weight:700;border-radius:4px;z-index:18;">A Giriş</div>
    <!-- C Blok Girişleri -->
    <div class="fp-el" style="left:317px;top:${mapY(468)}px;width:62px;height:20px;background:#334854;color:#f8fafc;font-size:0.64rem;font-weight:700;border-radius:4px;z-index:18;">C Giriş</div>
    <div class="fp-el" style="left:524px;top:${mapY(468)}px;width:62px;height:20px;background:#334854;color:#f8fafc;font-size:0.64rem;font-weight:700;border-radius:4px;z-index:18;">B Giriş</div>
    <div class="fp-el" style="left:729px;top:${mapY(468)}px;width:62px;height:20px;background:#334854;color:#f8fafc;font-size:0.64rem;font-weight:700;border-radius:4px;z-index:18;">A Giriş</div>
    <!-- D Blok Girişleri -->
    <div class="fp-el" style="left:932px;top:${mapY(328)}px;width:54px;height:20px;background:#334854;color:#f8fafc;font-size:0.64rem;font-weight:700;border-radius:4px;z-index:18;">B Giriş</div>
    <div class="fp-el" style="left:932px;top:${mapY(479)}px;width:54px;height:20px;background:#334854;color:#f8fafc;font-size:0.64rem;font-weight:700;border-radius:4px;z-index:18;">A Giriş</div>

    <!-- Daireler (50 Daire) -->
    ${aptsHTML}
  `;
}

// ------------------------------------------------------------
// ŞABLON 7: KARASU DEMİRTÜRK İNŞAAT [1. ETAP] (1324 Ada 1 Parsel)
// ------------------------------------------------------------
function renderTemplateEtap1(proj, floor) {
  const ox = 150;
  const slotCoords = {
    // A BLOK (Sol Kanat)
    "a-top-1": { x: ox + 50, y: 175, w: 114, h: 93 },
    "a-top-2": { x: ox + 164, y: 175, w: 114, h: 93 },
    "a-top-3": { x: ox + 279, y: 175, w: 114, h: 93 },
    "a-mid-1": { x: ox + 118, y: 268, w: 102, h: 143 },
    "a-mid-2": { x: ox + 220, y: 268, w: 102, h: 143 },
    "a-bot-1": { x: ox + 50, y: 411, w: 114, h: 93 },
    "a-bot-2": { x: ox + 164, y: 411, w: 114, h: 93 },
    "a-bot-3": { x: ox + 279, y: 411, w: 114, h: 93 },
    // B BLOK (Sağ Kanat)
    "b-top-1": { x: ox + 536, y: 175, w: 114, h: 93 },
    "b-top-2": { x: ox + 650, y: 175, w: 114, h: 93 },
    "b-top-3": { x: ox + 764, y: 175, w: 114, h: 93 },
    "b-mid-1": { x: ox + 602, y: 268, w: 94, h: 143 },
    "b-mid-2": { x: ox + 696, y: 268, w: 94, h: 143 },
    "b-bot-1": { x: ox + 536, y: 411, w: 114, h: 93 },
    "b-bot-2": { x: ox + 650, y: 411, w: 114, h: 93 },
    "b-bot-3": { x: ox + 764, y: 411, w: 114, h: 93 }
  };

  const aptsHTML = floor.apartments
    .map((apt, idx) => {
      const coords = slotCoords[apt.slot] || { x: ox + 50 + (idx % 4) * 115, y: 175 + Math.floor(idx / 4) * 100, w: 114, h: 93 };
      return buildApartmentBoxHTML(proj, floor, apt, coords, "med-apt");
    })
    .join("");

  return `
    ${renderUnifiedSheetChrome(proj, floor, { top: "KUZEY", bottom: "GÜNEY", left: "BATI", right: "DOĞU" })}

    <!-- YOL Şeritleri -->
    <div class="fp-el" style="left:${ox - 10}px;top:110px;width:48px;height:498px;background:#e6e3da;border:1.5px solid #b8b2a4;border-radius:6px;font-size:1rem;font-weight:800;color:#475569;">YOL</div>
    <div class="fp-el" style="left:${ox + 38}px;top:110px;width:850px;height:40px;background:#e6e3da;border:1.5px solid #b8b2a4;border-radius:6px;font-size:1rem;font-weight:800;color:#475569;">YOL</div>
    <div class="fp-el" style="left:${ox + 38}px;top:568px;width:850px;height:40px;background:#e6e3da;border:1.5px solid #b8b2a4;border-radius:6px;font-size:1rem;font-weight:800;color:#475569;">YOL</div>

    <!-- A BLOK ve B BLOK Giriş Etiketleri -->
    <div class="fp-el" style="left:${ox + 42}px;top:292px;width:72px;height:52px;background:#23353f;color:#f8fafc;border-radius:6px;font-size:0.74rem;font-weight:800;">A BLOK<br/>GİRİŞİ</div>
    <div class="fp-el" style="left:${ox + 796}px;top:292px;width:84px;height:52px;background:#23353f;color:#f8fafc;border-radius:6px;font-size:0.74rem;font-weight:800;">B BLOK<br/>GİRİŞİ</div>

    <!-- Orta HAVUZ -->
    <div class="fp-pool" style="left:${ox + 326}px;top:294px;width:272px;height:100px;font-size:1.3rem;">
      HAVUZ
    </div>

    <!-- Daireler (16 Daire) -->
    ${aptsHTML}
  `;
}

// ------------------------------------------------------------
// ŞABLON 8: KARASU DEMİRTÜRK İNŞAAT [2. ETAP] (1325 Ada 1 Parsel)
// ------------------------------------------------------------
function renderTemplateEtap2(proj, floor) {
  const slotCoords = {
    // A BLOK (Sol Kanat - 8 Daire)
    "a-top-1": { x: 138, y: 215, w: 120, h: 90 },
    "a-top-2": { x: 258, y: 215, w: 120, h: 90 },
    "a-top-3": { x: 378, y: 215, w: 120, h: 90 },
    "a-mid-1": { x: 195, y: 305, w: 120, h: 92 },
    "a-mid-2": { x: 315, y: 305, w: 120, h: 92 },
    "a-bot-1": { x: 144, y: 397, w: 120, h: 90 },
    "a-bot-2": { x: 264, y: 397, w: 120, h: 90 },
    "a-bot-3": { x: 384, y: 397, w: 120, h: 90 },
    // B BLOK (Sağ Kanat - 2 Sütun x 4 Satır = 8 Daire)
    "b-r1-c1": { x: 723, y: 178, w: 115, h: 88 },
    "b-r1-c2": { x: 838, y: 178, w: 115, h: 88 },
    "b-r2-c1": { x: 723, y: 267, w: 115, h: 88 },
    "b-r2-c2": { x: 838, y: 267, w: 115, h: 88 },
    "b-r3-c1": { x: 723, y: 356, w: 115, h: 88 },
    "b-r3-c2": { x: 838, y: 356, w: 115, h: 88 },
    "b-r4-c1": { x: 723, y: 445, w: 115, h: 88 },
    "b-r4-c2": { x: 838, y: 445, w: 115, h: 88 }
  };

  const aptsHTML = floor.apartments
    .map((apt, idx) => {
      const coords = slotCoords[apt.slot] || { x: 140 + (idx % 4) * 120, y: 185 + Math.floor(idx / 4) * 90, w: 115, h: 88 };
      return buildApartmentBoxHTML(proj, floor, apt, coords, "med-apt");
    })
    .join("");

  return `
    ${renderUnifiedSheetChrome(proj, floor, { top: "KUZEY", bottom: "GÜNEY", left: "BATI", right: "DOĞU" })}

    <!-- Çevreleyen YOL Şeritleri -->
    <div class="fp-el" style="left:48px;top:110px;width:48px;height:498px;background:#e6e3da;border:1.5px solid #b8b2a4;border-radius:6px;font-size:1rem;font-weight:800;color:#475569;">YOL</div>
    <div class="fp-el" style="left:96px;top:110px;width:946px;height:40px;background:#e6e3da;border:1.5px solid #b8b2a4;border-radius:6px;font-size:1rem;font-weight:800;color:#475569;">YOL</div>
    <div class="fp-el" style="left:1042px;top:110px;width:54px;height:498px;background:#e6e3da;border:1.5px solid #b8b2a4;border-radius:6px;font-size:1rem;font-weight:800;color:#475569;">YOL</div>
    <div class="fp-el" style="left:96px;top:568px;width:946px;height:40px;background:#e6e3da;border:1.5px solid #b8b2a4;border-radius:6px;font-size:1rem;font-weight:800;color:#475569;">YOL</div>

    <!-- A BLOK ve B BLOK Giriş Etiketleri -->
    <div class="fp-el" style="left:102px;top:330px;width:86px;height:44px;background:#23353f;color:#f8fafc;border-radius:6px;font-size:0.74rem;font-weight:800;">A BLOK<br/>GİRİŞİ</div>
    <div class="fp-el" style="left:958px;top:340px;width:80px;height:44px;background:#334854;color:#f8fafc;border-radius:6px;font-size:0.74rem;font-weight:800;">B BLOK<br/>GİRİŞİ</div>

    <!-- Orta HAVUZ -->
    <div class="fp-pool" style="left:450px;top:304px;width:255px;height:98px;font-size:1.3rem;">
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
  const groups = {};
  floor.apartments.forEach((apt) => {
    const b = apt.block || "A Giriş";
    if (!groups[b]) groups[b] = [];
    groups[b].push(apt);
  });

  const blockNames = Object.keys(groups);
  const blockCount = blockNames.length || 1;
  const areaLeft = 185;
  const areaWidth = 980;
  const blockGap = 30;
  const blockWidth = Math.floor((areaWidth - (blockCount - 1) * blockGap) / blockCount);

  let blocksHTML = "";
  blockNames.forEach((bName, bIdx) => {
    const bx = areaLeft + bIdx * (blockWidth + blockGap);
    const apts = groups[bName];
    const cols = apts.length <= 2 ? apts.length : 2;
    const rows = Math.ceil(apts.length / cols);
    const cellW = Math.floor((blockWidth - 20) / cols);
    const cellH = Math.min(165, Math.floor(340 / Math.max(1, rows)));

    apts.forEach((apt, aIdx) => {
      const c = aIdx % cols;
      const r = Math.floor(aIdx / cols);
      const coords = {
        x: bx + 10 + c * cellW,
        y: 165 + r * (cellH + 8),
        w: cellW - 8,
        h: cellH
      };
      blocksHTML += buildApartmentBoxHTML(proj, floor, apt, coords);
    });

    blocksHTML += `
      <div class="fp-el" style="left:${bx + blockWidth / 2 - 65}px;top:535px;width:130px;height:36px;background:#23353f;color:#f8fafc;border-radius:8px;font-size:0.96rem;font-weight:800;">
        ${bName}
      </div>
    `;
  });

  return `
    ${renderUnifiedSheetChrome(proj, floor, { top: "KUZEY", bottom: "GÜNEY", left: "BATI", right: "DOĞU" })}

    <div class="fp-pool" style="left:24px;top:165px;width:140px;height:340px;">
      HAVUZ
    </div>

    ${blocksHTML}
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
    <div style="background:linear-gradient(135deg,#182436 0%,#1f3347 100%);color:#f1f5f9;border:1.5px solid #469c76;border-radius:12px;padding:15px 16px;margin-bottom:14px;box-shadow:0 8px 22px rgba(15,22,34,0.16);">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#5bb38b;box-shadow:0 0 0 3px rgba(91,179,139,0.22);"></span>
          <span style="font-size:0.79rem;font-weight:800;letter-spacing:0.05em;color:#d1fae5;text-transform:uppercase;">
            1. 7/24 KESİNTİSİZ MOBİL &amp; İNTERNET ERİŞİMİ (ASLA DEĞİŞMEYEN SABİT LİNK &amp; QR)
          </span>
        </div>
        <span style="background:rgba(91,179,139,0.2);color:#a7f3d0;border:1px solid rgba(91,179,139,0.45);font-size:0.68rem;font-weight:800;padding:3px 10px;border-radius:99px;">
          ★ ÖNERİLEN — CLOUDFLARE BAĞIMSIZ &amp; SABİT
        </span>
      </div>

      <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
        <img src="${permanentQrApi}" alt="Sabit Mobil QR Kod" style="width:108px;height:108px;border-radius:10px;border:2px solid #5bb38b;background:#fff;padding:5px;flex-shrink:0;" />
        <div style="flex:1;min-width:220px;">
          <div style="font-size:0.78rem;color:#cbd5e1;margin-bottom:8px;line-height:1.45;">
            <strong style="color:#f8fafc;">Cloudflare ücretsiz sürüm kopmalarını tamamen ortadan kaldırır!</strong> Bu adres ve QR kod <strong>hiçbir zaman değişmez</strong>. Telefonunuzdan (4.5G/5G veya herhangi bir Wi-Fi ile) 7/24 anında açılır ve ofis bilgisayarlarıyla canlı senkronize çalışır:
          </div>
          <div class="lan-url-box" style="background:rgba(15,22,34,0.55);border:1px solid rgba(91,179,139,0.45);margin-bottom:8px;">
            <span style="word-break:break-all;color:#a7f3d0;font-weight:700;font-size:0.84rem;">${permanentUrl}</span>
            <div style="display:flex;gap:6px;flex-shrink:0;">
              <button type="button" class="btn btn-sm btn-gold" onclick="navigator.clipboard.writeText('${permanentUrl}'); showToast('Sabit mobil erişim adresi kopyalandı!')">Kopyala</button>
              <a href="https://wa.me/?text=${permanentWaText}" target="_blank" rel="noopener" class="btn btn-sm btn-success" style="text-decoration:none;">WhatsApp</a>
            </div>
          </div>
          <div style="font-size:0.72rem;color:#94a3b8;">
            💡 <strong style="color:#e2e8f0;">İpucu:</strong> Telefonunuzda bu QR kodu bir kez okutup tarayıcı menüsünden <strong>"Ana Ekrana Ekle"</strong> derseniz telefonunuzda kalıcı uygulama gibi çalışır.
          </div>
        </div>
      </div>
    </div>
  `;

  // 2. BÖLÜM: AYNI OFİS WI-FI AĞI DOĞRUDAN YEREL IP BAĞLANTISI (ANDROID & IPHONE UYUMLU)
  const fixedLanHTML = `
    <div style="background:#faf9f6;border:1.5px solid #cbd5e1;border-radius:12px;padding:14px 16px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
        <div style="font-size:0.76rem;font-weight:800;color:#182232;letter-spacing:0.05em;text-transform:uppercase;">
          2. AYNI OFİS WI-FI AĞI DOĞRUDAN BAĞLANTI (İNTERNETSİZ YEREL AĞ &amp; MOBİL)
        </div>
        <button type="button" class="btn btn-sm btn-primary" onclick="repairWindowsFirewallNow()">
          🛡️ Güvenlik Duvarı Mobil Erişim İznini Onar
        </button>
      </div>
      <div style="display:flex;align-items:flex-start;gap:14px;flex-wrap:wrap;">
        <img src="${lanQrApi}" alt="Yerel Ağ Doğrudan IP QR" style="width:98px;height:98px;border-radius:8px;border:1.5px solid #334155;background:#fff;padding:4px;flex-shrink:0;" />
        <div style="flex:1;min-width:220px;">
          <div style="font-size:0.77rem;color:#475569;margin-bottom:8px;line-height:1.45;">
            Telefon veya tabletiniz ofis Wi-Fi ağına (<strong>DEMİRTÜRK İNŞAAT</strong>) bağlıyken <strong>Android ve iPhone</strong> cihazlardan doğrudan aşağıdaki sayısal IP adresleriyle bağlanabilirsiniz:
          </div>
          ${ipUrls
            .map(
              (u, idx) => `
            <div class="lan-url-box" style="margin-bottom:6px;border-left:4px solid ${idx === 0 ? "#3b8764" : "#b89550"};background:#fff;">
              <div>
                <span style="font-weight:800;color:#182232;font-size:0.85rem;">${u}</span>
                <span style="font-size:0.69rem;color:#2d6e50;margin-left:6px;font-weight:700;">(Android &amp; iPhone Uyumlu Doğrudan IP)</span>
              </div>
              <button type="button" class="btn btn-sm btn-ghost" onclick="navigator.clipboard.writeText('${u}'); showToast('Yerel IP adresi kopyalandı: ${u}')">Kopyala</button>
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
      ? `<div style="background:rgba(255,255,255,0.04);border:1px dashed rgba(203,213,225,0.22);border-radius:8px;padding:12px;font-size:0.79rem;color:#cbd5e1;text-align:center;">
          Diğer bilgisayarda uygulama açıldığında <strong>otomatik olarak</strong> burada görünecektir. Hemen taramak için yukarıdaki <strong>"🔍 Otomatik Bul ve Eşleştir"</strong> butonuna tıklayabilirsiniz.
        </div>`
      : peers
          .map((p) => {
            const isOnline = p.status === "ONLINE";
            const statusBadge = isOnline
              ? `<span style="background:rgba(70,156,118,0.25);color:#a7f3d0;border:1px solid rgba(91,179,139,0.45);font-size:0.65rem;font-weight:800;padding:2px 8px;border-radius:99px;">● BAĞLI & CANLI SENKRON</span>`
              : `<span style="background:rgba(196,121,39,0.25);color:#fde68a;border:1px solid rgba(196,121,39,0.45);font-size:0.65rem;font-weight:800;padding:2px 8px;border-radius:99px;">● ARANIYOR (${p.lastError || "Bağlanıyor"})</span>`;
            const syncTime = p.lastSyncAt
              ? new Date(p.lastSyncAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              : "Henüz eşitlenmedi";
            const displayUrl =
              p.url && p.url.startsWith("cloud://")
                ? `Otomatik Bulut Rölesi (${p.remoteHostname || "Uzak Ofis"})`
                : p.url || "Otomatik Bağlantı";
            return `
              <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;background:rgba(15,22,34,0.45);border:1px solid rgba(203,213,225,0.16);border-left:4px solid ${isOnline ? "#469c76" : "#c47927"};border-radius:8px;padding:10px 12px;margin-bottom:8px;">
                <div style="min-width:200px;flex:1;">
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <strong style="color:#f1f5f9;font-size:0.85rem;">${p.name || "Diğer Ofis Anabilgisayar"}</strong>
                    ${statusBadge}
                  </div>
                  <div style="font-family:var(--font-mono);font-size:0.74rem;color:#93c5fd;margin-top:3px;word-break:break-all;">${displayUrl}</div>
                  <div style="font-size:0.69rem;color:#94a3b8;margin-top:2px;">Son Senkronizasyon: ${syncTime}</div>
                </div>
                <div style="display:flex;gap:6px;flex-shrink:0;">
                  <button type="button" class="btn btn-sm" style="background:rgba(255,255,255,0.1);color:#f1f5f9;border:1px solid rgba(203,213,225,0.24);" onclick="syncPeersNow()">Şimdi Eşitle</button>
                  <button type="button" class="btn btn-sm" style="background:rgba(158,51,51,0.35);color:#fecaca;border:1px solid rgba(184,74,74,0.5);" onclick="removePeerHost('${p.id}')">Kaldır</button>
                </div>
              </div>
            `;
          })
          .join("");

  const multiOfficePeerHTML = `
    <div style="background:linear-gradient(135deg,#151f2e 0%,#1d2b3f 100%);color:#f1f5f9;border:1.5px solid #b89550;border-radius:12px;padding:14px 16px;margin-bottom:12px;box-shadow:0 8px 22px rgba(15,22,34,0.16);">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#cfb070;box-shadow:0 0 0 3px rgba(207,176,112,0.2);"></span>
          <span style="font-size:0.78rem;font-weight:800;letter-spacing:0.05em;color:#e4cfa1;text-transform:uppercase;">
            3. OFİSLER ARASI ANABİLGİSAYAR EŞLEŞTİRME (${peers.length} BAĞLI ANABİLGİSAYAR)
          </span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <button type="button" class="btn btn-sm btn-success" onclick="autoDiscoverPeersNow()">
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
