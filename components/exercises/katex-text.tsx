"use client";

import { useMemo } from "react";
import katex from "katex";

/** Renders text with inline $...$ math spans via KaTeX, and **bold** / `code`. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const html = useMemo(() => renderRich(text), [text]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function renderRich(input: string): string {
  // escape HTML first
  let s = escapeHtml(input);
  // inline math $...$
  s = s.replace(/\$([^$]+)\$/g, (_m, expr) => {
    try {
      return katex.renderToString(expr, { throwOnError: false });
    } catch {
      return `$${expr}$`;
    }
  });
  // **bold**
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // `code`
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  // newlines
  s = s.replace(/\n/g, "<br/>");
  return s;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
