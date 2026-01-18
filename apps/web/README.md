# 🛒 SmartMarket - Sistema de Gestión de Inventario Personal

SmartMarket es una plataforma web moderna diseñada para la gestión eficiente de productos, comparación de precios y listas de compras. Construida con un enfoque en **UX/UI intuitiva** y un **Design System robusto**, permite a los usuarios mantener un control total sobre sus productos y locales favoritos.

## 🚀 Tecnologías Principales

- **Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Iconografía:** [Lucide React](https://lucide.dev/)
- **Validación de Formularios:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Animaciones:** Tailwind Animate

---

## 📁 Estructura del Proyecto

El proyecto sigue una arquitectura de carpetas organizada por funcionalidades y componentes reutilizables:

```text
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

```

Aquí tienes el fragmento de texto formateado correctamente en Markdown para que se vea impecable en tu archivo README.md. He corregido los niveles de los títulos, las listas y los bloques de código para asegurar que no se rompa la estructura visual.

Markdown
## ✨ Características Implementadas

### 1. Sistema de Navegación Inteligente
* **Layout Adaptativo:** Header superior completo y Sidebar lateral persistente en Desktop.
* **Mobile First:** Navegación inferior (**BottomNav**) para una experiencia nativa en dispositivos móviles.
* **Rutas Activas:** Detección automática y resaltado de la página actual en el menú lateral y barra inferior mediante `usePathname`.

### 2. Gestión de Productos (FE-04)
* **Formulario Reutilizable:** Implementación lógica compartida para creación y edición de registros.
* **Validación Estricta:** Integración con **Zod** para asegurar integridad de datos y retroalimentación en tiempo real.
* **UI de Selección Eficiente:** Uso de **Chips** para categorías y unidades de medida según el Design System, optimizando la usabilidad táctil y visual.

### 3. Design System & Feedback
* **Toasts Dinámicos:** Notificaciones responsivas con posicionamiento inteligente (**Top-Center** en móvil / **Bottom-Right** en desktop) y variantes de color (Success, Error, Warning, Info).
* **Modales de Confirmación:** Diálogos con **Backdrop Blur** (desenfoque de fondo) para acciones críticas como la eliminación de productos.
* **Consistencia Visual:** Paleta de colores, tipografía y espaciados basados estrictamente en los lineamientos de diseño del proyecto.

## 🛠️ Instalación y Configuración

1. **Clonar el repositorio:**

   ```bash
   git clone [https://github.com/tu-usuario/smartmarket.git](https://github.com/tu-usuario/smartmarket.git)
   cd smartmarket
   ```
## Instalar dependencias:

```Bash
npm install
```

## Ejecutar en desarrollo:

```Bash
npm run dev
La aplicación estará disponible en http://localhost:3000.
```

## 📈 Roadmap de Desarrollo

- [x] **FE-03:** Estructura Base y Layout Global (Sidebar + Header).
- [x] **FE-04:** Formulario de Productos con validación y UI de Chips.
- [x] **Design System:** Sistema de Notificaciones Toast y Modales de confirmación.
- [ ] **FE-05:** Implementación de Skeletons de carga para listados.
- [ ] **API:** Integración con servicios backend y persistencia de datos.
- [ ] **UI:** Implementación de Modo Oscuro (Dark Mode).

---

## 📄 Licencia
Este proyecto está bajo la Licencia **MIT**.