-- Habilitar extensión para generación nativa de UUIDs (v4)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. ENUMS
-- ==========================================

CREATE TYPE "Rol" AS ENUM (
  'AUTOR',
  'REVISOR',
  'COMITE',
  'ADMIN'
);

CREATE TYPE "EstadoTrabajo" AS ENUM (
  'REGISTRADO',
  'EN_REVISION',
  'ACEPTADO',
  'RECHAZADO'
);

CREATE TYPE "GrupoRubrica" AS ENUM (
  'DIFUSION',
  'DIVULGACION'
);

CREATE TYPE "TipoToken" AS ENUM (
  'VERIFICACION',
  'RESTABLECIMIENTO',
  'INVITACION'
);

-- ==========================================
-- 2. FUNCIÓN TRIGGER PARA @updatedAt
-- ==========================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 3. TABLAS
-- ==========================================

-- Tabla: Usuarios
CREATE TABLE "Usuarios" (
  "id"              VARCHAR(255) PRIMARY KEY,
  "email"           VARCHAR(255) NOT NULL UNIQUE,
  "rfc"             VARCHAR(255) UNIQUE,
  "curp"            VARCHAR(255) UNIQUE,
  "numero_control"  VARCHAR(255) UNIQUE,
  "nombre"          VARCHAR(255) NOT NULL,
  "apellidoP"       VARCHAR(255) NOT NULL,
  "apellidoM"       VARCHAR(255) NOT NULL,
  "password"        VARCHAR(255) NOT NULL,
  "rol"             "Rol" NOT NULL DEFAULT 'AUTOR',
  "activa"          BOOLEAN NOT NULL DEFAULT FALSE,
  "bloqueada"          BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_usuarios_updated_at
BEFORE UPDATE ON "Usuarios"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Tabla: Convocatorias
CREATE TABLE "Convocatorias" (
  "id"            VARCHAR(255) PRIMARY KEY,
  "titulo"        VARCHAR(255) NOT NULL,
  "descripcion"   TEXT NOT NULL,
  "fecha_inicio"  TIMESTAMPTZ NOT NULL,
  "fecha_cierre"  TIMESTAMPTZ NOT NULL,
  "archivo_url"   TEXT NOT NULL,
  "activa"        BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_convocatorias_updated_at
BEFORE UPDATE ON "Convocatorias"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Tabla: Trabajos
CREATE TABLE "Trabajos" (
  "id"                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "archivo_url"         TEXT NOT NULL,
  "estado"              "EstadoTrabajo" NOT NULL DEFAULT 'REGISTRADO',
  "titulo"              VARCHAR(255) NOT NULL,
  "tipo"                "GrupoRubrica" NOT NULL,
  "presencial"          BOOLEAN,
  "nvl_ia"              DOUBLE PRECISION,
  "nvl_plagio"          DOUBLE PRECISION,
  "calificacion_final"  DOUBLE PRECISION,
  "referencia_pago"     VARCHAR(255) UNIQUE,
  "usuarioId"           VARCHAR(255) NOT NULL,
  "convocatoriaId"      VARCHAR(255) NOT NULL,
  "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_trabajos_usuario
    FOREIGN KEY ("usuarioId") 
    REFERENCES "Usuarios"("id") 
    ON DELETE CASCADE,

  CONSTRAINT fk_trabajos_convocatoria
    FOREIGN KEY ("convocatoriaId") 
    REFERENCES "Convocatorias"("id") 
    ON DELETE CASCADE
);

CREATE INDEX idx_trabajos_usuarioId ON "Trabajos"("usuarioId");
CREATE INDEX idx_trabajos_convocatoriaId ON "Trabajos"("convocatoriaId");
CREATE INDEX idx_trabajos_estado ON "Trabajos"("estado");

CREATE TRIGGER trg_trabajos_updated_at
BEFORE UPDATE ON "Trabajos"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Tabla: Coautores
CREATE TABLE "Coautores" (
  "id"         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "idTrabajo"  TEXT NOT NULL,
  "nombre"     VARCHAR(255) NOT NULL,
  "email"      VARCHAR(255) NOT NULL,

  CONSTRAINT fk_coautores_trabajo
    FOREIGN KEY ("idTrabajo") 
    REFERENCES "Trabajos"("id") 
    ON DELETE CASCADE
);

CREATE INDEX idx_coautores_idTrabajo ON "Coautores"("idTrabajo");

-- Tabla: Asignaciones
CREATE TABLE "Asignaciones" (
  "id"            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "activa"        BOOLEAN NOT NULL DEFAULT TRUE,
  "comentario"    TEXT,
  "calificacion"  DOUBLE PRECISION,
  "trabajoId"     TEXT NOT NULL,
  "revisorId"     VARCHAR(255) NOT NULL,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closeAt"       TIMESTAMPTZ,

  CONSTRAINT fk_asignaciones_trabajo
    FOREIGN KEY ("trabajoId") 
    REFERENCES "Trabajos"("id") 
    ON DELETE CASCADE,

  CONSTRAINT fk_asignaciones_revisor
    FOREIGN KEY ("revisorId") 
    REFERENCES "Usuarios"("id") 
    ON DELETE CASCADE,

  CONSTRAINT uq_asignaciones_trabajo_revisor
    UNIQUE ("trabajoId", "revisorId")
);

CREATE INDEX idx_asignaciones_trabajoId ON "Asignaciones"("trabajoId");
CREATE INDEX idx_asignaciones_revisorId ON "Asignaciones"("revisorId");
CREATE INDEX idx_asignaciones_activa ON "Asignaciones"("activa");

-- Tabla: CriteriosEvaluacion
CREATE TABLE "CriteriosEvaluacion" (
  "id"                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "nombre"               VARCHAR(255) NOT NULL,
  "descripcion"          TEXT NOT NULL,
  "grupo"                "GrupoRubrica" NOT NULL,
  "descripcion_puntaje"  TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt"            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_criteriosevaluacion_updated_at
BEFORE UPDATE ON "CriteriosEvaluacion"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Tabla: Tokens
CREATE TABLE "Tokens" (
  "token"      VARCHAR(255) PRIMARY KEY,
  "email"      VARCHAR(255) NOT NULL,
  "tipo"       "TipoToken" NOT NULL,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt"  TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_tokens_email_tipo ON "Tokens"("email", "tipo");
CREATE INDEX idx_tokens_expiresAt ON "Tokens"("expiresAt");