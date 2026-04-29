export const THRESHOLDS = {
  instant_approve: 0.75,
  pending: 0.50,
  reject: 0.0,
  batch_process_delay_minutes: 5,
  max_pending_age_hours: 24,
};

export function shouldAutoApprove(score: number, trustScore: number): boolean {
  const adjustedThreshold = trustScore >= 70 ? 0.60 : trustScore <= 30 ? 0.85 : 0.75;
  return score >= adjustedThreshold;
}
