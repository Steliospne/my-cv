import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import type { CvDocument, CvItem, CvListItem, CvSection } from "@/lib/cv-types";

const createItem = (
  title: string,
  subtitle: string,
  period: string,
  details: string,
): CvItem => ({
  id: randomUUID(),
  title,
  subtitle,
  period,
  details,
});

const initialSections = (): Array<Omit<CvSection, "id">> => [
  {
    title: "Work Experience",
    kind: "experience",
    sortOrder: 0,
    items: [
      createItem(
        "Software Consultant (Project-Based)",
        "Virtality",
        "Jan 2025 - Present",
        "Built workflow and reporting tools for healthcare teams and reduced documentation time by 60%.",
      ),
      createItem(
        "Project Leader",
        "GBS Gearbox Services International",
        "Apr 2023 - Apr 2025",
        "Led cross-functional maintenance projects and coordinated software/process improvements.",
      ),
    ],
  },
  {
    title: "Education",
    kind: "education",
    sortOrder: 1,
    items: [
      createItem(
        "Bachelor's Degree in Automotive Engineering",
        "International Hellenic University",
        "Sep 2014 - May 2020",
        "Thesis: Development of telemetry systems for an autonomous downscaled vehicle.",
      ),
      createItem(
        "Erasmus Exchange Program",
        "University of Antwerp",
        "Sep 2019 - Feb 2020",
        "Focused on applied engineering collaboration in an international environment.",
      ),
    ],
  },
  {
    title: "Professional Skills",
    kind: "skills",
    sortOrder: 2,
    items: [
      createItem(
        "Technical Stack",
        "JavaScript, TypeScript, Python, SQL, C#, HTML, CSS",
        "",
        "Also comfortable with SCADA and Docker basics.",
      ),
      createItem(
        "Soft Skills",
        "Analytical thinking, organization, collaboration",
        "",
        "Strong attention to detail and adaptability in fast-paced projects.",
      ),
    ],
  },
  {
    title: "Languages",
    kind: "languages",
    sortOrder: 3,
    items: [
      createItem("Greek", "Native", "", ""),
      createItem("English", "Proficient", "", ""),
      createItem("Dutch", "Basic (willing to learn)", "", ""),
    ],
  },
];

const parseSectionItems = (value: unknown): CvItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const data = item as Partial<CvItem>;
      return {
        id: data.id ?? randomUUID(),
        title: data.title ?? "",
        subtitle: data.subtitle ?? "",
        period: data.period ?? "",
        details: data.details ?? "",
      };
    })
    .filter((item): item is CvItem => item !== null);
};

export const serializeCv = async (cvId: string): Promise<CvDocument | null> => {
  const cv = await prisma.cv.findUnique({
    where: { id: cvId },
    include: {
      sections: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!cv) {
    return null;
  }

  return {
    id: cv.id,
    fullName: cv.fullName,
    headline: cv.headline,
    email: cv.email,
    phone: cv.phone,
    location: cv.location,
    summary: cv.summary,
    sections: cv.sections.map((section) => ({
      id: section.id,
      title: section.title,
      kind: section.kind as CvSection["kind"],
      sortOrder: section.sortOrder,
      items: parseSectionItems(section.items),
    })),
  };
};

export const createCv = async (): Promise<CvDocument> => {
  const created = await prisma.cv.create({
    data: {
      fullName: "Untitled CV",
      headline: "Professional Headline",
      email: "name@email.com",
      phone: "+00 000000000",
      location: "City, Country",
      summary: "Write a concise professional summary.",
      sections: {
        create: initialSections().map((section) => ({
          title: section.title,
          kind: section.kind,
          sortOrder: section.sortOrder,
          items: section.items,
        })),
      },
    },
    include: {
      sections: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  return {
    id: created.id,
    fullName: created.fullName,
    headline: created.headline,
    email: created.email,
    phone: created.phone,
    location: created.location,
    summary: created.summary,
    sections: created.sections.map((section) => ({
      id: section.id,
      title: section.title,
      kind: section.kind as CvSection["kind"],
      sortOrder: section.sortOrder,
      items: parseSectionItems(section.items),
    })),
  };
};

export const listCvs = async (): Promise<CvListItem[]> => {
  const cvs = await prisma.cv.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      fullName: true,
      headline: true,
      updatedAt: true,
    },
  });

  return cvs;
};

export const ensureCv = async (): Promise<CvDocument> => {
  const existing = await prisma.cv.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    include: {
      sections: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (existing) {
    return {
      id: existing.id,
      fullName: existing.fullName,
      headline: existing.headline,
      email: existing.email,
      phone: existing.phone,
      location: existing.location,
      summary: existing.summary,
      sections: existing.sections.map((section) => ({
        id: section.id,
        title: section.title,
        kind: section.kind as CvSection["kind"],
        sortOrder: section.sortOrder,
        items: parseSectionItems(section.items),
      })),
    };
  }

  return createCv();
};
