import { prisma } from '@/lib/prisma';
import { formatDate, formatCurrency } from '@/lib/utils';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface CourtFilingData {
  caseId: string;
  userId: string;
  filingType: 'PAYMENT_ORDER' | 'SMALL_CLAIM' | 'REGULAR_CLAIM';
}

// Lithuanian court codes
export const COURT_CODES = {
  vilnius_district: { code: 'VRT', name: 'Vilniaus miesto apylinkės teismas' },
  kaunas_district: { code: 'KRT', name: 'Kauno apylinkės teismas' },
  klaipeda_district: { code: 'KLT', name: 'Klaipėdos apylinkės teismas' },
  siauliai_district: { code: 'SRT', name: 'Šiaulių apylinkės teismas' },
  panevezys_district: { code: 'PRT', name: 'Panevėžio apylinkės teismas' },
};

// Court fee calculation for small claims
export function calculateCourtFee(claimAmount: number): number {
  // Lithuanian court fees for civil cases (simplified)
  // These are approximate values for small claims
  if (claimAmount <= 290) {
    return 14; // Minimum fee
  } else if (claimAmount <= 580) {
    return 28;
  } else if (claimAmount <= 1450) {
    return 43;
  } else if (claimAmount <= 2900) {
    return 72;
  } else {
    return Math.min(Math.round(claimAmount * 0.03), 145); // 3% up to max 145 EUR for small claims
  }
}

// Payment Order (Teismo įsakymas) generator
export async function generatePaymentOrder(
  data: CourtFilingData
): Promise<{
  content: string;
  xmlContent: string;
  courtFee: number;
  courtCode: string;
  courtName: string;
}> {
  const caseData = await prisma.case.findFirst({
    where: { id: data.caseId, userId: data.userId },
    include: {
      user: true,
      documents: true,
    },
  });

  if (!caseData) {
    throw new Error('Case not found');
  }

  const courtFee = calculateCourtFee(Number(caseData.claimAmount));

  // Determine court based on opponent location (simplified - default to Vilnius)
  const court = COURT_CODES.vilnius_district;

  // Generate the payment order content
  const content = `
================================================================================
                           PRAŠYMAS IŠDUOTI TEISMO ĮSAKYMĄ
                   (Civilinio proceso kodekso 431-439 straipsniai)
================================================================================

${court.name}

KREDITORIUS (Pareiškėjas):
Vardas, pavardė: ${caseData.user.name || '[Vardas Pavardė]'}
Asmens kodas: ${caseData.user.personalCode || '[Asmens kodas]'}
Gyvenamoji vieta: [Adresas]
Telefonas: ${caseData.user.phone || '[Telefonas]'}
El. paštas: ${caseData.user.email}

SKOLININKAS:
Vardas, pavardė / Pavadinimas: ${caseData.opponentName || '[Skolininko vardas]'}
${caseData.opponentType === 'COMPANY' ? 'Įmonės kodas:' : 'Asmens kodas:'} [Kodas]
Adresas: ${caseData.opponentAddress || '[Skolininko adresas]'}

--------------------------------------------------------------------------------
                              REIKALAVIMAS
--------------------------------------------------------------------------------

Prašau išduoti teismo įsakymą, kuriuo būtų priteista iš skolininko:

1. Pagrindinė skola: ${formatCurrency(Number(caseData.claimAmount))}

2. Procesinis 5 proc. dydžio metinės palūkanos nuo ${formatCurrency(Number(caseData.claimAmount))}
   sumos nuo bylos iškėlimo teisme dienos iki teismo sprendimo visiško įvykdymo.

3. Bylinėjimosi išlaidos.

--------------------------------------------------------------------------------
                           REIKALAVIMO PAGRINDAS
--------------------------------------------------------------------------------

${caseData.description}

Įvykio data: ${caseData.incidentDate ? formatDate(caseData.incidentDate) : '[Data]'}

TEISINIS PAGRINDAS:
- Lietuvos Respublikos civilinio kodekso 6.245 str. (sutartinė atsakomybė)
- Lietuvos Respublikos civilinio kodekso 6.37 str. (prievolių vykdymas)
- Lietuvos Respublikos civilinio proceso kodekso 431-439 str. (teismo įsakymas)

--------------------------------------------------------------------------------
                              PRIDEDAMI DOKUMENTAI
--------------------------------------------------------------------------------

${caseData.documents.map((doc, i) => `${i + 1}. ${doc.fileName} (${doc.documentType})`).join('\n') || '1. [Dokumentų sąrašas]'}

--------------------------------------------------------------------------------

Žyminis mokestis: ${formatCurrency(courtFee)}

Patvirtinu, kad:
- Reikalavimas grindžiamas rašytiniais įrodymais
- Reikalavimas nėra ginčijamas
- Skolininko gyvenamoji/buveinės vieta yra žinoma

Data: ${formatDate(new Date())}

Pareiškėjas: ____________________
             (parašas)

================================================================================
              Dokumentas sugeneruotas Teisės Draugas platforma
================================================================================
`;

  // Generate LITEKO-compatible XML
  const xmlContent = generateLitekoXml(caseData, court, courtFee, 'PAYMENT_ORDER');

  // Create court filing record
  const courtFiling = await prisma.courtFiling.create({
    data: {
      caseId: data.caseId,
      filingType: 'PAYMENT_ORDER',
      content,
      xmlContent,
      courtCode: court.code,
      courtName: court.name,
      courtFee,
      status: 'DRAFT',
    },
  });

  // Create timeline event
  await prisma.timelineEvent.create({
    data: {
      caseId: data.caseId,
      eventType: 'COURT_FILING_PREPARED',
      title: 'Teismo dokumentai paruošti',
      description: 'Paruoštas prašymas išduoti teismo įsakymą',
      icon: 'gavel',
      color: 'purple',
    },
  });

  return {
    content,
    xmlContent,
    courtFee,
    courtCode: court.code,
    courtName: court.name,
  };
}

