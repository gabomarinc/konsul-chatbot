const { cpSync, mkdirSync, existsSync } = require('fs');
const { resolve, dirname } = require('path');

const rootDir = process.cwd();
const distDir = resolve(rootDir, 'dist');

const copies = [
  { src: 'src', dest: 'src', recursive: true },
  { src: 'login.html', dest: 'login.html' },
  { src: 'styles.css', dest: 'styles.css' },
  { src: 'logo.png', dest: 'logo.png' }
];

function ensureDir(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

copies.forEach(({ src, dest, recursive }) => {
  const sourcePath = resolve(rootDir, src);
  const destinationPath = resolve(distDir, dest);

  if (!existsSync(sourcePath)) {
    console.warn(`[postbuild] Fuente no encontrada: ${src}, se omite.`);
    return;
  }

  ensureDir(destinationPath);
  cpSync(sourcePath, destinationPath, { recursive: Boolean(recursive) });
  console.log(`[postbuild] Copiado ${src} -> dist/${dest}`);
});


