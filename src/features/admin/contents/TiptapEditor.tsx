'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useRef, useCallback } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  onFirstImageChange?: (url: string | null) => void;
  onImageUpload: (file: File) => Promise<string>;
}

export function TiptapEditor({
  content,
  onChange,
  onFirstImageChange,
  onImageUpload,
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractFirstImage = useCallback(
    (html: string) => {
      if (!onFirstImageChange) return;
      const match = html.match(/<img[^>]+src="([^"]+)"/);
      onFirstImageChange(match?.[1] ?? null);
    },
    [onFirstImageChange],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      onChange(html);
      extractFirstImage(html);
    },
    editorProps: {
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        const file = files[0];
        if (!file || !file.type.startsWith('image/')) return false;
        event.preventDefault();
        onImageUpload(file).then((url) => {
          if (!url) return;
          const { schema } = view.state;
          const imageNode = schema.nodes['image'];
          if (!imageNode) return;
          const node = imageNode.create({ src: url });
          const transaction = view.state.tr.replaceSelectionWith(node);
          view.dispatch(transaction);
        });
        return true;
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (!file) continue;
            event.preventDefault();
            onImageUpload(file).then((url) => {
              if (!url || !editor) return;
              editor.chain().focus().setImage({ src: url }).run();
            });
            return true;
          }
        }
        return false;
      },
    },
  });

  const handleImageFile = useCallback(
    async (file: File) => {
      if (!editor) return;
      const url = await onImageUpload(file);
      if (url) editor.chain().focus().setImage({ src: url }).run();
    },
    [editor, onImageUpload],
  );

  if (!editor) return null;

  return (
    <div className="flex h-full flex-col rounded-lg border border-[#E8E8E8]">
      {/* Editor area */}
      <div className="flex-1 overflow-y-auto p-4">
        <EditorContent
          editor={editor}
          className={[
            'min-h-[300px] max-w-none',
            '[&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:text-[#1A1A1A] [&_.ProseMirror]:outline-none',
            // Headings
            '[&_.ProseMirror_h1]:mb-2 [&_.ProseMirror_h1]:mt-4 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:text-[#1A1A1A]',
            '[&_.ProseMirror_h2]:mb-1.5 [&_.ProseMirror_h2]:mt-3 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:text-[#1A1A1A]',
            '[&_.ProseMirror_h3]:mb-1 [&_.ProseMirror_h3]:mt-3 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:text-[#1A1A1A]',
            '[&_.ProseMirror_h4]:mb-1 [&_.ProseMirror_h4]:mt-2 [&_.ProseMirror_h4]:text-base [&_.ProseMirror_h4]:font-semibold [&_.ProseMirror_h4]:text-[#1A1A1A]',
            // Lists
            '[&_.ProseMirror_ul]:my-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6',
            '[&_.ProseMirror_ol]:my-2 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6',
            '[&_.ProseMirror_li]:my-0.5',
            // Blockquote
            '[&_.ProseMirror_blockquote]:my-2 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-gray-300 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-gray-600',
            // Code
            '[&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:bg-gray-100 [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:text-sm',
            '[&_.ProseMirror_pre]:my-2 [&_.ProseMirror_pre]:rounded [&_.ProseMirror_pre]:bg-gray-100 [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:text-sm',
            // Paragraph
            '[&_.ProseMirror_p]:my-1',
          ].join(' ')}
        />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImageFile(file);
            e.target.value = '';
          }
        }}
      />
    </div>
  );
}
