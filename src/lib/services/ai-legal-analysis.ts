import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Lithuanian Civil Code articles commonly used in small claims
export const CIVIL_CODE_REFERENCES = {
  contractFormation: {
    articles: ['6.154', '6.156', '6.159'],
    titleLt: 'Sutarties sudarymas',
    titleEn: 'Contract Formation',
  },
  contractPerformance: {
    articles: ['6.200', '6.205', '6.206'],
    titleLt: 'Sutarties vykdymas',
    titleEn: 'Contract Performance',
  },
  contractBreach: {
    articles: ['6.245', '6.246', '6.247', '6.249'],
    titleLt: 'Sutarties pažeidimas ir žalos atlyginimas',
    titleEn: 'Contract Breach and Damages',
  },
  consumerRights: {
    articles: ['6.228', '6.228¹', '6.228²'],
    titleLt: 'Vartotojų teisės',
    titleEn: 'Consumer Rights',
  },
  unjustEnrichment: {
    articles: ['6.237', '6.238', '6.239'],
    titleLt: 'Nepagrįstas praturtėjimas',
    titleEn: 'Unjust Enrichment',
  },
  rental: {
    articles: ['6.477', '6.478', '6.492', '6.493'],
    titleLt: 'Nuomos sutartis',
    titleEn: 'Rental Agreement',
  },
  deposit: {
    articles: ['6.70', '6.71'],
    titleLt: 'Užstatas',
    titleEn: 'Deposit',
  },
  services: {
    articles: ['6.716', '6.717', '6.718'],
    titleLt: 'Paslaugų sutartis',
    titleEn: 'Service Agreement',
  },
  limitations: {
    articles: ['1.125', '1.126', '1.127'],
    titleLt: 'Ieškinio senatis',
    titleEn: 'Statute of Limitations',
  },
};

export interface CaseAnalysisResult {
  winProbability: number;
  legalBasis: {
    articles: string[];
    explanation: string;
    strength: 'strong' | 'moderate' | 'weak';
  }[];
  riskFactors: {
    factor: string;
    severity: 'high' | 'medium' | 'low';
    mitigation?: string;
  }[];
  recommendedAction: string;
  estimatedTimeline: string;
  nextSteps: string[];
  summary: string;
}

