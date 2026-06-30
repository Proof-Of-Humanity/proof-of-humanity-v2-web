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
  // Rewards-page card display overrides (do not affect the integration detail pages).
  displayOrder?: number;
  cardTitle?: string;
  cardButtonText?: string;
  statusLabel?: string;
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
  featureList?: Array<{
    text: string;
    iconType?: "check" | "success" | "warning" | "error" | "pending";
  }>;
}

export interface ExternalLink {
  label: string;
  url: string;
  icon?: string;
}
