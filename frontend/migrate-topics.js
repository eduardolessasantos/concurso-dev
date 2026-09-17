const fs = require('fs');
const path = require('path');

const vanillaDir = path.join('c:', 'projetos', 'Concurso DataPrev', 'dataprev-estudos', 'vanilla', 'js', 'data');
const files = fs.readdirSync(vanillaDir).filter(f => f.startsWith('topicDetail-'));
let allData = {};

files.forEach(f => {
  const content = fs.readFileSync(path.join(vanillaDir, f), 'utf-8');
  const match = content.match(/window\.topicDetail\w+\s*=\s*(\[[\s\S]*?\]);?/);
  if (match) {
    const key = f.replace('topicDetail-', '').replace('.js', '');
    allData[key] = match[1];
  } else {
    console.log('No match for', f);
  }
});

let output = 'import { TopicDetail } from \'../models/topic-detail.model\';\n\n';
output += 'export const TOPICS_DATA: Record<string, TopicDetail[]> = {\n';
for (const [key, value] of Object.entries(allData)) {
  output += `  '${key}': ${value},\n`;
}
output += '};\n';

fs.writeFileSync(path.join('c:', 'projetos', 'Concurso DataPrev', 'dataprev-estudos', 'angular-app', 'src', 'app', 'services', 'topics.data.ts'), output);
console.log('Done!');
