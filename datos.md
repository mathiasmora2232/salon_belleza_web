-- =============================================================================
-- DATOS INICIALES — Mínimo indispensable para arrancar el backend
-- Ejecutar conectado a la base 'salon_belleza', DESPUÉS de salon_db.sql
-- =============================================================================


-- -----------------------------------------------------------------------------
-- CATÁLOGOS (sin estos datos el sistema no funciona)
-- -----------------------------------------------------------------------------

-- Roles
INSERT INTO roles (nombre, descripcion) VALUES
  ('Administrador', 'Acceso total al sistema'),
  ('Recepcionista', 'Agenda citas, registra clientes, cobra'),
  ('Estilista',     'Ve su agenda, registra servicios realizados'),
  ('Cajero',        'Facturación y cobros'),
  ('Cliente',       'Cliente registrado desde la web — acceso solo a su perfil');


-- Estados de cita
-- PENDIENTE es el estado inicial asignado por el formulario público de reserva
INSERT INTO cita_estados (codigo, nombre, color_hex, es_final, orden) VALUES
  ('PENDIENTE','Pendiente',  '#f59e0b', FALSE, 0),
  ('AGE','Agendada',         '#3B82F6', FALSE, 1),
  ('CON','Confirmada',       '#10B981', FALSE, 2),
  ('CUR','En curso',         '#F59E0B', FALSE, 3),
  ('FIN','Finalizada',       '#059669', TRUE,  4),
  ('CAN','Cancelada',        '#EF4444', TRUE,  5),
  ('NAS','No asistió',       '#6B7280', TRUE,  6);


-- Métodos de pago
INSERT INTO metodos_pago (codigo, nombre) VALUES
  ('EFE','Efectivo'),
  ('TRA','Transferencia'),
  ('TDB','Tarjeta débito'),
  ('TCR','Tarjeta crédito'),
  ('DEU','Depósito'),
  ('MIX','Mixto');


-- Impuestos
INSERT INTO impuestos (codigo, nombre, porcentaje, es_default) VALUES
  ('IVA15','IVA 15%', 15.00, TRUE),
  ('IVA0', 'IVA 0%',   0.00, FALSE);


-- Configuración general
INSERT INTO configuracion (clave, valor, descripcion, tipo_dato) VALUES
  ('salon_nombre',              'Salón Elegance',                'Nombre comercial',         'texto'),
  ('salon_direccion',           'Urdesa, Av. V.E. Estrada 123',  'Dirección del salón',      'texto'),
  ('salon_telefono',            '042345678',                     'Teléfono principal',       'texto'),
  ('salon_email',               'info@elegance.ec',              'Email de contacto',        'texto'),
  ('factura_prefijo',           'F-',                            'Prefijo de factura',       'texto'),
  ('factura_secuencia',         '1',                             'Próximo número',           'numero'),
  ('iva_default',               '15',                            'IVA default %',            'numero'),
  ('duracion_slot_min',         '15',                            'Slot del calendario (min)','numero');


-- -----------------------------------------------------------------------------
-- ADMIN INICIAL
-- -----------------------------------------------------------------------------
-- IMPORTANTE: el password_hash de abajo es un PLACEHOLDER. Tienes que:
--   1) Generar un hash real con BCrypt desde Java, por ejemplo:
--        new BCryptPasswordEncoder().encode("Admin123!")
--   2) Reemplazarlo con UPDATE usuarios SET password_hash = '...' WHERE username = 'admin';
--
-- O mejor: borra este INSERT y crea el admin desde tu endpoint de registro
-- una vez que Spring esté corriendo.

INSERT INTO usuarios (rol_id, username, email, password_hash, nombre_completo, telefono) VALUES
  (1, 'admin', 'admin@salon.ec',
   '$2a$10$PLACEHOLDER_REEMPLAZAR_CON_HASH_REAL_DESDE_JAVA',
   'Administrador', '0999000000');


-- -----------------------------------------------------------------------------
-- CATEGORÍAS (para que tus endpoints GET /categorias devuelvan algo)
-- -----------------------------------------------------------------------------

