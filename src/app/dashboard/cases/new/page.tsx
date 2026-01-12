'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/language-context';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AIDisclaimer } from '@/components/compliance/ai-disclaimer';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

type CaseType =
  | 'CONSUMER_DISPUTE'
  | 'RENTAL_DEPOSIT'
  | 'UNPAID_INVOICE'
  | 'CONTRACT_BREACH'
  | 'PROPERTY_DAMAGE'
  | 'SERVICE_COMPLAINT'
  | 'EMPLOYMENT_DISPUTE'
  | 'OTHER';

type CaseCategory =
  | 'VINTED'
  | 'AIRBNB'
  | 'FREELANCE'
  | 'LANDLORD_TENANT'
  | 'ONLINE_PURCHASE'
  | 'LOCAL_SERVICE'
  | 'OTHER';

type OpponentType = 'INDIVIDUAL' | 'COMPANY' | 'PLATFORM' | 'GOVERNMENT';

interface FormData {
  title: string;
  description: string;
  caseType: CaseType;
  category: CaseCategory;
  claimAmount: string;
  opponentName: string;
  opponentEmail: string;
  opponentPhone: string;
  opponentAddress: string;
  opponentType: OpponentType;
  incidentDate: string;
}

export default function NewCasePage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    caseType: 'CONSUMER_DISPUTE',
    category: 'OTHER',
    claimAmount: '',
    opponentName: '',
    opponentEmail: '',
    opponentPhone: '',
    opponentAddress: '',
    opponentType: 'INDIVIDUAL',
    incidentDate: '',
  });

  const caseTypes: { value: CaseType; labelKey: string }[] = [
    { value: 'CONSUMER_DISPUTE', labelKey: 'caseType.CONSUMER_DISPUTE' },
    { value: 'RENTAL_DEPOSIT', labelKey: 'caseType.RENTAL_DEPOSIT' },
    { value: 'UNPAID_INVOICE', labelKey: 'caseType.UNPAID_INVOICE' },
    { value: 'CONTRACT_BREACH', labelKey: 'caseType.CONTRACT_BREACH' },
    { value: 'PROPERTY_DAMAGE', labelKey: 'caseType.PROPERTY_DAMAGE' },
    { value: 'SERVICE_COMPLAINT', labelKey: 'caseType.SERVICE_COMPLAINT' },
    { value: 'EMPLOYMENT_DISPUTE', labelKey: 'caseType.EMPLOYMENT_DISPUTE' },
    { value: 'OTHER', labelKey: 'caseType.OTHER' },
  ];

  const categories: { value: CaseCategory; labelKey: string }[] = [
    { value: 'VINTED', labelKey: 'caseCategory.VINTED' },
    { value: 'AIRBNB', labelKey: 'caseCategory.AIRBNB' },
    { value: 'FREELANCE', labelKey: 'caseCategory.FREELANCE' },
    { value: 'LANDLORD_TENANT', labelKey: 'caseCategory.LANDLORD_TENANT' },
    { value: 'ONLINE_PURCHASE', labelKey: 'caseCategory.ONLINE_PURCHASE' },
    { value: 'LOCAL_SERVICE', labelKey: 'caseCategory.LOCAL_SERVICE' },
    { value: 'OTHER', labelKey: 'caseCategory.OTHER' },
  ];

  const opponentTypes: { value: OpponentType; label: { lt: string; en: string } }[] = [
    { value: 'INDIVIDUAL', label: { lt: 'Fizinis asmuo', en: 'Individual' } },
    { value: 'COMPANY', label: { lt: 'Įmonė', en: 'Company' } },
    { value: 'PLATFORM', label: { lt: 'Platforma (Vinted, Airbnb)', en: 'Platform (Vinted, Airbnb)' } },
    { value: 'GOVERNMENT', label: { lt: 'Valstybinė institucija', en: 'Government entity' } },
  ];

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          claimAmount: parseFloat(formData.claimAmount),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create case');
      }

      const newCase = await response.json();
      router.push(`/dashboard/cases/${newCase.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : language === 'lt'
          ? 'Nepavyko sukurti bylos'
          : 'Failed to create case'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        return formData.title.length >= 3 && formData.description.length >= 10;
      case 2:
        return parseFloat(formData.claimAmount) > 0 && parseFloat(formData.claimAmount) <= 5000;
      case 3:
        return formData.opponentName.length > 0;
      default:
        return true;
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((s) => (
        <React.Fragment key={s}>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
              s < step
                ? 'bg-green-500 text-white'
                : s === step
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {s < step ? <CheckCircle className="h-5 w-5" /> : s}
          </div>
          {s < 4 && (
            <div
              className={`h-1 w-12 mx-2 rounded ${
                s < step ? 'bg-green-500' : 'bg-muted'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <AIDisclaimer variant="banner" />

      <main className="flex-1 container px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('form.back')}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{t('nav.newCase')}</CardTitle>
            <CardDescription>
              {language === 'lt'
                ? 'Užpildykite informaciją apie savo bylą'
                : 'Fill in the information about your case'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepIndicator()}

            {error && (
              <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 p-3 rounded-md text-sm mb-4">
                {error}
              </div>
            )}

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-medium">
                  {language === 'lt' ? '1. Pagrindinė informacija' : '1. Basic Information'}
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="title">{t('form.title')} *</Label>
                  <Input
                    id="title"
                    placeholder={
                      language === 'lt'
                        ? 'pvz., Vinted pardavėjas negrąžina pinigų'
                        : 'e.g., Vinted seller won\'t refund'
                    }
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('form.description')} *</Label>
                  <Textarea
                    id="description"
                    placeholder={
                      language === 'lt'
                        ? 'Detaliai aprašykite situaciją...'
                        : 'Describe the situation in detail...'
                    }
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t('form.caseType')}</Label>
                    <Select
                      value={formData.caseType}
                      onValueChange={(value: CaseType) => setFormData({ ...formData, caseType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {caseTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {t(type.labelKey as any)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('form.category')}</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: CaseCategory) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {t(cat.labelKey as any)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Claim Details */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-medium">
                  {language === 'lt' ? '2. Reikalavimo informacija' : '2. Claim Details'}
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="claimAmount">{t('form.amount')} *</Label>
                  <Input
                    id="claimAmount"
                    type="number"
                    min="1"
                    max="5000"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.claimAmount}
                    onChange={(e) => setFormData({ ...formData, claimAmount: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === 'lt'
                      ? 'Maksimali suma: 5000 EUR'
                      : 'Maximum amount: 5000 EUR'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incidentDate">{t('form.incidentDate')}</Label>
                  <Input
                    id="incidentDate"
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Opponent Info */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-medium">
                  {language === 'lt' ? '3. Oponento informacija' : '3. Opponent Information'}
                </h3>

                <div className="space-y-2">
                  <Label>{language === 'lt' ? 'Oponento tipas' : 'Opponent Type'}</Label>
                  <Select
                    value={formData.opponentType}
                    onValueChange={(value: OpponentType) => setFormData({ ...formData, opponentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {opponentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {language === 'lt' ? type.label.lt : type.label.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opponentName">{t('form.opponentName')} *</Label>
                  <Input
                    id="opponentName"
                    placeholder={
                      language === 'lt'
                        ? 'Vardas Pavardė arba Įmonės pavadinimas'
                        : 'Name or Company name'
                    }
                    value={formData.opponentName}
                    onChange={(e) => setFormData({ ...formData, opponentName: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="opponentEmail">{t('form.opponentEmail')}</Label>
                    <Input
                      id="opponentEmail"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.opponentEmail}
                      onChange={(e) => setFormData({ ...formData, opponentEmail: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="opponentPhone">{t('form.opponentPhone')}</Label>
                    <Input
                      id="opponentPhone"
                      placeholder="+370..."
                      value={formData.opponentPhone}
                      onChange={(e) => setFormData({ ...formData, opponentPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opponentAddress">{t('form.opponentAddress')}</Label>
                  <Textarea
                    id="opponentAddress"
                    rows={2}
                    placeholder={language === 'lt' ? 'Adresas...' : 'Address...'}
                    value={formData.opponentAddress}
                    onChange={(e) => setFormData({ ...formData, opponentAddress: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-medium">
                  {language === 'lt' ? '4. Peržiūra ir patvirtinimas' : '4. Review and Submit'}
                </h3>

                <AIDisclaimer variant="inline" />

                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">{t('form.title')}:</span>
                    <p className="font-medium">{formData.title}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">{t('form.description')}:</span>
                    <p className="text-sm">{formData.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">{t('form.amount')}:</span>
                      <p className="font-medium">{formData.claimAmount} EUR</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">{t('form.caseType')}:</span>
                      <p className="font-medium">{t(`caseType.${formData.caseType}` as any)}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">{t('form.opponent')}:</span>
                    <p className="font-medium">{formData.opponentName}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {language === 'lt'
                    ? 'Sukūrus bylą galėsite įkelti dokumentus ir pradėti AI analizę.'
                    : 'After creating the case, you can upload documents and start AI analysis.'}
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('form.back')}
              </Button>

              {step < 4 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!validateStep(step)}
                >
                  {t('form.next')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === 'lt' ? 'Kuriama...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {language === 'lt' ? 'Sukurti bylą' : 'Create Case'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
