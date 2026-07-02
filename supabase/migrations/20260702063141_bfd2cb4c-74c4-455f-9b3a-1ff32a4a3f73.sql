
CREATE TABLE public.access_config (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.access_config TO anon, authenticated;
GRANT ALL ON public.access_config TO service_role;

ALTER TABLE public.access_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read access config"
  ON public.access_config FOR SELECT
  USING (true);

CREATE POLICY "Anyone can upsert access config"
  ON public.access_config FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update access config"
  ON public.access_config FOR UPDATE
  USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.access_config;

INSERT INTO public.access_config (id, data) VALUES ('global', '{}'::jsonb)
  ON CONFLICT (id) DO NOTHING;
