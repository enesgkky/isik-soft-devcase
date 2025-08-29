"use client";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, description, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onCancel()}>
  <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm w-full p-6 bg-white rounded shadow z-50">
        <DialogTitle asChild>
          <h2 className="text-lg font-bold">{title || "Onay"}</h2>
        </DialogTitle>
        <div className="mb-4 text-sm text-muted-foreground">{description || "Bu işlemi yapmak istediğinize emin misiniz?"}</div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>İptal</Button>
          <Button variant="destructive" onClick={onConfirm}>Evet, Sil</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
