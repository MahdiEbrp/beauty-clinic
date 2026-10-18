-- Add the Tabapay payment provider kind to the payment_provider_kind enum so
-- a Tabapay gateway can be stored in payment_providers (merchant code 123).
-- Idempotent: safe to re-run if the value already exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'payment_provider_kind'::regtype
      AND enumlabel = 'tabapay'
  ) THEN
    ALTER TYPE "public"."payment_provider_kind" ADD VALUE 'tabapay' AFTER 'zarinpal';
  END IF;
END $$;
