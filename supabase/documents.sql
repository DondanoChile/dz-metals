-- Firmantes de DZ Metals
CREATE TABLE IF NOT EXISTS signatories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  position text NOT NULL,
  rut text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Plantillas de documentos
CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name_es text NOT NULL,
  name_en text NOT NULL,
  content_es text NOT NULL DEFAULT '',
  content_en text NOT NULL DEFAULT '',
  fields jsonb NOT NULL DEFAULT '[]',
  has_exclusivity_clause boolean DEFAULT false,
  has_traceability_field boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insert the 7 templates with placeholder content
INSERT INTO document_templates (code, name_es, name_en, has_exclusivity_clause, has_traceability_field, fields) VALUES
('nda', 'Acuerdo de Confidencialidad', 'Non-Disclosure Agreement', false, false, '["fecha","ciudad","duracion_meses"]'),
('loi', 'Carta de Intención', 'Letter of Intent', false, false, '["fecha","ciudad","metal","cantidad_kg","precio_usd","incoterms","forma_pago"]'),
('sco', 'Oferta Corporativa Suave', 'Soft Corporate Offer', false, false, '["fecha","ciudad","metal","pureza","cantidad_kg","precio_usd","incoterms","forma_pago","plazo_entrega"]'),
('ncnda', 'Acuerdo de No Circunvalación y Confidencialidad', 'Non-Circumvention Non-Disclosure Agreement', false, false, '["fecha","ciudad","duracion_meses","territorio"]'),
('mandato_vendedor', 'Contrato de Mandato y Exclusividad — Vendedor', 'Mandate and Exclusivity Agreement — Seller', true, true, '["fecha","ciudad","metal","cantidad_kg","comision_pct","plazo_meses"]'),
('mandato_comprador', 'Contrato de Mandato y Exclusividad — Comprador', 'Mandate and Exclusivity Agreement — Buyer', true, false, '["fecha","ciudad","metal","cantidad_kg","comision_pct","plazo_meses"]'),
('compraventa', 'Contrato de Compraventa', 'Sales and Purchase Agreement', false, false, '["fecha","ciudad","metal","pureza","cantidad_kg","precio_usd","incoterms","forma_pago","plazo_entrega","lugar_entrega"]')
ON CONFLICT (code) DO NOTHING;

-- Documentos generados
CREATE TABLE IF NOT EXISTS generated_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES document_templates(id),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  signatory_id uuid REFERENCES signatories(id),
  language text DEFAULT 'es',
  client_type text DEFAULT 'natural',
  field_values jsonb NOT NULL DEFAULT '{}',
  include_exclusivity boolean DEFAULT false,
  has_traceability boolean DEFAULT false,
  status text DEFAULT 'sent',
  storage_path text,
  sent_at timestamptz DEFAULT now(),
  viewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Storage bucket for generated documents
INSERT INTO storage.buckets (id, name, public) VALUES ('generated-docs', 'generated-docs', false) ON CONFLICT DO NOTHING;
