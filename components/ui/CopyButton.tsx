"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
        copied
          ? "bg-emerald-100 text-emerald-600"
          : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary"
      }`}
      aria-label="Copy to clipboard"
    >
      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
    </button>
  );
}