// Generate LITEKO-compatible XML
function generateLitekoXml(
  caseData: any,
  court: { code: string; name: string },
  courtFee: number,
  filingType: string
): string {
  // This is a simplified XML structure
  // In production, this would follow the exact LITEKO schema
  return `<?xml version="1.0" encoding="UTF-8"?>
<CourtFiling xmlns="http://www.e.teismas.lt/schema/filing">
  <Header>
    <FilingType>${filingType}</FilingType>
    <Court>
      <Code>${court.code}</Code>
      <Name>${court.name}</Name>
    </Court>
    <SubmissionDate>${new Date().toISOString()}</SubmissionDate>
  </Header>
  <Applicant>
    <Name>${caseData.user.name || ''}</Name>
    <PersonalCode>${caseData.user.personalCode || ''}</PersonalCode>
    <Email>${caseData.user.email}</Email>
    <Phone>${caseData.user.phone || ''}</Phone>
  </Applicant>
  <Respondent>
    <Name>${caseData.opponentName || ''}</Name>
    <Type>${caseData.opponentType || 'INDIVIDUAL'}</Type>
    <Address>${caseData.opponentAddress || ''}</Address>
  </Respondent>
  <Claim>
    <Amount currency="EUR">${caseData.claimAmount}</Amount>
    <Description><![CDATA[${caseData.description}]]></Description>
    <IncidentDate>${caseData.incidentDate?.toISOString().split('T')[0] || ''}</IncidentDate>
  </Claim>
  <Fees>
    <CourtFee currency="EUR">${courtFee}</CourtFee>
  </Fees>
  <Documents>
    ${caseData.documents.map((doc: any) => `
    <Document>
      <Name>${doc.fileName}</Name>
      <Type>${doc.documentType}</Type>
      <Path>${doc.filePath}</Path>
    </Document>`).join('')}
  </Documents>
</CourtFiling>`;
}

