import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

/**
 * Vercel Cron Job: Keep-Alive
 *
 * Prevents Supabase from pausing due to inactivity (7-day limit on free tier).
 * Scheduled to run every 5 days via vercel.json cron configuration.
 *
 * Manual test:
 * curl https://your-app.vercel.app/api/keep-alive
 */

export default async function handler(request: VercelRequest, response: VercelResponse) {
    // Only allow GET and POST (cron jobs use POST, manual test uses GET)
    if (request.method !== "GET" && request.method !== "POST") {
        return response.status(405).json({ error: "Method not allowed" });
    }

    try {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error("Missing Supabase environment variables");
        }

        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Simple query to keep database active
        // SELECT count(*) FROM urls LIMIT 1 is very cheap but counts as database activity
        const { count, error } = await supabase.from("urls").select("*", { count: "exact", head: true }).limit(1);

        if (error) {
            throw new Error(`Database ping failed: ${error.message}`);
        }

        const timestamp = new Date().toISOString();

        console.log(`[Keep-Alive] Success at ${timestamp}`);

        return response.status(200).json({
            success: true,
            timestamp,
            message: "Supabase keep-alive ping successful",
            next_run: "In 5 days",
        });
    } catch (error) {
        console.error("[Keep-Alive] Error:", error);

        return response.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
        });
    }
}
