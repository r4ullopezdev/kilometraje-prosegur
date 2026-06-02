import { Employee, Service, ServiceBlock } from './types';
import { LOGO_GLOBE, LOGO_3P } from './assets';

function zeroPad(n: number) {
  return String(n).padStart(2, '0');
}

// Draw a bordered cell with optional gray header background
function cell(
  doc: any,
  x: number, y: number, w: number, h: number,
  text: string,
  opts: {
    bold?: boolean;
    fontSize?: number;
    align?: 'left' | 'center' | 'right';
    headerBg?: boolean;   // gray background for label rows
    paddingLeft?: number;
  } = {}
) {
  const { bold = false, fontSize = 7, align = 'center', headerBg = false, paddingLeft = 2 } = opts;

  if (headerBg) {
    doc.setFillColor(210, 210, 210);
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
  await import('jspdf-autotable');

  const doc = new jsPDF('portrait', 'mm', 'a4');
  const m = 8;          // margin
  const pw = 210;       // page width
  const cw = pw - 2 * m; // content width = 194

  doc.setDrawColor(80);
  doc.setLineWidth(0.3);

  // ══════════════════════════════════════════════════════
  // TOP HEADER ROW
  // ══════════════════════════════════════════════════════
  let y = m;
  const hdrH = 20;

  // Globe logo box (left)
  const logoW = 20;
  doc.setFillColor(255, 255, 255);
  doc.rect(m, y, logoW, hdrH, 'FD');
  doc.addImage(LOGO_GLOBE, 'JPEG', m + 1, y + 1, logoW - 2, hdrH - 2);

  // Title (center area)
  const cdW = 38; // Código Documento box width
  const logo3pW = 18;
  const titleW = cw - logoW - cdW - logo3pW;
  const titleX = m + logoW;
  doc.setFillColor(255, 255, 255);
  doc.rect(titleX, y, titleW, hdrH, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text('Modelo de Kilómetros y Dietas', titleX + titleW / 2, y + hdrH / 2 + 2, { align: 'center' });

  // Código Documento box (yellow background)
  const cdX = titleX + titleW;
  doc.setFillColor(255, 215, 0);
  doc.rect(cdX, y, cdW, hdrH, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(180, 0, 0);
  doc.text('Código Documento', cdX + cdW / 2, y + 5, { align: 'center' });
  doc.setFontSize(6);
  doc.setTextColor(0);
  doc.text('MD-ES-SISVG-VA-17', cdX + cdW / 2, y + 9.5, { align: 'center' });
  doc.text('Edición: 01', cdX + cdW / 2, y + 14, { align: 'center' });

  // 3P logo box
  const logo3pX = cdX + cdW;
  doc.setFillColor(255, 255, 255);
  doc.rect(logo3pX, y, logo3pW, hdrH, 'FD');
  doc.addImage(LOGO_3P, 'JPEG', logo3pX + 1, y + 2, logo3pW - 2, hdrH - 4);

  // ══════════════════════════════════════════════════════
  // EMPRESA / ZONA / DELEGACIÓN ROW
  // ══════════════════════════════════════════════════════
  y += hdrH;
  const empresaH = 8;

  // Columns: [Empresa label | Empresa value | Zona label | Zona value | Delegación label | Delegación value]
  // Widths: 16 | 50 | 12 | 36 | 20 | 60  → total 194 ✓
  const empCols = [
    { w: 16, text: 'Empresa', bold: true, align: 'left' as const },
    { w: 50, text: 'PROSEGUR SIS', bold: false, align: 'left' as const },
    { w: 12, text: 'Zona', bold: true, align: 'left' as const },
    { w: 36, text: 'EQUIPO 1', bold: false, align: 'left' as const },
    { w: 22, text: 'Delegación', bold: true, align: 'left' as const },
    { w: 58, text: 'BARCELONA', bold: false, align: 'left' as const },
  ];
  let cx = m;
  empCols.forEach(col => {
    cell(doc, cx, y, col.w, empresaH, col.text, { bold: col.bold, align: col.align, fontSize: 7.5 });
    cx += col.w;
  });

  // ══════════════════════════════════════════════════════
  // EMPLEADO SECTION
  // ══════════════════════════════════════════════════════
  y += empresaH + 2;

  // "EMPLEADO" header band
  const sectionHdrH = 7;
  doc.setFillColor(210, 210, 210);
  doc.rect(m, y, cw, sectionHdrH, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0);
  doc.text('EMPLEADO', pw / 2, y + sectionHdrH / 2 + 1.5, { align: 'center' });

  y += sectionHdrH;

  // Employee table columns: Código | Nombre | Apellidos | Servicio habitual | Dirección/localidad
  // Widths: 28 | 28 | 44 | 50 | 44 = 194 ✓
  const empTableCols = [
    { w: 28, header: 'Código Empleado', value: employee.codigo },
    { w: 28, header: 'Nombre', value: employee.nombre },
    { w: 44, header: 'Apellidos', value: employee.apellidos },
    { w: 50, header: 'Servicio habitual', value: employee.servicioHabitual },
    { w: 44, header: 'Dirección / localidad', value: employee.direccion },
  ];
  const empRowH = 7;

  // Headers
  cx = m;
  empTableCols.forEach(col => {
    cell(doc, cx, y, col.w, empRowH, col.header, { bold: true, fontSize: 6.5, headerBg: true });
    cx += col.w;
  });
  y += empRowH;

  // Data row
  cx = m;
  empTableCols.forEach(col => {
    cell(doc, cx, y, col.w, empRowH, col.value, { bold: false, fontSize: 7.5 });
    cx += col.w;
  });
  y += empRowH + 2;

  // ══════════════════════════════════════════════════════
  // DESPLAZAMIENTO SECTION
  // ══════════════════════════════════════════════════════

  // "DESPLAZAMIENTO" header band
  doc.setFillColor(210, 210, 210);
  doc.rect(m, y, cw, sectionHdrH, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DESPLAZAMIENTO', pw / 2, y + sectionHdrH / 2 + 1.5, { align: 'center' });

  y += sectionHdrH;

  // Columns: Fecha | Servicio | Localidad | Nº Kilómetros | Dietas | Tipo | Cantidad | Motivo
  // Widths: 22 | 26 | 32 | 22 | 16 | 14 | 18 | 44 = 194 ✓
  const dispCols = [
    { w: 22, header: 'Fecha' },
    { w: 26, header: 'Servicio' },
    { w: 32, header: 'Localidad' },
    { w: 22, header: 'Nº Kilómetros' },
    { w: 16, header: 'Dietas' },
    { w: 14, header: 'Tipo' },
    { w: 18, header: 'Cantidad' },
    { w: 44, header: 'Motivo / Observaciones' },
  ];
  const dispHdrH = 8;

  // Column headers
  cx = m;
  dispCols.forEach(col => {
    cell(doc, cx, y, col.w, dispHdrH, col.header, { bold: true, fontSize: 6, headerBg: true });
    cx += col.w;
  });
  y += dispHdrH;

  // Build data rows from service blocks
  interface KmRow { fecha: string; servicio: string; localidad: string; km: string }
  const rows: KmRow[] = [];

  for (const block of serviceBlocks) {
    const svc = services.find(s => s.id === block.serviceId);
    if (!svc) continue;
    const workedDays = block.days.filter(d => d.entrada && d.salida);
    for (const entry of workedDays) {
      rows.push({
        fecha: `${zeroPad(entry.day)}/${zeroPad(month)}/${year}`,
        servicio: svc.nombre,
        localidad: svc.localidad,
        km: String(entry.kilometraje),
      });
    }
  }

  // Sort by date
  rows.sort((a, b) => {
    const [da, ma] = a.fecha.split('/').map(Number);
    const [db, mb] = b.fecha.split('/').map(Number);
    return ma !== mb ? ma - mb : da - db;
  });

  const dataRowH = 6;
  const TOTAL_ROWS = 30;

  for (let r = 0; r < TOTAL_ROWS; r++) {
    const row = rows[r];
    const rowVals = row
      ? [row.fecha, row.servicio, row.localidad, row.km, '', '', '', '']
      : ['', '', '', '', '', '', '', ''];

    cx = m;
    dispCols.forEach((col, i) => {
      cell(doc, cx, y, col.w, dataRowH, rowVals[i], { fontSize: 7 });
      cx += col.w;
    });
    y += dataRowH;
  }

  // ══════════════════════════════════════════════════════
  // FIRMA BOXES
  // ══════════════════════════════════════════════════════
  y += 4;
  const firmaW = 76;
  const firmaH = 20;
  const firmaGap = 30;
  const firmaStartX = m + 10;

  doc.setLineWidth(0.4);
  doc.setDrawColor(80);
  doc.rect(firmaStartX, y, firmaW, firmaH);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Firma Responsable Operativo', firmaStartX + firmaW / 2, y + 5, { align: 'center' });

  const firma2X = firmaStartX + firmaW + firmaGap;
  doc.rect(firma2X, y, firmaW, firmaH);
  doc.text('Firma empleado', firma2X + firmaW / 2, y + 5, { align: 'center' });

  return doc.output('blob');
}
