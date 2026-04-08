"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ImageIcon, Plus } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        uploadFile(file);
      }
    },
    [uploadFile]
  );

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group rounded-lg overflow-hidden border bg-muted/20">
          <Image
            src={value}
            alt="Preview"
            width={400}
            height={200}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onChange("")}
            >
              <X className="h-4 w-4 mr-1" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById("single-image-upload")?.click()}
        >
          <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {uploading ? "Uploading..." : "Click or drag & drop to upload"}
          </p>
          <input
            id="single-image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {!value && (
        <div>
          {showUrlInput ? (
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="h-8 text-sm"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (urlInput) {
                    onChange(urlInput);
                    setUrlInput("");
                    setShowUrlInput(false);
                  }
                }}
              >
                Set
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowUrlInput(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setShowUrlInput(true)}
            >
              Or enter URL manually
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface GalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export function GalleryUpload({ value, onChange }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const uploadOne = useCallback(async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    return data.url ?? null;
  }, []);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const images = files.filter((f) => f.type.startsWith("image/"));
      if (images.length === 0) return;
      setUploading(true);
      try {
        let next = [...valueRef.current];
        for (const file of images) {
          const url = await uploadOne(file);
          if (url) {
            next = [...next, url];
            valueRef.current = next;
            onChange(next);
          }
        }
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploading(false);
      }
    },
    [onChange, uploadOne]
  );

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div
        className="grid grid-cols-3 sm:grid-cols-4 gap-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.length) {
            uploadFiles(Array.from(e.dataTransfer.files));
          }
        }}
      >
        {value.map((url, i) => (
          <div key={`${url}-${i}`} className="relative group rounded-lg overflow-hidden border bg-muted/20 aspect-square">
            <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => removeImage(i)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}

        <div
          className="border-2 border-dashed rounded-lg aspect-square flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 transition-colors px-1 text-center"
          onClick={() => document.getElementById("gallery-image-upload")?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              document.getElementById("gallery-image-upload")?.click();
            }
          }}
        >
          {uploading ? (
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full shrink-0" />
          ) : (
            <Plus className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
          <span className="text-[10px] leading-tight text-muted-foreground sm:text-xs">หลายรูป</span>
        </div>
      </div>

      <input
        id="gallery-image-upload"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const list = e.target.files;
          if (list?.length) uploadFiles(Array.from(list));
          e.target.value = "";
        }}
      />

      <p className="text-xs text-muted-foreground">
        {value.length > 0 ? `${value.length} รูปในแกลเลอรี — ` : null}
        เลือกหลายไฟล์พร้อมกันได้ (Ctrl/Cmd+คลิก) หรือลากวางหลายรูปลงกริด
      </p>
    </div>
  );
}
