// Builds the installable web app into dist/ (run: npm run build:web).
// 1) expo export for web  2) add the PWA tags (manifest, icons, service worker) to index.html.
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

execSync('npx expo export --platform web --output-dir dist', { stdio: 'inherit' });

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
