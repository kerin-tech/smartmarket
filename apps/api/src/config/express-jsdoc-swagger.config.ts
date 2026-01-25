import * as path from 'path';
import appConfig from './app.config';

// Leemos directamente de process.env para evitar la referencia circular de la clase Environment
const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';
const port = process.env.PORT || appConfig.defaultPort;
const appUrl = process.env.APP_BASE_URL || 'http://localhost';

const {
  api: { basePath, version },
  docs: { swaggerUIPath, apiDocsPath },
} = appConfig;

const baseDir = path.resolve(__dirname, '../../');

// Construcción de la URL sin depender de la instancia de la clase
const swaggerUrl = isProd 
  ? `${appUrl}/${basePath}/${version}`
  : `${appUrl}:${port}/${basePath}/${version}/${nodeEnv}`;

const expressJSDocSwaggerConfig = {
  info: {
    version: '1.0.0',
    title: 'Smart Market API',
    description: 'API Documentation for Smart Market Backend',
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: swaggerUrl,
      description: isProd ? 'Production Server' : 'Development Server',
    },
  ],
  security: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
    },
  },
  baseDir,
  filesPattern: `${baseDir}/src/**/*.routes.ts`,
  swaggerUIPath,
  exposeSwaggerUI: true,
  exposeApiDocs: true,
  apiDocsPath,
  notRequiredAsNullable: false,
  swaggerUiOptions: {},
  multiple: true,
};

export default expressJSDocSwaggerConfig;