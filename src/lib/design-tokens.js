// ─── DAL Brand Colours ────────────────────────────────────────
export const BRAND_BLACK = "#0D0D0D";
export const BRAND_GOLD = "#C9A227";
export const BRAND_GOLD_LIGHT = "#E8C84A";
export const BRAND_GOLD_MUTED = "#F5E6A3";
export const BRAND_OFF_WHITE = "#FAFAF7";
export const BRAND_SURFACE = "#FFFFFF";

// ─── Text ─────────────────────────────────────────────────────
export const TEXT_PRIMARY = "#0D0D0D";
export const TEXT_SECONDARY = "#555555";

// ─── Borders & States ─────────────────────────────────────────
export const BORDER = "#E0E0E0";
export const SUCCESS = "#1A8C4E";
export const WARNING = "#D97706";
export const ERROR = "#C0392B";

// ─── Spacing (4 px increments) ────────────────────────────────
export const SPACE_1 = "4px";
export const SPACE_2 = "8px";
export const SPACE_3 = "12px";
export const SPACE_4 = "16px";
export const SPACE_5 = "24px";
export const SPACE_6 = "32px";
export const SPACE_7 = "48px";
export const SPACE_8 = "64px";
export const SPACE_9 = "96px";

// ─── Radius ───────────────────────────────────────────────────
export const RADIUS_SM = "6px";
export const RADIUS_MD = "10px";
export const RADIUS_LG = "16px";
export const RADIUS_XL = "24px";
export const RADIUS_FULL = "9999px";

// ─── Shadows ──────────────────────────────────────────────────
export const SHADOW_SM = "0 1px 3px rgba(0,0,0,0.08)";
export const SHADOW_MD = "0 4px 12px rgba(0,0,0,0.10)";
export const SHADOW_LG = "0 10px 30px rgba(0,0,0,0.12)";
export const SHADOW_GOLD = "0 0 0 3px rgba(201,162,39,0.35)";

// ─── Convenience object export ────────────────────────────────
const designTokens = {
    colors: {
        brandBlack: BRAND_BLACK,
        brandGold: BRAND_GOLD,
        brandGoldLight: BRAND_GOLD_LIGHT,
        brandGoldMuted: BRAND_GOLD_MUTED,
        brandOffWhite: BRAND_OFF_WHITE,
        brandSurface: BRAND_SURFACE,
        textPrimary: TEXT_PRIMARY,
        textSecondary: TEXT_SECONDARY,
        border: BORDER,
        success: SUCCESS,
        warning: WARNING,
        error: ERROR,
    },
    spacing: {
        1: SPACE_1,
        2: SPACE_2,
        3: SPACE_3,
        4: SPACE_4,
        5: SPACE_5,
        6: SPACE_6,
        7: SPACE_7,
        8: SPACE_8,
        9: SPACE_9,
    },
    radius: {
        sm: RADIUS_SM,
        md: RADIUS_MD,
        lg: RADIUS_LG,
        xl: RADIUS_XL,
        full: RADIUS_FULL,
    },
    shadows: {
        sm: SHADOW_SM,
        md: SHADOW_MD,
        lg: SHADOW_LG,
        gold: SHADOW_GOLD,
    },
};

export default designTokens;
