
UPDATE public.site_content
SET value = jsonb_set(jsonb_set(jsonb_set(value,
  '{name}', '"Augustine Sempagala"'),
  '{title}', '"Founder & Executive Director"'),
  '{image_url}', '"/__l5e/assets-v1/ee60d2ae-f812-41f8-9c96-85cf61b82d6b/augustine-sempagala.png"')
WHERE key = 'founder_message';

UPDATE public.site_content
SET value = jsonb_set(jsonb_set(jsonb_set(value,
  '{name}', '"Agness Claire Namisango"'),
  '{title}', '"Cofounder & Programs Director"'),
  '{image_url}', '"/__l5e/assets-v1/fdf0a982-a562-47c7-8649-a569e0940ae1/agness-namisango.png"')
WHERE key = 'cofounder_message';
