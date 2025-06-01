'use client';

import { useEffect } from 'react'; 
import { useSearchParams } from 'next/navigation';
import { useAtlasProvider } from '@kleros/kleros-app';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';


const ConfirmEmailPage: React.FC = () => {
  const searchParams = useSearchParams();
  const { confirmEmail } = useAtlasProvider();

  const address = searchParams.get('address');
  const token = searchParams.get('token');

  const mutation = useMutation({
    mutationFn: async ({ address, token }: { address: string; token: string }) => {
      return await confirmEmail({ address, token });
    },
    retry: false,
  });

  useEffect(() => {
    if (address && token && mutation.status === 'idle') {
      mutation.mutate({ address, token });
    }
  }, [address, token]);

  const getStatus = () => {
    if (mutation.isSuccess && mutation.data?.isConfirmed) {
      return {
        icon: (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-status-registered/10">
            <svg
              className="h-8 w-8 text-status-registered"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        ),
        color: 'text-status-registered',
        title: 'Email Verified!'
      };
    }

    if (mutation.isError || (!address || !token) || (mutation.isSuccess && !mutation.data?.isConfirmed)) {
      return {
        icon: (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-status-rejected/10">
            <svg
              className="h-8 w-8 text-status-rejected"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        ),
        color: 'text-status-rejected',
        title: 'Verification Failed'
      };
    }

    return {
      icon: (
        <div className="flex h-16 w-16 items-center justify-center">
          <Image
            alt="loading"
            src="/logo/poh-colored.svg"
            className="animate-flip"
            width={32}
            height={32}
          />
        </div>
      ),
      color: 'text-primaryText',
      title: 'Verifying Email...'
    };
  };

  const getMessage = () => {
    if (!address || !token) {
      return 'Invalid verification link: Required information is missing.';
    }

    if (mutation.isPending) {
      return 'Verifying your email, please wait...';
    }

    if (mutation.isSuccess) {
      if (mutation.data?.isConfirmed) {
        return 'Email verified successfully! You can now close this page.';
      } else {
        const { isTokenExpired, isTokenInvalid } = mutation.data || {};
        if (isTokenExpired) {
          return 'Email verification failed: The link has expired. Please request a new one.';
        } else if (isTokenInvalid) {
          return 'Email verification failed: The link is invalid.';
        } else {
          return 'Email verification failed. Please try again or request a new verification link.';
        }
      }
    }

    if (mutation.isError) {
      return 'An unexpected error occurred during email verification. Please try again.';
    }

    return 'Verifying your email, please wait...';
  };

  const status = getStatus();
  const isLoading = mutation.isPending;
  const hasError = mutation.isError || (!address || !token) || (mutation.isSuccess && !mutation.data?.isConfirmed);

  return (
    <div className="flex min-h-full items-center justify-center py-8">
      <div className="content mx-auto w-[84vw] max-w-[600px] md:w-[76vw]">
        <div className="paper p-8 md:p-12">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              {status.icon}
            </div>

            <h1 className={`mb-4 text-2xl font-bold ${status.color}`}>
              {status.title}
            </h1>

            <p className="text-secondaryText mb-8 text-lg leading-relaxed">
              {getMessage()}
            </p>

            {!isLoading && (
              <Link href="/" className="w-full sm:w-auto">
                <button className="btn-main w-full px-8 py-3 sm:w-auto">
                  Return to Homepage
                </button>
              </Link>
            )}

            {/* Additional Info for Errors */}
            {hasError && (
              <div className="bg-primaryBackground mt-6 rounded-lg p-4">
                <p className="text-secondaryText text-sm">
                  Need help? Contact support or try requesting a new verification email.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmailPage; 