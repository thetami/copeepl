import type { PillarScores } from "@/components/PillarBars";

export interface MockReview {
  id: string;
  reviewerName: string;
  reviewerType: string;
  linkedInVerified?: boolean;
  quote: string;
  sentiment: "positive" | "neutral" | "negative";
}

export interface MockCompany {
  slug: string;
  name: string;
  industry: string;
  employeeCount: string;
  verified: boolean;
  parentRecommended: boolean;
  renewalDue?: boolean;
  score: number;
  reviewCount: number;
  recommendPercent: number;
  profileViews: number;
  pillars: PillarScores;
  reviews: MockReview[];
}

export const MOCK_COMPANIES: MockCompany[] = [
  {
    slug: "acme-robotics",
    name: "Acme Robotics",
    industry: "Manufacturing",
    employeeCount: "500-1,000 employees",
    verified: true,
    parentRecommended: true,
    score: 4.2,
    reviewCount: 128,
    recommendPercent: 82,
    profileViews: 3402,
    pillars: {
      policy: 4.6,
      dayToDayReality: 3.1,
      returnFromLeave: 3.8,
      careerProgression: 2.9,
    },
    reviews: [
      {
        id: "r1",
        reviewerName: "Jamie Carter",
        reviewerType: "Current Employee · Parent",
        linkedInVerified: true,
        quote:
          "Management genuinely worked with me on a flexible schedule after my second child was born.",
        sentiment: "positive",
      },
      {
        id: "r2",
        reviewerName: "Priya Nair",
        reviewerType: "Current Employee · Carer",
        linkedInVerified: true,
        quote: "Solid policy on paper, and my manager has actually honoured it so far.",
        sentiment: "positive",
      },
      {
        id: "r3",
        reviewerName: "Alex Rivera",
        reviewerType: "Former Employee · Parent",
        quote: "Policy looks good on paper but managers rarely honour it in practice.",
        sentiment: "negative",
      },
    ],
  },
  {
    slug: "nimbus-software",
    name: "Nimbus Software",
    industry: "Technology",
    employeeCount: "50-200 employees",
    verified: false,
    parentRecommended: false,
    score: 2.8,
    reviewCount: 12,
    recommendPercent: 40,
    profileViews: 512,
    pillars: {
      policy: 2.6,
      dayToDayReality: 2.9,
      returnFromLeave: 3.0,
      careerProgression: 2.4,
    },
    reviews: [
      {
        id: "r4",
        reviewerName: "Sam Okafor",
        reviewerType: "Current Employee · Parent",
        quote: "It's fine day to day, but nobody senior has ever taken leave so it's untested.",
        sentiment: "neutral",
      },
      {
        id: "r5",
        reviewerName: "Dana Whitfield",
        reviewerType: "Former Employee · Parent",
        quote: "Didn't really understand what I needed after coming back from leave.",
        sentiment: "negative",
      },
    ],
  },
  {
    slug: "brightside-retail",
    name: "Brightside Retail",
    industry: "Retail",
    employeeCount: "1,000+ employees",
    verified: true,
    parentRecommended: true,
    renewalDue: true,
    score: 4.6,
    reviewCount: 341,
    recommendPercent: 88,
    profileViews: 9120,
    pillars: {
      policy: 4.8,
      dayToDayReality: 4.4,
      returnFromLeave: 4.5,
      careerProgression: 4.0,
    },
    reviews: [
      {
        id: "r6",
        reviewerName: "Morgan Lee",
        reviewerType: "Current Employee · Parent",
        linkedInVerified: true,
        quote: "Best return-to-work programme I've seen — my role was fully protected.",
        sentiment: "positive",
      },
    ],
  },
];

export function getCompanyBySlug(slug: string): MockCompany | undefined {
  return MOCK_COMPANIES.find((company) => company.slug === slug);
}
