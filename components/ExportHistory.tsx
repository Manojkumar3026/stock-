import React, { useState, useMemo } from 'react';
import { ExportRecord } from '../types';
import { exportToExcel } from '../services/exportService';
import { DownloadIcon, CalendarIcon } from './icons';

interface ExportHistoryProps {
  history: ExportRecord[];
}

const ExportHistory: React.FC<ExportHistoryProps> = ({ history }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleDownload = (record: ExportRecord) => {
    exportToExcel(record.data, `inventory_export_${record.timestamp.toISOString().split('T')[0]}.xlsx`);
  };

  const filteredHistory = useMemo(() => {
    if (!searchTerm) {
      return history;
    }
    return history.filter(record =>
      record.timestamp.toLocaleString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.itemCount.toString().includes(searchTerm)
    );
  }, [history, searchTerm]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
         <h2 className="text-xl font-bold text-slate-700">Export History ({filteredHistory.length})</h2>
         {history.length > 0 && (
             <input
              type="text"
              placeholder="Search by date or item count..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-1/3 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
         )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg">
          <p className="text-slate-500">No exports have been made yet.</p>
          <p className="text-sm text-slate-400 mt-2">Export from the Inventory tab to see records here.</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-lg">
            <p className="text-slate-500">No exports match your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map(record => (
            <div key={record.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="font-semibold text-slate-800 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-slate-500"/>
                  Exported on {record.timestamp.toLocaleString()}
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Contained {record.itemCount} item(s).
                </p>
              </div>
              <button
                onClick={() => handleDownload(record)}
                className="flex items-center gap-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-sm font-medium shadow-sm"
              >
                <DownloadIcon className="w-4 h-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportHistory;
