"use client";

import { Wifi, Signal, Network, HelpCircle } from "lucide-react";
import type { ConnectionType, EffectiveType } from "@/lib/types";
import { connectionLabel } from "@/lib/utils";

interface Props {
  connectionType: ConnectionType;
  effectiveType: EffectiveType;
}

export function ConnectionBadge({ connectionType, effectiveType }: Props) {
  const label = connectionLabel(connectionType, effectiveType);

  const Icon =
    connectionType === "wifi"
      ? Wifi
      : connectionType === "cellular"
      ? Signal
      : connectionType === "ethernet"
      ? Network
      : HelpCircle;

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-cyan text-sm font-medium">
      <Icon size={14} className="text-[#00D4FF]" />
      <span className="text-[#00D4FF]">{label}</span>
    </div>
  );
}
