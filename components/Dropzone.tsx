import React, { useCallback, useState } from 'react';
import { UploadIcon, ImageIcon } from './Icon';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((file: File) => file.type.startsWith('image/'));
    if (files.length > 0) {
      onFilesAdded(files);
    }
  }, [onFilesAdded]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((file: File) => file.type.startsWith('image/'));
      if (files.length > 0) {
        onFilesAdded(files);
      }
    }
  }, [onFilesAdded]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 ease-out
        flex flex-col items-center justify-center py-16 px-6
        ${isDragging 
          ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02]' 
          : 'border-slate-600 bg-slate-800/50 hover:border-indigo-500/50 hover:bg-slate-800'
        }
      `}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className={`
        w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center mb-6 shadow-xl
        transition-transform duration-300 group-hover:scale-110
        ${isDragging ? 'bg-indigo-500 text-white' : 'text-indigo-400'}
      `}>
        {isDragging ? <ImageIcon className="w-10 h-10" /> : <UploadIcon className="w-10 h-10" />}
      </div>

      <h3 className="text-xl font-bold text-white mb-2 text-center">
        {isDragging ? '释放以添加图片' : '点击或拖拽上传图片'}
      </h3>
      
      <p className="text-slate-400 text-center max-w-md text-sm">
        支持 JPG, PNG, WEBP 等常见格式。<br/>
        支持批量选择，直接在浏览器本地压缩，保护隐私。
      </p>
    </div>
  );
};