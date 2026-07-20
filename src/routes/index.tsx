import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Zap, Shield, Terminal, Cpu, Sparkles, ArrowUpRight, Plus, HelpCircle,
  Rocket, BookOpen, Users, Activity, Globe,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZeoxBypass — Free Public Bypass API" },
      { name: "description", content: "ZeoxBypass is a free public bypass API. Paste a URL, get a resolved link — no API keys, no signup tokens." },
      { property: "og:title", content: "ZeoxBypass — Free Public Bypass API" },
      { property: "og:description", content: "Free, public, no-API-key bypass endpoint with a live dashboard." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <NavBar />
      <Hero />
      <Features />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}

function NavBar() {
  return (
    <header className="nav container">
      <Link to="/" className="logo">
        <span className="logo-mark"><Shield size={18} /></span>
        <span>ZeoxBypass</span>
      </Link>
      <nav className="nav-links glass">
        <a href="#home" data-status="active">Home</a>
        <a href="#features">Features</a>
        <a href="#faq">FAQ</a>
        <Link to="/docs">Docs</Link>
      </nav>
      <Link to="/auth" className="btn-ghost">Launch App <ArrowUpRight size={14} /></Link>
    </header>
  );
}

function Hero() {
  return (
    <section id="home" className="hero">
      <div className="rings" />

      <div className="floating-chip chip-1 glass"><Terminal size={14} /> Free API</div>
      <div className="floating-chip chip-2 glass"><Cpu size={14} /> No Key</div>
      <div className="floating-chip chip-3 glass"><Activity size={14} /> Live Status</div>
      <div className="floating-chip chip-4 glass"><Zap size={14} /> Fast</div>

      <div className="badge glass"><span className="ping" /> Free & public — no API key required</div>
      <h1>Bypass Links,<br />No API Keys</h1>
      <p className="hero-sub">
        ZeoxBypass is a free public API. Send a URL, get a bypassed link back. Log in to unlock the dashboard: live API status, usage counter, connected devices, terminal logs, and a captcha-protected bypass tool.
      </p>
      <div className="hero-cta">
        <Link to="/auth" className="btn-primary"><Sparkles size={16} /> Sign In to Bypass</Link>
        <Link to="/docs" className="btn-outline"><BookOpen size={16} /> API Docs</Link>
      </div>

      <div style={{ marginTop: 70, maxWidth: 720, marginInline: "auto" }}>
        <div className="card glass" style={{ padding: 26 }}>
          <div className="card-head">
            <span><Globe size={14} /> Endpoint</span>
            <span style={{ color: "var(--green)", fontSize: 12 }}>● Public</span>
          </div>
          <div className="key-box"><code>GET https://api.zeox.xyz/api/bypass?url=&lt;target&gt;</code></div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: <Zap size={22} />, title: "Free Public API", desc: "No API keys, no signup tokens. One endpoint, one parameter — call it and get a resolved link." },
    { icon: <Activity size={22} />, title: "Live API Status", desc: "The dashboard pings the API every 30 seconds so you always know if bypass is working." },
    { icon: <Terminal size={22} />, title: "API Terminal", desc: "Every request, response and health check streams into a live terminal in your dashboard." },
    { icon: <Cpu size={22} />, title: "Device Tracking", desc: "See how many of your devices are connected to the API from the dashboard." },
    { icon: <Shield size={22} />, title: "reCAPTCHA v3", desc: "Bypass requests are protected by Google reCAPTCHA v3 to keep the free tier fair." },
    { icon: <Users size={22} />, title: "Discord Community", desc: "Get support, share feedback and hear about new API updates first — join the Discord." },
  ];
  return (
    <section id="features" className="features container">
      <h2>Everything You Need,<br />Nothing You Don't</h2>
      <p className="section-sub">A public bypass endpoint, a clean dashboard, and honest limits. That's it.</p>
      <div className="feature-grid">
        {items.map((it) => (
          <div key={it.title} className="card glass feat-card reveal">
            <div className="ic-wrap">{it.icon}</div>
            <h4>{it.title}</h4>
            <p>{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "Do I need an API key?", a: "No. ZeoxBypass is a free public API — no key, no token, no signup for the endpoint itself." },
    { q: "Why do I need to sign in?", a: "The dashboard (status, usage, terminal, device tracking, and the captcha-protected bypass tool) requires a free account. The raw API endpoint doesn't." },
    { q: "How do I use the API?", a: "Send a GET request to /api/bypass with a url query parameter. See the Docs page for cURL, JavaScript and Python examples." },
    { q: "Is the API rate limited?", a: "The free API applies fair-use limits. If you're building on top of it, spread requests out and don't hammer the endpoint." },
    { q: "What about captcha?", a: "The dashboard uses Google reCAPTCHA v3 before firing a bypass. Direct API calls (cURL, code) do not require captcha." },
    { q: "Where do I get support?", a: "Join our Discord community. The link is in the dashboard's Community section." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="faq">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-list">
        {items.map((it, i) => (
          <div key={it.q} className={`faq-item card glass ${open === i ? "open" : ""}`}>
            <button onClick={() => setOpen(open === i ? null : i)}>
              <span><HelpCircle size={16} /> {it.q}</span>
              <Plus className="pi" size={20} />
            </button>
            <div className="ans">{it.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="cta container">
      <div className="card glass cta-card">
        <h2>Log In and Start<br />Bypassing Right Away</h2>
        <p>Sign in with email or Google to unlock the full dashboard.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/auth" className="btn-primary big"><Rocket size={16} /> Sign In</Link>
          <Link to="/docs" className="btn-outline"><BookOpen size={16} /> Read the Docs</Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer container">
      <div className="logo"><span className="logo-mark"><Shield size={18} /></span> ZeoxBypass</div>
      <p>© 2026 ZeoxBypass. Free public bypass API.</p>
      <div className="socials">
        <a href="https://discord.gg/DPZDdrP7SP" target="_blank" rel="noopener noreferrer" aria-label="Discord">
          <Users size={16} />
        </a>
      </div>
    </footer>
  );
}

