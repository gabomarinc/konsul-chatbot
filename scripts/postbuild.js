const { cpSync, mkdirSync, existsSync, readFileSync, writeFileSync } = require('fs');
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

// Inyectar variable de entorno AIRTABLE_API_KEY en el HTML
const indexHtmlPath = resolve(distDir, 'index.html');
if (existsSync(indexHtmlPath)) {
  const airtableApiKey = process.env.AIRTABLE_API_KEY;
  
  if (airtableApiKey) {
    let html = readFileSync(indexHtmlPath, 'utf8');
    
    // Buscar donde se carga airtable.config.js y agregar el script de configuración antes
    const configScript = `    <script>
        // Configuración de Airtable desde variable de entorno
        window.AIRTABLE_API_KEY = '${airtableApiKey}';
    </script>
`;
    
    // Insertar antes de airtable.config.js
    const insertionPoint = html.indexOf('src/config/airtable.config.js');
    if (insertionPoint !== -1) {
      // Encontrar el inicio de la línea del script
      const lineStart = html.lastIndexOf('    <script', insertionPoint);
      html = html.slice(0, lineStart) + configScript + html.slice(lineStart);
      
      writeFileSync(indexHtmlPath, html, 'utf8');
      console.log('[postbuild] ✅ Variable AIRTABLE_API_KEY inyectada en index.html');
    } else {
      console.warn('[postbuild] ⚠️ No se encontró el punto de inserción para AIRTABLE_API_KEY');
    }
  } else {
    console.warn('[postbuild] ⚠️ Variable de entorno AIRTABLE_API_KEY no está configurada');
    console.warn('[postbuild] 💡 La aplicación usará modo mock hasta que se configure la variable');
  }
}


