ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE abuse_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin can read all profiles" ON profiles FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Admin can update all profiles" ON profiles FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Admin can delete profiles" ON profiles FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Service role full access profiles" ON profiles FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Users can CRUD own campaigns" ON campaigns FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can read active campaigns" ON campaigns FOR SELECT TO authenticated USING (status = 'active' OR user_id = auth.uid());
CREATE POLICY "Admin full access campaigns" ON campaigns FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Service role full access campaigns" ON campaigns FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Users read tasks via campaign" ON tasks FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = tasks.campaign_id AND (campaigns.user_id = auth.uid() OR campaigns.status = 'active'))
);
CREATE POLICY "Users insert tasks own campaign" ON tasks FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = tasks.campaign_id AND campaigns.user_id = auth.uid())
);
CREATE POLICY "Users update tasks own campaign" ON tasks FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = tasks.campaign_id AND campaigns.user_id = auth.uid())
);
CREATE POLICY "Admin full access tasks" ON tasks FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Service role full access tasks" ON tasks FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Users can read own completions" ON completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own completions" ON completions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Campaign owner can read completions" ON completions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = completions.campaign_id AND campaigns.user_id = auth.uid())
);
CREATE POLICY "Admin full access completions" ON completions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Service role full access completions" ON completions FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Users can read own credit transactions" ON credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can read all credit transactions" ON credit_transactions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Service role full access credit transactions" ON credit_transactions FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role insert events" ON events FOR INSERT TO service_role WITH CHECK (TRUE);
CREATE POLICY "Admin read events" ON events FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Service role full access events" ON events FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admin full access abuse flags" ON abuse_flags FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Service role full access abuse flags" ON abuse_flags FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role insert user actions" ON user_actions FOR INSERT TO service_role WITH CHECK (TRUE);
CREATE POLICY "Admin read user actions" ON user_actions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Service role full access user actions" ON user_actions FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
