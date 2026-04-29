export function canAffordCredits(currentBalance: number, cost: number): boolean {
  return currentBalance >= cost;
}

export function calculateCampaignCost(
  tasks: { target_count: number; cost_per_action: number }[]
): number {
  return tasks.reduce(
    (total, task) => total + task.target_count * task.cost_per_action,
    0
  );
}

export function canCompleteMoreTasks(
  tasksToday: number,
  dailyLimit: number
): boolean {
  return tasksToday < dailyLimit;
}

export function getDailyLimitForTrustScore(trustScore: number): number {
  if (trustScore >= 70) return 30;
  if (trustScore <= 30) return 10;
  return 20;
}
