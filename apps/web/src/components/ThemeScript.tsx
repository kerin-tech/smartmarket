// src/components/ThemeScript.tsx

// Este componente inyecta un script que se ejecuta ANTES del render
// para prevenir el flash de tema incorrecto

export function ThemeScript() {
  const script = `
    (function() {
      const STORAGE_KEY = 'smartmarket-theme';
      const theme = localStorage.getItem(STORAGE_KEY) || 'system';
      const resolved = theme === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;
      document.documentElement.classList.add(resolved);
      
      // Actualizar meta theme-color
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', resolved === 'dark' ? '#0f172a' : '#f9fafb');
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}