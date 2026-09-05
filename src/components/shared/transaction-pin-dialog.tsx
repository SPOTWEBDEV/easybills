"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { OtpInput } from "@/components/ui/otp-input";
import { Button } from "@/components/ui/button";

export function TransactionPinDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (pin: string) => void;
  loading?: boolean;
}) {
  const [pin, setPin] = useState("");

  return (
    <Dialog
  open={open}
  onOpenChange={(next: boolean) => {
    if (!next) setPin("");
    onOpenChange(next);
  }}
>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter your transaction PIN</DialogTitle>
          <DialogDescription>Confirm this purchase with your 4-digit PIN.</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <OtpInput value={pin} onChange={setPin} numInputs={4} />
        </div>
        <Button
          size="lg"
          className="w-full"
          disabled={pin.length !== 4}
          loading={loading}
          onClick={() => onConfirm(pin)}
        >
          Confirm
        </Button>
      </DialogContent>
    </Dialog>
  );
}