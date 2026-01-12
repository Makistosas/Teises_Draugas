'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/lib/i18n/language-context';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AIDisclaimer } from '@/components/compliance/ai-disclaimer';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Send,
  Gavel,
} from 'lucide-react';

interface CaseData {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  currentStep: string;
  claimAmount: string;
  winProbability: number | null;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalCases: number;
  activeCases: number;
  resolvedCases: number;
  totalClaimAmount: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { language, t } = useLanguage();

  const { data: casesData, isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const res = await fetch('/api/cases?limit=5');
      if (!res.ok) throw new Error('Failed to fetch cases');
      return res.json();
    },
  });

  const cases: CaseData[] = casesData?.cases || [];

  const stats: DashboardStats = {
    totalCases: casesData?.pagination?.total || 0,
    activeCases: cases.filter((c) => !['RESOLVED', 'CLOSED'].includes(c.status)).length,
    resolvedCases: cases.filter((c) => c.status === 'RESOLVED').length,
    totalClaimAmount: cases.reduce((sum, c) => sum + parseFloat(c.claimAmount || '0'), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'AWAITING_RESPONSE':
      case 'NEGOTIATION':
        return 'text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-300';
      case 'FILED':
      case 'IN_COURT':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      case 'CLOSED':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return CheckCircle;
      case 'AWAITING_RESPONSE':
        return Clock;
      case 'FILED':
      case 'IN_COURT':
        return Gavel;
      case 'DEMAND_LETTER':
        return Send;
      default:
        return FileText;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <AIDisclaimer variant="banner" />

      <main className="flex-1 container px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {language === 'lt' ? 'Sveiki' : 'Welcome'}, {session?.user?.name || 'User'}!
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'lt'
              ? 'Jūsų teisinis pagalbininkas pasiruošęs padėti'
              : 'Your legal assistant is ready to help'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'lt' ? 'Visos bylos' : 'Total Cases'}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCases}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'lt' ? 'Aktyvios bylos' : 'Active Cases'}
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCases}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'lt' ? 'Išspręstos' : 'Resolved'}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolvedCases}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'lt' ? 'Bendra suma' : 'Total Amount'}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalClaimAmount)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Cases */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{language === 'lt' ? 'Naujausios bylos' : 'Recent Cases'}</CardTitle>
                  <CardDescription>
                    {language === 'lt'
                      ? 'Jūsų paskutinės 5 bylos'
                      : 'Your last 5 cases'}
                  </CardDescription>
                </div>
                <Link href="/dashboard/cases">
                  <Button variant="outline" size="sm">
                    {language === 'lt' ? 'Visos bylos' : 'All Cases'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-muted rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : cases.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {language === 'lt'
                        ? 'Dar neturite bylų. Pradėkite nuo naujos bylos sukūrimo.'
                        : 'You don\'t have any cases yet. Start by creating a new case.'}
                    </p>
                    <Link href="/dashboard/cases/new">
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t('nav.newCase')}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cases.map((caseItem) => {
                      const StatusIcon = getStatusIcon(caseItem.status);
                      return (
                        <Link
                          key={caseItem.id}
                          href={`/dashboard/cases/${caseItem.id}`}
                          className="block"
                        >
                          <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <StatusIcon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{caseItem.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {caseItem.caseNumber} • {formatCurrency(parseFloat(caseItem.claimAmount))}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                                  caseItem.status
                                )}`}
                              >
                                {t(`caseStatus.${caseItem.status}` as any)}
                              </span>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatRelativeTime(caseItem.updatedAt, language)}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'lt' ? 'Greiti veiksmai' : 'Quick Actions'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/cases/new" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('nav.newCase')}
                  </Button>
                </Link>
                <Link href="/dashboard/cases" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    {language === 'lt' ? 'Peržiūrėti bylas' : 'View Cases'}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  {language === 'lt' ? 'Patarimai' : 'Tips'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {language === 'lt'
                      ? 'Įkelkite visus turimus įrodymus - tai padidins laimėjimo tikimybę'
                      : 'Upload all available evidence - this will increase win probability'}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {language === 'lt'
                      ? 'Tiksliai nurodykite sumą ir įvykio datą'
                      : 'Specify the exact amount and incident date'}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {language === 'lt'
                      ? 'Pretenzija turi būti išsiųsta prieš kreipiantis į teismą'
                      : 'Demand letter must be sent before filing with court'}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
