'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProjectRoomRenderer } from './ProjectRoomRenderer';
import {
  createDefaultProject,
  statusLabels,
  suggestedBlocks,
  typeLabels,
  worlds,
  type BlockAlign,
  type BlockStyle,
  type BlockType,
  type BlockWidth,
  type GalleryVariant,
  type HeroVariant,
  type ProjectRoom,
  type ProjectStatus,
  type ProjectType,
  type RoomBlock,
} from '../lib/project-room-schema';

const blockNames: Record<BlockType, string> = {
  HERO: 'Hero_',
  ABOUT: 'Sobre_',
  INFO: 'Ficha do projeto_',
  TEXT: 'Texto_',
  IMAGE: 'Imagem_',
  GALLERY: 'Galeria_',
  VIDEO: 'Vídeo_',
  DEVLOG: 'Devlog_',
  TIMELINE: 'Timeline_',
  GITHUB: 'GitHub_',
  DOWNLOADS: 'Downloads_',
  RUN: 'Run / demo_',
  ARTIFACTS: 'Artefatos_',
  COLLABORATORS: 'Colaboradores_',
  QUOTE: 'Citação_',
  LINKS: 'Links_',
  CUSTOM: 'Seção livre_',
};
const blockDescriptions: Record<BlockType, string> = {
  HERO: 'Dê nome e presença ao projeto.',
  ABOUT: 'Explique o que você está tentando fazer.',
  INFO: 'Mostre tipo, status e contexto.',
  TEXT: 'Um espaço editorial para escrever.',
  IMAGE: 'Uma imagem em destaque.',
  GALLERY: 'Screenshots, fotos ou renders.',
  VIDEO: 'Um vídeo ou demonstração.',
  DEVLOG: 'Registre o caminho enquanto acontece.',
  TIMELINE: 'Marque momentos importantes.',
  GITHUB: 'Repositório e código relacionado.',
  DOWNLOADS: 'Pacotes e arquivos para baixar.',
  RUN: 'Uma porta para a demo.',
  ARTIFACTS: 'Objetos, documentos e evidências.',
  COLLABORATORS: 'Quem fez parte da tentativa.',
  QUOTE: 'Uma frase que merece espaço.',
  LINKS: 'Referências e caminhos externos.',
  CUSTOM: 'Uma seção livre para inventar.',
};
const blockIcons: Record<BlockType, string> = {
  HERO: '✦',
  ABOUT: '◌',
  INFO: '▦',
  TEXT: 'T',
  IMAGE: '▧',
  GALLERY: '▤',
  VIDEO: '▶',
  DEVLOG: '↳',
  TIMELINE: '◷',
  GITHUB: '⌘',
  DOWNLOADS: '↓',
  RUN: '↗',
  ARTIFACTS: '□',
  COLLABORATORS: '◎',
  QUOTE: '“',
  LINKS: '⌁',
  CUSTOM: '＋',
};
const types = Object.keys(typeLabels) as ProjectType[];
const statuses = Object.keys(statusLabels) as ProjectStatus[];
const blockTypes = Object.keys(blockNames) as BlockType[];
const makeBlock = (type: BlockType): ProjectRoom['blocks'][number] => ({
  id: `block-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  type,
  content: {
    title: blockNames[type],
    body: blockDescriptions[type],
    ...(type === 'DEVLOG' ? { date: 'agora_' } : {}),
  },
  settings: {
    visible: true,
    width: type === 'QUOTE' ? 'WIDE' : 'NORMAL',
    align: type === 'QUOTE' ? 'CENTER' : 'LEFT',
    style: type === 'IMAGE' || type === 'GALLERY' ? 'FEATURED' : 'CARD',
  },
});
const worldForType: Partial<Record<ProjectType, ProjectRoom['world']>> = {
  GAME: 'ARCADE',
  AUTOMOTIVE: 'OFICINA',
  SOFTWARE: 'TERMINAL',
  ELECTRONICS: 'OFICINA',
  BOOK: 'ZINE',
  ART: 'GALERIA',
  MUSIC: 'GALERIA',
  AI: 'TERMINAL',
  MECHANICAL: 'OFICINA',
  RESEARCH: 'CADERNO',
};
const cleanDraft = (value: ProjectRoom): ProjectRoom => ({
  ...createDefaultProject(),
  ...value,
  blocks:
    value.blocks?.map((block) => ({
      ...block,
      settings: {
        width: 'NORMAL',
        align: 'LEFT',
        style: 'CARD',
        ...block.settings,
      },
    })) ?? createDefaultProject().blocks,
});
type BlockPatch = {
  type?: BlockType;
  content?: Partial<RoomBlock['content']>;
  settings?: Partial<RoomBlock['settings']>;
};

type Panel = 'EDITOR' | 'PREVIEW' | 'BLOCKS';
export default function StudioBuilder() {
  const [project, setProject] = useState<ProjectRoom>(() =>
    createDefaultProject(),
  );
  const [past, setPast] = useState<ProjectRoom[]>([]);
  const [future, setFuture] = useState<ProjectRoom[]>([]);
  const [selectedId, setSelectedId] = useState('block-hero');
  const [savedAt, setSavedAt] = useState('rascunho local');
  const [saveState, setSaveState] = useState<'SAVED' | 'SAVING'>('SAVED');
  const [device, setDevice] = useState<'DESKTOP' | 'TABLET' | 'MOBILE'>(
    'DESKTOP',
  );
  const [panel, setPanel] = useState<Panel>('EDITOR');
  const [source, setSource] = useState<'start' | 'github'>('start');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cleanPreview, setCleanPreview] = useState(false);
  const [roomOpened, setRoomOpened] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('studio-draft');
      if (saved) {
        const parsed = cleanDraft(JSON.parse(saved) as ProjectRoom);
        setProject(parsed);
        setSelectedId(parsed.blocks[0]?.id ?? 'block-hero');
      }
    } catch {
      /* keep deterministic first room */
    }
  }, []);
  useEffect(() => {
    setSaveState('SAVING');
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem('studio-draft', JSON.stringify(project));
        setSavedAt(
          new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        );
        setSaveState('SAVED');
      } catch {
        /* local only */
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [project]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
      if (event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const selected =
    project.blocks.find((block) => block.id === selectedId) ??
    project.blocks[0] ??
    createDefaultProject().blocks[0];
  const suggested = useMemo(
    () => suggestedBlocks(project.category),
    [project.category],
  );
  const commit = (
    next: ProjectRoom | ((current: ProjectRoom) => ProjectRoom),
  ) =>
    setProject((current) => {
      const result = typeof next === 'function' ? next(current) : next;
      setPast((items) => [...items, current].slice(-40));
      setFuture([]);
      return { ...result, updatedAt: 'LOCAL_DRAFT' };
    });
  const undo = () => {
    const previous = past[past.length - 1];
    if (!previous) return;
    setPast((items) => items.slice(0, -1));
    setFuture((items) => [project, ...items]);
    setProject(previous);
  };
  const redo = () => {
    const next = future[0];
    if (!next) return;
    setFuture((items) => items.slice(1));
    setPast((items) => [...items, project].slice(-40));
    setProject(next);
  };
  const update = (patch: Partial<ProjectRoom>) =>
    commit((current) => ({ ...current, ...patch }));
  const updateBlock = (id: string, patch: BlockPatch) =>
    commit((current) => {
      const blocks = current.blocks.map((block) =>
        block.id === id
          ? {
              ...block,
              ...patch,
              settings: { ...block.settings, ...(patch.settings ?? {}) },
              content: { ...block.content, ...(patch.content ?? {}) },
            }
          : block,
      );
      return { ...current, blocks };
    });
  const reorder = (id: string, direction: -1 | 1) =>
    commit((current) => {
      const index = current.blocks.findIndex((block) => block.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.blocks.length)
        return current;
      const blocks = [...current.blocks];
      [blocks[index], blocks[nextIndex]] = [blocks[nextIndex], blocks[index]];
      return { ...current, blocks };
    });
  const dropBlock = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    commit((current) => {
      const from = current.blocks.findIndex((block) => block.id === draggedId);
      const to = current.blocks.findIndex((block) => block.id === targetId);
      if (from < 0 || to < 0) return current;
      const blocks = [...current.blocks];
      const [moved] = blocks.splice(from, 1);
      blocks.splice(to, 0, moved);
      return { ...current, blocks };
    });
    setDraggedId(null);
  };
  const addBlock = (type: BlockType) => {
    const block = makeBlock(type);
    commit((current) => ({ ...current, blocks: [...current.blocks, block] }));
    setSelectedId(block.id);
    setPickerOpen(false);
    setPanel('PREVIEW');
  };
  const duplicate = () => {
    const block = makeBlock(selected.type);
    block.content = {
      ...selected.content,
      title: `${selected.content.title} (cópia)`,
    };
    commit((current) => ({ ...current, blocks: [...current.blocks, block] }));
    setSelectedId(block.id);
  };
  const remove = () => {
    if (project.blocks.length <= 1) return;
    const next = project.blocks.filter((block) => block.id !== selected.id);
    commit((current) => ({ ...current, blocks: next }));
    setSelectedId(next[0].id);
  };
  const beautify = () => {
    commit((current) => {
      const order = suggestedBlocks(current.category);
      const sorted = [...current.blocks].sort(
        (a, b) =>
          (order.indexOf(a.type) < 0 ? 99 : order.indexOf(a.type)) -
          (order.indexOf(b.type) < 0 ? 99 : order.indexOf(b.type)),
      );
      return {
        ...current,
        world: worldForType[current.category] ?? current.world,
        blocks: sorted.map((block, index) => ({
          ...block,
          settings: {
            ...block.settings,
            width:
              block.type === 'HERO' || block.type === 'GALLERY'
                ? 'WIDE'
                : block.type === 'QUOTE'
                  ? 'WIDE'
                  : index % 4 === 0
                    ? 'NORMAL'
                    : 'NARROW',
            align: block.type === 'QUOTE' ? 'CENTER' : 'LEFT',
            style:
              block.type === 'HERO'
                ? 'FEATURED'
                : block.type === 'IMAGE' || block.type === 'GALLERY'
                  ? 'FLOATING'
                  : (block.settings.style ?? 'CARD'),
          },
        })),
      };
    });
    setPanel('PREVIEW');
  };
  const editProject = (field: 'title' | 'description', value: string) =>
    update({ [field]: value });
  if (roomOpened)
    return (
      <main className="studio-shell">
        <header className="studio-topbar">
          <a href="/studio/new">← voltar ao editor</a>
          <b>PRÉVIA PÚBLICA_</b>
          <button
            className="studio-button"
            onClick={() => setRoomOpened(false)}
          >
            editar sala
          </button>
        </header>
        <ProjectRoomRenderer project={project} />
      </main>
    );
  return (
    <main className="studio-shell">
      <header className="studio-topbar">
        <a href="/">ARQUIVO INACABADO_</a>
        <b>STUDIO / SUA SALA_</b>
        <span className="save-status">
          {saveState === 'SAVING'
            ? 'SALVANDO_ · alterações pendentes'
            : savedAt === 'rascunho local'
              ? 'rascunho local_'
              : `SALVO LOCALMENTE_ · ${savedAt}`}
        </span>
        <div className="history-actions">
          <button onClick={undo} disabled={!past.length} aria-label="Desfazer">
            ↶
          </button>
          <button onClick={redo} disabled={!future.length} aria-label="Refazer">
            ↷
          </button>
        </div>
      </header>
      <section className="studio-intro studio-intro-compact">
        <span className="studio-kicker">PROJECT ROOM BUILDER / P0.1</span>
        <h1>
          Toque na sala.
          <br />
          <em>Faça ela sua.</em>
        </h1>
        <p>
          Edite o que vê, arraste as partes e escolha um mundo. O resto pode
          esperar.
        </p>
      </section>
      <div className="start-strip">
        <button
          className={source === 'start' ? 'selected' : ''}
          onClick={() => setSource('start')}
        >
          COMEÇAR DO ZERO_
        </button>
        <button
          className={source === 'github' ? 'selected' : ''}
          onClick={() => setSource('github')}
        >
          IMPORTAR DO GITHUB_
        </button>
        {source === 'github' && (
          <span>
            DEMO / MOCK ADAPTER — sem autorização real nem credenciais.
          </span>
        )}
        <button className="make-beautiful" onClick={beautify}>
          ✨ FAZ BONITO PRA MIM_
        </button>
      </div>
      <nav className="mobile-panels" aria-label="Painéis do editor">
        <button
          className={panel === 'EDITOR' ? 'active' : ''}
          onClick={() => setPanel('EDITOR')}
        >
          EDITOR_
        </button>
        <button
          className={panel === 'PREVIEW' ? 'active' : ''}
          onClick={() => setPanel('PREVIEW')}
        >
          PRÉVIA_
        </button>
        <button
          className={panel === 'BLOCKS' ? 'active' : ''}
          onClick={() => setPanel('BLOCKS')}
        >
          BLOCOS_
        </button>
      </nav>
      <section
        className={`studio-workbench active-${panel.toLowerCase()} ${cleanPreview ? 'clean-preview' : ''}`}
      >
        <aside className="studio-inspector">
          <div className="inspector-section">
            <span className="studio-kicker">SUA SALA_</span>
            <label>
              Nome do projeto
              <input
                value={project.title}
                onChange={(event) => update({ title: event.target.value })}
              />
            </label>
            <label>
              Uma frase sobre ela
              <textarea
                value={project.description}
                onChange={(event) =>
                  update({ description: event.target.value })
                }
              />
            </label>
            <label>
              Tipo
              <select
                value={project.category}
                onChange={(event) =>
                  update({ category: event.target.value as ProjectType })
                }
              >
                {types.map((type) => (
                  <option value={type} key={type}>
                    {typeLabels[type]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <div className="status-picker">
                <button
                  id="room-status-select"
                  className="status-control"
                  onClick={() => setStatusOpen((value) => !value)}
                >
                  {statusLabels[project.status]}
                </button>
                {statusOpen && (
                  <div className="status-menu">
                    {statuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          update({ status });
                          setStatusOpen(false);
                        }}
                      >
                        {statusLabels[status]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </label>
          </div>
          <div className="inspector-section">
            <span className="studio-kicker">COMO ELA PARECE?_</span>
            <p className="helper-copy">
              Escolha um mundo — cada um muda o jeito que a sala respira.
            </p>
            <div className="world-options visual-worlds">
              {worlds.map((world) => (
                <button
                  className={`world-card world-card-${world.id.toLowerCase()} ${project.world === world.id ? 'selected' : ''}`}
                  onClick={() => update({ world: world.id })}
                  key={world.id}
                >
                  <span className="world-mini" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <b>{world.label}</b>
                  <small>{world.note}</small>
                </button>
              ))}
            </div>
            <label>
              Cor de destaque
              <input
                type="color"
                value={project.theme.accent}
                onChange={(event) =>
                  update({
                    theme: { ...project.theme, accent: event.target.value },
                  })
                }
              />
            </label>
            <label>
              Perfil de fonte
              <select
                value={project.theme.font}
                onChange={(event) =>
                  update({
                    theme: {
                      ...project.theme,
                      font: event.target.value as ProjectRoom['theme']['font'],
                    },
                  })
                }
              >
                <option value="SANS">Sans</option>
                <option value="SERIF">Serif</option>
                <option value="MONO">Mono</option>
              </select>
            </label>
            <label>
              Densidade
              <select
                value={project.theme.density}
                onChange={(event) =>
                  update({
                    theme: {
                      ...project.theme,
                      density: event.target
                        .value as ProjectRoom['theme']['density'],
                    },
                  })
                }
              >
                <option value="AIRY">Arejada</option>
                <option value="COMPACT">Compacta</option>
              </select>
            </label>
          </div>
          <details className="inspector-section advanced">
            <summary>
              <span className="studio-kicker">AVANÇADO_</span>
              <b>Mais controle, quando você quiser</b>
            </summary>
            <p>
              Custom CSS, widgets e sandbox ficam reservados para uma fase
              futura — sem JavaScript arbitrário.
            </p>
          </details>
        </aside>
        <div className={`studio-canvas canvas-${device.toLowerCase()}`}>
          <div className="canvas-toolbar">
            <span>TOQUE NO TEXTO PARA EDITAR_</span>
            <div>
              <button
                className={device === 'DESKTOP' ? 'active' : ''}
                onClick={() => setDevice('DESKTOP')}
              >
                desktop
              </button>
              <button
                className={device === 'TABLET' ? 'active' : ''}
                onClick={() => setDevice('TABLET')}
              >
                tablet
              </button>
              <button
                className={device === 'MOBILE' ? 'active' : ''}
                onClick={() => setDevice('MOBILE')}
              >
                mobile
              </button>
              <button
                className={cleanPreview ? 'active' : ''}
                onClick={() => setCleanPreview((value) => !value)}
              >
                {cleanPreview ? 'voltar a editar' : 'prévia limpa'}
              </button>
            </div>
          </div>
          <div className="canvas-paper">
            <ProjectRoomRenderer
              project={project}
              preview={!cleanPreview}
              editable={!cleanPreview}
              selectedId={selected.id}
              onSelectBlock={(id) => {
                setSelectedId(id);
                setPanel('BLOCKS');
              }}
              onEditProject={editProject}
              onEditBlock={(id, field, value) =>
                updateBlock(id, {
                  content: { [field]: value },
                })
              }
              onStatusClick={() => {
                setStatusOpen(true);
                setPanel('EDITOR');
              }}
              onMoveBlock={reorder}
              onDuplicateBlock={(id) => {
                setSelectedId(id);
                duplicate();
              }}
              onToggleBlock={(id) =>
                updateBlock(id, {
                  settings: {
                    visible: !project.blocks.find((block) => block.id === id)
                      ?.settings.visible,
                  },
                })
              }
              onDeleteBlock={(id) => {
                if (project.blocks.length > 1) {
                  const next = project.blocks.filter(
                    (block) => block.id !== id,
                  );
                  commit((current) => ({ ...current, blocks: next }));
                  setSelectedId(next[0].id);
                }
              }}
            />
          </div>
        </div>
        <aside className="studio-blocks">
          <div className="block-head">
            <div>
              <span className="studio-kicker">O QUE TEM NELA?_</span>
              <small>Arraste para mudar a ordem.</small>
            </div>
            <button
              className="studio-button studio-button-coral"
              onClick={() => setPickerOpen((open) => !open)}
            >
              + adicionar
            </button>
          </div>
          {pickerOpen && (
            <div className="block-picker">
              <b>O QUE VOCÊ QUER COLOCAR NESSA SALA?_</b>
              <small>Escolha uma peça para continuar.</small>
              <div className="picker-groups">
                {(
                  [
                    'CONTEÚDO_',
                    'MÍDIA_',
                    'PROJETO_',
                    'DESENVOLVIMENTO_',
                    'ARQUIVO_',
                  ] as const
                ).map((group, groupIndex) => (
                  <div key={group}>
                    <span>{group}</span>
                    {blockTypes
                      .filter((_, index) => index % 5 === groupIndex)
                      .map((type) => (
                        <button onClick={() => addBlock(type)} key={type}>
                          <i>{blockIcons[type]}</i>
                          <strong>{blockNames[type]}</strong>
                          <small>{blockDescriptions[type]}</small>
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="block-list">
            {project.blocks.map((block, index) => (
              <button
                draggable
                onDragStart={() => setDraggedId(block.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => dropBlock(block.id)}
                className={selected.id === block.id ? 'selected' : ''}
                onClick={() => {
                  setSelectedId(block.id);
                  setPanel('BLOCKS');
                }}
                key={block.id}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <b>{blockNames[block.type]}</b>
                <small>{block.settings.visible ? 'visível' : 'oculto'}</small>
                <em>⠿</em>
              </button>
            ))}
          </div>
          <div className="block-actions">
            <button
              onClick={() => reorder(selected.id, -1)}
              aria-label="Mover bloco para cima"
            >
              ↑
            </button>
            <button
              onClick={() => reorder(selected.id, 1)}
              aria-label="Mover bloco para baixo"
            >
              ↓
            </button>
            <button onClick={duplicate}>duplicar</button>
            <button
              onClick={() =>
                updateBlock(selected.id, {
                  settings: { visible: !selected.settings.visible },
                })
              }
            >
              {selected.settings.visible ? 'ocultar' : 'mostrar'}
            </button>
            <button onClick={remove}>deletar</button>
          </div>
          <div className="block-editor">
            <span className="studio-kicker">EDITAR ESTA PEÇA_</span>
            <label>
              Título
              <input
                value={selected.content.title}
                onChange={(event) =>
                  updateBlock(selected.id, {
                    content: { title: event.target.value },
                  })
                }
              />
            </label>
            <label>
              Texto
              <textarea
                value={selected.content.body}
                onChange={(event) =>
                  updateBlock(selected.id, {
                    content: { body: event.target.value },
                  })
                }
              />
            </label>
            {(selected.type === 'IMAGE' || selected.type === 'GALLERY') && (
              <label>
                Imagem URL
                <input
                  placeholder="https://..."
                  value={selected.content.mediaUrl ?? ''}
                  onChange={(event) =>
                    updateBlock(selected.id, {
                      content: { mediaUrl: event.target.value },
                    })
                  }
                />
              </label>
            )}
            <div className="mini-settings">
              <label>
                Largura
                <select
                  value={selected.settings.width ?? 'NORMAL'}
                  onChange={(event) =>
                    updateBlock(selected.id, {
                      settings: { width: event.target.value as BlockWidth },
                    })
                  }
                >
                  <option value="NARROW">estreita</option>
                  <option value="NORMAL">normal</option>
                  <option value="WIDE">larga</option>
                  <option value="FULL">inteira</option>
                </select>
              </label>
              <label>
                Alinhamento
                <select
                  value={selected.settings.align ?? 'LEFT'}
                  onChange={(event) =>
                    updateBlock(selected.id, {
                      settings: { align: event.target.value as BlockAlign },
                    })
                  }
                >
                  <option value="LEFT">esquerda</option>
                  <option value="CENTER">centro</option>
                  <option value="RIGHT">direita</option>
                </select>
              </label>
              <label>
                Estilo
                <select
                  value={selected.settings.style ?? 'CARD'}
                  onChange={(event) =>
                    updateBlock(selected.id, {
                      settings: { style: event.target.value as BlockStyle },
                    })
                  }
                >
                  <option value="PLAIN">plano</option>
                  <option value="PAPER">papel</option>
                  <option value="CARD">cartão</option>
                  <option value="FLOATING">flutuante</option>
                  <option value="BORDERLESS">sem borda</option>
                  <option value="FEATURED">destaque</option>
                </select>
              </label>
            </div>
            {selected.type === 'HERO' && (
              <label>
                Composição
                <select
                  value={selected.settings.heroVariant ?? 'EDITORIAL'}
                  onChange={(event) =>
                    updateBlock(selected.id, {
                      settings: {
                        heroVariant: event.target.value as HeroVariant,
                      },
                    })
                  }
                >
                  <option value="EDITORIAL">editorial</option>
                  <option value="CENTERED">centralizada</option>
                  <option value="POSTER">poster</option>
                  <option value="MINIMAL">minimal</option>
                  <option value="MEDIA_LEFT">mídia à esquerda</option>
                  <option value="MEDIA_RIGHT">mídia à direita</option>
                </select>
              </label>
            )}
            {selected.type === 'GALLERY' && (
              <label>
                Forma da galeria
                <select
                  value={selected.settings.galleryVariant ?? 'GRID'}
                  onChange={(event) =>
                    updateBlock(selected.id, {
                      settings: {
                        galleryVariant: event.target.value as GalleryVariant,
                      },
                    })
                  }
                >
                  <option value="GRID">grade</option>
                  <option value="STRIP">faixa</option>
                  <option value="MASONRY">mosaico</option>
                  <option value="FEATURED">destaque</option>
                </select>
              </label>
            )}
          </div>
          <div className="suggestion">
            <b>SUGESTÃO PARA {typeLabels[project.category].toUpperCase()}_</b>
            <span>{suggested.map((type) => blockNames[type]).join(' · ')}</span>
          </div>
        </aside>
      </section>
      <footer className="studio-footer">
        <button
          className="studio-button"
          onClick={() => {
            localStorage.removeItem('studio-draft');
            setProject(createDefaultProject());
            setPast([]);
            setFuture([]);
            setSavedAt('resetado');
          }}
        >
          resetar rascunho
        </button>
        <button
          className="studio-button studio-button-dark"
          onClick={() => setRoomOpened(true)}
        >
          ABRIR AO PÚBLICO_ ↗
        </button>
        <span>
          salvo neste navegador · <kbd>⌘/Ctrl Z</kbd> desfaz
        </span>
      </footer>
    </main>
  );
}
