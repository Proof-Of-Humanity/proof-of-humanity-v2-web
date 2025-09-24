export interface Integration {
  id: string;
  name: string;
  title: string;
  description: string;
  logo: string;
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
  bulletPoints?: string[];
}

export interface ExternalLink {
  label: string;
  url: string;
  icon?: string;
}