import { 
  StockItem, 
  Category, 
  ElectronicsSubcategory, 
  ModulesSubcategory, 
  MechanicalSubcategory, 
  PCBSubcategory,
  Subcategory
} from './types';

export const CATEGORY_SUBCATEGORY_MAP: Record<Category, Subcategory[]> = {
  [Category.ELECTRONICS_HARDWARE]: Object.values(ElectronicsSubcategory),
  [Category.MODULES]: Object.values(ModulesSubcategory),
  [Category.MECHANICAL_PARTS]: Object.values(MechanicalSubcategory),
  [Category.PCB_COMPONENTS]: Object.values(PCBSubcategory),
};
