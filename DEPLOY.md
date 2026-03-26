# Guía de Despliegue — sgrl-tutorials
## Servidor: Windows Server + IIS

---

## Requisitos previos

1. **Node.js v20 LTS** instalado en el servidor
   - Descargar: https://nodejs.org/en/download
   - Verificar: `node -v` y `npm -v`

2. **iisnode** instalado en IIS
   - Descargar: https://github.com/Azure/iisnode/releases
   - Instalar el paquete MSI correspondiente (x64)

3. **URL Rewrite Module** para IIS
   - Descargar desde Microsoft Web Platform Installer
   - O directo: https://www.iis.net/downloads/microsoft/url-rewrite

4. **Acceso a SQL Server** con usuario que tenga permisos
   sobre la base de datos SGRL

---

## Paso 1 — Configurar SQL Server
```sql
-- Crear usuario de base de datos para la aplicación
CREATE LOGIN usr_tutorials WITH PASSWORD = 'Password_Segura_2024!';
CREATE USER usr_tutorials FOR LOGIN usr_tutorials;

-- Dar permisos solo sobre las tablas necesarias
GRANT SELECT, INSERT, UPDATE ON tutorials TO usr_tutorials;
GRANT SELECT, INSERT ON tutorial_access_logs TO usr_tutorials;
GRANT SELECT ON tutorial_admins TO usr_tutorials;
```

Ejecutar los scripts en orden:
```
sql/01_create_tables.sql
sql/02_seed_data.sql
```

---

## Paso 2 — Preparar el proyecto
```bash
# En tu máquina de desarrollo
cd sgrl-tutorials
npm install
npm run build
```

Copiar al servidor la carpeta completa incluyendo:
- `.next/`  (build de Next.js)
- `public/` (archivos estáticos)
- `node_modules/` (o instalar en el servidor)
- `server.js`
- `web.config`
- `.env.local` (con valores de PRODUCCIÓN)
- `package.json`

---

## Paso 3 — Configurar variables de entorno

Editar `.env.local` con los valores reales:
```env
DB_SERVER=TU_SERVIDOR_SQL
DB_DATABASE=SGRL
DB_USER=usr_tutorials
DB_PASSWORD=TU_PASSWORD

AD_SERVER=ldap://dc.mintrabajo.gov.co
AD_DOMAIN=MINTRABAJO
AD_BASE_DN=DC=mintrabajo,DC=gov,DC=co
AD_ADMIN_GROUP=GRP_SGRL_TUTORIALES_ADMIN

JWT_SECRET=cadena_larga_aleatoria_minimo_32_caracteres

UPLOAD_DIR=C:\inetpub\wwwroot\sgrl\tutorials-files
UPLOAD_BASE_URL=https://sgrl.mintrabajo.gov.co/tutorials-files
```

---

## Paso 4 — Configurar IIS

1. Abrir **IIS Manager**
2. Expandir el sitio `sgrl.mintrabajo.gov.co`
3. Clic derecho → **Add Application**
   - Alias: `tutorials`
   - Physical path: `C:\inetpub\wwwroot\sgrl\tutorials`
4. Verificar que el Application Pool tenga:
   - .NET CLR version: **No Managed Code**
   - Identity: cuenta con permisos sobre la carpeta

5. Crear carpeta de archivos subidos:
```
mkdir C:\inetpub\wwwroot\sgrl\tutorials-files
mkdir C:\inetpub\wwwroot\sgrl\tutorials-files\videos
mkdir C:\inetpub\wwwroot\sgrl\tutorials-files\pdfs
mkdir C:\inetpub\wwwroot\sgrl\tutorials-files\thumbnails
mkdir C:\inetpub\wwwroot\sgrl\tutorials-files\infografias
```

6. Dar permisos de escritura al usuario del Application Pool
   sobre la carpeta `tutorials-files`:
```
icacls "C:\inetpub\wwwroot\sgrl\tutorials-files" /grant "IIS AppPool\sgrl":(OI)(CI)F
```

---

## Paso 5 — Instalar dependencias en el servidor
```bash
cd C:\inetpub\wwwroot\sgrl\tutorials
npm install --production
```

---

## Paso 6 — Verificar funcionamiento

Abrir en el navegador:
- Portal público: `https://sgrl.mintrabajo.gov.co/tutorials`
- Admin login: `https://sgrl.mintrabajo.gov.co/tutorials/admin/login`

### Logs de iisnode
Si hay errores, revisar: