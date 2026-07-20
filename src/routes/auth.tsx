import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Shield, Sparkles, LogIn, UserPlus, ArrowLeft } from "lucide-react";
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  getCurrentUser,
} from "@/integrations/firebase/auth";
import ReCAPTCHA from "react-google-recaptcha";

// Google's free test keys — work on any domain for development.
// For production: register your domain at https://www.google.com/recaptcha/admin (free)
// then replace this with your real Site Key.
const RECAPTCHA_SITE_KEY = "6LdC3lwtAAAAAG5yYlc9DGb852Dy-K08CZymu7PM";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In / Sign Up — ZeoxBypass" },
      { name: "description", content: "Create your free ZeoxBypass account or sign in to manage your bypass key and usage." },
      { property: "og:title", content: "Sign In — ZeoxBypass" },
      { property: "og:description", content: "Create a free ZeoxBypass account and get your bypass key instantly." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [captchaDone, setCaptchaDone] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) navigate({ to: "/dashboard" });
  }, [navigate]);

  const resetCaptcha = () => {
    recaptchaRef.current?.reset();
    setCaptchaDone(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaDone) {
      setError("Please complete the CAPTCHA verification first.");
      return;
    }
    setLoading(true); setError(null); setOk(null);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password);
        setOk("Account created! Redirecting to dashboard...");
        setTimeout(() => navigate({ to: "/dashboard" }), 600);
      } else {
        await signInWithEmail(email, password);
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg.replace("Firebase: ", "").replace(/\(auth\/.*\)\.?/, "").trim());
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true); setError(null); setOk(null);
    try {
      await signInWithGoogle();
      navigate({ to: "/dashboard" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(msg.replace("Firebase: ", "").replace(/\(auth\/.*\)\.?/, "").trim());
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card glass auth-card reveal">
        <Link to="/" style={{ color: "var(--muted)", fontSize: 12.5, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="auth-head">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span className="logo-mark"><Shield size={18} /></span>
            <span style={{ fontWeight: 700, fontSize: 20 }}>ZeoxBypass</span>
          </div>
          <h1>{mode === "signup" ? "Create your free account" : "Welcome back"}</h1>
          <p>{mode === "signup" ? "Get your bypass key instantly — no credit card." : "Sign in to access your dashboard."}</p>
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          className="btn-google"
          onClick={handleGoogle}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <><Sparkles size={16} /> Connecting...</>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
                <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="auth-divider"><span>or</span></div>

        <div className="auth-tabs">
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(null); setOk(null); resetCaptcha(); }}>
            Sign Up
          </button>
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(null); setOk(null); resetCaptcha(); }}>
            Sign In
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {ok && <div className="auth-ok">{ok}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={6} className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>

          {/* reCAPTCHA v2 — Free, no API key needed for localhost */}
          <div className="captcha-wrap">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              theme="dark"
              onChange={(token) => setCaptchaDone(!!token)}
              onExpired={() => setCaptchaDone(false)}
            />
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading || !captchaDone}>
            {loading ? (
              <><Sparkles size={16} /> Please wait...</>
            ) : mode === "signup" ? (
              <><UserPlus size={16} /> Create Account</>
            ) : (
              <><LogIn size={16} /> Sign In</>
            )}
          </button>
        </form>

        <p className="muted" style={{ textAlign: "center", fontSize: 12, marginTop: 20 }}>
          {mode === "signup" ? "Already have an account?" : "Don't have an account yet?"}{" "}
          <button
            type="button"
            onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(null); setOk(null); resetCaptcha(); }}
            style={{ background: "none", border: "none", color: "var(--orange)", cursor: "pointer", fontWeight: 600, fontSize: 12 }}
          >
            {mode === "signup" ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
