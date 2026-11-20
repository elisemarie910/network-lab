import type { NetworkSnapshot, DeviceKind, NetworkNode } from '../types/network';
const make = (id: string, label: string, kind: DeviceKind, x: number, y: number): NetworkNode => ({
  id, type: 'device', position: { x, y }, data: { label, kind, online: true }
});
export const sampleNetwork: NetworkSnapshot = {
  nodes: [
    make('pc-1', 'Workstation 01', 'workstation', 40, 170),
    make('switch-1', 'Access Switch', 'switch', 290, 170),
    make('router-1', 'Edge Router', 'router', 550, 170),
    make('server-1', 'Compute Server', 'server', 550, 10),
    make('firewall-1', 'Firewall', 'firewall', 790, 170),
    make('cloud-1', 'Cloud / ISP', 'cloud', 1020, 170),
    make('server-2', 'Backup Server', 'server', 550, 350)
  ],
  edges: [
    ['pc-1','switch-1'],['switch-1','router-1'],['router-1','server-1'],
    ['router-1','firewall-1'],['firewall-1','cloud-1'],['switch-1','server-2'],
    ['server-2','server-1']
  ].map(([source,target],i) => ({ id: 'edge-'+i, source, target }))
};
