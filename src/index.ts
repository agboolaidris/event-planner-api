import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import express from "express";
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import http from "http";
import dotenv from "dotenv";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { PostResolver } from "./resolver/post";
import { UserResolver } from "./resolver/user";

dotenv.config();

async function main() {
  const app = express();
  const port = process.env.PORT || 5000;
  try {
    await createConnection();

    let RedisStore = connectRedis(session);

    const options =
      process.env.NODE_ENV !== "development"
        ? {
            host: process.env.RD_HOST,
            port: process.env.RD_PORT
              ? parseFloat(process.env.RD_PORT)
              : undefined,
            password: process.env.RD_PASSWORD,
            name: process.env.RD_NAME,
          }
        : undefined;

    const redisClient = new Redis(options);

    app.use(
      cors({
        origin: "*",
        credentials: true,
      })
    );

    app.use(
      session({
        name: "auth-cookie",
        store: new RedisStore({
          client: redisClient,
          disableTTL: true,
          disableTouch: true,
        }),
        saveUninitialized: false,
        secret: process.env.SECRET_TOKEN ? process.env.SECRET_TOKEN : "",
        cookie: {
          maxAge: 1000 * 60 * 60 * 60 * 24 * 365,
          secure: process.env.NODE_ENV !== "development",
          httpOnly: true,
          sameSite: "lax",
        },
        resave: false,
      })
    );

    const httpServer = http.createServer(app);
    const server = new ApolloServer({
      schema: await buildSchema({
        resolvers: [UserResolver, PostResolver],
        validate: false,
      }),
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        ApolloServerPluginLandingPageGraphQLPlayground(),
      ],
      context: ({ req, res }) => ({ req, res, Redis: redisClient }),
      introspection: true,
    });

    await server.start();
    server.applyMiddleware({ app, cors: false });
    await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
    console.log(
      `🚀 Server ready at http://localhost:${port}/${server.graphqlPath}`
    );
  } catch (error) {
    console.log(error);
  }
}

main();
