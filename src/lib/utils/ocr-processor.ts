import Tesseract from 'tesseract.js';

export interface ExtractedReceiptData {
  vendor: string;
  amount: number | null;
  date: string | null;
  category: string;
  rawText: string;
}

export async function processReceiptImage(
  imageFile: File,
  onProgress?: (progress: number) => void
): Promise<ExtractedReceiptData> {
  try {
    const { data: { text } } = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(m.progress);
        }
      },
    });

    return parseReceiptText(text);
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process receipt image');
  }
}

function parseReceiptText(text: string): ExtractedReceiptData {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  let vendor = '';
  let amount: number | null = null;
  let date: string | null = null;
  let category = 'Other';

  const amountRegex = /(?:total|amount|sum|paid)[:\s]*[$£€]?\s*(\d{1,3}(?:[,]\d{3})*(?:[.]\d{2})|\d+[.]\d{2})|[$£€]\s*(\d{1,3}(?:[,]\d{3})*(?:[.]\d{2})|\d+[.]\d{2})/i;
  const dateRegex = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(\d{4}[/-]\d{1,2}[/-]\d{1,2})/;
  
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i].trim();
    if (line.length > 2 && !vendor) {
      vendor = line;
    }
  }

  for (const line of lines) {
    const amountMatch = line.match(amountRegex);
    if (amountMatch) {
      const matchedValue = amountMatch[1] || amountMatch[2];
      if (matchedValue) {
        const parsedAmount = parseFloat(matchedValue.replace(/,/g, ''));
        if (!amount || parsedAmount > amount) {
          amount = parsedAmount;
        }
      }
    }

    const dateMatch = line.match(dateRegex);
    if (dateMatch && !date) {
      const rawDate = dateMatch[0];
      try {
        const parsedDate = parseDate(rawDate);
        if (parsedDate) {
          date = parsedDate;
        }
      } catch (e) {
        console.log('Date parsing failed:', e);
      }
    }
  }

  category = inferCategory(text, vendor);

  return {
    vendor: vendor || 'Unknown Vendor',
    amount,
    date,
    category,
    rawText: text,
  };
}

function parseDate(dateStr: string): string | null {
  dateStr = dateStr.trim();
  
  const isoFormat = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/;
  const mdyFormat = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
  const mdyShortFormat = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2})$/;
  
  let year, month, day;
  let match;

  match = dateStr.match(isoFormat);
  if (match) {
    year = parseInt(match[1]);
    month = parseInt(match[2]);
    day = parseInt(match[3]);
  } else {
    match = dateStr.match(mdyFormat);
    if (match) {
      month = parseInt(match[1]);
      day = parseInt(match[2]);
      year = parseInt(match[3]);
    } else {
      match = dateStr.match(mdyShortFormat);
      if (match) {
        month = parseInt(match[1]);
        day = parseInt(match[2]);
        year = 2000 + parseInt(match[3]);
      }
    }
  }

  if (match) {
    if (month > 12) {
      [month, day] = [day, month];
    }

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  return null;
}

function inferCategory(text: string, vendor: string): string {
  const lowercaseText = (text + ' ' + vendor).toLowerCase();

  const categoryKeywords = {
    'Travel': ['uber', 'lyft', 'taxi', 'flight', 'hotel', 'airbnb', 'airline', 'airport'],
    'Meals': ['restaurant', 'cafe', 'coffee', 'food', 'pizza', 'burger', 'dining', 'lunch', 'dinner', 'breakfast'],
    'Software': ['software', 'subscription', 'saas', 'adobe', 'microsoft', 'google', 'aws', 'cloud'],
    'Office Supplies': ['office', 'supplies', 'staples', 'depot', 'paper', 'pen', 'desk'],
    'Utilities': ['electric', 'water', 'gas', 'internet', 'phone', 'utility'],
    'Marketing': ['marketing', 'advertising', 'facebook', 'google ads', 'promotion'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowercaseText.includes(keyword))) {
      return category;
    }
  }

  return 'Other';
}
