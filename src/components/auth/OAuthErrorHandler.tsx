import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaInfoCircle,
  FaExternalLinkAlt 
} from 'react-icons/fa';

interface OAuthErrorHandlerProps {
  error: string;
  provider?: string;
}

export const OAuthErrorHandler: React.FC<OAuthErrorHandlerProps> = ({ error, provider }) => {
  const getErrorDetails = () => {
    if (error.includes('provider is not enabled')) {
      return {
        title: 'OAuth Provider Not Enabled',
        description: `The ${provider || 'OAuth'} provider is not enabled in your Supabase project.`,
        type: 'warning',
        solution: {
          steps: [
            'Go to your Supabase dashboard',
            `Navigate to Authentication → Providers → ${provider || 'OAuth Provider'}`,
            'Toggle the provider to "Enabled"',
            'Add your OAuth app credentials (Client ID and Secret)',
            'Save the changes and try again',
          ],
          link: 'https://app.supabase.com',
        },
      };
    }

    if (error.includes('redirect_uri_mismatch')) {
      return {
        title: 'Redirect URI Mismatch',
        description: 'The callback URL doesn\'t match the one configured in your OAuth app.',
        type: 'error',
        solution: {
          steps: [
            `Go to your ${provider || 'OAuth'} app settings`,
            'Add this callback URL:',
            `${window.location.origin}/auth/callback`,
            'Save the changes and try again',
          ],
        },
      };
    }

    if (error.includes('invalid_client')) {
      return {
        title: 'Invalid OAuth Credentials',
        description: 'The OAuth client credentials are incorrect or have been revoked.',
        type: 'error',
        solution: {
          steps: [
            'Verify your OAuth app credentials',
            'Check for extra spaces in Client ID/Secret',
            'Regenerate credentials if necessary',
            'Update them in Supabase dashboard',
          ],
        },
      };
    }

    if (error.includes('access_denied')) {
      return {
        title: 'Access Denied',
        description: 'You denied access to the OAuth application.',
        type: 'info',
        solution: {
          steps: [
            'Click the login button again',
            'Grant the requested permissions',
            'Complete the authentication flow',
          ],
        },
      };
    }

    return {
      title: 'Authentication Error',
      description: error || 'An unexpected error occurred during authentication.',
      type: 'error',
      solution: {
        steps: [
          'Check your internet connection',
          'Clear your browser cache and cookies',
          'Try a different browser or incognito mode',
          'Contact support if the issue persists',
        ],
      },
    };
  };

  const errorDetails = getErrorDetails();
  const IconComponent = errorDetails.type === 'warning' 
    ? FaExclamationTriangle 
    : errorDetails.type === 'info' 
    ? FaInfoCircle 
    : FaExclamationTriangle;

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <Alert variant={errorDetails.type === 'error' ? 'destructive' : 'default'}>
        <IconComponent className="h-4 w-4" />
        <AlertTitle>{errorDetails.title}</AlertTitle>
        <AlertDescription>{errorDetails.description}</AlertDescription>
      </Alert>

      {errorDetails.solution && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">How to fix this:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {errorDetails.solution.steps.map((step, index) => (
              <li key={index} className="leading-relaxed">
                {step}
                {step.includes('callback URL:') && (
                  <code className="block mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    {window.location.origin}/auth/callback
                  </code>
                )}
              </li>
            ))}
          </ol>

          {errorDetails.solution.link && (
            <div className="mt-4">
              <Button
                onClick={() => window.open(errorDetails.solution.link, '_blank')}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Open Supabase Dashboard
                <FaExternalLinkAlt className="ml-2 h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold mb-2">Need more help?</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => window.location.href = '/auth/login'}
            variant="default"
            className="w-full sm:w-auto"
          >
            Back to Login
          </Button>
          <Button
            onClick={() => window.open('https://supabase.com/docs/guides/auth/social-login', '_blank')}
            variant="outline"
            className="w-full sm:w-auto"
          >
            View Documentation
            <FaExternalLinkAlt className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Success State Helper */}
      {!error && (
        <Alert className="mt-4">
          <FaCheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Setup Complete!</AlertTitle>
          <AlertDescription>
            OAuth providers are now properly configured. Try logging in again.
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
};