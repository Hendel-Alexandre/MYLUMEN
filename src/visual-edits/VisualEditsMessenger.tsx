/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";

export const CHANNEL = "ORCHIDS_HOVER_v1" as const;

// Lightweight placeholder component - visual editing disabled for performance
export default function HoverReceiver() {
  useEffect(() => {
    // Acknowledge visual edit mode if parent asks
    function onMsg(e: MessageEvent) {
      if (e.data?.type === CHANNEL && e.data?.msg === "VISUAL_EDIT_MODE") {
        window.parent.postMessage(
          { type: CHANNEL, msg: "VISUAL_EDIT_MODE_ACK", active: false },
          "*"
        );
      }
    }
    
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return null;
}