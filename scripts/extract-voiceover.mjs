#!/usr/bin/env node
/**
 * Extract [VO] narration blocks from lesson scripts into clean .txt files
 * ready to paste into ElevenLabs / Murf / your TTS tool.
 *
 * - Keeps only text inside [VO] ... (ends at next [TAG] or blockquote block end)
 * - Converts [PAUSE Ns] to <break time="Ns" /> (ElevenLabs SSML)
 * - Strips markdown blockquote markers (> )
 * - Splits per lesson (## Lesson X.Y heading)
 *
 * Output: docs/scripts/voiceover/<module>/<lesson>.txt
 *
 * Usage: node scripts/extract-voiceover.mjs
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '..', 'docs', 'scripts');
const OUT = path.join(SRC, 'voiceover');

function slugify(s) {
  return s.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

/**
 * Walk the markdown line by line. State machine:
 *  - "idle": looking for the next lesson header or [VO] marker
 *  - "lesson": inside a lesson; also looking for [VO]
 *  - "vo": inside a [VO] block, accumulating lines until a non-blockquote, non-pause line
 */
function parseScript(md) {
  const lines = md.split(/\r?\n/);
  const lessons = []; // { title, blocks: [string] }
  let currentLesson = null;
  let inVo = false;
  let voBuffer = [];

  const flushVo = () => {
    if (!voBuffer.length || !currentLesson) { voBuffer = []; inVo = false; return; }
    const text = voBuffer.join(' ')
      .replace(/\s+/g, ' ')
      .replace(/\[PAUSE\s+([\d.]+)s\]/gi, '<break time="$1s" />')
      .trim();
    if (text) currentLesson.blocks.push(text);
    voBuffer = [];
    inVo = false;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Lesson header. Accepts either em-dash or colon separator between number and title.
    //   "## Lesson 1.1 — Title *(5 min)*"
    //   "## Lesson 1.1 : Title *(5 min)*"
    const h = line.match(/^##\s+Lesson\s+([\d.]+)\s*[—:\-]\s*(.+?)\s*\*\(([^)]+)\)\*/i);
    if (h) {
      flushVo();
      currentLesson = {
        id: h[1],
        title: h[2].trim(),
        runtime: h[3].trim(),
        blocks: []
      };
      lessons.push(currentLesson);
      continue;
    }

    // Any new [TAG] (plain, blockquoted, or as a markdown heading) closes an open [VO] block.
    // Examples matched: "[VO]", "### [VO]", "> [SCREEN]", "### [SCREEN] 0:00–0:15"
    const tag = line.match(/^\s*(?:#{1,6}\s+)?(?:>\s*)?\[([A-Z][A-Z \-]*?)\](?:\s.*)?\s*$/);
    if (tag) {
      flushVo();
      if (/^VO$/i.test(tag[1].trim())) inVo = true;
      continue;
    }

    // Also close [VO] if we hit a markdown heading that's NOT a tag, or a horizontal rule
    if (/^#{1,6}\s+(?!\[)/.test(line) || /^---+$/.test(line)) {
      flushVo();
      continue;
    }

    if (!inVo) continue;

    // Blockquote line inside VO — strip the "> " marker
    const stripped = line.replace(/^\s*>\s?/, '').trim();
    if (!stripped) {
      // Blank line inside VO: paragraph break (double newline for TTS pacing)
      voBuffer.push('\n\n');
      continue;
    }
    voBuffer.push(stripped);
  }
  flushVo();
  return lessons;
}

async function main() {
  const files = (await readdir(SRC)).filter(f => /^module-\d+-.*\.md$/.test(f)).sort();
  if (!files.length) {
    console.error('No module-*.md files found in docs/scripts/');
    process.exit(1);
  }

  let totalLessons = 0, totalWords = 0;

  for (const file of files) {
    const md = await readFile(path.join(SRC, file), 'utf8');
    const moduleSlug = file.replace(/\.md$/, '');
    const lessons = parseScript(md);

    if (!lessons.length) { console.warn(`  (skipped — no lessons parsed) ${file}`); continue; }

    const dir = path.join(OUT, moduleSlug);
    await mkdir(dir, { recursive: true });

    for (const lesson of lessons) {
      const text = lesson.blocks.join('\n\n').trim() + '\n';
      const words = text.split(/\s+/).filter(w => !/^<break/i.test(w)).length;
      const outFile = path.join(dir, `lesson-${lesson.id}-${slugify(lesson.title)}.txt`);
      const header = `# Lesson ${lesson.id} : ${lesson.title}\n# Target runtime: ${lesson.runtime}\n# Word count: ~${words}\n# Paste the lines below into ElevenLabs / Murf.\n# <break time="Ns" /> tags are ElevenLabs SSML.\n\n`;
      await writeFile(outFile, header + text, 'utf8');
      totalLessons++;
      totalWords += words;
      console.log(`  ✓ ${path.relative(SRC, outFile)}  (${words} words, ~${(words/150).toFixed(1)} min)`);
    }
  }

  console.log(`\n${totalLessons} lessons, ${totalWords} total words, ~${(totalWords/150).toFixed(0)} min of narration.`);
}

main().catch(e => { console.error(e); process.exit(1); });

