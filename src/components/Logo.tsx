import { useEffect, useState } from "react";

interface LogoProps {
  variant?: "primary" | "secondary" | "white";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ variant = "primary", className = "", size = "md" }: LogoProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12",
  };

  // For secondary variant, use the 1:1 logo
  if (variant === "secondary") {
    return (
      <img
        src="/logos/ShortLink Secondary.svg"
        alt="ShortLink Logo"
        className={`${sizeClasses[size]} ${className}`}
      />
    );
  }

  // For white variant, always use white logo
  if (variant === "white") {
    return (
      <img
        src="/logos/ShortLink White.svg"
        alt="ShortLink Logo"
        className={`${sizeClasses[size]} ${className}`}
      />
    );
  }

  // For primary variant, switch based on theme
  const logoSrc = isDark
    ? "/logos/ShortLink White.svg"
    : "/logos/ShortLink Primary - Light.svg";

  return (
    <img
      src={logoSrc}
      alt="ShortLink Logo"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
}
