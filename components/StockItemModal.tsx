import React, { useState, useEffect } from 'react';
import { StockItem, Category, Subcategory } from '../types';
import { CATEGORY_SUBCATEGORY_MAP } from '../constants';

interface StockItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: StockItem | Omit<StockItem, 'id'>) => Promise<void>;
  item: StockItem | null;
}

const StockItemModal: React.FC<StockItemModalProps> = ({ isOpen, onClose, onSave, item }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<StockItem, 'id'>>({
    name: '',
    category: Category.ELECTRONICS_HARDWARE,
    subcategory: CATEGORY_SUBCATEGORY_MAP[Category.ELECTRONICS_HARDWARE][0],
    quantity: 0,
    location: '',
    description: '',
    datasheetUrl: '',
  });

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      const defaultCategory = Category.ELECTRONICS_HARDWARE;
      setFormData({
        name: '',
        category: defaultCategory,
        subcategory: CATEGORY_SUBCATEGORY_MAP[defaultCategory][0],
        quantity: 0,
        location: '',
        description: '',
        datasheetUrl: '',
      });
    }
  }, [item, isOpen]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as Category;
    setFormData(prev => ({
      ...prev,
      category: newCategory,
      subcategory: CATEGORY_SUBCATEGORY_MAP[newCategory][0],
    }));
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    if (item) {
      await onSave({ ...formData, id: item.id });
    } else {
      await onSave(formData);
    }
    setIsSaving(false);
  };

  if (!isOpen) return null;

  const availableSubcategories = CATEGORY_SUBCATEGORY_MAP[formData.category] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-semibold">{item ? 'Edit Item' : 'Add New Item'}</h3>
          </div>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Item Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700">Category</label>
                <select name="category" id="category" value={formData.category} onChange={handleCategoryChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                  {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="subcategory" className="block text-sm font-medium text-slate-700">Subcategory</label>
                <select name="subcategory" id="subcategory" value={formData.subcategory} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                  {availableSubcategories.map(subcat => <option key={subcat} value={subcat}>{subcat}</option>)}
                </select>
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">Quantity</label>
                  <input type="number" name="quantity" id="quantity" value={formData.quantity} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
               </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location</label>
                  <input type="text" name="location" id="location" value={formData.location} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
            </div>
            <div>
              <label htmlFor="datasheetUrl" className="block text-sm font-medium text-slate-700">Datasheet URL</label>
              <input type="url" name="datasheetUrl" id="datasheetUrl" value={formData.datasheetUrl} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
             <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>
          </div>
          <div className="p-6 bg-slate-50 rounded-b-lg flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary text-white border border-transparent rounded-md shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus disabled:bg-slate-400 disabled:cursor-not-allowed">
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockItemModal;