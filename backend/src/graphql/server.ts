import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./typeDefs";
import { resolvers, Context } from "./resolvers";
import { verifyToken } from "../utils/jwt";

export const createApolloServer = () => {
  return new ApolloServer<Context>({
    typeDefs,
    resolvers,
    introspection: true, // Enable introspection for GraphQL tools
    // Enable Apollo Sandbox in development
    ...(process.env.NODE_ENV !== "production" && {
      plugins: [
        {
          async serverWillStart() {
            return {
              async drainServer() {},
            };
          },
        },
      ],
    }),
  });
};

export const getGraphQLContext = async ({ req }: any) => {
  const authHeader = req.headers.authorization || "";

  if (authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7);
      const user = verifyToken(token);
      return { user };
    } catch (_error) {
      return {};
    }
  }

  return {};
};
