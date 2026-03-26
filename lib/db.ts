import sql from 'mssql'

const config: sql.config = {
  server: process.env.DB_SERVER!,
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_DATABASE!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '3000'),
  requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT || '30000'),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate:
      process.env.DB_TRUST_SERVER_CERT === 'true' ||
      (process.env.NODE_ENV !== 'production' && process.env.DB_TRUST_SERVER_CERT !== 'false'),
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

declare global {
  var __sgrlMssqlPool: sql.ConnectionPool | undefined
}

let pool: sql.ConnectionPool | null = global.__sgrlMssqlPool || null

export async function getDb(): Promise<sql.ConnectionPool> {
  if (!pool) {
    try {
      pool = await new sql.ConnectionPool(config).connect()
      global.__sgrlMssqlPool = pool
      console.log(' Conexión a SQL Server establecida')
    } catch (err: any) {
      const code = err?.code || err?.cause?.code
      const isSelfSigned = code === 'DEPTH_ZERO_SELF_SIGNED_CERT'
      const isTimeout = code === 'ETIMEOUT'

      if (process.env.NODE_ENV === 'production') throw err

      const candidates: sql.config[] = []

      // 1) Certificado autosignado: reintentar confiando en el cert
      if (isSelfSigned) {
        candidates.push({
          ...config,
          options: {
            ...(config.options || {}),
            trustServerCertificate: true,
          },
        })
      }

      // 2) Timeout: típico cuando el puerto no es el correcto. Probar 1433.
      if (isTimeout && (config.port as any) !== 1433) {
        candidates.push({
          ...config,
          port: 1433,
          options: {
            ...(config.options || {}),
            trustServerCertificate: true,
          },
        })
      }

      // 3) Fallback local: algunos entornos requieren localhost
      if (isTimeout && config.server && config.server.toLowerCase() !== 'localhost') {
        candidates.push({
          ...config,
          server: 'localhost',
          options: {
            ...(config.options || {}),
            trustServerCertificate: true,
          },
        })
      }

      for (let i = 0; i < candidates.length; i++) {
        const c = candidates[i]
        try {
          pool = await new sql.ConnectionPool(c).connect()
          global.__sgrlMssqlPool = pool
          console.log(` Conexión a SQL Server establecida (retry ${i + 1})`)
          break
        } catch {
          // try next
        }
      }

      if (!pool) throw err
    }
  }
  return pool
}

export { sql }