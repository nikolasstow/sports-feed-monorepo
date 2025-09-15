import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { feedRouter } from "./router/feed";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  feed: feedRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
