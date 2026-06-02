import { Employee, Service, ServiceBlock } from './types';
import { LOGO_GLOBE, LOGO_3P } from './assets';

interface KmRow {
  fecha: string;
  servicio: string;
  localidad: string;
  km: number;
}

function zeroPad(n: number) {
  return String(n).padStart(2, '0');
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
  const m = 8;
  const pw = 210;
  const cw = pw - 2 * m;

  // ── TOP HEADER ───────────────────────────────────────────────────────────────
  // Globe logo (left)
  doc.addImage(LOGO_GLOBE, 'JPEG', m, m, 18, 18);

  // "Modelo de Kilómetros y Dietas" (center-ish)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Modelo de Kilómetros y Dietas', m + 22, 19);

  // Código Documento box
  const cdX = 140, cdY = m, cdW = 37, cdH = 14;
  doc.setDrawColor(180);
  doc.setFillColor(255, 220, 0);
  doc.rect(cdX, cdY, cdW, cdH, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(150, 0, 0);
  doc.text('Código Documento', cdX + cdW / 2, cdY + 4, { align: 'center' });
  doc.setFontSize(6);
  doc.setTextColor(0);
  doc.text('MD-ES-SISVG-VA-17', cdX + cdW / 2, cdY + 7.5, { align: 'center' });
  doc.setFontSize(5.5);
  doc.text('Edición: 01', cdX + cdW / 2, cdY + 11, { align: 'center' });

  // 3P logo (right)
  doc.addImage(LOGO_3P, 'JPEG', cdX + cdW + 2, m, 22, 16);

  // ── EMPRESA / ZONA / DELEGACIÓN ──────────────────────────────────────────────
  const r1y = 30;
  doc.setDrawColor(80);
  doc.setLineWidth(0.3);
  // Row box
  doc.rect(m, r1y, cw, 8);
  // Vertical dividers
  doc.line(m + 44, r1y, m + 44, r1y + 8);
  doc.line(m + 44 + 58, r1y, m + 44 + 58, r1y + 8);
  doc.line(m + 44 + 20, r1y, m + 44 + 20, r1y + 8);
  doc.line(m + 44 + 58 + 32, r1y, m + 44 + 58 + 32, r1y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(0);
  doc.text('Empresa', m + 2, r1y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('PROSEGUR SIS', m + 22, r1y + 5);

  doc.setFont('helvetica', 'bold');
  doc.text('Zona', m + 46, r1y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('EQUIPO 1', m + 56, r1y + 5);

  doc.setFont('helvetica', 'bold');
  doc.text('Delegación', m + 105, r1y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('BARCELONA', m + 125, r1y + 5);

  // ── EMPLEADO SECTION ─────────────────────────────────────────────────────────
  const empY = r1y + 10;
  doc.setFillColor(230, 230, 230);
  doc.rect(m, empY, cw, 7, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('EMPLEADO', pw / 2, empY + 4.8, { align: 'center' });

  // Employee header row
  const ehY = empY + 7;
  const eCols = [28, 28, 40, 44, 54];
  const eHdrs = ['Código Empleado', 'Nombre', 'Apellidos', 'Servicio habitual', 'Dirección / localidad'];
  let ecx = m;
  eCols.forEach((w, i) => {
    doc.setFillColor(220, 220, 220);
    doc.rect(ecx, ehY, w, 7, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text(eHdrs[i], ecx + w / 2, ehY + 4.5, { align: 'center' });
    ecx += w;
  });

  // Employee data row
  const edY = ehY + 7;
  ecx = m;
  const eVals = [employee.codigo, employee.nombre, employee.apellidos, employee.servicioHabitual, employee.direccion];
  eCols.forEach((w, i) => {
    doc.setFillColor(144, 238, 144);
    doc.rect(ecx, edY, w, 7, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(eVals[i], ecx + w / 2, edY + 4.8, { align: 'center' });
    ecx += w;
  });

  // ── DESPLAZAMIENTO SECTION ───────────────────────────────────────────────────
  const dispY = edY + 9;
  doc.setFillColor(230, 230, 230);
  doc.rect(m, dispY, cw, 7, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DESPLAZAMIENTO', pw / 2, dispY + 4.8, { align: 'center' });

  // Column widths: Fecha | Servicio | Localidad | Nº Km | Dietas | Tipo | Cantidad | Motivo
  const dCols = [22, 28, 32, 20, 16, 14, 18, 44];
  const dHdrs = ['Fecha', 'Servicio', 'Localidad', 'Nº Kilómetros', 'Dietas', 'Tipo', 'Cantidad', 'Motivo / Observaciones'];
  const dHdrY = dispY + 7;
  let dcx = m;
  dCols.forEach((w, i) => {
    doc.setFillColor(220, 220, 220);
    doc.rect(dcx, dHdrY, w, 8, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text(dHdrs[i], dcx + w / 2, dHdrY + 5, { align: 'center' });
    dcx += w;
  });

  // Build rows from service blocks
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
        km: entry.kilometraje,
      });
    }
  }

  // Sort by date
  rows.sort((a, b) => {
    const [da, ma] = a.fecha.split('/').map(Number);
    const [db, mb] = b.fecha.split('/').map(Number);
    return ma !== mb ? ma - mb : da - db;
  });

  // Data rows
  const rowH = 6;
  const totalDataRows = 30;
  const dataStartY = dHdrY + 8;

  for (let r = 0; r < totalDataRows; r++) {
    const row = rows[r];
    dcx = m;
    const isData = !!row;
    const rowY = dataStartY + r * rowH;
    const vals = row ? [row.fecha, row.servicio, row.localidad, String(row.km), '', '', '', ''] : ['', '', '', '', '', '', '', ''];

    dCols.forEach((w, i) => {
      if (isData) {
        doc.setFillColor(144, 238, 144);
        doc.rect(dcx, rowY, w, rowH, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.text(vals[i], dcx + w / 2, rowY + 4, { align: 'center' });
      } else {
        doc.setFillColor(255, 255, 255);
        doc.rect(dcx, rowY, w, rowH, 'FD');
      }
      dcx += w;
    });
  }

  // ── FIRMA BOXES ──────────────────────────────────────────────────────────────
  const firmaY = dataStartY + totalDataRows * rowH + 4;
  const firmaW = 80, firmaH = 18;
  doc.setLineWidth(0.4);
  doc.rect(m + 20, firmaY, firmaW, firmaH);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Firma Responsable Operativo', m + 20 + firmaW / 2, firmaY + 4, { align: 'center' });

  doc.rect(m + 20 + firmaW + 20, firmaY, firmaW, firmaH);
  doc.text('Firma empleado', m + 20 + firmaW + 20 + firmaW / 2, firmaY + 4, { align: 'center' });

  return doc.output('blob');
}
