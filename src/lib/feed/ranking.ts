import type { Task, Campaign } from "@/types/database";

export type FeedItem = {
  task: Task;
  campaign: Campaign;
  score: number;
};

export function rankFeedItems(items: FeedItem[], userInterests: string[] = []): FeedItem[] {
  return items
    .map((item) => {
      let score = 0;

      const completionRate = item.task.current_count / Math.max(item.task.target_count, 1);
      score += (1 - completionRate) * 30;

      score += Math.min(item.task.reward_per_action * 2, 20);

      const ageMs = Date.now() - new Date(item.campaign.created_at).getTime();
      const ageHours = ageMs / 3600000;
      if (ageHours < 24) score += 20;
      else if (ageHours < 72) score += 10;

      if (userInterests.length > 0 && item.campaign.targeting) {
        const targeting = item.campaign.targeting as Record<string, string[]>;
        const interestTags = targeting.interests || [];
        const matchCount = userInterests.filter((i) => interestTags.includes(i)).length;
        score += matchCount * 5;
      }

      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score);
}
