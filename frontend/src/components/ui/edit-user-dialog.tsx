import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "./button";
import { Input } from "./input";
import { useState, useEffect } from "react";

interface EditUserDialogProps {
  open: boolean;
  user: any;
  onSave: (user: any) => void;
  onCancel: () => void;
}

export function EditUserDialog({ open, user, onSave, onCancel }: EditUserDialogProps) {
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");

  useEffect(() => {
    setFullName(user?.fullName || "");
    setEmail(user?.email || "");
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={v => !v && onCancel()}>
      <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm w-full p-6 bg-white rounded shadow z-50">
        <DialogTitle asChild>
          <h2 className="text-lg font-bold">Kullanıcıyı Düzenle</h2>
        </DialogTitle>
        <form
          className="flex flex-col gap-4 mt-2"
          onSubmit={e => {
            e.preventDefault();
            onSave({
              ...user,
              fullName,
              email,
            });
          }}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="edit-fullname" className="text-sm font-medium">İsim</label>
            <Input
              id="edit-fullname"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="edit-email" className="text-sm font-medium">Email</label>
            <Input
              id="edit-email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              type="email"
            />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" type="button" onClick={onCancel}>
              İptal
            </Button>
            <Button variant="default" type="submit">
              Kaydet
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
