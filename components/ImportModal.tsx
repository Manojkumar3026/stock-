import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { StockItem, Category, Subcategory } from '../types';
import { CATEGORY_SUBCATEGORY_MAP } from '../constants';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: Omit<StockItem, 'id'>[]) => Promise<void>;
}

interface ParsedRow {
  data: Omit<StockItem, 'id'>;
  isValid: boolean;
  errors: string[];
}

const REQUIRED_COLUMNS = ['name', 'category', 'subcategory', 'quantity', 'location'];

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setParsedRows([]);
    setIsProcessing(false);
    setFileName(null);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const headers = (XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[]) || [];
        const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));

        if (missingColumns.length > 0) {
          alert(`The Excel file is missing required columns: ${missingColumns.join(', ')}`);
          resetState();
          return;
        }
        
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const validatedRows: ParsedRow[] = json.map(row => {
          const errors: string[] = [];
          
          const category = row.category as Category;
          const subcategory = row.subcategory as Subcategory;
          const quantity = Number(row.quantity);

          if (!Object.values(Category).includes(category)) {
            errors.push(`Invalid category: ${category || '(empty)'}`);
          } else if (!CATEGORY_SUBCATEGORY_MAP[category]?.includes(subcategory)) {
            errors.push(`Invalid subcategory '${subcategory || '(empty)'}' for category '${category}'`);
          }
          if (isNaN(quantity) || quantity < 0) {
            errors.push('Quantity must be a non-negative number.');
          }
          if (!row.name) {
            errors.push('Name is required.');
          }
           if (!row.location) {
            errors.push('Location is required.');
          }

          return {
            data: {
              name: String(row.name || ''),
              category,
              subcategory,
              quantity,
              location: String(row.location || ''),
              description: String(row.description || ''),
              datasheetUrl: String(row.datasheetUrl || ''),
            },
            isValid: errors.length === 0,
            errors,
          };
        });

        setParsedRows(validatedRows);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        alert("There was an error processing the file. Please ensure it is a valid Excel file.");
        resetState();
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = ''; // Reset file input
  };
  
  const handleImportClick = async () => {
    const validItems = parsedRows.filter(row => row.isValid).map(row => row.data);
    if (validItems.length === 0) {
      alert("No valid items to import.");
      return;
    }
    setIsProcessing(true);
    await onImport(validItems);
    setIsProcessing(false);
  };
  
  if (!isOpen) return null;

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col" style={{height: '90vh'}} onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-xl font-semibold">Import Items from Excel</h3>
          <p className="text-sm text-slate-500 mt-1">Upload an Excel file with columns: name, category, subcategory, quantity, location, description (optional), datasheetUrl (optional).</p>
        </div>
        <div className="flex-grow p-6 overflow-y-auto">
          {parsedRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-slate-300 rounded-lg text-center p-4">
              <p className="font-semibold text-slate-600 mb-2">Select an Excel file to begin</p>
              <p className="text-sm text-slate-500 mb-4">The file should have a header row with at least the required columns.</p>
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
              <label htmlFor="file-upload" className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors duration-200 text-sm font-medium shadow disabled:bg-slate-400">
                {isProcessing ? 'Processing...' : 'Choose File'}
              </label>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-3 bg-slate-100 rounded-lg text-sm flex justify-between items-center">
                <div>
                  <strong>{fileName}</strong>: <span className="text-green-600 font-semibold">{validCount} valid</span>, <span className="text-red-600 font-semibold">{invalidCount} invalid</span>.
                </div>
                <div>
                    <input 
                        type="file" 
                        id="file-upload-replace" 
                        className="hidden" 
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        disabled={isProcessing}
                    />
                    <label htmlFor="file-upload-replace" className="cursor-pointer text-sm text-primary hover:underline">
                        Choose another file
                    </label>
                </div>
              </div>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left">
                    <tr>
                      <th className="p-3 font-medium text-slate-600">Name</th>
                      <th className="p-3 font-medium text-slate-600">Category</th>
                      <th className="p-3 font-medium text-slate-600">Subcategory</th>
                      <th className="p-3 font-medium text-slate-600">Qty</th>
                      <th className="p-3 font-medium text-slate-600">Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row, index) => (
                      <tr key={index} className={`border-t ${!row.isValid ? 'bg-red-50 text-red-800' : ''}`}>
                        <td className="p-3">{row.data.name}</td>
                        <td className="p-3">{row.data.category}</td>
                        <td className="p-3">{row.data.subcategory}</td>
                        <td className="p-3">{row.data.quantity}</td>
                        <td className="p-3">{row.errors.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <div className="p-6 bg-slate-50 rounded-b-lg flex justify-end gap-3">
          <button type="button" onClick={handleClose} disabled={isProcessing} className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50">Cancel</button>
          <button 
            type="button" 
            onClick={handleImportClick} 
            disabled={isProcessing || validCount === 0}
            className="px-4 py-2 bg-primary text-white border border-transparent rounded-md shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Importing...' : `Import ${validCount} Items`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
