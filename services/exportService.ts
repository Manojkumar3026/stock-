
import { StockItem } from '../types';
import * as XLSX from 'xlsx';

export const exportToExcel = (data: StockItem[], fileName: string) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Create a worksheet from the data
  const worksheetData = data.map(({ id, ...rest }) => rest); // Exclude ID from export
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  // Define column widths for better readability
  const columnWidths = [
    { wch: 30 }, // name
    { wch: 20 }, // category
    { wch: 20 }, // subcategory
    { wch: 10 }, // quantity
    { wch: 20 }, // location
    { wch: 40 }, // description
    { wch: 40 }, // datasheetUrl
  ];
  worksheet['!cols'] = columnWidths;

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

  // Write the workbook and trigger a download
  XLSX.writeFile(workbook, fileName);
};
