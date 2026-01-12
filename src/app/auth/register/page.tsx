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
import { Scale, Loader2, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(
        language === 'lt'
          ? 'Slaptažodžiai nesutampa'
          : 'Passwords do not match'
      );
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError(
        language === 'lt'
          ? 'Slaptažodis turi būti bent 8 simbolių'
          : 'Password must be at least 8 characters'
      );
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          preferredLanguage: language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            (language === 'lt'
              ? 'Nepavyko sukurti paskyros'
              : 'Failed to create account')
        );
        return;
      }

      setSuccess(true);

      // Auto sign in after registration
      setTimeout(async () => {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.ok) {
          router.push('/dashboard');
        }
      }, 1500);
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {language === 'lt' ? 'Paskyra sukurta!' : 'Account created!'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'lt'
                ? 'Nukreipiame į valdymo skydelį...'
                : 'Redirecting to dashboard...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <CardTitle>{t('nav.register')}</CardTitle>
          <CardDescription>
            {language === 'lt'
              ? 'Sukurkite paskyrą nemokamai'
              : 'Create your account for free'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 p-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {language === 'lt' ? 'Vardas ir pavardė' : 'Full Name'}
              </Label>
              <Input
                id="name"
                placeholder={language === 'lt' ? 'Jonas Jonaitis' : 'John Doe'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

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
              <Label htmlFor="password">
                {language === 'lt' ? 'Slaptažodis' : 'Password'}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={language === 'lt' ? 'Mažiausiai 8 simboliai' : 'At least 8 characters'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {language === 'lt' ? 'Pakartokite slaptažodį' : 'Confirm Password'}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="text-xs text-muted-foreground">
              {language === 'lt' ? (
                <>
                  Registruodamiesi sutinkate su{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    naudojimo sąlygomis
                  </Link>{' '}
                  ir{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    privatumo politika
                  </Link>
                  .
                </>
              ) : (
                <>
                  By registering, you agree to our{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === 'lt' ? 'Kuriama...' : 'Creating...'}
                </>
              ) : (
                t('nav.register')
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {language === 'lt' ? 'Jau turite paskyrą?' : 'Already have an account?'}{' '}
            </span>
            <Link href="/auth/login" className="text-primary hover:underline">
              {t('nav.login')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
