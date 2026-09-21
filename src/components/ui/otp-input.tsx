"use client";

import * as React from "react";
import { OTPInput, SlotProps } from "input-otp";
import { cn } from "@/lib/utils";

function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        "relative flex h-14 w-12 items-center justify-center rounded-2xl border-2 bg-white dark:bg-ink-900 text-lg font-display font-semibold transition-all",
        props.isActive
          ? "border-brand-500 ring-2 ring-brand-500/30"
          : "border-ink-200 dark:border-ink-700"
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
      {props.hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-px animate-pulse bg-brand-500" />
        </div>
      )}
    </div>
  );
}

export function OtpInput({
  value,
  onChange,
  numInputs = 6,
}: {
  value: string;
  onChange: (value: string) => void;
  numInputs?: number;
}) {
  return (
    <OTPInput
      value={value}
      onChange={onChange}
      maxLength={numInputs}
      containerClassName="flex items-center gap-2 justify-between"
      render={({ slots }) => (
        <>
          {slots.map((slot, idx) => (
            <Slot key={idx} {...slot} />
          ))}
        </>
      )}
    />
  );
}
