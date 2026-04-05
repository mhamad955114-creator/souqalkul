import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user is admin using their token
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get storage stats by counting images from listings
    const { data: listings, error: listingsError } = await adminClient
      .from("listings")
      .select("images, badge_type, status");

    if (listingsError) throw listingsError;

    let totalImages = 0;
    let activeImages = 0;
    let expiredImages = 0;
    const byBadge: Record<string, { count: number; images: number }> = {
      free: { count: 0, images: 0 },
      featured: { count: 0, images: 0 },
      professional: { count: 0, images: 0 },
      business: { count: 0, images: 0 },
    };

    for (const listing of listings || []) {
      const imgCount = listing.images?.length || 0;
      totalImages += imgCount;

      if (listing.status === "active" || listing.status === "sold") {
        activeImages += imgCount;
      } else {
        expiredImages += imgCount;
      }

      const badge = listing.badge_type || "free";
      if (byBadge[badge]) {
        byBadge[badge].count++;
        byBadge[badge].images += imgCount;
      }
    }

    // List files in the listings bucket to get actual sizes
    let totalSizeBytes = 0;
    let fileCount = 0;

    // List top-level folders (user IDs)
    const { data: folders } = await adminClient.storage
      .from("listings")
      .list("", { limit: 1000 });

    if (folders) {
      for (const folder of folders) {
        if (folder.id === null) {
          // It's a folder, list its contents
          const { data: files } = await adminClient.storage
            .from("listings")
            .list(folder.name, { limit: 1000 });

          if (files) {
            for (const file of files) {
              if (file.metadata?.size) {
                totalSizeBytes += file.metadata.size;
                fileCount++;
              }
            }
          }
        } else {
          // It's a file at root level
          if (folder.metadata?.size) {
            totalSizeBytes += folder.metadata.size;
            fileCount++;
          }
        }
      }
    }

    // Also check receipts bucket
    let receiptsSizeBytes = 0;
    let receiptsCount = 0;
    const { data: receiptFolders } = await adminClient.storage
      .from("receipts")
      .list("", { limit: 1000 });

    if (receiptFolders) {
      for (const folder of receiptFolders) {
        if (folder.id === null) {
          const { data: files } = await adminClient.storage
            .from("receipts")
            .list(folder.name, { limit: 1000 });
          if (files) {
            for (const file of files) {
              if (file.metadata?.size) {
                receiptsSizeBytes += file.metadata.size;
                receiptsCount++;
              }
            }
          }
        } else {
          if (folder.metadata?.size) {
            receiptsSizeBytes += folder.metadata.size;
            receiptsCount++;
          }
        }
      }
    }

    const storageLimitMb = 1024;
    const usagePercent = ((totalSizeBytes + receiptsSizeBytes) / (storageLimitMb * 1024 * 1024)) * 100;

    // Auto-alert admins if usage > 80%
    if (usagePercent >= 80) {
      const alertTitle = usagePercent >= 95
        ? "⚠️ تحذير: التخزين شبه ممتلئ!"
        : "⚠️ تنبيه: استخدام التخزين مرتفع";
      const alertMessage = `استخدام التخزين وصل إلى ${usagePercent.toFixed(1)}% (${+((totalSizeBytes + receiptsSizeBytes) / (1024 * 1024)).toFixed(2)} MB من ${storageLimitMb} MB). يرجى تنظيف الصور المنتهية.`;

      // Check if we already sent an alert today to avoid spam
      const today = new Date().toISOString().split("T")[0];
      const { data: existingAlert } = await adminClient
        .from("notifications")
        .select("id")
        .eq("type", "storage_alert")
        .gte("created_at", today + "T00:00:00Z")
        .limit(1);

      if (!existingAlert || existingAlert.length === 0) {
        // Get all admin IDs
        const { data: admins } = await adminClient
          .from("user_roles")
          .select("user_id")
          .eq("role", "admin");

        if (admins && admins.length > 0) {
          const alertRows = admins.map((a) => ({
            user_id: a.user_id,
            title: alertTitle,
            message: alertMessage,
            type: "storage_alert",
          }));
          await adminClient.from("notifications").insert(alertRows);
        }
      }
    }

    const result = {
      listings_bucket: {
        total_size_bytes: totalSizeBytes,
        total_size_mb: +(totalSizeBytes / (1024 * 1024)).toFixed(2),
        file_count: fileCount,
      },
      receipts_bucket: {
        total_size_bytes: receiptsSizeBytes,
        total_size_mb: +(receiptsSizeBytes / (1024 * 1024)).toFixed(2),
        file_count: receiptsCount,
      },
      total: {
        total_size_bytes: totalSizeBytes + receiptsSizeBytes,
        total_size_mb: +((totalSizeBytes + receiptsSizeBytes) / (1024 * 1024)).toFixed(2),
        total_files: fileCount + receiptsCount,
      },
      image_stats: {
        total_images: totalImages,
        active_images: activeImages,
        expired_images: expiredImages,
      },
      by_badge: byBadge,
      usage_percent: +usagePercent.toFixed(1),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
