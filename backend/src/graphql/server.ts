import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { typeDefs } from "./typeDefs";
import { resolvers, Context } from "./resolvers";
import { verifyToken } from "../utils/jwt";

export const createApolloServer = () => {
  return new ApolloServer<Context>({
    typeDefs,
    resolvers,
    introspection: true, // Enable introspection for GraphQL tools
    // Enable embedded Apollo Sandbox in development
    plugins: [
      process.env.NODE_ENV === "production"
        ? ApolloServerPluginLandingPageLocalDefault({ footer: false })
        : ApolloServerPluginLandingPageLocalDefault({
            embed: true,
            includeCookies: true,
          }),
    ],
  });
};

export const getGraphQLContext = async ({ req }: any) => {
  const authHeader = req.headers.authorization || "";

  if (authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7);
      const user = verifyToken(token);
      return { user };
    } catch (error) {
      // Token verification failed - return empty context
      // This is expected for invalid/expired tokens
      return {};
    }
  }

  return {};
};
