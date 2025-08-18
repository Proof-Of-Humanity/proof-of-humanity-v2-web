import { Integration } from "types/integrations";

const integrations: Record<string, Integration> = {
  circles: {
    id: 'circles',
    name: 'Circles Wallet',
    title: 'Connect your Circles Wallet',
    description: 'Join our Metri group, earn 24 $CRC/day, and mint our group $CRC for upcoming perks!',
    logo: '/images/integrations/circles-logo.png',
    isActive: true,
    startPath: 'app/circles',
    buttonText: 'Start Now',
    firstInfoSlide: [
      {
        id: 'start',
        title: 'Start',
        description: 'Sign up for |Metri;https://app.metri.xyz| on your desktop, or preferably your mobile browser.',
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
        disclaimer: 'IMPORTANT: You need to be invited into Circles to be able to join the group.',
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
    secondInfoSlide: [
      // {
      //   id: 'collectCRC',
      //   title: 'Collecting CRC',
      //   description: 'Once your Circles account is created you get 24 CRC (individual tokens) per day — one every hour. To mint POH Circles group tokens, sign in to |Circles UI;https://app.aboutcircles.com|, go to Contacts at the top, then select the POH Minter.',
      //   image: '/images/integrations/collect-crc.png',
      // },
      // {
      //   id: 'selectPOHMinter',
      //   title: 'Selecting the POH Minter',
      //   description: 'The POH Minter transforms individual tokens into POH Circles group tokens. Click Send and select your personal tokens to start minting.',
      //   image: '/images/integrations/select-poh-minter.png',
      // },
      {
        id: 'mintGroupTokens',
        title: 'Minting our group $CRC tokens',
        description: 'Once you join the Metri App, you get 24 CRC (individual tokens) per day — one every hour. To mint our group\'s own $CRC tokens, use your phone to scan the QR code above, and swap your individual $CRCs for our group tokens.\n\nTo do this via the Metri app: visit your wallet balance, and \'Send\' the desired amount of individual $CRC you want to swap, to our group. You\'ll receive your group $CRC instantly.',
        image: '/images/integrations/mint-qr-code.png',
      },
      // {
      //   id: 'success',
      //   title: 'Success!',
      //   description: 'Congratulations! You now have POH Circles group tokens.',
      //   image: '/images/integrations/circles-success.png',
      // }
    ],
  },

  'pnk-airdrop': {
    id: 'pnk-airdrop',
    name: 'PNK Airdrop',
    title: 'Kleros PNK Airdrop',
    headerTitle: 'Join the Verified 10K: Earn PNK for Being Human',
    headerDescription: 'Welcome to the Proof of Humanity Verified 10K Campaign! To celebrate our growing community and promote the adoption of decentralized identity, we\'re rewarding the first 10,000 verified humans on the PoH v2 registry with PNK tokens.',
    description: 'Earn PNK tokens for being human.',
    logo: '/images/kleros-logo.png',
    isActive: true,
    startPath: 'app/pnk-airdrop',
    buttonText: 'Start Now',
    firstInfoSlide: [
      {
        id: 'klerosInfo',
        title: 'What is Kleros?',
        description: 'Kleros is a decentralized dispute resolution protocol. Think of it as the “People’s Court” powered by Ethereum smart contracts and crowdsourced jurors. It’s used to settle disagreements where trust is hard — like freelancing, DeFi, content moderation, identity, crypto token listings, and more.',
        image: '/images/integrations/kleros-slide1.png',
        bulletPoints: [
          'More than 2000+ disputes resolved',
        ]
      },
      {
        id: 'howItWorks',
        title: 'How Does It Work?',
        description: 'A dispute arises (e.g., "Did the job get done?", "Did the profile comply with the rules?")\n\n⚖️ The case is sent to Kleros\n👩‍⚖️ Jurors are randomly selected from a pool\n📜 Jurors review evidence & vote\n🧠 Majority wins — decision enforced by smart contract',
        image: '/images/integrations/kleros-slide2.png',
        bulletPoints: [
          'Transparent',
          'Enforced by code',
          'Trustless'
        ]
      },
      {
        id: 'whyUseKleros',
        title: 'Why Use Kleros?',
        description: '🔥 Unbiased Decisions — Jurors don\'t know each other\n🔒 Censorship-Resistant — No single point of control\n⚡ Fast & Affordable — Way cheaper than traditional courts\n🌍 Global by Default — Anyone, anywhere can get justice\n🎮 Game-Theory Powered — Incentives = honest outcomes',
        image: '/images/integrations/kleros-slide3.png',
        bulletPoints: [
          'You earn monthly staking rewards by staking PNK on Kleros Court',
          'You can win additional rewards by working as a juror, or contributing to appeals.'
        ]
      },
      {
        id: 'becomeJuror',
        title: 'How I Become a Juror?',
        description: 'To become a juror, you stake PNK (Kleros\' token) into a specific court (eg. Humanity court), subscribe for notifications to get alerts when you are selected to judge a case. The more you stake, the more likely you are to be selected as a juror. But it\'s not free lunch...\n\n🧠 Vote well = 🤑 Earn fees + PNK\n🙃 Vote badly = 😬 Lose staked PNK\n\n💰 Earn PNK for fair rulings',
        image: '/images/integrations/kleros-slide4.png',
        bulletPoints: [
          'Stake > Judge > Earn > Repeat',
          'Visit: [Kleros.io](https://kleros.io) | [Documentation](https://docs.kleros.io) | [klerosboard](https://klerosboard.com/1)'
        ]
      }
    ]
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