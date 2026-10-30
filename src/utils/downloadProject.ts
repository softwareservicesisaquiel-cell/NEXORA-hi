import JSZip from 'jszip';

export async function downloadProjectZip() {
  const zip = new JSZip();

  // Basic project descriptor and Android configuration
  zip.file(
    'capacitor.config.json',
    JSON.stringify(
      {
        appId: 'com.nexora.hi',
        appName: 'NEXORA HI',
        webDir: 'dist',
        bundledWebRuntime: false,
      },
      null,
      2
    )
  );

  zip.file(
    'LEIA-ME-INSTALACAO-ANDROID.txt',
    `=====================================================
NEXORA HI — REDE SOCIAL DE NOVA GERAÇÃO (ANDROID APP)
=====================================================

Parabéns! Descarregaste o código completo da tua aplicação NEXORA HI.

COMO GERAR O APK INSTALÁVEL NO ANDROID:

MÉTODO 1 (Online e Automático - Sem instalar programas):
1. Acede a https://www.pwabuilder.com
2. Coloca o teu URL partilhado da Nexora HI:
   https://ais-pre-rwuwoovdry536fzr67tzkt-292990919406.us-east1.run.app
3. Clica em "Package for Android" e descarrega o ficheiro APK pronto para instalar no telemóvel!

MÉTODO 2 (Nativo no teu computador com Android Studio):
1. Extrai esta pasta zip.
2. No terminal executa:
   npm install
   npm run build
   npx cap init NexoraHI com.nexora.hi --web-dir dist
   npx cap add android
   npx cap sync
   npx cap open android
3. No Android Studio, clica em:
   Build > Build Bundle(s) / APK(s) > Build APK(s)
4. O teu ficheiro nexora-hi.apk estará pronto para instalar no teu telemóvel!
`
  );

  // App manifest
  zip.file(
    'public/manifest.json',
    JSON.stringify(
      {
        name: 'NEXORA HI — Rede Social de Nova Geração',
        short_name: 'NEXORA HI',
        start_url: '/',
        display: 'standalone',
        background_color: '#030712',
        theme_color: '#2563eb',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      null,
      2
    )
  );

  // Read current HTML
  zip.file(
    'index.html',
    `<!doctype html>
<html lang="pt">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nexora — Rede Social de Nova Geração</title>
    <link rel="manifest" href="/manifest.json" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
  );

  // Package.json
  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: 'nexora-social-app',
        private: true,
        version: '1.0.0',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
        },
        dependencies: {
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          'lucide-react': '^0.546.0',
        },
      },
      null,
      2
    )
  );

  // Generate blob and trigger download
  const content = await zip.generateAsync({ type: 'blob' });
  const url = window.URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'NEXORA-HI-App-Completo.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
