"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import type { ConceptNode, KnowledgeStatus, Subject } from "@/lib/types";
import { useStore } from "@/lib/store/store";
import { estimateMastery, statusLabel } from "@/lib/mastery/engine";

const STATUS_COLOR: Record<KnowledgeStatus, string> = {
  undiscovered: "#9aa1b1",
  discovered: "#8b93e8",
  learning: "#7c86f5",
  understood: "#5b8def",
  practiced: "#3bb6c4",
  proficient: "#2bb673",
  mastered: "#27ae60",
  "needs-review": "#e0a63a",
};

export function SkillTree({
  subject,
  onSelect,
  selectedId,
}: {
  subject: Subject;
  onSelect: (node: ConceptNode) => void;
  selectedId?: string;
}) {
  const knowledge = useStore((s) => s.knowledge);

  const { nodes, edges } = useMemo(() => {
    // Lay out by subfield columns; stack concepts vertically within a column.
    const bySubfield = new Map<string, ConceptNode[]>();
    subject.subfields.forEach((sf) => bySubfield.set(sf, []));
    subject.nodes.forEach((n) => {
      if (!bySubfield.has(n.subfield)) bySubfield.set(n.subfield, []);
      bySubfield.get(n.subfield)!.push(n);
    });

    const colW = 260;
    const rowH = 110;
    const nodes: Node[] = [];
    let col = 0;
    for (const [, group] of bySubfield) {
      group.forEach((n, row) => {
        const k = knowledge[n.id];
        const status = k && k.events.length ? estimateMastery(k.events).status : "undiscovered";
        const color = STATUS_COLOR[status];
        nodes.push({
          id: n.id,
          position: { x: col * colW, y: row * rowH },
          data: { label: `${n.name}\n${statusLabel(status)}` },
          style: {
            width: 210,
            borderRadius: 14,
            border: `2px solid ${color}`,
            background: selectedId === n.id ? color : "hsl(var(--surface))",
            color: selectedId === n.id ? "#fff" : "hsl(var(--foreground))",
            fontSize: 12,
            fontWeight: 600,
            padding: 10,
            whiteSpace: "pre-line",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          },
        });
      });
      col += 1;
    }

    const edges: Edge[] = [];
    subject.nodes.forEach((n) => {
      n.prerequisites.forEach((p) => {
        edges.push({
          id: `${p}->${n.id}`,
          source: p,
          target: n.id,
          animated: false,
          style: { stroke: "hsl(var(--border))", strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "hsl(var(--border))" },
        });
      });
    });

    return { nodes, edges };
  }, [subject, knowledge, selectedId]);

  return (
    <div className="h-[560px] w-full overflow-hidden rounded-2xl border border-border bg-surface-2">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        onNodeClick={(_, node) => {
          const n = subject.nodes.find((x) => x.id === node.id);
          if (n) onSelect(n);
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="hsl(var(--border))" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
