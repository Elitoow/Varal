export type ProjectType =
  | 'GAME'
  | 'AUTOMOTIVE'
  | 'BOOK'
  | 'SOFTWARE'
  | 'ELECTRONICS'
  | 'ART'
  | 'MECHANICAL'
  | 'RESEARCH'
  | 'MUSIC'
  | 'AI'
  | 'OTHER';
export type ProjectStatus =
  | 'IDEA'
  | 'STARTING'
  | 'IN_PROGRESS'
  | 'WORKS'
  | 'ALMOST'
  | 'PAUSED'
  | 'ABANDONED'
  | 'FINISHED'
  | 'DONT_ASK';
export type World =
  | 'CADERNO'
  | 'OFICINA'
  | 'ZINE'
  | 'TERMINAL'
  | 'ARCADE'
  | 'GALERIA'
  | 'MINIMAL';
export type BlockType =
  | 'HERO'
  | 'ABOUT'
  | 'INFO'
  | 'TEXT'
  | 'IMAGE'
  | 'GALLERY'
  | 'VIDEO'
  | 'DEVLOG'
  | 'TIMELINE'
  | 'GITHUB'
  | 'DOWNLOADS'
  | 'RUN'
  | 'ARTIFACTS'
  | 'COLLABORATORS'
  | 'QUOTE'
  | 'LINKS'
  | 'CUSTOM';
export type BlockWidth = 'NARROW' | 'NORMAL' | 'WIDE' | 'FULL';
export type BlockAlign = 'LEFT' | 'CENTER' | 'RIGHT';
export type BlockStyle =
  | 'PLAIN'
  | 'PAPER'
  | 'CARD'
  | 'FLOATING'
  | 'BORDERLESS'
  | 'FEATURED';
export type HeroVariant =
  | 'EDITORIAL'
  | 'MEDIA_LEFT'
  | 'MEDIA_RIGHT'
  | 'POSTER'
  | 'CENTERED'
  | 'MINIMAL';
export type GalleryVariant = 'GRID' | 'STRIP' | 'MASONRY' | 'FEATURED';

export type RoomBlock = {
  id: string;
  type: BlockType;
  content: {
    title: string;
    body: string;
    items?: string[];
    mediaUrl?: string;
    date?: string;
  };
  settings: {
    visible: boolean;
    width?: BlockWidth;
    align?: BlockAlign;
    style?: BlockStyle;
    heroVariant?: HeroVariant;
    galleryVariant?: GalleryVariant;
  };
};
export type ProjectRoom = {
  id: string;
  ownerId: string;
  slug: string;
  title: string;
  description: string;
  category: ProjectType;
  status: ProjectStatus;
  visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE';
  world: World;
  theme: {
    accent: string;
    background: string;
    font: 'SANS' | 'SERIF' | 'MONO';
    density: 'AIRY' | 'COMPACT';
    width: 'NARROW' | 'WIDE';
    border: 'SHARP' | 'SOFT';
  };
  blocks: RoomBlock[];
  integrations: { github?: { repository: string; mocked: boolean } };
  createdAt: string;
  updatedAt: string;
};

