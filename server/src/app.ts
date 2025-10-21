import express, { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error';
import { typeDefs } from './graphql/schemas';
import { resolvers } from './graphql/resolvers';
import { createContext } from './graphql/context';
import { handleWebhook } from './integrations/shopify/webhooks';

const app: Application = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: config.server.env === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: config.frontend.url,
  credentials: true,
}));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Webhook endpoint (raw body needed for signature verification)
app.post('/api/webhooks/shopify', express.raw({ type: 'application/json' }), handleWebhook);

// Body parser for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Apollo Server setup
const startApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext,
    introspection: config.server.env !== 'production',
    formatError: (error) => {
      logger.error('GraphQL Error:', error);
      return error;
    },
  });

  await server.start();

  server.applyMiddleware({
    app: app as any,
    path: '/graphql',
    cors: false, // CORS already handled above
  });

  return server;
};

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Start Apollo Server
    const apolloServer = await startApolloServer();

    // Start Express server
    app.listen(config.server.port, () => {
      logger.info(`🚀 Server ready at http://${config.server.host}:${config.server.port}`);
      logger.info(`📊 GraphQL endpoint: http://${config.server.host}:${config.server.port}${apolloServer.graphqlPath}`);
      logger.info(`🌍 Environment: ${config.server.env}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;

