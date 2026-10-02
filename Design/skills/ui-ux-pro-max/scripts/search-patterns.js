#!/usr/bin/env node
/**
 * search-patterns.js
 * Zero-dependency Node.js CLI tool for querying UI/UX design patterns, cheatsheets,
 * component templates, and design tokens within the ui-ux-pro-max skill.
 */

const fs = require('node:fs');
const path = require('node:path');

// Resolve relevant directories
const scriptDir = __dirname;
const skillDir = path.resolve(scriptDir, '..');
let designRootDir = path.resolve(skillDir, '../..');
if (!fs.existsSync(path.join(designRootDir, 'tokens.json'))) {
  const fallbackDesignDir = path.resolve('d:/New folder/Remotion/Design');
  if (fs.existsSync(path.join(fallbackDesignDir, 'tokens.json'))) {
    designRootDir = fallbackDesignDir;
  }
}

const CHEATSHEETS_DIR = path.join(skillDir, 'cheatsheets');
const TEMPLATES_DIR = path.join(skillDir, 'templates');
const SKILL_MD_PATH = path.join(skillDir, 'SKILL.md');
const GUIDELINES_DIR = path.join(designRootDir, 'guidelines');
const TOKENS_JSON_PATH = path.join(designRootDir, 'tokens.json');
const TOKENS_TS_PATH = path.join(designRootDir, 'tokens.ts');

// Predefined tag mappings
const TAG_MAP = {
  state: ['flow-states.md', 'empty-state-card.tsx', 'skeleton-card.tsx'],
  states: ['flow-states.md', 'empty-state-card.tsx', 'skeleton-card.tsx'],
  mobile: ['mobile-ergonomics.md', 'mobile-drawer-sheet.tsx', 'sticky-bottom-bar.tsx', 'touch-targets.md'],
  ergonomics: ['mobile-ergonomics.md', 'touch-targets.md', 'sticky-bottom-bar.tsx'],
  touch: ['touch-targets.md', 'mobile-ergonomics.md', 'sticky-bottom-bar.tsx'],
  palette: ['luxury-palettes.md', 'tokens.json', 'tokens.ts'],
  color: ['luxury-palettes.md', 'tokens.json', 'tokens.ts'],
  contrast: ['luxury-palettes.md', 'tokens.ts', 'color-contrast.md'],
  template: ['mobile-drawer-sheet.tsx', 'empty-state-card.tsx', 'skeleton-card.tsx', 'wizard-stepper.tsx', 'sticky-bottom-bar.tsx'],
  wizard: ['wizard-stepper.tsx', 'flow-states.md'],
  drawer: ['mobile-drawer-sheet.tsx', 'mobile-ergonomics.md'],
  token: ['tokens.json', 'tokens.ts', 'luxury-palettes.md'],
};

function printHelp() {
  console.log(`
UI/UX Pro Max Pattern & Token Search Tool
=========================================
Usage:
  node search-patterns.js [options] <query>

Options:
  -q, --query <str>   Search term or keyword
  -t, --tag <tag>     Filter results by tag (e.g., state, mobile, ergonomics, palette, template, token)
  -l, --list          List all available cheatsheets, templates, and indexed documents
  -h, --help          Show this help reference

Examples:
  node search-patterns.js "safe-area"
  node search-patterns.js --tag state
  node search-patterns.js --tag palette "contrast"
  node search-patterns.js --list
`);
}