export async function analyzeCaseWithAI(
  caseId: string,
  userId: string
): Promise<CaseAnalysisResult> {
  // Fetch case data with documents
  const caseData = await prisma.case.findFirst({
    where: { id: caseId, userId },
    include: {
      documents: true,
    },
  });

  if (!caseData) {
    throw new Error('Case not found');
  }

  // Prepare context for AI
  const caseContext = `
BYLOS INFORMACIJA:
- Pavadinimas: ${caseData.title}
- Aprašymas: ${caseData.description}
- Bylos tipas: ${caseData.caseType}
- Kategorija: ${caseData.category}
- Reikalaujama suma: ${caseData.claimAmount} EUR
- Oponento tipas: ${caseData.opponentType || 'Nenurodyta'}
- Įvykio data: ${caseData.incidentDate?.toISOString().split('T')[0] || 'Nenurodyta'}
- Dokumentų skaičius: ${caseData.documents.length}

DOKUMENTŲ TIPAI:
${caseData.documents.map(d => `- ${d.documentType}: ${d.description || d.fileName}`).join('\n')}
`;

  const systemPrompt = `Tu esi Lietuvos teisės ekspertas, specializuojantis civilinėse bylose iki 5000 EUR.
Tavo užduotis - išanalizuoti pateiktą bylą ir pateikti profesionalią teisinę analizę pagal Lietuvos Civilinį kodeksą.

SVARBU:
1. Visada nurodyk konkrečius Civilinio kodekso straipsnius
2. Būk objektyvus vertindamas laimėjimo tikimybę
3. Identifikuok visus rizikos veiksnius
4. Rekomenduok konkrečius veiksmus
5. Atsižvelk į ieškinio senatį (paprastai 3 metai civilinėms byloms)

Atsakyk JSON formatu su šiais laukais:
- winProbability: skaičius nuo 0 iki 1
- legalBasis: masyvas su articles, explanation, strength
- riskFactors: masyvas su factor, severity, mitigation
- recommendedAction: string
- estimatedTimeline: string
- nextSteps: string masyvas
- summary: trumpas aprašymas lietuvių kalba`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}\n\n${caseContext}\n\nIšanalizuok šią bylą ir pateik JSON atsakymą.`,
        },
      ],
    });

    // Extract text content
    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Parse JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const analysis: CaseAnalysisResult = JSON.parse(jsonMatch[0]);

    // Log AI interaction for compliance
    await prisma.aIInteractionLog.create({
      data: {
        userId,
        caseId,
        interactionType: 'case_analysis',
        prompt: caseContext,
        response: JSON.stringify(analysis),
        modelUsed: 'claude-sonnet-4-20250514',
        tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
        disclaimerShown: true,
      },
    });

    // Update case with analysis results
    await prisma.case.update({
      where: { id: caseId },
      data: {
        winProbability: analysis.winProbability,
        legalBasis: JSON.stringify(analysis.legalBasis),
        riskAssessment: JSON.stringify(analysis.riskFactors),
        recommendedAction: analysis.recommendedAction,
        status: 'ANALYSIS',
      },
    });

    // Create timeline event
    await prisma.timelineEvent.create({
      data: {
        caseId,
        eventType: 'AI_ANALYSIS_COMPLETE',
        title: 'AI analizė baigta',
        description: `Laimėjimo tikimybė: ${Math.round(analysis.winProbability * 100)}%`,
        icon: 'brain',
        color: analysis.winProbability > 0.6 ? 'green' : analysis.winProbability > 0.4 ? 'yellow' : 'red',
      },
    });

    return analysis;
  } catch (error) {
    console.error('AI analysis error:', error);

    // Return a basic analysis if AI fails
    return {
      winProbability: 0.5,
      legalBasis: [{
        articles: ['6.245', '6.246'],
        explanation: 'Reikalinga detalesnė analizė. Prašome įkelti daugiau dokumentų.',
        strength: 'moderate',
      }],
      riskFactors: [{
        factor: 'Nepakanka informacijos pilnai analizei',
        severity: 'medium',
        mitigation: 'Įkelkite papildomų dokumentų ir įrodymų',
      }],
      recommendedAction: 'Surinkite papildomus įrodymus ir pakartokite analizę',
      estimatedTimeline: '2-4 savaitės pradiniam etapui',
      nextSteps: [
        'Įkelkite visus susijusius dokumentus',
        'Patikslinkite bylos aprašymą',
        'Pakartokite AI analizę',
      ],
      summary: 'Pradinė analizė atlikta. Rekomenduojama pateikti daugiau informacijos tikslesniam vertinimui.',
    };
  }
}

export async function generateNegotiationAdvice(
  caseId: string,
  userId: string,
  opponentResponse: string
): Promise<{
  analysis: string;
  suggestedResponse: string;
  recommendedOffer?: number;
  strategy: string;
}> {
  const caseData = await prisma.case.findFirst({
    where: { id: caseId, userId },
  });

  if (!caseData) {
    throw new Error('Case not found');
  }

  const prompt = `
Tu esi derybų ekspertas civilinėse bylose. Išanalizuok oponento atsakymą ir patark vartotoją.

BYLOS KONTEKSTAS:
- Reikalaujama suma: ${caseData.claimAmount} EUR
- Bylos tipas: ${caseData.caseType}
- Laimėjimo tikimybė: ${caseData.winProbability ? Math.round(caseData.winProbability * 100) : 50}%

OPONENTO ATSAKYMAS:
${opponentResponse}

Pateik:
1. Atsakymo analizę
2. Siūlomą atsakymą
3. Rekomenduojamą pasiūlymą (jei taikoma)
4. Derybų strategiją

Atsakyk JSON formatu.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
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

    const advice = JSON.parse(jsonMatch[0]);

    // Log interaction
    await prisma.aIInteractionLog.create({
      data: {
        userId,
        caseId,
        interactionType: 'negotiation_advice',
        prompt,
        response: JSON.stringify(advice),
        modelUsed: 'claude-sonnet-4-20250514',
        tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
        disclaimerShown: true,
      },
    });

    return advice;
  } catch (error) {
    console.error('Negotiation advice error:', error);
    throw error;
  }
}
