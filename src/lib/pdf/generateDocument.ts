import PDFDocument from "pdfkit";

export interface DocumentTemplate {
  id: string;
  code: string;
  name_es: string;
  name_en: string;
  content_es: string;
  content_en: string;
  fields: string[];
  has_exclusivity_clause: boolean;
  has_traceability_field: boolean;
}

export interface Signatory {
  id: string;
  full_name: string;
  position: string;
  rut?: string;
  signature_url?: string;
}

export interface GenerateDocumentOptions {
  language: "es" | "en" | "both";
  clientType: "natural" | "empresa";
  includeExclusivity: boolean;
  hasTraceability: boolean;
  documentId: string;
}

export interface FieldValues {
  // client natural
  nombre_cliente?: string;
  rut_pasaporte?: string;
  nacionalidad?: string;
  pais_cliente?: string;
  // client empresa
  razon_social?: string;
  rut_empresa?: string;
  representante_legal?: string;
  rut_representante?: string;
  // template fields
  fecha?: string;
  ciudad?: string;
  metal?: string;
  cantidad_kg?: string;
  precio_usd?: string;
  incoterms?: string;
  forma_pago?: string;
  plazo_entrega?: string;
  lugar_entrega?: string;
  duracion_meses?: string;
  territorio?: string;
  comision_pct?: string;
  plazo_meses?: string;
  pureza?: string;
  analysis_lab?: string;
  [key: string]: string | undefined;
}

const FIELD_LABELS_ES: Record<string, string> = {
  fecha: "Fecha",
  ciudad: "Ciudad",
  metal: "Tipo de metal",
  cantidad_kg: "Cantidad (kg)",
  precio_usd: "Precio (USD/kg)",
  incoterms: "Incoterms",
  forma_pago: "Forma de pago",
  plazo_entrega: "Plazo de entrega",
  lugar_entrega: "Lugar de entrega",
  duracion_meses: "Duración (meses)",
  territorio: "Territorio",
  comision_pct: "Comisión (%)",
  plazo_meses: "Plazo del mandato (meses)",
  pureza: "Pureza (%)",
  analysis_lab: "Laboratorio de análisis",
};

const FIELD_LABELS_EN: Record<string, string> = {
  fecha: "Date",
  ciudad: "City",
  metal: "Metal type",
  cantidad_kg: "Quantity (kg)",
  precio_usd: "Price (USD/kg)",
  incoterms: "Incoterms",
  forma_pago: "Payment method",
  plazo_entrega: "Delivery term",
  lugar_entrega: "Place of delivery",
  duracion_meses: "Duration (months)",
  territorio: "Territory",
  comision_pct: "Commission (%)",
  plazo_meses: "Mandate term (months)",
  pureza: "Purity (%)",
  analysis_lab: "Analysis laboratory",
};

function fillTemplate(content: string, fieldValues: FieldValues): string {
  let result = content;
  for (const [key, value] of Object.entries(fieldValues)) {
    if (value) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }
  }
  return result;
}

