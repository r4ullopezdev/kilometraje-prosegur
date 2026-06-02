import { Employee, Service, ServiceBlock, DayEntry } from './types';
import { LOGO_PROSEGUR, SELLO_PROSEGUR } from './assets';

interface PageData {
  fecha: { day: number; month: number; year: number };
  servicio: Service;
  empleado: Employee;
  entry: DayEntry;
}

function zeroPad(n: number) {
  return String(n).padStart(2, '0');
}

function drawInformeDiarioPage(doc: any, data: PageData) {
  const m = 8;
  const pw = 210;

  // ── HEADER ──────────────────────────────────────────────────────────────────
  // Prosegur logo (top-left)
  doc.addImage(LOGO_PROSEGUR, 'JPEG', m, m, 32, 16);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('INFORME DIARIO DE SERVICIOS', pw / 2, 18, { align: 'center' });

  // FECHA box (top-right)
  const fx = 162, fy = m, fw = 40, fh = 20;
  doc.setDrawColor(80);
  doc.setLineWidth(0.4);
  doc.rect(fx, fy, fw, fh);
  // "FECHA" label band
  doc.setFillColor(210, 210, 210);
  doc.rect(fx, fy, fw, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(0);
  doc.text('FECHA', fx + fw / 2, fy + 5, { align: 'center' });
  // vertical dividers
  doc.line(fx + 10, fy + 7, fx + 10, fy + fh);
  doc.line(fx + 22, fy + 7, fx + 22, fy + fh);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const { day, month, year } = data.fecha;
  doc.text(zeroPad(day), fx + 5, fy + 15, { align: 'center' });
  doc.text(zeroPad(month), fx + 16, fy + 15, { align: 'center' });
  doc.text(String(year), fx + 31, fy + 15, { align: 'center' });

  // ── EMPRESA LINE ────────────────────────────────────────────────────────────
  const elY = 33;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Empresa', m, elY);
  doc.line(m + 22, elY, fx - 2, elY);
  doc.setFont('helvetica', 'bold');
  doc.text('PROSEGUR S.I.S', (m + 22 + fx - 2) / 2, elY - 1, { align: 'center' });

  // ── TABLE 1: CENTRO DE TRABAJO / COORDINADOR ────────────────────────────────
  const t1y = 37;
  const t1h1 = 7, t1h2 = 8;
  const half = (pw - 2 * m) / 2;
  doc.setLineWidth(0.4);
  doc.setDrawColor(80);
  // Outer box
  doc.rect(m, t1y, pw - 2 * m, t1h1 + t1h2);
  // Vertical divider
  doc.line(m + half, t1y, m + half, t1y + t1h1 + t1h2);
  // Horizontal header divider
  doc.line(m, t1y + t1h1, pw - m, t1y + t1h1);
  // Header bg
  doc.setFillColor(210, 210, 210);
  doc.rect(m, t1y, half, t1h1, 'F');
  doc.rect(m + half, t1y, half, t1h1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CENTRO DE TRABAJO DE', m + half / 2, t1y + 5, { align: 'center' });
  doc.text('COORDINADOR SR.', m + half + half / 2, t1y + 5, { align: 'center' });
  // Values
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(data.servicio.nombre.toUpperCase(), m + half / 2, t1y + t1h1 + 5.5, { align: 'center' });

  // ── TABLE 2: TURNO / HASTA ──────────────────────────────────────────────────
  const t2y = t1y + t1h1 + t1h2 + 2;
  doc.rect(m, t2y, pw - 2 * m, t1h1 + t1h2);
  doc.line(m + half, t2y, m + half, t2y + t1h1 + t1h2);
  doc.line(m, t2y + t1h1, pw - m, t2y + t1h1);
  doc.setFillColor(210, 210, 210);
  doc.rect(m, t2y, half, t1h1, 'F');
  doc.rect(m + half, t2y, half, t1h1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('TURNO DE TRABAJO DE', m + half / 2, t2y + 5, { align: 'center' });
  doc.text('HASTA', m + half + half / 2, t2y + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(data.entry.entrada, m + half / 2, t2y + t1h1 + 5.5, { align: 'center' });
  doc.text(data.entry.salida, m + half + half / 2, t2y + t1h1 + 5.5, { align: 'center' });

  // ── DETAIL TABLE ─────────────────────────────────────────────────────────────
  const dtY = t2y + t1h1 + t1h2 + 4;
  const cols = [38, 38, 28, 28, 60];
  const hdrs = ['Nº DE VIGIL. DE SEGURIDAD', 'PUESTO DE TRABAJO', 'HORA\nENTRADA', 'HORA SALIDA', 'OBSERVACIONES'];
  const dtHdr = 10, dtRow = 18;
  let cx = m;
  doc.setDrawColor(80);

  // Header cells
  cols.forEach((w, i) => {
    doc.setFillColor(210, 210, 210);
    doc.rect(cx, dtY, w, dtHdr, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    if (hdrs[i].includes('\n')) {
      const parts = hdrs[i].split('\n');
      doc.text(parts[0], cx + w / 2, dtY + 4, { align: 'center' });
      doc.text(parts[1], cx + w / 2, dtY + 7.5, { align: 'center' });
    } else {
      doc.text(hdrs[i], cx + w / 2, dtY + 5.5, { align: 'center' });
    }
    cx += w;
  });

  // Data row
  cx = m;
  const vals = [data.empleado.codigo, '', data.entry.entrada, data.entry.salida, 'SIN NOVEDAD'];
  cols.forEach((w, i) => {
    doc.rect(cx, dtY + dtHdr, w, dtRow);
    doc.setFont('helvetica', i < 4 ? 'bold' : 'normal');
    doc.setFontSize(9);
    doc.text(vals[i], cx + w / 2, dtY + dtHdr + dtRow / 2 + 1, { align: 'center' });
    cx += w;
  });

  // Extra empty rows
  for (let r = 0; r < 2; r++) {
    cx = m;
    cols.forEach(w => {
      doc.rect(cx, dtY + dtHdr + dtRow * (r + 1), w, dtRow);
      cx += w;
    });
  }

  // ── INCIDENCIAS ──────────────────────────────────────────────────────────────
  const incY = dtY + dtHdr + dtRow * 3 + 4;
  doc.setFillColor(210, 210, 210);
  doc.rect(m, incY, pw - 2 * m, 8, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('INCIDENCIAS', pw / 2, incY + 5.5, { align: 'center' });

  const incBox = incY + 8;
  const incBoxH = 297 - m - incBox;
  doc.rect(m, incBox, pw - 2 * m, incBoxH);

  // Highlight boxes for times
  const hlW = 18, hlH = 6;
  doc.setFillColor(144, 238, 144); // light green
  doc.rect(m + 4, incBox + 6, hlW, hlH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(data.entry.entrada, m + 4 + hlW / 2, incBox + 6 + 4.2, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.text('INICIO SERVICIO', m + 4 + hlW + 4, incBox + 6 + 4.2);

  doc.setFillColor(144, 238, 144);
  doc.rect(m + 4, incBox + 22, hlW, hlH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text(data.entry.salida, m + 4 + hlW / 2, incBox + 22 + 4.2, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.text('FINALIZO SERVICIO', m + 4 + hlW + 4, incBox + 22 + 4.2);

  // Sello Prosegur (stamp) centered in INCIDENCIAS
  const stampSize = 42;
  const stampX = pw / 2 - stampSize / 2;
  const stampY = incBox + 40;
  doc.addImage(SELLO_PROSEGUR, 'JPEG', stampX, stampY, stampSize, stampSize);

  // "Jefe de Equipo"
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Jefe de Equipo', pw - m - 2, 297 - m - 2, { align: 'right' });
}

export async function generateInformeDiario(
  employee: Employee,
  services: Service[],
  serviceBlocks: ServiceBlock[],
  month: number,
  year: number
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc = new jsPDF('portrait', 'mm', 'a4');
  let firstPage = true;

  for (const block of serviceBlocks) {
    const svc = services.find(s => s.id === block.serviceId);
    if (!svc) continue;

    const workedDays = block.days.filter(d => d.entrada && d.salida);
    for (const entry of workedDays) {
      if (!firstPage) doc.addPage();
      firstPage = false;

      drawInformeDiarioPage(doc, {
        fecha: { day: entry.day, month, year },
        servicio: svc,
        empleado: employee,
        entry,
      });
    }
  }

  if (firstPage) {
    // No days worked — add empty page
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('Sin días registrados', 105, 148, { align: 'center' });
  }

  return doc.output('blob');
}
