import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClickData {
  url_id: string;
  ip_hash: string | null;
  user_agent: string | null;
  referrer: string | null;
  country: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
}

// Simple hash function for IP addresses
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

// Parse user agent to extract device, browser, and OS info
function parseUserAgent(userAgent: string | null): { device: string | null; browser: string | null; os: string | null } {
  if (!userAgent) return { device: null, browser: null, os: null };

  let device = 'Desktop';
  let browser = 'Unknown';
  let os = 'Unknown';

  // Device detection
  if (/mobile/i.test(userAgent)) device = 'Mobile';
  else if (/tablet|ipad/i.test(userAgent)) device = 'Tablet';

  // Browser detection
  if (/edg/i.test(userAgent)) browser = 'Edge';
  else if (/chrome/i.test(userAgent)) browser = 'Chrome';
  else if (/firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/safari/i.test(userAgent)) browser = 'Safari';

  // OS detection
  if (/windows/i.test(userAgent)) os = 'Windows';
  else if (/mac/i.test(userAgent)) os = 'macOS';
  else if (/linux/i.test(userAgent)) os = 'Linux';
  else if (/android/i.test(userAgent)) os = 'Android';
  else if (/ios|iphone|ipad/i.test(userAgent)) os = 'iOS';

  return { device, browser, os };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get slug from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const slug = pathParts[pathParts.length - 1];

    if (!slug) {
      return new Response('Slug not provided', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    console.log(`Processing redirect for slug: ${slug}`);

    // Lookup URL in database
    const { data: urlData, error: urlError } = await supabase
      .from('urls')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .maybeSingle();

    if (urlError) {
      console.error('Database error:', urlError);
      return new Response('Database error', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    if (!urlData) {
      console.log(`URL not found for slug: ${slug}`);
      return new Response('URL not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Check if URL is expired
    if (urlData.expiry_at && new Date(urlData.expiry_at) < new Date()) {
      console.log(`URL expired: ${slug}`);
      return new Response('URL has expired', { 
        status: 410,
        headers: corsHeaders 
      });
    }

    // Extract analytics data
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent');
    const referrer = req.headers.get('referer');
    const cfCountry = req.headers.get('cf-ipcountry');
    const cfCity = req.headers.get('cf-ipcity');

    const ipHash = ip !== 'unknown' ? await hashIP(ip) : null;
    const { device, browser, os } = parseUserAgent(userAgent);

    // Prepare click data
    const clickData: ClickData = {
      url_id: urlData.id,
      ip_hash: ipHash,
      user_agent: userAgent,
      referrer: referrer,
      country: cfCountry,
      city: cfCity,
      device,
      browser,
      os,
    };

    // Background tasks: increment counter and log click
    const backgroundTasks = async () => {
      try {
        // Increment click count
        await supabase
          .from('urls')
          .update({ click_count: urlData.click_count + 1 })
          .eq('id', urlData.id);

        // Log click
        await supabase
          .from('clicks')
          .insert(clickData);

        console.log(`Tracked click for slug: ${slug}`);
      } catch (error) {
        console.error('Error tracking click:', error);
      }
    };

    // Start background tasks (don't await)
    backgroundTasks();

    // Redirect immediately
    console.log(`Redirecting to: ${urlData.target_url}`);
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': urlData.target_url,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
});
