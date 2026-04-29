"use client";

import { useEffect, useState } from "react";

type FeedTask = {
  task_id: string;
  campaign_id: string;
  campaign_title: string | null;
  task_type: string;
  reward_per_action: number;
  platform: string;
  post_url: string;
  score: number;
};

export function useFeed(limit = 20) {
  const [tasks, setTasks] = useState<FeedTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = async () => {
    setLoading(true);
    const res = await fetch(`/api/feed?limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      setTasks(data.tasks || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFeed();
  }, [limit]);

  return { tasks, loading, refresh: loadFeed };
}
