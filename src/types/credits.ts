import type { CreditTransaction } from "./database";

export type CreditBalance = {
  credits: number;
  daily_limit: number;
  tasks_today: number;
};

export type LedgerEntry = CreditTransaction;

export type CreditOperation = {
  userId: string;
  amount: number;
  reason: string;
  refType?: "completion" | "campaign" | "admin" | "system";
  refId?: string;
};
