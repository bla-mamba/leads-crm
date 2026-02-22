import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, X } from 'lucide-react';
import { Lead } from '../lib/supabase';
import { exportToCSV, exportToExcel } from '../utils/export';

interface ExportMenuProps {
  leadsToExport: Lead[];
}

const ExportMenu: React.FC<ExportMenuProps> = ({ leadsToExport }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (type: 'csv' | 'excel') => {
    if (type === 'csv') {
      exportToCSV(leadsToExport);
    } else {
      exportToExcel(leadsToExport);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-futuristic px-3 py-2 md:px-4 md:py-2 bg-[#111827] neon-border rounded-lg flex items-center gap-2 hover:border-[#00f0ff]/40 text-[#7b8ba3] hover:text-[#e8edf5] text-sm transition-all duration-300"
      >
        <Download size={15} />
        <span className="hidden sm:inline">Export</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 glass-panel neon-border-strong rounded-xl shadow-2xl shadow-[#00f0ff]/5 overflow-hidden z-50 animate-fade-in-up">
          <div className="flex justify-between items-center p-3 border-b border-[#00f0ff]/10">
            <span className="text-sm font-semibold text-[#e8edf5]">Export Options</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#4a5568] hover:text-[#00f0ff] transition-colors duration-200"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="p-1.5">
            <button
              onClick={() => handleExport('csv')}
              className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#00f0ff]/5 rounded-lg text-[#e8edf5] text-sm transition-colors duration-150"
            >
              <FileText size={16} className="text-[#00f0ff]" />
              <span>Export as CSV</span>
            </button>
            
            <button
              onClick={() => handleExport('excel')}
              className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[#00f0ff]/5 rounded-lg text-[#e8edf5] text-sm transition-colors duration-150"
            >
              <FileSpreadsheet size={16} className="text-[#00e676]" />
              <span>Export as Excel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportMenu;
