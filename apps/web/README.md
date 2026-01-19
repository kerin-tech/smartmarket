# SmartMarket Frontend

Sistema de gestión y comparación de precios alimentarios para el mercado colombiano.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador
http://localhost:3000
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación (login, register)
│   ├── (dashboard)/       # Rutas protegidas
│   ├── globals.css        # Estilos globales + Design System
│   └── layout.tsx         # Layout raíz
├── components/
│   ├── ui/                # Componentes UI base (Button, Input, Card, etc.)
│   ├── forms/             # Formularios (RegisterForm, LoginForm)
│   └── layout/            # Componentes de layout (Logo, Header, Sidebar)
├── hooks/                 # Custom hooks (useToast)
├── services/              # Servicios API (auth.service)
├── stores/                # Estado global Zustand (auth.store)
├── types/                 # Tipos TypeScript
├── lib/                   # Utilidades y validaciones
│   ├── utils.ts           # Funciones helper
│   └── validations/       # Schemas Zod
└── config/                # Configuración de la app
```

## 🎨 Design System

### Colores

| Color | Uso | Clase Tailwind |
|-------|-----|----------------|
| Primary (Azul) | CTAs, acciones principales | `primary-600` |
| Secondary (Gris) | Textos, fondos, bordes | `secondary-*` |
| Success (Verde) | Confirmaciones, éxito | `success-*` |
| Warning (Amarillo) | Alertas, advertencias | `warning-*` |
| Error (Rojo) | Errores, destructivos | `error-*` |
| Info (Cyan) | Información, tips | `info-*` |

### Colores de Categorías

| Categoría | Emoji | Clase |
|-----------|-------|-------|
| Frutas | 🍎 | `category-fruits` |
| Verduras | 🥬 | `category-vegetables` |
| Granos | 🍚 | `category-grains` |
| Lácteos | 🥛 | `category-dairy` |
| Carnes | 🥩 | `category-meats` |
| Bebidas | 🥤 | `category-beverages` |
| Limpieza | 🧹 | `category-cleaning` |
| Otros | 📦 | `category-other` |

### Componentes UI

- **Button**: Variantes `primary`, `secondary`, `outline`, `ghost`, `danger`
- **Input**: Con label, error, helperText, toggle password
- **Checkbox**: Con label
- **Card**: Variantes `default`, `bordered`, `elevated`
- **Badge**: Para estados y categorías
- **Toast**: Notificaciones `success`, `error`, `warning`, `info`
- **Spinner**: Loading states

## 📜 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run dev:turbo    # Servidor con Turbopack
npm run build        # Build de producción
npm run start        # Iniciar build de producción
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Corregir errores de ESLint
npm run format       # Formatear código con Prettier
npm run format:check # Verificar formato
npm run type-check   # Verificar tipos TypeScript
npm run clean        # Limpiar cache y builds
```

## 🔧 Variables de Entorno

Copiar `.env.example` a `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=SmartMarket
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## ✅ Tareas Completadas

### FE-01: Formulario de Registro
- [x] Campos: nombre, email, contraseña, confirmar contraseña
- [x] Validación en tiempo real al perder foco (Zod)
- [x] Botón deshabilitado si hay errores
- [x] Loader durante envío
- [x] Toast de confirmación tras éxito
- [x] Redirección automática a dashboard
- [x] Mostrar/ocultar contraseña
- [x] Error específico si email ya existe
- [x] Responsive (mobile y desktop)

### FE-02: Formulario de Login
- [x] Campos: email, contraseña
- [x] Checkbox "Recordarme"
- [x] Validación al enviar
- [x] Loader durante petición
- [x] Token guardado en localStorage
- [x] Redirección automática a dashboard
- [x] Error si credenciales incorrectas
- [x] Redirige si ya hay sesión activa
- [x] Responsive (mobile y desktop)

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript 5
- **Estilos:** Tailwind CSS 3
- **Estado:** Zustand
- **Formularios:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Iconos:** Lucide React

## 📱 Responsive Design

- **Mobile:** < 768px
- **Tablet:** 768px - 1023px
- **Desktop:** ≥ 1024px
