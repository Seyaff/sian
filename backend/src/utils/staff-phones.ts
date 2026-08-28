import { Env } from "../config/app.config";

export function getStaffPhones(): string[] {
  const phones = [Env.OWNER_WHATSAPP_PHONE, ...Env.STAFF_WHATSAPP_PHONES.split(",")]
    .map((p) => p.trim())
    .filter(Boolean);
  return [...new Set(phones)];
}

export function isStaffPhone(phone: string): boolean {
  const normalized = phone.replace(/\D/g, "");
  return getStaffPhones().some((staff) => {
    const staffNorm = staff.replace(/\D/g, "");
    return normalized === staffNorm || normalized.endsWith(staffNorm) || staffNorm.endsWith(normalized);
  });
}
