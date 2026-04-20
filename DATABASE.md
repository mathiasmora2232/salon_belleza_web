# Database Documentation - Salon Belleza

**Database:** `salon_belleza`  
**Engine:** PostgreSQL  
**Host:** localhost:5432  
**Generated:** 2026-04-19

---

## Table of Contents

1. [Roles y Usuarios](#1-roles-y-usuarios)
2. [Estilistas](#2-estilistas)
3. [Clientes](#3-clientes)
4. [Servicios](#4-servicios)
5. [Inventario](#5-inventario)
6. [Citas](#6-citas)
7. [Facturación](#7-facturación)
8. [Comisiones](#8-comisiones)
9. [Configuración](#9-configuración)
10. [Entity Relationship Summary](#10-entity-relationship-summary)

---

## 1. Roles y Usuarios

### Table: `roles`

Stores the role definitions for access control.

| Column       | Type                     | Constraints                          |
|--------------|--------------------------|--------------------------------------|
| id           | SMALLSERIAL              | PRIMARY KEY                          |
| nombre       | VARCHAR(30)              | UNIQUE, NOT NULL                     |
| descripcion  | VARCHAR(200)             |                                      |
| created_at   | TIMESTAMPTZ              | DEFAULT NOW()                        |

**Indexes:** Primary key on `id`, unique index on `nombre`.

**Relationships:**
- One `rol` → Many `usuarios`

---

### Table: `usuarios`

Stores all system users (admins, receptionists, stylists with system access, etc.).

| Column               | Type          | Constraints / Notes                                           |
|----------------------|---------------|---------------------------------------------------------------|
| id                   | SERIAL        | PRIMARY KEY                                                   |
| rol_id               | SMALLINT      | FK → roles.id                                                 |
| username             | VARCHAR(50)   | UNIQUE, NOT NULL                                              |
| email                | VARCHAR(120)  | UNIQUE, NOT NULL                                              |
| password_hash        | VARCHAR(255)  | NOT NULL                                                      |
| nombre_completo      | VARCHAR(100)  | NOT NULL                                                      |
| telefono             | VARCHAR(20)   |                                                               |
| avatar_url           | VARCHAR(255)  |                                                               |
| ultimo_login         | TIMESTAMPTZ   |                                                               |
| intentos_fallidos    | SMALLINT      | DEFAULT 0                                                     |
| bloqueado_hasta      | TIMESTAMPTZ   |                                                               |
| debe_cambiar_pass    | BOOLEAN       | DEFAULT FALSE                                                 |
| estado               | VARCHAR(20)   | DEFAULT 'Activo', CHECK IN ('Activo','Inactivo','Suspendido') |
| eliminado_en         | TIMESTAMPTZ   | Soft delete timestamp                                         |
| created_at           | TIMESTAMPTZ   | DEFAULT NOW()                                                 |
| updated_at           | TIMESTAMPTZ   | DEFAULT NOW()                                                 |

**Indexes:**
- `idx_usuarios_email` on `email`
- `idx_usuarios_estado` on `estado`
- Unique index on `username`, `email`

**Relationships:**
- Many `usuarios` → One `rol`
- One `usuario` → One `estilista` (optional)
- One `usuario` → Many `password_resets`
- One `usuario` → Many `cliente_notas`
- One `usuario` → Many `citas` (creado_por)
- One `usuario` → Many `facturas`
- One `usuario` → Many `factura_pagos`
- One `usuario` → Many `movimientos_inventario`
- One `usuario` → Many `comisiones` (liquidada_por)

---

### Table: `password_resets`

Manages password reset tokens for users.

| Column      | Type          | Constraints / Notes                       |
|-------------|---------------|-------------------------------------------|
| id          | SERIAL        | PRIMARY KEY                               |
| usuario_id  | INT           | FK → usuarios.id ON DELETE CASCADE        |
| token_hash  | VARCHAR(255)  | UNIQUE, NOT NULL                          |
| expira_en   | TIMESTAMPTZ   | NOT NULL                                  |
| usado_en    | TIMESTAMPTZ   |                                           |
| ip_origen   | VARCHAR(45)   | IPv4 or IPv6                              |
| created_at  | TIMESTAMPTZ   | DEFAULT NOW()                             |

**Indexes:**
- `idx_password_resets_usuario_id` on `usuario_id`
- `idx_password_resets_expira_en` on `expira_en`

**Relationships:**
- Many `password_resets` → One `usuario` (CASCADE DELETE)

---

## 2. Estilistas

### Table: `estilistas`

Stores stylist profiles, independent of system user accounts.

| Column                | Type           | Constraints / Notes                                           |
|-----------------------|----------------|---------------------------------------------------------------|
| id                    | SERIAL         | PRIMARY KEY                                                   |
| usuario_id            | INT            | UNIQUE, FK → usuarios.id ON DELETE SET NULL                   |
| nombre                | VARCHAR(100)   | NOT NULL                                                      |
| telefono              | VARCHAR(20)    |                                                               |
| especialidad          | VARCHAR(100)   |                                                               |
| experiencia_anios     | SMALLINT       | CHECK >= 0                                                    |
| comision_porcentaje   | NUMERIC(5,2)   | DEFAULT 0, CHECK BETWEEN 0 AND 100                            |
| fecha_ingreso         | DATE           | DEFAULT CURRENT_DATE                                          |
| fecha_salida          | DATE           |                                                               |
| estado                | VARCHAR(20)    | DEFAULT 'Activo', CHECK IN ('Activo','Inactivo','Vacaciones') |
| created_at            | TIMESTAMPTZ    | DEFAULT NOW()                                                 |
| updated_at            | TIMESTAMPTZ    | DEFAULT NOW()                                                 |

**Relationships:**
- One `estilista` → One `usuario` (optional, SET NULL on delete)
- One `estilista` → Many `estilista_horarios`
- One `estilista` → Many `estilista_excepciones`
- One `estilista` → Many `citas`
- One `estilista` → Many `cita_servicios`
- One `estilista` → Many `comisiones`

---

### Table: `estilista_horarios`

Weekly recurring schedules for each stylist.

| Column        | Type        | Constraints / Notes                                        |
|---------------|-------------|------------------------------------------------------------|
| id            | SERIAL      | PRIMARY KEY                                                |
| estilista_id  | INT         | FK → estilistas.id ON DELETE CASCADE                       |
| dia_semana    | SMALLINT    | CHECK BETWEEN 0 (Sunday) AND 6 (Saturday)                  |
| hora_inicio   | TIME        |                                                            |
| hora_fin      | TIME        | CHECK > hora_inicio                                        |
| activo        | BOOLEAN     | DEFAULT TRUE                                               |

**Unique Constraint:** `(estilista_id, dia_semana, hora_inicio)`

**Relationships:**
- Many `estilista_horarios` → One `estilista` (CASCADE DELETE)

---

### Table: `estilista_excepciones`

One-off date exceptions (days off, special hours) for stylists.

| Column        | Type          | Constraints / Notes                                        |
|---------------|---------------|------------------------------------------------------------|
| id            | SERIAL        | PRIMARY KEY                                                |
| estilista_id  | INT           | FK → estilistas.id ON DELETE CASCADE                       |
| fecha         | DATE          | NOT NULL                                                   |
| tipo          | VARCHAR(20)   | CHECK IN ('NoDisponible','HorarioEspecial')                 |
| hora_inicio   | TIME          | NULL unless tipo='HorarioEspecial'                         |
| hora_fin      | TIME          |                                                            |
| motivo        | VARCHAR(150)  |                                                            |
| created_at    | TIMESTAMPTZ   | DEFAULT NOW()                                              |

**Relationships:**
- Many `estilista_excepciones` → One `estilista` (CASCADE DELETE)

---

## 3. Clientes

### Table: `clientes`

Stores customer profiles.

| Column                  | Type          | Constraints / Notes                                                              |
|-------------------------|---------------|----------------------------------------------------------------------------------|
| id                      | SERIAL        | PRIMARY KEY                                                                      |
| tipo_identificacion     | VARCHAR(10)   | DEFAULT 'CEDULA', CHECK IN ('CEDULA','RUC','PASAPORTE')                          |
| numero_identificacion   | VARCHAR(20)   | UNIQUE                                                                           |
| nombre                  | VARCHAR(100)  | NOT NULL                                                                         |
| apellido                | VARCHAR(100)  |                                                                                  |
| telefono                | VARCHAR(20)   |                                                                                  |
| email                   | VARCHAR(120)  |                                                                                  |
| genero                  | VARCHAR(20)   | CHECK NULL OR IN ('Masculino','Femenino','Otro','Prefiere no decir')              |
| fecha_nacimiento        | DATE          |                                                                                  |
| direccion               | VARCHAR(200)  |                                                                                  |
| ciudad                  | VARCHAR(60)   |                                                                                  |
| fecha_registro          | TIMESTAMPTZ   | DEFAULT NOW()                                                                    |
| estado                  | VARCHAR(20)   | DEFAULT 'Activo', CHECK IN ('Activo','Inactivo')                                 |
| eliminado_en            | TIMESTAMPTZ   | Soft delete timestamp                                                            |
| created_at              | TIMESTAMPTZ   | DEFAULT NOW()                                                                    |
| updated_at              | TIMESTAMPTZ   | DEFAULT NOW()                                                                    |

**Indexes:**
- `idx_clientes_nombre_apellido` on `(nombre, apellido)`
- `idx_clientes_telefono` on `telefono`
- `idx_clientes_estado` on `estado`

**Relationships:**
- One `cliente` → One `cliente_ficha`
- One `cliente` → Many `cliente_notas`
- One `cliente` → Many `citas`
- One `cliente` → Many `facturas`

---

### Table: `cliente_fichas`

Extended health/preference profile for each client (1-to-1 with clientes).

| Column               | Type        | Constraints / Notes              |
|----------------------|-------------|----------------------------------|
| cliente_id           | INT         | PRIMARY KEY, FK → clientes.id ON DELETE CASCADE |
| tipo_cabello         | VARCHAR(60) |                                  |
| tipo_piel            | VARCHAR(60) |                                  |
| alergias             | TEXT        |                                  |
| condiciones_medicas  | TEXT        |                                  |
| productos_evitar     | TEXT        |                                  |
| preferencias         | TEXT        |                                  |
| notas                | TEXT        |                                  |
| updated_at           | TIMESTAMPTZ | DEFAULT NOW()                    |

**Relationships:**
- One `cliente_ficha` → One `cliente` (CASCADE DELETE)

---

### Table: `cliente_notas`

Free-form notes written by staff about a client.

| Column      | Type          | Constraints / Notes                                         |
|-------------|---------------|-------------------------------------------------------------|
| id          | SERIAL        | PRIMARY KEY                                                 |
| cliente_id  | INT           | FK → clientes.id ON DELETE CASCADE                          |
| usuario_id  | INT           | FK → usuarios.id                                            |
| cita_id     | INT           | FK → citas.id ON DELETE SET NULL (added via ALTER)          |
| contenido   | TEXT          | NOT NULL                                                    |
| tipo        | VARCHAR(20)   | DEFAULT 'General', CHECK IN ('General','Tecnica','Comercial','Alerta') |
| created_at  | TIMESTAMPTZ   | DEFAULT NOW()                                               |

**Relationships:**
- Many `cliente_notas` → One `cliente` (CASCADE DELETE)
- Many `cliente_notas` → One `usuario`
- Many `cliente_notas` → One `cita` (SET NULL on delete)

---

## 4. Servicios

### Table: `categorias_servicios`

Groups of services offered by the salon.

| Column       | Type          | Constraints / Notes        |
|--------------|---------------|----------------------------|
| id           | SMALLSERIAL   | PRIMARY KEY                |
| nombre       | VARCHAR(60)   | UNIQUE, NOT NULL           |
| descripcion  | VARCHAR(200)  |                            |
| icono        | VARCHAR(50)   |                            |
| orden        | SMALLINT      | DEFAULT 0                  |
| activo       | BOOLEAN       | DEFAULT TRUE               |

**Relationships:**
- One `categoria_servicio` → Many `servicios`

---

### Table: `servicios`

Individual services offered by the salon.

| Column              | Type           | Constraints / Notes                                     |
|---------------------|----------------|---------------------------------------------------------|
| id                  | SERIAL         | PRIMARY KEY                                             |
| categoria_id        | SMALLINT       | FK → categorias_servicios.id                            |
| nombre              | VARCHAR(100)   | NOT NULL                                                |
| descripcion         | TEXT           |                                                         |
| precio              | NUMERIC(10,2)  | NOT NULL, CHECK >= 0                                    |
| duracion_min        | INT            | NOT NULL, CHECK > 0                                     |
| comision_aplica     | BOOLEAN        | DEFAULT TRUE                                            |
| comision_override   | NUMERIC(5,2)   | NULL, CHECK BETWEEN 0 AND 100                           |
| estado              | VARCHAR(20)    | DEFAULT 'Activo', CHECK IN ('Activo','Inactivo')         |
| created_at          | TIMESTAMPTZ    | DEFAULT NOW()                                           |
| updated_at          | TIMESTAMPTZ    | DEFAULT NOW()                                           |

**Relationships:**
- Many `servicios` → One `categoria_servicio`
- One `servicio` → Many `servicio_insumos`
- One `servicio` → Many `cita_servicios`
- One `servicio` → Many `factura_items`

---

## 5. Inventario

### Table: `categorias_productos`

Groups for inventory products.

| Column       | Type          | Constraints / Notes  |
|--------------|---------------|----------------------|
| id           | SMALLSERIAL   | PRIMARY KEY          |
| nombre       | VARCHAR(60)   | UNIQUE, NOT NULL     |
| descripcion  | VARCHAR(200)  |                      |
| activo       | BOOLEAN       | DEFAULT TRUE         |

**Relationships:**
- One `categoria_producto` → Many `productos`

---

### Table: `proveedores`

Suppliers for products.

| Column      | Type          | Constraints / Notes  |
|-------------|---------------|----------------------|
| id          | SERIAL        | PRIMARY KEY          |
| nombre      | VARCHAR(120)  | NOT NULL             |
| ruc         | VARCHAR(20)   |                      |
| contacto    | VARCHAR(100)  |                      |
| telefono    | VARCHAR(20)   |                      |
| email       | VARCHAR(120)  |                      |
| direccion   | VARCHAR(200)  |                      |
| activo      | BOOLEAN       | DEFAULT TRUE         |
| created_at  | TIMESTAMPTZ   | DEFAULT NOW()        |
| updated_at  | TIMESTAMPTZ   | DEFAULT NOW()        |

**Relationships:**
- One `proveedor` → Many `productos`

---

### Table: `productos`

Products in inventory (for sale, for service use, or both).

| Column          | Type           | Constraints / Notes                                  |
|-----------------|----------------|------------------------------------------------------|
| id              | SERIAL         | PRIMARY KEY                                          |
| categoria_id    | SMALLINT       | FK → categorias_productos.id                         |
| proveedor_id    | INT            | FK → proveedores.id                                  |
| sku             | VARCHAR(40)    | UNIQUE                                               |
| codigo_barras   | VARCHAR(40)    | UNIQUE                                               |
| nombre          | VARCHAR(120)   | NOT NULL                                             |
| descripcion     | TEXT           |                                                      |
| marca           | VARCHAR(60)    |                                                      |
| unidad_medida   | VARCHAR(20)    | DEFAULT 'unidad'                                     |
| tipo            | VARCHAR(20)    | DEFAULT 'Ambos', CHECK IN ('Venta','Insumo','Ambos') |
| precio_compra   | NUMERIC(10,2)  | CHECK >= 0                                           |
| precio_venta    | NUMERIC(10,2)  | CHECK >= 0                                           |
| stock_actual    | NUMERIC(12,2)  | DEFAULT 0                                            |
| stock_minimo    | NUMERIC(12,2)  | DEFAULT 0                                            |
| estado          | VARCHAR(20)    | DEFAULT 'Activo'                                     |
| created_at      | TIMESTAMPTZ    | DEFAULT NOW()                                        |
| updated_at      | TIMESTAMPTZ    | DEFAULT NOW()                                        |

**Relationships:**
- Many `productos` → One `categoria_producto`
- Many `productos` → One `proveedor`
- One `producto` → Many `servicio_insumos`
- One `producto` → Many `movimientos_inventario`
- One `producto` → Many `factura_items`

---

### Table: `servicio_insumos`

Supplies/products consumed per service (bill of materials).

| Column       | Type           | Constraints / Notes                           |
|--------------|----------------|-----------------------------------------------|
| id           | SERIAL         | PRIMARY KEY                                   |
| servicio_id  | INT            | FK → servicios.id ON DELETE CASCADE           |
| producto_id  | INT            | FK → productos.id                             |
| cantidad     | NUMERIC(10,2)  | CHECK > 0                                     |

**Unique Constraint:** `(servicio_id, producto_id)`

**Relationships:**
- Many `servicio_insumos` → One `servicio` (CASCADE DELETE)
- Many `servicio_insumos` → One `producto`

---

### Table: `movimientos_inventario`

Audit log of all stock changes.

| Column           | Type           | Constraints / Notes                                                              |
|------------------|----------------|----------------------------------------------------------------------------------|
| id               | BIGSERIAL      | PRIMARY KEY                                                                      |
| producto_id      | INT            | FK → productos.id                                                                |
| tipo             | VARCHAR(20)    | CHECK IN ('Entrada','Salida','Venta','UsoServicio','Ajuste','Merma','Devolucion') |
| cantidad         | NUMERIC(12,2)  |                                                                                  |
| costo_unitario   | NUMERIC(10,2)  |                                                                                  |
| referencia_tipo  | VARCHAR(20)    | e.g. 'cita', 'factura'                                                           |
| referencia_id    | INT            |                                                                                  |
| usuario_id       | INT            | FK → usuarios.id                                                                 |
| observaciones    | TEXT           |                                                                                  |
| created_at       | TIMESTAMPTZ    | DEFAULT NOW()                                                                    |

**Relationships:**
- Many `movimientos_inventario` → One `producto`
- Many `movimientos_inventario` → One `usuario`

---

## 6. Citas

### Table: `cita_estados`

Lookup table for appointment statuses.

| Column     | Type         | Constraints / Notes   |
|------------|--------------|-----------------------|
| id         | SMALLSERIAL  | PRIMARY KEY           |
| codigo     | VARCHAR(20)  | UNIQUE, NOT NULL      |
| nombre     | VARCHAR(40)  | NOT NULL              |
| color_hex  | VARCHAR(7)   | e.g. '#FF0000'        |
| es_final   | BOOLEAN      | DEFAULT FALSE         |
| orden      | SMALLINT     | DEFAULT 0             |

**Relationships:**
- One `cita_estado` → Many `citas`
- One `cita_estado` → Many `cita_historial` (estado_anterior, estado_nuevo)

---

### Table: `citas`

Appointment bookings.

| Column        | Type        | Constraints / Notes                           |
|---------------|-------------|-----------------------------------------------|
| id            | SERIAL      | PRIMARY KEY                                   |
| cliente_id    | INT         | FK → clientes.id                              |
| estilista_id  | INT         | FK → estilistas.id                            |
| estado_id     | SMALLINT    | FK → cita_estados.id                          |
| fecha         | DATE        | NOT NULL                                      |
| hora_inicio   | TIME        | NOT NULL                                      |
| hora_fin      | TIME        | NOT NULL, CHECK > hora_inicio                 |
| observaciones | TEXT        |                                               |
| creado_por    | INT         | FK → usuarios.id                              |
| created_at    | TIMESTAMPTZ | DEFAULT NOW()                                 |
| updated_at    | TIMESTAMPTZ | DEFAULT NOW()                                 |

**Indexes:**
- `idx_citas_fecha` on `fecha`
- `idx_citas_estilista_fecha` on `(estilista_id, fecha)`
- `idx_citas_cliente` on `cliente_id`
- `idx_citas_estado` on `estado_id`

**Relationships:**
- Many `citas` → One `cliente`
- Many `citas` → One `estilista`
- Many `citas` → One `cita_estado`
- Many `citas` → One `usuario` (creado_por)
- One `cita` → Many `cita_servicios`
- One `cita` → Many `cita_historial`
- One `cita` → Many `cliente_notas`
- One `cita` → Many `facturas`

---

### Table: `cita_servicios`

Line items (services) within an appointment.

| Column             | Type           | Constraints / Notes                |
|--------------------|----------------|------------------------------------|
| id                 | SERIAL         | PRIMARY KEY                        |
| cita_id            | INT            | FK → citas.id ON DELETE CASCADE    |
| servicio_id        | INT            | FK → servicios.id                  |
| estilista_id       | INT            | FK → estilistas.id                 |
| precio_aplicado    | NUMERIC(10,2)  | CHECK >= 0                         |
| duracion_aplicada  | INT            | CHECK > 0                          |
| orden              | SMALLINT       | DEFAULT 1                          |

**Relationships:**
- Many `cita_servicios` → One `cita` (CASCADE DELETE)
- Many `cita_servicios` → One `servicio`
- Many `cita_servicios` → One `estilista`

---

### Table: `cita_historial`

Audit log of appointment status changes.

| Column               | Type        | Constraints / Notes                       |
|----------------------|-------------|-------------------------------------------|
| id                   | BIGSERIAL   | PRIMARY KEY                               |
| cita_id              | INT         | FK → citas.id ON DELETE CASCADE           |
| estado_anterior_id   | SMALLINT    | FK → cita_estados.id                      |
| estado_nuevo_id      | SMALLINT    | FK → cita_estados.id                      |
| usuario_id           | INT         | FK → usuarios.id                          |
| motivo               | VARCHAR(200)|                                           |
| created_at           | TIMESTAMPTZ | DEFAULT NOW()                             |

**Relationships:**
- Many `cita_historial` → One `cita` (CASCADE DELETE)
- Many `cita_historial` → One `cita_estado` (estado_anterior)
- Many `cita_historial` → One `cita_estado` (estado_nuevo)
- Many `cita_historial` → One `usuario`

---

## 7. Facturación

### Table: `metodos_pago`

Lookup table for payment methods.

| Column   | Type         | Constraints / Notes  |
|----------|--------------|----------------------|
| id       | SMALLSERIAL  | PRIMARY KEY          |
| codigo   | VARCHAR(20)  | UNIQUE, NOT NULL     |
| nombre   | VARCHAR(40)  | NOT NULL             |
| activo   | BOOLEAN      | DEFAULT TRUE         |

**Relationships:**
- One `metodo_pago` → Many `factura_pagos`

---

### Table: `impuestos`

Tax rates applicable to invoices.

| Column      | Type          | Constraints / Notes  |
|-------------|---------------|----------------------|
| id          | SMALLSERIAL   | PRIMARY KEY          |
| codigo      | VARCHAR(20)   | UNIQUE, NOT NULL     |
| nombre      | VARCHAR(40)   | NOT NULL             |
| porcentaje  | NUMERIC(5,2)  | CHECK >= 0           |
| activo      | BOOLEAN       | DEFAULT TRUE         |
| es_default  | BOOLEAN       | DEFAULT FALSE        |

**Relationships:**
- One `impuesto` → Many `facturas`

---

### Table: `facturas`

Invoice headers.

| Column           | Type           | Constraints / Notes                                              |
|------------------|----------------|------------------------------------------------------------------|
| id               | SERIAL         | PRIMARY KEY                                                      |
| numero           | VARCHAR(20)    | UNIQUE, NOT NULL                                                 |
| cliente_id       | INT            | FK → clientes.id                                                 |
| cita_id          | INT            | FK → citas.id                                                    |
| usuario_id       | INT            | FK → usuarios.id                                                 |
| fecha            | TIMESTAMPTZ    | DEFAULT NOW()                                                    |
| subtotal         | NUMERIC(10,2)  | CHECK >= 0                                                       |
| descuento        | NUMERIC(10,2)  | CHECK >= 0                                                       |
| impuesto_monto   | NUMERIC(10,2)  | CHECK >= 0                                                       |
| total            | NUMERIC(10,2)  | CHECK >= 0                                                       |
| pagado           | NUMERIC(10,2)  | CHECK >= 0                                                       |
| impuesto_id      | SMALLINT       | FK → impuestos.id                                                |
| estado           | VARCHAR(20)    | DEFAULT 'BORRADOR', CHECK IN ('BORRADOR','EMITIDA','PAGADA','ANULADA') |
| observaciones    | TEXT           |                                                                  |
| anulada_en       | TIMESTAMPTZ    |                                                                  |
| anulada_motivo   | TEXT           |                                                                  |
| created_at       | TIMESTAMPTZ    | DEFAULT NOW()                                                    |
| updated_at       | TIMESTAMPTZ    | DEFAULT NOW()                                                    |

**Relationships:**
- Many `facturas` → One `cliente`
- Many `facturas` → One `cita`
- Many `facturas` → One `usuario`
- Many `facturas` → One `impuesto`
- One `factura` → Many `factura_items`
- One `factura` → Many `factura_pagos`

---

### Table: `factura_items`

Line items within an invoice (services or products).

| Column           | Type           | Constraints / Notes                         |
|------------------|----------------|---------------------------------------------|
| id               | SERIAL         | PRIMARY KEY                                 |
| factura_id       | INT            | FK → facturas.id ON DELETE CASCADE          |
| tipo             | VARCHAR(10)    | CHECK IN ('SERVICIO','PRODUCTO')             |
| servicio_id      | INT            | FK → servicios.id, nullable                 |
| producto_id      | INT            | FK → productos.id, nullable                 |
| estilista_id     | INT            | FK → estilistas.id, nullable                |
| descripcion      | VARCHAR(200)   | NOT NULL                                    |
| cantidad         | NUMERIC(10,2)  | CHECK > 0                                   |
| precio_unitario  | NUMERIC(10,2)  | CHECK >= 0                                  |
| descuento        | NUMERIC(10,2)  | DEFAULT 0, CHECK >= 0                       |
| subtotal         | NUMERIC(10,2)  | DEFAULT 0                                   |

**Relationships:**
- Many `factura_items` → One `factura` (CASCADE DELETE)
- Many `factura_items` → One `servicio` (nullable)
- Many `factura_items` → One `producto` (nullable)
- Many `factura_items` → One `estilista` (nullable)
- One `factura_item` → One `comision`

---

### Table: `factura_pagos`

Payments applied to an invoice (can be split across multiple methods).

| Column           | Type           | Constraints / Notes                         |
|------------------|----------------|---------------------------------------------|
| id               | SERIAL         | PRIMARY KEY                                 |
| factura_id       | INT            | FK → facturas.id ON DELETE CASCADE          |
| metodo_pago_id   | SMALLINT       | FK → metodos_pago.id                        |
| monto            | NUMERIC(10,2)  | CHECK > 0                                   |
| referencia       | VARCHAR(100)   |                                             |
| fecha            | TIMESTAMPTZ    | DEFAULT NOW()                               |
| usuario_id       | INT            | FK → usuarios.id                            |
| observaciones    | TEXT           |                                             |

**Relationships:**
- Many `factura_pagos` → One `factura` (CASCADE DELETE)
- Many `factura_pagos` → One `metodo_pago`
- Many `factura_pagos` → One `usuario`

---

## 8. Comisiones

### Table: `comisiones`

Commission records per invoice line item for each stylist.

| Column            | Type           | Constraints / Notes                                           |
|-------------------|----------------|---------------------------------------------------------------|
| id                | SERIAL         | PRIMARY KEY                                                   |
| factura_item_id   | INT            | UNIQUE, FK → factura_items.id ON DELETE CASCADE               |
| estilista_id      | INT            | FK → estilistas.id                                            |
| base_calculo      | NUMERIC(10,2)  | CHECK >= 0                                                    |
| porcentaje        | NUMERIC(5,2)   | CHECK BETWEEN 0 AND 100                                       |
| monto             | NUMERIC(10,2)  | CHECK >= 0                                                    |
| estado            | VARCHAR(20)    | DEFAULT 'Pendiente', CHECK IN ('Pendiente','Liquidada','Anulada') |
| periodo           | VARCHAR(7)     | e.g. '2026-04' (YYYY-MM)                                      |
| liquidada_en      | TIMESTAMPTZ    |                                                               |
| liquidada_por     | INT            | FK → usuarios.id                                              |
| created_at        | TIMESTAMPTZ    | DEFAULT NOW()                                                 |

**Relationships:**
- One `comision` → One `factura_item` (CASCADE DELETE, UNIQUE)
- Many `comisiones` → One `estilista`
- Many `comisiones` → One `usuario` (liquidada_por)

---

## 9. Configuración

### Table: `configuracion`

Key-value store for system configuration parameters.

| Column       | Type         | Constraints / Notes                                      |
|--------------|--------------|----------------------------------------------------------|
| clave        | VARCHAR(60)  | PRIMARY KEY                                              |
| valor        | TEXT         | NOT NULL                                                 |
| descripcion  | VARCHAR(200) |                                                          |
| tipo_dato    | VARCHAR(20)  | DEFAULT 'texto', CHECK IN ('texto','numero','booleano','json') |
| updated_at   | TIMESTAMPTZ  | DEFAULT NOW()                                            |

---

## 10. Entity Relationship Summary

```
roles ──< usuarios >── estilistas ──< estilista_horarios
                  |                └─< estilista_excepciones
                  └──< password_resets

clientes ──< citas ──< cita_servicios
         |         └─< cita_historial
         └─── cliente_fichas
         └──< cliente_notas

categorias_servicios ──< servicios ──< servicio_insumos >── productos >── categorias_productos
                                                                      └── proveedores

cita_estados ──< citas
cita_estados ──< cita_historial

facturas ──< factura_items ──< comisiones
         └─< factura_pagos >── metodos_pago
         └── impuestos

configuracion  (standalone key-value)
movimientos_inventario >── productos
```

### Cascade Rules Summary

| Table                  | ON DELETE behavior          |
|------------------------|-----------------------------|
| password_resets        | CASCADE (usuario deleted)   |
| estilistas.usuario_id  | SET NULL (usuario deleted)  |
| estilista_horarios     | CASCADE (estilista deleted) |
| estilista_excepciones  | CASCADE (estilista deleted) |
| cliente_fichas         | CASCADE (cliente deleted)   |
| cliente_notas          | CASCADE (cliente deleted)   |
| cliente_notas.cita_id  | SET NULL (cita deleted)     |
| servicio_insumos       | CASCADE (servicio deleted)  |
| cita_servicios         | CASCADE (cita deleted)      |
| cita_historial         | CASCADE (cita deleted)      |
| factura_items          | CASCADE (factura deleted)   |
| factura_pagos          | CASCADE (factura deleted)   |
| comisiones             | CASCADE (factura_item deleted) |
