Aquí tienes el README.md con el formato corregido, limpio y listo para copiar. He ajustado la jerarquía de los títulos y las listas para que se rendericen correctamente en GitHub.

🛒 SmartMarket - Sistema de Gestión de Inventario Personal
SmartMarket es una plataforma web moderna diseñada para la gestión eficiente de productos, comparación de precios y listas de compras. Construida con un enfoque en UX/UI intuitiva y un Design System robusto, permite a los usuarios mantener un control total sobre sus productos y locales favoritos.

🚀 Tecnologías Principales
Framework: Next.js 14+ (App Router)

Lenguaje: TypeScript

Estilos: Tailwind CSS

Iconografía: Lucide React

Validación de Formularios: React Hook Form + Zod

Animaciones: Tailwind Animate & Framer Motion (opcional)

📁 Estructura del Proyecto
El proyecto sigue una arquitectura de carpetas organizada por funcionalidades y componentes reutilizables:

Plaintext
src/
├── app/                  # Rutas y Layouts (Next.js App Router)
│   ├── (auth)/           # Rutas de autenticación (Login/Registro)
│   └── (dashboard)/      # Rutas principales del sistema
│       ├── layout.tsx    # Layout con Header y Sidebar global
│       ├── products/     # Gestión de productos
│       │   ├── page.tsx  # Listado y filtros
│       │   └── new/      # Página de creación (FE-04)
│       └── dashboard/    # Vista principal / Resumen
├── components/           # Componentes de React
│   ├── layout/           # Header, Sidebar, BottomNav
│   ├── ui/               # Componentes atómicos (Button, Modal, Toast)
│   └── products/         # Componentes específicos de productos
├── lib/                  # Utilidades, configuraciones y validaciones (Zod)
└── styles/               # Configuraciones globales de CSS
✨ Características Implementadas
1. Sistema de Navegación Inteligente
Layout Adaptativo: Header superior completo y Sidebar lateral persistente en Desktop.

Mobile First: Navegación inferior (BottomNav) para una experiencia nativa en dispositivos móviles.

Rutas Activas: Detección automática y resaltado de la página actual en el menú lateral y barra inferior.

2. Gestión de Productos (FE-04)
Formulario Reutilizable: Implementación lógica compartida para creación y edición de registros.

Validación Estricta: Integración con Zod para asegurar integridad de datos y retroalimentación en tiempo real.

UI de Selección Eficiente: Uso de Chips para categorías y unidades de medida según el Design System, mejorando la usabilidad táctil.

3. Design System & Feedback
Toasts Dinámicos: Notificaciones responsivas con posicionamiento inteligente (Top-Center en móvil / Bottom-Right en desktop).

Modales de Confirmación: Diálogos con Backdrop Blur (desenfoque de fondo) para acciones destructivas como eliminación de productos.

Consistencia Visual: Paleta de colores y espaciados basados estrictamente en la documentación técnica del proyecto.

🛠️ Instalación y Configuración
Clonar el repositorio:

Bash
git clone https://github.com/tu-usuario/smartmarket.git
cd smartmarket
Instalar dependencias:

Bash
npm install
# o
yarn install
Ejecutar en desarrollo:

Bash
npm run dev
La aplicación estará disponible en http://localhost:3000.

📈 Roadmap de Desarrollo
[x] FE-03: Estructura Base y Layout Global.

[x] FE-04: Formulario de Productos con validación y Chips UI.

[x] Design System: Sistema de Notificaciones Toast y Modales.

[ ] FE-05: Implementación de Skeletons de carga para listados.

[ ] API: Conexión a Backend / Persistencia de datos.

[ ] UI: Modo Oscuro (Dark Mode).

📄 Licencia
Este proyecto está bajo la Licencia MIT.