export const statusLabels: Record<ProjectStatus, string> = {
  IDEA: 'SÓ UMA IDEIA_',
  STARTING: 'COMEÇANDO_',
  IN_PROGRESS: 'EM ANDAMENTO_',
  WORKS: 'FUNCIONA_',
  ALMOST: 'QUASE LÁ_',
  PAUSED: 'PAUSADO_',
  ABANDONED: 'ABANDONADO_',
  FINISHED: 'TERMINADO_',
  DONT_ASK: 'NÃO PERGUNTE_',
};
export const typeLabels: Record<ProjectType, string> = {
  GAME: 'Jogo',
  AUTOMOTIVE: 'Automotivo',
  BOOK: 'Livro',
  SOFTWARE: 'Software',
  ELECTRONICS: 'Eletrônica',
  ART: 'Arte',
  MECHANICAL: 'Mecânica',
  RESEARCH: 'Pesquisa',
  MUSIC: 'Música',
  AI: 'IA',
  OTHER: 'Outro',
};
export const worlds: { id: World; label: string; note: string }[] = [
  { id: 'CADERNO', label: 'CADERNO_', note: 'papel, notas e sobras' },
  { id: 'OFICINA', label: 'OFICINA_', note: 'metal, peças e bancada' },
  { id: 'ZINE', label: 'ZINE_', note: 'recortes, cor e contraste' },
  { id: 'TERMINAL', label: 'TERMINAL_', note: 'preciso, escuro e técnico' },
  { id: 'ARCADE', label: 'ARCADE_', note: 'energia, placar e movimento' },
  { id: 'GALERIA', label: 'GALERIA_', note: 'silêncio, imagem e espaço' },
  { id: 'MINIMAL', label: 'MINIMAL_', note: 'clareza sem ruído' },
];
const id = () => Math.random().toString(36).slice(2, 9);
export const defaultBlocks = (): RoomBlock[] => [
  {
    id: id(),
    type: 'HERO',
    content: { title: 'Minha nova sala_', body: 'Um projeto ainda começando.' },
    settings: { visible: true },
  },
  {
    id: id(),
    type: 'ABOUT',
    content: {
      title: 'Sobre o projeto_',
      body: 'Conte aqui o que você está tentando fazer e por que isso importa.',
    },
    settings: { visible: true },
  },
  {
    id: id(),
    type: 'GALLERY',
    content: {
      title: 'Imagens e referências_',
      body: 'Adicione imagens quando estiver pronto.',
      items: ['ESPAÇO PARA IMAGEM_'],
    },
    settings: { visible: true },
  },
  {
    id: id(),
    type: 'DEVLOG',
    content: {
      title: 'Diário de bordo_',
      body: 'Primeira anotação ainda não escrita.',
    },
    settings: { visible: true },
  },
  {
    id: id(),
    type: 'INFO',
    content: {
      title: 'Ficha do projeto_',
      body: 'Tipo · status · visibilidade',
    },
    settings: { visible: true },
  },
];
export const createDefaultProject = (): ProjectRoom => ({
  id: 'room-local-draft',
  ownerId: 'local-visitor',
  slug: 'minha-nova-sala',
  title: 'Minha nova sala_',
  description: 'Um projeto ainda começando.',
  category: 'OTHER',
  status: 'IDEA',
  visibility: 'UNLISTED',
  world: 'CADERNO',
  theme: {
    accent: '#e66d52',
    background: '#f3eddf',
    font: 'SANS',
    density: 'AIRY',
    width: 'WIDE',
    border: 'SHARP',
  },
  blocks: [
    {
      id: 'block-hero',
      type: 'HERO',
      content: {
        title: 'Minha nova sala_',
        body: 'Um projeto ainda começando.',
      },
      settings: { visible: true },
    },
    {
      id: 'block-about',
      type: 'ABOUT',
      content: {
        title: 'Sobre o projeto_',
        body: 'Conte aqui o que você está tentando fazer e por que isso importa.',
      },
      settings: { visible: true },
    },
    {
      id: 'block-gallery',
      type: 'GALLERY',
      content: {
        title: 'Imagens e referências_',
        body: 'Adicione imagens quando estiver pronto.',
        items: ['ESPAÇO PARA IMAGEM_'],
      },
      settings: { visible: true },
    },
    {
      id: 'block-devlog',
      type: 'DEVLOG',
      content: {
        title: 'Diário de bordo_',
        body: 'Primeira anotação ainda não escrita.',
      },
      settings: { visible: true },
    },
    {
      id: 'block-info',
      type: 'INFO',
      content: {
        title: 'Ficha do projeto_',
        body: 'Tipo · status · visibilidade',
      },
      settings: { visible: true },
    },
  ],
  integrations: {},
  createdAt: 'LOCAL_DRAFT',
  updatedAt: 'LOCAL_DRAFT',
});
const suggestionMap: Record<ProjectType, BlockType[]> = {
  GAME: ['HERO', 'RUN', 'GALLERY', 'ABOUT', 'DEVLOG', 'DOWNLOADS'],
  AUTOMOTIVE: ['HERO', 'ABOUT', 'GALLERY', 'TIMELINE', 'ARTIFACTS', 'DEVLOG'],
  BOOK: ['HERO', 'ABOUT', 'TEXT', 'TIMELINE', 'DEVLOG'],
  SOFTWARE: ['HERO', 'GITHUB', 'ABOUT', 'RUN', 'DEVLOG'],
  ELECTRONICS: ['HERO', 'GALLERY', 'ARTIFACTS', 'TIMELINE', 'GITHUB'],
  ART: ['HERO', 'GALLERY', 'TEXT', 'QUOTE'],
  MECHANICAL: ['HERO', 'ABOUT', 'GALLERY', 'ARTIFACTS'],
  RESEARCH: ['HERO', 'ABOUT', 'TIMELINE', 'ARTIFACTS'],
  MUSIC: ['HERO', 'GALLERY', 'DEVLOG', 'ABOUT'],
  AI: ['HERO', 'ABOUT', 'TIMELINE', 'GITHUB'],
  OTHER: ['HERO', 'ABOUT', 'GALLERY', 'DEVLOG'],
};
export const suggestedBlocks = (type: ProjectType): BlockType[] =>
  suggestionMap[type] ?? ['HERO', 'ABOUT', 'INFO'];
