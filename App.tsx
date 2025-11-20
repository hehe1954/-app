import React, { useState, useEffect, useCallback } from 'react';
import { AppSettings, CompressionStatus, ImageItem, OutputFormat } from './types';
import { compressImage } from './utils/compressor';
import { Dropzone } from './components/Dropzone';
import { SettingsPanel } from './components/SettingsPanel';
import { ImageCard } from './components/ImageCard';
import { SettingsIcon, DownloadIcon, ArrowRightIcon, TrashIcon, CheckIcon } from './components/Icon';

// Utility for generating IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

function App() {
  const [files, setFiles] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    quality: 0.8,
    outputFormat: OutputFormat.ORIGINAL,
    keepOriginalName: false,
  });

  // Add files to state
  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const newItems: ImageItem[] = newFiles.map(file => ({
      id: generateId(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: CompressionStatus.IDLE,
      compressedBlob: null,
      compressedUrl: null,
      originalSize: file.size,
      compressedSize: 0,
    }));
    setFiles(prev => [...prev, ...newItems]);
  }, []);

  // Remove file
  const handleRemove = useCallback((id: string) => {
    setFiles(prev => {
      const target = prev.find(f => f.id === id);
      if (target && target.previewUrl) URL.revokeObjectURL(target.previewUrl);
      if (target && target.compressedUrl) URL.revokeObjectURL(target.compressedUrl);
      return prev.filter(f => f.id !== id);
    });
  }, []);

  // Batch clear
  const handleClearAll = useCallback(() => {
    files.forEach(f => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      if (f.compressedUrl) URL.revokeObjectURL(f.compressedUrl);
    });
    setFiles([]);
  }, [files]);

  // Processing Logic
  const processFiles = async () => {
    setIsProcessing(true);

    // Process one by one to allow UI updates, or Promise.all for speed. 
    // Promise.all is better for UX here unless list is huge.
    // We will map over current state to find IDLE files.
    
    // Create a copy to work with async updates
    const filesToProcess = files.filter(f => f.status === CompressionStatus.IDLE || f.status === CompressionStatus.ERROR);
    
    if (filesToProcess.length === 0) {
        setIsProcessing(false);
        return;
    }

    // Update status to processing
    setFiles(prev => prev.map(f => 
      filesToProcess.find(ftp => ftp.id === f.id) 
        ? { ...f, status: CompressionStatus.PROCESSING } 
        : f
    ));

    // Execute compression
    const results = await Promise.all(filesToProcess.map(async (item) => {
      try {
        const blob = await compressImage(item.file, settings.quality, settings.outputFormat);
        return {
          id: item.id,
          status: CompressionStatus.COMPLETED,
          blob: blob,
          size: blob.size
        };
      } catch (e) {
        return {
          id: item.id,
          status: CompressionStatus.ERROR,
          error: 'Compression failed'
        };
      }
    }));

    // Update state with results
    setFiles(prev => prev.map(f => {
      const res = results.find(r => r.id === f.id);
      if (res) {
        if (res.status === CompressionStatus.COMPLETED && res.blob) {
          return {
            ...f,
            status: CompressionStatus.COMPLETED,
            compressedBlob: res.blob,
            compressedSize: res.size,
            compressedUrl: URL.createObjectURL(res.blob)
          };
        } else {
          return { ...f, status: CompressionStatus.ERROR, error: 'Failed' };
        }
      }
      return f;
    }));

    setIsProcessing(false);
  };

  // Trigger compression when files added? 
  // Requirement says "Select images -> hand over to app". 
  // It's better to have a "Start" button for batch, or auto-start. 
  // Let's make it explicit via a button for better control over settings before starting.
  // However, for UX, if status is IDLE, we show the button.

  const downloadItem = (item: ImageItem) => {
    if (!item.compressedUrl) return;
    
    const a = document.createElement('a');
    a.href = item.compressedUrl;
    
    let fileName = item.file.name;
    const nameParts = fileName.split('.');
    const ext = nameParts.pop();
    const baseName = nameParts.join('.');
    
    let newExt = ext;
    if (settings.outputFormat === OutputFormat.JPEG) newExt = 'jpg';
    if (settings.outputFormat === OutputFormat.PNG) newExt = 'png';
    if (settings.outputFormat === OutputFormat.WEBP) newExt = 'webp';

    if (settings.keepOriginalName) {
      a.download = `${baseName}.${newExt}`;
    } else {
      a.download = `${baseName}-min.${newExt}`;
    }
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAll = () => {
    files.forEach(f => {
      if (f.status === CompressionStatus.COMPLETED) {
        downloadItem(f);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">PixelPress</h1>
          </div>
          <a href="#" className="text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors">
            Help
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inputs & List */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Dropzone Area */}
          {files.length === 0 && (
             <div className="animate-fadeIn">
               <Dropzone onFilesAdded={handleFilesAdded} />
             </div>
          )}

          {/* Action Bar for List View */}
          {files.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 border border-slate-700/50 backdrop-blur-sm sticky top-20 z-40">
              <div className="flex items-center gap-2">
                 <span className="font-bold text-white">{files.length}</span>
                 <span className="text-slate-400 text-sm">Images Selected</span>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                   onClick={() => document.getElementById('hidden-add-input')?.click()}
                   className="text-sm text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  添加更多
                  <input 
                    id="hidden-add-input" 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => e.target.files && handleFilesAdded(Array.from(e.target.files))}
                  />
                </button>
                <button 
                  onClick={handleClearAll}
                  className="text-sm text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-red-400/10 transition-colors flex items-center gap-1"
                >
                  <TrashIcon className="w-4 h-4"/> 清空
                </button>
              </div>
            </div>
          )}

          {/* File List */}
          <div className="space-y-3 min-h-[200px]">
            {files.map(item => (
              <ImageCard 
                key={item.id} 
                item={item} 
                onRemove={handleRemove} 
                onSave={downloadItem}
              />
            ))}
            {files.length > 0 && files.length < 3 && (
               <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center text-slate-500 hover:border-slate-600 hover:text-slate-400 transition-colors cursor-pointer" onClick={() => document.getElementById('hidden-add-input')?.click()}>
                  <p className="text-sm font-medium">+ 点击添加更多图片</p>
               </div>
            )}
          </div>

        </div>

        {/* Right Column: Settings & Global Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          <SettingsPanel settings={settings} setSettings={setSettings} />

          {/* Main Actions */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700/50 space-y-4">
             <div className="flex justify-between text-sm text-slate-400 mb-2">
               <span>状态</span>
               <span className={isProcessing ? "text-indigo-400 animate-pulse" : "text-slate-200"}>
                  {isProcessing ? "正在处理..." : "就绪"}
               </span>
             </div>

             {/* Compress Button */}
             <button
               onClick={processFiles}
               disabled={isProcessing || files.every(f => f.status === CompressionStatus.COMPLETED) || files.length === 0}
               className={`
                 w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg
                 ${isProcessing || files.length === 0
                   ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                   : files.every(f => f.status === CompressionStatus.COMPLETED)
                     ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20'
                     : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30 hover:scale-[1.02]'
                 }
               `}
             >
               {files.every(f => f.status === CompressionStatus.COMPLETED) ? (
                 <> <CheckIcon className="w-5 h-5" /> 已完成 </>
               ) : (
                 <> <SettingsIcon className="w-5 h-5" /> 开始压缩全部 </>
               )}
             </button>

             {/* Download All Button */}
             {files.some(f => f.status === CompressionStatus.COMPLETED) && (
               <button
                 onClick={downloadAll}
                 className="w-full py-3.5 rounded-xl font-bold text-slate-900 bg-white hover:bg-slate-100 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg"
               >
                 <DownloadIcon className="w-5 h-5" />
                 批量下载
               </button>
             )}
          </div>

          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">App Info</h5>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                本地离线处理 (Privacy First)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                React 18 + TypeScript
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                无损 & 有损压缩算法
              </li>
            </ul>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;