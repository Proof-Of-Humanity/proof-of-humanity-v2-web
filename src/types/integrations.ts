export interface Integration {
  id: string;
  name: string;
  title: string;
  description: string;
  logo: string;
  logoWidth?: number;
  logoHeight?: number;
  darkLogo?: string;
  isActive: boolean;
  startPath: string;
  headerTitle?: string;
  headerDescription?: string;
  buttonText: string;
  firstInfoSlide?: InfoSlide[];
  secondInfoSlide?: InfoSlide[];
  externalLinks?: ExternalLink[];
}

export interface InfoSlide {
  id: string;
  title: string;
  description: string;
  disclaimer?: string;
  externalLink?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  bulletPoints?: string[];
  /** Structured copy for the bespoke "become a juror" airdrop slide. */
  juror?: {
    highlight: string;
    staking: string;
    voteResults: string[];
    links: string;
  };
}

export interface ExternalLink {
  label: string;
  url: string;
  icon?: string;
}
