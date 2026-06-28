const { createClient } = require('@supabase/supabase-js');

const admin = createClient(
  'https://pcfatvkupcrryqinvsox.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZmF0dmt1cGNycnlxaW52c294Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1NTQ2MCwiZXhwIjoyMDk4MTMxNDYwfQ.Goqtvwcle8pGKasYeJzEHKC2sJBinHriVvM8akUCyNA',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const content_es = `CARTA DE INTENCION DE COMPRA

En {{ciudad}}, a {{fecha}}, la presente Carta de Intencion establece el interes formal de las partes en llevar adelante una operacion de compraventa de minerales bajo las condiciones que se detallan a continuacion.

PARTES

PARTE COMPRADORA: {{nombre_cliente}}, identificado con RUT/Pasaporte N. {{rut_pasaporte}}, de nacionalidad {{nacionalidad}}, con domicilio en {{pais_cliente}}, en adelante denominado "El Comprador".

PARTE INTERMEDIARIA: DZ METALS, empresa especializada en corretaje de metales y minerales a nivel internacional, en adelante denominada "El Intermediario".

OBJETO

El Comprador manifiesta su interes formal en adquirir el siguiente material:

- Metal / Mineral: {{metal}}
- Cantidad: {{cantidad_kg}} kg
- Precio referencial: USD {{precio_usd}} por kilogramo
- Condiciones de entrega (Incoterms): {{incoterms}}
- Forma de pago: {{forma_pago}}

ALCANCE Y COMPROMISOS

1. La presente Carta de Intencion no constituye un contrato vinculante de compraventa, sino una manifestacion formal de interes por parte del Comprador.

2. El Intermediario se compromete a gestionar la identificacion de proveedores calificados y a presentar una oferta formal (SCO) dentro de un plazo razonable.

3. El Comprador se compromete a mantener la confidencialidad de la informacion recibida durante el proceso de negociacion.

4. Las condiciones definitivas de precio, calidad y entrega seran establecidas en el contrato de compraventa correspondiente, previa verificacion de la mercancia.

5. La presente carta tendra una vigencia de 30 dias calendario desde su firma, prorrogable de mutuo acuerdo entre las partes.

DISPOSICIONES GENERALES

Cualquier controversia que surja de la presente Carta de Intencion sera resuelta de buena fe entre las partes. En caso de no llegar a acuerdo, se someteran a la jurisdiccion de los tribunales competentes del domicilio del Intermediario.

En fe de lo cual, las partes suscriben la presente Carta de Intencion en dos ejemplares de igual valor y efecto.`;

const content_en = `LETTER OF INTENT

In {{ciudad}}, on {{fecha}}, this Letter of Intent sets forth the formal interest of the parties in proceeding with a mineral purchase and sale transaction under the following terms and conditions.

PARTIES

BUYER: {{nombre_cliente}}, identified by RUT/Passport No. {{rut_pasaporte}}, nationality {{nacionalidad}}, domiciled in {{pais_cliente}}, hereinafter referred to as "The Buyer".

INTERMEDIARY: DZ METALS, a company specialized in international metals and minerals brokerage, hereinafter referred to as "The Intermediary".

SUBJECT MATTER

The Buyer formally expresses its interest in acquiring the following material:

- Metal / Mineral: {{metal}}
- Quantity: {{cantidad_kg}} kg
- Reference price: USD {{precio_usd}} per kilogram
- Delivery conditions (Incoterms): {{incoterms}}
- Payment method: {{forma_pago}}

SCOPE AND COMMITMENTS

1. This Letter of Intent does not constitute a binding purchase and sale agreement, but rather a formal expression of interest by the Buyer.

2. The Intermediary commits to identifying qualified suppliers and presenting a formal offer (SCO) within a reasonable timeframe.

3. The Buyer commits to maintaining confidentiality of all information received during the negotiation process.

4. Final conditions of price, quality and delivery shall be established in the corresponding purchase and sale agreement, subject to prior verification of the goods.

5. This letter shall remain valid for 30 calendar days from the date of signing, and may be extended by mutual agreement between the parties.

GENERAL PROVISIONS

Any dispute arising from this Letter of Intent shall be resolved in good faith between the parties. Should no agreement be reached, the parties shall submit to the jurisdiction of the competent courts at the Intermediary's domicile.

In witness whereof, the parties sign this Letter of Intent in two copies of equal value and effect.`;

async function run() {
  const { data, error } = await admin
    .from('document_templates')
    .update({ content_es, content_en })
    .eq('code', 'loi')
    .select('id, code')
    .single();

  if (error) console.error('Error:', error.message);
  else console.log('LOI cargada OK:', data.code);
}

run().catch(console.error);