function buildDocumentBody(
  template: DocumentTemplate,
  fieldValues: FieldValues,
  options: GenerateDocumentOptions,
  language: "es" | "en"
): string {
  const content = language === "es" ? template.content_es : template.content_en;
  const labels = language === "es" ? FIELD_LABELS_ES : FIELD_LABELS_EN;

  if (content && content.trim().length > 0) {
    let filled = fillTemplate(content, fieldValues);

    if (options.includeExclusivity && template.has_exclusivity_clause) {
      if (language === "es") {
        filled +=
          "\n\nCLÁUSULA DE EXCLUSIVIDAD\n\nLas partes acuerdan que el presente mandato tiene carácter exclusivo. El mandante se compromete a no contratar los servicios de otro intermediario para la operación descrita en este contrato durante el período de vigencia del mismo.";
      } else {
        filled +=
          "\n\nEXCLUSIVITY CLAUSE\n\nThe parties agree that this mandate is exclusive in nature. The principal undertakes not to engage any other intermediary for the transaction described in this agreement during its term.";
      }
    }
    if (options.hasTraceability && template.has_traceability_field) {
      if (language === "es") {
        filled +=
          "\n\nTRAZABILIDAD\n\nEl vendedor declara contar con trazabilidad completa del material ofertado, incluyendo documentación de origen, cadena de custodia y certificados de análisis expedidos por laboratorio acreditado.";
      } else {
        filled +=
          "\n\nTRACEABILITY\n\nThe seller declares having complete traceability of the offered material, including documentation of origin, chain of custody and analysis certificates issued by an accredited laboratory.";
      }
    }
    return filled;
  }

  // Fallback: build from fields
  const templateFields = Array.isArray(template.fields) ? template.fields : [];
  const lines: string[] = [];

  if (options.clientType === "natural") {
    const clientName = fieldValues.nombre_cliente ?? "—";
    const rutPasaporte = fieldValues.rut_pasaporte ?? "—";
    const nacionalidad = fieldValues.nacionalidad ?? "—";
    const pais = fieldValues.pais_cliente ?? "—";
    if (language === "es") {
      lines.push(
        `El presente documento ha sido suscrito en ${fieldValues.ciudad ?? "___"}, con fecha ${fieldValues.fecha ?? "___"}.`,
        "",
        `PARTE CONTRATANTE: ${clientName}, identificado con RUT/Pasaporte N° ${rutPasaporte}, de nacionalidad ${nacionalidad}, con domicilio en ${pais}.`,
        "",
        "DZ METALS actúa como intermediario especializado en el corretaje de metales preciosos e industriales a nivel internacional.",
        ""
      );
    } else {
      lines.push(
        `This document has been executed in ${fieldValues.ciudad ?? "___"}, on ${fieldValues.fecha ?? "___"}.`,
        "",
        `CONTRACTING PARTY: ${clientName}, identified with RUT/Passport No. ${rutPasaporte}, nationality ${nacionalidad}, domiciled in ${pais}.`,
        "",
        "DZ METALS acts as a specialized broker in precious and industrial metals at an international level.",
        ""
      );
    }
  } else {
    const razonSocial = fieldValues.razon_social ?? "—";
    const rutEmpresa = fieldValues.rut_empresa ?? "—";
    const representante = fieldValues.representante_legal ?? "—";
    const rutRep = fieldValues.rut_representante ?? "—";
    const pais = fieldValues.pais_cliente ?? "—";
    if (language === "es") {
      lines.push(
        `El presente documento ha sido suscrito en ${fieldValues.ciudad ?? "___"}, con fecha ${fieldValues.fecha ?? "___"}.`,
        "",
        `EMPRESA CONTRATANTE: ${razonSocial}, RUT N° ${rutEmpresa}, representada legalmente por ${representante}, RUT N° ${rutRep}, con domicilio en ${pais}.`,
        "",
        "DZ METALS actúa como intermediario especializado en el corretaje de metales preciosos e industriales a nivel internacional.",
        ""
      );
    } else {
      lines.push(
        `This document has been executed in ${fieldValues.ciudad ?? "___"}, on ${fieldValues.fecha ?? "___"}.`,
        "",
        `CONTRACTING COMPANY: ${razonSocial}, RUT No. ${rutEmpresa}, legally represented by ${representante}, RUT No. ${rutRep}, domiciled in ${pais}.`,
        ""
      );
    }
  }

  for (const field of templateFields) {
    if (field === "fecha" || field === "ciudad") continue;
    const label = labels[field] ?? field;
    const value = fieldValues[field] ?? "—";
    lines.push(`${label}: ${value}`);
  }

  if (options.includeExclusivity && template.has_exclusivity_clause) {
    lines.push("");
    if (language === "es") {
      lines.push(
        "CLÁUSULA DE EXCLUSIVIDAD",
        "",
        "Las partes acuerdan que el presente mandato tiene carácter exclusivo."
      );
    } else {
      lines.push(
        "EXCLUSIVITY CLAUSE",
        "",
        "The parties agree that this mandate is exclusive in nature."
      );
    }
  }

  if (options.hasTraceability && template.has_traceability_field) {
    lines.push("");
    if (language === "es") {
      lines.push(
        "TRAZABILIDAD",
        "",
        "El vendedor declara contar con trazabilidad completa del material ofertado."
      );
    } else {
      lines.push(
        "TRACEABILITY",
        "",
        "The seller declares having complete traceability of the offered material."
      );
    }
  }

  return lines.join("\n");
}

