import React from 'react';
import { AppSettings, OutputFormat } from '../types';

interface SettingsPanelProps {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings }) => {
  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, quality: parseFloat(e.target.value) });
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({ ...settings, outputFormat: e.target.value as OutputFormat });
  };

  const handleNamingChange = (val: boolean) => {
    setSettings({ ...settings, keepOriginalName: val });
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700/50 space-y-6">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        设置中心
      </h2>

      {/* Quality Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-slate-300 text-sm font-medium">压缩质量</label>
          <span className="text-indigo-400 font-bold">{Math.round(settings.quality * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={settings.quality}
          onChange={handleQualityChange}
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-colors"
        />
        <p className="text-xs text-slate-500">值越低文件越小，但画质可能受损</p>
      </div>

      {/* Output Format */}
      <div className="space-y-2">
        <label className="text-slate-300 text-sm font-medium block">输出格式</label>
        <div className="relative">
          <select
            value={settings.outputFormat}
            onChange={handleFormatChange}
            className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none"
          >
            <option value={OutputFormat.ORIGINAL}>保持原格式 (Original)</option>
            <option value={OutputFormat.JPEG}>JPEG (Best Compression)</option>
            <option value={OutputFormat.PNG}>PNG (Lossless)</option>
            <option value={OutputFormat.WEBP}>WebP (Modern Web)</option>
          </select>
          <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      {/* File Naming */}
      <div className="space-y-3">
        <label className="text-slate-300 text-sm font-medium block">文件名设置</label>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => handleNamingChange(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-left transition-all border ${
              settings.keepOriginalName
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-700/30 border-transparent text-slate-400 hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>覆盖/保留原名</span>
              {settings.keepOriginalName && <span className="w-2 h-2 bg-indigo-400 rounded-full" />}
            </div>
            <div className="text-xs opacity-60 mt-1">例如: image.jpg</div>
          </button>

          <button
            onClick={() => handleNamingChange(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-left transition-all border ${
              !settings.keepOriginalName
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-700/30 border-transparent text-slate-400 hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>保存新名称 (自动后缀)</span>
              {!settings.keepOriginalName && <span className="w-2 h-2 bg-indigo-400 rounded-full" />}
            </div>
            <div className="text-xs opacity-60 mt-1">例如: image-min.jpg</div>
          </button>
        </div>
      </div>
    </div>
  );
};