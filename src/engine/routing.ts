import type { NetworkEdge, NetworkNode, RouteResult } from '../types/network';

/** Unweighted, undirected shortest path using breadth-first search. */
export function findRoute(nodes: NetworkNode[], edges: NetworkEdge[], source: string, target: string): RouteResult {
  const online = new Set(nodes.filter(n => n.data.online).map(n => n.id));
  const error = (message: string): RouteResult => ({ path: [], hops: 0, explored: 0, error: message });
  if (!online.has(source) || !online.has(target)) return error('Source or destination is unavailable.');
  const adjacency = new Map([...online].map(id => [id, [] as string[]]));
  for (const edge of edges) {
    if (online.has(edge.source) && online.has(edge.target)) {
      adjacency.get(edge.source)!.push(edge.target);
      adjacency.get(edge.target)!.push(edge.source);
    }
  }
  // Parent pointers avoid storing entire paths in the queue.
  const parent = new Map<string, string | null>([[source, null]]);
  const queue = [source];
  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    if (current === target) {
      const path: string[] = [];
      let id: string | null = target;
      while (id !== null) { path.push(id); id = parent.get(id) ?? null; }
      path.reverse();
      return { path, hops: path.length - 1, explored: parent.size };
    }
    for (const neighbor of adjacency.get(current) ?? []) {
      if (!parent.has(neighbor)) { parent.set(neighbor, current); queue.push(neighbor); }
    }
  }
  return { ...error('No route exists between these devices.'), explored: parent.size };
}
