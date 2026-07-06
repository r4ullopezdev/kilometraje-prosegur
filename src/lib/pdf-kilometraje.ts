import { Employee, Service, ServiceBlock } from './types';
import { LOGO_GLOBE, LOGO_3P } from './assets';

function zeroPad(n: number) {
  return String(n).padStart(2, '0');
}

function cell(
  doc: any,
  x: number, y: number, w: number, h: number,
  text: string,
  opts: {
    bold?: boolean;
    fontSize?: number;
    align?: 'left' | 'center' | 'right';
    fillColor?: [number, number, number];
    paddingLeft?: number;
  } = {}
) {
  const { bold = false, fontSize = 7, align = 'center', fillColor, paddingLeft = 2 } = opts;

  doc.setDrawColor(80);
  doc.setLineWidth(0.25);

  if (fillColor) {
    doc.setFillColor(...fillColor);
    doc.rect(x, y, w, h, 'FD');
  } else {
    doc.setFillColor(255, 255, 255);
    doc.rect(x, y, w, h, 'FD');
  }

  if (!text) return;

  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setFontSize(fontSize);
  doc.setTextColor(0);

  const textY = y + h / 2 + fontSize * 0.18;

  if (align === 'center') {
    doc.text(text, x + w / 2, textY, { align: 'center' });
  } else if (align === 'left') {
    doc.text(text, x + paddingLeft, textY);
  } else {
    doc.text(text, x + w - paddingLeft, textY, { align: 'right' });
  }
}

