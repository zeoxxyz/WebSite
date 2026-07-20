import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { onAuthChange } from "@/integrations/firebase/auth";

function NotFoundComponent() {
  return (
    <div className="auth-wrap">
      <div className="card glass auth-card" style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 56, fontWeight: 700, letterSpacing: "-2px", marginBottom: 8 }}>404</h1>
        <p className="muted" style={{ marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary" style={{ textDecoration: "none" }}>Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="auth-wrap">
      <div className="card glass auth-card" style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
        <p className="muted" style={{ marginBottom: 20, fontSize: 13 }}>Please try again in a moment.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={() => { router.invalidate(); reset(); }} className="btn-primary">Try again</button>
          <a href="/" className="btn-outline">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ZeoxBypass — Free Bypass Key API for Everyone" },
      { name: "description", content: "Generate your free ZeoxBypass API key. 500 daily bypasses + 100 bonus points every day. Track usage, key status, and expiry from one clean dashboard." },
      { name: "author", content: "ZeoxBypass" },
      { property: "og:title", content: "ZeoxBypass — Free Bypass Key API" },
      { property: "og:description", content: "Free bypass keys with a real-time usage dashboard. 500 daily + 100 bonus per account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ZeoxBypass — Free Bypass Key API" },
      { name: "twitter:description", content: "Free bypass keys with a real-time usage dashboard." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthChange(() => {
      router.invalidate();
      queryClient.invalidateQueries();
    });
    return () => unsub();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="orb orb-top" />
      <div className="orb orb-left" />
      <div className="orb orb-right" />
      <Outlet />
    </QueryClientProvider>
  );
}
