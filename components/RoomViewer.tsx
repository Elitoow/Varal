'use client';

import { useEffect, useState } from 'react';
import { ProjectRoomRenderer } from './ProjectRoomRenderer';
import { createDefaultProject, type ProjectRoom } from '../lib/project-room-schema';

export default function RoomViewer({ slug }: { slug: string }) {
  const [project, setProject] = useState<ProjectRoom>(() => createDefaultProject());
  useEffect(() => {
    try {
      const saved = localStorage.getItem('studio-draft');
      if (saved) {
        const parsed = JSON.parse(saved) as ProjectRoom;
        if (parsed.slug === slug) setProject(parsed);
      }
    } catch { /* invalid local draft stays on the deterministic fallback */ }
  }, [slug]);
  return <main className="studio-shell room-shell"><header className="studio-topbar"><a href="/studio/new">← voltar ao studio</a><b>SALA PÚBLICA_</b><span>RASCUNHO LOCAL · SOMENTE LEITURA</span></header><ProjectRoomRenderer project={project} /></main>;
}
