import React from 'react';
import { CompressionStatus, ImageItem } from '../types';
import { formatBytes } from '../utils/compressor';
import { CheckIcon, DownloadIcon, TrashIcon, XIcon } from './Icon';

interface ImageCardProps {
  item: ImageItem;
  onRemove: (id: string) => void;
  onSave: (item: ImageItem) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ item, onRemove, onSave }) => {
  const isDone = item.status === CompressionStatus.COMPLETED;
  const isProcessing = item.status === CompressionStatus.PROCESSING;
  
  const savings = isDone 
    ? Math.round(((item.originalSize - item.compressedSize) / item.originalSize) * 100) 
    : 0;

  return (
    <div className="bg-slate-800 rounded-xl p-4 shadow-md border border-slate-700 flex items-center gap-4 animate-fadeIn">
      {/* Thumbnail */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-900 border border-slate-600">
        <img src={item.previewUrl} alt="preview" className="w-full h-full object-cover" />
        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-white text-sm font-medium truncate" title={item.file.name}>
          {item.file.name}
        </h4>
        <div className="mt-1 flex items-center text-xs text-slate-400 gap-2">
          <span className="bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">
            {formatBytes(item.originalSize)}
          </span>
          
          {isDone && (
             <>
               <span>→</span>
               <span className="bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                 {formatBytes(item.compressedSize)}
               </span>
             </>
          )}
        </div>
      </div>

      {/* Status & Actions */}
      <div className="flex items-center gap-3">
        {isDone && (
          <div className="flex flex-col items-end mr-2">
             <span className="text-green-400 font-bold text-sm">-{savings}%</span>
          </div>
        )}

        {isDone ? (
           <button 
             onClick={() => onSave(item)}
             className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors shadow-lg shadow-indigo-900/20"
             title="Save Image"
           >
             <DownloadIcon className="w-4 h-4" />
           </button>
        ) : null}

        <button 
          onClick={() => onRemove(item.id)}
          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
          title="Remove"
        >
          {item.status === CompressionStatus.ERROR ? <XIcon className="w-4 h-4"/> : <TrashIcon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};