INSERT INTO credit_transactions (user_id, amount, type, reason, ref_type, balance_after)
SELECT id, 20, 'earn', 'Welcome bonus', 'system', 20
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM credit_transactions ct WHERE ct.user_id = profiles.id AND ct.reason = 'Welcome bonus'
);
