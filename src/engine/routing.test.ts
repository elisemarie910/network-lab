import { describe, expect, it } from 'vitest';
import { findRoute } from './routing';
import type { NetworkNode, NetworkEdge } from '../types/network';
const nodes: NetworkNode[] = ['pc', 'switch', 'router', 'server'].map(id => ({
  id, type: 'device', position: { x: 0, y: 0 },
  data: { label: id, kind: 'switch', online: true }
}));
const edges: NetworkEdge[] = [
  { id: '1', source: 'pc', target: 'switch' },
  { id: '2', source: 'switch', target: 'router' },
  { id: '3', source: 'router', target: 'server' },
  { id: '4', source: 'pc', target: 'server' }
];
describe('findRoute (BFS)', () => {
  it('takes the fewest hops', () => expect(findRoute(nodes, edges, 'pc', 'server').path).toEqual(['pc', 'server']));
  it('works for the same start and end', () => expect(findRoute(nodes, edges, 'pc', 'pc').hops).toBe(0));
  it('handles disconnected devices', () => expect(findRoute(nodes, [], 'pc', 'server').error).toBeDefined());
  it('avoids offline devices', () => expect(findRoute(nodes.map(n => n.id === 'server' ? { ...n, data: { ...n.data, online: false } } : n), edges, 'pc', 'server').path).toEqual([]));
  it('handles missing devices', () => expect(findRoute(nodes, edges, 'nope', 'server').error).toBeDefined());
});