function getIndexedFiles() {
  const files = [];

  // SKILL.md
  if (fs.existsSync(SKILL_MD_PATH)) {
    files.push({ path: SKILL_MD_PATH, category: 'Skill Definition', name: 'SKILL.md' });
  }

  // Cheatsheets
  if (fs.existsSync(CHEATSHEETS_DIR)) {
    for (const f of fs.readdirSync(CHEATSHEETS_DIR)) {
      if (f.endsWith('.md')) {
        files.push({
          path: path.join(CHEATSHEETS_DIR, f),
          category: 'Cheatsheet',
          name: f,
        });
      }
    }
  }

  // Templates
  if (fs.existsSync(TEMPLATES_DIR)) {
    for (const f of fs.readdirSync(TEMPLATES_DIR)) {
      if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        files.push({
          path: path.join(TEMPLATES_DIR, f),
          category: 'Component Template',
          name: f,
        });
      }
    }
  }

  // Tokens
  if (fs.existsSync(TOKENS_JSON_PATH)) {
    files.push({ path: TOKENS_JSON_PATH, category: 'Design Tokens', name: 'tokens.json' });
  }
  if (fs.existsSync(TOKENS_TS_PATH)) {
    files.push({ path: TOKENS_TS_PATH, category: 'Design Tokens', name: 'tokens.ts' });
  }

  // Guidelines (if present)
  if (fs.existsSync(GUIDELINES_DIR)) {
    for (const f of fs.readdirSync(GUIDELINES_DIR)) {
      if (f.endsWith('.md')) {
        files.push({
          path: path.join(GUIDELINES_DIR, f),
          category: 'Codex Guideline',
          name: f,
        });
      }
    }
  }

  return files;
}

function listInventory() {
  const files = getIndexedFiles();
  console.log('\nIndexed Design System & Skill Artifacts:');
  console.log('========================================');
  
  const grouped = {};
  for (const item of files) {
    grouped[item.category] = grouped[item.category] || [];
    grouped[item.category].push(item.name);
  }

  for (const [cat, items] of Object.entries(grouped)) {
    console.log(`\n[${cat}] (${items.length}):`);
    for (const name of items) {
      console.log(`  - ${name}`);
    }
  }

  console.log('\nSupported Tags for Filter:');
  console.log('  ' + Object.keys(TAG_MAP).join(', '));
  console.log('');
}

function searchFiles(query, tag) {
  const allFiles = getIndexedFiles();
  let candidateFiles = allFiles;

  if (tag) {
    const normalizedTag = tag.toLowerCase().trim();
    const allowedNames = TAG_MAP[normalizedTag];
    if (allowedNames) {
      candidateFiles = allFiles.filter(f => allowedNames.includes(f.name));
    } else {
      candidateFiles = allFiles.filter(f => f.name.toLowerCase().includes(normalizedTag));
    }
  }

  if (!query && !tag) {
    printHelp();
    return;
  }

  const queryLower = query ? query.toLowerCase().trim() : '';
  const results = [];

  for (const file of candidateFiles) {
    try {
      const content = fs.readFileSync(file.path, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        if (!queryLower || line.toLowerCase().includes(queryLower)) {
          results.push({
            file: file.name,
            category: file.category,
            fullPath: file.path,
            lineNumber: idx + 1,
            lineText: line.trim(),
          });
        }
      });
    } catch {
      // Continue on file read error
    }
  }

  console.log(`\nSearch Results for ${query ? `"${query}"` : ''} ${tag ? `[tag: ${tag}]` : ''} (${results.length} matches):`);
  console.log('--------------------------------------------------------------------------------');

  if (results.length === 0) {
    console.log('  No matching patterns found. Try a broader search term or run with --list.');
    return;
  }

  // Display top 25 matches with truncation
  const displayResults = results.slice(0, 25);
  for (const res of displayResults) {
    console.log(`[${res.category}] ${res.file}:${res.lineNumber}`);
    console.log(`   ${res.lineText.slice(0, 120)}`);
  }

  if (results.length > 25) {
    console.log(`\n  ... and ${results.length - 25} more matches. Use a more specific query.`);
  }
  console.log('');
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printHelp();
    return;
  }

  if (args.includes('-l') || args.includes('--list')) {
    listInventory();
    return;
  }

  let query = '';
  let tag = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-q' || arg === '--query') {
      query = args[++i] || '';
    } else if (arg === '-t' || arg === '--tag') {
      tag = args[++i] || '';
    } else if (!arg.startsWith('-')) {
      query = query ? `${query} ${arg}` : arg;
    }
  }

  searchFiles(query, tag);
}

if (require.main === module) {
  main();
}

module.exports = {
  getIndexedFiles,
  searchFiles,
  TAG_MAP,
};
