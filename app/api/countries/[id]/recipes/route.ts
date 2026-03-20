import type { NextRequest } from 'next/server';
import { mockRecipes, getRecipesByCountryName } from '@/app/lib/mockRecipes';

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/countries/[id]/recipes'>
) {
  const { id } = await ctx.params;

  const countryData = mockRecipes[id.toUpperCase()] ?? getRecipesByCountryName(id);

  if (!countryData) {
    return Response.json(
      {
        success: false,
        message: `No recipes found for "${id}". Use a valid ISO-2 code (e.g. "IT") or country name (e.g. "Italy").`,
      },
      { status: 404 }
    );
  }

  return Response.json({
    success: true,
    country: countryData.countryName,
    flag: countryData.flag,
    recipeCount: countryData.recipes.length,
    data: countryData.recipes,
  });
}
