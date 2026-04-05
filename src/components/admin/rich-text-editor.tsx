"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Youtube from "@tiptap/extension-youtube";
import {
  RteGallery,
  RteCarousel,
  RteCallout,
  RteIframe,
  RteVideoFile,
} from "@/lib/tiptap/rte-blocks";
import { RichTextMediaPanels, type MediaPanel } from "@/components/admin/rich-text-media-panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Video,
  LayoutGrid,
  GalleryHorizontal,
  Megaphone,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [mediaPanel, setMediaPanel] = useState<MediaPanel>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      Placeholder.configure({ placeholder: placeholder || "Start writing..." }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TextStyle,
      Color,
      Youtube.configure({
        nocookie: true,
        addPasteHandler: true,
        width: 640,
        height: 360,
      }),
      RteGallery,
      RteCarousel,
      RteCallout,
      RteIframe,
      RteVideoFile,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[300px] bg-background px-4 py-3 text-foreground focus:outline-none " +
          "prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-blockquote:text-foreground " +
          "prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground prose-a:text-primary",
      },
    },
  });

  // Async-loaded content (e.g. edit forms) arrives after mount — Tiptap does not re-read `content` automatically
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const next = content ?? "";
    const cur = editor.getHTML();
    if (next === cur) return;
    // Empty prop + already-empty doc (Tiptap uses <p></p>, etc.) — avoid a setContent loop
    if (!next.trim() && editor.isEmpty) return;
    editor.commands.setContent(next, false);
  }, [editor, content]);

  const addImage = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setShowImageInput(false);
    }
  }, [imageUrl, editor]);

  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkInput(false);
    }
  }, [linkUrl, editor]);

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded hover:bg-muted transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-6 bg-border mx-1" />;

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton
          onClick={() => {
            setMediaPanel(null);
            setShowLinkInput(!showLinkInput);
          }}
          active={editor.isActive("link")}
          title="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        {/* Image */}
        <ToolbarButton
          onClick={() => {
            setMediaPanel(null);
            setShowImageInput(!showImageInput);
          }}
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => {
            setShowImageInput(false);
            setShowLinkInput(false);
            setMediaPanel((p) => (p === "video" ? null : "video"));
          }}
          active={mediaPanel === "video"}
          title="Video (YouTube, Vimeo, file, embed)"
        >
          <Video className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            setShowImageInput(false);
            setShowLinkInput(false);
            setMediaPanel((p) => (p === "gallery" ? null : "gallery"));
          }}
          active={mediaPanel === "gallery"}
          title="Image gallery"
        >
          <LayoutGrid className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            setShowImageInput(false);
            setShowLinkInput(false);
            setMediaPanel((p) => (p === "carousel" ? null : "carousel"));
          }}
          active={mediaPanel === "carousel"}
          title="Image slider with captions"
        >
          <GalleryHorizontal className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            setShowImageInput(false);
            setShowLinkInput(false);
            setMediaPanel((p) => (p === "callout" ? null : "callout"));
          }}
          active={mediaPanel === "callout"}
          title="Callout (info / tip / warning)"
        >
          <Megaphone className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="flex items-center gap-2 p-2 border-b bg-muted/20">
          <Input
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
          />
          <Button type="button" size="sm" onClick={addLink}>Add</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().unsetLink().run()}>
            Remove
          </Button>
        </div>
      )}

      <RichTextMediaPanels editor={editor} panel={mediaPanel} onClose={() => setMediaPanel(null)} />

      {/* Image Input */}
      {showImageInput && (
        <div className="flex items-center gap-2 p-2 border-b bg-muted/20">
          <Input
            placeholder="Image URL or paste from upload"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
          />
          <Button type="button" size="sm" onClick={addImage}>Insert</Button>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Hidden file input for image upload */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="editor-image-upload"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const formData = new FormData();
          formData.append("file", file);
          try {
            const res = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });
            const data = await res.json();
            if (data.url) {
              editor.chain().focus().setImage({ src: data.url }).run();
            }
          } catch (err) {
            console.error("Upload failed:", err);
          }
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="m-2"
        onClick={() => document.getElementById("editor-image-upload")?.click()}
      >
        <ImageIcon className="h-4 w-4 mr-1" /> Upload Image
      </Button>
    </div>
  );
}