INSERT INTO categorias_servicios (nombre, descripcion, icono, orden) VALUES
  ('Cortes',       'Cortes de cabello',              'scissors', 1),
  ('Color',        'Tinturas, mechas, matices',      'palette',  2),
  ('Tratamientos', 'Hidratación, keratina, alisado', 'droplet',  3),
  ('Peinados',     'Peinados y secados',             'wind',     4),
  ('Uñas',         'Manicura y pedicura',            'hand',     5),
  ('Barbería',     'Corte y arreglo de barba',       'user',     6);


INSERT INTO categorias_productos (nombre, descripcion) VALUES
  ('Shampoo / Acondicionador', 'Productos de lavado'),
  ('Tinturas',                 'Tintes y decolorantes'),
  ('Tratamientos',             'Mascarillas y keratinas'),
  ('Styling',                  'Sprays, geles, ceras'),
  ('Uñas',                     'Esmaltes y productos para uñas'),
  ('Herramientas',             'Utensilios');


-- -----------------------------------------------------------------------------
-- SERVICIOS DE MUESTRA (6 servicios — suficiente para probar)
-- -----------------------------------------------------------------------------

INSERT INTO servicios (categoria_id, nombre, descripcion, precio, duracion_min) VALUES
  (1, 'Corte dama',      'Corte con lavado y secado', 15.00, 45),
  (1, 'Corte caballero', 'Corte masculino clásico',   10.00, 30),
  (2, 'Tintura completa','Color en todo el cabello',  45.00, 90),
  (2, 'Retoque de raíz', 'Tintura solo en raíz',      25.00, 60),
  (3, 'Keratina',        'Tratamiento de keratina',   80.00,150),
  (5, 'Manicura',        'Limado + esmalte',          10.00, 45);


-- -----------------------------------------------------------------------------
-- ESTILISTAS DE MUESTRA (3 estilistas, sin usuario vinculado todavía)
-- -----------------------------------------------------------------------------

INSERT INTO estilistas (nombre, telefono, especialidad, experiencia_anios, comision_porcentaje) VALUES
  ('Ana Morales', '0999333444','Colorimetría y mechas',        8, 25.00),
  ('Luis Pérez',  '0999444555','Cortes masculinos y barbería', 5, 20.00),
  ('Diana Castro','0999555666','Alisados y tratamientos',     12, 30.00);


-- Horarios de Ana: L-V 9am-6pm, Sáb 9am-2pm
INSERT INTO estilista_horarios (estilista_id, dia_semana, hora_inicio, hora_fin) VALUES
  (1,1,'09:00','18:00'),(1,2,'09:00','18:00'),(1,3,'09:00','18:00'),
  (1,4,'09:00','18:00'),(1,5,'09:00','18:00'),(1,6,'09:00','14:00'),
  (2,1,'10:00','19:00'),(2,2,'10:00','19:00'),(2,3,'10:00','19:00'),
  (2,4,'10:00','19:00'),(2,5,'10:00','19:00'),(2,6,'10:00','15:00'),
  (3,2,'09:00','18:00'),(3,3,'09:00','18:00'),(3,4,'09:00','18:00'),
  (3,5,'09:00','18:00'),(3,6,'09:00','14:00');


-- -----------------------------------------------------------------------------
-- CLIENTES DE MUESTRA (3 clientes — suficiente para probar)
-- -----------------------------------------------------------------------------

INSERT INTO clientes (tipo_identificacion, numero_identificacion, nombre, apellido, telefono, email, genero, ciudad) VALUES
  ('CEDULA','0912345678','María',    'García Loor',     '0991111001','maria.garcia@gmail.com','Femenino', 'Guayaquil'),
  ('CEDULA','0923456789','Juan',     'Pérez Quintero',  '0991111002','juanp@hotmail.com',     'Masculino','Guayaquil'),
  ('CEDULA','0934567890','Lucía',    'Vera Andrade',    '0991111003','luciav@gmail.com',      'Femenino', 'Guayaquil');


-- =============================================================================
-- FIN
-- =============================================================================