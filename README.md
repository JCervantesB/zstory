# 🧟‍♂️ Zombie Story

Un juego de supervivencia zombie interactivo construido con Next.js 15, featuring pixel art design y narrativa inmersiva.

## 🚀 Características

- **Autenticación completa**: Registro e inicio de sesión con Better Auth
- **Notificaciones por email**: Emails de bienvenida automáticos con Resend
- **Creación de personajes**: Sistema completo de personalización
- **Diseño pixel art**: Interfaz temática zombie retro
- **Base de datos**: PostgreSQL con Drizzle ORM
- **TypeScript**: Tipado completo para mejor desarrollo

## 🛠️ Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd zombie-story
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo `.env.example` a `.env.local` y configura las variables:

```bash
cp .env.example .env.local
```

**Variables requeridas:**
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `BETTER_AUTH_SECRET`: Clave secreta (mínimo 32 caracteres)
- `BETTER_AUTH_URL`: URL base de la aplicación
- `RESEND_API_KEY`: API key de Resend para emails

### 4. Configurar base de datos
```bash
# Ejecutar migraciones
npm run db:push
```

### 5. Ejecutar el servidor de desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📧 Configuración de Emails

Para habilitar el envío de emails:

1. Crea una cuenta en [Resend](https://resend.com)
2. Obtén tu API key
3. Configura `RESEND_API_KEY` en tu archivo `.env.local`
4. Los emails se enviarán automáticamente al registrarse

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
