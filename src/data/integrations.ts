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
    title: 'PNK Airdrop',
    headerTitle: 'Register. Earn. Stake. Repeat. Start Your Passive Income Journey with PNK!',
    headerDescription: 'Welcome to the Proof of Humanity Verified 10K Campaign! To celebrate the launch of Proof of Humanity v2 and our growing community, we’re rewarding the first 10,000 verified humans on the PoH v2 registry with PNK tokens, which will be staked on Kleros Court to become a juror!',
    description: 'Earn PNK tokens for being human.',
    logo: '/images/kleros-logo.png',
    darkLogo: '/logo/kleros.svg',
    isActive: false,
    startPath: 'app/pnk-airdrop',
    buttonText: 'Start Now',
    firstInfoSlide: [
      {
        id: 'klerosInfo',
        title: 'What is Kleros?',
        description: 'Kleros is a decentralized dispute resolution protocol. Think of it as the “People’s Court” powered by Ethereum smart contracts and crowdsourced jurors. It’s used to settle disagreements where trust is hard like freelancing, DeFi, content moderation, identity, crypto token listings, and more.',
        image: '/images/integrations/kleros-slide1.png',
        bulletPoints: [
          'More than 2,000+ disputes resolved.',
          'Millions of PNK staked, securing the system.',
          'Millions in crypto rewards paid to jurors across Ethereum and Gnosis Chain.'
        ]
      },
      {
        id: 'howItWorks',
        title: 'How Does It Work?',
        description: 'A dispute arises (e.g., "Did the challenge profile comply with the PoH Registry Policy")\n\n⚖️ The case is sent to Kleros.\n👩‍⚖️ Jurors are randomly selected from a pool of users who have staked PNK tokens.\n📜 Jurors review evidence & vote.\n🧠 Majority wins and decision is enforced by smart contract.',
        image: '/images/integrations/kleros-slide2.png',
        bulletPoints: [
          'Decentralized',
          'Fair',
          'Autonomous'
        ]
      },
      {
        id: 'whyUseKleros',
        title: 'Why Use Kleros?',
        description: '🔥 Unbiased & Fair Decisions: Jurors don\'t know each other\n🔒 Censorship-Resistant & Trustless: No single point of control\n⚡ Fast and Affordable Justice: Way cheaper than traditional courts\n🌍 Global Access, Borderless Justice: Anyone, anywhere can get justice\n🎮 Game-Theory Powered: Honest outcomes through aligned incentives',
        image: '/images/integrations/kleros-slide3.png',
        bulletPoints: [
          'Stake PNK to join the Monthly Juror Incentive Program.',
          'Earn more by making coherent votes and funding successful appeals.',
          'Be part of the decentralized justice movement with Kleros.'
        ]
      },
      {
        id: 'becomeJuror',
        title: 'Turn Your PNK Into Passive Income: Become a Juror!',
        description: 'To become a Kleros juror, you need to stake PNK (Kleros\' native token) in a specific court. For example, the Humanity Court. Once staked, subscribe to notifications so you\'ll be alerted when you\'re randomly selected to judge a case.\n\nThe more PNK you stake, the higher your chances of being selected. But remember, jurors are expected to vote honestly and coherently based on the evidence.\n\n✅ Coherent Vote (Align with the majority) = 🤑 Earn arbitration fees + extra PNK\n❌ Incoherent Vote (Against the majority) = 😬 Lose some staked PNK',
        image: '/images/integrations/kleros-slide4.png',
        bulletPoints: [
          'Stake > Judge > Earn > Repeat',
          '🌐 [Kleros.io](https://kleros.io) | 📚 [Documentation](https://docs.kleros.io) | 📊 [Klerosboard](https://klerosboard.com/1)'
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