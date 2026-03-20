import pool from '@/app/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      WITH group_countries AS (
        SELECT
          mg.id AS group_id,
          json_agg(
            json_build_object('iso2', c.iso2, 'name_cs', c.name_cs, 'name_en', c.name_en)
            ORDER BY c.name_cs
          ) AS countries
        FROM public.map_groups mg
        JOIN public.country_map_group cmg ON cmg.map_group_id = mg.id
        JOIN public.countries c ON c.id = cmg.country_id
        GROUP BY mg.id
      ),
      group_recipes AS (
        SELECT
          cmg.map_group_id AS group_id,
          json_agg(
            json_build_object(
              'title',       rt.title,
              'description', rt.description,
              'ingredients', (
                SELECT json_agg(ri.custom_name ORDER BY ri.sort_order)
                FROM public.recipe_ingredients ri
                WHERE ri.recipe_id = r.id
                  AND ri.custom_name IS NOT NULL
                  AND ri.is_optional = false
              )
            )
            ORDER BY rt.title
          ) AS recipes
        FROM public.recipes r
        JOIN public.recipe_translations rt ON rt.recipe_id = r.id AND rt.locale = 'cs'
        JOIN public.countries c ON c.id = r.country_id
        JOIN public.country_map_group cmg ON cmg.country_id = c.id
        WHERE r.is_published = true AND r.deleted_at IS NULL
        GROUP BY cmg.map_group_id
      )
      SELECT
        mg.code,
        mg.name_cs,
        mg.name_en,
        mg.emoji,
        mg.color,
        mg.hover_color,
        gc.countries,
        gr.recipes
      FROM public.map_groups mg
      LEFT JOIN group_countries gc ON gc.group_id = mg.id
      LEFT JOIN group_recipes   gr ON gr.group_id = mg.id
      ORDER BY mg.sort_order
    `);

    return Response.json({ success: true, data: rows });
  } catch (err) {
    console.error('/api/map-groups error:', err);
    return Response.json({ success: false, message: 'DB error' }, { status: 500 });
  } finally {
    client.release();
  }
}
