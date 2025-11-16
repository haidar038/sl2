import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shield, Cookie, Database, Lock, Eye, Mail } from "lucide-react";

export default function Privacy() {
    return (
        <div className="min-h-screen bg-gradient-subtle">
            <Navbar />

            <div className="container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-medium">Privacy & Security</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-muted-foreground text-lg">Last updated: January 2025</p>
                    </div>

                    {/* Content */}
                    <div className="bg-card rounded-lg border border-border p-8 md:p-12 space-y-8">
                        {/* Introduction */}
                        <section>
                            <p className="text-muted-foreground leading-relaxed">
                                At ShortLink, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our URL shortening service. Please read this privacy
                                policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                            </p>
                        </section>

                        {/* Information We Collect */}
                        <section>
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Database className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Information We Collect</h2>
                                </div>
                            </div>

                            <div className="space-y-4 ml-13">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                                    <p className="text-muted-foreground">We collect information that you provide directly to us, including:</p>
                                    <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1 ml-4">
                                        <li>Email address (for account creation and authentication)</li>
                                        <li>URLs that you shorten and their associated metadata (titles, descriptions)</li>
                                        <li>Custom slugs and preferences</li>
                                        <li>API keys that you generate</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Automatically Collected Information</h3>
                                    <p className="text-muted-foreground">When someone clicks on your shortened links, we automatically collect:</p>
                                    <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1 ml-4">
                                        <li>IP address (hashed using SHA-256 for anonymization)</li>
                                        <li>User agent information (browser, operating system, device type)</li>
                                        <li>Referrer URL</li>
                                        <li>Geographic location (country and city based on IP)</li>
                                        <li>Timestamp of the click</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* How We Use Your Information */}
                        <section>
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Eye className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">How We Use Your Information</h2>
                                </div>
                            </div>

                            <div className="space-y-3 ml-13 text-muted-foreground">
                                <p>We use the information we collect to:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Provide, operate, and maintain our URL shortening service</li>
                                    <li>Process your authentication and manage your account</li>
                                    <li>Generate analytics and insights about link performance</li>
                                    <li>Detect and prevent abuse, fraud, and security threats</li>
                                    <li>Improve and optimize our service</li>
                                    <li>Send you technical notices and support messages</li>
                                    <li>Respond to your comments, questions, and customer service requests</li>
                                </ul>
                            </div>
                        </section>

                        {/* Data Security */}
                        <section>
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Lock className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Data Security</h2>
                                </div>
                            </div>

                            <div className="space-y-3 ml-13 text-muted-foreground">
                                <p>We implement industry-standard security measures to protect your information:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>All data is encrypted in transit using HTTPS/TLS</li>
                                    <li>IP addresses are hashed (SHA-256) before storage for anonymization</li>
                                    <li>Row-level security policies on our database</li>
                                    <li>API keys are stored as hashes with only prefixes visible</li>
                                    <li>Regular security audits and updates</li>
                                    <li>Secure authentication powered by Supabase</li>
                                </ul>
                                <p className="mt-4">
                                    However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute
                                    security.
                                </p>
                            </div>
                        </section>

                        {/* Cookies and Tracking */}
                        <section>
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Cookie className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Cookies and Tracking Technologies</h2>
                                </div>
                            </div>

                            <div className="space-y-3 ml-13 text-muted-foreground">
                                <p>We use cookies and similar tracking technologies to:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Keep you logged in to your account</li>
                                    <li>Remember your preferences and settings</li>
                                    <li>Analyze how our service is used</li>
                                    <li>Improve user experience</li>
                                </ul>
                                <p className="mt-4">You can control cookies through your browser settings. However, disabling cookies may affect the functionality of our service.</p>
                            </div>
                        </section>

                        {/* Data Retention */}
                        <section>
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Database className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Data Retention</h2>
                                </div>
                            </div>

                            <div className="space-y-3 ml-13 text-muted-foreground">
                                <p>We retain your information for as long as necessary to provide our services and as required by law:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Active URLs and their analytics are retained as long as your account is active</li>
                                    <li>Deleted URLs are soft-deleted and permanently removed after 30 days</li>
                                    <li>Account information is retained until you request deletion</li>
                                    <li>Analytics data may be aggregated and anonymized for statistical purposes</li>
                                </ul>
                            </div>
                        </section>

                        {/* Your Rights */}
                        <section>
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Your Privacy Rights</h2>
                                </div>
                            </div>

                            <div className="space-y-3 ml-13 text-muted-foreground">
                                <p>You have the right to:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Access and review your personal information</li>
                                    <li>Correct inaccurate or incomplete data</li>
                                    <li>Delete your account and associated data</li>
                                    <li>Export your data in a portable format</li>
                                    <li>Opt-out of certain data collection practices</li>
                                    <li>Withdraw consent at any time</li>
                                </ul>
                                <p className="mt-4">To exercise these rights, please contact us using the information provided below.</p>
                            </div>
                        </section>

                        {/* Third-Party Services */}
                        <section>
                            <h2 className="text-2xl font-bold mb-3">Third-Party Services</h2>
                            <div className="text-muted-foreground space-y-3">
                                <p>ShortLink uses the following third-party services that may collect information:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>
                                        <strong>Supabase:</strong> Database, authentication, and hosting infrastructure
                                    </li>
                                    <li>
                                        <strong>Cloudflare:</strong> CDN and edge computing for fast redirects
                                    </li>
                                </ul>
                                <p>These services have their own privacy policies and we encourage you to review them.</p>
                            </div>
                        </section>

                        {/* Children's Privacy */}
                        <section>
                            <h2 className="text-2xl font-bold mb-3">Children's Privacy</h2>
                            <p className="text-muted-foreground">
                                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13,
                                please contact us immediately.
                            </p>
                        </section>

                        {/* Changes to Policy */}
                        <section>
                            <h2 className="text-2xl font-bold mb-3">Changes to This Privacy Policy</h2>
                            <p className="text-muted-foreground">
                                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this
                                Privacy Policy periodically for any changes.
                            </p>
                        </section>

                        {/* Contact */}
                        <section className="border-t border-border pt-6">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Contact Us</h2>
                                </div>
                            </div>

                            <div className="ml-13 text-muted-foreground">
                                <p className="mb-3">If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
                                <ul className="space-y-1">
                                    <li>Email: haidar038@gmail.com</li>
                                    <li>Website: https://haidar038.vercel.app</li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
