'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useAtlasProvider } from '@kleros/kleros-app';
import { useQuery } from '@tanstack/react-query';

import CheckCircle from 'icons/CheckCircleMajor.svg';
import WarningCircle from 'icons/WarningCircleMajor.svg';
import MinusCircle from 'icons/MinusCircleMajor.svg';
import CheckCircleMinor from 'icons/CheckCircleMinor.svg';
import WarningCircleMinor from 'icons/WarningCircleMinor.svg';
import MinusCircleMinor from 'icons/MinusCircleMinor.svg';
import ActionButton from 'components/ActionButton';
import { useSettingsPopover } from 'context/SettingsPopoverContext';

const ConfirmEmailPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { confirmEmail } = useAtlasProvider();
  const { openSettingsPopover } = useSettingsPopover();

  const address = searchParams.get('address');
  const token = searchParams.get('token');

  const { data, isPending, isError, status: queryStatus } = useQuery({
    queryKey: ['confirmEmail', address, token],
    queryFn: async () => {
      console.log('[ConfirmEmail] queryFn called with:', { address, token });
      if (!address || !token) {
        throw new Error('Missing address or token');
      }
      const result = await confirmEmail({ address, token });
      console.log('[ConfirmEmail] confirmEmail result:', result);
      return result;
    },
    enabled: !!address && !!token,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  console.log('[ConfirmEmail] render - queryStatus:', queryStatus, 'isPending:', isPending, 'isError:', isError, 'data:', data);

  const getVerificationStatus = () => {
    console.log('[ConfirmEmail] getVerificationStatus - address:', address, 'token:', token, 'isPending:', isPending, 'isError:', isError, 'data:', data);
    // Still loading or no params
    if (!address || !token) {
      console.log('[ConfirmEmail] status: invalid (no params)');
      return 'invalid';
    }
    if (isPending) {
      console.log('[ConfirmEmail] status: loading');
      return 'loading';
    }
    if (isError) {
      console.log('[ConfirmEmail] status: invalid (error)');
      return 'invalid';
    }
    if (data?.isConfirmed) {
      console.log('[ConfirmEmail] status: success');
      return 'success';
    }
    if (data?.isTokenExpired) {
      console.log('[ConfirmEmail] status: expired');
      return 'expired';
    }
    if (data?.isTokenInvalid) {
      console.log('[ConfirmEmail] status: invalid (token invalid)');
      return 'invalid';
    }
    console.log('[ConfirmEmail] status: invalid (fallback)');
    return 'invalid';
  };

  const status = getVerificationStatus();
  console.log('[ConfirmEmail] final status:', status);

  interface StatusConfig {
    title: string | React.ReactNode;
    description: string;
    titleColor: string;
    icon?: React.ComponentType<{ className?: string }>;
    largeIcon?: React.ComponentType<{ className?: string }>;
    onClick?: () => void;
    buttonText?: string;
  }

  const statusConfig: Record<'loading' | 'success' | 'expired' | 'invalid', StatusConfig> = {
    loading: {
      title: 'Verifying your email...',
      description: 'Please wait while we confirm your email address.',
      titleColor: 'text-orange',
    },
    success: {
      title: (
        <>
          Congratulations :)
          <div className="my-1" />
          Your email has been verified!
        </>
      ),
      description: "We'll remind you when your actions are required on POH, and send you notifications on key moments to help you achieve the best of Proof of Humanity.",
      titleColor: 'text-status-registered',
      buttonText: "Let's start!",
      icon: CheckCircleMinor,
      largeIcon: CheckCircle,
      onClick: () => {
        router.push('/');
      },
    },
    expired: {
      title: 'Verification link expired...',
      description: 'Oops, the email verification link has expired. No worries! Go to settings and click on Resend it to receive another verification email.',
      titleColor: 'text-status-revocation',
      buttonText: 'Open Settings',
      icon: WarningCircleMinor,
      largeIcon: WarningCircle,
      onClick: () => {
        openSettingsPopover();
      },
    },
    invalid: {
      title: 'Invalid link!',
      description: 'Oops, seems like you followed an invalid link.',
      titleColor: 'text-primaryText',
      buttonText: 'Contact support',
      icon: MinusCircleMinor,
      largeIcon: MinusCircle,
      onClick: () => {
        window.open('https://t.me/proofhumanity', '_blank');
      },
    },
  };

  const config = statusConfig[status];
  const { title, description, titleColor, buttonText, onClick, icon: IconComponent, largeIcon: LargeIconComponent } = config;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow flex items-center justify-center py-12 lg:py-24 lg:mt-24">
        <div className="mx-auto px-4 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 lg:gap-16 items-center lg:mx-14 xl:mx-32">

            {/* Content Section */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 lg:col-span-4">

              {IconComponent && (
                <div className="flex justify-center lg:justify-start">
                  <IconComponent />
                </div>
              )}

              <h1 className={`text-2xl md:text-3xl lg:text-4xl font-semibold ${titleColor} leading-tight`}>
                {title}
              </h1>

              <p className="text-base md:text-lg text-secondaryText leading-relaxed w-full">
                {description}
              </p>

              {onClick && buttonText &&
                <ActionButton
                  onClick={onClick}
                  label={buttonText}
                  className='px-8 py-3'
                />
              }
            </div>

            {/* Decorative Icon Section */}
            {LargeIconComponent && (
              <div className="flex items-center justify-center lg:justify-end lg:col-span-2">
                <LargeIconComponent />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmailPage;