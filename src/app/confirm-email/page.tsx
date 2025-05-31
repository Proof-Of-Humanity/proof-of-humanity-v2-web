'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAtlasProvider } from '@kleros/kleros-app';
import Link from 'next/link';

enum VerificationStatus {
  LOADING,
  SUCCESS,
  ERROR,
  INVALID_PARAMS
}

const ConfirmEmailPage: React.FC = () => {
  const searchParams = useSearchParams();
  const { confirmEmail } = useAtlasProvider();
  const [status, setStatus] = useState<VerificationStatus>(VerificationStatus.LOADING);
  const [message, setMessage] = useState<string>('Verifying your email, please wait...');

  useEffect(() => {
    const address = searchParams.get('address');
    const token = searchParams.get('token');

    if (!address || !token) {
      setStatus(VerificationStatus.INVALID_PARAMS);
      setMessage('Invalid verification link: Required information is missing.');
      return;
    }

    const verify = async () => {
      try {
        if (!confirmEmail) {
          setStatus(VerificationStatus.ERROR);
          setMessage('Verification service is currently unavailable. Please try again later.');
          return;
        }
        const { isConfirmed, isTokenExpired, isTokenInvalid, isError } = await confirmEmail({ address, token });

        if (isError) {
          setStatus(VerificationStatus.ERROR);
          setMessage('An unexpected error occurred during email verification. Please try again.');
          return;
        }

        if (isConfirmed) {
          setStatus(VerificationStatus.SUCCESS);
          setMessage('Email verified successfully! You can now close this page.');
        } else {
          setStatus(VerificationStatus.ERROR);
          if (isTokenExpired) {
            setMessage('Email verification failed: The link has expired. Please request a new one.');
          } else if (isTokenInvalid) {
            setMessage('Email verification failed: The link is invalid.');
          } else {
            setMessage('Email verification failed. Please try again or request a new verification link.');
          }
        }
      } catch (error) {
        console.error('Email confirmation error:', error);
        setStatus(VerificationStatus.ERROR);
        setMessage('An error occurred during email verification. Please try again.');
      }
    };

    verify();
  }, [searchParams, confirmEmail]);

  const renderContent = () => {
    let textColor = 'text-gray-700';
    if (status === VerificationStatus.SUCCESS) {
      textColor = 'text-green-600';
    } else if (status === VerificationStatus.ERROR || status === VerificationStatus.INVALID_PARAMS) {
      textColor = 'text-red-600';
    }

    return (
      <div className={`p-4 md:p-8 rounded-lg shadow-lg bg-white text-center ${textColor}`}>
        {status === VerificationStatus.LOADING && (
          <div className="flex justify-center items-center mb-4">
            <span 
              className="inline-block w-8 h-8 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"
              role="status"
            />
          </div>
        )}
        <p className="text-lg font-medium">{message}</p>
        {(status === VerificationStatus.SUCCESS || status === VerificationStatus.ERROR || status === VerificationStatus.INVALID_PARAMS) && (
          <div className="mt-6">
            <Link href="/" legacyBehavior>
              <a className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                Go to Homepage
              </a>
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default ConfirmEmailPage; 