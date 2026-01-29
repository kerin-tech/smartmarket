import { config as configDotenv } from 'dotenv';
import server from './server';
import { printAppInfo } from './utils/print-app-info';
import appConfig from './config/app.config';
import prismaClient from '@/config/database';
import environment from '@/config/env';
import { globalErrorHandler } from './middlewares/error.middleware';

configDotenv();

// --- CONFIGURACIÓN DE MIDDLEWARES FINALES ---

// El manejador de errores global debe ir DESPUÉS de todas las rutas.
server.use(globalErrorHandler);

// --- ARRANQUE DEL SERVIDOR ---

const PORT = process.env.PORT || 5000;

const httpServer = server.listen(PORT, () => {
  const { port, env, appUrl: _appUrl } = environment;
  const {
    api: { basePath, version },
  } = appConfig;
  
  const appUrl = `${_appUrl}:${port}`;
  const apiUrl = `${appUrl}/${basePath}/${version}/${env}`;
  
  printAppInfo(port, env, appUrl, apiUrl);
});

// --- CONFIGURACIÓN DE TIMEOUTS ---
// Importante para operaciones largas como escaneo de tickets con IA

httpServer.keepAliveTimeout = 180000;  // 3 minutos - mantener conexión viva
httpServer.headersTimeout = 185000;    // Un poco más que keepAliveTimeout
httpServer.timeout = 180000;           // Timeout general del servidor

console.log('⏱️  Server timeout configured: 3 minutes for long operations');

// --- GESTIÓN DE CIERRE (GRACEFUL SHUTDOWN) ---

const shutDown = async () => {
  console.log('\nClosing HTTP server...');
  
  // Cerrar servidor HTTP primero
  httpServer.close(async () => {
    console.log('HTTP server closed.');
    
    try {
      await prismaClient.$disconnect();
      console.log('Prisma Disconnected.');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });

  // Forzar cierre después de 10 segundos si no se cierra gracefully
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Captura señales de terminación (Ctrl+C o cierre de proceso)
process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);