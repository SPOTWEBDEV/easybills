"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { PreviewDataBanner } from "@/components/admin/preview-data-banner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Copy, ImageIcon } from "lucide-react";

interface MediaItem {
  id: string;
  name: string;
  size: string;
  color: string;
}

const initialMedia: MediaItem[] = [
  { id: "m1", name: "hero-banner.jpg", size: "482 KB", color: "#0EA894" },
  { id: "m2", name: "promo-cashback.png", size: "128 KB", color: "#3BC7B0" },
  { id: "m3", name: "app-store-badge.svg", size: "12 KB", color: "#22A559" },
  { id: "m4", name: "agent-cta-bg.jpg", size: "356 KB", color: "#086D60" },
  { id: "m5", name: "blog-cover-1.jpg", size: "290 KB", color: "#91E6D6" },
  { id: "m6", name: "notification-icon.png", size: "8 KB", color: "#0B8A79" },
];

export default function AdminMediaLibraryPage() {
  const [media, setMedia] = useState(initialMedia);

  const handleUpload = () => {
    toast.success("File picker would open here");
  };

  const handleDelete = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
    toast.success("File deleted");
  };

  const handleCopyUrl = (name: string) => {
    navigator.clipboard.writeText(`https://cdn.easybills.example/media/${name}`);
    toast.success("URL copied");
  };

  return (
    <AdminShell>
      <AdminPageHeading
        title="Media Library"
        subtitle="Images and files used across the site and app"
        action={
          <Button onClick={handleUpload}>
            <Upload className="h-4 w-4" /> Upload file
          </Button>
        }
      />
      <PreviewDataBanner feature="Media Library" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {media.map((item) => (
          <Card key={item.id} className="overflow-hidden p-0">
            <div
              className="flex h-28 items-center justify-center"
              style={{ backgroundColor: item.color }}
            >
              <ImageIcon className="h-8 w-8 text-white/70" />
            </div>
            <div className="p-3">
              <p className="truncate text-xs font-semibold">{item.name}</p>
              <p className="text-[10px] text-ink-500 dark:text-paper-200/40">{item.size}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <button
                  onClick={() => handleCopyUrl(item.name)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-100 dark:bg-ink-800"
                  aria-label="Copy URL"
                >
                  <Copy className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-coral-50 dark:bg-coral-500/10 text-coral-600 dark:text-coral-500"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
