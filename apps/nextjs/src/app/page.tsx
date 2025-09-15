"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import Image from "next/image";

export default function TestFeedPage() {
  const [selectedPostId, setSelectedPostId] = useState<string>("");

  // Test queries
  const { data: feedData, isLoading: feedLoading, refetch: refetchFeed } = api.feed.getFeed.useQuery({
    limit: 5,
  });


  // Test mutations
  const reactToPostMutation = api.feed.reactToPost.useMutation({
    onSuccess: () => {
      void refetchFeed();
      if (selectedPostId) {
        // Refetch single post if viewing one
      }
    },
  });

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
    </div>
  );
}
