import React from 'react';
import { ExternalLink, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

/**
 * Parses inline formatting like **bold**, *italic*, `code`, and [links](url)
 */
function parseInline(text) {
  if (!text) return text;

  // Split by bold (**text**), italic (*text*), code (`text`), link ([text](url))
  const tokens = [];
  let remaining = text;
  let keyIdx = 0;

  // Regex for inline tokens
  const inlineRegex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\)|\*.*?\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = inlineRegex.exec(remaining)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      tokens.push(remaining.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      // Bold
      const content = token.slice(2, -2);
      tokens.push(
        <strong
          key={`b-${keyIdx++}`}
          className="font-bold text-slate-900 bg-emerald-50/80 text-emerald-950 px-1 py-0.5 rounded border border-emerald-200/60 shadow-xs"
        >
          {content}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      // Inline code
      const content = token.slice(1, -1);
      tokens.push(
        <code
          key={`c-${keyIdx++}`}
          className="font-mono text-xs bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-300 font-semibold"
        >
          {content}
        </code>
      );
    } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
      // Link [label](url)
      const linkMatch = token.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        const [, label, url] = linkMatch;
        tokens.push(
          <a
            key={`l-${keyIdx++}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-800 underline underline-offset-2 transition-colors mx-0.5"
          >
            {label}
            <ExternalLink size={12} className="inline" />
          </a>
        );
      } else {
        tokens.push(token);
      }
    } else if (token.startsWith('*') && token.endsWith('*')) {
      // Italic
      const content = token.slice(1, -1);
      tokens.push(
        <em key={`i-${keyIdx++}`} className="italic text-slate-600">
          {content}
        </em>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < remaining.length) {
    tokens.push(remaining.substring(lastIndex));
  }

  return tokens.length > 0 ? tokens : text;
}

export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let lineIdx = 0;

  while (lineIdx < lines.length) {
    const rawLine = lines[lineIdx];
    const trimmed = rawLine.trim();

    // 1. Empty lines
    if (!trimmed) {
      lineIdx++;
      continue;
    }

    // 2. Horizontal Rules
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      elements.push(
        <hr key={`hr-${lineIdx}`} className="my-4 border-t border-slate-200" />
      );
      lineIdx++;
      continue;
    }

    // 3. Headings (###, ##, #)
    if (trimmed.startsWith('### ')) {
      const headingText = trimmed.replace(/^###\s+/, '');
      elements.push(
        <div key={`h3-${lineIdx}`} className="mt-4 mb-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <h4 className="text-base font-extrabold text-slate-800 tracking-tight">
            {parseInline(headingText)}
          </h4>
        </div>
      );
      lineIdx++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.replace(/^##\s+/, '');
      elements.push(
        <div key={`h2-${lineIdx}`} className="mt-5 mb-2 border-b border-emerald-100 pb-1 flex items-center gap-2">
          <Sparkles size={16} className="text-emerald-600" />
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            {parseInline(headingText)}
          </h3>
        </div>
      );
      lineIdx++;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      const headingText = trimmed.replace(/^#\s+/, '');
      elements.push(
        <h2 key={`h1-${lineIdx}`} className="text-xl font-black text-slate-900 mt-4 mb-3">
          {parseInline(headingText)}
        </h2>
      );
      lineIdx++;
      continue;
    }

    // 4. Bullet lists (* item, - item)
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const bulletItems = [];
      while (lineIdx < lines.length && (lines[lineIdx].trim().startsWith('* ') || lines[lineIdx].trim().startsWith('- '))) {
        const itemText = lines[lineIdx].trim().replace(/^[\*\-]\s+/, '');
        bulletItems.push(itemText);
        lineIdx++;
      }

      elements.push(
        <ul key={`ul-${lineIdx}`} className="my-2.5 space-y-2 pl-1">
          {bulletItems.map((item, bIdx) => (
            <li key={bIdx} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
              <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="flex-1">{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 5. Numbered lists (1. item, 2. item)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      const numItems = [];
      while (lineIdx < lines.length) {
        const currentTrimmed = lines[lineIdx].trim();
        const match = currentTrimmed.match(/^(\d+)\.\s+(.*)/);
        if (!match) break;
        numItems.push({ num: match[1], text: match[2] });
        lineIdx++;
      }

      elements.push(
        <ol key={`ol-${lineIdx}`} className="my-2.5 space-y-2 pl-1">
          {numItems.map((item, nIdx) => (
            <li key={nIdx} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
              <span className="shrink-0 bg-emerald-100 text-emerald-800 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-emerald-200 mt-0.5 shadow-xs">
                {item.num}
              </span>
              <span className="flex-1">{parseInline(item.text)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 6. Regular Paragraph Line
    elements.push(
      <p key={`p-${lineIdx}`} className="text-sm text-slate-700 leading-relaxed my-1.5">
        {parseInline(trimmed)}
      </p>
    );
    lineIdx++;
  }

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
}
