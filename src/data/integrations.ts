import { Integration } from "types/integrations";

const integrations: Record<string, Integration> = {
  circles: {
    id: 'circles',
    name: 'Circles Wallet',
    title: 'Connect your Circles Wallet',
    description: 'Link your Circles address to your POHID and experience trust benefits.',
    logo: '/images/integrations/circles-logo.png',
    isActive: false, // Temporarily disabled - App section not displayed in UI
    startPath: 'app/circles',
    buttonText: 'Start Now',
    connectionSteps: [
      {
        id: 'start',
        title: 'Start',
        description: 'Sign up for |Metri wallet;https://app.metri.xyz|. ',
        image: '/images/integrations/circles-start.png',
      },
      {
        id: 'createProfile',
        title: 'Create a profile',
        description: 'Log in and create a profile. Follow the simple steps within Circles to create your wallet and secure it with a passkey stored in your device\'s password manager.',
        image: '/images/integrations/circles-create-profile.png',
      },
      {
        id: 'activateAccount',
        title: 'Activate your account',
        description: 'Share your QR code with an existing user to activate your account.',
        disclaimer: 'IMPORTANT: You need to be invited into Circles to be able to join the POH-circles group.',
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
    mintSteps: [
      {
        id: 'collectCRC',
        title: 'Collecting CRC',
        description: 'Once your Circles account is created you get 24 CRC (individual tokens) per day — one every hour. To mint POH Circles group tokens, sign in to |Circles UI;https://app.aboutcircles.com|, go to Contacts at the top, then select the POH Minter.',
        image: '/images/integrations/collect-crc.png',
      },
      {
        id: 'selectPOHMinter',
        title: 'Selecting the POH Minter',
        description: 'The POH Minter transforms individual tokens into POH Circles group tokens. Click Send and select your personal tokens to start minting.',
        image: '/images/integrations/select-poh-minter.png',
      },
      {
        id: 'mintGroupTokens',
        title: 'Minting Group Tokens',
        description: 'Enter the amount, click Continue, and confirm the transaction to mint your group tokens.',
        image: '/images/integrations/mint-group-tokens.png',
      },
      {
        id: 'success',
        title: 'Success!',
        description: 'Congratulations! You now have POH Circles group tokens.',
        image: '/images/integrations/circles-success.png',
      }
    ],
  },
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