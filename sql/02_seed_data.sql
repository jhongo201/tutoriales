USE [SGRL]
GO

INSERT INTO [dbo].[tutorials]
    ([title],[description],[content_type],[user_profile],[operation_type],[resource_url],[thumbnail_url],[display_order],[active])
VALUES
    ('Cómo registrarse como Agente de Seguros',
     'Tutorial paso a paso del proceso de registro para agentes de seguros individuales',
     'VIDEO_TUTORIAL','AGENTE','REGISTRO',
     '/uploads/videos/registro-agente.mp4','/uploads/thumbnails/thumb-1.jpg',1,1),

    ('Proceso de Activación de Cuenta',
     'Guía completa para activar tu cuenta después del registro',
     'VIDEO_TUTORIAL','TODOS','ACTIVACION',
     '/uploads/videos/activacion-cuenta.mp4','/uploads/thumbnails/thumb-2.jpg',2,1),

    ('Manual de Registro - Agentes de Seguros',
     'Guía detallada del proceso de registro con capturas de pantalla',
     'MANUAL_PDF','AGENTE','REGISTRO',
     '/uploads/pdfs/manual-registro-agentes.pdf','/uploads/thumbnails/thumb-pdf-1.jpg',4,1),

    ('¿Cómo recupero mi contraseña?',
     'Pasos detallados para recuperar tu contraseña mediante correo electrónico',
     'FAQ','TODOS','RECUPERACION',
     NULL,'/uploads/thumbnails/thumb-faq-1.jpg',5,1),

    ('Proceso de Registro - Flujo Visual',
     'Infografía que muestra el flujo completo del proceso de registro',
     'INFOGRAFIA','TODOS','REGISTRO',
     '/uploads/infografias/flujo-registro.jpg','/uploads/thumbnails/thumb-info-1.jpg',6,1)
GO

-- Administrador local de ejemplo (para pruebas)
INSERT INTO [dbo].[tutorial_admins] ([username],[display_name],[email])
VALUES ('admin.tutorials','Administrador Tutoriales','admin@mintrabajo.gov.co')
GO

PRINT 'Datos de ejemplo insertados'
GO