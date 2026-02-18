import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the request comes from an authorized source (cron job or admin)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Only accept the service role key (used by cron job)
    const token = authHeader.replace('Bearer ', '');
    if (token !== supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch duration settings
    const { data: settingsData } = await supabase
      .from('listing_settings')
      .select('setting_key, setting_value');

    const durations: Record<string, number> = {
      free: 30,
      featured: 30,
    };

    if (settingsData) {
      for (const row of settingsData) {
        if (row.setting_key === 'free_listing') {
          durations.free = (row.setting_value as any).duration_days || 30;
        } else if (row.setting_key === 'featured_listing') {
          durations.featured = (row.setting_value as any).duration_days || 30;
        } else if (row.setting_key === 'professional_listing') {
          durations.professional = (row.setting_value as any).duration_days || 30;
        }
      }
    }

    // 2. Expire free listings
    const freeExpiry = new Date();
    freeExpiry.setDate(freeExpiry.getDate() - durations.free);

    const { data: expiredFree, error: freeError } = await supabase
      .from('listings')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .eq('is_featured', false)
      .lt('created_at', freeExpiry.toISOString())
      .select('id, user_id, title');

    if (freeError) console.error('Error expiring free listings:', freeError);

    // 3. Expire featured listings
    const featuredExpiry = new Date();
    featuredExpiry.setDate(featuredExpiry.getDate() - durations.featured);

    const { data: expiredFeatured, error: featuredError } = await supabase
      .from('listings')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .eq('is_featured', true)
      .lt('created_at', featuredExpiry.toISOString())
      .select('id, user_id, title');

    if (featuredError) console.error('Error expiring featured listings:', featuredError);

    // 4. Send notifications to owners
    const allExpired = [...(expiredFree || []), ...(expiredFeatured || [])];
    
    if (allExpired.length > 0) {
      const notifications = allExpired.map((listing) => ({
        user_id: listing.user_id,
        title: 'انتهت صلاحية إعلانك',
        message: `انتهت صلاحية إعلانك "${listing.title}". يمكنك تجديده من صفحة حسابك.`,
        type: 'listing_expired',
        related_id: listing.id,
      }));

      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) console.error('Error sending notifications:', notifError);
    }

    const summary = {
      expired_free: expiredFree?.length || 0,
      expired_featured: expiredFeatured?.length || 0,
      notifications_sent: allExpired.length,
      timestamp: new Date().toISOString(),
    };

    console.log('Expire listings summary:', summary);

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
