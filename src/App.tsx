import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, addEdge, useEdgesState, useNodesState, type Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Activity, ArrowRight, Check, Download, GitBranch, Network, Play, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react';
import DeviceNode from './components/DeviceNode';
import { sampleNetwork } from './data/sampleNetwork';
import { findRoute } from './engine/routing';
import type { DeviceKind, NetworkEdge, NetworkNode, NetworkSnapshot, RouteResult } from './types/network';

const storageKey = 'network-lab-v1';
const kinds: DeviceKind[] = ['workstation','switch','router','firewall','server','cloud'];
const nodeTypes = { device: DeviceNode };
function load(): NetworkSnapshot {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const data: unknown = JSON.parse(raw);
      if (data && typeof data === 'object' && 'nodes' in data && 'edges' in data &&
          Array.isArray(data.nodes) && Array.isArray(data.edges)) return data as NetworkSnapshot;
    }
  } catch { /* Ignore invalid browser storage. */ }
  return sampleNetwork;
}

export default function App() {
  const [seed] = useState(load);
  const [nodes, setNodes, onNodesChange] = useNodesState<NetworkNode>(seed.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<NetworkEdge>(seed.edges);
  const [source, setSource] = useState('pc-1');
  const [target, setTarget] = useState('cloud-1');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [activeHop, setActiveHop] = useState(-1);
  const [notice, setNotice] = useState('');
  const nextId = useRef(100);
  const selected = nodes.find(n => n.id === selectedId);
  const onlineCount = nodes.filter(n => n.data.online).length;

  useEffect(() => {
    if (!route?.path.length) return;
    setActiveHop(0);
    let hop = 0;
    const timer = window.setInterval(() => {
      hop += 1;
      setActiveHop(hop);
      if (hop >= route.path.length - 1) window.clearInterval(timer);
    }, 600);
    return () => window.clearInterval(timer);
  }, [route]);

  const visualEdges = useMemo(() => edges.map(edge => {
    const index = route?.path.findIndex((id, i) => i < route.path.length - 1 &&
      ((id === edge.source && route.path[i + 1] === edge.target) ||
       (id === edge.target && route.path[i + 1] === edge.source))) ?? -1;
    const highlighted = index >= 0;
    return { ...edge, animated: highlighted && activeHop <= index,
      style: { stroke: highlighted ? '#4fe1b6' : '#71849d', strokeWidth: highlighted ? 3 : 2 },
      className: highlighted ? 'route-edge' : '' };
  }), [edges, route, activeHop]);

  const visualNodes = useMemo(() => nodes.map(n => ({
    ...n, className: route?.path.includes(n.id) ? 'route-node' : ''
  })), [nodes, route]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges(old => addEdge({ ...connection, id: 'edge-' + nextId.current++ }, old));
    setRoute(null);
  }, [setEdges]);

  const addDevice = (kind: DeviceKind) => {
    const id = kind + '-' + nextId.current++;
    const label = kind.charAt(0).toUpperCase() + kind.slice(1) + ' ' + nextId.current;
    setNodes(old => [...old, { id, type: 'device', position: { x: 180 + Math.random() * 550, y: 120 + Math.random() * 330 }, data: { kind, label, online: true } }]);
    setSelectedId(id);
    setRoute(null);
  };
  const updateSelected = (patch: Partial<NetworkNode['data']>) => {
    setNodes(old => old.map(n => n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n));
    setRoute(null);
  };
  const removeSelected = () => {
    setNodes(old => old.filter(n => n.id !== selectedId));
    setEdges(old => old.filter(e => e.source !== selectedId && e.target !== selectedId));
    setSelectedId(null);
    setRoute(null);
  };
  const simulate = () => { setRoute(findRoute(nodes, edges, source, target)); setActiveHop(-1); };
  const save = () => { localStorage.setItem(storageKey, JSON.stringify({ nodes, edges })); setNotice('Saved in this browser'); };
  const reset = () => { setNodes(sampleNetwork.nodes); setEdges(sampleNetwork.edges); setSelectedId(null); setSource('pc-1'); setTarget('cloud-1'); setRoute(null); localStorage.removeItem(storageKey); setNotice('Sample topology restored'); };
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'network-lab.json'; a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-logo"><Network size={24} /></div><div><strong>NETWORK<span>LAB</span></strong><small>INTERACTIVE TOPOLOGY</small></div></div>
      <div className="sidebar-label">WORKSPACE <span>01 / LAB</span></div>
      <section className="side-section">
        <div className="section-heading"><span>DEVICE LIBRARY</span><Plus size={15}/></div>
        <p className="muted">Add a device, then drag from one handle to another to connect them.</p>
        <div className="device-library">{kinds.map(kind => <button key={kind} onClick={() => addDevice(kind)}><Plus size={16}/><span>{kind}</span></button>)}</div>
      </section>
      <section className="side-section"><div className="section-heading">TOPOLOGY OVERVIEW</div>
        <div className="stat"><span>Devices</span><strong>{nodes.length}</strong></div>
        <div className="stat"><span>Connections</span><strong>{edges.length}</strong></div>
        <div className="stat"><span>Online</span><strong className="mint">{onlineCount}</strong></div>
      </section>
      <div className="sidebar-foot"><span className="live-dot"/> ENGINE READY <span>v0.1.0</span></div>
    </aside>
    <main className="main">
      <header className="topbar">
        <div><div className="eyebrow">WORKSPACE / NETWORK SIMULATOR</div><h1>Network topology <span>↗</span></h1><p>Design, connect, and test your network in real time.</p></div>
        <div className="toolbar">
          <button onClick={reset}><RotateCcw size={16}/> Reset</button>
          <button onClick={download}><Download size={16}/> Export</button>
          <button className="primary" onClick={save}><Save size={16}/> Save network</button>
        </div>
      </header>
      <div className="workspace">
        <section className="canvas">
          <div className="canvas-label"><span><span className="live-dot"/> LIVE TOPOLOGY</span><span>DRAG TO MOVE · CONNECT VIA HANDLES</span></div>
          <div className="flow-area"><ReactFlow nodes={visualNodes} edges={visualEdges} onNodesChange={changes => { onNodesChange(changes); if (changes.some(c => c.type === 'remove')) setRoute(null); }} onEdgesChange={changes => { onEdgesChange(changes); if (changes.some(c => c.type === 'remove')) setRoute(null); }} onConnect={onConnect} onNodeClick={(_, n) => setSelectedId(n.id)} onPaneClick={() => setSelectedId(null)} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.18 }} colorMode="dark" deleteKeyCode={['Backspace','Delete']}>
            <Background gap={22} size={1} color="#27354a"/><Controls position="bottom-left"/><MiniMap position="bottom-right" pannable zoomable nodeColor="#466286" maskColor="rgba(9,15,28,.75)"/>
          </ReactFlow></div>
          <div className="canvas-foot"><GitBranch size={15}/> UNDIRECTED GRAPH <span>·</span> UNWEIGHTED EDGES <span>·</span> BFS ROUTING</div>
        </section>
        <aside className="inspector">
          <div className="inspector-head">CONTROL PANEL <Activity size={16}/></div>
          <div className="inspector-inner"><h3>PACKET SIMULATION</h3><p className="muted">Find the shortest online route between two devices.</p>
            <label htmlFor="source">SOURCE DEVICE</label>
            <select id="source" value={nodes.some(n => n.id === source) ? source : ''} onChange={e => {setSource(e.target.value);setRoute(null);}}>
              {!nodes.some(n=>n.id===source)&&<option value="">Choose a source</option>}
              {nodes.map(n => <option key={n.id} value={n.id}>{n.data.label}</option>)}
            </select>
            <label htmlFor="target">DESTINATION DEVICE</label>
            <select id="target" value={nodes.some(n => n.id === target) ? target : ''} onChange={e => {setTarget(e.target.value);setRoute(null);}}>
              {!nodes.some(n=>n.id===target)&&<option value="">Choose a destination</option>}
              {nodes.map(n => <option key={n.id} value={n.id}>{n.data.label}</option>)}
            </select>
            <button className="primary simulate" disabled={!nodes.some(n=>n.id===source)||!nodes.some(n=>n.id===target)} onClick={simulate}><Play size={15}/> Simulate packet <ArrowRight size={16}/></button>
            {route && <div className={'route-result ' + (route.error ? 'error' : '')}><strong>{route.error ? <X size={16}/> : <Check size={16}/>} {route.error ? 'ROUTE UNAVAILABLE' : 'ROUTE FOUND'}</strong>
              {route.error ? <p>{route.error}</p> : <><div className="hops">{route.hops} <small>hops</small></div><p>{route.path.map(id=>nodes.find(n=>n.id===id)?.data.label ?? id).join(' → ')}</p><small>{route.explored} devices discovered · BFS</small></>}
            </div>}
            <div className="rule"/><h3>DEVICE INSPECTOR</h3>
            {selected ? <div className="edit-panel">
              <label htmlFor="device-label">DEVICE NAME</label><input id="device-label" value={selected.data.label} onChange={e => updateSelected({ label: e.target.value })}/>
              <label>DEVICE TYPE</label><div className="read-only">{selected.data.kind}</div>
              <div className="toggle-line"><span>Device online</span><button aria-label="Toggle device status" aria-pressed={selected.data.online} className={'toggle ' + (selected.data.online ? 'on' : '')} onClick={() => updateSelected({ online: !selected.data.online })}><span/></button></div>
              <button className="danger" onClick={removeSelected}><Trash2 size={15}/> Delete device</button>
            </div> : <div className="empty">Click a device on the canvas to inspect or edit it.</div>}
          </div>
        </aside>
      </div>
      <footer>NETWORK LAB / SIMULATION ENVIRONMENT <span>React + TypeScript · Educational graph routing, not real protocol emulation</span></footer>
    </main>
    {notice && <div className="toast" role="status" onClick={() => setNotice('')}><Check size={16}/>{notice}<X size={14}/></div>}
  </div>;
}
