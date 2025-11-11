import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Redirect = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!slug) {
        setError("Invalid URL");
        return;
      }

      try {
        // Lookup URL in database
        const { data: urlData, error: urlError } = await supabase
          .from('urls')
          .select('*')
          .eq('slug', slug)
          .is('deleted_at', null)
          .maybeSingle();

        if (urlError) {
          console.error('Database error:', urlError);
          setError('Failed to lookup URL');
          return;
        }

        if (!urlData) {
          console.log(`URL not found for slug: ${slug}`);
          setError('URL not found');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Check if URL is expired
        if (urlData.expiry_at && new Date(urlData.expiry_at) < new Date()) {
          console.log(`URL expired: ${slug}`);
          setError('This URL has expired');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Track analytics in background (non-blocking)
        trackClick(urlData.id).catch(err =>
          console.error('Failed to track click:', err)
        );

        // Redirect to target URL immediately
        window.location.href = urlData.target_url;
      } catch (error) {
        console.error('Unexpected error:', error);
        setError('An error occurred');
      }
    };

    handleRedirect();
  }, [slug, navigate]);

  const trackClick = async (urlId: string) => {
    try {
      // Get user agent and referrer
      const userAgent = navigator.userAgent;
      const referrer = document.referrer || null;

      // Parse user agent for device, browser, OS
      const { device, browser, os } = parseUserAgent(userAgent);

      // Get current click count
      const { data: currentUrl } = await supabase
        .from('urls')
        .select('click_count')
        .eq('id', urlId)
        .single();

      // Increment click count
      if (currentUrl) {
        await supabase
          .from('urls')
          .update({ click_count: (currentUrl.click_count || 0) + 1 })
          .eq('id', urlId);
      }

      // Log click (without IP hash since we're client-side)
      await supabase.from('clicks').insert({
        url_id: urlId,
        ip_hash: null, // Client-side can't safely get IP
        user_agent: userAgent,
        referrer: referrer,
        country: null, // Would need geolocation API
        city: null,
        device,
        browser,
        os,
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const parseUserAgent = (userAgent: string): { device: string; browser: string; os: string } => {
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
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="mb-4 text-red-500">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">{error}</h1>
          <p className="mb-4 text-gray-600">
            {error === 'URL not found'
              ? "The short URL you're looking for doesn't exist or has been deleted."
              : error === 'This URL has expired'
              ? "This link is no longer available."
              : "Please try again later or contact support."}
          </p>
          <p className="text-sm text-gray-500">Redirecting to homepage in 3 seconds...</p>
          <a
            href="/"
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Redirecting...</h2>
        <p className="text-gray-600">Please wait while we take you to your destination</p>
      </div>
    </div>
  );
};

export default Redirect;
