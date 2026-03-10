import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const token = authHeader.replace('Bearer ', '');
    if (token !== serviceKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Find active subscriptions expiring in exactly 3 days (within a 24h window)
    const now = new Date();
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    
    const windowStart = new Date(threeDaysLater);
    windowStart.setHours(0, 0, 0, 0);
    
    const windowEnd = new Date(threeDaysLater);
    windowEnd.setHours(23, 59, 59, 999);

    const { data: expiringSubs, error: subsError } = await supabase
      .from('user_subscriptions')
      .select('id, user_id, plan_type, expires_at')
      .eq('status', 'active')
      .gte('expires_at', windowStart.toISOString())
      .lte('expires_at', windowEnd.toISOString());

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      throw subsError;
    }

    if (!expiringSubs || expiringSubs.length === 0) {
      console.log('No subscriptions expiring in 3 days');
      return new Response(
        JSON.stringify({ reminded: 0, timestamp: now.toISOString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const planLabels: Record<string, string> = {
      featured: 'المميزة',
      professional: 'الاحترافية',
      business: 'رجال الأعمال',
    };

    // Check which users already got a reminder for this subscription
    const subIds = expiringSubs.map(s => s.id);
    const { data: existingNotifs } = await supabase
      .from('notifications')
      .select('related_id')
      .eq('type', 'subscription_expiry_reminder')
      .in('related_id', subIds);

    const alreadyNotified = new Set((existingNotifs || []).map(n => n.related_id));

    const notifications = expiringSubs
      .filter(sub => !alreadyNotified.has(sub.id))
      .map(sub => ({
        user_id: sub.user_id,
        title: 'تذكير: اشتراكك على وشك الانتهاء',
        message: `باقتك ${planLabels[sub.plan_type] || sub.plan_type} ستنتهي خلال 3 أيام. جدّدها الآن للحفاظ على مزاياك!`,
        type: 'subscription_expiry_reminder',
        related_id: sub.id,
      }));

    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notifError) {
        console.error('Error inserting notifications:', notifError);
        throw notifError;
      }
    }

    const summary = {
      expiring_found: expiringSubs.length,
      already_notified: alreadyNotified.size,
      reminded: notifications.length,
      timestamp: now.toISOString(),
    };

    console.log('Subscription reminder summary:', summary);

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
