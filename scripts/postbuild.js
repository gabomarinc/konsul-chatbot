const { cpSync, mkdirSync, existsSync, readFileSync, writeFileSync } = require('fs');
const { resolve, dirname } = require('path');

const rootDir = process.cwd();
const distDir = resolve(rootDir, 'dist');

const copies = [
  { src: 'src', dest: 'src', recursive: true },
  { src: 'login.html', dest: 'login.html' },
  { src: 'styles.css', dest: 'styles.css' },
  { src: 'styles-emotional.css', dest: 'styles-emotional.css' },
  { src: 'styles-emotional-login.css', dest: 'styles-emotional-login.css' },
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

// Inyectar variable de entorno AIRTABLE_API_KEY en los archivos HTML
const airtableApiKey = process.env.AIRTABLE_API_KEY;

function injectAirtableKey(htmlPath, fileName) {
  if (!existsSync(htmlPath)) {
    console.warn(`[postbuild] ⚠️ Archivo ${fileName} no encontrado`);
    return;
  }

  if (!airtableApiKey) {
    console.warn(`[postbuild] ⚠️ Variable de entorno AIRTABLE_API_KEY no está configurada para ${fileName}`);
    return;
  }

  let html = readFileSync(htmlPath, 'utf8');
  
  // Buscar donde se carga airtable.config.js o airtable.init.js y agregar el script de configuración antes
  const insertionPoint = html.indexOf('src/config/airtable.config.js') !== -1 
    ? html.indexOf('src/config/airtable.config.js')
    : html.indexOf('src/config/airtable.init.js');
  
  if (insertionPoint !== -1) {
    const configScript = `    <script>
        // Configuración de Airtable desde variable de entorno
        window.AIRTABLE_API_KEY = '${airtableApiKey}';
    </script>
`;
    
    // Encontrar el inicio de la línea del script
    const lineStart = html.lastIndexOf('    <script', insertionPoint);
    if (lineStart !== -1) {
      html = html.slice(0, lineStart) + configScript + html.slice(lineStart);
      
      writeFileSync(htmlPath, html, 'utf8');
      console.log(`[postbuild] ✅ Variable AIRTABLE_API_KEY inyectada en ${fileName}`);
    } else {
      console.warn(`[postbuild] ⚠️ No se encontró el punto de inserción para AIRTABLE_API_KEY en ${fileName}`);
    }
  } else {
    console.warn(`[postbuild] ⚠️ No se encontró airtable.config.js ni airtable.init.js en ${fileName}`);
  }
}

// Inyectar en index.html
injectAirtableKey(resolve(distDir, 'index.html'), 'index.html');

// Inyectar en login.html
injectAirtableKey(resolve(distDir, 'login.html'), 'login.html');

if (!airtableApiKey) {
  console.warn('[postbuild] ⚠️ Variable de entorno AIRTABLE_API_KEY no está configurada');
  console.warn('[postbuild] 💡 La aplicación usará modo mock hasta que se configure la variable');
}


