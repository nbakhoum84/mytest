// Builds the installable web app into dist/ (run: npm run build:web).
// 1) expo export for web  2) add the PWA tags (manifest, icons, service worker) to index.html.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

execSync('npx expo export --platform web --output-dir dist', { stdio: 'inherit' });

// Rewrite the JavaScript into an older syntax (ES2017) so older iPhones (Safari) can run it.
// Without this, newer syntax in the bundle leaves a blank white page on older iOS versions.
const esbuild = require('esbuild');
const jsDir = path.join('dist', '_expo', 'static', 'js', 'web');
for (const name of fs.readdirSync(jsDir).filter((n) => n.endsWith('.js'))) {
  const p = path.join(jsDir, name);
  const out = esbuild.transformSync(fs.readFileSync(p, 'utf8'), { target: 'es2017', minify: true, legalComments: 'none' });
  fs.writeFileSync(p, out.code);
  console.log('Transpiled to ES2017:', name, Math.round(out.code.length / 1024) + ' KB');
}

const file = path.join('dist', 'index.html');
let html = fs.readFileSync(file, 'utf8');
const themeColor = html.includes('name="theme-color"') ? '' : '<meta name="theme-color" content="#14213d">\n';
const tags = `
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
${themeColor}<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Home-Nader">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
`;
const sw = `<script>if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})})}</script>`;
html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>Home-Nader</title>');
if (!html.includes('rel="manifest"')) html = html.replace('</head>', tags + '</head>');
if (!html.includes('serviceWorker')) html = html.replace('</body>', sw + '</body>');
fs.writeFileSync(file, html);
console.log('PWA tags added to dist/index.html');
