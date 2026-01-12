'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/language-context';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AIDisclaimer } from '@/components/compliance/ai-disclaimer';
import {
  Scale,
  Brain,
  FileText,
  Send,
  Gavel,
  Users,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  ShoppingBag,
  Home,
  Briefcase,
} from 'lucide-react';

export default function LandingPage() {
  const { language, t } = useLanguage();

  const features = [
    {
      icon: Brain,
      titleLt: 'Bylos analizė',
      titleEn: 'Case Analysis',
      descLt: 'AI analizuoja jūsų bylą ir pateikia laimėjimo tikimybę bei teisinį pagrindą',
      descEn: 'AI analyzes your case and provides win probability and legal basis',
    },
    {
      icon: FileText,
      titleLt: 'Pretenzijos generavimas',
      titleEn: 'Demand Letter Generation',
      descLt: 'Automatiškai sugeneruota profesionali pretenzija pagal Civilinį kodeksą',
      descEn: 'Automatically generated professional demand letter based on Civil Code',
    },
    {
      icon: Send,
      titleLt: 'E. pristatymas',
      titleEn: 'E-Delivery',
      descLt: 'Išsiųskite pretenziją per oficialų E. pristatymas sistemą vienu paspaudimu',
      descEn: 'Send your demand letter via official E. pristatymas system with one click',
    },
    {
      icon: Users,
      titleLt: 'AI derybos',
      titleEn: 'AI Negotiation',
      descLt: 'Dirbtinis intelektas padės vesti derybas ir siūlys optimalius sprendimus',
      descEn: 'AI will help you negotiate and suggest optimal solutions',
    },
    {
      icon: Gavel,
      titleLt: 'Teismo dokumentai',
      titleEn: 'Court Documents',
      descLt: 'Paruoškite ir pateikite teismo dokumentus per e.teismas.lt sistemą',
      descEn: 'Prepare and submit court documents via e.teismas.lt system',
    },
    {
      icon: Shield,
      titleLt: 'Advokato peržiūra',
      titleEn: 'Lawyer Review',
      descLt: 'Užsisakykite kvalifikuoto advokato dokumentų peržiūrą už fiksuotą kainą',
      descEn: 'Order a qualified lawyer review of your documents for a fixed fee',
    },
  ];

  const useCases = [
    {
      icon: ShoppingBag,
      titleLt: 'Vinted ginčai',
      titleEn: 'Vinted Disputes',
      descLt: 'Pardavėjas negavo pinigų? Pirkėjas tvirtina, kad prekė netinkama?',
      descEn: 'Seller didn\'t receive payment? Buyer claims item is defective?',
    },
    {
      icon: Home,
      titleLt: 'Nuomos ginčai',
      titleEn: 'Rental Disputes',
      descLt: 'Nuomotojas negrąžina užstato? Nuomininkas paliko skolų?',
      descEn: 'Landlord won\'t return deposit? Tenant left with debts?',
    },
    {
      icon: Briefcase,
      titleLt: 'Neapmokėtos sąskaitos',
      titleEn: 'Unpaid Invoices',
      descLt: 'Klientas neapmokėjo už atliktą darbą ar suteiktas paslaugas?',
      descEn: 'Client hasn\'t paid for work completed or services rendered?',
    },
  ];

  const steps = [
    {
      num: 1,
      titleLt: 'Aprašykite situaciją',
      titleEn: 'Describe your situation',
      descLt: 'Įkelkite dokumentus ir aprašykite savo bylą',
      descEn: 'Upload documents and describe your case',
    },
    {
      num: 2,
      titleLt: 'Gaukite AI analizę',
      titleEn: 'Get AI analysis',
      descLt: 'Dirbtinis intelektas išanalizuos jūsų bylą',
      descEn: 'AI will analyze your case',
    },
    {
      num: 3,
      titleLt: 'Išsiųskite pretenziją',
      titleEn: 'Send demand letter',
      descLt: 'Sugeneruokite ir išsiųskite pretenziją oponentui',
      descEn: 'Generate and send demand letter to opponent',
    },
    {
      num: 4,
      titleLt: 'Išspręskite ginčą',
      titleEn: 'Resolve dispute',
      descLt: 'Derybos arba teismo procesas - mes padėsime',
      descEn: 'Negotiation or court process - we will help',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 lg:py-32">
        <div className="container px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                <Scale className="h-4 w-4" />
                {language === 'lt' ? 'AI teisinis pagalbininkas' : 'AI Legal Assistant'}
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                {t('hero.title')}
              </h1>

              <p className="mt-4 text-xl text-muted-foreground">
                {t('hero.subtitle')}
              </p>

              <p className="mt-6 text-muted-foreground max-w-lg mx-auto lg:mx-0">
                {t('hero.description')}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    {t('hero.cta')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    {t('hero.learnMore')}
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-4 justify-center lg:justify-start text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{language === 'lt' ? 'Nemokama registracija' : 'Free registration'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>{language === 'lt' ? 'Rezultatai per minutes' : 'Results in minutes'}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-xl border bg-card p-6 shadow-2xl">
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-purple-500/10 blur-3xl" />

                <div className="relative space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {language === 'lt' ? 'AI Analizė' : 'AI Analysis'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'lt' ? 'Vinted ginčas - prekė nepristatyta' : 'Vinted dispute - item not delivered'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        {language === 'lt' ? 'Laimėjimo tikimybė' : 'Win Probability'}
                      </span>
                      <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                        78%
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-green-200 dark:bg-green-800">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: '78%' }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {language === 'lt' ? 'Teisinis pagrindas:' : 'Legal basis:'}
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        CK 6.228 str. - Vartotojų teisių apsauga
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        CK 6.362 str. - Pirkimo-pardavimo sutartis
                      </li>
                    </ul>
                  </div>

                  <Button className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    {language === 'lt' ? 'Generuoti pretenziją' : 'Generate Demand Letter'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">
              {language === 'lt' ? 'Kokias bylas sprendžiame?' : 'What cases do we handle?'}
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              {language === 'lt'
                ? 'Teisės Draugas padeda spręsti įvairius civilinius ginčus iki 5000 EUR'
                : 'Teisės Draugas helps resolve various civil disputes up to 5000 EUR'}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full card-hover">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <useCase.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{language === 'lt' ? useCase.titleLt : useCase.titleEn}</CardTitle>
                    <CardDescription>
                      {language === 'lt' ? useCase.descLt : useCase.descEn}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">{t('features.title')}</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              {language === 'lt'
                ? 'Visos funkcijos, kurių reikia norint sėkmingai išspręsti civilinį ginčą'
                : 'All the features you need to successfully resolve a civil dispute'}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">
                      {language === 'lt' ? feature.titleLt : feature.titleEn}
                    </CardTitle>
                    <CardDescription>
                      {language === 'lt' ? feature.descLt : feature.descEn}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">
              {language === 'lt' ? 'Kaip tai veikia?' : 'How does it work?'}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="mx-auto h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mb-4">
                  {step.num}
                </div>
                <h3 className="font-semibold mb-2">
                  {language === 'lt' ? step.titleLt : step.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'lt' ? step.descLt : step.descEn}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Disclaimer Section */}
      <section className="py-16">
        <div className="container px-4 max-w-3xl">
          <AIDisclaimer variant="inline" showDetails />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {language === 'lt'
              ? 'Pasiruošę spręsti savo ginčą?'
              : 'Ready to resolve your dispute?'}
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            {language === 'lt'
              ? 'Pradėkite nemokamai ir sužinokite savo laimėjimo tikimybę per kelias minutes'
              : 'Start for free and find out your win probability in just a few minutes'}
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary">
              {t('hero.cta')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
