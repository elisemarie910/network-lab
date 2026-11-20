import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Cloud, HardDrive, Laptop, Network, Router, Shield, Server } from 'lucide-react';
import type { NetworkNode } from '../types/network';
const icons = { workstation: Laptop, switch: Network, router: Router, firewall: Shield, server: Server, cloud: Cloud };
export default function DeviceNode({ data, selected }: NodeProps<NetworkNode>) {
  const Icon = icons[data.kind] ?? HardDrive;
  return <div className={`device ${selected ? 'selected' : ''} ${data.online ? '' : 'offline'}`}>
    <Handle type="target" position={Position.Left} />
    <div className="device-icon"><Icon size={21}/></div>
    <div className="device-text"><strong>{data.label}</strong><small>{data.kind}</small></div>
    <span className={`device-status ${data.online ? 'up' : 'down'}`}/>
    <Handle type="source" position={Position.Right} />
    <Handle type="source" position={Position.Bottom} id="bottom" />
    <Handle type="target" position={Position.Top} id="top" />
  </div>;
}
