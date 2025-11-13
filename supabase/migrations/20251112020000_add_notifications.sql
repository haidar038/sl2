-- Add notification preferences to profiles table
ALTER TABLE public.profiles
ADD COLUMN notify_milestone_clicks BOOLEAN DEFAULT TRUE,
ADD COLUMN notify_expiry_warning BOOLEAN DEFAULT TRUE,
ADD COLUMN notify_suspicious_activity BOOLEAN DEFAULT TRUE,
ADD COLUMN milestone_thresholds INTEGER[] DEFAULT ARRAY[100, 1000, 10000, 100000];

-- Create notifications table for tracking sent notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url_id UUID REFERENCES public.urls(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'milestone', 'expiry', 'suspicious'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true); -- Allow system to insert

-- Create indexes
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_url_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, url_id, type, title, message, metadata)
  VALUES (p_user_id, p_url_id, p_type, p_title, p_message, p_metadata)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = TRUE
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = TRUE
  WHERE user_id = auth.uid() AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add comment for documentation
COMMENT ON TABLE public.notifications IS 'In-app notifications for users';
COMMENT ON COLUMN public.profiles.notify_milestone_clicks IS 'Send notification when URL reaches milestone clicks';
COMMENT ON COLUMN public.profiles.notify_expiry_warning IS 'Send notification when URL is about to expire';
COMMENT ON COLUMN public.profiles.notify_suspicious_activity IS 'Send notification on suspicious activity';
