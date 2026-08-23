"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/shared/pagination";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { adminBlogApi, AdminBlogPostRow } from "@/lib/api/admin/blog";
import { formatDate } from "@/lib/utils";
import { Plus, Eye, EyeOff, Trash2, Pencil } from "lucide-react";

const emptyForm = { title: "", author: "EasyBills Team", content: "" };

export default function AdminBlogPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-blog", page],
    queryFn: () => adminBlogApi.list(page, 20),
  });
  const list = data?.data ?? [];

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-blog"] });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (post: AdminBlogPostRow) => {
    setEditingId(post.id);
    setForm({ title: post.title, author: post.author, content: post.content });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Enter a title.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await adminBlogApi.update(editingId, form);
        toast.success("Post updated");
      } else {
        await adminBlogApi.create({ ...form, status: "draft" });
        toast.success("Post created as draft");
      }
      invalidate();
      setOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save post.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await adminBlogApi.toggleStatus(id);
      invalidate();
      toast.success("Post status updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update post.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminBlogApi.remove(id);
      invalidate();
      toast.success("Post deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete post.");
    }
  };

  const columns: Column<AdminBlogPostRow>[] = [
    { key: "title", header: "Title", render: (b) => <span className="font-semibold">{b.title}</span> },
    { key: "author", header: "Author", render: (b) => b.author },
    { key: "views", header: "Views", render: (b) => b.views.toLocaleString() },
    { key: "status", header: "Status", render: (b) => <StatusPill status={b.status} /> },
    { key: "publishedAt", header: "Published", render: (b) => (b.publishedAt ? formatDate(b.publishedAt) : "—") },
    {
      key: "actions",
      header: "",
      render: (b) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(b)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 dark:bg-ink-800"
            aria-label="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleToggle(b.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 dark:bg-ink-800"
            aria-label={b.status === "published" ? "Unpublish" : "Publish"}
          >
            {b.status === "published" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => handleDelete(b.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-500"
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeading
        title="Blog"
        subtitle="Manage articles published on the EasyBills blog"
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> New post</Button>}
      />
      {isLoading ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading posts...</p>
      ) : list.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">
          No posts yet — click &quot;New post&quot; to write your first one.
        </p>
      ) : (
        <>
          <AdminDataTable columns={columns} data={list} searchKeys={["title", "author"]} searchPlaceholder="Search posts..." />
          {data && (
            <div className="mt-4">
              <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit post" : "New blog post"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Changes save directly to the live post." : "Creates a draft — publish it from the table once ready."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Author</Label>
              <Input value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Content</Label>
              <textarea
                className="min-h-32 w-full rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Separate paragraphs with a blank line."
              />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>
              {editingId ? "Save changes" : "Create draft"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}