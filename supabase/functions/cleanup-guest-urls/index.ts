/**
 * Supabase Edge Function: cleanup-guest-urls
 *
 * Automatically deletes (soft delete) guest URLs older than specified days.
 * Should be triggered by a cron job (e.g., daily at midnight).
 *
 * Setup cron in Supabase Dashboard:
 * 1. Go to Edge Functions → Cron Jobs
 * 2. Add new cron job with schedule: "0 0 * * *" (daily at midnight)
 * 3. Select this function
 *
 * Or use supabase CLI:
 * supabase functions deploy cleanup-guest-urls
 *
 * Test manually with:
 * curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-guest-urls \
 *   -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Configuration
const DAYS_TO_KEEP = 7; // Guest URLs expire after 7 days

// CORS headers for HTTP responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Main handler function
 */
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing required environment variables");
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Log start of cleanup
    console.log(`Starting guest URL cleanup (deleting URLs older than ${DAYS_TO_KEEP} days)`);

    // Call the cleanup function from database
    const { data, error } = await supabase.rpc("cleanup_old_guest_urls", {
      p_days_old: DAYS_TO_KEEP,
    });

    if (error) {
      console.error("Error calling cleanup function:", error);
      throw error;
    }

    const deletedCount = data?.[0]?.deleted_count || 0;

    // Log results
    console.log(`Cleanup completed: ${deletedCount} guest URLs soft-deleted`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        deleted_count: deletedCount,
        days_old: DAYS_TO_KEEP,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in cleanup function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});
