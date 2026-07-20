import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Shield, BookOpen, Copy, Terminal, ArrowLeft, Activity, CheckCircle2, AlertCircle,
} from "lucide-react";

const API_BASE = "https://api.zeox.xyz";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "API Docs — ZeoxBypass" },
      { name: "description", content: "Free public ZeoxBypass API documentation — cURL, JavaScript and Python examples." },
      { property: "og:title", content: "ZeoxBypass API Docs" },
      { property: "og:description", content: "Free public bypass API — no API keys required." },
    ],
  }),
  component: DocsPage,
});

function DocsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [status, setStatus] = useState<"checking" | "up" | "down">("checking");
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const check = async () => {
      const s = performance.now();
      try {
        const r = await fetch(`${API_BASE}/api/bypass?url=https://loot.link/example`);
        setLatency(Math.round(performance.now() - s));
        setStatus(r.ok || r.status === 400 ? "up" : "down");
      } catch {
        setStatus("down");
      }
    };
    check();
  }, []);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const snippets = [
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
    <div className="container" style={{ padding: "32px 24px 60px", maxWidth: 900 }}>
      <header className="nav" style={{ padding: "0 0 24px", background: "none", backdropFilter: "none" }}>
        <Link to="/" className="logo">
          <span className="logo-mark"><Shield size={18} /></span>
          <span>ZeoxBypass</span>
        </Link>
        <Link to="/auth" className="btn-ghost">Sign In</Link>
      </header>

      <Link to="/" style={{ color: "var(--muted)", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
        <ArrowLeft size={14} /> Back to home
      </Link>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-1px", marginBottom: 12, background: "linear-gradient(180deg,#fff,#c9c1bc)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            API Docs
          </h1>
          <p className="muted" style={{ fontSize: 15, lineHeight: 1.6, maxWidth: 640 }}>
            ZeoxBypass is a <b style={{ color: "var(--text)" }}>free public API</b>. No API keys, no signup tokens — just one endpoint and one parameter.
          </p>
        </div>

        {/* Status */}
        <div className="card glass">
          <div className="card-head">
            <span><Activity /> API Status</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12,
              color: status === "up" ? "var(--green)" : status === "down" ? "var(--danger)" : "var(--muted)",
            }}>
              {status === "up" ? <><CheckCircle2 size={13} /> Online</>
                : status === "down" ? <><AlertCircle size={13} /> Offline</>
                : "Checking..."}
              {latency !== null && ` · ${latency}ms`}
            </span>
          </div>
        </div>

        {/* Endpoint */}
        <div className="card glass">
          <div className="card-head"><span><BookOpen /> Endpoint</span></div>
          <div className="key-box"><code>GET {API_BASE}/api/bypass?url=&lt;target&gt;</code></div>
          <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
            Query parameter <code style={{ color: "var(--orange)" }}>url</code> — the shortlink to bypass. The response is JSON.
          </p>
        </div>

        {/* Snippets */}
        {snippets.map((s) => (
          <div key={s.id} className="card glass">
            <div className="card-head">
              <span><Terminal /> {s.lang}</span>
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

        <div className="card glass" style={{ textAlign: "center", padding: 30 }}>
          <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
            Want the full dashboard — live status, usage, terminal, device tracking, and a captcha-protected bypass tool?
          </p>
          <Link to="/auth" className="btn-primary">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
