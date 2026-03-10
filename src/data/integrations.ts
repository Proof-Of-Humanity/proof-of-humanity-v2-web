import { Integration } from "types/integrations";

const integrations: Record<string, Integration> = {
  circles: {
    id: 'circles',
    name: 'Circles Wallet',
    title: 'Start Earning 24 $CRC Per Day',
    description: 'Join our group on the Gnosis App to start your daily income and unlock exclusive perks!',
    logo: '/images/integrations/circles-logo.png',
    logoWidth: 164,
    logoHeight: 48,
    isActive: true,
    startPath: 'app/circles',
    buttonText: 'Start Earning',
    firstInfoSlide: [
      {
        id: 'start',
        title: 'Start',
        description: 'Sign up for the [Gnosis App](https://app.gnosis.io/) on your desktop, or preferably your mobile browser.',
        image: '/images/integrations/circles-step1.png',
      },
      {
        id: 'createProfile',
        title: 'Create A Profile',
        description: 'Log in and create a profile. Follow the simple steps within the Gnosis App to create your wallet and secure it with a passkey stored in your device\'s password manager.',
        image: '/images/integrations/circles-step2.png',
      },
      {
        id: 'activateAccount',
        title: 'Activate Your Circles Account',
        description: 'Go the \'Circles\' tab → \'Find an invite\' and share your QR code with an existing user to activate your account. Post your link on the [Circles Telegram community](https://t.me/about_circles) ↗️, and ask to get invited!',
        disclaimer: '(!) Important: You need to be invited into Circles to be able to join our group.',
        image: '/images/integrations/circles-step3.png',
      },
      {
        id: 'onceActivated',
        title: 'Post Activation',
        description: 'Once invited to Circles, copy your wallet address by clicking on the icon on the left of your profile picture.',
        image: '/images/integrations/circles-step4.png',
      },
      {
        id: 'copyAddress',
        title: 'Copy Your Address',
        description: 'Click on the \'copy\' icon to copy your wallet address. Now go back to the Proof Of Humanity page to paste your address and finish your Circles connection (Step 2 below).',
        image: '/images/integrations/circles-step5.png',
      }
    ],
    secondInfoSlide: [
      {
        id: 'mintGroupTokens',
        title: 'Minting our group $CRC tokens',
        description: 'Once you join the Gnosis App, you get 24 CRC (individual tokens) per day — one every hour. To mint our group\'s own $CRC tokens, use your phone to scan the QR code above, and swap your individual $CRCs for our group tokens.\n\n To do this via the Gnosis app: visit your wallet balance, and \'Send\' the desired amount of individual $CRC you want to swap, to our group. You\'ll receive your group $CRC instantly.',
        image: '/images/integrations/mint-qr-code.png',
      },
    ],
  },

  'pnk-airdrop': {
    id: 'pnk-airdrop',
    name: 'PNK Airdrop',
    title: 'PNK Airdrop',
    headerTitle: 'Register. Earn. Stake. Repeat. Start Your Earning Journey with PNK!',
    headerDescription: 'Welcome to the Proof of Humanity Verified 10K Campaign! To celebrate the launch of Proof of Humanity v2 and our growing community, we\'re rewarding the first 10,000 verified humans on the PoH v2 registry with PNK tokens, which will be staked on Kleros Court to become a juror!',
    description: 'Earn PNK tokens for being human.',
    logo: '/images/kleros-logo.png',
    logoWidth: 164,
    logoHeight: 48,
    darkLogo: '/logo/kleros.svg',
    isActive: true,
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
        title: 'Turn Your PNK Into Earning Opportunities: Become a Juror!',
        description: 'To become a Kleros juror, you need to stake PNK (Kleros\' native token) in a specific court. For example, the Humanity Court. Once staked, subscribe to notifications so you\'ll be alerted when you\'re randomly selected to judge a case.\n\nThe more PNK you stake, the higher your chances of being selected. But remember, jurors are expected to vote honestly and coherently based on the evidence.\n\n✅ Coherent Vote (Align with the majority) = 🤑 Earn arbitration fees + extra PNK\n❌ Incoherent Vote (Against the majority) = 😬 Lose some staked PNK',
        image: '/images/integrations/kleros-slide4.png',
        bulletPoints: [
          'Stake > Judge > Earn > Repeat',
          '🌐 [Kleros.io](https://kleros.io) | 📚 [Documentation](https://docs.kleros.io) | 📊 [Klerosboard](https://klerosboard.com/1)'
        ]
      }
    ]
  },

  'seer-credits': {
    id: 'seer-credits',
    name: 'Seer Credits',
    title: 'Unlock your $10 / month Seer Balance',
    description: 'Claim your credits every month, and place your predictions on Seer.',
    logo: '/images/integrations/seer-logo.png',
    logoWidth: 164,
    logoHeight: 48,
    darkLogo: '/images/seer-logo-white.png',
    isActive: true,
    startPath: 'app/seer-credits',
    buttonText: 'Claim $10',
    firstInfoSlide: [
      {
        id: 'whatIsSeer',
        title: 'What is Seer?',
        description: 'Seer is a prediction market platform that lets people predict outcomes and **earn based on how accurate** their predictions are.\n\nIn Seer, users can make predictions about future outcomes like "Will Bitcoin ever reach a new all-time high before the end of the year?" or "Who will win the 2028 presidential election?" and **earn** if their predictions turn out to be correct.\n\nThink of it as a community-driven way to forecast events, where the wisdom of the crowd determines the **most likely outcome.**',
        image: '/images/integrations/seer-slide1.png',
        imageHeight: 601,
        imageWidth: 1094,
      },
      {
        id: 'whyDifferent',
        title: 'Why is Seer different?',
        description: 'Unlike traditional betting or centralized platforms, Seer runs entirely on smart contracts, meaning **no middlemen, no manipulation and no hidden rules**. Every market is open, verifiable and secured.\n\n• **Transparent**: Enables the creation and management of diverse, trustless markets via [Reality.eth](https://reality.eth.limo/app/docs/html/index.html) and [Conditional Tokens Framework](https://conditional-tokens-docs.netlify.app/docs/introduction1).\n• **Fair**: [Kleros](https://kleros.io/) acts as a decentralized arbiter to resolve disputes and ensure fair, transparent outcomes.\n• **Create Your Own Markets**: Allows users to create custom prediction markets for any event or topic.\n• **Fair Rewards**: Easily trade market outcomes and earn rewards through prediction farming.',
        image: '/images/integrations/seer-slide2.png',
        imageHeight: 566,
        imageWidth: 906,
      },
      {
        id: 'howToUse',
        title: 'What are Seer Credits?',
        description: '~~Get monthly Seer Credits to predict, play and earn on Seer!~~\n\n• Monthly rewards given to **verified Proof of Humanity users** to use on the Seer platform.\n• **Use them like trading funds.** Open/close positions on Seer without spending your own crypto.\n• **They\'re not tokens.** They\'re non-transferable, and can\'t be withdrawn.\n• **Auto-refill.** A fresh balance appears at the start of each month.\n• **Expires monthly.** Use it or lose it at month-end; unused credits don\'t roll over.',
        image: '/images/integrations/seer-slide3.png',
        imageHeight: 322,
        imageWidth: 901,
      },
      {
        id: 'howToUseSeerCredits',
        title: 'How to use your Seer Credits?',
        description: '~~Make sure your profile is verified on Proof of Humanity. Only verified humans are eligible to receive Seer Credits!~~\n\n1. Go to Seer and connect your wallet address that\'s **registered** with your Proof of Humanity profile.\n2. Once connected, you\'ll be able to **check** your Seer Credits balance.\n3. Use your Seer Credits to **take positions** in prediction markets.\n\n**Note:** Your credits refresh every month, so you\'ll receive a new balance automatically. Use them before the month ends. Unused credits expire when the next cycle begins.',
        image: '/images/integrations/seer-slide4.png',
        imageHeight: 508,
        imageWidth: 425,
        bulletPoints: [
          'Visit: [seer.pm](https://seer.pm/) | [Documentation](https://seer-3.gitbook.io/seer-documentation)'
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