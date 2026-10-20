-- Script para crear la secuencia de usuarios
-- Este script debe ejecutarse en PostgreSQL después de crear las tablas

-- Crear la secuencia que va del 1 al 100
CREATE SEQUENCE IF NOT EXISTS usuario_sequence
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 100
  CYCLE;

-- Función para generar el ID del usuario con formato: año-identificador-numero
-- El identificador puede ser RFC o CURP según lo que proporcione el usuario
CREATE OR REPLACE FUNCTION generar_usuario_id(identificador TEXT)
RETURNS TEXT AS $$
DECLARE
  anio_actual TEXT;
  numero_secuencia TEXT;
  nuevo_id TEXT;
  identificador_limpio TEXT;
BEGIN
  -- Obtener el año actual
  anio_actual := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Limpiar el identificador (convertir a mayúsculas y quitar espacios)
  identificador_limpio := UPPER(TRIM(identificador));
  
  -- Obtener el siguiente número de la secuencia y formatearlo con 3 dígitos
  numero_secuencia := LPAD(nextval('usuario_sequence')::TEXT, 3, '0');
  
  -- Construir el ID con formato: año-identificador-numero
  -- Ejemplo con RFC: 2025-PAJA850101XXX-001
  -- Ejemplo con CURP: 2025-PAJA850101HMCLRV09-001
  nuevo_id := anio_actual || '-' || identificador_limpio || '-' || numero_secuencia;
  
  RETURN nuevo_id;
END;
$$ LANGUAGE plpgsql;



-- ============================================
-- SECUENCIAS Y FUNCIONES PARA CONVOCATORIAS
-- ============================================

-- Crear la secuencia de convocatorias
CREATE SEQUENCE IF NOT EXISTS convocatoria_sequence
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 999
  CYCLE;

-- Función para generar ID de convocatoria: año-numero
CREATE OR REPLACE FUNCTION generar_convocatoria_id()
RETURNS TEXT AS $$
DECLARE
  anio_actual TEXT;
  numero_secuencia TEXT;
  nuevo_id TEXT;
  identificador TEXT := 'C';
BEGIN
  anio_actual := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  numero_secuencia := LPAD(nextval('convocatoria_sequence')::TEXT, 3, '0');
  nuevo_id := anio_actual || '-' || identificador || '-' || numero_secuencia;
  
  RETURN nuevo_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- SECUENCIAS Y FUNCIONES PARA ASIGNACIONES
-- ============================================

-- Crear la secuencia de asignaciones
CREATE SEQUENCE IF NOT EXISTS asignacion_sequence
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 999
  CYCLE;

-- Función para generar ID de asignacion: año-numero
CREATE OR REPLACE FUNCTION generar_asignacion_id()
RETURNS TEXT AS $$
DECLARE
  anio_actual TEXT;
  numero_secuencia TEXT;
  nuevo_id TEXT;
  identificador TEXT := 'A';
BEGIN
  anio_actual := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  numero_secuencia := LPAD(nextval('asignacion_sequence')::TEXT, 3, '0');
  nuevo_id := anio_actual || '-' || identificador || '-' || numero_secuencia;
  
  RETURN nuevo_id;
END;
$$ LANGUAGE plpgsql;

-- Función para reiniciar secuencia de asignaciones (ejecutar anualmente)
CREATE OR REPLACE FUNCTION reiniciar_secuencia_asignaciones()
RETURNS void AS $$
BEGIN
  ALTER SEQUENCE asignacion_sequence RESTART WITH 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SECUENCIAS Y FUNCIONES PARA TRABAJOS
-- ============================================

-- Crear la secuencia de trabajos
CREATE SEQUENCE IF NOT EXISTS trabajo_sequence
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  MAXVALUE 999
  CYCLE;

-- Función para generar ID de trabajo: año-numero
CREATE OR REPLACE FUNCTION generar_trabajo_id()
RETURNS TEXT AS $$
DECLARE
  anio_actual TEXT;
  numero_secuencia TEXT;
  nuevo_id TEXT;
  identificador TEXT := 'T';
BEGIN
  anio_actual := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  numero_secuencia := LPAD(nextval('trabajo_sequence')::TEXT, 3, '0');
  nuevo_id := anio_actual || '-' || identificador || '-' || numero_secuencia;
  
  RETURN nuevo_id;
END;
$$ LANGUAGE plpgsql;

