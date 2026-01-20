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
  MAXVALUE 100
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
  MAXVALUE 100
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
  MAXVALUE 100
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
