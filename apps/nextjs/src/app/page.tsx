"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import type { ReactionType } from "@acme/api";
import Image from "next/image";

export default function TestFeedPage() {
  const [selectedPostId, setSelectedPostId] = useState<string>("");
  const [selectedReaction, setSelectedReaction] = useState<ReactionType>("like");

  // Test queries
  const { data: feedData, isLoading: feedLoading, refetch: refetchFeed } = api.feed.getFeed.useQuery({
    limit: 5,
  });

  const { data: authorsData, isLoading: authorsLoading } = api.feed.getAuthors.useQuery();
  const { data: sourcesData, isLoading: sourcesLoading } = api.feed.getSources.useQuery();

  const { data: singlePost, isLoading: singlePostLoading } = api.feed.getPostById.useQuery(
    { id: selectedPostId },
    { enabled: !!selectedPostId }
  );

  // Test mutations
  const reactToPostMutation = api.feed.reactToPost.useMutation({
    onSuccess: () => {
      void refetchFeed();
      if (selectedPostId) {
        // Refetch single post if viewing one
      }
    },
  });

  const clearReactionsMutation = api.feed.clearReactions.useMutation({
    onSuccess: () => {
      void refetchFeed();
    },
  });

  const handleReactToPost = (postId: string, reactionType: ReactionType) => {
    reactToPostMutation.mutate({
      postId,
      reactionType,
    });
  };

  const handleClearReactions = () => {
    clearReactionsMutation.mutate({});
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Feed Backend Test Page</h1>

      {/* Feed Test */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Feed Test (First 5 Posts)</h2>
        {feedLoading && <p>Loading feed...</p>}
        {feedData && (
          <div>
            <p className="mb-2">Total posts: {feedData.posts.length}</p>
            <p className="mb-2">Has more: {feedData.hasMore ? "Yes" : "No"}</p>
            <p className="mb-4">Next cursor: {feedData.nextCursor ?? "None"}</p>
            
            <div className="space-y-4">
              {feedData.posts.map((post) => (
                <div key={post.id} className="p-4 border rounded bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{post.title ?? "No Title"}</h3>
                      <p className="text-sm text-gray-600">
                        By {post.author.name} ({post.author.type}) via {post.source.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedPostId(post.id)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      View Details
                    </button>
                  </div>
                  
                  <p className="mb-3">{post.content}</p>
                  
                  {post.imageUrl && (
                    <Image 
                      src={post.imageUrl} 
                      width={128}
                      height={96}
                      alt="Post image" 
                      className="w-32 h-24 object-cover rounded mb-3"
                    />
                  )}
                  
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(post.reactions).map(([reactionType, reaction]) => (
                      <button
                        key={reactionType}
                        onClick={() => handleReactToPost(post.id, reactionType as ReactionType)}
                        className={`px-2 py-1 rounded text-sm ${
                          reaction.userReacted 
                            ? "bg-blue-500 text-white" 
                            : "bg-gray-200 text-gray-700"
                        }`}
                        disabled={reactToPostMutation.isPending}
                      >
                        {reactionType}: {reaction.count}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Single Post Test */}
      {selectedPostId && (
        <div className="mb-8 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">Single Post Test</h2>
          {singlePostLoading && <p>Loading post...</p>}
          {singlePost && (
            <div className="p-4 border rounded bg-gray-50">
              <h3 className="font-semibold">{singlePost.title ?? "No Title"}</h3>
              <p className="text-sm text-gray-600">
                By {singlePost.author.name} ({singlePost.author.type}) via {singlePost.source.name}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(singlePost.createdAt).toLocaleString()}
              </p>
              <p className="mt-2">{singlePost.content}</p>
              <div className="mt-2 flex gap-2">
                {Object.entries(singlePost.reactions).map(([reactionType, reaction]) => (
                  <span key={reactionType} className="text-sm">
                    {reactionType}: {reaction.count} ({reaction.userReacted ? "✓" : "○"})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Authors Test */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Authors Test</h2>
        {authorsLoading && <p>Loading authors...</p>}
        {authorsData && (
          <div>
            <p className="mb-2">Total authors: {authorsData.length}</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {authorsData.slice(0, 9).map((author) => (
                <div key={author.id} className="p-2 border rounded">
                  <p className="font-medium">{author.name}</p>
                  <p className="text-gray-600">{author.type}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sources Test */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Sources Test</h2>
        {sourcesLoading && <p>Loading sources...</p>}
        {sourcesData && (
          <div>
            <p className="mb-2">Total sources: {sourcesData.length}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {sourcesData.slice(0, 6).map((source) => (
                <div key={source.id} className="p-2 border rounded">
                  <p className="font-medium">{source.name}</p>
                  <p className="text-gray-600 text-xs">{source.hostUrl}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Test Controls */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Reaction on Post:</label>
            <div className="flex gap-2">
              <select
                value={selectedPostId}
                onChange={(e) => setSelectedPostId(e.target.value)}
                className="px-3 py-1 border rounded"
              >
                <option value="">Select a post</option>
                {feedData?.posts.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.title ?? `Post ${post.id.slice(-4)}`}
                  </option>
                ))}
              </select>
              <select
                value={selectedReaction}
                onChange={(e) => setSelectedReaction(e.target.value as ReactionType)}
                className="px-3 py-1 border rounded"
              >
                <option value="like">Like</option>
                <option value="love">Love</option>
                <option value="laugh">Laugh</option>
                <option value="angry">Angry</option>
                <option value="sad">Sad</option>
                <option value="wow">Wow</option>
              </select>
              <button
                onClick={() => handleReactToPost(selectedPostId, selectedReaction)}
                disabled={!selectedPostId || reactToPostMutation.isPending}
                className="px-4 py-1 bg-green-500 text-white rounded disabled:bg-gray-300"
              >
                {reactToPostMutation.isPending ? "Reacting..." : "Test Reaction"}
              </button>
            </div>
          </div>

          <div>
            <button
              onClick={handleClearReactions}
              disabled={clearReactionsMutation.isPending}
              className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
            >
              {clearReactionsMutation.isPending ? "Clearing..." : "Clear All Reactions"}
            </button>
          </div>

          <div>
            <button
              onClick={() => refetchFeed()}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Refresh Feed
            </button>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="p-4 border rounded bg-gray-100">
        <h2 className="text-xl font-semibold mb-4">Test Status</h2>
        <div className="space-y-2 text-sm">
          <p>Feed loading: {feedLoading ? "Yes" : "No"}</p>
          <p>Authors loading: {authorsLoading ? "Yes" : "No"}</p>
          <p>Sources loading: {sourcesLoading ? "Yes" : "No"}</p>
          <p>Single post loading: {singlePostLoading ? "Yes" : "No"}</p>
          <p>React mutation pending: {reactToPostMutation.isPending ? "Yes" : "No"}</p>
          <p>Clear reactions pending: {clearReactionsMutation.isPending ? "Yes" : "No"}</p>
        </div>
      </div>
    </div>
  );
}