-- Función para reiniciar secuencia de trabajos (ejecutar anualmente)
CREATE OR REPLACE FUNCTION reiniciar_secuencia_trabajos()
RETURNS void AS $$
BEGIN
  ALTER SEQUENCE trabajo_sequence RESTART WITH 1;
END;
$$ LANGUAGE plpgsql;
-- ============================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ============================================

COMMENT ON SEQUENCE usuario_sequence IS 'Secuencia para numeración de usuarios del 1 al 100';
COMMENT ON SEQUENCE convocatoria_sequence IS 'Secuencia para numeración de convocatorias del 1 al 999';
COMMENT ON SEQUENCE asignacion_sequence IS 'Secuencia para numeración de asignaciones del 1 al 999';
COMMENT ON SEQUENCE trabajo_sequence IS 'Secuencia para numeración de trabajos del 1 al 999';
COMMENT ON FUNCTION generar_usuario_id(TEXT) IS 'Genera ID único: año-identificador-numero (ej: 2025-PAJA850101XXX-001)';
COMMENT ON FUNCTION generar_convocatoria_id() IS 'Genera ID único: año-numero (ej: 2025-C-001)';
COMMENT ON FUNCTION generar_asignacion_id() IS 'Genera ID único: año-numero (ej: 2025-A-001)';
COMMENT ON FUNCTION generar_trabajo_id() IS 'Genera ID único: año-numero (ej: 2025-T-001)';



COMMENT ON COLUMN "Convocatorias"."id" IS 'ID generado con formato: año-identificador-numero de secuencia, por ejemplo: 2024-C-001';
COMMENT ON COLUMN "Usuarios"."numero_control" IS 'Número de control único del usuario, puede ser nulo si el usuario no es estudiante';
COMMENT ON COLUMN "Usuarios"."activa" IS 'Indica si la cuenta del usuario está activa. Por defecto es FALSE, y se activa mediante un token de verificación enviado al correo electrónico del usuario.'; 
COMMENT ON COLUMN "Trabajos"."archivo_url" IS 'URL del archivo subido para el trabajo';
COMMENT ON COLUMN "Trabajos"."estado" IS 'Estado actual del trabajo, por defecto es REGISTRADO; pasa a EN_REVISION al registrar el análisis de IA y plagio';
COMMENT ON COLUMN "Trabajos"."tipo" IS 'Tipo de trabajo, por ejemplo: DIFUSION o DIVULGACION';
COMMENT ON COLUMN "Trabajos"."presencial" IS 'Indica si el trabajo es presencial. Por defecto es NULL.';
COMMENT ON COLUMN "Trabajos"."nvl_ia" IS 'Nivel de inteligencia artificial detectado en el trabajo. Por defecto es NULL.';
COMMENT ON COLUMN "Trabajos"."nvl_plagio" IS 'Nivel de plagio detectado en el trabajo. Por defecto es NULL.';
COMMENT ON COLUMN "Trabajos"."calificacion_final" IS 'Calificación final del trabajo. Por defecto es NULL.';
COMMENT ON COLUMN "Trabajos"."referencia_pago" IS 'Referencia de pago para el trabajo. Por defecto es NULL.';
COMMENT ON COLUMN "Asignaciones"."createdAt" IS 'Fecha y hora en que se crea la asignación. Por defecto es la fecha y hora actual.';
COMMENT ON COLUMN "Asignaciones"."closeAt" IS 'Fecha y hora en que se cierra la asignación, por ejemplo, cuando el revisor envía su revisión. Por defecto es NULL hasta que se cierre la asignación.';
COMMENT ON COLUMN "Asignaciones"."comentario" IS 'Comentario sobre la asignación. Por defecto es NULL.';
COMMENT ON COLUMN "Asignaciones"."calificacion" IS 'Calificación de la asignación. Por defecto es NULL.';
COMMENT ON COLUMN "CriteriosEvaluacion"."nombre" IS 'Nombre del criterio de evaluación';
COMMENT ON COLUMN "CriteriosEvaluacion"."descripcion" IS 'Descripción del criterio de evaluación';
COMMENT ON COLUMN "CriteriosEvaluacion"."grupo" IS 'Grupo al que pertenece el criterio de evaluación, por ejemplo: DIFUSION o DIVULGACION';
COMMENT ON COLUMN "CriteriosEvaluacion"."descripcion_puntaje" IS 'Descripción de los puntajes asociados al criterio de evaluación';
COMMENT ON COLUMN "CriteriosEvaluacion"."createdAt" IS 'Fecha y hora en que se crea el criterio de evaluación. Por defecto es la fecha y hora actual.';
