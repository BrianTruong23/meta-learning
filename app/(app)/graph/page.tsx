"use client";

import { useMemo } from "react";
import ReactFlow, { Background, Controls, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";
import { Share2 } from "lucide-react";
import { EmptyState } from "@/components/ui/misc";
import { PageHeader } from "@/components/shell/page-header";
import { useStore } from "@/lib/store/store";
import { seeded } from "@/lib/utils";
import { hashString } from "@/lib/utils";

export default function GraphPage() {
  const notes = useStore((s) => s.notes);
  const subjects = useStore((s) => s.subjects);
  const knowledge = useStore((s) => s.knowledge);

  const { nodes, edges, count } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // concept nodes the user has engaged with
    const touched = new Set(Object.keys(knowledge).filter((k) => knowledge[k].events.length));
    const conceptNodes = subjects.flatMap((s) => s.nodes).filter((n) => touched.has(n.id));

    const place = (id: string) => {
      const r = seeded(hashString(id));
      return { x: r() * 700, y: r() * 500 };
    };

    conceptNodes.forEach((n) => {
      nodes.push({
        id: n.id,
        position: place(n.id),
        data: { label: n.name },
        style: {
          background: "hsl(var(--primary) / 0.15)",
          border: "2px solid hsl(var(--primary))",
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 600,
          padding: 8,
          width: 150,
          color: "hsl(var(--foreground))",
        },
      });
    });
    subjects.forEach((s) => {
      s.nodes.forEach((n) => {
        if (!touched.has(n.id)) return;
        n.prerequisites.forEach((p) => {
          if (touched.has(p)) edges.push({ id: `${p}-${n.id}`, source: p, target: n.id });
        });
      });
    });

    // note nodes
    notes.forEach((note) => {
      nodes.push({
        id: note.id,
        position: place(note.id),
        data: { label: note.title || "note" },
        style: {
          background: "hsl(var(--accent) / 0.15)",
          border: "2px solid hsl(var(--accent))",
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 600,
          padding: 8,
          width: 150,
          color: "hsl(var(--foreground))",
        },
      });
    });

    // explicit note links
    notes.forEach((note) => {
      note.links.forEach((l) => {
        if (notes.some((x) => x.id === l)) edges.push({ id: `${note.id}-${l}`, source: note.id, target: l });
      });
    });

    // auto-suggested connections via shared tags (dashed)
    for (let i = 0; i < notes.length; i++) {
      for (let j = i + 1; j < notes.length; j++) {
        const shared = notes[i].tags.filter((t) => notes[j].tags.includes(t));
        if (shared.length > 0) {
          edges.push({
            id: `sugg-${notes[i].id}-${notes[j].id}`,
            source: notes[i].id,
            target: notes[j].id,
            animated: true,
            style: { stroke: "hsl(var(--muted-foreground))", strokeDasharray: "4 4" },
            label: shared[0],
          });
        }
      }
    }

    return { nodes, edges, count: nodes.length };
  }, [notes, subjects, knowledge]);

  return (
    <div>
      <PageHeader
        title="Knowledge Graph"
        subtitle="How your understanding connects. Concepts (purple) and your notes (teal); dashed links are suggested connections from shared tags."
      />
      {count === 0 ? (
        <EmptyState
          icon={<Share2 className="h-8 w-8" />}
          title="Your graph is empty"
          body="Study concepts and add library notes (with tags) to grow an interconnected knowledge graph."
        />
      ) : (
        <div className="h-[600px] w-full overflow-hidden rounded-2xl border border-border bg-surface-2">
          <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }} nodesConnectable={false}>
            <Background color="hsl(var(--border))" gap={20} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      )}
    </div>
  );
}
