"use client";

import { useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { Upload } from "lucide-react";

const inputClasses =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

type Props = {
  label: string;
  value: string;
  folder: "trips" | "team" | "testimonials" | "misc";
  onChange: (url: string) => void;
};

export function ImageUploadField({ label, value, folder, onChange }: Props) {
  const t = useTranslations("admin");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const body = new FormData();
      body.set("file", file);
      body.set("folder", folder);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      const result = (await response.json()) as
        | { ok: true; url: string }
        | { ok: false; code?: string };

      if (!result.ok) {
        setError(t("uploadFailed"));
        return;
      }

      onChange(result.url);
    } catch {
      setError(t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        className={inputClasses}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://… or /api/uploads/…"
      />
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        <Upload className="h-4 w-4" />
        {uploading ? t("uploading") : t("uploadImage")}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFile}
          disabled={uploading}
        />
      </label>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="mt-2 h-28 w-44 rounded-xl object-cover"
        />
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
