import * as XLSX from 'xlsx';

export interface ReceiptImportRow {
  vendor: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

export interface ReceiptImportResult {
  success: boolean;
  data?: ReceiptImportRow[];
  errors?: string[];
  rowCount?: number;
}

const VALID_CATEGORIES = [
  'Travel',
  'Meals',
  'Software',
  'Hardware',
  'Office Supplies',
  'Utilities',
  'Other'
];

function isValidDateFormat(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function generateReceiptTemplate(): void {
  const template = [
    {
      'Vendor *': 'Starbucks',
      'Amount *': '15.50',
      'Category *': 'Meals',
      'Date * (YYYY-MM-DD)': '2025-10-15',
      'Notes': 'Client meeting coffee'
    },
    {
      'Vendor *': 'Amazon Web Services',
      'Amount *': '89.99',
      'Category *': 'Software',
      'Date * (YYYY-MM-DD)': '2025-10-01',
      'Notes': 'Monthly hosting fees'
    },
    {
      'Vendor *': 'Delta Airlines',
      'Amount *': '450.00',
      'Category *': 'Travel',
      'Date * (YYYY-MM-DD)': '2025-09-28',
      'Notes': 'Flight to client site'
    },
    {
      'Vendor *': 'Office Depot',
      'Amount *': '75.25',
      'Category *': 'Office Supplies',
      'Date * (YYYY-MM-DD)': '2025-10-10',
      'Notes': 'Printer paper and ink'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  
  const colWidths = [
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
    { wch: 22 },
    { wch: 35 }
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Receipts Template');
  
  XLSX.writeFile(workbook, 'receipts_import_template.xlsx');
}

export function parseReceiptExcel(file: File): Promise<ReceiptImportResult> {
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
        const receipts: ReceiptImportRow[] = [];
        
        jsonData.forEach((row: any, index: number) => {
          const rowNumber = index + 2;
          
          const vendor = row['Vendor *'] || row['Vendor'] || '';
          const amountStr = row['Amount *'] || row['Amount'] || '';
          const category = row['Category *'] || row['Category'] || '';
          const date = row['Date * (YYYY-MM-DD)'] || row['Date'] || '';
          
          if (!vendor || !vendor.toString().trim()) {
            errors.push(`Row ${rowNumber}: Vendor is required`);
            return;
          }
          
          if (!amountStr || amountStr.toString().trim() === '') {
            errors.push(`Row ${rowNumber}: Amount is required`);
            return;
          }
          
          const amount = parseFloat(amountStr.toString().replace(/[,$]/g, ''));
          if (isNaN(amount) || amount <= 0) {
            errors.push(`Row ${rowNumber}: Amount must be a positive number`);
            return;
          }
          
          if (!category || !category.toString().trim()) {
            errors.push(`Row ${rowNumber}: Category is required`);
            return;
          }
          
          const categoryStr = category.toString().trim();
          if (!VALID_CATEGORIES.includes(categoryStr)) {
            errors.push(`Row ${rowNumber}: Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
            return;
          }
          
          if (!date || !date.toString().trim()) {
            errors.push(`Row ${rowNumber}: Date is required`);
            return;
          }
          
          const dateStr = date.toString().trim();
          if (!isValidDateFormat(dateStr)) {
            errors.push(`Row ${rowNumber}: Date must be in YYYY-MM-DD format (e.g., 2025-10-15)`);
            return;
          }
          
          receipts.push({
            vendor: vendor.toString().trim(),
            amount: amount,
            category: categoryStr,
            date: dateStr,
            notes: row['Notes'] ? row['Notes'].toString().trim() : undefined
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
        
        if (receipts.length === 0) {
          resolve({
            success: false,
            errors: ['No valid receipt data found in the file'],
            rowCount: 0
          });
          return;
        }
        
        resolve({
          success: true,
          data: receipts,
          rowCount: receipts.length
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
