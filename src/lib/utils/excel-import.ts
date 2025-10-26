import * as XLSX from 'xlsx';

export interface ClientImportRow {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  taxId?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  taxRate?: string;
  autoCalculateTax?: boolean;
}

export interface ImportResult {
  success: boolean;
  data?: ClientImportRow[];
  errors?: string[];
  rowCount?: number;
}

export function generateClientTemplate(): void {
  const template = [
    {
      'Name *': 'John Doe',
      'Email *': 'john@example.com',
      'Phone': '+1-555-234-5678',
      'Company': 'Acme Corp',
      'Tax ID': '12-3456789',
      'Address': '123 Main Street, Apt 4B',
      'City': 'Toronto',
      'Province/State': 'Ontario',
      'Country': 'Canada',
      'Tax Rate (%)': '13',
      'Auto-Calculate Tax (TRUE/FALSE)': 'TRUE'
    },
    {
      'Name *': 'Jane Smith',
      'Email *': 'jane@example.com',
      'Phone': '+1-555-987-6543',
      'Company': 'Tech Innovations Inc',
      'Tax ID': '98-7654321',
      'Address': '456 Oak Avenue',
      'City': 'New York',
      'Province/State': 'New York',
      'Country': 'United States',
      'Tax Rate (%)': '4',
      'Auto-Calculate Tax (TRUE/FALSE)': 'FALSE'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  
  const colWidths = [
    { wch: 20 },
    { wch: 25 },
    { wch: 18 },
    { wch: 25 },
    { wch: 15 },
    { wch: 30 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 30 }
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients Template');
  
  XLSX.writeFile(workbook, 'clients_import_template.xlsx');
}

export function parseClientExcel(file: File): Promise<ImportResult> {
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
        const clients: ClientImportRow[] = [];
        
        jsonData.forEach((row: any, index: number) => {
          const rowNumber = index + 2;
          
          const name = row['Name *'] || row['Name'] || '';
          const email = row['Email *'] || row['Email'] || '';
          
          if (!name || !name.trim()) {
            errors.push(`Row ${rowNumber}: Name is required`);
            return;
          }
          
          if (!email || !email.trim()) {
            errors.push(`Row ${rowNumber}: Email is required`);
            return;
          }
          
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            errors.push(`Row ${rowNumber}: Invalid email format`);
            return;
          }
          
          const autoCalcValue = row['Auto-Calculate Tax (TRUE/FALSE)'] || row['Auto-Calculate Tax'] || '';
          const autoCalculateTax = autoCalcValue.toString().toUpperCase() === 'TRUE';
          
          clients.push({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: row['Phone'] ? row['Phone'].toString().trim() : undefined,
            company: row['Company'] ? row['Company'].toString().trim() : undefined,
            taxId: row['Tax ID'] ? row['Tax ID'].toString().trim() : undefined,
            address: row['Address'] ? row['Address'].toString().trim() : undefined,
            city: row['City'] ? row['City'].toString().trim() : undefined,
            province: row['Province/State'] ? row['Province/State'].toString().trim() : undefined,
            country: row['Country'] ? row['Country'].toString().trim() : undefined,
            taxRate: row['Tax Rate (%)'] ? row['Tax Rate (%)'].toString().trim() : undefined,
            autoCalculateTax
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
        
        if (clients.length === 0) {
          resolve({
            success: false,
            errors: ['No valid client data found in the file'],
            rowCount: 0
          });
          return;
        }
        
        resolve({
          success: true,
          data: clients,
          rowCount: clients.length
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
