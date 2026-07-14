-- RPC requerida por el nodo "Supabase Vector Store" de n8n (LangChain).
-- Busca en documentos_vectores filtrando por metadata JSONB (p. ej. propiedad_id).

CREATE EXTENSION IF NOT EXISTS vector;

CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding vector(1536),
  match_count int DEFAULT NULL,
  filter jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
#variable_conflict use_column
DECLARE
  v_propiedad_id text;
BEGIN
  v_propiedad_id := trim(filter->>'propiedad_id');

  IF v_propiedad_id IS NULL OR v_propiedad_id = '' THEN
    RAISE EXCEPTION 'match_documents requiere filter.propiedad_id';
  END IF;

  RETURN QUERY
  SELECT
    dv.id,
    dv.content,
    dv.metadata,
    1 - (dv.embedding <=> query_embedding) AS similarity
  FROM public.documentos_vectores dv
  WHERE dv.metadata->>'propiedad_id' = v_propiedad_id
  ORDER BY dv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.match_documents(vector(1536), int, jsonb)
  TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.match_documents(vector(1536), int, jsonb) IS
  'Búsqueda semántica para n8n Supabase Vector Store sobre documentos_vectores.';
