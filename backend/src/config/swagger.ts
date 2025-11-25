import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Panorama Image Management API",
      version: "1.0.0",
      description:
        "A comprehensive REST API for managing panorama images with authentication, bookmarking, and analytics features.",
      contact: {
        name: "API Support",
        email: "support@panorama-api.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
      {
        url: "https://api.panorama.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        Image: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Image ID",
            },
            name: {
              type: "string",
              description: "Image name",
            },
            originalName: {
              type: "string",
              description: "Original filename",
            },
            filename: {
              type: "string",
              description: "Stored filename",
            },
            filepath: {
              type: "string",
              description: "File path on server",
            },
            size: {
              type: "number",
              description: "File size in bytes",
            },
            mimetype: {
              type: "string",
              description: "MIME type",
            },
            isBookmarked: {
              type: "boolean",
              description: "Bookmark status",
            },
            uploadedAt: {
              type: "string",
              format: "date-time",
              description: "Upload timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "User ID",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email",
            },
            name: {
              type: "string",
              description: "User name",
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              description: "User role",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation timestamp",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  description: "Error message",
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Health",
        description: "Server health check",
      },
      {
        name: "Authentication",
        description: "User authentication endpoints",
      },
      {
        name: "Images",
        description: "Panorama image management endpoints",
      },
      {
        name: "Analytics",
        description: "Analytics and statistics endpoints",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts", "./src/app.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
