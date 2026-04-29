CREATE OR REPLACE FUNCTION updated_at_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION updated_at_trigger();

CREATE TRIGGER set_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION updated_at_trigger();

CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION updated_at_trigger();

CREATE TRIGGER set_completions_updated_at BEFORE UPDATE ON completions
  FOR EACH ROW EXECUTE FUNCTION updated_at_trigger();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION reset_daily_limits()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET tasks_today = 0, last_reset_date = CURRENT_DATE
  WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_trust_score(target_user_id UUID)
RETURNS void AS $$
DECLARE
  approved_count INTEGER;
  rejected_count INTEGER;
  tenure_days INTEGER;
  unique_campaigns INTEGER;
  unique_actions INTEGER;
  anomaly_count INTEGER;
  new_score INTEGER;
BEGIN
  SELECT COUNT(*) INTO approved_count
  FROM completions WHERE user_id = target_user_id AND status = 'approved';

  SELECT COUNT(*) INTO rejected_count
  FROM completions WHERE user_id = target_user_id AND status = 'rejected';

  SELECT EXTRACT(DAY FROM NOW() - created_at)::INTEGER INTO tenure_days
  FROM profiles WHERE id = target_user_id;

  SELECT COUNT(DISTINCT campaign_id) INTO unique_campaigns
  FROM completions WHERE user_id = target_user_id AND status = 'approved';

  SELECT COUNT(DISTINCT t.type) INTO unique_actions
  FROM completions c
  JOIN tasks t ON t.id = c.task_id
  WHERE c.user_id = target_user_id AND c.status = 'approved';

  SELECT COUNT(*) INTO anomaly_count
  FROM abuse_flags WHERE user_id = target_user_id AND status != 'dismissed';

  new_score := 50
    + LEAST(approved_count * 1, 25)
    + LEAST(tenure_days * 1, 10)
    + LEAST(unique_campaigns * 1, 10)
    + LEAST(unique_actions * 2, 5)
    - LEAST(rejected_count * 2, 15)
    - LEAST(anomaly_count * 5, 20);

  new_score := GREATEST(0, LEAST(100, new_score));

  UPDATE profiles SET trust_score = new_score WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION spend_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_ref_type TEXT,
  p_ref_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  SELECT credits INTO current_balance FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  new_balance := current_balance - p_amount;

  UPDATE profiles SET credits = new_balance WHERE id = p_user_id;

  INSERT INTO credit_transactions (user_id, amount, type, reason, ref_type, ref_id, balance_after)
  VALUES (p_user_id, -p_amount, 'spend', p_reason, p_ref_type, p_ref_id, new_balance);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION earn_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_ref_type TEXT,
  p_ref_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  SELECT credits INTO current_balance FROM profiles WHERE id = p_user_id FOR UPDATE;

  new_balance := current_balance + p_amount;

  UPDATE profiles SET credits = new_balance WHERE id = p_user_id;

  INSERT INTO credit_transactions (user_id, amount, type, reason, ref_type, ref_id, balance_after)
  VALUES (p_user_id, p_amount, 'earn', p_reason, p_ref_type, p_ref_id, new_balance);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION adjust_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
  tx_type TEXT;
BEGIN
  SELECT credits INTO current_balance FROM profiles WHERE id = p_user_id FOR UPDATE;

  new_balance := current_balance + p_amount;
  IF new_balance < 0 THEN
    RETURN FALSE;
  END IF;

  tx_type := CASE WHEN p_amount >= 0 THEN 'adjust' ELSE 'adjust' END;

  UPDATE profiles SET credits = new_balance WHERE id = p_user_id;

  INSERT INTO credit_transactions (user_id, amount, type, reason, ref_type, balance_after)
  VALUES (p_user_id, p_amount, tx_type, p_reason, 'admin', new_balance);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_feed_tasks(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  task_id UUID,
  campaign_id UUID,
  campaign_title TEXT,
  campaign_description TEXT,
  task_type TEXT,
  target_count INTEGER,
  current_count INTEGER,
  reward_per_action INTEGER,
  cost_per_action INTEGER,
  platform TEXT,
  post_url TEXT,
  targeting JSONB,
  score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id AS task_id,
    c.id AS campaign_id,
    c.title AS campaign_title,
    c.description AS campaign_description,
    t.type AS task_type,
    t.target_count,
    t.current_count,
    t.reward_per_action,
    t.cost_per_action,
    c.platform,
    c.post_url,
    c.targeting,
    (
      (1.0 - (t.current_count::REAL / GREATEST(t.target_count, 1))) * 0.3
      + (t.reward_per_action::REAL / 10.0) * 0.2
      + CASE WHEN c.created_at > NOW() - INTERVAL '1 day' THEN 0.3
             WHEN c.created_at > NOW() - INTERVAL '3 days' THEN 0.2
             ELSE 0.1 END
      + (p.trust_score::REAL / 100.0) * 0.2
    ) AS score
  FROM tasks t
  JOIN campaigns c ON c.id = t.campaign_id
  JOIN profiles p ON p.id = c.user_id
  WHERE c.status = 'active'
    AND t.is_active = TRUE
    AND t.current_count < t.target_count
    AND c.user_id != p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM completions comp
      WHERE comp.task_id = t.id AND comp.user_id = p_user_id
    )
  ORDER BY score DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
