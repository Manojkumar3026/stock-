import React, { useState, useMemo } from 'react';
import { StockItem, Category, Subcategory } from '../types';
import { CATEGORY_SUBCATEGORY_MAP } from '../constants';
import { PlusIcon, EditIcon, DeleteIcon, ExportIcon, LinkIcon, ImportIcon } from './icons';

interface InventoryTableProps {
  items: StockItem[];
  onAddItem: () => void;
  onEditItem: (item: StockItem) => void;
  onDeleteItem: (id: string) => void;
  onExport: (items: StockItem[]) => void;
  onImportClick: () => void;
}

type SortKey = keyof StockItem;
type SortDirection = 'asc' | 'dsc';

const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onExport,
  onImportClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState<Subcategory | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (subcategoryFilter !== 'all' && categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.subcategory === subcategoryFilter);
    }
    
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === undefined || bValue === undefined) return 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

    return sorted;
  }, [items, searchTerm, categoryFilter, subcategoryFilter, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection(prev => (prev === 'asc' ? 'dsc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value as Category | 'all');
    setSubcategoryFilter('all');
  };

  const renderSortArrow = (key: SortKey) => {
    if (key !== sortKey) return null;
    return sortDirection === 'asc' ? '▲' : '▼';
  };
  
  const subcategoriesForFilter = categoryFilter !== 'all' ? CATEGORY_SUBCATEGORY_MAP[categoryFilter] : [];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-slate-700">Inventory Items ({filteredAndSortedItems.length})</h2>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button onClick={onImportClick} className="flex items-center gap-2 bg-slate-100 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors duration-200 text-sm font-medium shadow-sm border border-slate-300">
            <ImportIcon className="w-4 h-4" />
            Import
          </button>
          <button onClick={() => onExport(filteredAndSortedItems)} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm font-medium shadow">
            <ExportIcon className="w-4 h-4" />
            Export View
          </button>
          <button onClick={onAddItem} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors duration-200 text-sm font-medium shadow">
            <PlusIcon className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <select value={categoryFilter} onChange={handleCategoryChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
          <option value="all">All Categories</option>
          {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select 
          value={subcategoryFilter} 
          onChange={(e) => setSubcategoryFilter(e.target.value as Subcategory | 'all')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={categoryFilter === 'all'}>
          <option value="all">All Subcategories</option>
          {subcategoriesForFilter.map(subcat => <option key={subcat} value={subcat}>{subcat}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('name')}>Name {renderSortArrow('name')}</th>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('category')}>Category {renderSortArrow('category')}</th>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('subcategory')}>Subcategory {renderSortArrow('subcategory')}</th>
              <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('quantity')}>Quantity {renderSortArrow('quantity')}</th>
              <th scope="col" className="px-6 py-3">Location</th>
              <th scope="col" className="px-6 py-3">Datasheet</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedItems.map(item => (
              <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{item.name}</td>
                <td className="px-6 py-4">{item.category}</td>
                <td className="px-6 py-4">{item.subcategory}</td>
                <td className="px-6 py-4 font-bold">{item.quantity}</td>
                <td className="px-6 py-4">{item.location}</td>
                <td className="px-6 py-4">
                  {item.datasheetUrl && (
                    <a href={item.datasheetUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      <LinkIcon className="w-5 h-5" />
                    </a>
                  )}
                </td>
                <td className="px-6 py-4 flex justify-end gap-2">
                  <button onClick={() => onEditItem(item)} className="p-2 text-slate-600 hover:text-primary transition-colors"><EditIcon className="w-5 h-5" /></button>
                  <button onClick={() => onDeleteItem(item.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors"><DeleteIcon className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
             {filteredAndSortedItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">No items match your criteria.</td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;