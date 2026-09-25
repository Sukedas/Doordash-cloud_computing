// Builds the delivery reports:
//   1. Renders every Graphviz source (diagrams/*.dot) to SVG.
//   2. Converts the Markdown report (src/*.md) to a styled HTML page.
//   3. Prints the HTML to PDF with a headless Chromium-based browser (Edge or Chrome).
//
// Usage:  cd tools && npm install && npm run build [-- delivery_1|delivery_2]

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { instance } from "@viz-js/viz";
import { Marked } from "marked";
import puppeteer from "puppeteer-core";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const DOCS = {
  delivery_1: {
    src: "Delivery_1/src/group2_delivery1.md",
    out: "Delivery_1/group2_delivery1.pdf",
    diagrams: "Delivery_1/diagrams",
    footer: "Team 2 · DoorDash · Delivery 1 — Requirements & Workload Model",
  },
  delivery_2: {
    src: "Delivery_2/src/group2_delivery2.md",
    out: "Delivery_2/group2_delivery2.pdf",
    diagrams: "Delivery_2/diagrams",
    footer: "Team 2 · DoorDash · Delivery 2 — Software Architecture",
  },
};

const BROWSERS = [
  process.env.CHROME_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

async function renderDiagrams(viz, dir) {
  const abs = join(root, dir);
  if (!existsSync(abs)) return;
  for (const file of readdirSync(abs).filter((f) => f.endsWith(".dot"))) {
    const svg = viz.renderString(readFileSync(join(abs, file), "utf8"), { format: "svg", engine: "dot" });
    writeFileSync(join(abs, file.replace(/\.dot$/, ".svg")), svg);
    console.log(`  diagram  ${dir}/${file} -> .svg`);
  }
}

function slug(text) {
  return text.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function markdownToHtml(md) {
  const headings = [];
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const id = slug(text);
        if (depth === 2 || depth === 3) headings.push({ depth, text, id });
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },
      image({ href, text }) {
        return `<figure><img src="${href}" alt="${text}"><figcaption>${text}</figcaption></figure>`;
      },
    },
  });
  let html = marked.parse(md);
  // Unwrap figures that marked placed inside paragraphs.
  html = html.replace(/<p>\s*(<figure>[\s\S]*?<\/figure>)\s*<\/p>/g, "$1");
  const toc = headings
    .map((h) => `<li class="toc-${h.depth}"><a href="#${h.id}">${h.text}</a></li>`)
    .join("\n");
  return html.replace("<!-- TOC -->", `<nav class="toc"><h2 class="toc-title">Table of Contents</h2><ul>${toc}</ul></nav>`);
}

async function build(key, viz, browser) {
  const doc = DOCS[key];
  console.log(`\n${key}`);
  await renderDiagrams(viz, doc.diagrams);
  const srcPath = join(root, doc.src);
  const css = readFileSync(join(here, "report.css"), "utf8");
  const body = markdownToHtml(readFileSync(srcPath, "utf8"));
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${basename(doc.out, ".pdf")}</title><style>${css}</style></head><body>${body}</body></html>`;
  const htmlPath = srcPath.replace(/\.md$/, ".html");
  writeFileSync(htmlPath, html);

  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0" });
  await page.pdf({
    path: join(root, doc.out),
    format: "Letter",
    printBackground: true,
    margin: { top: "0.8in", bottom: "0.8in", left: "0.85in", right: "0.85in" },
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: `<div style="font-size:8px;color:#666;width:100%;padding:0 0.85in;display:flex;justify-content:space-between;font-family:Segoe UI,Arial,sans-serif"><span>${doc.footer}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  });
  await page.close();
  console.log(`  pdf      ${doc.out}`);
}

const targets = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(DOCS);
const executablePath = BROWSERS.find((p) => existsSync(p));
if (!executablePath) throw new Error("No Chromium-based browser found; set CHROME_PATH.");
const viz = await instance();
const browser = await puppeteer.launch({ executablePath, headless: true });
try {
  for (const t of targets) await build(t, viz, browser);
} finally {
  await browser.close();
}
