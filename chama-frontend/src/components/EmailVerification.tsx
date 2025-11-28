/** @jsxImportSource react */
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';

export function EmailVerification() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { token } = useParams();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus('error');
        setMessage('No verification token found.');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verifyemail/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const responseData = await response.json();

        if (response.ok) {
          setVerificationStatus('success');
          setMessage(responseData.message || 'Your email has been successfully verified!');
        } else {
          setVerificationStatus('error');
          setMessage(responseData.error || 'Email verification failed. The link might be invalid or expired.');
        }
      } catch (err) {
        setVerificationStatus('error');
        setMessage('An error occurred during verification. Please check your network and try again.');
      }
    };

    verifyEmail();
  }, [token]);

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <div className="flex flex-col items-center space-y-4">
            <Loader className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-gray-700">Verifying your email...</p>
          </div>
        );
      case 'success':
        return (
          <Alert variant="default" className="bg-green-50 border-green-200 text-green-800 text-center flex flex-col items-center">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <AlertDescription className="text-lg font-semibold">{message}</AlertDescription>
            <div className="mt-6">
              <Link to="/login" className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors">Go to Login</Link>
            </div>
          </Alert>
        );
      case 'error':
        return (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 text-center flex flex-col items-center">
            <XCircle className="h-12 w-12 text-red-600 mb-4" />
            <AlertDescription className="text-lg font-semibold">{message}</AlertDescription>
            <div className="mt-6">
              <Link to="/register" className="px-6 py-3 bg-secondary text-gray-800 rounded-lg font-bold hover:bg-gray-200 transition-colors">Try Registering Again</Link>
            </div>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">Email Verification</h1>
        </div>

        <Card className="shadow-2xl rounded-2xl p-6">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