// Colors
const COLOR_GOLD = "#C9A84C";
const COLOR_BLACK = "#1a1a1a";
const COLOR_BODY = "#333333";
const COLOR_MUTED = "#666666";
const COLOR_LIGHT = "#aaaaaa";
const COLOR_DIVIDER = "#e5e5e5";

// Margins
const MARGIN_LEFT = 72;
const MARGIN_RIGHT = 72;
const MARGIN_TOP = 60;
const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89; // A4
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

function bufferFromStream(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

function drawPage(
  doc: InstanceType<typeof PDFDocument>,
  title: string,
  subtitle: string,
  body: string,
  clientName: string,
  signatory: Signatory,
  documentId: string,
  date: string,
  language: "es" | "en",
  signatureImageBuffer?: Buffer
) {
  const pageBottom = PAGE_HEIGHT - 60; // footer area starts here

  // ── HEADER ──────────────────────────────────────────────
  doc.font("Helvetica-Bold")
    .fontSize(20)
    .fillColor(COLOR_BLACK)
    .text("DZ METALS", MARGIN_LEFT, MARGIN_TOP, { characterSpacing: 3 });

  const afterBrand = MARGIN_TOP + 28;
  doc.rect(MARGIN_LEFT, afterBrand, CONTENT_WIDTH, 2).fill(COLOR_GOLD);

  // ── TITLE ────────────────────────────────────────────────
  const afterGold = afterBrand + 20;
  doc.font("Helvetica-Bold")
    .fontSize(14)
    .fillColor(COLOR_BLACK)
    .text(title.toUpperCase(), MARGIN_LEFT, afterGold, {
      width: CONTENT_WIDTH,
      align: "center",
      characterSpacing: 1,
    });

  const afterTitle = afterGold + 22;
  doc.font("Helvetica")
    .fontSize(10)
    .fillColor(COLOR_MUTED)
    .text(subtitle, MARGIN_LEFT, afterTitle, {
      width: CONTENT_WIDTH,
      align: "center",
    });

  const afterSubtitle = afterTitle + 18;
  doc.rect(MARGIN_LEFT, afterSubtitle, CONTENT_WIDTH, 1).fill(COLOR_DIVIDER);

  // ── BODY ─────────────────────────────────────────────────
  let y = afterSubtitle + 20;
  const paragraphs = body.split("\n");

  for (const para of paragraphs) {
    const trimmed = para.trim();

    // Check if it's a section heading (all caps, short)
    const isSectionTitle =
      trimmed.length > 0 &&
      trimmed === trimmed.toUpperCase() &&
      trimmed.length < 80 &&
      !/^\d+\./.test(trimmed); // don't treat numbered clauses as headings

    if (trimmed === "") {
      y += 8;
      continue;
    }

    if (isSectionTitle) {
      // Add spacing before section titles
      if (y > afterSubtitle + 40) y += 8;

      doc.font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(COLOR_BLACK)
        .text(trimmed, MARGIN_LEFT, y, {
          width: CONTENT_WIDTH,
          characterSpacing: 0.8,
        });
      y = doc.y + 6;
    } else {
      doc.font("Helvetica")
        .fontSize(9.5)
        .fillColor(COLOR_BODY)
        .text(para, MARGIN_LEFT, y, {
          width: CONTENT_WIDTH,
          lineGap: 3,
          align: "justify",
        });
      y = doc.y + 5;
    }

    // If we're getting close to the signature area, stop body here
    // (pdfkit handles page breaks automatically via .text() but we need space for signatures)
    if (y > pageBottom - 180) {
      // Let pdfkit continue on a new page
    }
  }

  // ── SIGNATURE SECTION ────────────────────────────────────
  // Ensure enough space; if not, add a page
  const sigY = Math.max(y + 40, pageBottom - 150);

  // Left block: Client
  const leftX = MARGIN_LEFT;
  const rightX = MARGIN_LEFT + CONTENT_WIDTH * 0.55;

  // DZ Metals signature image (right side)
  let sigImageHeight = 0;
  if (signatureImageBuffer) {
    try {
      const imgY = sigY - 50;
      doc.image(signatureImageBuffer, rightX, imgY, {
        fit: [160, 44],
      });
      sigImageHeight = 50;
    } catch {
      // Ignore image errors
    }
  }

  // Signature lines
  const lineY = sigY + sigImageHeight - (signatureImageBuffer ? 6 : 0);
  doc.rect(leftX, lineY, 180, 1).fill(COLOR_BLACK);
  doc.rect(rightX, lineY, 180, 1).fill(COLOR_BLACK);

  // Labels
  const labelY = lineY + 8;
  const clientLabel = language === "es" ? "Firma del cliente" : "Client signature";
  const dzLabel = language === "es" ? "Firma DZ Metals" : "DZ Metals signature";

  doc.font("Helvetica")
    .fontSize(8)
    .fillColor(COLOR_MUTED)
    .text(clientLabel, leftX, labelY)
    .text(dzLabel, rightX, labelY);

  const nameY = labelY + 13;
  doc.font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(COLOR_BLACK)
    .text(clientName, leftX, nameY)
    .text(signatory.full_name, rightX, nameY);

  const roleY = nameY + 13;
  doc.font("Helvetica")
    .fontSize(8)
    .fillColor(COLOR_MUTED)
    .text(signatory.position, rightX, roleY);

  if (signatory.rut) {
    doc.text(`RUT: ${signatory.rut}`, rightX, roleY + 12);
  }

  // ── FOOTER ───────────────────────────────────────────────
  const footerY = PAGE_HEIGHT - 50;
  doc.rect(MARGIN_LEFT, footerY - 8, CONTENT_WIDTH, 1).fill(COLOR_DIVIDER);

  const genLabel = language === "es" ? "Documento generado el" : "Document generated on";
  doc.font("Helvetica")
    .fontSize(7.5)
    .fillColor(COLOR_LIGHT)
    .text(`${genLabel} ${date}`, MARGIN_LEFT, footerY, { width: CONTENT_WIDTH / 2 })
    .text(`ID: ${documentId}`, MARGIN_LEFT + CONTENT_WIDTH / 2, footerY, {
      width: CONTENT_WIDTH / 2,
      align: "right",
    });
}

async function fetchImageBuffer(url: string): Promise<Buffer | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } catch {
    return undefined;
  }
}