// Generate PDF for court filing
export async function generateCourtFilingPdf(
  courtFilingId: string,
  userId: string
): Promise<Uint8Array> {
  const courtFiling = await prisma.courtFiling.findFirst({
    where: { id: courtFilingId },
    include: {
      case: {
        include: { user: true },
      },
    },
  });

  if (!courtFiling || courtFiling.case.userId !== userId) {
    throw new Error('Court filing not found');
  }

  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;
  const lineHeight = 14;

  // Helper function to add text
  const addText = (text: string, options: { bold?: boolean; size?: number } = {}) => {
    const fontSize = options.size || 11;
    const currentFont = options.bold ? boldFont : font;

    // Split long lines
    const words = text.split(' ');
    let line = '';
    const maxWidth = width - 2 * margin;

    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const textWidth = currentFont.widthOfTextAtSize(testLine, fontSize);

      if (textWidth > maxWidth) {
        page.drawText(line, {
          x: margin,
          y,
          size: fontSize,
          font: currentFont,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight;
        line = word;
      } else {
        line = testLine;
      }
    }

    if (line) {
      page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font: currentFont,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    }
  };

  // Add title
  addText('PRAŠYMAS IŠDUOTI TEISMO ĮSAKYMĄ', { bold: true, size: 14 });
  y -= lineHeight;

  // Add court name
  addText(courtFiling.courtName || 'Apylinkės teismas', { bold: true, size: 12 });
  y -= lineHeight * 2;

  // Add content (simplified - in production would parse the content properly)
  const lines = courtFiling.content.split('\n');
  for (const line of lines) {
    if (line.trim()) {
      addText(line.trim());
    } else {
      y -= lineHeight / 2;
    }

    if (y < margin) {
      // Add new page if needed
      const newPage = pdfDoc.addPage([595.28, 841.89]);
      y = height - margin;
    }
  }

  // Add footer
  y = margin + 30;
  addText('Dokumentas sugeneruotas Teisės Draugas platforma', { size: 9 });
  addText(`Data: ${formatDate(new Date())}`, { size: 9 });

  return pdfDoc.save();
}

// Submit filing to e.teismas (stub)
export async function submitToETeismas(
  courtFilingId: string,
  userId: string,
  signatureMethod: 'smart-id' | 'mobile-id'
): Promise<{ success: boolean; courtRef?: string; error?: string }> {
  const courtFiling = await prisma.courtFiling.findFirst({
    where: { id: courtFilingId },
    include: { case: true },
  });

  if (!courtFiling || courtFiling.case.userId !== userId) {
    throw new Error('Court filing not found');
  }

  if (courtFiling.status !== 'READY_TO_SIGN' && courtFiling.status !== 'SIGNED') {
    return { success: false, error: 'Filing must be ready to sign' };
  }

  // In development, simulate successful submission
  if (process.env.NODE_ENV === 'development') {
    const courtRef = `LT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    await prisma.courtFiling.update({
      where: { id: courtFilingId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        courtRef,
        signatureMethod,
        signedAt: new Date(),
      },
    });

    await prisma.case.update({
      where: { id: courtFiling.caseId },
      data: {
        status: 'FILED',
        courtCaseNumber: courtRef,
        filingDate: new Date(),
      },
    });

    await prisma.timelineEvent.create({
      data: {
        caseId: courtFiling.caseId,
        eventType: 'COURT_FILING_SUBMITTED',
        title: 'Dokumentai pateikti teismui',
        description: `Byla pateikta teismui. Bylos numeris: ${courtRef}`,
        icon: 'check-circle',
        color: 'green',
      },
    });

    return { success: true, courtRef };
  }

  // Production implementation would integrate with e.teismas LITEKO API
  const eTeismasApiUrl = process.env.E_TEISMAS_API_URL;
  const apiKey = process.env.E_TEISMAS_API_KEY;

  if (!eTeismasApiUrl || !apiKey) {
    return { success: false, error: 'e.teismas configuration missing' };
  }

  // TODO: Implement actual e.teismas API integration
  // 1. Authenticate with Smart-ID/Mobile-ID
  // 2. Sign the document digitally
  // 3. Submit to LITEKO system
  // 4. Get confirmation and case number

  return { success: false, error: 'Production integration not yet implemented' };
}
