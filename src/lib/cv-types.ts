export type SectionKind = "experience" | "education" | "projects" | "skills" | "languages";

export type CvItem = {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  details: string;
};

export type CvSection = {
  id: string;
  title: string;
  kind: SectionKind;
  sortOrder: number;
  items: CvItem[];
};

export type CvDocument = {
  id: string;
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  githubUrl: string;
  linkedinUrl: string;
  sections: CvSection[];
};

export type CvListItem = {
  id: string;
  fullName: string;
  headline: string;
  updatedAt: Date;
};
