// CSV and XLSX Parser for importing herb inventory
import { Herb } from './storage';
import * as XLSX from 'xlsx';

export interface ImportOptions {
  mode: 'replace' | 'merge' | 'update';
}

/**
 * Parse CSV text into array of objects
 */
export const parseCSV = (csvText: string): Record<string, string>[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must have headers and at least one row of data');
  }

  // Remove BOM if present
  let firstLine = lines[0];
  if (firstLine.charCodeAt(0) === 0xFEFF) {
    firstLine = firstLine.slice(1);
  }

  // Parse headers
  const headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  // Parse rows
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = parseCSVLine(line);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row);
  }

  return rows;
};

/**
 * Parse a single CSV line handling quoted values with commas
 */
const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

/**
 * Map CSV row to Herb object
 */
export const mapCSVToHerb = (row: Record<string, string>): Herb | null => {
  const product = row['Product'] || row['product'] || '';
  if (!product) return null; // Skip rows without product name

  // Determine type based on Supplement Type
  const supplementType = (row['Supplement Type'] || '').toLowerCase().trim();
  let type: 'herb' | 'tonic' | 'herb bundle' | 'herb blend' | 'tea bag' | 'pills' | 'gel' | 'topical' = 'herb';

  // Map supplement type to our type values
  if (supplementType === 'tonic') {
    type = 'tonic';
  } else if (supplementType === 'herb bundle') {
    type = 'herb bundle';
  } else if (supplementType === 'herb blend') {
    type = 'herb blend';
  } else if (supplementType === 'tea bag') {
    type = 'tea bag';
  } else if (supplementType === 'pills') {
    type = 'pills';
  } else if (supplementType === 'gel') {
    type = 'gel';
  } else if (supplementType === 'topical') {
    type = 'topical';
  } else {
    type = 'herb'; // default to herb
  }

  const item: Herb = {
    id: crypto.randomUUID(),
    name: product,
    supplementType: type,
    category: row['Category'] || 'Uncategorized',
    secondaryCategory: row['Sub Category'] || undefined,
    benefits: row['Benefits'] || '',
    description: row['Description'] || undefined,
    ingredients: row['Ingredients'] || undefined,
    supplier: row['Supplier'] || undefined,
    preparationInstructions: row['Preparation'] || undefined,
    serving: row['Serving'] || undefined,
    dailyAmount: row['Daily Amount'] || undefined,
    dateAdded: new Date().toISOString(),
    purchases: [],
  };

  return item;
};

/**
 * Parse XLSX file to array of objects
 */
export const parseXLSX = async (file: File): Promise<Record<string, string>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        // Convert to our format (string values only)
        const rows = jsonData.map((row: any) => {
          const stringRow: Record<string, string> = {};
          Object.keys(row).forEach(key => {
            stringRow[key] = String(row[key] || '');
          });
          return stringRow;
        });

        resolve(rows);
      } catch (error) {
        reject(new Error('Failed to parse XLSX file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read XLSX file'));
    };

    reader.readAsBinaryString(file);
  });
};

/**
 * Import CSV and convert to Herb array
 */
export const importCSV = (csvText: string): Herb[] => {
  const rows = parseCSV(csvText);
  const items: Herb[] = [];

  for (const row of rows) {
    const item = mapCSVToHerb(row);
    if (item) {
      items.push(item);
    }
  }

  return items;
};

/**
 * Import XLSX file and convert to Herb array
 */
export const importXLSX = async (file: File): Promise<Herb[]> => {
  const rows = await parseXLSX(file);
  const items: Herb[] = [];

  for (const row of rows) {
    const item = mapCSVToHerb(row);
    if (item) {
      items.push(item);
    }
  }

  return items;
};

/**
 * Import file (auto-detect CSV or XLSX) and convert to Herb array
 */
export const importFile = async (file: File): Promise<Herb[]> => {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return importXLSX(file);
  } else if (fileName.endsWith('.csv')) {
    const text = await file.text();
    return importCSV(text);
  } else {
    throw new Error('Unsupported file type. Please upload a CSV or XLSX file.');
  }
};

/**
 * Generate CSV template for download
 */
export const generateCSVTemplate = (): string => {
  const headers = [
    'Product',
    'Supplier',
    'Ingredients',
    'Serving',
    'Daily Amount',
    'Benefits',
    'Category',
    'Sub Category',
    'Supplement Type',
    'Description',
    'Preparation'
  ];

  const guidance = [
    'Required - Name of herb/supplement',
    'Where purchased from',
    'What it contains',
    '2/4 OZ | 30 Servings | 1 Block',
    '3 cups daily | 2 capsules daily | 1 time',
    'What it does',
    'Main category',
    'Additional category',
    'herb | tonic | pills | tea bag | gel | topical | herb bundle | herb blend',
    'Additional details',
    'How to prepare/use'
  ];

  const example1 = [
    'Una Del Gato',
    'Bolingo Balance',
    'Una Del Gato',
    '2/4 OZ',
    '3 Cups Daily',
    'Kills Cancer Cells, Boost Immune System',
    'Eliminate Virus',
    'Immune Support',
    'herb',
    'Cats Claw extract for immune support',
    'Boil 1 cup of spring water and 1 tablespoon'
  ];

  const example2 = [
    'Seamoss Gel',
    'Local Supplier',
    'Irish Seamoss, Spring Water',
    '1 Block',
    '2 tablespoons daily',
    'Nutrient Dense, Thyroid Support, Energy Boost',
    'Immune Boost',
    'Mineral Support',
    'gel',
    'Wild harvested seamoss gel',
    'Take 2 tablespoons in morning smoothie or tea'
  ];

  const example3 = [
    'Elderberry Syrup',
    'Wholesome Herbs',
    'Elderberry, Honey, Ginger, Cinnamon',
    '8 oz',
    '1 tablespoon daily',
    'Antiviral, Immune Support, Cold & Flu Prevention',
    'Immune Boost',
    'Respiratory Health',
    'tonic',
    'Concentrated elderberry syrup',
    'Take 1 tablespoon daily, can increase to 3x daily when sick'
  ];

  return headers.join(',') + '\n' +
         guidance.join(',') + '\n' +
         example1.join(',') + '\n' +
         example2.join(',') + '\n' +
         example3.join(',');
};
