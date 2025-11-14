import { useParams, Navigate } from "react-router-dom";
import Redirect from "@/pages/Redirect";

// Reserved paths that should NOT be treated as slugs
const RESERVED_PATHS = [
  'auth',
  'dashboard',
  'profile',
  'settings',
  'privacy',
  'terms',
  'sitemap',
  'accessibility',
  'cookies',
  'about',
  'contact',
  'blog',
  'careers',
  'help',
  'status',
  'docs',
  'api',
  'admin',
];

export function SlugRouteGuard() {
  const { slug } = useParams<{ slug: string }>();

  // If slug matches a reserved path, navigate to 404
  if (slug && RESERVED_PATHS.includes(slug.toLowerCase())) {
    return <Navigate to="/404" replace />;
  }

  // Otherwise render the Redirect component
  return <Redirect />;
}
