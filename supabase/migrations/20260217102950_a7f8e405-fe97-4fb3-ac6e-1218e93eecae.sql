
-- =============================================
-- Fix Anonymous Access: Restrict all auth-dependent policies to 'authenticated' role
-- Public SELECT policies (listings, profiles, ratings, listing_settings) stay accessible to anon
-- =============================================

-- === FAVORITES ===
DROP POLICY IF EXISTS "Users can add to their favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;

CREATE POLICY "Users can add to their favorites" ON public.favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON public.favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- === CONVERSATIONS ===
DROP POLICY IF EXISTS "Buyers can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

CREATE POLICY "Buyers can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Participants can update conversations" ON public.conversations FOR UPDATE TO authenticated USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));
CREATE POLICY "Users can view their own conversations" ON public.conversations FOR SELECT TO authenticated USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));

-- === MESSAGES ===
DROP POLICY IF EXISTS "Conversation participants can send messages" ON public.messages;
DROP POLICY IF EXISTS "Conversation participants can view messages" ON public.messages;
DROP POLICY IF EXISTS "Participants can mark messages as read" ON public.messages;

CREATE POLICY "Conversation participants can send messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = sender_id) AND EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())));
CREATE POLICY "Conversation participants can view messages" ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())));
CREATE POLICY "Participants can mark messages as read" ON public.messages FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())));

-- === NOTIFICATIONS ===
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;

CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- === WALLETS ===
DROP POLICY IF EXISTS "Users can insert their own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can update their own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.wallets;

CREATE POLICY "Users can insert their own wallet" ON public.wallets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wallet" ON public.wallets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own wallet" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- === WALLET_TRANSACTIONS ===
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.wallet_transactions;

CREATE POLICY "Admins can view all transactions" ON public.wallet_transactions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view their own transactions" ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- === WALLET_TRANSFERS ===
DROP POLICY IF EXISTS "Users can create transfers" ON public.wallet_transfers;
DROP POLICY IF EXISTS "Users can view their transfers" ON public.wallet_transfers;

CREATE POLICY "Users can create transfers" ON public.wallet_transfers FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can view their transfers" ON public.wallet_transfers FOR SELECT TO authenticated USING ((auth.uid() = sender_id) OR (auth.uid() = receiver_id));

-- === TOP_UP_REQUESTS ===
DROP POLICY IF EXISTS "Admins can update requests" ON public.top_up_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.top_up_requests;
DROP POLICY IF EXISTS "Users can create top-up requests" ON public.top_up_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON public.top_up_requests;

CREATE POLICY "Admins can update requests" ON public.top_up_requests FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all requests" ON public.top_up_requests FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create top-up requests" ON public.top_up_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own requests" ON public.top_up_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- === REPORTS ===
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.reports;

CREATE POLICY "Admins can update reports" ON public.reports FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all reports" ON public.reports FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view their own reports" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);

-- === USER_ROLES ===
DROP POLICY IF EXISTS "Admins can assign roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can revoke roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Admins can assign roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can revoke roles" ON public.user_roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- === USER_SUBSCRIPTIONS ===
DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;

CREATE POLICY "Admins can update subscriptions" ON public.user_subscriptions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all subscriptions" ON public.user_subscriptions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- === PROFILES (keep public SELECT, restrict write) ===
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- === LISTINGS (keep public SELECT, restrict write) ===
DROP POLICY IF EXISTS "Users can insert their own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON public.listings;
DROP POLICY IF EXISTS "Admins can delete any listing" ON public.listings;

CREATE POLICY "Users can insert their own listings" ON public.listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own listings" ON public.listings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own listings" ON public.listings FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any listing" ON public.listings FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- === RATINGS (keep public SELECT, restrict write) ===
DROP POLICY IF EXISTS "Users can create ratings for others" ON public.ratings;
DROP POLICY IF EXISTS "Users can update their own ratings" ON public.ratings;
DROP POLICY IF EXISTS "Users can delete their own ratings" ON public.ratings;

CREATE POLICY "Users can create ratings for others" ON public.ratings FOR INSERT TO authenticated WITH CHECK ((auth.uid() = reviewer_id) AND (auth.uid() <> seller_id));
CREATE POLICY "Users can update their own ratings" ON public.ratings FOR UPDATE TO authenticated USING (auth.uid() = reviewer_id);
CREATE POLICY "Users can delete their own ratings" ON public.ratings FOR DELETE TO authenticated USING (auth.uid() = reviewer_id);

-- === LISTING_SETTINGS (keep public SELECT, restrict write) ===
DROP POLICY IF EXISTS "Admins can insert listing settings" ON public.listing_settings;
DROP POLICY IF EXISTS "Admins can update listing settings" ON public.listing_settings;
DROP POLICY IF EXISTS "Admins can delete listing settings" ON public.listing_settings;

CREATE POLICY "Admins can insert listing settings" ON public.listing_settings FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update listing settings" ON public.listing_settings FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete listing settings" ON public.listing_settings FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- === CONTACT_MESSAGES (keep public INSERT for contact form, restrict admin ops) ===
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;

CREATE POLICY "Admins can delete contact messages" ON public.contact_messages FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update contact messages" ON public.contact_messages FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view contact messages" ON public.contact_messages FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
