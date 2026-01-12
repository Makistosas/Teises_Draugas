'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useLanguage } from '@/lib/i18n/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Loader2, Mail, Lock, Smartphone, CreditCard } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'credentials' | 'smart-id' | 'mobile-id'>('credentials');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    personalCode: '',
    country: 'LT',
    phoneNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (authMethod === 'credentials') {
        result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
      } else if (authMethod === 'smart-id') {
        result = await signIn('smart-id', {
          personalCode: formData.personalCode,
          country: formData.country,
          redirect: false,
        });
      } else if (authMethod === 'mobile-id') {
        result = await signIn('mobile-id', {
          phoneNumber: formData.phoneNumber,
          personalCode: formData.personalCode,
          redirect: false,
        });
      }

      if (result?.error) {
        setError(
          language === 'lt'
            ? 'Neteisingi prisijungimo duomenys'
            : 'Invalid credentials'
        );
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError(
        language === 'lt'
          ? 'Įvyko klaida. Bandykite dar kartą.'
          : 'An error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Scale className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Teisės Draugas</span>
          </Link>
          <CardTitle>{t('nav.login')}</CardTitle>
          <CardDescription>
            {language === 'lt'
              ? 'Prisijunkite prie savo paskyros'
              : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Auth Method Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={authMethod === 'credentials' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAuthMethod('credentials')}
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button
              variant={authMethod === 'smart-id' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAuthMethod('smart-id')}
              className="flex-1"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Smart-ID
            </Button>
            <Button
              variant={authMethod === 'mobile-id' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAuthMethod('mobile-id')}
              className="flex-1"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile-ID
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 p-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMethod === 'credentials' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {language === 'lt' ? 'El. paštas' : 'Email'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jonas@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">
                      {language === 'lt' ? 'Slaptažodis' : 'Password'}
                    </Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      {language === 'lt' ? 'Pamiršote?' : 'Forgot?'}
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {authMethod === 'smart-id' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="personalCode">
                    {language === 'lt' ? 'Asmens kodas' : 'Personal Code'}
                  </Label>
                  <Input
                    id="personalCode"
                    placeholder="39001010000"
                    value={formData.personalCode}
                    onChange={(e) => setFormData({ ...formData, personalCode: e.target.value })}
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'lt'
                    ? 'Patvirtinimo užklausa bus išsiųsta į jūsų Smart-ID programėlę'
                    : 'Confirmation request will be sent to your Smart-ID app'}
                </p>
              </div>
            )}

            {authMethod === 'mobile-id' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">
                    {language === 'lt' ? 'Telefono numeris' : 'Phone Number'}
                  </Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+37060000000"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobilePersonalCode">
                    {language === 'lt' ? 'Asmens kodas' : 'Personal Code'}
                  </Label>
                  <Input
                    id="mobilePersonalCode"
                    placeholder="39001010000"
                    value={formData.personalCode}
                    onChange={(e) => setFormData({ ...formData, personalCode: e.target.value })}
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'lt'
                    ? 'Patvirtinimo PIN bus išsiųstas SMS žinute'
                    : 'Confirmation PIN will be sent via SMS'}
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === 'lt' ? 'Jungiamasi...' : 'Signing in...'}
                </>
              ) : (
                t('nav.login')
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {language === 'lt' ? 'Neturite paskyros?' : "Don't have an account?"}{' '}
            </span>
            <Link href="/auth/register" className="text-primary hover:underline">
              {t('nav.register')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
