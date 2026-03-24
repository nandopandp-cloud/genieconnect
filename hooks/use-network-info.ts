"use client";
import { useEffect, useState } from "react";
import type { ConnectionType, EffectiveType } from "@/lib/types";

interface NetworkInfo {
  connectionType: ConnectionType;
  effectiveType: EffectiveType;
}

function detectFromUserAgent(): { isMobile: boolean } {
  if (typeof navigator === "undefined") return { isMobile: false };
  return { isMobile: /Android|iPhone|iPad|iPod|Mobile|IEMobile/i.test(navigator.userAgent) };
}

export function useNetworkInfo(): NetworkInfo {
  const [info, setInfo] = useState<NetworkInfo>({
    connectionType: "unknown",
    effectiveType: "unknown",
  });

  useEffect(() => {
    const nav = navigator as Navigator & {
      connection?: {
        type?: string;
        effectiveType?: string;
        addEventListener(e: string, fn: () => void): void;
        removeEventListener(e: string, fn: () => void): void;
      };
    };
    const conn = nav.connection;
    const { isMobile } = detectFromUserAgent();

    function resolve(): NetworkInfo {
      const rawType = conn?.type;
      const rawEffective = (conn?.effectiveType ?? "unknown") as EffectiveType;

      // If the API gives us a real type, trust it
      if (rawType && rawType !== "unknown") {
        return { connectionType: rawType as ConnectionType, effectiveType: rawEffective };
      }

      // API unavailable or unknown: infer from device type
      if (isMobile) {
        // Mobile device without explicit wifi → assume cellular
        return {
          connectionType: "cellular",
          effectiveType: rawEffective !== "unknown" ? rawEffective : "4g",
        };
      }

      // Desktop/laptop → Wi-Fi is the most common connection type
      return { connectionType: "wifi", effectiveType: rawEffective };
    }

    setInfo(resolve());

    if (!conn) return;
    const handler = () => setInfo(resolve());
    conn.addEventListener("change", handler);
    return () => conn.removeEventListener("change", handler);
  }, []);

  return info;
}
