export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';

type NodeList = {
  nodes: Array<{
    id: string;
    parent_id: string | null;
  }>;
};

export async function getRootNodeId(): Promise<string> {
  const res = await fetch(`${API_BASE}/api/nodes`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load nodes: ${res.status}`);
  const data = (await res.json()) as NodeList;
  const root = data.nodes.find((n) => n.parent_id === null) || data.nodes[0];
  if (!root) throw new Error('No nodes available');
  return root.id;
}

export async function chatWithNode(nodeId: string, message: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ node_id: nodeId, message }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Chat failed ${res.status}: ${body}`);
  }
  const data = (await res.json()) as { node_id: string; response: string };
  return data.response;
}

export async function branchFromNode(parentId: string, options?: { new_id?: string; carry_messages?: boolean; seed_message?: string; }): Promise<string> {
  const res = await fetch(`${API_BASE}/api/branch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parent_id: parentId, ...(options || {}) }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Branch failed ${res.status}: ${body}`);
  }
  const data = (await res.json()) as { branch_id: string };
  return data.branch_id;
}

type NodeDetail = {
  id: string;
  parent_id: string | null;
  child_ids: string[];
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
};

export async function getNode(nodeId: string): Promise<NodeDetail> {
  const res = await fetch(`${API_BASE}/api/nodes/${encodeURIComponent(nodeId)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load node ${nodeId}: ${res.status}`);
  return (await res.json()) as NodeDetail;
}

export async function mergeNodes(targetId: string, sourceId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_id: targetId, source_id: sourceId }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Merge failed ${res.status}: ${body}`);
  }
  const data = (await res.json()) as { merged_id: string };
  return data.merged_id;
}

export async function summarizeBranch(sourceId: string, newId?: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/summarize_branch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_id: sourceId, new_id: newId }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Summarize failed ${res.status}: ${body}`);
  }
  const data = (await res.json()) as { branch_id: string };
  return data.branch_id;
}
