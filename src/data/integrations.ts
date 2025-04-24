import { Integration } from "types/integrations";

const integrations: Record<string, Integration> = {
  circles: {
    id: 'circles',
    name: 'Circles Wallet',
    title: 'Connect your Circles Wallet',
    description: 'Link your Circles address to your POHID and experience trust benefits.',
    logo: '/images/integrations/circles-logo.png',
    isActive: true,
    startPath: 'app/circles',
    buttonText: 'Start Now',
    connectionSteps: [
      {
        id: 'start',
        title: 'Start',
        description: 'Sign up for Circles mobile. Tap Join to create a new account, Login to sign in, or Import to import an existing wallet.',
        image: '/images/integrations/circles-start.png',
      },
      {
        id: 'createProfile',
        title: 'Create a profile',
        description: 'Log in and create a profile. Follow the simple steps within Circles to create your wallet and secure it with a passkey stored in your device\'s password manager.',
        image: '/images/integrations/circles-create-profile.png',
      },
      {
        id: 'newAccount',
        title: 'Create a New Account',
        description: 'Enter your mobile number and tap Continue to proceed.',
        image: '/images/integrations/circles-new-account.png',
      },
      {
        id: 'activateAccount',
        title: 'Activate your account',
        description: 'Share your QR code with an existing user to activate your account.',
        image: '/images/integrations/circles-activate-account.png',
      },
      {
        id: 'onceActivated',
        title: 'Once activated',
        description: 'Once invited to Circles, copy your wallet address by clicking on the icon on the left of your profile picture.',
        image: '/images/integrations/circles-once-activated.png',
      },
      {
        id: 'copyAddress',
        title: 'Copy your address',
        description: 'Click on the copy icon to copy your wallet address. After this step, go back to the POH app to paste your address and finish your Circles connection (Step 2 below).',
        image: '/images/integrations/circles-copy-address.png',
      }
    ],
    externalLinks: [
      {
        label: 'Circles Website',
        url: 'https://joincircles.net',
        icon: 'globe'
      },
      {
        label: 'Documentation',
        url: 'https://joincircles.net/docs',
        icon: 'book'
      }
    ]
  },
  // More integrations can be added here
};

/**
 * Get all available integrations
 */
export async function getIntegrations(): Promise<Integration[]> {
  // Filter out inactive integrations
  return Object.values(integrations).filter(integration => integration.isActive);
}

/**
 * Get a single integration by ID
 */
export async function getIntegration(id: string): Promise<Integration | null> {
  return integrations[id] || null;
}