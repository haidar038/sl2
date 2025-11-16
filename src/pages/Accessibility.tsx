import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Eye, Keyboard, Monitor, Type, Volume2, CheckCircle, Mail } from "lucide-react";

export default function Accessibility() {
    return (
        <div className="min-h-screen bg-gradient-subtle">
            <Navbar />

            <div className="container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-medium">Accessibility</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Accessibility Statement</h1>
                        <p className="text-muted-foreground text-lg">Last updated: January 2025</p>
                    </div>

                    {/* Content */}
                    <div className="bg-card rounded-lg border border-border p-8 md:p-12 space-y-8">
                        {/* Commitment */}
                        <section>
                            <p className="text-muted-foreground leading-relaxed">
                                ShortLink is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to ensure
                                we provide equal access to all of our users.
                            </p>
                        </section>

                        {/* WCAG Compliance */}
                        <section>
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Standards & Conformance</h2>
                                </div>
                            </div>

                            <div className="space-y-3 ml-13 text-muted-foreground">
                                <p>
                                    ShortLink strives to conform to the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA. These guidelines explain how to make web content more accessible for people with disabilities and more
                                    user-friendly for everyone.
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>WCAG 2.1 Level A & AA compliance (target)</li>
                                    <li>Section 508 standards</li>
                                    <li>EN 301 549 European accessibility requirements</li>
                                </ul>
                            </div>
                        </section>

                        {/* Features */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Accessibility Features</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Keyboard Navigation */}
                                <div className="p-5 rounded-lg bg-muted/50 border border-border">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Keyboard className="w-5 h-5 text-primary" />
                                        </div>
                                        <h3 className="font-semibold text-lg">Keyboard Navigation</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Full keyboard navigation support with visible focus indicators. Navigate through all interactive elements using Tab, Enter, and Arrow keys.</p>
                                </div>

                                {/* Screen Reader Support */}
                                <div className="p-5 rounded-lg bg-muted/50 border border-border">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Volume2 className="w-5 h-5 text-primary" />
                                        </div>
                                        <h3 className="font-semibold text-lg">Screen Reader Support</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Semantic HTML and ARIA labels ensure compatibility with screen readers like NVDA, JAWS, and VoiceOver.</p>
                                </div>

                                {/* Responsive Design */}
                                <div className="p-5 rounded-lg bg-muted/50 border border-border">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Monitor className="w-5 h-5 text-primary" />
                                        </div>
                                        <h3 className="font-semibold text-lg">Responsive Design</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Mobile-friendly, responsive layout that works across all devices and screen sizes. Supports zoom up to 200% without loss of functionality.</p>
                                </div>

                                {/* Color Contrast */}
                                <div className="p-5 rounded-lg bg-muted/50 border border-border">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Eye className="w-5 h-5 text-primary" />
                                        </div>
                                        <h3 className="font-semibold text-lg">Color Contrast</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">WCAG AA compliant color contrast ratios (4.5:1 for normal text, 3:1 for large text). Dark mode available for reduced eye strain.</p>
                                </div>

                                {/* Readable Typography */}
                                <div className="p-5 rounded-lg bg-muted/50 border border-border">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Type className="w-5 h-5 text-primary" />
                                        </div>
                                        <h3 className="font-semibold text-lg">Readable Typography</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Clear, readable fonts with appropriate sizing and line spacing. Text can be resized up to 200% without breaking layout.</p>
                                </div>

                                {/* Alternative Text */}
                                <div className="p-5 rounded-lg bg-muted/50 border border-border">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-primary" />
                                        </div>
                                        <h3 className="font-semibold text-lg">Alternative Text</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">All images, icons, and non-text content include descriptive alternative text for screen readers.</p>
                                </div>
                            </div>
                        </section>

                        {/* Assistive Technologies */}
                        <section>
                            <h2 className="text-2xl font-bold mb-3">Compatible Assistive Technologies</h2>
                            <div className="text-muted-foreground space-y-3">
                                <p>ShortLink is designed to work with the following assistive technologies:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Screen readers (NVDA, JAWS, VoiceOver, TalkBack)</li>
                                    <li>Screen magnification software (ZoomText, MAGic)</li>
                                    <li>Voice recognition software (Dragon NaturallySpeaking)</li>
                                    <li>Alternative input devices (switch controls, eye tracking)</li>
                                    <li>Browser accessibility features and extensions</li>
                                </ul>
                            </div>
                        </section>

                        {/* Limitations */}
                        <section>
                            <h2 className="text-2xl font-bold mb-3">Known Limitations</h2>
                            <div className="text-muted-foreground space-y-3">
                                <p>Despite our best efforts, some limitations may exist:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Third-party integrations may not be fully accessible</li>
                                    <li>Some PDF downloads may require additional accessibility tools</li>
                                    <li>Complex data visualizations in analytics may have limited screen reader support</li>
                                </ul>
                                <p className="mt-4">We are actively working to address these limitations and improve accessibility across all features.</p>
                            </div>
                        </section>

                        {/* Tips for Users */}
                        <section className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                            <h2 className="text-2xl font-bold mb-4">Tips for Users with Disabilities</h2>
                            <div className="space-y-3 text-muted-foreground">
                                <div>
                                    <h3 className="font-semibold text-foreground mb-2">Keyboard Shortcuts</h3>
                                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                                        <li>
                                            <kbd className="px-2 py-1 bg-muted rounded text-xs">Tab</kbd> - Navigate forward through interactive elements
                                        </li>
                                        <li>
                                            <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift + Tab</kbd> - Navigate backward
                                        </li>
                                        <li>
                                            <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> or <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd> - Activate buttons and links
                                        </li>
                                        <li>
                                            <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd> - Close dialogs and modals
                                        </li>
                                    </ul>
                                </div>

                                <div className="pt-3">
                                    <h3 className="font-semibold text-foreground mb-2">Browser Zoom</h3>
                                    <p className="text-sm">
                                        Use <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl +</kbd> (Windows) or <kbd className="px-2 py-1 bg-muted rounded text-xs">Cmd +</kbd> (Mac) to increase text size. Our layout remains
                                        functional up to 200% zoom.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Testing */}
                        <section>
                            <h2 className="text-2xl font-bold mb-3">Accessibility Testing</h2>
                            <div className="text-muted-foreground space-y-3">
                                <p>We regularly test our website using:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Automated accessibility testing tools (axe DevTools, WAVE, Lighthouse)</li>
                                    <li>Manual testing with screen readers and keyboard navigation</li>
                                    <li>User testing with people with disabilities</li>
                                    <li>Third-party accessibility audits</li>
                                </ul>
                            </div>
                        </section>

                        {/* Ongoing Efforts */}
                        <section>
                            <h2 className="text-2xl font-bold mb-3">Ongoing Accessibility Efforts</h2>
                            <div className="text-muted-foreground space-y-3">
                                <p>We are committed to continuous improvement:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Regular accessibility audits and updates</li>
                                    <li>Team training on accessibility best practices</li>
                                    <li>Incorporating accessibility into our design and development process</li>
                                    <li>Gathering feedback from users with disabilities</li>
                                    <li>Staying current with evolving accessibility standards</li>
                                </ul>
                            </div>
                        </section>

                        {/* Feedback */}
                        <section className="border-t border-border pt-6">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Feedback & Contact</h2>
                                </div>
                            </div>

                            <div className="ml-13 text-muted-foreground">
                                <p className="mb-3">We welcome your feedback on the accessibility of ShortLink. If you encounter any accessibility barriers or have suggestions for improvement, please let us know:</p>
                                <ul className="space-y-2">
                                    <li>
                                        <strong>Email:</strong>{" "}
                                        <a href="mailto:haidar038@gmail.com" className="text-primary hover:underline">
                                            haidar038@gmail.com
                                        </a>
                                    </li>
                                    <li>
                                        <strong>Response Time:</strong> We aim to respond to accessibility feedback within 3 business days
                                    </li>
                                </ul>
                                <p className="mt-4 text-sm">Your feedback helps us improve accessibility for all users. We appreciate you taking the time to help us create a more inclusive experience.</p>
                            </div>
                        </section>

                        {/* Legal Notice */}
                        <section className="text-sm text-muted-foreground border-t border-border pt-6">
                            <p>
                                This accessibility statement was last reviewed on January 2025. We are committed to maintaining and improving the accessibility of our website. This statement will be updated as we make improvements and
                                receive feedback.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
