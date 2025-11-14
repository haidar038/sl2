import { Link } from "react-router-dom";
import { Link as LinkIcon, Github, Twitter, Linkedin, Mail, FileText, Shield, Info, HelpCircle } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { Logo } from "@/components/Logo";

library.add(fab);

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        {/* Brand Section */}
                        <div className="md:col-span-1">
                            <Link to="/" className="flex items-center gap-1 mb-4 group">
                                <Logo variant="secondary" size="sm" className="h-10 w-10 transition-transform group-hover:scale-110" />
                                <span className="font-bold text-lg">ShortLink</span>
                            </Link>
                            <p className="text-sm text-muted-foreground mb-4">Fast, secure, and reliable URL shortening service built for modern web.</p>
                            {/* Social Links */}
                            <div className="flex items-center gap-3">
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors group" aria-label="GitHub">
                                    <FontAwesomeIcon icon={["fab", "github"]} className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </a>
                                <a
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors group"
                                    aria-label="Twitter"
                                >
                                    <FontAwesomeIcon icon={["fab", "x-twitter"]} className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </a>
                                <a
                                    href="https://linkedin.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-lg bg-muted hover:bg-primary/10 flex items-center justify-center transition-colors group"
                                    aria-label="LinkedIn"
                                >
                                    <FontAwesomeIcon icon={["fab", "linkedin"]} className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </a>
                            </div>
                        </div>

                        {/* Product Links */}
                        <div>
                            <h3 className="font-semibold text-sm mb-4">Product</h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link to="/#features-section" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                                        <Info className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                        Features
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                                        <LinkIcon className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                        Dashboard
                                    </Link>
                                </li>
                                {/* <li>
                  <a
                    href="/#pricing"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity">$</span>
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="/docs"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <FileText className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    API Documentation
                  </a>
                </li> */}
                            </ul>
                        </div>

                        {/* Company Links */}
                        <div>
                            <h3 className="font-semibold text-sm mb-4">Company</h3>
                            <ul className="space-y-3">
                                <li>
                                    <a href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                                        <Info className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                                        <Mail className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                        Contact
                                    </a>
                                </li>
                                {/* <li>
                                    <a href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                                        <FileText className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a href="/careers" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                                        <span className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity">💼</span>
                                        Careers
                                    </a>
                                </li> */}
                            </ul>
                        </div>

                        {/* Legal & Support Links */}
                        <div>
                            <h3 className="font-semibold text-sm mb-4">Legal & Support</h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                                        <Shield className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                                        <FileText className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                        Terms of Service
                                    </Link>
                                </li>
                                {/* <li>
                                    <a href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                                        <HelpCircle className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a href="/status" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                                        <span className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity">📊</span>
                                        System Status
                                    </a>
                                </li> */}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="border-t border-border pt-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-center md:text-left text-sm text-muted-foreground">
                                <p>© {currentYear} ShortLink. All rights reserved.</p>
                            </div>

                            <div className="flex items-center gap-6 text-xs text-muted-foreground">
                                <a href="/sitemap" className="hover:text-primary transition-colors">
                                    Sitemap
                                </a>
                                <a href="/accessibility" className="hover:text-primary transition-colors">
                                    Accessibility
                                </a>
                                <a href="/cookies" className="hover:text-primary transition-colors">
                                    Cookie Settings
                                </a>
                            </div>
                        </div>

                        {/* Optional: Trust badges or certifications */}
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-green-500" />
                                <span>SSL Secured</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-blue-500" />
                                <span>GDPR Compliant</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-green-500">●</span>
                                <span>All Systems Operational</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
