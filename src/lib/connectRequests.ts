import { getSupabase } from "./supabase";

export type ConnectionStatus = "pending" | "accepted" | "declined";

export type Connection = {
  id: string;
  requester: string;
  addressee: string;
  status: ConnectionStatus;
  created_at: string;
};

export async function sendConnectionRequest(addresseeId: string): Promise<void> {
  const sb = getSupabase();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) throw new Error("Not signed in");
  const { error } = await sb.from("connections").insert({
    requester: u.user.id,
    addressee: addresseeId,
    status: "pending",
  });
  if (error) throw error;
}

export async function listMyConnections(): Promise<Connection[]> {
  const sb = getSupabase();
  const { data, error } = await sb.from("connections").select("*");
  if (error) throw error;
  return (data as Connection[]) || [];
}

export async function respondToConnection(id: string, status: "accepted" | "declined"): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("connections").update({ status }).eq("id", id);
  if (error) throw error;
}

export type ConnectionStateFor = "none" | "outgoing-pending" | "incoming-pending" | "accepted" | "declined";

export function statusBetween(myId: string, otherId: string, conns: Connection[]): { state: ConnectionStateFor; id?: string } {
  const c = conns.find((x) =>
    (x.requester === myId && x.addressee === otherId) ||
    (x.requester === otherId && x.addressee === myId)
  );
  if (!c) return { state: "none" };
  if (c.status === "accepted") return { state: "accepted", id: c.id };
  if (c.status === "declined") return { state: "declined", id: c.id };
  return { state: c.requester === myId ? "outgoing-pending" : "incoming-pending", id: c.id };
}
