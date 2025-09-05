# Drizzle ORM Configuration

Este directorio contiene la configuración de Drizzle ORM para el proyecto Zombie Story.

## Estructura de Archivos

- `schema.ts` - Definición del esquema de la base de datos
- `index.ts` - Configuración de la conexión a la base de datos
- `queries.ts` - Funciones de consulta reutilizables
- `README.md` - Esta documentación

## Configuración

### Variables de Entorno

Asegúrate de tener configurada la variable de entorno `DATABASE_URL` en tu archivo `.env.local`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### Esquema de Base de Datos

El esquema está configurado para ser compatible con Better Auth e incluye las siguientes tablas:

- `user` - Información de usuarios
- `session` - Sesiones de usuario
- `account` - Cuentas de proveedores externos
- `verification` - Tokens de verificación

## Scripts Disponibles

### Generar Migraciones
```bash
npm run db:generate
```

### Aplicar Migraciones
```bash
npm run db:migrate
```

### Sincronizar Esquema (Push)
```bash
npm run db:push
```

### Abrir Drizzle Studio
```bash
npm run db:studio
```

### Introspeccionar Base de Datos
```bash
npm run db:introspect
```

## Uso Básico

### Importar la Base de Datos

```typescript
import { db } from '@/db';
import { users, sessions } from '@/db/schema';
```

### Consultas Básicas

```typescript
// Obtener todos los usuarios
const allUsers = await db.select().from(users);

// Obtener usuario por ID
const user = await db.select().from(users).where(eq(users.id, 'user-id'));

// Crear nuevo usuario
const newUser = await db.insert(users).values({
  id: 'new-user-id',
  name: 'John Doe',
  email: 'john@example.com',
  emailVerified: false,
});
```

### Usar Funciones de Consulta Predefinidas

```typescript
import { userQueries, sessionQueries } from '@/db/queries';

// Obtener usuario por email
const user = await userQueries.getByEmail('user@example.com');

// Obtener sesión por token
const session = await sessionQueries.getByToken('session-token');

// Obtener estadísticas de usuario
const stats = await complexQueries.getUserStats('user-id');
```

### Consultas con Relaciones

```typescript
// Obtener usuario con sus sesiones
const userWithSessions = await db.query.users.findFirst({
  where: eq(users.id, 'user-id'),
  with: {
    sessions: true,
    accounts: true,
  },
});
```

## Tipos TypeScript

Drizzle genera automáticamente tipos TypeScript para todas las tablas:

```typescript
import type { User, NewUser, Session, NewSession } from '@/db/schema';

// User - tipo para registros existentes
// NewUser - tipo para insertar nuevos registros
```

## Mejores Prácticas

1. **Usa las funciones de consulta predefinidas** en `queries.ts` cuando sea posible
2. **Siempre usa tipos TypeScript** para mayor seguridad
3. **Maneja errores apropiadamente** en las consultas
4. **Usa transacciones** para operaciones complejas
5. **Optimiza consultas** usando índices y limitando resultados

## Transacciones

```typescript
import { db } from '@/db';

const result = await db.transaction(async (tx) => {
  const user = await tx.insert(users).values(userData).returning();
  const session = await tx.insert(sessions).values({
    ...sessionData,
    userId: user[0].id,
  }).returning();
  
  return { user: user[0], session: session[0] };
});
```

## Migración desde Better Auth

Este esquema está diseñado para ser compatible con Better Auth. Las tablas existentes creadas por Better Auth funcionarán sin modificaciones con este esquema de Drizzle.

## Recursos Adicionales

- [Documentación de Drizzle ORM](https://orm.drizzle.team/)
- [Drizzle Kit CLI](https://orm.drizzle.team/kit-docs/overview)
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview)