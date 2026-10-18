Plan — disable email in login UI, SMS only, 2-min SMS config

1. Login UI — hide email, force SMS
   - components/login/OtpLoginForm.tsx: set default channel "sms", hide/remove email state/display (mask only SMS, keep email variables but not shown)
   - components/login/PhoneStep.tsx: hide email input/channel picker; show only phone input and SMS channel selected
   - components/login/ChannelPicker.tsx: keep file, just disable/show only SMS option (or hide picker when SMS forced)
   - components/login/VerifyStep.tsx: keep file, update text to reference SMS only (no email mention)
   - No file deletions — just UI state/config adjustments

2. SMS limits config — change 5 min → 2 min max (config only, no removals)
   - lib/auth/otp-limits.ts: SMS_OTP_TTL_MS = 2 * 60 * 1000; SMS_OTP_RESEND_COOLDOWN_MS = 2 * 60 * 1000
   - Keep OTP_TTL_MS / OTP_RESEND_COOLDOWN_MS unchanged for future email re-enable
   - No changes to lib/auth/otp.ts routes or API handlers

3. Verify no removals
   - Confirm ChannelPicker, PhoneStep, verify routes remain intact
   - Confirm email schema/api untouched so it can be re-enabled later

No API changes. Only config + UI hiding.
