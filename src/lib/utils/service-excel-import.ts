import * as XLSX from 'xlsx';

export interface ServiceImportRow {
  name: string;
  description?: string;
  unitPrice: string;
  currency: string;
  category?: string;
  duration?: number;
  active: boolean;
}

export interface ImportResult {
  success: boolean;
  data?: ServiceImportRow[];
  errors?: string[];
  rowCount?: number;
}

export function generateServiceTemplate(): void {
  const template = [
    {
      'Name *': 'Web Development Consultation',
      'Description': '1-hour consultation on web development strategy',
      'Unit Price *': '150.00',
      'Currency': 'USD',
      'Category': 'Consulting',
      'Duration (minutes)': '60',
      'Active (TRUE/FALSE)': 'TRUE'
    },
    {
      'Name *': 'Logo Design Package',
      'Description': 'Complete logo design with 3 concepts and unlimited revisions',
      'Unit Price *': '500.00',
      'Currency': 'USD',
      'Category': 'Design',
      'Duration (minutes)': '',
      'Active (TRUE/FALSE)': 'TRUE'
    },
    {
      'Name *': 'SEO Audit Service',
      'Description': 'Comprehensive SEO audit with actionable recommendations',
      'Unit Price *': '299.00',
      'Currency': 'USD',
      'Category': 'Marketing',
      'Duration (minutes)': '120',
      'Active (TRUE/FALSE)': 'TRUE'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  
  const colWidths = [
    { wch: 35 },
    { wch: 55 },
    { wch: 15 },
    { wch: 12 },
    { wch: 20 },
    { wch: 20 },
    { wch: 25 }
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Services Template');
  
  XLSX.writeFile(workbook, 'services_import_template.xlsx');
}

export function parseServiceExcel(file: File): Promise<ImportResult> {
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
        const services: ServiceImportRow[] = [];
        
        jsonData.forEach((row: any, index: number) => {
          const rowNumber = index + 2;
          
          const name = row['Name *'] || row['Name'] || '';
          const priceStr = row['Unit Price *'] || row['Unit Price'] || '';
          
          if (!name || !name.trim()) {
            errors.push(`Row ${rowNumber}: Name is required`);
            return;
          }
          
          if (!priceStr || !priceStr.toString().trim()) {
            errors.push(`Row ${rowNumber}: Unit Price is required`);
            return;
          }
          
          const unitPrice = parseFloat(priceStr.toString().trim());
          if (isNaN(unitPrice) || unitPrice < 0) {
            errors.push(`Row ${rowNumber}: Invalid unit price format`);
            return;
          }
          
          const currency = row['Currency'] ? row['Currency'].toString().trim().toUpperCase() : 'USD';
          
          const activeValue = row['Active (TRUE/FALSE)'] || row['Active'] || 'TRUE';
          const active = activeValue.toString().toUpperCase() === 'TRUE';
          
          const durationStr = row['Duration (minutes)'] || '';
          let duration: number | undefined;
          if (durationStr) {
            const dur = parseInt(durationStr.toString());
            if (!isNaN(dur) && dur > 0) {
              duration = dur;
            }
          }
          
          services.push({
            name: name.trim(),
            description: row['Description'] ? row['Description'].toString().trim() : undefined,
            unitPrice: unitPrice.toString(),
            currency,
            category: row['Category'] ? row['Category'].toString().trim() : undefined,
            duration,
            active
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
        
        if (services.length === 0) {
          resolve({
            success: false,
            errors: ['No valid service data found in the file'],
            rowCount: 0
          });
          return;
        }
        
        resolve({
          success: true,
          data: services,
          rowCount: services.length
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

export function exportServicesToExcel(services: any[]): void {
  const exportData = services.map(service => ({
    'Name': service.name,
    'Description': service.description || '',
    'Unit Price': service.unitPrice,
    'Currency': service.currency,
    'Category': service.category || '',
    'Duration (minutes)': service.duration || '',
    'Active': service.active ? 'TRUE' : 'FALSE',
    'Created At': new Date(service.createdAt).toLocaleDateString()
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  
  const colWidths = [
    { wch: 35 },
    { wch: 55 },
    { wch: 15 },
    { wch: 12 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 }
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Services');
  
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `services_export_${timestamp}.xlsx`);
}
