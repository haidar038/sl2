import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText, AlertTriangle, CheckCircle, XCircle, Scale, Mail } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Legal Agreement</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground text-lg">
              Last updated: January 2025
            </p>
          </div>

          {/* Content */}
          <div className="bg-card rounded-lg border border-border p-8 md:p-12 space-y-8">
            {/* Introduction */}
            <section>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to ShortLink. These Terms of Service ("Terms") govern your access to and use of
                our URL shortening service. By accessing or using ShortLink, you agree to be bound by
                these Terms. If you disagree with any part of these Terms, you may not access the service.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">1. Acceptance of Terms</h2>
                </div>
              </div>

              <div className="space-y-3 ml-13 text-muted-foreground">
                <p>
                  By creating an account or using ShortLink, you acknowledge that you have read, understood,
                  and agree to be bound by these Terms and our Privacy Policy. You also represent that you
                  are at least 13 years old and have the legal capacity to enter into this agreement.
                </p>
              </div>
            </section>

            {/* Description of Service */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">2. Description of Service</h2>
                </div>
              </div>

              <div className="space-y-3 ml-13 text-muted-foreground">
                <p>
                  ShortLink provides a URL shortening service that allows you to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Create shortened URLs with custom or auto-generated slugs</li>
                  <li>Track click analytics and performance metrics</li>
                  <li>Generate QR codes for your shortened links</li>
                  <li>Manage your links through a web dashboard</li>
                  <li>Access our service via REST API</li>
                  <li>Set expiration dates and password protection for links</li>
                </ul>
                <p className="mt-4">
                  We reserve the right to modify, suspend, or discontinue any part of the service at any
                  time with or without notice.
                </p>
              </div>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-bold mb-3">3. Account Registration and Security</h2>
              <div className="text-muted-foreground space-y-3">
                <p>
                  To use certain features of ShortLink, you must register for an account. You agree to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
                <p className="mt-4">
                  You may not share your account credentials or allow others to access your account.
                  We reserve the right to suspend or terminate accounts that violate these Terms.
                </p>
              </div>
            </section>

            {/* Acceptable Use */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">4. Acceptable Use Policy</h2>
                </div>
              </div>

              <div className="space-y-4 ml-13">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Permitted Uses</h3>
                  <p className="text-muted-foreground mb-2">You may use ShortLink for:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Legitimate marketing and promotional campaigns</li>
                    <li>Social media sharing and engagement</li>
                    <li>Personal link management and organization</li>
                    <li>Business communications and analytics</li>
                    <li>Educational and non-profit purposes</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Prohibited Activities */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">5. Prohibited Activities</h2>
                </div>
              </div>

              <div className="space-y-3 ml-13">
                <p className="text-muted-foreground">
                  You agree NOT to use ShortLink for any of the following purposes:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Distributing malware, viruses, or malicious code</li>
                  <li>Phishing, fraud, or identity theft</li>
                  <li>Spam or unsolicited commercial messages</li>
                  <li>Adult content, illegal pornography, or exploitation material</li>
                  <li>Harassment, hate speech, or threatening content</li>
                  <li>Copyright infringement or intellectual property violations</li>
                  <li>Illegal drugs, weapons, or prohibited substances</li>
                  <li>Pyramid schemes, multi-level marketing, or scams</li>
                  <li>Circumventing security measures or exploiting vulnerabilities</li>
                  <li>Impersonating others or creating misleading links</li>
                  <li>Any illegal activity or violation of applicable laws</li>
                </ul>
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">
                      <strong>Warning:</strong> Violation of this policy will result in immediate account
                      suspension or termination. We cooperate with law enforcement agencies and will report
                      illegal activities.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Content Ownership */}
            <section>
              <h2 className="text-2xl font-bold mb-3">6. Content Ownership and License</h2>
              <div className="text-muted-foreground space-y-3">
                <p>
                  You retain all ownership rights to the URLs and content you submit to ShortLink. By using
                  our service, you grant us a limited, worldwide, non-exclusive license to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Store and process your URLs and associated metadata</li>
                  <li>Display your shortened links when accessed</li>
                  <li>Generate analytics and performance metrics</li>
                  <li>Create aggregated, anonymized statistics for service improvement</li>
                </ul>
                <p className="mt-4">
                  This license terminates when you delete your URLs or close your account, except for
                  anonymized analytics data.
                </p>
              </div>
            </section>

            {/* Link Expiration and Deletion */}
            <section>
              <h2 className="text-2xl font-bold mb-3">7. Link Expiration and Deletion</h2>
              <div className="text-muted-foreground space-y-3">
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Links with expiration dates will automatically stop working after the specified date</li>
                  <li>Deleted links are soft-deleted and can be restored within 30 days</li>
                  <li>After 30 days, deleted links are permanently removed</li>
                  <li>We reserve the right to remove links that violate these Terms without notice</li>
                  <li>Inactive accounts (no login for 1 year) may be subject to deletion</li>
                </ul>
              </div>
            </section>

            {/* API Usage */}
            <section>
              <h2 className="text-2xl font-bold mb-3">8. API Usage and Rate Limits</h2>
              <div className="text-muted-foreground space-y-3">
                <p>
                  If you use our API, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Respect rate limits and quotas assigned to your API keys</li>
                  <li>Keep your API keys secure and not share them publicly</li>
                  <li>Use API keys only for authorized purposes</li>
                  <li>Not attempt to circumvent rate limits or abuse the API</li>
                  <li>Comply with all other terms in this agreement</li>
                </ul>
                <p className="mt-4">
                  We reserve the right to revoke API access for violations or abuse.
                </p>
              </div>
            </section>

            {/* Disclaimer of Warranties */}
            <section>
              <h2 className="text-2xl font-bold mb-3">9. Disclaimer of Warranties</h2>
              <div className="text-muted-foreground space-y-3">
                <p>
                  ShortLink is provided "as is" and "as available" without warranties of any kind, either
                  express or implied. We do not warrant that:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>The service will be uninterrupted, secure, or error-free</li>
                  <li>The results obtained from using the service will be accurate or reliable</li>
                  <li>Any errors or defects will be corrected</li>
                  <li>Links will remain active indefinitely</li>
                </ul>
                <p className="mt-4">
                  You use ShortLink at your own risk. We are not responsible for any damage to your
                  computer system or loss of data resulting from the use of our service.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold mb-3">10. Limitation of Liability</h2>
              <div className="text-muted-foreground space-y-3">
                <p>
                  To the maximum extent permitted by law, ShortLink shall not be liable for any indirect,
                  incidental, special, consequential, or punitive damages, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Loss of profits, revenue, or business opportunities</li>
                  <li>Loss of data or information</li>
                  <li>Business interruption</li>
                  <li>Damage to reputation or goodwill</li>
                </ul>
                <p className="mt-4">
                  Our total liability for any claims arising from your use of ShortLink shall not exceed
                  the amount you paid us in the twelve (12) months preceding the claim.
                </p>
              </div>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-2xl font-bold mb-3">11. Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to indemnify, defend, and hold harmless ShortLink, its officers, directors,
                employees, and agents from any claims, liabilities, damages, losses, costs, or expenses
                (including reasonable attorneys' fees) arising from:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1 ml-4">
                <li>Your use or misuse of the service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Content you submit through the service</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold mb-3">12. Termination</h2>
              <div className="text-muted-foreground space-y-3">
                <p>
                  We reserve the right to suspend or terminate your account and access to ShortLink at any
                  time, with or without cause, and with or without notice. Reasons for termination may include:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Violation of these Terms or our policies</li>
                  <li>Fraudulent, abusive, or illegal activity</li>
                  <li>Extended periods of inactivity</li>
                  <li>Request by law enforcement or government agencies</li>
                </ul>
                <p className="mt-4">
                  You may terminate your account at any time through your account settings. Upon termination,
                  your right to use the service will immediately cease.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold mb-3">13. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify users of material
                changes via email or through our service. Your continued use of ShortLink after such
                modifications constitutes your acceptance of the updated Terms. If you do not agree to the
                modified Terms, you must stop using the service.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold mb-3">14. Governing Law and Dispute Resolution</h2>
              <div className="text-muted-foreground space-y-3">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the
                  jurisdiction in which ShortLink operates, without regard to its conflict of law provisions.
                </p>
                <p>
                  Any disputes arising from these Terms or your use of ShortLink shall first be resolved
                  through good faith negotiations. If negotiations fail, disputes shall be resolved through
                  binding arbitration or in the courts of the applicable jurisdiction.
                </p>
              </div>
            </section>

            {/* Miscellaneous */}
            <section>
              <h2 className="text-2xl font-bold mb-3">15. Miscellaneous</h2>
              <div className="text-muted-foreground space-y-2">
                <p>
                  <strong>Severability:</strong> If any provision of these Terms is found to be unenforceable,
                  the remaining provisions will continue in full force and effect.
                </p>
                <p>
                  <strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms will
                  not be considered a waiver of those rights.
                </p>
                <p>
                  <strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute
                  the entire agreement between you and ShortLink regarding the service.
                </p>
                <p>
                  <strong>Assignment:</strong> You may not assign or transfer these Terms without our prior
                  written consent. We may assign our rights without restriction.
                </p>
              </div>
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
                <p className="mb-3">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <ul className="space-y-1">
                  <li>Email: legal@shortlink.example.com</li>
                  <li>Website: https://shortlink.example.com</li>
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
