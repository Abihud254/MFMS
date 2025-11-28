/** @jsxImportSource react */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Assuming a loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (!email) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setMessage(responseData.message || 'Password reset link sent to your email if an account exists.');
      } else {
        setError(responseData.error || 'Failed to send password reset email. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">Forgot Password</h1>
          <p className="text-gray-600 mt-2 text-lg">Enter your email to reset your password</p>
        </div>

        <Card className="shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Reset Your Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {message && (
                <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 text-base rounded-lg"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Sending Request...' : 'Send Reset Link'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>Remember your password? <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}
