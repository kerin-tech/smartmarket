import cors from 'cors';
import nocache from 'nocache';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import expressJSDocSwagger from 'express-jsdoc-swagger';
import home from './home';
import environment from './config/env';
import expressJSDocSwaggerConfig from './config/express-jsdoc-swagger.config';
import appConfig from './config/app.config';
import errorHandler from '@/middlewares/error-handler';
import routes from '@/routes/index';
import prismaClient from '@/config/database';

class App {
  public express: express.Application;

  constructor() {
    this.express = express();
    this.setMiddlewares();
    this.disableSettings();
    this.setRoutes();
    this.setErrorHandler();
    this.initializeDocs();
  }

  private setMiddlewares(): void {
  this.express.use(cors({
    origin: '*', // Permite peticiones desde Vercel o local
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  this.express.use(morgan('dev'));
  this.express.use(nocache());
  this.express.use(express.json());
  this.express.use(express.urlencoded({ extended: true }));
  
  // Modifica Helmet para permitir los scripts de Swagger
  this.express.use(
    helmet({
        contentSecurityPolicy: false, // Permite que carguen los scripts de Swagger
        hsts: false,                 // Evita que el navegador fuerce HTTPS
      })
  );
  
  this.express.use(express.static('public'));
}

  private disableSettings(): void {
    this.express.disable('x-powered-by');
  }

  private setRoutes(): void {
  const { api: { version } } = appConfig;
  const routePrefix = environment.isProd() 
    ? `/api/${version}` 
    : `/api/${version}/${environment.env}`;

  this.express.use('/', home);
  this.express.use(routePrefix, routes);
}

  private setErrorHandler(): void {
    this.express.use(errorHandler);
  }

  private initializeDocs(): void {
    expressJSDocSwagger(this.express)(expressJSDocSwaggerConfig);
  }

  public async connectPrisma(): Promise<void> {
    await prismaClient.$connect();
  }
}

export default App;
