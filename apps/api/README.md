# Smart Market Backend

API Backend para Smart Market, construida con Express, TypeScript, Prisma y Zod.

## 🚀 Stack Tecnológico

*   **Runtime:** Node.js (>=20.0.0)
*   **Framework:** Express.js
*   **Lenguaje:** TypeScript
*   **Base de Datos:** PostgreSQL
*   **ORM:** Prisma
*   **Validación:** Zod
*   **Autenticación:** JWT + Bcrypt
*   **Testing:** Jest + Supertest
*   **Herramientas:** ESlint, Prettier, Husky

## 🛠️ Instalación y Configuración

1.  **Clonar el repositorio:**

    ```bash
    git clone https://github.com/DiegoMartinez14/SmartMarketBackend.git
    cd SmartMarketBackend
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Copia el archivo de ejemplo y edítalo con tus credenciales.

    ```bash
    cp .env.example .env
    ```
    *Asegúrate de configurar `DATABASE_URL` y `JWT_SECRET`.*

4.  **Base de Datos:**
    Genera el cliente de Prisma y corre las migraciones.

    ```bash
    npm run prisma:migrate
    ```

5.  **Correr en Desarrollo:**

    ```bash
    npm run dev
    ```

## 📂 Estructura del Proyecto

El proyecto sigue una arquitectura por capas para facilitar la escalabilidad y el mantenimiento.

```
src/
├── config/         # Configuraciones (Env, Database, Swagger)
├── controllers/    # Controladores (Manejo de Requests/Responses)
├── errors/         # Manejo de Errores Personalizados
├── middlewares/    # Middlewares (Auth, Validaciones, Logs)
├── routes/         # Definición de Rutas
├── services/       # Lógica de Negocio
├── utils/          # Utilidades y Logger
└── validators/     # Esquemas de Validación (Zod)
```

## 📜 Scripts Disponibles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo (Hot Reload) |
| `npm run build` | Compila el proyecto a JS en `/dist` |
| `npm run start` | Inicia el servidor de producción (necesita build) |
| `npm run lint` | Ejecuta el linter (ESLint) |
| `npm run test` | Ejecuta los tests (Jest) |
| `npm run prisma:migrate` | Aplica migraciones a la BD |
| `npm run prisma:studio` | Abre el GUI de Prisma |

## 👥 Autores

*   **Diego Martinez**
*   **Kerin Melo**

## 📄 Licencia

[MIT](LICENSE)
