-- Seed content, matching the design handoff. Safe to re-run.

insert into public.success_stories
  (slug, client, country, period, title, tags, cats, from_value, to_value, metric, cover_url, href, status, sort_order)
values
  ('tawheed', 'التوحيد والنور · ريتيل', 'مصر', 'يونيو 2023 ← سبتمبر 2026',
   'من محلات عريقة لـ علامة تجارية واضحة، ديجيتال!',
   '{هوية,متجر,إعلانات}', '{هوية,متجر,إعلانات}',
   '0', '6M EGP', 'مبيعات أونلاين شهرية · خلال سنتين',
   '/assets/tawheed-wall-sign.jpg', '/success-stories/tawheed', 'live', 1),

  ('oq', 'OQ Originals', 'مصر', 'يوليو 2020 ← سبتمبر 2021',
   'من صفر لـ مبيعات 280 ألف شهرياً',
   '{"استراتيجية علامة تجارية",شوبيفاي,"التسويق بالأداء"}', '{هوية,متجر,إعلانات}',
   '0', '280K EGP', 'مبيعات شهرية · إجمالي 1.1M EGP في 10 أشهر',
   null, null, 'soon', 2),

  ('s3', 'RugMorph', 'مصر', 'أغسطس 2022 ← يناير 2026',
   'من 35 لـ 250 أوردر يومياً',
   '{شوبيفاي,"التسويق بالأداء"}', '{متجر,إعلانات}',
   '35', '250', 'أوردر يومياً · إجمالي 98M EGP في 46 شهر',
   null, null, 'soon', 3),

  ('s2', 'Surveying Experts', 'السعودية', 'فبراير 2025 ← الآن',
   'من 14 ألف لـ 90 ألف دولار مبيعات شهرياً',
   '{"استراتيجية علامة تجارية",شوبيفاي,"التسويق بالأداء"}', '{هوية,متجر,إعلانات}',
   '14K USD', '90K USD', 'مبيعات شهرية · 740K USD مبيعات مدفوعة في 9 أشهر',
   null, null, 'soon', 4),

  ('smartlaptop', 'Smart Laptop', 'مصر', 'فبراير 2023 ← أغسطس 2024',
   'من صفر لـ 1.7 مليون مبيعات شهرياً',
   '{"استراتيجية علامة تجارية",شوبيفاي,"التسويق بالأداء"}', '{هوية,متجر,إعلانات}',
   '0', '1.7M EGP', 'مبيعات شهرية · 9.3M EGP مبيعات مدفوعة في 16 شهر',
   null, null, 'soon', 5),

  ('kandil', 'Kandil Tires', 'مصر', 'ديسمبر 2024 ← أغسطس 2025',
   '385 ألف مبيعات في أول شهرين',
   '{شوبيفاي,"التسويق بالأداء"}', '{متجر,إعلانات}',
   '0', '385K EGP', 'مبيعات أول شهرين · عائد 4x',
   null, null, 'soon', 6),

  ('cairoinsulation', 'Cairo Insulation', 'مصر', 'يونيو 2024 ← نوفمبر 2024',
   'هوية جديدة وعملاء محتملين مؤهلين أكثر',
   '{"استراتيجية علامة تجارية","التسويق بالأداء"}', '{هوية,إعلانات}',
   '1x', '12x', 'عائد على الإنفاق · خلال 6 أشهر',
   null, null, 'soon', 7),

  ('xzone', 'XZone', 'مصر', 'نوفمبر 2021 ← مارس 2022',
   'إطلاق في السوق بـ 2 مليون مبيعات',
   '{"استراتيجية علامة تجارية",شوبيفاي,"التسويق بالأداء"}', '{هوية,متجر,إعلانات}',
   '0', '2M EGP', 'مبيعات · أول 6 أشهر',
   null, null, 'soon', 8),

  ('halley', 'Halley International Schools', 'السعودية', 'مارس 2023 ← نوفمبر 2023',
   'زيادة 30% في تسجيلات الطلاب الجدد',
   '{"استراتيجية علامة تجارية","التسويق بالأداء"}', '{هوية,إعلانات}',
   '0%', '+30%', 'تسجيلات طلاب جدد · عائد 25x',
   null, null, 'soon', 9)
on conflict (slug) do nothing;


insert into public.team_members (name, role, photo_url, accent_rgb, sort_order)
values
  ('عبدالرحمن شطا', 'المؤسس والمدير التنفيذي',
   'https://assets.lightfunnels.com/account-7766/images_library/ccfc296e-dd5f-4abb-a9f8-1210b6f424d5.ak93GsWsX1xTHlZZ5sHcY.webp',
   '140,140,140', 1),
  ('محمد الجاويش', 'مدير المحتوى',
   'https://assets.lightfunnels.com/cdn-cgi/image/width=1080,quality=80,format=auto/https://assets.lightfunnels.com/account-7766/images_library/65f8ab68-2fed-42c6-a5e0-c4594c2489e0.Gawish.png',
   '29,180,216', 2),
  ('عمر حسين', 'مدير فريق التصميم',
   'https://assets.lightfunnels.com/cdn-cgi/image/width=1080,quality=80,format=auto/https://assets.lightfunnels.com/account-7766/images_library/0e988725-52f3-4c34-82c7-8899b952e55b.Omar.png',
   '238,64,55', 3),
  ('معاذ حمدي', 'مدير تسويق', '/assets/team-moaaz.png', '50,172,99', 4)
on conflict do nothing;
