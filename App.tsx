import React, { useState, useEffect, useCallback } from 'react';
import { StockItem, ExportRecord, View } from './types';
import { supabase } from './services/supabaseClient';
import Header from './components/Header';
import InventoryTable from './components/InventoryTable';
import ExportHistory from './components/ExportHistory';
import StockItemModal from './components/StockItemModal';
import ImportModal from './components/ImportModal';
import { exportToExcel } from './services/exportService';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.INVENTORY);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from('stock_items')
        .select('*')
        .order('name', { ascending: true });
      if (itemsError) throw itemsError;
      setStockItems(itemsData || []);

      const { data: exportsData, error: exportsError } = await supabase
        .from('export_records')
        .select('*')
        .order('timestamp', { ascending: false });
      if (exportsError) throw exportsError;
      setExportHistory((exportsData || []).map(e => ({...e, timestamp: new Date(e.timestamp)})));
    } catch (err) {
      console.error("Error fetching data:", err);
      
      let detailedMessage: string;

      if (err instanceof Error) {
        detailedMessage = err.message;
      } else if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
        detailedMessage = (err as any).message;
        if ('details' in err && typeof (err as any).details === 'string' && (err as any).details) {
          detailedMessage += `\nDetails: ${(err as any).details}`;
        }
      } else if (typeof err === 'string') {
        detailedMessage = err;
      } else {
        try {
          detailedMessage = JSON.stringify(err, null, 2);
        } catch {
          detailedMessage = "An unexpected error occurred and it could not be described.";
        }
      }

      // Explicitly prevent showing '[object Object]' or an empty object
      if (detailedMessage.trim() === '{}' || detailedMessage.includes('[object Object]')) {
          detailedMessage = "The application received a non-descriptive error. Please check the browser's developer console for the full error object."
      }
      
      const userFriendlyMessage = `Failed to connect to the database. This could be due to a network issue, incorrect Supabase URL, or a problem with Row Level Security policies. \n\nTechnical details: ${detailedMessage}`;
      
      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddItem = async (item: Omit<StockItem, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('stock_items')
        .insert([item])
        .select();
      if (error) throw error;
      if (data) {
        setStockItems(prev => [...prev, data[0]].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(`Error adding item: ${err.message}`);
    }
  };
  
  const handleUpdateItem = async (updatedItem: StockItem) => {
    try {
      const { id, ...updateData } = updatedItem;
      const { data, error } = await supabase
        .from('stock_items')
        .update(updateData)
        .eq('id', id)
        .select();
      if (error) throw error;
      if (data) {
        setStockItems(prev => prev.map(item => (item.id === id ? data[0] : item)));
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      alert(`Error updating item: ${err.message}`);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const { error } = await supabase.from('stock_items').delete().eq('id', id);
        if (error) throw error;
        setStockItems(prev => prev.filter(item => item.id !== id));
      } catch (err: any) {
        alert(`Error deleting item: ${err.message}`);
      }
    }
  };

  const handleExport = useCallback(async (itemsToExport: StockItem[]) => {
    const newExport: Omit<ExportRecord, 'id'> = {
      timestamp: new Date(),
      itemCount: itemsToExport.length,
      data: itemsToExport,
    };
    try {
      const { error, data } = await supabase.from('export_records').insert([newExport]).select();
      if (error) throw error;
      
      if(data) {
         setExportHistory(prev => ([{...data[0], timestamp: new Date(data[0].timestamp)}, ...prev]));
      }
      
      exportToExcel(itemsToExport, `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      alert('Data exported and record saved to history!');
    } catch(err: any) {
      alert(`Error exporting data: ${err.message}`);
    }
  }, []);

  const handleImportItems = async (itemsToImport: Omit<StockItem, 'id'>[]) => {
    try {
      const { error } = await supabase.from('stock_items').insert(itemsToImport);
      if (error) throw error;
      
      setIsImportModalOpen(false);
      await fetchData(); // Refetch all data to show imported items
      alert(`${itemsToImport.length} items imported successfully!`);
    } catch (err: any) {
      alert(`Error importing items: ${err.message}`);
    }
  };

  const openModalForEdit = (item: StockItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const openModalForAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="text-xl font-semibold text-slate-600">Loading Inventory...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-8 bg-red-50 min-h-screen flex flex-col justify-center items-center">
      <div>
        <h2 className="text-2xl font-bold mb-2">Failed to load data</h2>
        <pre className="whitespace-pre-wrap bg-red-100 p-3 rounded-md border border-red-300 text-red-800 font-mono text-sm text-left">{error}</pre>
        <p className="mt-4 text-sm text-slate-600">Please check your Supabase connection and ensure the tables are set up correctly. <br/> A common issue is that Row Level Security (RLS) is enabled but no access policies are defined.</p>
        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors duration-200">Retry</button>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header currentView={view} setView={setView} />
      <main className="p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {view === View.INVENTORY && (
            <InventoryTable
              items={stockItems}
              onAddItem={openModalForAdd}
              onEditItem={openModalForEdit}
              onDeleteItem={handleDeleteItem}
              onExport={handleExport}
              onImportClick={() => setIsImportModalOpen(true)}
            />
          )}
          {view === View.EXPORTS && (
            <ExportHistory history={exportHistory} />
          )}
        </div>
      </main>
      {isModalOpen && (
        <StockItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={editingItem ? handleUpdateItem : handleAddItem}
          item={editingItem}
        />
      )}
      {isImportModalOpen && (
        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportItems}
        />
      )}
    </div>
  );
};

export default App;