import type { SettingInput } from "@/lib/validation/settings-admin";

export const ROLE_DEFS = [
  { key: "admin", name: "Admin", description: "Full platform access" },
  { key: "doctor", name: "Doctor", description: "Clinical staff" },
  { key: "receptionist", name: "Receptionist", description: "Front desk staff" },
  { key: "customer", name: "Customer", description: "Clinic client" },
] as const;

export const PERMISSION_DEFS = [
  { key: "users.read", name: "Read users", description: "View user profiles" },
  { key: "users.write", name: "Write users", description: "Create and update users" },
  { key: "users.manage", name: "Manage users", description: "Ban, disable, and assign roles" },
  { key: "appointments.read", name: "Read appointments", description: "View appointments" },
  { key: "appointments.write", name: "Write appointments", description: "Create and update appointments" },
  { key: "appointments.manage", name: "Manage appointments", description: "Cancel and reschedule appointments" },
  { key: "records.read", name: "Read records", description: "View medical records" },
  { key: "records.write", name: "Write records", description: "Create and update medical records" },
  { key: "services.read", name: "Read services", description: "View the service catalog" },
  { key: "services.write", name: "Write services", description: "Create and update the service catalog" },
  { key: "services.manage", name: "Manage services", description: "Deactivate and delete service catalog entries" },
  { key: "rules.read", name: "Read rules", description: "View the clinic rules" },
  { key: "rules.write", name: "Write rules", description: "Create and update clinic rules" },
  { key: "rules.manage", name: "Manage rules", description: "Deactivate and delete clinic rules" },
  { key: "care-guides.read", name: "Read care guides", description: "View the care guides" },
  { key: "care-guides.write", name: "Write care guides", description: "Create and update care guides" },
  { key: "care-guides.manage", name: "Manage care guides", description: "Deactivate and delete care guides" },
  { key: "files.read", name: "Read files", description: "Browse and download the file manager" },
  { key: "files.write", name: "Write files", description: "Upload, create, edit and rename files" },
  { key: "files.manage", name: "Manage files", description: "Move files to trash, restore and delete" },
  { key: "settings.read", name: "Read settings", description: "View platform settings" },
  { key: "settings.write", name: "Write settings", description: "Create and update platform settings" },
  { key: "settings.manage", name: "Manage settings", description: "Deactivate and delete platform settings" },
] as const;

export const ALL_PERMISSIONS = PERMISSION_DEFS.map((p) => p.key);

export const ROLE_PERMISSIONS: Record<string, readonly string[]> = {
  admin: ALL_PERMISSIONS,
  doctor: [
    "users.read",
    "appointments.read",
    "appointments.write",
    "records.read",
    "records.write",
    "services.read",
    "services.write",
    "rules.read",
    "rules.write",
    "care-guides.read",
    "care-guides.write",
    "files.read",
  ],
  receptionist: [
    "users.read",
    "users.write",
    "appointments.read",
    "appointments.write",
    "services.read",
    "rules.read",
    "care-guides.read",
    "files.read",
    "files.write",
  ],
  customer: [],
};

export const SYSTEM_SETTINGS: SettingInput[] = [
  // Placeholder phone — replace with the real clinic number before going live.
  { key: "contact.phone", value: "+989120000000", type: "string" },
  {
    key: "contact.address_full",
    value: "اندیشه فاز دو - میدان مادر - ابتدای بلوار نیلوفر نبش بنفشه هفتم - پلاک ۳۹ - طبقه دو",
    type: "localized",
    translations: {
      fa: "اندیشه فاز دو - میدان مادر - ابتدای بلوار نیلوفر نبش بنفشه هفتم - پلاک ۳۹ - طبقه دو",
      en: "Andisheh Phase 2 - Mader Square - Beginning of Niloofar Blvd, corner of Banafsheh 7th - No. 39 - Floor 2",
    },
  },
  { key: "contact.city", value: "اندیشه", type: "string" },
  { key: "contact.province", value: "تهران", type: "string" },
  { key: "contact.country", value: "IR", type: "string" },
  { key: "contact.map_neshan", value: "https://nshn.ir/rbvg0k2xLMq4", type: "string" },
  // eslint-disable-next-line no-secrets/no-secrets -- public Google Maps search URL, not a secret
  { key: "contact.map_google", value: "https://www.google.com/maps/search/?api=1&query=Andisheh+Phase+2", type: "string" },
  {
    key: "clinic.opening_hours",
    value: [
      {
        days: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"],
        opens: "09:00",
        closes: "19:00",
      },
      { days: ["Thursday"], opens: "09:00", closes: "14:00" },
    ],
    type: "array",
  },
  { key: "booking.min_cancel_hours", value: 24, type: "number" },
  { key: "booking.price", value: 0, type: "number" },
  {
    key: "booking.currency",
    value: "تومان",
    type: "localized",
    translations: { fa: "تومان", en: "Toman" },
  },
  {
    key: "clinic.name",
    value: "کلینیک زیبایی نفس",
    type: "localized",
    translations: { fa: "کلینیک زیبایی نفس", en: "Nafas Beauty Clinic" },
  },
  {
    key: "contact.address_title",
    value: "آدرس کلینیک",
    type: "localized",
    translations: { fa: "آدرس کلینیک", en: "Clinic Address" },
  },
  {
    key: "contact.social_title",
    value: "شبکه‌های اجتماعی",
    type: "localized",
    translations: { fa: "شبکه‌های اجتماعی", en: "Social Media" },
  },
  {
    key: "contact.booking_title",
    value: "رزرو آنلاین",
    type: "localized",
    translations: { fa: "رزرو آنلاین", en: "Online Booking" },
  },
  {
    key: "contact.neshan_map",
    value: "مشاهده روی نقشه نشان",
    type: "localized",
    translations: { fa: "مشاهده روی نقشه نشان", en: "View on Neshan Map" },
  },
  {
    key: "contact.neshan_desc",
    value: "مسیریابی با نشان",
    type: "localized",
    translations: { fa: "مسیریابی با نشان", en: "Navigate with Neshan" },
  },
  {
    key: "contact.google_map",
    value: "مشاهده روی نقشه گوگل",
    type: "localized",
    translations: { fa: "مشاهده روی نقشه گوگل", en: "View on Google Maps" },
  },
  {
    key: "contact.google_desc",
    value: "مسیریابی با گوگل‌مپ",
    type: "localized",
    translations: { fa: "مسیریابی با گوگل‌مپ", en: "Navigate with Google Maps" },
  },
  {
    key: "booking.select_service",
    value: "انتخاب خدمت...",
    type: "localized",
    translations: { fa: "انتخاب خدمت...", en: "Select a service..." },
  },
  {
    key: "common.opens_in_new_tab",
    value: "در تب جدید باز می‌شود",
    type: "localized",
    translations: { fa: "در تب جدید باز می‌شود", en: "Opens in new tab" },
  },
];

export const SOCIAL_LINKS = [
  {
    key: "rubika",
    url: "https://rubika.ir/nafasclinic",
    labelFa: "روبیکا",
    labelEn: "Rubika",
    imageUrl: null,
    displayOrder: 1,
    isActive: true,
  },
  {
    key: "bale",
    url: "https://ble.ir/nafasclinic",
    labelFa: "بله",
    labelEn: "Bale",
    imageUrl: null,
    displayOrder: 2,
    isActive: true,
  },
  {
    key: "instagram",
    url: "https://instagram.com/nafasclinic",
    labelFa: "اینستاگرام",
    labelEn: "Instagram",
    imageUrl: null,
    displayOrder: 3,
    isActive: true,
  },
] as const;