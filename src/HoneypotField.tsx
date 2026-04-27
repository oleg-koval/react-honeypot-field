import React, { forwardRef } from "react";
import type { HoneypotFieldProps } from "./types.js";

/**
 * Visually hidden input that is off-screen but accessible to screen readers
 * and keyboard navigation (tabIndex=-1 keeps it out of tab order).
 *
 * Bots that fill every visible or hidden field will fill this one.
 * Legitimate users never see or interact with it.
 *
 * Technique: position the wrapper off-screen with `position: absolute; left: -9999px`
 * rather than `display: none` or `visibility: hidden` — some bots skip fields
 * that are explicitly hidden via those CSS properties.
 */
const wrapperStyle: React.CSSProperties = {
  position: "absolute",
  left: "-9999px",
  top: "auto",
  width: "1px",
  height: "1px",
  overflow: "hidden",
};

export const HoneypotField = forwardRef<HTMLInputElement, HoneypotFieldProps>(
  function HoneypotField(
    {
      name = "website",
      label = "Do not fill this field",
      tabIndex = -1,
      id,
      ...rest
    },
    ref,
  ) {
    const fieldId = id ?? `hp-field-${name}`;

    return (
      <div style={wrapperStyle} aria-hidden="true">
        {/* Label is present for screen readers but aria-hidden on wrapper
            means the whole block is skipped by assistive technology.
            We keep it for semantic correctness and to fool naive parsers. */}
        <label htmlFor={fieldId}>{label}</label>
        <input
          ref={ref}
          id={fieldId}
          name={name}
          type="text"
          autoComplete="off"
          tabIndex={tabIndex}
          {...rest}
        />
      </div>
    );
  },
);

HoneypotField.displayName = "HoneypotField";
