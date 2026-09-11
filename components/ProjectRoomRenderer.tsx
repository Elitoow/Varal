'use client';

import {
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import type { ProjectRoom, RoomBlock } from '../lib/project-room-schema';
import { statusLabels, typeLabels } from '../lib/project-room-schema';

const blockLabel: Record<RoomBlock['type'], string> = {
  HERO: 'ABERTURA_',
  ABOUT: 'SOBRE_',
  INFO: 'FICHA_',
  TEXT: 'TEXTO_',
  IMAGE: 'IMAGEM_',
  GALLERY: 'GALERIA_',
  VIDEO: 'VÍDEO_',
  DEVLOG: 'DIÁRIO_',
  TIMELINE: 'LINHA DO TEMPO_',
  GITHUB: 'GITHUB_',
  DOWNLOADS: 'DOWNLOADS_',
  RUN: 'RUN / DEMO_',
  ARTIFACTS: 'ARTEFATOS_',
  COLLABORATORS: 'COLABORADORES_',
  QUOTE: 'CITAÇÃO_',
  LINKS: 'LINKS_',
  CUSTOM: 'SEÇÃO_',
};
type RendererProps = {
  project: ProjectRoom;
  preview?: boolean;
  editable?: boolean;
  selectedId?: string;
  onSelectBlock?: (id: string) => void;
  onEditProject?: (field: 'title' | 'description', value: string) => void;
  onEditBlock?: (id: string, field: 'title' | 'body', value: string) => void;
  onStatusClick?: () => void;
  onMoveBlock?: (id: string, direction: -1 | 1) => void;
  onDuplicateBlock?: (id: string) => void;
  onToggleBlock?: (id: string) => void;
  onDeleteBlock?: (id: string) => void;
};
function editKey(event: KeyboardEvent<HTMLElement>) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    event.currentTarget.blur();
  }
}
function editableProps(
  editable: boolean,
  value: string,
  onCommit?: (next: string) => void,
) {
  return editable
    ? {
        contentEditable: true,
        suppressContentEditableWarning: true,
        onBlur: (event: FocusEvent<HTMLElement>) =>
          onCommit?.(event.currentTarget.textContent ?? value),
        onKeyDown: editKey,
        role: 'textbox',
        tabIndex: 0,
      }
    : {};
}

export function ProjectRoomRenderer({
  project,
  preview = false,
  editable = false,
  selectedId,
  onSelectBlock,
  onEditProject,
  onEditBlock,
  onStatusClick,
  onMoveBlock,
  onDuplicateBlock,
  onToggleBlock,
  onDeleteBlock,
}: RendererProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const visibleBlocks = project.blocks.filter(
    (block) => block.settings.visible,
  );
  return (
    <article
      className={`room-renderer world-${project.world.toLowerCase()} font-${project.theme.font.toLowerCase()} density-${project.theme.density.toLowerCase()} width-${project.theme.width.toLowerCase()} ${preview ? 'is-preview' : ''} ${editable ? 'is-editable' : ''}`}
      style={
        {
          '--room-accent': project.theme.accent,
          '--room-paper': project.theme.background,
        } as CSSProperties
      }
    >
      <header
        className={`room-hero hero-${project.blocks.find((block) => block.type === 'HERO')?.settings.heroVariant?.toLowerCase() ?? 'editorial'}`}
      >
        <span className="room-kicker">
          {project.category} /{' '}
          <button
            className="room-status-edit"
            onClick={onStatusClick}
            disabled={!editable}
          >
            {statusLabels[project.status]}
          </button>
        </span>
        <h1
          {...editableProps(editable, project.title, (next) =>
            onEditProject?.('title', next),
          )}
        >
          {project.title}
        </h1>
        <p
          {...editableProps(editable, project.description, (next) =>
            onEditProject?.('description', next),
          )}
        >
          {project.description}
        </p>
      </header>
      <div className="room-meta">
        <span>{typeLabels[project.category]}</span>
        <span>{project.visibility}</span>
        <span>{project.blocks.length} blocos</span>
      </div>
      <div className="room-blocks">
        {visibleBlocks.map((block) => (
          <section
            className={`room-block room-block-${block.type.toLowerCase()} gallery-${block.settings.galleryVariant ?? 'GRID'} block-width-${block.settings.width ?? 'NORMAL'} block-align-${block.settings.align ?? 'LEFT'} block-style-${block.settings.style ?? 'CARD'} ${selectedId === block.id ? 'is-selected' : ''}`}
            onClick={() => onSelectBlock?.(block.id)}
            key={block.id}
          >
            {editable && selectedId === block.id && (
              <>
                <span className="inline-selection-hint">
                  bloco selecionado · edite direto aqui
                </span>
                <div
                  className="inline-block-toolbar"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    onClick={() => onMoveBlock?.(block.id, -1)}
                    title="Mover para cima"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => onMoveBlock?.(block.id, 1)}
                    title="Mover para baixo"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => onDuplicateBlock?.(block.id)}
                    title="Duplicar"
                  >
                    duplicar_
                  </button>
                  <button
                    onClick={() => onToggleBlock?.(block.id)}
                    title="Ocultar"
                  >
                    ocultar_
                  </button>
                  <button
                    onClick={() => onDeleteBlock?.(block.id)}
                    title="Excluir"
                  >
                    ×
                  </button>
                </div>
              </>
            )}
            <span className="room-block-label">{blockLabel[block.type]}</span>
            <h2
              {...editableProps(editable, block.content.title, (next) =>
                onEditBlock?.(block.id, 'title', next),
              )}
            >
              {block.content.title}
            </h2>
            {block.content.mediaUrl && (
              <button
                className="room-media-button"
                onClick={(event) => {
                  event.stopPropagation();
                  setLightbox(block.content.mediaUrl ?? null);
                }}
              >
                <img src={block.content.mediaUrl} alt={block.content.title} />
              </button>
            )}
            {(block.type === 'IMAGE' || block.type === 'GALLERY') &&
              !block.content.mediaUrl && (
                <button
                  className="room-image-placeholder"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectBlock?.(block.id);
                  }}
                >
                  <span>＋</span> toque para configurar uma imagem
                </button>
              )}
            <p
              {...editableProps(editable, block.content.body, (next) =>
                onEditBlock?.(block.id, 'body', next),
              )}
            >
              {block.content.body}
            </p>
            {block.content.date && <time>{block.content.date}</time>}
            {block.content.items?.map((item) => (
              <div className="room-item" key={item}>
                {item}
              </div>
            ))}
          </section>
        ))}
      </div>
      {preview && (
        <footer className="room-preview-mark">
          PRÉVIA DA SALA_ · clique no texto para editar
        </footer>
      )}
      {lightbox && (
        <div
          className="room-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Imagem ampliada"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="Imagem ampliada" />
          <button onClick={() => setLightbox(null)}>fechar_</button>
        </div>
      )}
    </article>
  );
}
