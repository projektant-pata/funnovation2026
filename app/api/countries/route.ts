import { mockRecipes } from '@/app/lib/mockRecipes';

export async function GET() {
  const summary = Object.entries(mockRecipes).map(([code, data]) => ({
    code,
    name: data.countryName,
    flag: data.flag,
    recipeCount: data.recipes.length,
  }));

  return Response.json({ success: true, data: summary });
}
