
CREATE POLICY "Public read project-media" ON storage.objects FOR SELECT USING (bucket_id = 'project-media');
CREATE POLICY "Admins write project-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update project-media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'project-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete project-media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read news-media" ON storage.objects FOR SELECT USING (bucket_id = 'news-media');
CREATE POLICY "Admins write news-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'news-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update news-media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'news-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete news-media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'news-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read story-photos" ON storage.objects FOR SELECT USING (bucket_id = 'story-photos');
CREATE POLICY "Admins write story-photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'story-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update story-photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'story-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete story-photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'story-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read child-photos" ON storage.objects FOR SELECT USING (bucket_id = 'child-photos');
CREATE POLICY "Admins write child-photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'child-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update child-photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'child-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete child-photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'child-photos' AND public.has_role(auth.uid(), 'admin'));
