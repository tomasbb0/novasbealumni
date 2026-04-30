import activityJson from "../../data/agent-activity.json";

export type AgentActivityKind =
  | "tick_start"
  | "tick_end"
  | "profile_added"
  | "profile_updated"
  | "connection_proposed"
  | "connection_status_changed"
  | "self_improvement"
  | "error"
  | "note";

export type AgentActivity = {
  id: string;
  ts: string;
  kind: AgentActivityKind;
  summary: string;
  details?: string;
  related_profile_ids?: string[];
  related_connection_id?: string;
  model: string;
};

const activity = activityJson as AgentActivity[];

export function getActivity(): AgentActivity[] {
  return activity.slice().sort((a, b) => b.ts.localeCompare(a.ts));
}

export const ACTIVITY_LABELS: Record<AgentActivityKind, string> = {
  tick_start: "Tick started",
  tick_end: "Tick ended",
  profile_added: "Profile added",
  profile_updated: "Profile updated",
  connection_proposed: "Connection proposed",
  connection_status_changed: "Connection status changed",
  self_improvement: "Self improvement",
  error: "Error",
  note: "Note",
};
