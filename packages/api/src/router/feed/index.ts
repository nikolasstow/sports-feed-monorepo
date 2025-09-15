import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { publicProcedure } from "../../trpc";
import { 
  GetFeedInputSchema as GetFeedInput, 
  ReactToPostInputSchema as ReactToPostInput, 
  ClearReactionsInputSchema as ClearReactionsInput,
  GetFeedResponseSchema as GetFeedResponse,
  ReactToPostResponse,
  FeedPostSchema,
  Author as AuthorSchema,
  SourceSchema
} from "./types";
import { calculateTimestampOffset, adjustTimestamp } from "./timestamp-adjuster";

// Import mock data
import mockDataRaw from "./mock-data.json";

// In-memory cache for user reactions
const reactionCache = new Map<string, typeof FeedPostSchema.shape.reactions>();

// Initialize timestamp adjustment on first load
let adjustedMockData: typeof mockDataRaw | null = null;

function initializeMockData() {
  if (adjustedMockData) {
    return adjustedMockData;
  }

  // Find the most recent post to calculate offset
  const mostRecentPost = mockDataRaw.posts.reduce((latest, post) => {
    const postDate = new Date(post.createdAt);
    const latestDate = new Date(latest.createdAt);
    return postDate > latestDate ? post : latest;
  });

  // Calculate timestamp offset
  calculateTimestampOffset(new Date(mostRecentPost.createdAt));

  // Adjust all post timestamps
  adjustedMockData = {
    ...mockDataRaw,
    posts: mockDataRaw.posts.map(post => ({
      ...post,
      createdAt: adjustTimestamp(new Date(post.createdAt)).toISOString(),
    })),
  };

  return adjustedMockData;
}

export const feedRouter = {
  /**
   * Get feed posts with infinite scroll support
   */
  getFeed: publicProcedure
    .input(GetFeedInput)
    .output(GetFeedResponse)
    .query(({ input }) => {
      const mockData = initializeMockData();
      const { cursor, limit } = input;

      // Find starting index based on cursor
      let startIndex = 0;
      if (cursor) {
        const cursorIndex = mockData.posts.findIndex(post => post.id === cursor);
        if (cursorIndex !== -1) {
          startIndex = cursorIndex + 1;
        }
      }

      // Get posts for this page
      const posts = mockData.posts.slice(startIndex, startIndex + limit);
      
      // Merge with cached reactions and validate with Zod
      const postsWithReactions = posts.map(post => {
        const cachedReactions = reactionCache.get(post.id);
        const postData = {
          ...post,
          createdAt: new Date(post.createdAt),
          reactions: cachedReactions ?? post.reactions,
        };
        
        // Validate each post with Zod schema
        return FeedPostSchema.parse(postData);
      });

      // Determine next cursor and hasMore
      const nextCursor = startIndex + limit < mockData.posts.length 
        ? posts[posts.length - 1]?.id 
        : undefined;
      const hasMore = startIndex + limit < mockData.posts.length;

      const response = {
        posts: postsWithReactions,
        nextCursor,
        hasMore,
      };

      // Validate response with Zod schema
      return GetFeedResponse.parse(response);
    }),

  /**
   * React to a post (optimistic update)
   */
  reactToPost: publicProcedure
    .input(ReactToPostInput)
    .output(ReactToPostResponse)
    .mutation(({ input }) => {
      const { postId, reactionType } = input;
      const mockData = initializeMockData();
      
      // Find the post
      const post = mockData.posts.find(p => p.id === postId);
      if (!post) {
        throw new Error("Post not found");
      }

      // Get current reactions (from cache or default)
      const currentReactions = reactionCache.get(postId) ?? post.reactions;
      
      // Create new reactions object - use any for dynamic property access
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newReactions: any = { ...currentReactions };
      
      // Toggle the reaction
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const currentReaction = newReactions[reactionType];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (currentReaction.userReacted) {
        // Remove reaction
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        newReactions[reactionType] = {
          ...currentReaction,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          count: Math.max(0, currentReaction.count - 1),
          userReacted: false,
        };
      } else {
        // Add reaction
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        newReactions[reactionType] = {
          ...currentReaction,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          count: currentReaction.count + 1,
          userReacted: true,
        };
      }

      // Update cache
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      reactionCache.set(postId, newReactions);

      const response = {
        success: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        reactions: newReactions,
      };

      // Validate response with Zod schema
      return ReactToPostResponse.parse(response);
    }),

  /**
   * Clear reactions cache (for development convenience)
   */
  clearReactions: publicProcedure
    .input(ClearReactionsInput)
    .output(z.object({ success: z.boolean() }))
    .mutation(({ input }) => {
      if (input.postId) {
        // Clear reactions for specific post
        reactionCache.delete(input.postId);
      } else {
        // Clear all reactions
        reactionCache.clear();
      }

      return { success: true };
    }),

  /**
   * Get a single post by ID
   */
  getPostById: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(FeedPostSchema)
    .query(({ input }) => {
      const mockData = initializeMockData();
      const post = mockData.posts.find(p => p.id === input.id);
      
      if (!post) {
        throw new Error("Post not found");
      }

      // Merge with cached reactions
      const cachedReactions = reactionCache.get(post.id);
      
      const postData = {
        ...post,
        createdAt: new Date(post.createdAt),
        reactions: cachedReactions ?? post.reactions,
      };

      // Validate response with Zod schema
      return FeedPostSchema.parse(postData);
    }),

  /**
   * Get all authors (for debugging/testing)
   */
  getAuthors: publicProcedure
    .output(z.array(AuthorSchema))
    .query(() => {
      const mockData = initializeMockData();
      return AuthorSchema.array().parse(mockData.authors);
    }),

  /**
   * Get all sources (for debugging/testing)
   */
  getSources: publicProcedure
    .output(z.array(SourceSchema))
    .query(() => {
      const mockData = initializeMockData();
      return SourceSchema.array().parse(mockData.sources);
    }),
} satisfies TRPCRouterRecord;
