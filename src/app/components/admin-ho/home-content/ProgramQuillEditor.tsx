import React, { useRef, useMemo, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { message } from 'antd';
import { homeContentService } from '../../../services/homeContentService';
import { resolveImageUrl } from '../../home-content-shared/imageHelper';
import './ProgramQuillEditor.css';

export interface ProgramQuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const ProgramQuillEditor: React.FC<ProgramQuillEditorProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const quillRef = useRef<ReactQuill>(null);

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/jpeg,image/png,image/webp,image/gif');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        message.error('Ukuran gambar maksimal 10MB.');
        return;
      }

      const hide = message.loading('Mengunggah gambar ke server...', 0);
      try {
        const res = await homeContentService.uploadImage(file);
        hide();
        const rawUrl = res?.image_url || res?.file_url;
        if (rawUrl) {
          const resolvedUrl = resolveImageUrl(rawUrl) || rawUrl;
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection(true) || { index: quill.getLength() };
            quill.insertEmbed(range.index, 'image', resolvedUrl);
            quill.setSelection(range.index + 1, 0);
          }
          message.success('Gambar berhasil disisipkan ke dalam artikel.');
        } else {
          message.error('Gagal mendapatkan URL gambar dari server.');
        }
      } catch (err: any) {
        hide();
        message.error('Gagal mengunggah gambar: ' + (err.message || 'Error server'));
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, 4, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'color',
    'background',
    'align',
    'link',
    'image',
  ];

  return (
    <div className='program-quill-wrapper'>
      <ReactQuill
        ref={quillRef}
        theme='snow'
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={
          placeholder ||
          'Tuliskan konten artikel lengkap di sini. Gunakan tombol gambar di toolbar untuk menyisipkan foto langsung ke dalam artikel...'
        }
      />
    </div>
  );
};

export default ProgramQuillEditor;
