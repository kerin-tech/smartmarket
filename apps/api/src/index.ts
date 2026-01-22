import { config as configDotenv } from 'dotenv';
import server from './server';
import { printAppInfo } from './utils/print-app-info';
import appConfig from './config/app.config';
import prismaClient from '@/config/database';
import environment from '@/config/env';
import { globalErrorHandler } from './middlewares/error.middleware'; // Importamos el manejador de TECH-07

configDotenv();

// --- CONFIGURACIÓN DE MIDDLEWARES FINALES ---

// El manejador de errores global debe ir DESPUÉS de todas las rutas.
// Como tus rutas están dentro del objeto 'server' (que es tu app de Express),
// lo inyectamos aquí para centralizar TECH-07.
server.use(globalErrorHandler);

// --- ARRANQUE DEL SERVIDOR ---

server.listen(process.env.PORT, () => {
  const { port, env, appUrl: _appUrl } = environment;
  const {
    api: { basePath, version },
  } = appConfig;
  
  const appUrl = `${_appUrl}:${port}`;
  const apiUrl = `${appUrl}/${basePath}/${version}/${env}`;
  
  printAppInfo(port, env, appUrl, apiUrl);
});

// --- GESTIÓN DE CIERRE (GRACEFUL SHUTDOWN) ---

const shutDown = async () => {
  console.log('\nClosing HTTP server...');
  try {
    await prismaClient.$disconnect();
    console.log('Prisma Disconnected.');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

// Captura señales de terminación (Ctrl+C o cierre de proceso)
process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);