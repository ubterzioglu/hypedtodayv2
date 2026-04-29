import { VERIFICATION_THRESHOLDS } from "@/lib/utils/constants";
import type { Completion } from "@/types/database";
import type { VerificationResult } from "@/types/completion";

export interface VerificationSignals {
  clickThrough: boolean;
  dwellTimeMs: number;
  returnLatencyMs: number;
  sessionContinuity: boolean;
  trustScore: number;
  actionFrequency: number;
}

const WEIGHTS = {
  click_through: 0.20,
  dwell_time: 0.25,
  return_latency: 0.10,
  session_continuity: 0.10,
  trust_score: 0.15,
  action_frequency: 0.10,
  device_reputation: 0.10,
};

export function calculateVerificationScore(signals: VerificationSignals): VerificationResult {
  let score = 0;

  score += (signals.clickThrough ? 1 : 0) * WEIGHTS.click_through;

  const dwellScore = normalizeDwellTime(signals.dwellTimeMs);
  score += dwellScore * WEIGHTS.dwell_time;

  const latencyScore = normalizeLatency(signals.returnLatencyMs);
  score += latencyScore * WEIGHTS.return_latency;

  score += (signals.sessionContinuity ? 1 : 0) * WEIGHTS.session_continuity;

  score += (signals.trustScore / 100) * WEIGHTS.trust_score;

  const freqScore = Math.max(0, 1 - signals.actionFrequency / 20);
  score += freqScore * WEIGHTS.action_frequency;

  score += 0.5 * WEIGHTS.device_reputation;

  score = Math.max(0, Math.min(1, score));

  let status: Completion["status"];
  let reason: string | undefined;

  if (score >= VERIFICATION_THRESHOLDS.instant_approve) {
    status = "approved";
  } else if (score >= VERIFICATION_THRESHOLDS.pending) {
    status = "pending";
    reason = "Below auto-approve threshold, queued for review";
  } else {
    status = "rejected";
    reason = "Verification score below minimum threshold";
  }

  return { score, status, reason };
}

function normalizeDwellTime(ms: number): number {
  if (ms < 3000) return 0;
  if (ms > 120000) return 0.8;
  return Math.min((ms - 3000) / 60000, 1);
}

function normalizeLatency(ms: number): number {
  if (ms < 5000) return 0.3;
  if (ms > 300000) return 0.8;
  return Math.min(ms / 120000, 1);
}
