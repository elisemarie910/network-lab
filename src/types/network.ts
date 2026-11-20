import type { Edge, Node } from '@xyflow/react';
export type DeviceKind = 'workstation' | 'switch' | 'router' | 'firewall' | 'server' | 'cloud';
export type DeviceData = { label: string; kind: DeviceKind; online: boolean; [key: string]: unknown };
export type NetworkNode = Node<DeviceData, 'device'>;
export type NetworkEdge = Edge;
export type NetworkSnapshot = { nodes: NetworkNode[]; edges: NetworkEdge[] };
export type RouteResult = { path: string[]; hops: number; explored: number; error?: string };
