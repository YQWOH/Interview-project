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

    // Apply GraphQL middleware with CORS for Apollo Sandbox
    app.use(
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
