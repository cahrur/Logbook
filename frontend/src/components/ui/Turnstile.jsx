import { useEffect, useRef } from 'react';

// Public site key — falls back to Cloudflare's "always passes" testing key for
// local dev. Set VITE_TURNSTILE_SITE_KEY at build time for production.
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

export default function Turnstile({ onVerify, onError, onExpire, action = 'login' }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  // Keep the latest callbacks without re-rendering the widget.
  const cbRef = useRef({});
  cbRef.current = { onVerify, onError, onExpire };

  useEffect(() => {
    let cancelled = false;
    let timer;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || widgetIdRef.current !== null) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        action,
        callback: (token) => cbRef.current.onVerify?.(token),
        'error-callback': (err) => cbRef.current.onError?.(err),
        'expired-callback': () => {
          cbRef.current.onExpire?.();
          if (widgetIdRef.current !== null) window.turnstile.reset(widgetIdRef.current);
        },
      });
    };

    // Poll until the Turnstile script has loaded — robust to load order.
    const waitForScript = () => {
      if (cancelled) return;
      if (window.turnstile?.render) renderWidget();
      else timer = setTimeout(waitForScript, 150);
    };
    waitForScript();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [action]);

  return <div ref={containerRef} />;
}
