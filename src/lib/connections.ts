import profilesJson from "../../data/profiles.json";
import proposedJson from "../../data/proposed-connections.json";

export type OpenTo =
  | "intro"
  | "mentorship"
  | "co_founder"
  | "hiring"
  | "investing"
  | "advice";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  graduation_year: number;
  programme: string;
  current_role: string;
  current_company: string;
  industry: string;
  city: string;
  linkedin_url?: string;
  bio: string;
  expertise: string[];
  looking_for: string[];
  can_offer: string[];
  open_to: OpenTo[];
  created_at: string;
  updated_at: string;
};

export type OpportunityType =
  | "job_referral"
  | "co_founder"
  | "mentorship"
  | "warm_intro"
  | "deal_flow"
  | "knowledge_swap";

export type ConnectionStatus = "pending" | "sent" | "dismissed" | "successful";

export type ProposedConnection = {
  id: string;
  alumni_a_id: string;
  alumni_b_id: string;
  opportunity_type: OpportunityType;
  synergy_summary: string;
  suggested_intro_message: string;
  confidence: number;
  signals: string[];
  generated_at: string;
  generated_by_model: string;
  status: ConnectionStatus;
};

export type EnrichedConnection = ProposedConnection & {
  alumni_a: Pick<
    Profile,
    "id" | "full_name" | "current_role" | "current_company" | "programme" | "graduation_year" | "linkedin_url"
  > | null;
  alumni_b: Pick<
    Profile,
    "id" | "full_name" | "current_role" | "current_company" | "programme" | "graduation_year" | "linkedin_url"
  > | null;
};

const profiles = profilesJson as Profile[];
const proposed = proposedJson as ProposedConnection[];

export function getProfiles(): Profile[] {
  return profiles;
}

export function getProposedConnections(): EnrichedConnection[] {
  const byId = new Map(profiles.map((p) => [p.id, p]));
  const pick = (p: Profile | undefined) =>
    p
      ? {
          id: p.id,
          full_name: p.full_name,
          current_role: p.current_role,
          current_company: p.current_company,
          programme: p.programme,
          graduation_year: p.graduation_year,
          linkedin_url: p.linkedin_url,
        }
      : null;

  return proposed
    .slice()
    .sort((a, b) => b.generated_at.localeCompare(a.generated_at))
    .map((c) => ({
      ...c,
      alumni_a: pick(byId.get(c.alumni_a_id)),
      alumni_b: pick(byId.get(c.alumni_b_id)),
    }));
}

export function groupByStatus(connections: EnrichedConnection[]) {
  const groups: Record<ConnectionStatus, EnrichedConnection[]> = {
    pending: [],
    sent: [],
    successful: [],
    dismissed: [],
  };
  for (const c of connections) groups[c.status].push(c);
  return groups;
}

export const OPPORTUNITY_LABELS: Record<OpportunityType, string> = {
  job_referral: "Job referral",
  co_founder: "Co-founder fit",
  mentorship: "Mentorship",
  warm_intro: "Warm intro",
  deal_flow: "Deal flow",
  knowledge_swap: "Knowledge swap",
};
