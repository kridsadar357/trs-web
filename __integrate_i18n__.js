const fs = require('fs');
const path = require('path');
const root = 'c:/TRS/Web';
const src = path.join(root, 'src');

// Find the entry point
const possibleEntries = [
  'src/main.tsx', 'src/main.jsx', 'src/index.tsx', 'src/index.jsx',
  'src/App.tsx', 'src/App.jsx', 'src/App.vue',
  'src/app/layout.tsx', 'src/app/layout.jsx',
  'pages/_app.tsx', 'pages/_app.jsx',
  'src/pages/_app.tsx', 'src/pages/_app.jsx',
];

let entryFile = null;
let entryContent = null;

for (const p of possibleEntries) {
  const fullPath = path.join(root, p);
  if (fs.existsSync(fullPath)) {
    entryFile = p;
    entryContent = fs.readFileSync(fullPath, 'utf8');
    break;
  }
}

// Find the main app/layout file
const possibleApps = [
  'src/App.tsx', 'src/App.jsx', 'src/App.vue',
  'src/app/layout.tsx', 'src/app/layout.jsx',
  'src/app/page.tsx', 'src/app/page.jsx',
  'src/pages/index.tsx', 'src/pages/index.jsx',
];

let appFile = null;
let appContent = null;

for (const p of possibleApps) {
  const fullPath = path.join(root, p);
  if (fs.existsSync(fullPath)) {
    appFile = p;
    appContent = fs.readFileSync(fullPath, 'utf8');
    break;
  }
}

// Find header/navbar component
function findFile(dir, patterns) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const result = findFile(fullPath, patterns);
        if (result) return result;
      } else {
        for (const pattern of patterns) {
          if (entry.name.toLowerCase().includes(pattern.toLowerCase())) {
            return fullPath;
          }
        }
      }
    }
  } catch (e) {}
  return null;
}

const headerFile = findFile(src, ['header', 'navbar', 'nav', 'toolbar', 'topbar', 'layout']);

const result = {
  entryFile,
  entryContent,
  appFile,
  appContent,
  headerFile,
  headerContent: headerFile ? fs.readFileSync(headerFile, 'utf8') : null,
};

// Auto-integrate: patch entry file to import i18n
if (entryFile && entryContent) {
  const i18nImport = "import './i18n';";
  if (!entryContent.includes("import './i18n'") && !entryContent.includes('import "./i18n"')) {
    const newContent = i18nImport + '\n' + entryContent;
    fs.writeFileSync(path.join(root, entryFile), newContent, 'utf8');
    result.entryPatched = true;
    result.entryPatchedFile = entryFile;
  } else {
    result.entryPatched = false;
    result.entryPatchedReason = 'i18n import already present';
  }
}

// Auto-integrate: patch header/navbar to include LanguageSwitcher
if (headerFile) {
  const headerContent = fs.readFileSync(headerFile, 'utf8');
  const lsImport = "import LanguageSwitcher from './LanguageSwitcher';";

  if (!headerContent.includes('LanguageSwitcher')) {
    // Add import
    let patched = headerContent;
    const lastImportIndex = patched.lastIndexOf('import ');
    const endOfLastImport = patched.indexOf('\n', lastImportIndex);
    patched = patched.slice(0, endOfLastImport + 1) + lsImport + '\n' + patched.slice(endOfLastImport + 1);

    // Add component before closing </nav>, </header>, </div> etc.
    const tags = ['</nav>', '</header>', '</Toolbar>', '</AppBar>'];
    let inserted = false;
    for (const tag of tags) {
      const idx = patched.lastIndexOf(tag);
      if (idx !== -1) {
        patched = patched.slice(0, idx) + '        <LanguageSwitcher />\n      ' + patched.slice(idx);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      // Try to insert before the last closing </div> in the return
      const returnIdx = patched.indexOf('return');
      if (returnIdx !== -1) {
        const afterReturn = patched.slice(returnIdx);
        const lastDiv = afterReturn.lastIndexOf('</div>');
        if (lastDiv !== -1) {
          const globalIdx = returnIdx + lastDiv;
          patched = patched.slice(0, globalIdx) + '        <LanguageSwitcher />\n' + patched.slice(globalIdx);
          inserted = true;
        }
      }
    }

    if (inserted) {
      fs.writeFileSync(headerFile, patched, 'utf8');
      result.headerPatched = true;
      result.headerPatchedFile = path.relative(root, headerFile);
    } else {
      result.headerPatched = false;
      result.headerPatchedReason = 'Could not find insertion point';
    }
  } else {
    result.headerPatched = false;
    result.headerPatchedReason = 'LanguageSwitcher already present';
  }
} else {
  result.headerPatched = false;
  result.headerPatchedReason = 'No header/navbar file found';
}

// Write integration report
const report = [
  '=== INTEGRATION REPORT ===',
  '',
  'Entry file: ' + (entryFile || 'NOT FOUND'),
  'App file: ' + (appFile || 'NOT FOUND'),
  'Header/Nav file: ' + (headerFile ? path.relative(root, headerFile) : 'NOT FOUND'),
  '',
  'Entry patched: ' + (result.entryPatched ? 'YES - added i18n import to ' + entryFile : (result.entryPatchedReason || 'NO')),
  'Header patched: ' + (result.headerPatched ? 'YES - added LanguageSwitcher to ' + result.headerPatchedFile : (result.headerPatchedReason || 'NO')),
  '',
  '=== MANUAL STEPS ===',
];

if (!entryFile) {
  report.push('', 'Could not find entry file. Please add this line at the top of your main entry file (main.tsx or index.tsx):', "  import './i18n';");
}
if (!headerFile) {
  report.push('', 'Could not find header/navbar. Please add <LanguageSwitcher /> to your header or layout component:', "  import LanguageSwitcher from './components/LanguageSwitcher';", '  <LanguageSwitcher />');
}

fs.writeFileSync(path.join(root, '__integration_report__.txt'), report.join('\n'), 'utf8');

// Also write as JSON for programmatic reading
fs.writeFileSync(path.join(root, '__integration_result__.json'), JSON.stringify(result, null, 2), 'utf8');