export async function generateKilometraje(
  employee: Employee,
  services: Service[],
  serviceBlocks: ServiceBlock[],
  month: number,
  year: number
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');

  // A4 landscape: 297mm × 210mm
  const doc = new jsPDF('landscape', 'mm', 'a4');

  const ML = 10;   // left/right margin
  const MT = 8;    // top margin
  const PW = 297;  // page width (landscape)
  const PH = 210;  // page height (landscape)
  const UW = PW - 2 * ML; // usable width = 277mm

  const GRAY_DARK:  [number, number, number] = [180, 180, 180]; // section headers (EMPLEADO / DESPLAZAMIENTO)
  const GRAY_LIGHT: [number, number, number] = [220, 220, 220]; // column header rows
  const AMBER:      [number, number, number] = [255, 192,   0]; // Código Documento + 3P logo background

  // ══════════════════════════════════════════════════════════════════
  // HEADER  (logos + title + código documento)
  // ══════════════════════════════════════════════════════════════════
  let y = MT;
  const HDR_H = 18;

  // Globe logo (left)
  const LOGO_W = 20;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(80);
  doc.setLineWidth(0.25);
  doc.rect(ML, y, LOGO_W, HDR_H, 'FD');
  doc.addImage(LOGO_GLOBE, 'JPEG', ML + 1, y + 1, LOGO_W - 2, HDR_H - 2);

  // Title (center)
  const COD_W = 42;
  const P3_W  = 22;
  const TITLE_W = UW - LOGO_W - COD_W - P3_W;
  const TITLE_X = ML + LOGO_W;
  doc.setFillColor(255, 255, 255);
  doc.rect(TITLE_X, y, TITLE_W, HDR_H, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(
    'Modelo de Kilometrajes, Traslados y Dietas',
    TITLE_X + TITLE_W / 2,
    y + HDR_H / 2 + 2,
    { align: 'center' }
  );

  // Código Documento box (amber)
  const COD_X = TITLE_X + TITLE_W;
  doc.setFillColor(...AMBER);
  doc.rect(COD_X, y, COD_W, HDR_H, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(0);
  doc.text('Código Documento', COD_X + COD_W / 2, y + 5,    { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('MD-ES-SISVG-VA-17',  COD_X + COD_W / 2, y + 9.5, { align: 'center' });
  doc.text('Edición: 01',        COD_X + COD_W / 2, y + 14,  { align: 'center' });

  // 3P logo box (amber background)
  const P3_X = COD_X + COD_W;
  doc.setFillColor(...AMBER);
  doc.rect(P3_X, y, P3_W, HDR_H, 'FD');
  doc.addImage(LOGO_3P, 'JPEG', P3_X + 1, y + 1, P3_W - 2, HDR_H - 2);
  doc.setDrawColor(80);
  doc.rect(P3_X, y, P3_W, HDR_H);

  y += HDR_H;

  // ══════════════════════════════════════════════════════════════════
  // EMPRESA ROW  (8 alternating label/value cells)
  // ══════════════════════════════════════════════════════════════════
  const EMP_H = 6;
  const E1 = 20, E2 = 42, E3 = 28, E4 = 20, E5 = 25, E6 = 30, E7 = 28;
  const E8 = UW - E1 - E2 - E3 - E4 - E5 - E6 - E7; // remaining ≈ 84 mm

  let ex = ML;
  cell(doc, ex, y, E1, EMP_H, 'Empresa',            { bold: true, fontSize: 7, fillColor: GRAY_LIGHT }); ex += E1;
  cell(doc, ex, y, E2, EMP_H, 'PROSEGUR SIS ESPAÑA',{ fontSize: 7 }); ex += E2;
  cell(doc, ex, y, E3, EMP_H, 'Zona Gerencial',     { bold: true, fontSize: 7, fillColor: GRAY_LIGHT }); ex += E3;
  cell(doc, ex, y, E4, EMP_H, 'ESTE',               { fontSize: 7 }); ex += E4;
  cell(doc, ex, y, E5, EMP_H, 'Delegación',         { bold: true, fontSize: 7, fillColor: GRAY_LIGHT }); ex += E5;
  cell(doc, ex, y, E6, EMP_H, 'BARCELONA',          { fontSize: 7 }); ex += E6;
  cell(doc, ex, y, E7, EMP_H, 'Zona Operativa',     { bold: true, fontSize: 7, fillColor: GRAY_LIGHT }); ex += E7;
  cell(doc, ex, y, E8, EMP_H, 'ZONA 1 EQUIPO 2',   { fontSize: 7 });

  y += EMP_H + 2;

  // ══════════════════════════════════════════════════════════════════
  // EMPLEADO SECTION
  // ══════════════════════════════════════════════════════════════════
  const SEC_H  = 5.5; // section header height
  const COL_H  = 5.5; // column header row height
  const DATA_H = 5.5; // data row height

  // Section header band
  doc.setFillColor(...GRAY_DARK);
  doc.setDrawColor(80);
  doc.setLineWidth(0.25);
  doc.rect(ML, y, UW, SEC_H, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0);
  doc.text('EMPLEADO', PW / 2, y + SEC_H / 2 + 1.5, { align: 'center' });
  y += SEC_H;

  // Column headers
  const C1 = 35, C2 = 40, C3 = 50, C4 = 65;
  const C5 = UW - C1 - C2 - C3 - C4; // ≈ 87 mm
  let hx = ML;
  cell(doc, hx, y, C1, COL_H, 'Código Empleado',       { bold: true, fontSize: 6.5, fillColor: GRAY_LIGHT }); hx += C1;
  cell(doc, hx, y, C2, COL_H, 'Nombre',                { bold: true, fontSize: 6.5, fillColor: GRAY_LIGHT }); hx += C2;
  cell(doc, hx, y, C3, COL_H, 'Apellidos',             { bold: true, fontSize: 6.5, fillColor: GRAY_LIGHT }); hx += C3;
  cell(doc, hx, y, C4, COL_H, 'Servicio habitual',     { bold: true, fontSize: 6.5, fillColor: GRAY_LIGHT }); hx += C4;
  cell(doc, hx, y, C5, COL_H, 'Dirección / localidad', { bold: true, fontSize: 6.5, fillColor: GRAY_LIGHT });
  y += COL_H;

  // Employee data row
  hx = ML;
  cell(doc, hx, y, C1, DATA_H, employee.codigo,          { fontSize: 7 }); hx += C1;
  cell(doc, hx, y, C2, DATA_H, employee.nombre,          { fontSize: 7 }); hx += C2;
  cell(doc, hx, y, C3, DATA_H, employee.apellidos,       { fontSize: 7 }); hx += C3;
  cell(doc, hx, y, C4, DATA_H, employee.servicioHabitual,{ fontSize: 7 }); hx += C4;
  cell(doc, hx, y, C5, DATA_H, employee.direccion,       { fontSize: 7 });
  y += DATA_H + 2;

  // ══════════════════════════════════════════════════════════════════
  // DESPLAZAMIENTO SECTION
  // ══════════════════════════════════════════════════════════════════
  const D1 = 22, D2 = 45, D3 = 35, D4 = 28, D5 = 22, D6 = 22, D7 = 22;
  const D8 = UW - D1 - D2 - D3 - D4 - D5 - D6 - D7; // ≈ 81 mm

  function drawDispHeaders(yPos: number) {
    let dx = ML;
    cell(doc, dx, yPos, D1, COL_H, 'Fecha',                  { bold: true, fontSize: 6.5, fillColor: GRAY_LIGHT }); dx += D1;
    cell(doc, dx, yPos, D2, COL_H, 'Servicio',               { bold: true, fontSize: 6.5, fillColor: GRAY_LIGHT }); dx += D2;
    cell(doc, dx, yPos, D3, COL_H, 'Localidad',              { bold: true, fontSize: 6.5, fillColor: GRAY_LIGHT }); dx += D3;
    cell(doc, dx, yPos, D4, COL_H, 'Nº Kilómetros',          { bold: true, fontSize: 6.5, fillColor: GRAY_LIGHT }); dx += D4;
    cell(doc, dx, yPos, D5, COL_H, 'Dietas',                 { bold: true, fontSize: 6.5, fillColor: GRAY_LIGHT }); dx += D5;
    cell(doc, dx, yPos, D6, COL_H, 'Tipo',                   { bold: true, fontSize: 6.5, fillColor: GRAY_LIGHT }); dx += D6;
    cell(doc, dx, yPos, D7, COL_H, 'Cantidad',               { bold: true, fontSize: 6.5, fillColor: GRAY_LIGHT }); dx += D7;
    cell(doc, dx, yPos, D8, COL_H, 'Motivo / Observaciones', { bold: true, fontSize: 6.5, fillColor: GRAY_LIGHT });
  }

  // Section header band
  doc.setFillColor(...GRAY_DARK);
  doc.rect(ML, y, UW, SEC_H, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0);
  doc.text('DESPLAZAMIENTO', PW / 2, y + SEC_H / 2 + 1.5, { align: 'center' });
  y += SEC_H;

  drawDispHeaders(y);
  y += COL_H;

  // Build one row per worked day across all service blocks
  interface KmRow { fecha: string; servicio: string; localidad: string; km: string }
  const rows: KmRow[] = [];

  for (const block of serviceBlocks) {
    const svc = services.find(s => s.id === block.serviceId);
    if (!svc) continue;
    for (const d of block.days) {
      if (!d.entrada || !d.salida) continue;
      rows.push({
        fecha:    `${zeroPad(d.day)}/${zeroPad(month)}/${year}`,
        servicio: svc.nombre,
        localidad: svc.localidad,
        km:       String(d.kilometraje),
      });
    }
  }

  // Sort chronologically
  rows.sort((a, b) => {
    const [da] = a.fecha.split('/').map(Number);
    const [db] = b.fecha.split('/').map(Number);
    return da - db;
  });

  // Draw data rows — minimum 16, add pages if needed
  const FIRMA_RESERVE = 30; // mm to keep free at bottom for signature boxes
  const totalRows = Math.max(rows.length, 16);

  for (let r = 0; r < totalRows; r++) {
    // New page when approaching bottom
    if (y + DATA_H + FIRMA_RESERVE > PH) {
      doc.addPage();
      y = MT;
      drawDispHeaders(y);
      y += COL_H;
    }

    const row = rows[r];
    let dx = ML;
    cell(doc, dx, y, D1, DATA_H, row?.fecha     ?? '', { fontSize: 7 });                         dx += D1;
    cell(doc, dx, y, D2, DATA_H, row?.servicio  ?? '', { fontSize: 6.5, align: 'left', paddingLeft: 2 }); dx += D2;
    cell(doc, dx, y, D3, DATA_H, row?.localidad ?? '', { fontSize: 6.5, align: 'left', paddingLeft: 2 }); dx += D3;
    cell(doc, dx, y, D4, DATA_H, row?.km        ?? '', { fontSize: 7 });                         dx += D4;
    cell(doc, dx, y, D5, DATA_H, '',                   { fontSize: 7 });                         dx += D5;
    cell(doc, dx, y, D6, DATA_H, '',                   { fontSize: 7 });                         dx += D6;
    cell(doc, dx, y, D7, DATA_H, '',                   { fontSize: 7 });                         dx += D7;
    cell(doc, dx, y, D8, DATA_H, '',                   { fontSize: 7 });
    y += DATA_H;
  }

  // ══════════════════════════════════════════════════════════════════
  // FIRMA BOXES
  // ══════════════════════════════════════════════════════════════════
  y += 4;
  const FIRMA_LABEL_H = 6;
  const FIRMA_BODY_H  = 16;
  const FIRMA_W = (UW - 20) / 2; // two boxes with a 20 mm gap
  const FIRMA_X1 = ML + 10;
  const FIRMA_X2 = FIRMA_X1 + FIRMA_W + 20;

  doc.setDrawColor(80);
  doc.setLineWidth(0.3);

  // Firma 1 — header + body
  doc.setFillColor(...GRAY_LIGHT);
  doc.rect(FIRMA_X1, y, FIRMA_W, FIRMA_LABEL_H, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(0);
  doc.text('Firma Responsable Operativo', FIRMA_X1 + FIRMA_W / 2, y + FIRMA_LABEL_H / 2 + 1.5, { align: 'center' });
  doc.setFillColor(255, 255, 255);
  doc.rect(FIRMA_X1, y + FIRMA_LABEL_H, FIRMA_W, FIRMA_BODY_H, 'FD');

  // Firma 2 — header + body
  doc.setFillColor(...GRAY_LIGHT);
  doc.rect(FIRMA_X2, y, FIRMA_W, FIRMA_LABEL_H, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('Firma empleado', FIRMA_X2 + FIRMA_W / 2, y + FIRMA_LABEL_H / 2 + 1.5, { align: 'center' });
  doc.setFillColor(255, 255, 255);
  doc.rect(FIRMA_X2, y + FIRMA_LABEL_H, FIRMA_W, FIRMA_BODY_H, 'FD');

  return doc.output('blob');
}
