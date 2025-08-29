
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "./button";
import { Input } from "./input";
import { useState, useEffect } from "react";


interface AddUserDialogProps {
  open: boolean;
  users: any[];
  onSave: (user: any) => void;
  onCancel: () => void;
}


export function AddUserDialog({ open, users, onSave, onCancel }: AddUserDialogProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [parentId, setParentId] = useState("");

  useEffect(() => {
    if (!open) {
      setFullName("");
      setEmail("");
      setPassword("");
      setParentId("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={v => !v && onCancel()}>
      <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm w-full p-6 bg-white rounded shadow z-50">
        <DialogTitle asChild>
          <h2 className="text-lg font-bold">Yeni Kullanıcı Ekle</h2>
        </DialogTitle>
        <form
          className="flex flex-col gap-4 mt-2"
          onSubmit={e => {
            e.preventDefault();
            onSave({
              name: fullName,
              email,
              password,
              parentId,
            });
          }}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="add-fullname" className="text-sm font-medium">İsim</label>
            <Input
              id="add-fullname"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="add-email" className="text-sm font-medium">Email</label>
            <Input
              id="add-email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              type="email"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="add-password" className="text-sm font-medium">Password</label>
            <Input
              id="add-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              type="password"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Parent (Email ile seç)</label>
            <select
              className="border rounded px-2 py-1"
              value={parentId}
              onChange={e => setParentId(e.target.value)}
            >
              <option value="">Seçili değil</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.email}</option>
              ))}
            </select>
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
