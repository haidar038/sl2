import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, Sparkles, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  getGuestSessionId,
  getGuestUrlCount,
  clearGuestSession,
} from "@/lib/guestSession";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Modal that appears after user signs up/logs in to offer
 * migration of demo URLs to their account
 */
export function GuestUrlMigrationModal() {
  const { user, session } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [guestUrlCount, setGuestUrlCount] = useState(0);
  const [migrating, setMigrating] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only check once per session when user is authenticated
    if (!user || !session || hasChecked) return;

    const guestSessionId = getGuestSessionId();
    const urlCount = getGuestUrlCount();

    // Show modal if user has guest URLs
    if (guestSessionId && urlCount > 0) {
      setGuestUrlCount(urlCount);
      setShowModal(true);
    }

    setHasChecked(true);
  }, [user, session, hasChecked]);

  const handleMigrate = async () => {
    if (!user) return;

    const guestSessionId = getGuestSessionId();
    if (!guestSessionId) {
      toast.error("No guest session found");
      return;
    }

    setMigrating(true);

    try {
      // Call the database function to migrate guest URLs
      const { data, error } = await supabase.rpc("migrate_guest_urls_to_user", {
        p_guest_session_id: guestSessionId,
        p_user_id: user.id,
      });

      if (error) {
        console.error("Error migrating guest URLs:", error);
        toast.error("Failed to transfer URLs. Please try again.");
        return;
      }

      // Clear guest session from localStorage
      clearGuestSession();

      // Show success message
      const migratedCount = data?.[0]?.migrated_count || 0;
      if (migratedCount > 0) {
        toast.success(
          `Successfully transferred ${migratedCount} URL${migratedCount > 1 ? "s" : ""} to your account!`
        );
      }

      // Close modal
      setShowModal(false);
    } catch (error) {
      console.error("Error in migration:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setMigrating(false);
    }
  };

  const handleDecline = () => {
    // Clear guest session without migrating
    clearGuestSession();
    setShowModal(false);
    toast.info("Demo URLs were not transferred");
  };

  const handleSkip = () => {
    // Just close the modal, keep guest session for potential later migration
    setShowModal(false);
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Transfer Demo URLs?</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            You created{" "}
            <Badge variant="secondary" className="mx-1 px-2 py-0.5">
              <Link2 className="w-3 h-3 mr-1" />
              {guestUrlCount} demo URL{guestUrlCount > 1 ? "s" : ""}
            </Badge>{" "}
            before signing in. Would you like to add them to your account?
          </DialogDescription>
        </DialogHeader>

        {/* Benefits List */}
        <div className="space-y-3 py-4">
          <p className="text-sm font-medium text-muted-foreground">
            By transferring, you'll get:
          </p>
          <ul className="space-y-2">
            {[
              "Permanent ownership (no 7-day expiration)",
              "Full edit and delete capabilities",
              "Detailed click analytics and insights",
              "Custom alias management",
            ].map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDecline}
            disabled={migrating}
            className="w-full sm:w-auto"
          >
            <X className="w-4 h-4 mr-2" />
            No, Discard Them
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={migrating}
              className="flex-1 sm:flex-none"
            >
              Ask Later
            </Button>
            <Button
              onClick={handleMigrate}
              disabled={migrating}
              className="flex-1 sm:flex-none"
            >
              {migrating ? (
                "Transferring..."
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Yes, Transfer
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
