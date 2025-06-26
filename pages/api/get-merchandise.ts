import { NextApiRequest, NextApiResponse } from 'next';
import Papa from 'papaparse';

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRFFcz9Q4P7q9iO22o33kNPo2G4LL8EzwJUyZJOh_mKSAWOD1zSGtoxiRRGmM9fBAvLTz6Rubajn08v/pub?output=csv';

// Default "More coming soon" items
const DEFAULT_COMING_SOON_ITEMS = [
  {
    name: "More coming soon",
    price: "",
    description: "More coming soon",
    image: "/",
    comingSoon: true,
  },
  {
    name: "More coming soon",
    price: "",
    description: "More coming soon",
    image: "/",
    comingSoon: true,
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL);
    const csv = await response.text();
    
    const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
    const products = parsed.data.map((row: any) => ({
      name: row.name || '',
      price: row.price || '',
      description: row.description || '',
      image: row.image || '',
      comingSoon: (row.name || '').toLowerCase().includes('coming soon')
    }));

    // Filter out any existing "More coming soon" items from the sheet
    const filteredProducts = products.filter(product => !product.comingSoon);

    // Add default "More coming soon" items at the end
    const finalProducts = [...filteredProducts, ...DEFAULT_COMING_SOON_ITEMS];

    console.log('Fetched merchandise data:', finalProducts);

    res.status(200).json(finalProducts);
  } catch (error) {
    console.error('Error fetching merchandise data:', error);
    res.status(500).json({ message: 'Failed to fetch merchandise data' });
  }
} 