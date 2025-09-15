import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "./root";
import { appRouter } from "./root";
import { createTRPCContext } from "./trpc";

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId']
 *      ^? { id: number }
 **/
type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 **/
type RouterOutputs = inferRouterOutputs<AppRouter>;

export { createTRPCContext, appRouter };
export type { AppRouter, RouterInputs, RouterOutputs };

// Export feed types for external use
export type {
  AuthorType,
  Author,
  Source,
  PostType,
  ReactionType,
  Reaction,
  Reactions,
  FeedPost,
  GetFeedInput,
  ReactToPostInput,
  ClearReactionsInput,
  GetFeedResponse,
  ReactToPostResponse,
} from "./router/feed/types";