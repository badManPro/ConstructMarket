import type { UserProfile } from "../../types/models";
import { seededUserProfile } from "../../mock/profile";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function pickString(source: Record<string, unknown>, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function pickNumber(source: Record<string, unknown>, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return fallback;
}

export function adaptUserProfile(input: unknown): UserProfile {
  const source = isRecord(input) ? input : {};
  const nickname = pickString(source, ["nickname", "name"], seededUserProfile.nickname);

  return {
    id: pickString(source, ["id", "userId"], seededUserProfile.id),
    avatar: pickString(source, ["avatar", "avatarUrl"], nickname.slice(0, 1) || seededUserProfile.avatar),
    nickname,
    phone: pickString(source, ["phone", "mobile"], seededUserProfile.phone),
    companyName: pickString(source, ["companyName", "enterpriseName"], seededUserProfile.companyName),
    buyerRole: pickString(source, ["buyerRole", "roleName"], seededUserProfile.buyerRole),
    couponCount: pickNumber(source, ["couponCount", "availableCouponCount"], seededUserProfile.couponCount),
    defaultAddressId: pickString(source, ["defaultAddressId"], seededUserProfile.defaultAddressId),
  };
}
