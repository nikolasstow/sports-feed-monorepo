# Sports Feed Challenge

## Overview
Build an infinite scrolling sports feed similar to social media, using the existing T3 Turbo stack.

## Requirements
- **Infinite Scrolling**: Implement cursor-based pagination with loading states
- **Optimistic Updates**: Handle user reactions (liking posts) with optimistic UI updates
- **React Native**: Build the feed in the Expo app
- **tRPC Integration**: Use the existing tRPC setup for API calls

## Available API Endpoints
The backend is already set up with these tRPC procedures:
- `feed.getFeed({ cursor?, limit })` - Get paginated posts
- `feed.reactToPost({ postId, reactionType })` - React to a post
- `feed.clearReactions()` - Clear all user reactions (dev convenience)
- `feed.getPostById({ id })` - Get single post
- `feed.getAuthors()` - Get all authors
- `feed.getSources()` - Get all sources

## Data Structure
Posts contain:
- Title (optional for social media posts)
- Content
- Author (person/team/league with avatar)
- Source (news site/social platform)
- Image (optional)
- Reactions (like, love, laugh, angry, sad, wow)
- Timestamp

## Getting Started
1. Follow the standard T3 Turbo setup instructions
2. Start both servers: `pnpm dev`
3. Focus on the Expo app (`apps/expo`) for the main implementation
4. Use the Next.js app (`apps/nextjs`) for testing the API

## Evaluation Criteria
- Proper infinite scrolling implementation
- Loading states and error handling
- Optimistic updates for reactions
- Clean, responsive UI
- TypeScript usage and type safety