
import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from './LanguageToggle';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white px-8 py-8">
      <div className="max-w-[1600px] mx-auto flex flex-col space-y-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          {/* Left Section: Brand & Identity */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-3">
              <span className={`text-lg font-black text-slate-800 tracking-tight ${language === 'KN' ? 'font-kannada' : ''}`}>
                Jeeva Raksha | Unified Digital Shield for Smart Healthcare
              </span>
            </div>
            <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest ${language === 'KN' ? 'font-kannada' : ''}`}>
              Team SUPRA
            </p>
          </div>

          {/* Center Section: System Trust Indicators */}
          <div className="flex flex-wrap gap-8 lg:gap-12 items-center">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              <span className={`text-[10px] font-black text-slate-500 uppercase tracking-widest ${language === 'KN' ? 'font-kannada' : ''}`}>
                {t('allSystemsOperational')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('dataSecurity')}</span>
              <span className="text-[10px] font-bold text-slate-700">{t('encrypted')}</span>
            </div>
            <div className="flex flex-col border-l border-slate-100 pl-8">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('lastSync')}</span>
              <span className="text-[10px] font-bold text-primary">{t('realTimePulse')}</span>
            </div>
          </div>

          {/* Right Section: Compliance & Toggle */}
          <div className="flex flex-col items-end space-y-4">
            <LanguageToggle />
            <div className="flex gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <span>HIPAA READY</span>
              <span>ISO 27001</span>
              <span>AUDIT LOGS ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Bottom Legal Section */}
        <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6 text-[10px] font-bold text-slate-400">
            <a href="#" className="hover:text-primary transition-colors underline decoration-slate-200 underline-offset-4">{t('privacy')}</a>
            <a href="#" className="hover:text-primary transition-colors underline decoration-slate-200 underline-offset-4">{t('terms')}</a>
            <a href="#" className="hover:text-primary transition-colors underline decoration-slate-200 underline-offset-4">{t('support')}</a>
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
            © 2026 Jeeva Raksha. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
