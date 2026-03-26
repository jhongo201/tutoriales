-- =============================================
-- SGRL Ministerio del Trabajo
-- Módulo: Tutoriales y Capacitación
-- =============================================

USE [SGRL_tutorials]  -- Cambia por el nombre de tu BD
GO

-- Tabla principal de tutoriales
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tutorials' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[tutorials] (
        [id]              BIGINT IDENTITY(1,1) NOT NULL,
        [title]           NVARCHAR(500)        NOT NULL,
        [description]     NVARCHAR(2000)       NULL,
        [content_type]    NVARCHAR(50)         NOT NULL,  -- VIDEO_TUTORIAL, MANUAL_PDF, FAQ, INFOGRAFIA
        [user_profile]    NVARCHAR(100)        NULL,      -- AGENTE, AGENCIA, CORREDOR, TODOS
        [operation_type]  NVARCHAR(100)        NULL,      -- REGISTRO, ACTIVACION, AUTENTICACION, etc.
        [resource_url]    NVARCHAR(1000)       NULL,      -- Ruta del archivo o URL externa
        [thumbnail_url]   NVARCHAR(1000)       NULL,      -- Ruta del thumbnail
        [display_order]   INT                  NOT NULL DEFAULT 0,
        [active]          BIT                  NOT NULL DEFAULT 1,
        [view_count]      INT                  NOT NULL DEFAULT 0,
        [download_count]  INT                  NOT NULL DEFAULT 0,
        [created_at]      DATETIME2            NOT NULL DEFAULT GETDATE(),
        [updated_at]      DATETIME2            NOT NULL DEFAULT GETDATE(),
        [created_by]      NVARCHAR(100)        NULL,
        [updated_by]      NVARCHAR(100)        NULL,
        CONSTRAINT [PK_tutorials] PRIMARY KEY CLUSTERED ([id] ASC)
    )
END
GO

-- Índices para búsqueda y filtros
CREATE NONCLUSTERED INDEX [IX_tutorials_content_type]
    ON [dbo].[tutorials] ([content_type]) WHERE [active] = 1
GO

CREATE NONCLUSTERED INDEX [IX_tutorials_user_profile]
    ON [dbo].[tutorials] ([user_profile]) WHERE [active] = 1
GO

CREATE NONCLUSTERED INDEX [IX_tutorials_operation_type]
    ON [dbo].[tutorials] ([operation_type]) WHERE [active] = 1
GO

CREATE FULLTEXT CATALOG [tutorials_catalog] AS DEFAULT
GO

-- Tabla de logs de acceso
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tutorial_access_logs' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[tutorial_access_logs] (
        [id]           BIGINT IDENTITY(1,1) NOT NULL,
        [tutorial_id]  BIGINT               NOT NULL,
        [access_date]  DATETIME2            NOT NULL DEFAULT GETDATE(),
        [ip_address]   NVARCHAR(50)         NULL,
        [user_agent]   NVARCHAR(500)        NULL,
        [action_type]  NVARCHAR(50)         NOT NULL, -- VIEW, DOWNLOAD
        CONSTRAINT [PK_tutorial_access_logs] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_logs_tutorial] FOREIGN KEY ([tutorial_id])
            REFERENCES [dbo].[tutorials] ([id]) ON DELETE CASCADE
    )
END
GO

CREATE NONCLUSTERED INDEX [IX_logs_tutorial_id]
    ON [dbo].[tutorial_access_logs] ([tutorial_id], [access_date] DESC)
GO

-- Tabla de administradores locales (fallback si AD no está disponible)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tutorial_admins' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[tutorial_admins] (
        [id]           INT IDENTITY(1,1)    NOT NULL,
        [username]     NVARCHAR(100)        NOT NULL UNIQUE,
        [display_name] NVARCHAR(200)        NULL,
        [email]        NVARCHAR(200)        NULL,
        [active]       BIT                  NOT NULL DEFAULT 1,
        [created_at]   DATETIME2            NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_tutorial_admins] PRIMARY KEY CLUSTERED ([id] ASC)
    )
END
GO

-- Tabla de tipos de contenido
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tutorial_content_types' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[tutorial_content_types] (
        [id]            INT IDENTITY(1,1)   NOT NULL,
        [code]          NVARCHAR(50)        NOT NULL UNIQUE,
        [label]         NVARCHAR(200)       NOT NULL,
        [active]        BIT                 NOT NULL DEFAULT 1,
        [display_order] INT                 NOT NULL DEFAULT 0,
        [created_at]    DATETIME2           NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_tutorial_content_types] PRIMARY KEY CLUSTERED ([id] ASC)
    )
END
GO

-- Tabla de perfiles de usuario
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tutorial_user_profiles' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[tutorial_user_profiles] (
        [id]            INT IDENTITY(1,1)   NOT NULL,
        [code]          NVARCHAR(100)       NOT NULL UNIQUE,
        [label]         NVARCHAR(200)       NOT NULL,
        [active]        BIT                 NOT NULL DEFAULT 1,
        [display_order] INT                 NOT NULL DEFAULT 0,
        [created_at]    DATETIME2           NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_tutorial_user_profiles] PRIMARY KEY CLUSTERED ([id] ASC)
    )
END
GO

-- Tabla de tipos de operación
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tutorial_operation_types' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[tutorial_operation_types] (
        [id]            INT IDENTITY(1,1)   NOT NULL,
        [code]          NVARCHAR(100)       NOT NULL UNIQUE,
        [label]         NVARCHAR(200)       NOT NULL,
        [active]        BIT                 NOT NULL DEFAULT 1,
        [display_order] INT                 NOT NULL DEFAULT 0,
        [created_at]    DATETIME2           NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_tutorial_operation_types] PRIMARY KEY CLUSTERED ([id] ASC)
    )
END
GO

-- Insertar datos iniciales en las tablas de tipos de contenido, perfiles de usuario y tipos de operación
IF NOT EXISTS (SELECT 1 FROM [dbo].[tutorial_content_types])
BEGIN
    INSERT INTO [dbo].[tutorial_content_types] ([code], [label], [display_order], [active]) VALUES
      ('VIDEO_TUTORIAL', 'Video Tutorial', 1, 1),
      ('MANUAL_PDF', 'Manual PDF', 2, 1),
      ('FAQ', 'Pregunta Frecuente', 3, 1),
      ('INFOGRAFIA', 'Infografía', 4, 1)
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[tutorial_user_profiles])
BEGIN
    INSERT INTO [dbo].[tutorial_user_profiles] ([code], [label], [display_order], [active]) VALUES
      ('TODOS', 'Todos los Perfiles', 1, 1),
      ('AGENTE', 'Agente de Seguros', 2, 1),
      ('AGENCIA', 'Agencia de Seguros', 3, 1),
      ('CORREDOR', 'Corredor de Seguros', 4, 1)
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[tutorial_operation_types])
BEGIN
    INSERT INTO [dbo].[tutorial_operation_types] ([code], [label], [display_order], [active]) VALUES
      ('REGISTRO', 'Registro', 1, 1),
      ('ACTIVACION', 'Activación', 2, 1),
      ('AUTENTICACION', 'Autenticación', 3, 1),
      ('RECUPERACION', 'Recuperación', 4, 1),
      ('RENOVACION', 'Renovación', 5, 1),
      ('ACTUALIZACION', 'Actualización', 6, 1),
      ('CONSULTA', 'Consulta', 7, 1)
END
GO

PRINT 'Tablas creadas exitosamente'
GO