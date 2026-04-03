import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extract storage path from a full Supabase storage URL
function extractStoragePath(url: string): string | null {
  try {
    const match = url.match(/\/storage\/v1\/object\/public\/listings\/(.+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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
      professional: 30,
      business: 100,
    };

    if (settingsData) {
      for (const row of settingsData) {
        if (row.setting_key === 'free_listing') {
          durations.free = (row.setting_value as any).duration_days || 30;
        } else if (row.setting_key === 'featured_listing') {
          durations.featured = (row.setting_value as any).duration_days || 30;
        } else if (row.setting_key === 'professional_listing') {
          durations.professional = (row.setting_value as any).duration_days || 30;
        } else if (row.setting_key === 'business_listing') {
          durations.business = (row.setting_value as any).duration_days || 100;
        }
      }
    }

    // 2. Expire free listings (no badge)
    const freeExpiry = new Date();
    freeExpiry.setDate(freeExpiry.getDate() - durations.free);

    const { data: expiredFree, error: freeError } = await supabase
      .from('listings')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .eq('is_featured', false)
      .is('badge_type', null)
      .lt('created_at', freeExpiry.toISOString())
      .select('id, user_id, title, images');

    if (freeError) console.error('Error expiring free listings:', freeError);

    // 3. Expire featured listings
    const featuredExpiry = new Date();
    featuredExpiry.setDate(featuredExpiry.getDate() - durations.featured);

    const { data: expiredFeatured, error: featuredError } = await supabase
      .from('listings')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .eq('badge_type', 'featured')
      .lt('created_at', featuredExpiry.toISOString())
      .select('id, user_id, title, images');

    if (featuredError) console.error('Error expiring featured listings:', featuredError);

    // 4. Expire professional listings
    const proExpiry = new Date();
    proExpiry.setDate(proExpiry.getDate() - durations.professional);

    const { data: expiredPro, error: proError } = await supabase
      .from('listings')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .eq('badge_type', 'professional')
      .lt('created_at', proExpiry.toISOString())
      .select('id, user_id, title, images');

    if (proError) console.error('Error expiring professional listings:', proError);

    // 5. Expire business listings
    const bizExpiry = new Date();
    bizExpiry.setDate(bizExpiry.getDate() - durations.business);

    const { data: expiredBiz, error: bizError } = await supabase
      .from('listings')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .eq('badge_type', 'business')
      .lt('created_at', bizExpiry.toISOString())
      .select('id, user_id, title, images');

    if (bizError) console.error('Error expiring business listings:', bizError);

    const allExpired = [
      ...(expiredFree || []),
      ...(expiredFeatured || []),
      ...(expiredPro || []),
      ...(expiredBiz || []),
    ];

    // 6. Delete images from storage for all expired listings
    let imagesDeleted = 0;
    for (const listing of allExpired) {
      if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
        const paths = listing.images
          .map((url: string) => extractStoragePath(url))
          .filter((p: string | null): p is string => p !== null);

        if (paths.length > 0) {
          const { error: delError } = await supabase.storage
            .from('listings')
            .remove(paths);

          if (delError) {
            console.error(`Error deleting images for listing ${listing.id}:`, delError);
          } else {
            imagesDeleted += paths.length;
            // Clear images array from listing record
            await supabase
              .from('listings')
              .update({ images: [] })
              .eq('id', listing.id);
          }
        }
      }
    }

    // 7. Also clean up listings that have been expired for a while and still have images
    // (in case previous runs failed to delete)
    const { data: oldExpired } = await supabase
      .from('listings')
      .select('id, images')
      .eq('status', 'expired')
      .not('images', 'eq', '{}')
      .limit(50);

    if (oldExpired) {
      for (const listing of oldExpired) {
        if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
          const paths = listing.images
            .map((url: string) => extractStoragePath(url))
            .filter((p: string | null): p is string => p !== null);

          if (paths.length > 0) {
            const { error: delError } = await supabase.storage
              .from('listings')
              .remove(paths);

            if (!delError) {
              imagesDeleted += paths.length;
              await supabase
                .from('listings')
                .update({ images: [] })
                .eq('id', listing.id);
            }
          }
        }
      }
    }

    // 8. Send notifications
    if (allExpired.length > 0) {
      const notifications = allExpired.map((listing) => ({
        user_id: listing.user_id,
        title: 'انتهت صلاحية إعلانك',
        message: `انتهت صلاحية إعلانك "${listing.title}". تم حذف الصور المرفقة. يمكنك تجديده من صفحة حسابك.`,
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
      expired_professional: expiredPro?.length || 0,
      expired_business: expiredBiz?.length || 0,
      images_deleted: imagesDeleted,
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
