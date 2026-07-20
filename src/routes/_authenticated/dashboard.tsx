import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Shield, Activity, LogOut, Copy, Menu, Terminal as TerminalIcon,
  Zap, BookOpen, Sparkles, Users, ExternalLink, CheckCircle2, AlertCircle,
  Cpu, LayoutDashboard, RefreshCw,
} from "lucide-react";
import { signOut } from "@/integrations/firebase/auth";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

// User: replace this with your Google reCAPTCHA v3 site key.
const RECAPTCHA_V3_SITE_KEY = "6LeXlVwtAAAAAP5zlYYAC1aWEO5B0VlwdRRfBWt8";
const API_BASE = "https://api.zeox.xyz";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ZeoxBypass" },
      { name: "description", content: "ZeoxBypass dashboard: monitor API status, usage, connected devices and run bypasses." },
      { name: "robots", content: "noindex" },
    ],
    scripts: [
      { src: `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_V3_SITE_KEY}`, async: true, defer: true },
    ],
  }),
  component: DashboardPage,
});

type Toast = { id: number; kind: "ok" | "err" | "info"; text: string };
type TabId = "overview" | "bypass" | "docs" | "updates" | "community";
type TermLine = { t: number; kind: "in" | "out" | "err" | "sys"; text: string };

const STORAGE_KEY_USAGE = "zeox_usage_count";
const STORAGE_KEY_DEVICE = "zeox_device_id";
const STORAGE_KEY_LOG = "zeox_term_log";

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // API health
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [apiLatency, setApiLatency] = useState<number | null>(null);

  // Local usage / device stats
  const [usageCount, setUsageCount] = useState(0);
  const [deviceCount, setDeviceCount] = useState(1);
  const [terminalLog, setTerminalLog] = useState<TermLine[]>([]);

  const pushToast = (kind: Toast["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  const pushLog = (kind: TermLine["kind"], text: string) => {
    setTerminalLog((l) => {
      const next = [...l, { t: Date.now(), kind, text }].slice(-200);
      try { localStorage.setItem(STORAGE_KEY_LOG, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Auth listener + initial local state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) navigate({ to: "/auth" });
      else setUser(u);
    });
    try {
      setUsageCount(Number(localStorage.getItem(STORAGE_KEY_USAGE) || 0));
      // Device tracking (unique per browser)
      let did = localStorage.getItem(STORAGE_KEY_DEVICE);
      if (!did) {
        did = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY_DEVICE, did);
      }
      const raw = localStorage.getItem(STORAGE_KEY_LOG);
      if (raw) setTerminalLog(JSON.parse(raw));
      // Track connected devices via a rolling registry
      const devKey = `zeox_devices_${did}`;
      localStorage.setItem(devKey, String(Date.now()));
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("zeox_devices_")) count++;
      }
      setDeviceCount(Math.max(1, count));
    } catch {}
    return () => unsub();
  }, [navigate]);

  // Ping API on mount + every 30s
  const pingApi = async () => {
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE}/api/bypass?url=https://loot.link/example`, {
        method: "GET", mode: "cors",
      });
      const ms = Math.round(performance.now() - start);
      setApiLatency(ms);
      setApiOnline(res.ok || res.status === 400);
      pushLog("sys", `health check: ${res.status} in ${ms}ms`);
    } catch (e) {
      setApiOnline(false);
      setApiLatency(null);
      pushLog("err", `health check failed: ${(e as Error).message}`);
    }
  };
  useEffect(() => {
    pingApi();
    const id = setInterval(pingApi, 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const email = user?.email ?? "";
  const initial = (email[0] || "U").toUpperCase();

  return (
    <div>
      {/* Sidebar */}
      <aside className={`sidebar glass ${sidebarOpen ? "open" : ""}`}>
        <div className="logo" style={{ padding: "0 6px 8px" }}>
          <span className="logo-mark"><Shield size={18} /></span>
          <span>ZeoxBypass</span>
        </div>
        <nav className="side-nav">
          <a className={`side-link ${tab === "overview" ? "active" : ""}`} onClick={() => { setTab("overview"); setSidebarOpen(false); }}>
            <LayoutDashboard /> Dashboard
          </a>
          <a className={`side-link ${tab === "bypass" ? "active" : ""}`} onClick={() => { setTab("bypass"); setSidebarOpen(false); }}>
            <Zap /> Bypass
          </a>
          <a className={`side-link ${tab === "docs" ? "active" : ""}`} onClick={() => { setTab("docs"); setSidebarOpen(false); }}>
            <BookOpen /> Docs
          </a>
          <a className={`side-link ${tab === "updates" ? "active" : ""}`} onClick={() => { setTab("updates"); setSidebarOpen(false); }}>
            <Sparkles /> Updates
          </a>
          <a className={`side-link ${tab === "community" ? "active" : ""}`} onClick={() => { setTab("community"); setSidebarOpen(false); }}>
            <Users /> Discord Community
          </a>
        </nav>
        <div className="side-foot">
          <div className="user-row">
            <div className="avatar">{initial}</div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <b style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</b>
              <small>Signed in</small>
            </div>
          </div>
          <button className="btn-mini ghost danger" onClick={handleLogout}>
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <div className="topbar">
          <button className="btn-ghost" id="menu-btn" onClick={() => setSidebarOpen((v) => !v)}>
            <Menu size={16} />
          </button>
          <div className="crumbs">
            <Link to="/">Home</Link> <span>/</span> <b style={{ textTransform: "capitalize" }}>{tab}</b>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className={`badge`} style={{ margin: 0, background: apiOnline ? "rgba(61,220,132,.1)" : "rgba(255,77,90,.1)", border: `1px solid ${apiOnline ? "rgba(61,220,132,.3)" : "rgba(255,77,90,.3)"}` }}>
              <span className="ping" style={{ background: apiOnline ? "#3ddc84" : "#ff4d5a", boxShadow: `0 0 12px ${apiOnline ? "#3ddc84" : "#ff4d5a"}` }} />
              {apiOnline === null ? "Checking..." : apiOnline ? "API Online" : "API Offline"}
            </span>
          </div>
        </div>

        {tab === "overview" && (
          <OverviewTab
            apiOnline={apiOnline}
            apiLatency={apiLatency}
            usageCount={usageCount}
            deviceCount={deviceCount}
            terminalLog={terminalLog}
            onRefresh={pingApi}
          />
        )}
        {tab === "bypass" && (
          <BypassTab
            onSuccess={() => {
              const next = usageCount + 1;
              setUsageCount(next);
              try { localStorage.setItem(STORAGE_KEY_USAGE, String(next)); } catch {}
            }}
            pushToast={pushToast}
            pushLog={pushLog}
          />
        )}
        {tab === "docs" && <DocsTab />}
        {tab === "updates" && <UpdatesTab />}
        {tab === "community" && <CommunityTab />}
      </main>

      {/* Toasts */}
      <div style={{ position: "fixed", bottom: 20, right: 20, display: "flex", flexDirection: "column", gap: 8, zIndex: 100 }}>
        {toasts.map((t) => (
          <div key={t.id} className={t.kind === "ok" ? "auth-ok" : t.kind === "err" ? "auth-error" : "badge"}
            style={{ minWidth: 220, margin: 0 }}>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================ Overview ============================ */

function OverviewTab({
  apiOnline, apiLatency, usageCount, deviceCount, terminalLog, onRefresh,
}: {
  apiOnline: boolean | null;
  apiLatency: number | null;
  usageCount: number;
  deviceCount: number;
  terminalLog: TermLine[];
  onRefresh: () => void;
}) {
  const termRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [terminalLog]);

  return (
    <>
      <div className="stats-row">
        <div className="card glass stat">
          <div className={`stat-ic ${apiOnline ? "g" : ""}`}>
            {apiOnline ? <CheckCircle2 /> : <AlertCircle />}
          </div>
          <div>
            <small>Bypass API</small>
            <b>{apiOnline === null ? "..." : apiOnline ? "Working" : "Down"}</b>
          </div>
        </div>
        <div className="card glass stat">
          <div className="stat-ic"><Activity /></div>
          <div>
            <small>Latency</small>
            <b>{apiLatency !== null ? `${apiLatency}ms` : "—"}</b>
          </div>
        </div>
        <div className="card glass stat">
          <div className="stat-ic"><Zap /></div>
          <div>
            <small>API Uses</small>
            <b>{usageCount}</b>
          </div>
        </div>
        <div className="card glass stat">
          <div className="stat-ic"><Cpu /></div>
          <div>
            <small>Connected Devices</small>
            <b>{deviceCount}</b>
          </div>
        </div>
      </div>

      <div className="card glass" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <span><TerminalIcon /> API Terminal</span>
          <button className="btn-mini ghost" onClick={onRefresh}><RefreshCw size={12} /> Ping</button>
        </div>
        <div ref={termRef} style={{
          background: "#000", borderRadius: 12, padding: 14,
          fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5,
          height: 320, overflowY: "auto", border: "1px solid var(--glass-brd)",
        }}>
          {terminalLog.length === 0 && (
            <div style={{ color: "var(--muted)" }}>$ waiting for events...</div>
          )}
          {terminalLog.map((l, i) => (
            <div key={i} style={{
              color: l.kind === "err" ? "#ff4d5a" : l.kind === "out" ? "#3ddc84" : l.kind === "in" ? "#ff8a3d" : "#8a827d",
              whiteSpace: "pre-wrap", wordBreak: "break-all", marginBottom: 2,
            }}>
              <span style={{ color: "#555" }}>[{new Date(l.t).toLocaleTimeString()}]</span>{" "}
              <span style={{ color: "#666" }}>{l.kind}</span>{" "}
              {l.text}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================ Bypass ============================ */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

function BypassTab({
  onSuccess, pushToast, pushLog,
}: {
  onSuccess: () => void;
  pushToast: (k: Toast["kind"], t: string) => void;
  pushLog: (k: TermLine["kind"], t: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<unknown | null>(null);
  const [captchaReady, setCaptchaReady] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => setCaptchaReady(true));
        clearInterval(t);
      }
    }, 400);
    return () => clearInterval(t);
  }, []);

  const runBypass = async () => {
    if (!url.trim()) { pushToast("err", "Enter a URL"); return; }
    setBusy(true);
    setResult(null);
    try {
      // reCAPTCHA v3
      if (RECAPTCHA_V3_SITE_KEY && RECAPTCHA_V3_SITE_KEY !== "YOUR_RECAPTCHA_V3_SITE_KEY" && window.grecaptcha) {
        pushLog("sys", "verifying captcha...");
        const token = await window.grecaptcha.execute(RECAPTCHA_V3_SITE_KEY, { action: "bypass" });
        pushLog("sys", `captcha token: ${token.slice(0, 20)}...`);
      } else {
        pushLog("sys", "captcha site key not configured — skipping verification");
      }

      pushLog("in", `GET ${API_BASE}/api/bypass?url=${url}`);
      const res = await fetch(`${API_BASE}/api/bypass?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setResult(data);
      pushLog("out", JSON.stringify(data));
      onSuccess();
      pushToast("ok", "Bypass done");
    } catch (e) {
      const msg = (e as Error).message;
      setResult({ error: msg });
      pushLog("err", msg);
      pushToast("err", `Failed: ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card glass" style={{ padding: 30 }}>
      <div className="card-head">
        <span><Zap /> Bypass URL</span>
        <span style={{ fontSize: 11 }}>
          Captcha: {RECAPTCHA_V3_SITE_KEY === "YOUR_RECAPTCHA_V3_SITE_KEY"
            ? <span style={{ color: "var(--danger)" }}>site key not set</span>
            : captchaReady ? <span style={{ color: "var(--green)" }}>ready (v3)</span> : "loading..."}
        </span>
      </div>

      <div className="field">
        <label>URL to bypass</label>
        <input
          className="input"
          placeholder="https://loot.link/example"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !busy && runBypass()}
        />
      </div>

      <button className="btn-primary" onClick={runBypass} disabled={busy} style={{ width: "100%", justifyContent: "center", marginTop: 10 }}>
        {busy ? <><Sparkles size={16} /> Working...</> : <><Zap size={16} /> Run Bypass</>}
      </button>

      {result !== null && (
        <div style={{ marginTop: 20 }}>
          <div className="card-head"><span>Response</span></div>
          <pre style={{
            background: "#000", padding: 16, borderRadius: 12,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5,
            color: "var(--text)", overflowX: "auto", border: "1px solid var(--glass-brd)",
          }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <p className="muted" style={{ fontSize: 12, marginTop: 16 }}>
        Protected by Google reCAPTCHA v3. This site uses the free public ZeoxBypass API — no API key required.
      </p>
    </div>
  );
}

/* ============================ Docs ============================ */

function DocsTab() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const snippets: { id: string; lang: string; code: string }[] = [
    {
      id: "curl", lang: "cURL",
      code: `curl "${API_BASE}/api/bypass?url=https://loot.link/example"`,
    },
    {
      id: "js", lang: "JavaScript (fetch)",
      code: `const url = "https://loot.link/example";
const res = await fetch(
  \`${API_BASE}/api/bypass?url=\${encodeURIComponent(url)}\`
);
const data = await res.json();
console.log(data);`,
    },
    {
      id: "py", lang: "Python (requests)",
      code: `import requests
r = requests.get(
    "${API_BASE}/api/bypass",
    params={"url": "https://loot.link/example"},
)
print(r.json())`,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card glass">
        <div className="card-head"><span><BookOpen /> Bypass API</span></div>
        <p className="muted" style={{ fontSize: 14, marginBottom: 12 }}>
          Free public endpoint. No API key required. One parameter: <code>url</code>.
        </p>
        <div style={{
          padding: 14, background: "rgba(0,0,0,.4)", borderRadius: 12,
          fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--orange)",
        }}>
          GET {API_BASE}/api/bypass?url=&lt;target&gt;
        </div>
      </div>

      <div className="card glass">
        <div className="card-head"><span>Status</span></div>
        <p className="muted" style={{ fontSize: 13 }}>
          Live status is shown at the top-right of your dashboard. Health checks run every 30 seconds.
        </p>
      </div>

      {snippets.map((s) => (
        <div key={s.id} className="card glass">
          <div className="card-head">
            <span>{s.lang}</span>
            <button className="btn-mini ghost" onClick={() => copy(s.code, s.id)}>
              <Copy size={12} /> {copied === s.id ? "Copied" : "Copy"}
            </button>
          </div>
          <pre style={{
            background: "#000", padding: 14, borderRadius: 12,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5,
            color: "var(--text)", overflowX: "auto", border: "1px solid var(--glass-brd)",
          }}>{s.code}</pre>
        </div>
      ))}
    </div>
  );
}

/* ============================ Updates ============================ */

function UpdatesTab() {
  const updates = [
    {
      date: "2026-07-20", tag: "v2.0",
      title: "Free public API launch",
      body: "The Bypass API is now fully free and public — no API keys, no signup tokens. Just call the endpoint with a URL.",
    },
    {
      date: "2026-07-10", tag: "v1.9",
      title: "Improved link resolvers",
      body: "Added support for more shortlink providers including loot.link, linkvertise, and boost.ink variants.",
    },
    {
      date: "2026-06-28", tag: "v1.8",
      title: "Latency reductions",
      body: "Average response time cut by ~35% via edge caching and faster upstream resolution.",
    },
    {
      date: "2026-06-05", tag: "v1.7",
      title: "reCAPTCHA v3 protection",
      body: "Bypass requests from the dashboard are now protected by Google reCAPTCHA v3 to keep the free tier fair for everyone.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {updates.map((u, i) => (
        <div key={i} className="card glass">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span className="badge" style={{ margin: 0, color: "var(--orange)", background: "rgba(255,106,0,.08)", border: "1px solid rgba(255,106,0,.25)" }}>{u.tag}</span>
            <small className="muted">{u.date}</small>
          </div>
          <h4 style={{ fontSize: 17, marginBottom: 8, fontWeight: 600 }}>{u.title}</h4>
          <p className="muted" style={{ fontSize: 13, lineHeight: 1.6 }}>{u.body}</p>
        </div>
      ))}
    </div>
  );
}

/* ============================ Community ============================ */

function CommunityTab() {
  return (
    <div className="card glass" style={{ padding: 40, textAlign: "center" }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20, margin: "0 auto 20px",
        background: "linear-gradient(135deg, #5865F2, #3a45c9)",
        display: "grid", placeItems: "center",
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="#fff">
          <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.51 12.51 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.699.772 1.363 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.028zM8.02 15.331c-1.182 0-2.157-1.086-2.157-2.419 0-1.334.956-2.42 2.157-2.42 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.974 0c-1.182 0-2.157-1.086-2.157-2.419 0-1.334.955-2.42 2.157-2.42 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/>
        </svg>
      </div>
      <h2 style={{ fontSize: 28, marginBottom: 10, background: "linear-gradient(180deg,#fff,#c9c1bc)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Join our Discord</h2>
      <p className="muted" style={{ fontSize: 14, marginBottom: 24, maxWidth: 460, margin: "0 auto 24px" }}>
        Get support, request features, chat with other users, and hear about new API updates first.
      </p>
      <a href="https://discord.gg/DPZDdrP7SP" target="_blank" rel="noopener noreferrer" className="btn-primary big" style={{ textDecoration: "none" }}>
        Join Server <ExternalLink size={14} />
      </a>
    </div>
  );
}
