'use client';

import React from 'react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';
import {
  FileText,
  Upload,
  Brain,
  Send,
  MessageSquare,
  Gavel,
  CheckCircle,
  AlertTriangle,
  Clock,
  Scale,
  Users,
  FileCheck,
} from 'lucide-react';

export type TimelineEventType =
  | 'CASE_CREATED'
  | 'DOCUMENT_UPLOADED'
  | 'AI_ANALYSIS_COMPLETE'
  | 'DEMAND_LETTER_SENT'
  | 'DEMAND_LETTER_DELIVERED'
  | 'RESPONSE_RECEIVED'
  | 'NEGOTIATION_STARTED'
  | 'OFFER_MADE'
  | 'OFFER_RECEIVED'
  | 'SETTLEMENT_REACHED'
  | 'COURT_FILING_PREPARED'
  | 'COURT_FILING_SUBMITTED'
  | 'COURT_FILING_ACCEPTED'
  | 'HEARING_SCHEDULED'
  | 'JUDGMENT_RECEIVED'
  | 'CASE_RESOLVED'
  | 'CASE_CLOSED'
  | 'DEADLINE_WARNING'
  | 'LAWYER_REVIEW_REQUESTED'
  | 'LAWYER_REVIEW_COMPLETE';

export interface TimelineEvent {
  id: string;
  eventType: TimelineEventType;
  title: string;
  description?: string;
  eventDate: string | Date;
  icon?: string;
  color?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const eventIcons: Record<TimelineEventType, React.ComponentType<any>> = {
  CASE_CREATED: FileText,
  DOCUMENT_UPLOADED: Upload,
  AI_ANALYSIS_COMPLETE: Brain,
  DEMAND_LETTER_SENT: Send,
  DEMAND_LETTER_DELIVERED: CheckCircle,
  RESPONSE_RECEIVED: MessageSquare,
  NEGOTIATION_STARTED: Users,
  OFFER_MADE: Send,
  OFFER_RECEIVED: MessageSquare,
  SETTLEMENT_REACHED: CheckCircle,
  COURT_FILING_PREPARED: FileCheck,
  COURT_FILING_SUBMITTED: Gavel,
  COURT_FILING_ACCEPTED: CheckCircle,
  HEARING_SCHEDULED: Clock,
  JUDGMENT_RECEIVED: Scale,
  CASE_RESOLVED: CheckCircle,
  CASE_CLOSED: FileText,
  DEADLINE_WARNING: AlertTriangle,
  LAWYER_REVIEW_REQUESTED: Users,
  LAWYER_REVIEW_COMPLETE: CheckCircle,
};

const eventColors: Record<TimelineEventType, string> = {
  CASE_CREATED: 'bg-blue-500',
  DOCUMENT_UPLOADED: 'bg-blue-400',
  AI_ANALYSIS_COMPLETE: 'bg-purple-500',
  DEMAND_LETTER_SENT: 'bg-amber-500',
  DEMAND_LETTER_DELIVERED: 'bg-green-500',
  RESPONSE_RECEIVED: 'bg-blue-500',
  NEGOTIATION_STARTED: 'bg-amber-400',
  OFFER_MADE: 'bg-amber-500',
  OFFER_RECEIVED: 'bg-blue-400',
  SETTLEMENT_REACHED: 'bg-green-600',
  COURT_FILING_PREPARED: 'bg-purple-400',
  COURT_FILING_SUBMITTED: 'bg-purple-600',
  COURT_FILING_ACCEPTED: 'bg-green-500',
  HEARING_SCHEDULED: 'bg-blue-500',
  JUDGMENT_RECEIVED: 'bg-purple-700',
  CASE_RESOLVED: 'bg-green-600',
  CASE_CLOSED: 'bg-gray-500',
  DEADLINE_WARNING: 'bg-red-500',
  LAWYER_REVIEW_REQUESTED: 'bg-amber-500',
  LAWYER_REVIEW_COMPLETE: 'bg-green-500',
};

export function Timeline({ events, className }: TimelineProps) {
  const { language } = useLanguage();

  if (events.length === 0) {
    return (
      <div className={cn('text-center text-muted-foreground py-8', className)}>
        {language === 'lt' ? 'Dar nėra įvykių' : 'No events yet'}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-6">
        {events.map((event, index) => {
          const Icon = eventIcons[event.eventType] || FileText;
          const colorClass = eventColors[event.eventType] || 'bg-gray-500';

          return (
            <div
              key={event.id}
              className={cn(
                'relative flex gap-4 animate-slide-in',
                index === 0 && 'font-medium'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Icon */}
              <div
                className={cn(
                  'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white',
                  colorClass
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      'text-sm',
                      index === 0 ? 'font-semibold' : 'font-medium'
                    )}
                  >
                    {event.title}
                  </p>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(event.eventDate, language)}
                  </time>
                </div>
                {event.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Case Progress Steps Component
export type CaseStep = 'ANALYSIS' | 'DEMAND_LETTER' | 'RESPONSE' | 'COURT_FILING' | 'RESOLUTION';

interface CaseProgressProps {
  currentStep: CaseStep;
  className?: string;
}

const steps: { key: CaseStep; labelLt: string; labelEn: string }[] = [
  { key: 'ANALYSIS', labelLt: 'Analizė', labelEn: 'Analysis' },
  { key: 'DEMAND_LETTER', labelLt: 'Pretenzija', labelEn: 'Demand' },
  { key: 'RESPONSE', labelLt: 'Atsakymas', labelEn: 'Response' },
  { key: 'COURT_FILING', labelLt: 'Teismas', labelEn: 'Court' },
  { key: 'RESOLUTION', labelLt: 'Sprendimas', labelEn: 'Resolution' },
];

export function CaseProgress({ currentStep, className }: CaseProgressProps) {
  const { language } = useLanguage();
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <React.Fragment key={step.key}>
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all',
                    isCompleted && 'bg-green-500 text-white',
                    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    isPending && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium',
                    isCurrent && 'text-primary',
                    isPending && 'text-muted-foreground'
                  )}
                >
                  {language === 'lt' ? step.labelLt : step.labelEn}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-1 flex-1 mx-2 rounded transition-all',
                    index < currentIndex ? 'bg-green-500' : 'bg-muted'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// Deadline Warning Component
interface DeadlineWarningProps {
  deadline: Date | string;
  label: string;
  className?: string;
}

export function DeadlineWarning({ deadline, label, className }: DeadlineWarningProps) {
  const { language } = useLanguage();
  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const now = new Date();
  const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const isUrgent = daysLeft <= 3;
  const isWarning = daysLeft <= 7;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-4',
        isUrgent && 'border-red-500 bg-red-50 dark:bg-red-950',
        !isUrgent && isWarning && 'border-amber-500 bg-amber-50 dark:bg-amber-950',
        !isWarning && 'border-blue-500 bg-blue-50 dark:bg-blue-950',
        className
      )}
    >
      <Clock
        className={cn(
          'h-5 w-5',
          isUrgent && 'text-red-500',
          !isUrgent && isWarning && 'text-amber-500',
          !isWarning && 'text-blue-500'
        )}
      />
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          {daysLeft > 0 ? (
            <>
              {language === 'lt' ? 'Liko' : 'Remaining'}: {daysLeft}{' '}
              {language === 'lt'
                ? daysLeft === 1
                  ? 'diena'
                  : 'dienos'
                : daysLeft === 1
                ? 'day'
                : 'days'}
            </>
          ) : (
            <span className="text-red-600 font-medium">
              {language === 'lt' ? 'Terminas praėjo!' : 'Deadline passed!'}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
