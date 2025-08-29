"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CalendarIcon,
  EllipsisVerticalIcon,
  FunnelIcon,
  PlusCircleIcon,
  RefreshCwIcon,
  Search,
  SearchIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import CommentsDataTable from "./data-table";
import { useEffect, useState } from "react";
import axios from "axios";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditUserDialog } from "@/components/ui/edit-user-dialog";
import { AddUserDialog } from "@/components/ui/add-user-dialog";
export default function UserList() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [search, setSearch] = useState("");

  const fetchUsers = async (opts?: { search?: string }) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:4000/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        params: { page: pagination.page, limit: 10, q: opts?.search || search },
      });
      // API: { data: User[], meta: { page, limit, total, totalPages } }
      const apiUsers = (res.data.data || []).map((u: any) => ({
        id: u.id,
        fullName: u.name,
        email: u.email,
        avatarUrl: `https://i.pravatar.cc/100?u=${u.id}`,
        role: u.role || "user",
        isActive: true,
        createdAt: u.createdAt,
        parentName: u.parentId
          ? (res.data.data.find((p: any) => p.id === u.parentId)?.name || "-")
          : "-",
        children: (u.children || []).map((c: any) => ({
          id: c.id,
          fullName: c.name,
          email: c.email,
          avatarUrl: `https://i.pravatar.cc/100?u=${c.id}`,
          role: c.role || "user",
          isActive: true,
          createdAt: c.createdAt,
          parentName: c.parentId
            ? (res.data.data.find((p: any) => p.id === c.parentId)?.name || "-")
            : "-",
        })),
      }));
      setUsers(apiUsers);
      setPagination({
        page: res.data.meta.page,
        totalPages: res.data.meta.totalPages,
        totalItems: res.data.meta.total,
      });
    } catch (err: any) {
      setError("Kullanıcılar alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, search]);

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await axios.delete(`http://localhost:4000/users/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      alert("Kullanıcı silinemedi.");
    }
  };

  const handleEdit = async (userData: any) => {
    if (!selectedUser) return;
    try {
      await axios.put(`http://localhost:4000/users/${selectedUser.id}`, {
        name: userData.fullName,
        email: userData.email,
        role: userData.role,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setEditModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      alert("Kullanıcı güncellenemedi.");
    }
  };

  return (
    <Card className="gap-10 p-[30px]">
      <div className="flex justify-between items-center gap-2">
        <p className="flex-1 font-bold text-xl">All Users</p>
        <div className="relative hidden md:block">
          <Input
            placeholder="Search here"
            className="pl-10 py-2!"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") fetchUsers({ search: e.currentTarget.value });
            }}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute left-px top-px p-[12px] [&_svg]:size-5!"
            onClick={() => fetchUsers({ search })}
          >
            <Search />
          </Button>
        </div>
        <Button size="icon" variant="ghost" className="border md:hidden" onClick={() => fetchUsers({ search })}>
          <SearchIcon />
        </Button>
        <Button size="icon" variant="ghost" className="border hidden md:flex" onClick={() => { setSearch(""); fetchUsers({ search: "" }); }}>
          <RefreshCwIcon />
        </Button>
        <Button size="icon" variant="ghost" className="border hidden md:flex">
          <CalendarIcon />
        </Button>
        <Button size="icon" variant="ghost" className="border hidden md:flex">
          <FunnelIcon />
        </Button>
        <Button size="icon" variant="ghost" className="border">
          <EllipsisVerticalIcon />
        </Button>
        <Button onClick={() => setAddModalOpen(true)}>
          <PlusCircleIcon /> Add New User
        </Button>
      </div>
      {loading ? (
        <div className="py-10 text-center text-muted-foreground">Yükleniyor...</div>
      ) : error ? (
        <div className="py-10 text-center text-red-500">{error}</div>
      ) : (
        <>
          <CommentsDataTable
            data={users}
            pagination={pagination}
            onPaginationChange={(pageIndex) => {
              setPagination((prev) => ({ ...prev, page: pageIndex + 1 }));
            }}
            onSortingChange={(sorting) => {
              // TODO: API sıralama entegrasyonu
              console.log(sorting);
            }}
            sorting={[]}
            onDelete={(user) => {
              setSelectedUser(user);
              setDeleteModalOpen(true);
            }}
            onEdit={(user) => {
              setSelectedUser(user);
              setEditModalOpen(true);
            }}
          />
          <ConfirmDialog
            open={deleteModalOpen}
            title="Kullanıcıyı Sil"
            description={`Kullanıcıyı silmek istediğinize emin misiniz? (${selectedUser?.fullName})`}
            onConfirm={handleDelete}
            onCancel={() => {
              setDeleteModalOpen(false);
              setSelectedUser(null);
            }}
          />
          <EditUserDialog
            open={editModalOpen}
            user={selectedUser}
            onSave={handleEdit}
            onCancel={() => {
              setEditModalOpen(false);
              setSelectedUser(null);
            }}
          />
          <AddUserDialog
            open={addModalOpen}
            users={users}
            onSave={async (userData) => {
              try {
                await axios.post("http://localhost:4000/users", userData, {
                  headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
                });
                setAddModalOpen(false);
                fetchUsers();
              } catch (err) {
                alert("Kullanıcı eklenemedi.");
              }
            }}
            onCancel={() => setAddModalOpen(false)}
          />
        </>

      )}
    </Card>

  );

}
