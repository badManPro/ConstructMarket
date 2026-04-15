"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPageStatusOverride = getPageStatusOverride;
const PAGE_STATUS_SET = new Set(["loading", "ready", "empty", "error", "offline"]);
function getPageStatusOverride(state) {
    if (!state)
        return null;
    return PAGE_STATUS_SET.has(state) ? state : null;
}
