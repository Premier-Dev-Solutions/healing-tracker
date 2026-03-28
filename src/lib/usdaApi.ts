/**
 * USDA FoodData Central API Integration
 * Documentation: https://fdc.nal.usda.gov/api-guide.html
 *
 * Free API - 1000 requests per hour
 * Sign up for API key at: https://api.data.gov/signup/
 */

const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';
// TODO: Get your own API key from https://api.data.gov/signup/
const USDA_API_KEY = 'DEMO_KEY'; // Replace with your actual key

export interface USDASearchResult {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
}

export interface USDAFoodDetails {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: {
    nutrientId: number;
    nutrientName: string;
    nutrientNumber: string;
    unitName: string;
    value: number;
  }[];
}

/**
 * Search for foods in USDA database
 * @param query - Search term (e.g., "chicken breast", "Wendy's burger")
 * @param pageSize - Number of results to return (default: 10)
 */
export async function searchUSDAFoods(
  query: string,
  pageSize: number = 10
): Promise<USDASearchResult[]> {
  try {
    const url = `${USDA_API_BASE}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=${pageSize}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.foods || [];
  } catch (error) {
    console.error('USDA API search error:', error);
    throw error;
  }
}

/**
 * Get detailed food information including nutrients
 * @param fdcId - Food Data Central ID from search results
 */
export async function getUSDAFoodDetails(fdcId: number): Promise<USDAFoodDetails | null> {
  try {
    const url = `${USDA_API_BASE}/food/${fdcId}?api_key=${USDA_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('USDA API details error:', error);
    return null;
  }
}

/**
 * Extract lysine and arginine from USDA food details
 * Nutrient IDs:
 * - Lysine: 1122 (Tryptophan), 1123 (Threonine), 1124 (Isoleucine), 1125 (Leucine), 1126 (Lysine)
 * - Arginine: 1133
 */
export function extractAminoAcids(foodDetails: USDAFoodDetails): {
  lysine: number;
  arginine: number;
  found: boolean;
} {
  const lysineNutrient = foodDetails.foodNutrients.find(
    n => n.nutrientName.toLowerCase().includes('lysine') || n.nutrientId === 1122
  );

  const arginineNutrient = foodDetails.foodNutrients.find(
    n => n.nutrientName.toLowerCase().includes('arginine') || n.nutrientId === 1133
  );

  return {
    lysine: lysineNutrient ? lysineNutrient.value : 0,
    arginine: arginineNutrient ? arginineNutrient.value : 0,
    found: !!(lysineNutrient && arginineNutrient)
  };
}

/**
 * Helper to calculate lysine/arginine ratio
 */
export function calculateRatio(lysine: number, arginine: number): number {
  if (arginine === 0) return lysine > 0 ? 999 : 0;
  return lysine / arginine;
}

/**
 * Get ratio quality indicator
 */
export function getRatioQuality(ratio: number): {
  level: 'good' | 'moderate' | 'poor';
  color: string;
  icon: string;
  label: string;
} {
  if (ratio >= 2.0) {
    return {
      level: 'good',
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: '💚',
      label: 'Good Ratio'
    };
  } else if (ratio >= 1.0) {
    return {
      level: 'moderate',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: '🟡',
      label: 'Moderate Ratio'
    };
  } else {
    return {
      level: 'poor',
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: '🔴',
      label: 'Poor Ratio'
    };
  }
}
