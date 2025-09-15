import { z } from "zod/v4";

/**
 * TypeScript types for the Wow-Sports mobile app coding challenge
 * These types match the exact structure required for the challenge
 */

// Author Types
export const AuthorTypeSchema = z.enum(["person", "team", "league"]);
export const Author = z.object({
  id: z.string(),
  name: z.string(),
  type: AuthorTypeSchema,
  avatarUrl: z.url(),
});

// Source Types  
export const SourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  hostUrl: z.url(),
  contentUrl: z.url(),
});

// Post Types
export const PostTypeSchema = z.enum(["social", "news"]);
export const ReactionTypeSchema = z.enum(["like", "love", "laugh", "angry", "sad", "wow"]);

export const ReactionSchema = z.object({
  type: ReactionTypeSchema,
  count: z.number().min(0),
  userReacted: z.boolean().default(false),
});

export const ReactionsSchema = z.record(ReactionTypeSchema, ReactionSchema);

export const FeedPostSchema = z.object({
  id: z.string(),
  type: PostTypeSchema,
  title: z.string().nullable().optional(), // Optional for social media posts, can be null
  content: z.string(),
  author: Author,
  source: SourceSchema,
  imageUrl: z.url().nullable().optional(), // Can be null or undefined
  createdAt: z.date(),
  reactions: ReactionsSchema,
});

// Input schemas for tRPC procedures
export const GetFeedInputSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).default(10),
});

export const ReactToPostInputSchema = z.object({
  postId: z.string(),
  reactionType: ReactionTypeSchema,
});

export const ClearReactionsInputSchema = z.object({
  postId: z.string().optional(), // If not provided, clears all reactions
});

// Response types
export const GetFeedResponseSchema = z.object({
  posts: z.array(FeedPostSchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});

export const ReactToPostResponse = z.object({
  success: z.boolean(),
  reactions: ReactionsSchema,
});

// Inferred types
export type AuthorType = z.infer<typeof AuthorTypeSchema>;
export type Author = z.infer<typeof Author>;
export type Source = z.infer<typeof SourceSchema>;
export type PostType = z.infer<typeof PostTypeSchema>;
export type ReactionType = z.infer<typeof ReactionTypeSchema>;
export type Reaction = z.infer<typeof ReactionSchema>;
export type Reactions = z.infer<typeof ReactionsSchema>;
export type FeedPost = z.infer<typeof FeedPostSchema>;
export type GetFeedInput = z.infer<typeof GetFeedInputSchema>;
export type ReactToPostInput = z.infer<typeof ReactToPostInputSchema>;
export type ClearReactionsInput = z.infer<typeof ClearReactionsInputSchema>;
export type GetFeedResponse = z.infer<typeof GetFeedResponseSchema>;
export type ReactToPostResponse = z.infer<typeof ReactToPostResponse>;

// Mock data structure
export interface MockData {
  authors: Author[];
  sources: Source[];
  posts: FeedPost[];
  imageUrls: {
    persons: string[];
    teams: string[];
    leagues: string[];
    posts: string[];
  };
}

// Configuration types
export interface GeneratorConfig {
  totalPosts: number;
  authorsCount: number;
  sourcesCount: number;
  imagesPerCategory: number;
  s3Bucket: string;
  s3Prefix: string;
}

// Image processing types
export interface ImageInfo {
  url: string;
  filename: string;
  category: 'person' | 'team' | 'league' | 'post';
  width?: number;
  height?: number;
}

// Content generation types
export interface ContentGenerationRequest {
  type: 'authors' | 'sources' | 'posts';
  count: number;
  context?: string;
}

export interface GeneratedContent {
  authors?: Author[];
  sources?: Source[];
  posts?: Omit<FeedPost, 'id' | 'createdAt' | 'reactions' | 'imageUrl'>[];
}
