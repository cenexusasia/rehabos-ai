-- ============================================
-- RLS Policies: Storage Buckets
-- ============================================
-- exercise-videos     — public read, authenticated write
-- exercise-images     — public read, authenticated write
-- patient-documents   — clinician + patient read, clinician write
-- clinician-uploads   — clinician own files read/write
-- assessment-images   — clinician + patient read, clinician write
-- ============================================

-- ============================================
-- BUCKET: exercise-videos
-- Public read (anyone can view exercise videos)
-- Authenticated users can upload/delete
-- ============================================
CREATE POLICY "Exercise videos are publicly readable"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'exercise-videos'
  );

CREATE POLICY "Authenticated users can upload exercise videos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'exercise-videos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update exercise videos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'exercise-videos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete exercise videos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'exercise-videos'
    AND auth.role() = 'authenticated'
  );

-- ============================================
-- BUCKET: exercise-images
-- Public read (anyone can view exercise images)
-- Authenticated users can upload/delete
-- ============================================
CREATE POLICY "Exercise images are publicly readable"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'exercise-images'
  );

CREATE POLICY "Authenticated users can upload exercise images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'exercise-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update exercise images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'exercise-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete exercise images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'exercise-images'
    AND auth.role() = 'authenticated'
  );

-- ============================================
-- BUCKET: patient-documents
-- Clinicians and patients can read
-- Clinicians can write (upload/update/delete)
-- ============================================
CREATE POLICY "Clinicians and patients can read patient documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'patient-documents'
    AND (
      auth.is_admin()
      OR id::text = auth.clinician_id()
      OR EXISTS (
        SELECT 1 FROM patients p
        WHERE p.clinician_id::text = auth.clinician_id()
          AND p.organization_id::text = auth.org_id()
      )
    )
  );

CREATE POLICY "Clinicians can upload patient documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'patient-documents'
    AND (
      auth.is_admin()
      OR id::text = auth.clinician_id()
    )
  );

CREATE POLICY "Clinicians can update patient documents"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'patient-documents'
    AND (
      auth.is_admin()
      OR id::text = auth.clinician_id()
    )
  );

CREATE POLICY "Clinicians can delete patient documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'patient-documents'
    AND (
      auth.is_admin()
      OR id::text = auth.clinician_id()
    )
  );

-- ============================================
-- BUCKET: clinician-uploads
-- Clinicians can read/write their own files
-- File path convention: {clinician_id}/{filename}
-- ============================================
CREATE POLICY "Clinicians can read their own uploads"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'clinician-uploads'
    AND (
      auth.is_admin()
      OR (storage.foldername(name))[1] = auth.clinician_id()
    )
  );

CREATE POLICY "Clinicians can upload their own files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'clinician-uploads'
    AND (
      auth.is_admin()
      OR (storage.foldername(name))[1] = auth.clinician_id()
    )
  );

CREATE POLICY "Clinicians can update their own uploads"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'clinician-uploads'
    AND (
      auth.is_admin()
      OR (storage.foldername(name))[1] = auth.clinician_id()
    )
  );

CREATE POLICY "Clinicians can delete their own uploads"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'clinician-uploads'
    AND (
      auth.is_admin()
      OR (storage.foldername(name))[1] = auth.clinician_id()
    )
  );

-- ============================================
-- BUCKET: assessment-images
-- Clinicians and patients can read
-- Clinicians can write (upload/update/delete)
-- ============================================
CREATE POLICY "Clinicians and patients can read assessment images"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'assessment-images'
    AND (
      auth.is_admin()
      OR id::text = auth.clinician_id()
      OR EXISTS (
        SELECT 1 FROM patients p
        WHERE p.clinician_id::text = auth.clinician_id()
          AND p.organization_id::text = auth.org_id()
      )
    )
  );

CREATE POLICY "Clinicians can upload assessment images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'assessment-images'
    AND (
      auth.is_admin()
      OR id::text = auth.clinician_id()
    )
  );

CREATE POLICY "Clinicians can update assessment images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'assessment-images'
    AND (
      auth.is_admin()
      OR id::text = auth.clinician_id()
    )
  );

CREATE POLICY "Clinicians can delete assessment images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'assessment-images'
    AND (
      auth.is_admin()
      OR id::text = auth.clinician_id()
    )
  );
