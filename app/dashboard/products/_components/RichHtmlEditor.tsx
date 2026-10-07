'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import type { Editor as TinyMCEEditor } from 'tinymce';
import { CldUploadWidget } from 'next-cloudinary';

const Editor = dynamic(
  async () => (await import('@tinymce/tinymce-react')).Editor,
  { ssr: false }
);

type Props = {
  value: string;
  onChange: (html: string) => void;
  height?: number;
};

export default function RichHtmlEditor({ value, onChange, height = 480 }: Props) {
  const editorRef = useRef<TinyMCEEditor | null>(null);
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const tinyMceApiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;

  if (!uploadPreset || !cloudName || !tinyMceApiKey) {
    return (
      <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
        Rich-text editor is not configured. Set the public Cloudinary and TinyMCE
        environment variables listed in .env.example.
      </p>
    );
  }

  return (
    <CldUploadWidget
      uploadPreset={uploadPreset}
      onSuccess={(res: any) => {
        const url =
          res?.info?.secure_url ||
          (res?.info?.url || '').replace(/^http:/, 'https:');
        const editor = editorRef.current;
        if (editor && url) {
          // Insert the uploaded image at the current cursor position
          editor.insertContent(`<img src="${url}" alt="" />`);
        }
      }}
    >
      {({ open }) => (
        <Editor
          apiKey={tinyMceApiKey}
          onInit={(_evt, editor) => (editorRef.current = editor)}
          value={value}
          onEditorChange={(content) => onChange(content)}
          init={{
            menubar: 'file edit view insert format tools table help',
            height,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'help', 'wordcount', 'codesample', 'paste'
            ],
            toolbar: [
              'undo redo | blocks fontfamily fontsize | bold italic underline forecolor backcolor |',
              'alignleft aligncenter alignright alignjustify | bullist numlist checklist |',
              'link image media table | insertdatetime charmap codesample | removeformat | preview code fullscreen'
            ].join(' '),
            content_style: `
              body {
                font-family: Inter, system-ui, sans-serif;
                color: #111827; /* black text */
                background: #fff;
              }
              p, span, div { color: #111827; }
              img { max-width: 100%; height: auto; }
              table { width: 100%; border-collapse: collapse; }
              table, th, td { border: 1px solid #e5e7eb; }
              th, td { padding: 8px; }
            `,
            file_picker_types: 'image',
            file_picker_callback: (_callback, _value, meta) => {
              if (meta.filetype === 'image') open(); // open Cloudinary widget
            },
            paste_data_images: true,
            // Drag-and-drop / paste fallback upload handler
            images_upload_handler: (blobInfo) =>
              new Promise((resolve, reject) => {
                const formData = new FormData();
                formData.append('file', blobInfo.blob());
                formData.append('upload_preset', uploadPreset);
                fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
                  method: 'POST',
                  body: formData,
                })
                  .then(async (res) => {
                    const data = await res.json();
                    if (!res.ok || typeof data.secure_url !== 'string') {
                      throw new Error(data?.error?.message || 'Image upload failed');
                    }
                    resolve(data.secure_url);
                  })
                  .catch((err) => reject(err));
              }),
          }}
        />
      )}
    </CldUploadWidget>
  );
}
