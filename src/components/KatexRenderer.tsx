"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface KatexRendererProps {
  content: string;
  className?: string;
}

/**
 * Komponen untuk merender teks soal ujian CBT yang mengandung formula LaTeX
 * Format inline: $...$ atau block: $$...$$
 */
export const KatexRenderer: React.FC<KatexRendererProps> = ({ content, className = "" }) => {
  const renderedContent = useMemo(() => {
    if (!content) return "";

    // Regex to detect $$block$$ and $inline$
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g);

    return parts.map((part, index) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, { displayMode: true, throwOnError: false });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} className="block my-2" />;
        } catch {
          return <code key={index} className="text-red-500">{part}</code>;
        }
      } else if (part.startsWith("$") && part.endsWith("$")) {
        const math = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, { displayMode: false, throwOnError: false });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} className="inline-block px-1" />;
        } catch {
          return <code key={index} className="text-red-500">{part}</code>;
        }
      }

      return <span key={index}>{part}</span>;
    });
  }, [content]);

  return <div className={`prose max-w-none text-slate-800 ${className}`}>{renderedContent}</div>;
};

export default KatexRenderer;
