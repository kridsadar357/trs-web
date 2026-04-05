const fs = require('fs');
const path = require('path');

const root = 'c:/TRS/Web';
const srcRoot = path.join(root, 'src');

function listFiles(dir, prefix = '') {
  let result = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        result.push(prefix + entry.name + '/');
        result = result.concat(listFiles(fullPath, prefix + '  '));
      } else {
        result.push(prefix + entry.name);
      }
    }
  } catch (e) {
    result.push(prefix + 'ERROR: ' + e.message);
  }
  return result;
}

const output = [];

output.push('=== ROOT FILES ===');
output.push(...listFiles(root).filter(f => !f.includes('/')));

output.push('\n=== SRC STRUCTURE ===');
try {
  output.push(...listFiles(srcRoot));
} catch (e) {
  output.push('No src directory: ' + e.message);
}

output.push('\n=== package.json ===');
try {
  output.push(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
} catch (e) {
  output.push('ERROR: ' + e.message);
}

output.push('\n=== src/main.tsx ===');
try {
  output.push(fs.readFileSync(path.join(root, 'src/main.tsx'), 'utf8'));
} catch (e) {
  output.push('Not found: ' + e.message);
}

output.push('\n=== src/main.jsx ===');
try {
  output.push(fs.readFileSync(path.join(root, 'src/main.jsx'), 'utf8'));
} catch (e) {
  output.push('Not found: ' + e.message);
}

output.push('\n=== src/App.tsx ===');
try {
  output.push(fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8'));
} catch (e) {
  output.push('Not found: ' + e.message);
}

output.push('\n=== src/App.jsx ===');
try {
  output.push(fs.readFileSync(path.join(root, 'src/App.jsx'), 'utf8'));
} catch (e) {
  output.push('Not found: ' + e.message);
}

output.push('\n=== src/App.vue ===');
try {
  output.push(fs.readFileSync(path.join(root, 'src/App.vue'), 'utf8'));
} catch (e) {
  output.push('Not found: ' + e.message);
}

output.push('\n=== NEXT.JS CHECK ===');
try {
  output.push(fs.readFileSync(path.join(root, 'next.config.js'), 'utf8'));
} catch (e) {
  output.push('No next.config.js');
}
try {
  output.push(fs.readFileSync(path.join(root, 'next.config.mjs'), 'utf8'));
} catch (e) {
  output.push('No next.config.mjs');
}

output.push('\n=== VITE CHECK ===');
try {
  output.push(fs.readFileSync(path.join(root, 'vite.config.ts'), 'utf8'));
} catch (e) {
  output.push('No vite.config.ts');
}
try {
  output.push(fs.readFileSync(path.join(root, 'vite.config.js'), 'utf8'));
} catch (e) {
  output.push('No vite.config.js');
}

fs.writeFileSync(path.join(root, '__project_scan__.txt'), output.join('\n'));
console.log('SCAN COMPLETE - wrote __project_scan__.txt');
