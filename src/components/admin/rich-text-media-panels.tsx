"use client";

import type { Editor } from "@tiptap/react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { vimeoPlayerUrl, type RteGalleryItem } from "@/lib/tiptap/rte-blocks";
import { Image as ImageIcon, Plus, Trash2 } from "lucide-react";

export type MediaPanel = "video" | "gallery" | "carousel" | "callout" | null;

type Props = {
  editor: Editor;
  panel: MediaPanel;
  onClose: () => void;
};

export function RichTextMediaPanels({ editor, panel, onClose }: Props) {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTab, setVideoTab] = useState<"youtube" | "vimeo" | "file" | "iframe">("youtube");
  const [iframeTitle, setIframeTitle] = useState("Embedded content");
  const [rows, setRows] = useState<RteGalleryItem[]>([{ src: "", caption: "" }]);
  const [calloutVariant, setCalloutVariant] = useState<"info" | "tip" | "warning">("info");

  const insertYoutube = useCallback(() => {
    const src = videoUrl.trim();
    if (!src) return;
    const done = editor.chain().focus().setYoutubeVideo({ src }).run();
    if (!done) {
      alert("Paste a valid YouTube URL (watch, youtu.be, or embed link).");
      return;
    }
    setVideoUrl("");
    onClose();
  }, [editor, videoUrl, onClose]);

  const insertVimeo = useCallback(() => {
    const embed = vimeoPlayerUrl(videoUrl.trim());
    if (!embed) {
      alert("Paste a Vimeo page URL (e.g. https://vimeo.com/123456789).");
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: "rteIframe",
        attrs: { src: embed, title: "Vimeo" },
      })
      .run();
    setVideoUrl("");
    onClose();
  }, [editor, videoUrl, onClose]);

  const insertVideoFile = useCallback(() => {
    const src = videoUrl.trim();
    if (!src) return;
    editor.chain().focus().insertContent({ type: "rteVideoFile", attrs: { src, poster: null } }).run();
    setVideoUrl("");
    onClose();
  }, [editor, videoUrl, onClose]);

  const insertGenericIframe = useCallback(() => {
    const src = videoUrl.trim();
    if (!src || !/^https:\/\//i.test(src)) {
      alert("Use an HTTPS embed URL (e.g. Google Maps embed link).");
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: "rteIframe",
        attrs: { src, title: iframeTitle.trim() || "Embedded content" },
      })
      .run();
    setVideoUrl("");
    onClose();
  }, [editor, videoUrl, iframeTitle, onClose]);

  const insertGalleryOrCarousel = useCallback(
    (kind: "rteGallery" | "rteCarousel") => {
      const items = rows
        .map((r) => ({ src: r.src.trim(), caption: (r.caption ?? "").trim() }))
        .filter((r) => r.src);
      if (items.length === 0) {
        alert("Add at least one image URL.");
        return;
      }
      editor.chain().focus().insertContent({ type: kind, attrs: { items } }).run();
      setRows([{ src: "", caption: "" }]);
      onClose();
    },
    [editor, rows, onClose]
  );

  const insertCallout = useCallback(() => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "rteCallout",
        attrs: { variant: calloutVariant },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Add your note for readers here…" }],
          },
        ],
      })
      .run();
    onClose();
  }, [editor, calloutVariant, onClose]);

  const uploadForRow = useCallback(
    async (index: number, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          setRows((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], src: data.url };
            return next;
          });
        }
      } catch {
        console.error("Upload failed");
      }
    },
    []
  );

  if (!panel) return null;

  return (
    <div className="border-b bg-muted/20 p-3 space-y-3 text-sm">
      {panel === "video" && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {(
              [
                ["youtube", "YouTube"],
                ["vimeo", "Vimeo"],
                ["file", "Video file"],
                ["iframe", "Embed URL"],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={videoTab === key ? "default" : "outline"}
                className="h-7 text-xs"
                onClick={() => setVideoTab(key)}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
            <div className="flex-1 space-y-1 w-full">
              <Label className="text-xs">
                {videoTab === "file"
                  ? "Direct video URL (.mp4, etc.)"
                  : videoTab === "iframe"
                    ? "HTTPS iframe src"
                    : "Page or watch URL"}
              </Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder={
                  videoTab === "youtube"
                    ? "https://www.youtube.com/watch?v=…"
                    : videoTab === "vimeo"
                      ? "https://vimeo.com/…"
                      : videoTab === "file"
                        ? "https://example.com/video.mp4"
                        : "https://…"
                }
                className="h-8"
              />
            </div>
            {videoTab === "iframe" && (
              <div className="w-full sm:w-48 space-y-1">
                <Label className="text-xs">Title (a11y)</Label>
                <Input
                  value={iframeTitle}
                  onChange={(e) => setIframeTitle(e.target.value)}
                  className="h-8"
                />
              </div>
            )}
            <Button
              type="button"
              size="sm"
              className="h-8"
              onClick={() => {
                if (videoTab === "youtube") insertYoutube();
                else if (videoTab === "vimeo") insertVimeo();
                else if (videoTab === "file") insertVideoFile();
                else insertGenericIframe();
              }}
            >
              Insert
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-8" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {(panel === "gallery" || panel === "carousel") && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {panel === "gallery"
              ? "Grid of images with optional captions — great for case studies."
              : "Full-width slides readers swipe horizontally — image + caption each."}
          </p>
          {rows.map((row, i) => (
            <div key={i} className="flex flex-wrap gap-2 items-end border rounded-md p-2 bg-background">
              <div className="flex-1 min-w-[140px] space-y-1">
                <Label className="text-xs">Image URL</Label>
                <Input
                  value={row.src}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRows((prev) => {
                      const n = [...prev];
                      n[i] = { ...n[i], src: v };
                      return n;
                    });
                  }}
                  className="h-8"
                  placeholder="/uploads/… or https://…"
                />
              </div>
              <div className="flex-1 min-w-[120px] space-y-1">
                <Label className="text-xs">Caption</Label>
                <Input
                  value={row.caption}
                  onChange={(e) => {
                    const v = e.target.value;
                    setRows((prev) => {
                      const n = [...prev];
                      n[i] = { ...n[i], caption: v };
                      return n;
                    });
                  }}
                  className="h-8"
                  placeholder="Optional"
                />
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id={`gallery-upload-${i}`}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadForRow(i, f);
                  e.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => document.getElementById(`gallery-upload-${i}`)?.click()}
              >
                <ImageIcon className="h-3.5 w-3.5" />
              </Button>
              {rows.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-destructive"
                  onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              onClick={() => setRows((prev) => [...prev, { src: "", caption: "" }])}
            >
              <Plus className="h-3.5 w-3.5" /> Row
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8"
              onClick={() => insertGalleryOrCarousel(panel === "gallery" ? "rteGallery" : "rteCarousel")}
            >
              Insert {panel === "gallery" ? "gallery" : "slider"}
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {panel === "callout" && (
        <div className="flex flex-wrap gap-2 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Callout style</Label>
            <select
              value={calloutVariant}
              onChange={(e) => setCalloutVariant(e.target.value as "info" | "tip" | "warning")}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="info">Info</option>
              <option value="tip">Tip</option>
              <option value="warning">Warning</option>
            </select>
          </div>
          <Button type="button" size="sm" className="h-8" onClick={insertCallout}>
            Insert callout
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8" onClick={onClose}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
