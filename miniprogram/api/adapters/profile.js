"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptUserProfile = adaptUserProfile;
const profile_1 = require("../../mock/profile");
function isRecord(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function pickString(source, keys, fallback = "") {
    for (const key of keys) {
        const value = source[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }
    return fallback;
}
function pickNumber(source, keys, fallback = 0) {
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
function adaptUserProfile(input) {
    const source = isRecord(input) ? input : {};
    const nickname = pickString(source, ["nickname", "name"], profile_1.seededUserProfile.nickname);
    return {
        id: pickString(source, ["id", "userId"], profile_1.seededUserProfile.id),
        avatar: pickString(source, ["avatar", "avatarUrl"], nickname.slice(0, 1) || profile_1.seededUserProfile.avatar),
        nickname,
        phone: pickString(source, ["phone", "mobile"], profile_1.seededUserProfile.phone),
        companyName: pickString(source, ["companyName", "enterpriseName"], profile_1.seededUserProfile.companyName),
        buyerRole: pickString(source, ["buyerRole", "roleName"], profile_1.seededUserProfile.buyerRole),
        couponCount: pickNumber(source, ["couponCount", "availableCouponCount"], profile_1.seededUserProfile.couponCount),
        defaultAddressId: pickString(source, ["defaultAddressId"], profile_1.seededUserProfile.defaultAddressId),
    };
}
