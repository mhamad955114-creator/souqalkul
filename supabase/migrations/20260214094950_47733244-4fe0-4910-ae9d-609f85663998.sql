
-- Listings indexes (most queried table)
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings (status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings (category);
CREATE INDEX IF NOT EXISTS idx_listings_city ON public.listings (city);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings (user_id);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_is_featured ON public.listings (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_listings_status_category ON public.listings (status, category);
CREATE INDEX IF NOT EXISTS idx_listings_status_created ON public.listings (status, created_at DESC);

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON public.conversations (buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON public.conversations (seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON public.conversations (listing_id);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages (is_read) WHERE is_read = false;

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON public.favorites (listing_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications (is_read) WHERE is_read = false;

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);

-- Wallet indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets (user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON public.wallet_transactions (created_at DESC);

-- Ratings indexes
CREATE INDEX IF NOT EXISTS idx_ratings_seller_id ON public.ratings (seller_id);
CREATE INDEX IF NOT EXISTS idx_ratings_listing_id ON public.ratings (listing_id);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_listing_id ON public.reports (listing_id);

-- Top-up requests indexes
CREATE INDEX IF NOT EXISTS idx_top_up_requests_user_id ON public.top_up_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_top_up_requests_status ON public.top_up_requests (status);
