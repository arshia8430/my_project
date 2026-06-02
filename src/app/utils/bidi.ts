import type { CSSProperties } from "react";

export const rtlMixedTextStyle: CSSProperties = {
  direction: "rtl",
  textAlign: "right",
  unicodeBidi: "plaintext",
};

export const rtlMixedBlockStyle: CSSProperties = {
  ...rtlMixedTextStyle,
  whiteSpace: "pre-wrap",
  overflowWrap: "break-word",
};

export const ltrTechnicalTextStyle: CSSProperties = {
  direction: "ltr",
  textAlign: "left",
  unicodeBidi: "plaintext",
};

export const rtlMixedTextProps = {
  dir: "rtl" as const,
  lang: "fa" as const,
  style: rtlMixedTextStyle,
};

export const rtlMixedBlockProps = {
  dir: "rtl" as const,
  lang: "fa" as const,
  style: rtlMixedBlockStyle,
};

export const ltrTechnicalTextProps = {
  dir: "ltr" as const,
  style: ltrTechnicalTextStyle,
};
