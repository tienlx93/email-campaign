import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRegisterMutation } from '@/store/api';
import { setCredentials, selectToken } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { registerSchema, type RegisterFormValues } from '@/validations/auth';

export function RegisterPage() {
  const token = useAppSelector(selectToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register: rhfRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  if (token) return <Navigate to="/campaigns" replace />;

  async function onSubmit(values: RegisterFormValues) {
    setApiError(null);
    try {
      const result = await register(values).unwrap();
      dispatch(setCredentials({ token: result.token, user: result.user }));
      void navigate('/campaigns');
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        setApiError('An account with this email already exists');
      } else if (status === 400) {
        const data = err as { data?: { error?: string } };
        setApiError(data?.data?.error ?? 'Please check your input and try again');
      } else {
        setApiError('Something went wrong. Please try again.');
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Alice Smith"
                {...rhfRegister('name')}
                onChange={(e) => {
                  setApiError(null);
                  void rhfRegister('name').onChange(e);
                }}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...rhfRegister('email')}
                onChange={(e) => {
                  setApiError(null);
                  void rhfRegister('email').onChange(e);
                }}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...rhfRegister('password')}
                onChange={(e) => {
                  setApiError(null);
                  void rhfRegister('password').onChange(e);
                }}
              />
              {errors.password ? (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              ) : (
                <p className="text-sm text-muted-foreground">At least 8 characters</p>
              )}
            </div>

            {apiError && (
              <Alert variant="destructive">
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />}
              Create account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="underline underline-offset-4 hover:text-foreground">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
