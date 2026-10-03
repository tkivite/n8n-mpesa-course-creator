#!/usr/bin/env node
/**
 * Render course Markdown docs → PDFs using marked + headless Google Chrome.
 * No Pandoc / LaTeX required. Zero network at runtime after `npm install`.
 *
 * Usage:  node scripts/build-pdfs.mjs
 * Output: docs/*.pdf
 */
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { marked } from 'marked';
import hljs from 'highlight.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const BUILD = path.join(ROOT, '.build');

// --- Chrome locations (macOS primary; fall back to Linux/env) ---
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

async function findChrome() {
  for (const p of CHROME_CANDIDATES) {
    try { await access(p); return p; } catch {}
  }
  throw new Error('Google Chrome / Chromium not found. Set CHROME_PATH env var.');
}

// --- Markdown → HTML with syntax highlighting ---
marked.use({
  gfm: true,
  breaks: false,
  renderer: {
    code({ text, lang }) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      const html = hljs.highlight(text, { language, ignoreIllegals: true }).value;
      return `<pre><code class="hljs language-${language}">${html}</code></pre>`;
    }
  }
});

const CSS = /* css */`
  :root { --accent:#2b7a3e; --accent-dark:#1f5a2d; --fg:#1a1a1a; --muted:#555; --border:#e2e2e2; --code-bg:#f5f7f9; }
  @page { size: A4; margin: 22mm 18mm; }
  * { box-sizing: border-box; }
  html, body { margin:0; padding:0; }
  body {
    font-family: -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    color: var(--fg); line-height: 1.55; font-size: 11pt;
  }
  h1, h2, h3, h4 { color: var(--accent-dark); font-weight: 700; line-height:1.2; }
  h1 { font-size: 26pt; border-bottom: 3px solid var(--accent); padding-bottom:.3em; margin-top:0; }
  h2 { font-size: 18pt; border-bottom: 1px solid var(--border); padding-bottom:.2em; margin-top:1.6em; page-break-after: avoid; }
  h3 { font-size: 14pt; margin-top:1.3em; page-break-after: avoid; }
  h4 { font-size: 12pt; page-break-after: avoid; }
  p, ul, ol { margin: .55em 0; }
  a { color: var(--accent); text-decoration: none; }
  code { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 9.8pt;
         background: var(--code-bg); padding: 1px 5px; border-radius: 4px; }
  pre { background: var(--code-bg); border: 1px solid var(--border); border-radius: 6px;
        padding: 10px 12px; overflow: hidden; page-break-inside: avoid; }
  pre code { background: transparent; padding: 0; display: block; white-space: pre-wrap; word-break: break-word; font-size: 9pt; }
  blockquote { border-left: 4px solid var(--accent); margin: 1em 0; padding: .3em 1em;
               background: #f6fbf7; color: #333; }
  table { border-collapse: collapse; width: 100%; margin: .8em 0; font-size: 10pt; page-break-inside: avoid; }
  th, td { border: 1px solid var(--border); padding: 6px 10px; text-align: left; vertical-align: top; }
  th { background: var(--accent); color: #fff; }
  tr:nth-child(even) td { background: #fafbfc; }
  hr { border: none; border-top: 1px solid var(--border); margin: 1.5em 0; }
  img { max-width: 100%; }
  .cover { height: 92vh; display: flex; flex-direction: column; justify-content: center;
           page-break-after: always; }
  .cover h1 { font-size: 36pt; border: none; margin: 0 0 .3em; }
  .cover .sub { color: var(--muted); font-size: 14pt; }
  .cover .meta { margin-top: auto; color: var(--muted); font-size: 10pt; }
  /* highlight.js lite */
  .hljs-keyword, .hljs-tag { color:#a71d5d; }
  .hljs-string, .hljs-attr { color:#1a7f37; }
  .hljs-number, .hljs-literal { color:#005cc5; }
  .hljs-comment { color:#6a737d; font-style: italic; }
  .hljs-title, .hljs-section { color:#6f42c1; }
  .hljs-built_in, .hljs-type { color:#e36209; }
`;

function wrap({ title, subtitle, bodyHtml, cover = true }) {
  const coverHtml = cover ? `
    <section class="cover">
      <h1>${title}</h1>
      <div class="sub">${subtitle || ''}</div>
      <div class="meta">
        n8n M-Pesa Mastery · Course Edition<br/>
        Updated ${new Date().toISOString().slice(0,10)}
      </div>
    </section>` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>${CSS}</style></head><body>${coverHtml}${bodyHtml}</body></html>`;
}

function runChrome(chrome, htmlPath, pdfPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--no-pdf-header-footer',
      `--print-to-pdf=${pdfPath}`,
      `file://${htmlPath}`
    ];
    const p = spawn(chrome, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => (err += d.toString()));
    p.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`chrome exited ${code}\n${err}`)));
  });
}

async function renderDoc(chrome, { src, out, title, subtitle, cover }) {
  const md = await readFile(path.join(DOCS, src), 'utf8');
  const bodyHtml = marked.parse(md);
  const html = wrap({ title, subtitle, bodyHtml, cover });
  const htmlPath = path.join(BUILD, src.replace(/\.md$/, '.html'));
  const pdfPath = path.join(DOCS, out);
  await writeFile(htmlPath, html, 'utf8');
  await runChrome(chrome, htmlPath, pdfPath);
  console.log(`  ✓ ${out}`);
}

const DOCS_TO_BUILD = [
  { src: 'handbook.md',           out: 'handbook.pdf',
    title: 'n8n M-Pesa Mastery',  subtitle: 'Build STK Push Payment Workflows — No Code', cover: true },
  { src: 'daraja-cheatsheet.md',  out: 'daraja-cheatsheet.pdf',
    title: 'Daraja API Cheat Sheet', subtitle: 'One-page reference', cover: true },
  { src: 'go-live-checklist.md',  out: 'go-live-checklist.pdf',
    title: 'Go-Live Checklist',   subtitle: 'M-Pesa STK Push on n8n', cover: true },
  { src: 'course-owner-checklist.md', out: 'course-owner-checklist.pdf',
    title: 'Course Owner Checklist', subtitle: 'Launch, QA, support, and platform-readiness guide', cover: true },
];

async function main() {
  await mkdir(BUILD, { recursive: true });
  const chrome = await findChrome();
  console.log(`Using Chrome: ${chrome}\nRendering PDFs → docs/`);
  for (const doc of DOCS_TO_BUILD) await renderDoc(chrome, doc);
  console.log('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });

