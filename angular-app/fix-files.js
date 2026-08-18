const fs = require('fs');

// Fix styles.scss
let styles = fs.readFileSync('src/styles.scss', 'utf8');
const badStart = styles.indexOf('\0.\0 \0c\0');
if (badStart !== -1) {
  styles = styles.substring(0, badStart);
}
const newStyles = `
.category-section { margin-bottom: 40px; }
.category-title { font-size: 14px; font-weight: 700; color: var(--muted); margin-bottom: 15px; letter-spacing: 0.05em; text-transform: uppercase; }
.topics-list { max-height: 250px; overflow-y: auto; padding-right: 8px; }
.topics-list::-webkit-scrollbar { width: 6px; }
.topics-list::-webkit-scrollbar-track { background: var(--surface); }
.topics-list::-webkit-scrollbar-thumb { background: var(--line); border-radius: 4px; }
.topics-list::-webkit-scrollbar-thumb:hover { background: var(--muted); }
`;
fs.writeFileSync('src/styles.scss', styles.trim() + '\n' + newStyles);

// Fix topics.data.ts
let topics = fs.readFileSync('src/app/services/topics.data.ts', 'utf8');
// Fix missing trailing brackets or commas
topics = topics.replace(/,\n};/g, '\n};\n');
topics = topics.replace(/\]\n\s*\]/g, ']');
// At the end of the file, check if it ends properly
if (!topics.trim().endsWith('};')) {
  // Try to repair the syntax
  if (topics.trim().endsWith(';')) {
    topics = topics.trim().slice(0, -1) + '\n};\n';
  } else {
    topics = topics.trim() + '\n};\n';
  }
}
fs.writeFileSync('src/app/services/topics.data.ts', topics);
console.log('Fixed files');
