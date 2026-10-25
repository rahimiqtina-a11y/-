import React from 'react';
import { X, ZoomIn, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  const { language } = useLanguage();

  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative max-w-5xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 bg-slate-950 border-b border-slate-800 text-white">
          <span className="text-xs text-slate-400 font-medium">
            {language === 'ar' ? 'عرض الإعلان بالحجم الكامل' : 'Full Advertisement Image'}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={language === 'ar' ? 'فتح الصورة في نافذة جديدة' : 'Open in new tab'}
            >
              <ZoomIn className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-rose-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-2 overflow-auto flex items-center justify-center bg-black/60">
          <img 
            src={imageUrl} 
            alt="Advertisement" 
            className="max-h-[80vh] w-auto max-w-full object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};