export async function generateDocumentPDF(
  template: DocumentTemplate,
  fieldValues: FieldValues,
  signatory: Signatory,
  options: GenerateDocumentOptions
): Promise<Buffer> {
  const clientName =
    options.clientType === "natural"
      ? (fieldValues.nombre_cliente ?? "Cliente")
      : (fieldValues.razon_social ?? "Empresa");

  const dateEs = new Date().toLocaleDateString("es-CL");
  const dateEn = new Date().toLocaleDateString("en-US");

  // Fetch signature image if available
  let signatureBuffer: Buffer | undefined;
  if (signatory.signature_url) {
    signatureBuffer = await fetchImageBuffer(signatory.signature_url);
  }

  const doc = new PDFDocument({
    size: "A4",
    margin: 0,
    autoFirstPage: true,
    bufferPages: true,
  });

  const stream = doc as unknown as NodeJS.ReadableStream;
  const bufferPromise = bufferFromStream(stream);

  if (options.language === "both") {
    const bodyEs = buildDocumentBody(template, fieldValues, options, "es");
    const bodyEn = buildDocumentBody(template, fieldValues, options, "en");

    drawPage(doc, template.name_es, "Documento oficial de DZ Metals", bodyEs, clientName, signatory, options.documentId, dateEs, "es", signatureBuffer);
    doc.addPage();
    drawPage(doc, template.name_en, "Official DZ Metals document", bodyEn, clientName, signatory, options.documentId, dateEn, "en", signatureBuffer);
  } else {
    const lang = options.language;
    const title = lang === "es" ? template.name_es : template.name_en;
    const subtitle = lang === "es" ? "Documento oficial de DZ Metals" : "Official DZ Metals document";
    const body = buildDocumentBody(template, fieldValues, options, lang);
    const date = lang === "es" ? dateEs : dateEn;

    drawPage(doc, title, subtitle, body, clientName, signatory, options.documentId, date, lang, signatureBuffer);
  }

  doc.end();
  return bufferPromise;
}
