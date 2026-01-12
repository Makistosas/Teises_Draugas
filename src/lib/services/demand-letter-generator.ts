import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { formatDate, calculateDeadline } from '@/lib/utils';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface DemandLetterData {
  caseId: string;
  userId: string;
  tone: 'formal' | 'firm' | 'final_warning';
  responseDeadlineDays?: number;
}

export interface GeneratedDemandLetter {
  content: string;
  legalBasis: string[];
  summary: string;
  responseDeadline: Date;
}

// Lithuanian demand letter template structure
const LETTER_STRUCTURE = {
  header: `
PRETENZIJA
(Ikiteisminis reikalavimas)
`,
  senderBlock: `
Nuo: {senderName}
Adresas: {senderAddress}
El. paštas: {senderEmail}
Tel.: {senderPhone}
`,
  recipientBlock: `
Kam: {recipientName}
Adresas: {recipientAddress}
`,
  dateBlock: `
Data: {date}
`,
  referenceBlock: `
Dėl: {caseTitle}
`,
};

export async function generateDemandLetter(
  data: DemandLetterData
): Promise<GeneratedDemandLetter> {
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

  const responseDeadlineDays = data.responseDeadlineDays || 14;
  const responseDeadline = calculateDeadline(new Date(), responseDeadlineDays);

  // Parse legal basis if available
  let legalBasisText = '';
  if (caseData.legalBasis) {
    try {
      const basis = JSON.parse(caseData.legalBasis);
      legalBasisText = basis
        .map((b: any) => `Civilinio kodekso ${b.articles.join(', ')} str. - ${b.explanation}`)
        .join('\n');
    } catch {
      legalBasisText = '';
    }
  }

  const toneInstructions = {
    formal: 'Rašyk formaliu, dalykišku tonu. Būk mandagus, bet aiškus.',
    firm: 'Rašyk tvirtai ir ryžtingai. Pabrėžk teisinius padarinius nevykdymo atveju.',
    final_warning: 'Tai paskutinis įspėjimas prieš teisminį procesą. Būk griežtas ir nurodyk konkrečius terminus.',
  };

  const prompt = `
Tu esi Lietuvos teisininkas, rašantis pretenziją (ikiteisminį reikalavimą) klientui.

BYLOS INFORMACIJA:
- Pavadinimas: ${caseData.title}
- Aprašymas: ${caseData.description}
- Reikalaujama suma: ${caseData.claimAmount} EUR
- Bylos tipas: ${caseData.caseType}
- Oponentas: ${caseData.opponentName || 'Nenurodyta'}
- Oponento tipas: ${caseData.opponentType || 'INDIVIDUAL'}
- Įvykio data: ${caseData.incidentDate ? formatDate(caseData.incidentDate) : 'Nenurodyta'}

TEISINIS PAGRINDAS:
${legalBasisText || 'Bus nustatyta pagal bylos aplinkybes'}

TONAS: ${toneInstructions[data.tone]}

TERMINAS ATSAKYMUI: ${responseDeadlineDays} dienų (iki ${formatDate(responseDeadline)})

Parašyk pilną pretenziją lietuvių kalba, kuri apima:
1. Faktinių aplinkybių aprašymą
2. Teisinį pagrindą (Civilinio kodekso straipsniai)
3. Konkretų reikalavimą (sumą, veiksmus)
4. Terminą atsakymui
5. Padarinius neatsakius (kreipimasis į teismą)

Atsakyk JSON formatu:
{
  "content": "pilnas pretenzijos tekstas",
  "legalBasis": ["straipsnių sąrašas"],
  "summary": "trumpas aprašymas"
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const letterData = JSON.parse(jsonMatch[0]);

    // Log AI interaction
    await prisma.aIInteractionLog.create({
      data: {
        userId: data.userId,
        caseId: data.caseId,
        interactionType: 'demand_letter_generation',
        prompt,
        response: JSON.stringify(letterData),
        modelUsed: 'claude-sonnet-4-20250514',
        tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
        disclaimerShown: true,
      },
    });

    // Create demand letter record
    const demandLetter = await prisma.demandLetter.create({
      data: {
        caseId: data.caseId,
        content: letterData.content,
        legalBasis: JSON.stringify(letterData.legalBasis),
        aiSummary: letterData.summary,
        aiTone: data.tone,
        responseDeadline,
        status: 'DRAFT',
      },
    });

    // Create timeline event
    await prisma.timelineEvent.create({
      data: {
        caseId: data.caseId,
        eventType: 'DEMAND_LETTER_SENT',
        title: 'Pretenzija sukurta',
        description: `Sukurta pretenzija su ${responseDeadlineDays} dienų atsakymo terminu`,
        icon: 'file-text',
        color: 'blue',
      },
    });

    return {
      content: letterData.content,
      legalBasis: letterData.legalBasis,
      summary: letterData.summary,
      responseDeadline,
    };
  } catch (error) {
    console.error('Demand letter generation error:', error);
    throw error;
  }
}

export async function formatDemandLetterForPrint(
  demandLetterId: string,
  userId: string
): Promise<string> {
  const demandLetter = await prisma.demandLetter.findFirst({
    where: { id: demandLetterId },
    include: {
      case: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!demandLetter || demandLetter.case.userId !== userId) {
    throw new Error('Demand letter not found');
  }

  const caseData = demandLetter.case;
  const user = caseData.user;

  // Format the complete letter with headers
  const formattedLetter = `
================================================================================
                                  PRETENZIJA
                           (Ikiteisminis reikalavimas)
================================================================================

Nuo:     ${user.name || 'Vardas Pavardė'}
         El. paštas: ${user.email}
         ${user.phone ? `Tel.: ${user.phone}` : ''}

Kam:     ${caseData.opponentName || '[Oponento vardas]'}
         ${caseData.opponentAddress || '[Oponento adresas]'}

Data:    ${formatDate(new Date())}

Dėl:     ${caseData.title}
         Suma: ${caseData.claimAmount} EUR

--------------------------------------------------------------------------------

${demandLetter.content}

--------------------------------------------------------------------------------

Atsakymo terminas: ${demandLetter.responseDeadline ? formatDate(demandLetter.responseDeadline) : '14 dienų'}

================================================================================
                    Dokumentas sugeneruotas Teisės Draugas platforma
                         www.teisesdraugas.lt | AI teisinis pagalbininkas
================================================================================
`;

  return formattedLetter;
}

// E. pristatymas integration stub
export async function sendViaEPristatymas(
  demandLetterId: string,
  userId: string
): Promise<{ success: boolean; deliveryRef?: string; error?: string }> {
  const demandLetter = await prisma.demandLetter.findFirst({
    where: { id: demandLetterId },
    include: {
      case: true,
    },
  });

  if (!demandLetter || demandLetter.case.userId !== userId) {
    throw new Error('Demand letter not found');
  }

  // In production, this would integrate with E. pristatymas API
  // https://www.epristatymas.lt/

  if (process.env.NODE_ENV === 'development') {
    // Simulate successful delivery in development
    const deliveryRef = `EP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Update demand letter status
    await prisma.demandLetter.update({
      where: { id: demandLetterId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    // Update case status
    await prisma.case.update({
      where: { id: demandLetter.caseId },
      data: {
        status: 'AWAITING_RESPONSE',
        responseDeadline: demandLetter.responseDeadline,
      },
    });

    // Create communication record
    await prisma.communication.create({
      data: {
        caseId: demandLetter.caseId,
        type: 'DEMAND_LETTER',
        direction: 'OUTGOING',
        subject: 'Pretenzija',
        content: demandLetter.content,
        deliveryMethod: 'E_PRISTATYMAS',
        deliveryStatus: 'SENT',
        sentAt: new Date(),
        deliveryRef,
      },
    });

    // Create timeline event
    await prisma.timelineEvent.create({
      data: {
        caseId: demandLetter.caseId,
        eventType: 'DEMAND_LETTER_SENT',
        title: 'Pretenzija išsiųsta',
        description: `Pretenzija išsiųsta per E. pristatymą. Ref: ${deliveryRef}`,
        icon: 'send',
        color: 'green',
      },
    });

    return { success: true, deliveryRef };
  }

  // Production implementation would go here
  const ePristatymasterApiUrl = process.env.E_PRISTATYMAS_API_URL;
  const apiKey = process.env.E_PRISTATYMAS_API_KEY;

  if (!ePristatymasterApiUrl || !apiKey) {
    return { success: false, error: 'E. pristatymas configuration missing' };
  }

  // TODO: Implement actual E. pristatymas API integration
  // 1. Prepare document in required format
  // 2. Submit to E. pristatymas API
  // 3. Track delivery status

  return { success: false, error: 'Production integration not yet implemented' };
}
