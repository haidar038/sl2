import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * Vercel Cron Job: Cleanup Guest URLs
 *
 * Automatically soft-deletes guest URLs older than 7 days.
 * Scheduled to run daily at midnight UTC via vercel.json cron configuration.
 *
 * This replaces the pg_cron job that was failing due to pg_net issues.
 *
 * Manual test:
 * curl -X POST https://your-app.vercel.app/api/cleanup-guest-urls
 */

const DAYS_TO_KEEP = 7;

export default async function handler(request: VercelRequest, response: VercelResponse) {
    // Only allow GET and POST (cron jobs use POST, manual test uses GET)
    if (request.method !== "GET" && request.method !== "POST") {
        return response.status(405).json({ error: "Method not allowed" });
    }

    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceRoleKey) {
            throw new Error("Missing Supabase environment variables");
        }

        // Create Supabase client with service role key (bypasses RLS)
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        console.log(`[Cleanup] Starting guest URL cleanup (deleting URLs older than ${DAYS_TO_KEEP} days)`);

        // Call the cleanup function from database
        const { data, error } = await supabase.rpc("cleanup_old_guest_urls", {
            p_days_old: DAYS_TO_KEEP,
        });

        if (error) {
            console.error("[Cleanup] Error calling cleanup function:", error);
            throw error;
        }

        const deletedCount = data?.[0]?.deleted_count || 0;
        const timestamp = new Date().toISOString();

        console.log(`[Cleanup] Completed: ${deletedCount} guest URLs soft-deleted at ${timestamp}`);

        return response.status(200).json({
            success: true,
            deleted_count: deletedCount,
            days_old: DAYS_TO_KEEP,
            timestamp,
        });
    } catch (error) {
        console.error("[Cleanup] Error:", error);

        return response.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
        });
    }
}
