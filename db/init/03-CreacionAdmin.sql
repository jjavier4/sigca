INSERT INTO "Usuarios" (
    "id", "email", "rfc", "curp", "numero_control",
    "nombre", "apellidoP", "apellidoM",
    "password", "rol", "activa"
)
VALUES (
    generar_usuario_id('PAJA850101HMCLRV09'),    -- identificador = CURP
    'admin@example.com',
    NULL,
    'PAJA850101HMCLRV09',
    NULL,
    'Admin',
    'Sistema',
    'Root',
    '$2b$10$GO4o44WD9UShVAZct4JOGeBrmDmO2mN3TG8zNOP7iK0e/V9AouNty',
    'COMITE',
    TRUE
);