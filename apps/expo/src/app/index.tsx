import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

// Example tRPC usage
// import { useMutation, useQuery } from "@tanstack/react-query";
// import { trpc } from "~/utils/api";
// import type { FeedPost, ReactionType } from "@acme/api";

export default function Index() {
  // Example tRPC query usage:
  // const feedQuery = useQuery(trpc.feed.getFeed.queryOptions({ limit: 10 }));
  // const reactToPostMutation = useMutation(trpc.feed.reactToPost.mutationOptions());

  // Example mutation usage:
  // const handleReactToPost = (postId: string, reactionType: ReactionType) => {
  //   reactToPostMutation.mutate({
  //     postId,
  //     reactionType,
  //   });
  // };

  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: "Sports Feed Challenge" }} />
      <View className="h-full w-full bg-background p-4">
        <Text className="pb-4 text-center text-3xl font-bold text-foreground">
          Sports Feed
        </Text>
        
        <View className="rounded-lg bg-blue-50 p-4">
          <Text className="mb-2 text-lg font-bold text-blue-900">
            Welcome!
          </Text>
          <Text className="text-blue-700">
            Build an infinite scrolling sports feed using tRPC and React Native.
          </Text>
          <Text className="mt-2 text-sm text-blue-600">
            Check the comments in this file for tRPC usage examples.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
