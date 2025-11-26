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

-- Función para reiniciar la secuencia al inicio de cada año (opcional)
-- Se puede ejecutar manualmente o configurar con un cron job
CREATE OR REPLACE FUNCTION reiniciar_secuencia_anual()
RETURNS void AS $$
BEGIN
  ALTER SEQUENCE usuario_sequence RESTART WITH 1;
END;
$$ LANGUAGE plpgsql;

-- Función para validar formato de RFC
CREATE OR REPLACE FUNCTION validar_formato_rfc(rfc TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- RFC de persona física: 13 caracteres (4 letras + 6 dígitos + 3 caracteres)
  RETURN rfc ~ '^[A-ZÑ&]{4}[0-9]{6}[A-Z0-9]{3}$';
END;
$$ LANGUAGE plpgsql;

-- Función para validar formato de CURP
CREATE OR REPLACE FUNCTION validar_formato_curp(curp TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- CURP: 18 caracteres
  -- 4 letras + 6 dígitos + 1 letra + 5 caracteres + 1 dígito + 1 dígito
  RETURN curp ~ '^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9]{2}$';
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON SEQUENCE usuario_sequence IS 'Secuencia para numeración de usuarios del 1 al 100, se reinicia automáticamente';
COMMENT ON FUNCTION generar_usuario_id(TEXT) IS 'Genera un ID único para usuario con formato: año-identificador-numero donde identificador puede ser RFC o CURP';
COMMENT ON FUNCTION reiniciar_secuencia_anual() IS 'Reinicia la secuencia de usuarios a 1, debe ejecutarse al inicio de cada año';
COMMENT ON FUNCTION validar_formato_rfc(TEXT) IS 'Valida que un RFC tenga el formato correcto (12 o 13 caracteres)';
COMMENT ON FUNCTION validar_formato_curp(TEXT) IS 'Valida que un CURP tenga el formato correcto (18 caracteres)';