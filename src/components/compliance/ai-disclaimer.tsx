'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';
import { AlertTriangle, Bot, Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIDisclaimerProps {
  variant?: 'banner' | 'inline' | 'modal';
  showDetails?: boolean;
  onAccept?: () => void;
  className?: string;
}

export function AIDisclaimer({
  variant = 'inline',
  showDetails = false,
  onAccept,
  className,
}: AIDisclaimerProps) {
  const { language } = useLanguage();
  const [expanded, setExpanded] = React.useState(showDetails);

  const content = {
    lt: {
      title: 'AI Teisinis Pagalbininkas',
      disclaimer:
        'Pastaba: Esu dirbtinio intelekto teisinis pagalbininkas, ne licencijuotas advokatas. Mano rekomendacijos paremtos algoritmais ir mokymosi duomenimis.',
      details: [
        'Ši sistema naudoja dirbtinį intelektą (AI) teisiniams patarimams teikti',
        'AI negali pakeisti kvalifikuoto teisininko konsultacijos',
        'Sudėtingoms byloms rekomenduojame kreiptis į advokatą',
        'Visa sugeneruota informacija yra tik rekomendacinio pobūdžio',
        'Jūsų duomenys tvarkomi pagal BDAR reikalavimus',
      ],
      learnMore: 'Sužinoti daugiau',
      hideDetails: 'Paslėpti',
      accept: 'Supratau',
      euAiAct: 'EU AI Act atitiktis',
    },
    en: {
      title: 'AI Legal Assistant',
      disclaimer:
        'Note: I am an AI legal assistant, not a licensed attorney. My recommendations are based on algorithms and training data.',
      details: [
        'This system uses artificial intelligence (AI) to provide legal guidance',
        'AI cannot replace consultation with a qualified attorney',
        'For complex cases, we recommend consulting a lawyer',
        'All generated information is for guidance purposes only',
        'Your data is processed in accordance with GDPR requirements',
      ],
      learnMore: 'Learn more',
      hideDetails: 'Hide details',
      accept: 'I understand',
      euAiAct: 'EU AI Act Compliance',
    },
  };

  const t = content[language];

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800',
          className
        )}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200 flex-1">
              {t.disclaimer}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-amber-700 dark:text-amber-300"
            >
              {expanded ? t.hideDetails : t.learnMore}
            </Button>
          </div>

          {expanded && (
            <div className="mt-3 pl-8 border-l-2 border-amber-300 dark:border-amber-700">
              <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-300">
                {t.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'modal') {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center bg-black/50',
          className
        )}
      >
        <div className="bg-background rounded-lg shadow-lg max-w-md w-full mx-4 p-6 animate-slide-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
              <Bot className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold">{t.title}</h2>
          </div>

          <p className="text-muted-foreground mb-4">{t.disclaimer}</p>

          <div className="bg-muted rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              {t.euAiAct}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {t.details.map((detail, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>

          {onAccept && (
            <Button onClick={onAccept} className="w-full">
              {t.accept}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Default inline variant
  return (
    <div
      className={cn(
        'rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Bot className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {t.disclaimer}
          </p>
          {expanded && (
            <ul className="mt-3 space-y-1 text-sm text-amber-700 dark:text-amber-300">
              {t.details.map((detail, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  {detail}
                </li>
              ))}
            </ul>
          )}
          <Button
            variant="link"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-amber-700 dark:text-amber-300 p-0 h-auto mt-2"
          >
            {expanded ? t.hideDetails : t.learnMore}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Document footer for AI-generated content
export function AIGeneratedFooter({ className }: { className?: string }) {
  const { language } = useLanguage();

  return (
    <div
      className={cn(
        'mt-6 pt-4 border-t text-xs text-muted-foreground',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Bot className="h-3 w-3" />
        <span>
          {language === 'lt'
            ? 'Šis dokumentas sugeneruotas naudojant AI technologiją. Rekomenduojame pasitikrinti su kvalifikuotu teisininku.'
            : 'This document was generated using AI technology. We recommend verification by a qualified attorney.'}
        </span>
      </div>
    </div>
  );
}

// Transparency badge for AI-assisted features
export function AITransparencyBadge({
  feature,
  className,
}: {
  feature: string;
  className?: string;
}) {
  const { language } = useLanguage();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300',
        className
      )}
    >
      <Bot className="h-3 w-3" />
      <span>
        {language === 'lt' ? 'AI pagalba' : 'AI-assisted'}: {feature}
      </span>
    </div>
  );
}
