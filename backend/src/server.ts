import app, { notFoundHandler, errorHandler } from "./app";
import { connectDatabase } from "./config/database";
import { logger } from "./utils/logger";
import { expressMiddleware } from "@apollo/server/express4";
import { createApolloServer, getGraphQLContext } from "./graphql/server";
import express from "express";
import cors from "cors";

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Initialize Apollo Server
    const apolloServer = createApolloServer();
    await apolloServer.start();

    // GraphQL Playground HTML for GET requests
    app.get("/graphql", (_req, res) => {
      res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>GraphQL Playground</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 600px;
      text-align: center;
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #666;
      margin-bottom: 30px;
    }
    .endpoint {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      margin: 20px 0;
      word-break: break-all;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 30px;
      border-radius: 6px;
      text-decoration: none;
      margin: 10px;
      transition: background 0.3s;
    }
    .button:hover {
      background: #5568d3;
    }
    .button.secondary {
      background: #48bb78;
    }
    .button.secondary:hover {
      background: #38a169;
    }
    .info {
      margin-top: 30px;
      padding: 20px;
      background: #f0f4ff;
      border-radius: 8px;
      text-align: left;
    }
    .info h3 {
      margin-top: 0;
      color: #667eea;
    }
    code {
      background: #e2e8f0;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 14px;
    }
    pre {
      background: #2d3748;
      color: #e2e8f0;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
      text-align: left;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 GraphQL API</h1>
    <p class="subtitle">Panorama Application GraphQL Endpoint</p>
    
    <div class="endpoint">
      POST http://localhost:${PORT}/graphql
    </div>

    <a href="https://studio.apollographql.com/sandbox/explorer?endpoint=http://localhost:${PORT}/graphql" 
       class="button" target="_blank">
      Open Apollo Sandbox
    </a>
    
    <a href="/api-docs" class="button secondary">
      View REST API Docs
    </a>

    <div class="info">
      <h3>Quick Test</h3>
      <p>Test the GraphQL endpoint with curl:</p>
      <pre>curl -X POST http://localhost:${PORT}/graphql \\
  -H "Content-Type: application/json" \\
  -d '{"query": "{ __typename }"}'</pre>
      
      <h3>Example Query</h3>
      <pre>query {
  images {
    id
    name
    size
    mimetype
  }
}</pre>

      <h3>With Authentication</h3>
      <p>Include JWT token in headers:</p>
      <pre>curl -X POST http://localhost:${PORT}/graphql \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"query": "{ images { id name } }"}'</pre>
    </div>
  </div>
</body>
</html>
      `);
    });

    // Apply GraphQL middleware for POST requests with CORS for Apollo Sandbox
    app.post(
      "/graphql",
      cors({
        origin: [
          "http://localhost:3000",
          "https://studio.apollographql.com",
          process.env.CORS_ORIGIN || "*",
        ],
        credentials: true,
      }),
      express.json(),
      expressMiddleware(apolloServer, {
        context: getGraphQLContext,
      })
    );

    logger.info("GraphQL server initialized at /graphql");

    // Add error handlers AFTER GraphQL middleware
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`REST API: http://localhost:${PORT}/api`);
      logger.info(`GraphQL: http://localhost:${PORT}/graphql`);
      logger.info(`Swagger UI: http://localhost:${PORT}/api-docs`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
