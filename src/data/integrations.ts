import { Integration } from "types/integrations";

const integrations: Record<string, Integration> = {
  circles: {
    id: 'circles',
    name: 'Circles Wallet',
    title: 'Connect your Circles Wallet',
    description: 'Join our Metri group, earn 24 $CRC/day, and mint our group $CRC for upcoming perks!',
    logo: '/images/integrations/circles-logo.png',
    isActive: true, // Temporarily disabled - App section not displayed in UI
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
        description: 'Share your QR code with an existing user to activate your account. Post your link on the |Circles Telegram community;https://t.me/about_circles| ↗️, and ask to get invited!',
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
        title: 'Minting our group $CRC tokens',
        description: 'Once you join the Metri App, you get 24 CRC (individual tokens) per day — one every hour. To mint our group\'s own $CRC tokens, use your phone to scan the QR code above, and swap your individual $CRCs for our group tokens.\n\nTo do this via the Metri app: visit your wallet balance, and \'Send\' the desired amount of individual $CRC you want to swap, to our group. You\'ll receive your group $CRC instantly.\n\nWe have benefits incoming for the largest holders of our group $CRC, soon!',
        image: '/images/integrations/mint-qr-code.png',
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