import * as XLSX from 'xlsx';

export interface ProductImportRow {
  name: string;
  description?: string;
  price: string;
  category?: string;
  imageUrl?: string;
  active: boolean;
  trackInventory: boolean;
  stockQuantity?: number;
}

export interface ImportResult {
  success: boolean;
  data?: ProductImportRow[];
  errors?: string[];
  rowCount?: number;
}

export function generateProductTemplate(): void {
  const template = [
    {
      'Name *': 'Premium Software License',
      'Description': 'Annual subscription to our premium software suite',
      'Price *': '299.99',
      'Category': 'Software',
      'Image URL': 'https://example.com/image.jpg',
      'Active (TRUE/FALSE)': 'TRUE',
      'Track Inventory (TRUE/FALSE)': 'FALSE',
      'Stock Quantity': ''
    },
    {
      'Name *': 'Professional Course Bundle',
      'Description': 'Complete bundle of all professional development courses',
      'Price *': '599.00',
      'Category': 'Courses',
      'Image URL': '',
      'Active (TRUE/FALSE)': 'TRUE',
      'Track Inventory (TRUE/FALSE)': 'FALSE',
      'Stock Quantity': ''
    },
    {
      'Name *': 'Physical Product Sample',
      'Description': 'Example of a physical product with inventory',
      'Price *': '49.99',
      'Category': 'Physical Products',
      'Image URL': '',
      'Active (TRUE/FALSE)': 'TRUE',
      'Track Inventory (TRUE/FALSE)': 'TRUE',
      'Stock Quantity': '100'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  
  const colWidths = [
    { wch: 30 },
    { wch: 50 },
    { wch: 15 },
    { wch: 20 },
    { wch: 35 },
    { wch: 25 },
    { wch: 30 },
    { wch: 20 }
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products Template');
  
  XLSX.writeFile(workbook, 'products_import_template.xlsx');
}

export function parseProductExcel(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        const errors: string[] = [];
        const products: ProductImportRow[] = [];
        
        jsonData.forEach((row: any, index: number) => {
          const rowNumber = index + 2;
          
          const name = row['Name *'] || row['Name'] || '';
          const priceStr = row['Price *'] || row['Price'] || '';
          
          if (!name || !name.trim()) {
            errors.push(`Row ${rowNumber}: Name is required`);
            return;
          }
          
          if (!priceStr || !priceStr.toString().trim()) {
            errors.push(`Row ${rowNumber}: Price is required`);
            return;
          }
          
          const price = parseFloat(priceStr.toString().trim());
          if (isNaN(price) || price < 0) {
            errors.push(`Row ${rowNumber}: Invalid price format`);
            return;
          }
          
          const activeValue = row['Active (TRUE/FALSE)'] || row['Active'] || 'TRUE';
          const active = activeValue.toString().toUpperCase() === 'TRUE';
          
          const trackInventoryValue = row['Track Inventory (TRUE/FALSE)'] || row['Track Inventory'] || 'FALSE';
          const trackInventory = trackInventoryValue.toString().toUpperCase() === 'TRUE';
          
          const stockQuantityStr = row['Stock Quantity'] || '';
          let stockQuantity: number | undefined;
          if (trackInventory && stockQuantityStr) {
            const qty = parseInt(stockQuantityStr.toString());
            if (!isNaN(qty) && qty >= 0) {
              stockQuantity = qty;
            }
          }
          
          products.push({
            name: name.trim(),
            description: row['Description'] ? row['Description'].toString().trim() : undefined,
            price: price.toString(),
            category: row['Category'] ? row['Category'].toString().trim() : undefined,
            imageUrl: row['Image URL'] ? row['Image URL'].toString().trim() : undefined,
            active,
            trackInventory,
            stockQuantity
          });
        });
        
        if (errors.length > 0) {
          resolve({
            success: false,
            errors,
            rowCount: jsonData.length
          });
          return;
        }
        
        if (products.length === 0) {
          resolve({
            success: false,
            errors: ['No valid product data found in the file'],
            rowCount: 0
          });
          return;
        }
        
        resolve({
          success: true,
          data: products,
          rowCount: products.length
        });
        
      } catch (error) {
        resolve({
          success: false,
          errors: [`Failed to parse Excel file: ${(error as Error).message}`],
          rowCount: 0
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        errors: ['Failed to read file'],
        rowCount: 0
      });
    };
    
    reader.readAsBinaryString(file);
  });
}

export function exportProductsToExcel(products: any[]): void {
  const exportData = products.map(product => ({
    'Name': product.name,
    'Description': product.description || '',
    'Price': product.price,
    'Category': product.category || '',
    'Image URL': product.imageUrl || '',
    'Active': product.active ? 'TRUE' : 'FALSE',
    'Track Inventory': product.trackInventory ? 'TRUE' : 'FALSE',
    'Stock Quantity': product.stockQuantity || '',
    'Created At': new Date(product.createdAt).toLocaleDateString()
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  
  const colWidths = [
    { wch: 30 },
    { wch: 50 },
    { wch: 15 },
    { wch: 20 },
    { wch: 35 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 }
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `products_export_${timestamp}.xlsx`);
}
