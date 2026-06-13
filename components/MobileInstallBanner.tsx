"use client";

import { useState, useEffect } from "react";

export function MobileInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const dismissed = localStorage.getItem("install_banner_dismissed");
    setShow(isMobile && !isStandalone && !dismissed);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg px-4 py-3 flex items-center gap-3">
      <span className="text-2xl flex-shrink-0">🥗</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">Add to Home Screen</p>
        <p className="text-xs text-gray-500">Tap <strong>Share</strong> then <strong>Add to Home Screen</strong> for app-like access</p>
      </div>
      <button
        onClick={() => { localStorage.setItem("install_banner_dismissed", "1"); setShow(false); }}
        className="text-gray-400 hover:text-gray-600 text-xl flex-shrink-0 px-1"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
