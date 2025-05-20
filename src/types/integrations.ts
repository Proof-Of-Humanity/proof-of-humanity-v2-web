export interface Integration {
  id: string;
  name: string;
  title: string;
  description: string;
  logo: string;
  isActive: boolean;
  startPath: string;
  buttonText: string;
  connectionSteps?: ConnectionStep[];
  mintSteps?: ConnectionStep[];
  externalLinks?: ExternalLink[];
}

export interface ConnectionStep {
  id: string;
  title: string;
  description: string;
  externalLink?: string;
  image?: string;
}

export interface ExternalLink {
  label: string;
  url: string;
  icon?: string;
} 