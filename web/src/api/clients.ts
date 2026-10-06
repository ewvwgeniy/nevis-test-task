import type { ClientsResponse } from "../domain/types";

export async function fetchClients(signal?: AbortSignal): Promise<ClientsResponse> {
  const res = await fetch(`/api/clients${window.location.search}`, { signal });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return (await res.json()) as ClientsResponse;
}
