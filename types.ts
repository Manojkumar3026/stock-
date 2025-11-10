
export enum Category {
  ELECTRONICS_HARDWARE = 'Electronics Hardware',
  MODULES = 'Modules',
  MECHANICAL_PARTS = 'Mechanical Parts',
  PCB_COMPONENTS = 'PCB Components',
}

export enum ElectronicsSubcategory {
  GENERAL = 'General',
  SENSORS = 'Sensors',
  CONNECTORS = 'Connectors',
  WIRES = 'Wires',
}

export enum ModulesSubcategory {
  MICROCONTROLLERS = 'Microcontrollers',
  COMMUNICATION = 'Communication',
  POWER = 'Power',
}

export enum MechanicalSubcategory {
  FASTENERS = 'Fasteners',
  ENCLOSURES = 'Enclosures',
  STRUCTURAL = 'Structural',
}

export enum PCBSubcategory {
  SMD = 'SMD',
  THROUGH_HOLE = 'Through-Hole',
}

export type Subcategory =
  | ElectronicsSubcategory
  | ModulesSubcategory
  | MechanicalSubcategory
  | PCBSubcategory;

export interface StockItem {
  id: string;
  name: string;
  category: Category;
  subcategory: Subcategory;
  quantity: number;
  location: string;
  description?: string;
  datasheetUrl?: string;
}

export interface ExportRecord {
  id: string;
  timestamp: Date;
  itemCount: number;
  data: StockItem[];
}

export enum View {
  INVENTORY = 'inventory',
  EXPORTS = 'exports',
}
