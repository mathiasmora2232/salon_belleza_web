# Guía de configuración — Salón Belleza Web

## Requisitos previos

| Herramienta  | Versión mínima | Notas |
|---|---|---|
| Java (JDK)   | 17             | Verificar con `java -version` |
| Maven        | 3.8+           | Incluido en NetBeans en `C:\Program Files\Apache NetBeans\java\maven\bin\` |
| PostgreSQL   | 14+            | Debe estar corriendo en `localhost:5432` |

---

## 1. Crear la base de datos

Conectarse a PostgreSQL (psql, pgAdmin o DBeaver) y ejecutar:

```sql
CREATE DATABASE salon_belleza;
```

Luego ejecutar los scripts en este orden:

```
1. salon_db.sql   → crea todas las tablas y relaciones
2. datos.md       → inserta datos iniciales (roles, estados, servicios de muestra, etc.)
```

> **Importante:** copiar únicamente los bloques SQL del archivo `datos.md` (ignorar los comentarios Markdown).

---

## 2. Variables de entorno

Crear el archivo `src/main/resources/application-local.properties` (ya está en `.gitignore`):

```properties
spring.datasource.username=postgres
spring.datasource.password=TU_PASSWORD_POSTGRES

jwt.secret=CAMBIA_ESTO_POR_UNA_CLAVE_DE_AL_MENOS_32_CARACTERES

# Opcional — solo si usas el chat con IA
openai.api.key=sk-...
```

Si no usas `application-local.properties`, puedes definir las variables de entorno del sistema:

| Variable       | Descripción                          | Default en application.properties |
|---|---|---|
| `DB_USERNAME`  | Usuario de PostgreSQL                | `postgres` |
| `DB_PASSWORD`  | Contraseña de PostgreSQL             | `changeme` |
| `JWT_SECRET`   | Clave HMAC para firmar tokens JWT    | cadena de ejemplo (cambiar en producción) |
| `OPENAI_API_KEY` | API key de OpenAI (chat IA)        | vacío (la función queda desactivada) |

---

## 3. Ejecutar la aplicación

**Desde terminal (Maven del sistema):**
```bash
mvn spring-boot:run
```

**Desde terminal (Maven de NetBeans en Windows):**
```powershell
& "C:\Program Files\Apache NetBeans\java\maven\bin\mvn.cmd" spring-boot:run
```

**Desde NetBeans / IntelliJ:** ejecutar la clase principal `SalonBellezaAppApplication`.

La aplicación arranca en: **http://localhost:8080**

---

## 4. Crear el usuario administrador

El script `datos.md` inserta un usuario admin con contraseña placeholder. Antes de usarlo, debes reemplazar el hash con uno real.

**Opción A — usar el registro desde la app:**
1. Accede a http://localhost:8080/register.html
2. Regístrate con cualquier email
3. Luego desde psql cambia el rol del usuario a `Administrador`:

```sql
UPDATE usuarios
SET rol_id = (SELECT id FROM roles WHERE nombre = 'Administrador')
WHERE email = 'tu@email.com';
```

**Opción B — generar hash BCrypt directamente:**

```java
// Ejecutar una vez en cualquier main o test de Java
System.out.println(new BCryptPasswordEncoder().encode("Admin123!"));
```

Luego actualizar en la BD:
```sql
UPDATE usuarios SET password_hash = '$2a$10$...' WHERE username = 'admin';
```

---

## 5. Páginas disponibles

| URL | Descripción | Acceso |
|---|---|---|
| `/` o `/index.html` | Página principal + formulario de reserva pública | Público |
| `/evento.html` | Página de evento / promociones | Público |
| `/login.html` | Inicio de sesión | Público |
| `/register.html` | Registro de clientes | Público |
| `/admin.html` | Dashboard del panel de administración | Administrador / Recepcionista / Cajero |
| `/citas.html` | Gestión de citas | Admin |
| `/servicios.html` | Catálogo de servicios | Admin |
| `/productos.html` | Inventario de productos | Admin |
| `/perfil.html` | Perfil de usuario (editar nombre, foto, avatar) | Cualquier usuario autenticado |

---

## 6. Endpoints de API principales

| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión → devuelve JWT + refresh token | No |
| POST | `/api/auth/register` | Registrar cliente nuevo | No |
| POST | `/api/auth/refresh` | Renovar token JWT con refresh token | No |
| GET  | `/api/auth/me` | Datos del usuario autenticado | JWT |
| POST | `/api/v1/citas/publica` | Reservar cita desde formulario público | No |
| GET  | `/api/v1/servicios/estado/Activo` | Listar servicios activos | No |
| GET  | `/api/v1/estilistas/estado/Activo` | Listar estilistas activos | No |

---

## 7. Configuración JWT

| Parámetro | Valor por defecto | Descripción |
|---|---|---|
| `jwt.expiration-ms` | `86400000` (24 h) | Duración del token de acceso |
| `jwt.refresh-expiration-ms` | `604800000` (7 días) | Duración del refresh token |

Los tokens se renuevan automáticamente en el cliente (ver `auth-guard.js`):
- Si el token expira → intenta renovar con el refresh token antes de redirigir al login.
- Si quedan menos de 5 minutos → renueva en background sin interrumpir al usuario.

---

## 8. Notas de base de datos

- `ddl-auto=none`: **Hibernate no modifica las tablas**. Cualquier cambio de schema se hace manualmente con SQL.
- Para ver el SQL generado en consola: `spring.jpa.show-sql=true` (activado en desarrollo).
- El archivo `DATABASE.md` documenta todas las tablas, columnas y relaciones.
- El archivo `datos.md` contiene el script SQL de datos iniciales.
