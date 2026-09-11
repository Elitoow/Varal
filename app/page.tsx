'use client';
/* oxlint-disable jsx-a11y/control-has-associated-label, next/no-html-link-for-pages */

import { useMemo, useState, useSyncExternalStore, useEffect } from 'react';
import projects from '../canon/projects.json';
import entities from '../canon/presentation_entities.json';
import timeline from '../canon/timeline.json';
import worlds from '../canon/project-worlds.json';
import PlaygroundPanel from '../components/playground/PlaygroundPanel';

type Language = 'pt' | 'en';
const familyGroups = [
  { key: 'ESTER', label: 'IA & IDENTIDADE_', ids: ['ESTER'] },
  { key: 'ONE LIFE / IARA', label: 'AGÊNCIA & VIDA_', ids: ['ONE LIFE / IARA'] },
  { key: 'PAVI EMS', label: 'CARROS & ELETRÔNICA_', ids: ['PAVI EMS'] },
  { key: 'GAMES', label: 'JOGOS & MUNDOS_', ids: ['GAMES'] },
  { key: 'ENGINE / MECHANICAL', label: 'MOTORES & MECÂNICA_', ids: ['ENGINE / MECHANICAL'] },
  { key: 'DOCUMENTARY / ARCHIVE', label: 'ARQUIVO & DOCUMENTOS_', ids: ['DOCUMENTARY / ARCHIVE'] },
  { key: 'CHARACTERS', label: 'PERSONAGENS & DADOS_', ids: ['CHARACTERS'] },
  { key: 'EXPERIMENTS', label: 'EXPERIMENTOS_', ids: ['EXPERIMENTS'] },
];
const t = {
  pt: { nav: ['VARAL', 'GAVETAS', 'O QUE SOBROU', 'O QUE SUMIU', 'ARQUEOLOGIA'], kicker: 'VARAL_DO_ARQUIVO / pendure seu projeto', title: 'Coisas que decidimos', em: 'tentar.', intro: 'Um varal de projetos inacabados. Pendure suas sobras: pastas, placas, modelos, cenas, documentos e perguntas que ainda não fecharam. Cada projeto é um post, cada post é uma história.', drawers: 'Explorar gavetas', survived: 'O que sobrou_', missing: 'O que sumiu_', surprise: 'Me surpreenda_', progress: 'Seu varal_', method: 'Como usar o varal', archaeology: 'Ver registro técnico', note: 'A história vive nos objetos. O registro técnico continua disponível quando a brincadeira precisa de precisão.', newPost: 'Pendurar projeto', feed: 'Varal recente', following: 'Seguindo', trending: 'Em alta', stories: 'Histórias' },
  en: { nav: ['FEED', 'DRAWERS', 'WHAT SURVIVED', 'WHAT DISAPPEARED', 'ARCHAEOLOGY'], kicker: 'PROJECT_FEED / hang your project', title: 'Things we decided', em: 'to try.', intro: 'A clothesline of unfinished projects. Hang your remains: folders, boards, models, scenes, documents and questions that never quite closed. Each project is a post, each post tells a story.', drawers: 'Browse drawers', survived: 'What survived_', missing: 'What disappeared_', surprise: 'Surprise me_', progress: 'Your feed_', method: 'How to use the feed', archaeology: 'Open technical record', note: 'The story lives in the objects. The technical record stays available whenever play needs precision.', newPost: 'Hang project', feed: 'Recent feed', following: 'Following', trending: 'Trending', stories: 'Stories' },
};
const subscribeLocalArchive = (onChange: () => void) => { if (typeof window === 'undefined') return () => {}; window.addEventListener('storage', onChange); window.addEventListener('archive-local-change', onChange); return () => { window.removeEventListener('storage', onChange); window.removeEventListener('archive-local-change', onChange); }; };
const localArchiveValue = (key: string) => typeof window === 'undefined' ? '[]' : window.localStorage.getItem(key) ?? '[]';
const parseLocalArray = (value: string) => { try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []; } catch { return []; } };

// Generate pseudo-random but deterministic values based on project id
const getProjectMeta = (id: string) => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rotations = [(hash % 7) - 3, ((hash * 2) % 9) - 4, ((hash * 3) % 6) - 2];
  const pinColors = ['p1', 'p2', 'p3'];
  const pinIndex = hash % 3;
  const likes = (hash * 17) % 500;
  const comments = (hash * 13) % 50;
  const saves = (hash * 11) % 100;
  const timeAgo = ['2h', '5h', '1d', '3d', '1w', '2w', '1m'][hash % 7];
  return { rotations, pinColor: pinColors[pinIndex], likes, comments, saves, timeAgo };
};

export default function Home() {
  const [language, setLanguage] = useState<Language>('pt');
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'feed' | 'drawers'>('feed');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const visited = parseLocalArray(useSyncExternalStore(subscribeLocalArchive, () => localArchiveValue('archive-visited'), () => '[]'));
  const achievements = parseLocalArray(useSyncExternalStore(subscribeLocalArchive, () => localArchiveValue('archive-achievements'), () => '[]'));
  const [emptyClicks, setEmptyClicks] = useState(0);
  const [recordMode, setRecordMode] = useState(false);
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());
  const [savedProjects, setSavedProjects] = useState<Set<string>>(new Set());
  const copy = t[language];
  
  // Load saved likes/saves from localStorage
  useEffect(() => {
    try {
      const savedLikes = localStorage.getItem('varal-likes');
      const savedSaves = localStorage.getItem('varal-saves');
      if (savedLikes) setLikedProjects(new Set(JSON.parse(savedLikes)));
      if (savedSaves) setSavedProjects(new Set(JSON.parse(savedSaves)));
    } catch {}
  }, []);

  const unlock = (name: string) => { if (achievements.includes(name)) return; const next = [...achievements, name]; try { localStorage.setItem('archive-achievements', JSON.stringify(next)); window.dispatchEvent(new Event('archive-local-change')); } catch { /* ignore */ } };
  const recordVisit = (id: string) => { const next = Array.from(new Set([...visited, id])); try { localStorage.setItem('archive-visited', JSON.stringify(next)); window.dispatchEvent(new Event('archive-local-change')); } catch { /* ignore */ } if (next.length >= 10) unlock('ARQUEÓLOGO AMADOR_'); if (['pavi-ems-p0', 'pavi-ems-p1', 'pavi-ems-p05x', 'ft300x'].every((item) => next.includes(item))) unlock('OFICINA_'); if (id === 'ai-game-battle') unlock('SEM VENCEDOR_'); };
  const surprise = () => { const options = projects.map((p) => `/projects/${p.id}`).concat(['/artifacts', '/graveyard', '/archaeology']); window.location.href = options[Math.floor(Math.random() * options.length)]; };
  
  const toggleLike = (id: string) => {
    const next = new Set(likedProjects);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLikedProjects(next);
    try { localStorage.setItem('varal-likes', JSON.stringify(Array.from(next))); } catch {}
  };
  
  const toggleSave = (id: string) => {
    const next = new Set(savedProjects);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSavedProjects(next);
    try { localStorage.setItem('varal-saves', JSON.stringify(Array.from(next))); } catch {}
  };

  const filteredProjects = useMemo(() => {
    let result = projects;
    if (activeFilter !== 'all') {
      result = result.filter(p => {
        if (activeFilter === 'survived') return p.state !== 'FROZEN' || p.build !== 'NO' || p.runtime !== 'NO';
        if (activeFilter === 'missing') return p.state === 'FROZEN' && (p.build === 'NO' || p.runtime === 'NO');
        const group = familyGroups.find(g => g.ids.includes(p.family));
        return group?.key === activeFilter;
      });
    }
    if (query) {
      result = result.filter((p) => `${p.name} ${p.aliases.join(' ')} ${p.short}`.toLowerCase().includes(query.toLowerCase()));
    }
    return result;
  }, [query, activeFilter]);

  const beyond = entities.find((e) => e.entity_id === 'beyond-racing-3d');
  const grave = projects.filter((p) => p.state !== 'FROZEN' || p.build === 'NO' || p.runtime === 'NO' || p.maturity.includes('LOST') || p.maturity.includes('MISSING'));
  
  // Get random projects for "stories" section
  const storyProjects = useMemo(() => projects.slice(0, 8), []);
  
  return (
    <main className="varal-archive">
      {/* Top Navigation */}
      <header className="varal-topbar">
        <div className="varal-wrap">
          <a href="#top" className="varal-brand">
            <span className="brand-pin">🧷</span>
            <span className="brand-text">VARAL<span className="brand-sub">_do_arquivo</span></span>
          </a>
          <nav className="varal-nav">
            <button 
              className={`nav-btn ${viewMode === 'feed' ? 'active' : ''}`}
              onClick={() => setViewMode('feed')}
            >
              {copy.feed}
            </button>
            <button 
              className={`nav-btn ${viewMode === 'drawers' ? 'active' : ''}`}
              onClick={() => setViewMode('drawers')}
            >
              {copy.drawers}
            </button>
            <a href="#survived">{copy.survived}</a>
            <a href="#missing">{copy.missing}</a>
            <a href="/archaeology">{copy.archaeology}</a>
          </nav>
          <div className="varal-tools">
            <button 
              className="lang-btn"
              onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
            >
              {language === 'pt' ? 'EN' : 'PT'}
            </button>
            <div className="user-avatar">AI</div>
          </div>
        </div>
      </header>

      {/* Stories Section (only in feed mode) */}
      {viewMode === 'feed' && (
        <section className="stories-section">
          <div className="varal-wrap">
            <div className="stories-strip">
              {storyProjects.map((project, i) => {
                const meta = getProjectMeta(project.id);
                return (
                  <button key={project.id} className="story-bubble" onClick={() => recordVisit(project.id)}>
                    <div className={`story-ring ${i % 3 === 0 ? 'ring-1' : i % 3 === 1 ? 'ring-2' : 'ring-3'}`}>
                      <div className="story-img-placeholder">{project.name.charAt(0)}</div>
                    </div>
                    <span className="story-label">{project.name.slice(0, 12)}{project.name.length > 12 ? '...' : ''}</span>
                  </button>
                );
              })}
              <button className="story-bubble story-add">
                <div className="story-ring ring-add">+</div>
                <span className="story-label">{copy.newPost}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="varal-hero" id="top">
        <div className="varal-wrap">
          <div className="hero-content">
            <span className="hero-eyebrow">{copy.kicker}</span>
            <h1>{copy.title}<br /><em>{copy.em}</em></h1>
            <p className="hero-lead">{copy.intro}</p>
            <div className="hero-actions">
              <button 
                className="btn btn-primary"
                onClick={() => document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {viewMode === 'feed' ? 'Explorar varal ↘' : copy.drawers}
              </button>
              <button className="btn btn-outline" onClick={surprise}>
                {copy.surprise} ✦
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <strong>{projects.length}</strong>
                <span>projetos</span>
              </div>
              <div className="stat">
                <strong>{visited.length}</strong>
                <span>visitados</span>
              </div>
              <div className="stat">
                <strong>{achievements.length}</strong>
                <span>conquistas</span>
              </div>
            </div>
          </div>
          {/* Decorative rope with hanging cards */}
          <div className="hero-rope">
            <svg className="rope-svg" viewBox="0 0 400 100" preserveAspectRatio="none">
              <path 
                d="M0,50 Q100,30 200,50 T400,50" 
                fill="none" 
                stroke="var(--rope)" 
                strokeWidth="3"
              />
            </svg>
            {projects.slice(0, 5).map((project, i) => {
              const meta = getProjectMeta(project.id);
              const left = (i * 20) + 5;
              const top = (i % 2 === 0 ? 60 : 75) + Math.sin(i) * 15;
              const rot = meta.rotations[0];
              return (
                <a 
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className={`hanging-card ${meta.pinColor}`}
                  style={{ left: `${left}%`, top: `${top}px`, transform: `rotate(${rot}deg)` }}
                  onClick={() => recordVisit(project.id)}
                >
                  <div className="card-pin" />
                  <div className="card-thumb">{project.name.charAt(0)}</div>
                  <span className="card-label">{project.state}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filter Tags */}
      {viewMode === 'feed' && (
        <section className="filter-section">
          <div className="varal-wrap">
            <div className="filter-chips">
              <button 
                className={`chip ${activeFilter === 'all' ? 'on' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                Todos
              </button>
              {familyGroups.map(group => (
                <button
                  key={group.key}
                  className={`chip ${activeFilter === group.key ? 'on' : ''}`}
                  onClick={() => setActiveFilter(group.key)}
                >
                  {group.label.replace('_', '')}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <div className="varal-layout">
        {/* Sidebar */}
        <aside className="varal-sidebar">
          <div className="side-card profile-card">
            <div className="profile-header">
              <div className="profile-avatar">AI</div>
              <div>
                <strong>Arquivo Inacabado</strong>
                <span className="profile-level">Nível {Math.floor(visited.length / 3) + 1}</span>
              </div>
            </div>
            <div className="profile-stats">
              <div className="ps-item">
                <strong>{visited.length}</strong>
                <span>visitas</span>
              </div>
              <div className="ps-item">
                <strong>{likedProjects.size}</strong>
                <span>likes</span>
              </div>
              <div className="ps-item">
                <strong>{savedProjects.size}</strong>
                <span>salvos</span>
              </div>
            </div>
            {achievements.length > 0 && (
              <div className="profile-achievements">
                <h4>Conquistas</h4>
                <div className="achievement-list">
                  {achievements.slice(0, 3).map(a => (
                    <span key={a} className="ach-tag">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="side-card trends-card">
            <h4>Em Alta 🔥</h4>
            <div className="trends-list">
              {projects.slice(0, 5).map((project, i) => {
                const meta = getProjectMeta(project.id);
                return (
                  <a 
                    key={project.id} 
                    href={`/projects/${project.id}`}
                    className="trend-item"
                    onClick={() => recordVisit(project.id)}
                  >
                    <span className="trend-rank">#{i + 1}</span>
                    <span className="trend-name">{project.name}</span>
                    <span className="trend-count">{meta.likes}</span>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="side-card suggestions-card">
            <h4>Sugestões</h4>
            <div className="suggestions-list">
              {projects.slice(5, 8).map(project => (
                <div key={project.id} className="suggestion-item">
                  <div className="sugg-avatar">{project.name.charAt(0)}</div>
                  <div>
                    <strong>{project.name}</strong>
                    <span>{project.family}</span>
                  </div>
                  <button className="follow-btn">Seguir</button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Feed or Drawers */}
        <section className="varal-main" id="feed">
          {viewMode === 'feed' ? (
            /* FEED MODE - Social Media Style */
            <div className="feed-container">
              {filteredProjects.map((project, i) => {
                const world = worlds.find((w) => w.entity_id === project.id);
                const meta = getProjectMeta(project.id);
                const isLiked = likedProjects.has(project.id);
                const isSaved = savedProjects.has(project.id);
                
                return (
                  <article 
                    key={project.id} 
                    className={`feed-post post-${meta.pinColor}`}
                    style={{ '--rot': `${meta.rotations[i % 3]}deg` } as React.CSSProperties}
                  >
                    {/* Post Header */}
                    <div className="post-header">
                      <div className="post-avatar">{project.name.charAt(0)}</div>
                      <div className="post-meta">
                        <strong>{project.name}</strong>
                        <span>{meta.timeAgo} · {world?.motif ?? 'archive'}</span>
                      </div>
                      <span className="post-type">{project.state}</span>
                    </div>

                    {/* Post Content */}
                    <a href={`/projects/${project.id}`} onClick={() => recordVisit(project.id)}>
                      <div className="post-media">
                        <div className="media-placeholder">
                          {project.name.charAt(0)}
                        </div>
                        <span className="media-tag">{project.artifact}</span>
                      </div>
                    </a>

                    {/* Post Info */}
                    <div className="post-info">
                      <h3 className="post-title">{project.oneLine}</h3>
                      <div className="post-tags">
                        {project.aliases.slice(0, 3).map(alias => (
                          <span key={alias} className="tag-pill">{alias}</span>
                        ))}
                      </div>
                    </div>

                    {/* Post Actions */}
                    <div className="post-actions">
                      <button 
                        className={`action-btn like ${isLiked ? 'on' : ''}`}
                        onClick={() => toggleLike(project.id)}
                      >
                        <span className="action-icon">{isLiked ? '❤️' : '🤍'}</span>
                        <span className="action-count">{isLiked ? meta.likes + 1 : meta.likes}</span>
                      </button>
                      <button className="action-btn comment">
                        <span className="action-icon">💬</span>
                        <span className="action-count">{meta.comments}</span>
                      </button>
                      <button 
                        className={`action-btn save ${isSaved ? 'on' : ''}`}
                        onClick={() => toggleSave(project.id)}
                      >
                        <span className="action-icon">{isSaved ? '📌' : '📍'}</span>
                        <span className="action-count">{isSaved ? meta.saves + 1 : meta.saves}</span>
                      </button>
                      <button className="action-btn share">
                        <span className="action-icon">🔗</span>
                        <span>Compartilhar</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* DRAWERS MODE - Original Archive Style */
            <div className="drawers-container" id="drawers">
              <div className="drawers-header">
                <h2>{copy.drawers}</h2>
                <label className="search-box">
                  <span>⌕</span>
                  <input 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    placeholder={language === 'pt' ? 'procurar...' : 'search...'} 
                  />
                </label>
              </div>
              {familyGroups.map((group, index) => {
                const items = filteredProjects.filter((p) => group.ids.includes(p.family));
                if (items.length === 0) return null;
                return (
                  <details 
                    className={`drawer drawer-${index + 1}`} 
                    open={index < 2} 
                    key={group.key}
                  >
                    <summary>
                      <span className="drawer-tab">{String(index + 1).padStart(2, '0')}</span>
                      <strong>{group.label}</strong>
                      <small>{items.length} objetos</small>
                    </summary>
                    <div className="drawer-items">
                      {items.map((project) => {
                        const world = worlds.find((w) => w.entity_id === project.id);
                        return (
                          <a 
                            className="object-card" 
                            href={`/projects/${project.id}`} 
                            onClick={() => recordVisit(project.id)} 
                            key={project.id}
                          >
                            <span className="object-card-meta">
                              {project.latest} / {world?.motif ?? 'archive'}
                            </span>
                            <h3>{project.name}<b>↗</b></h3>
                            <p>{project.oneLine}</p>
                            <span className="object-card-foot">
                              {project.state} · {project.artifact}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Survived Zone */}
      <section className="survived-zone" id="survived">
        <div className="varal-wrap">
          <div className="zone-heading">
            <span className="zone-eyebrow">02 / {copy.survived}</span>
            <h2>O que funcionou</h2>
            <p>Projetos que sobreviveram ao processo criativo.</p>
          </div>
          <div className="survived-grid">
            {projects.filter(p => p.build !== 'NO').slice(0, 6).map((project, i) => (
              <a 
                href={`/projects/${project.id}`} 
                key={project.id}
                className="survived-card"
                onClick={() => recordVisit(project.id)}
              >
                <span className="survived-index">{String(i + 1).padStart(2, '0')}</span>
                <strong>{project.name}</strong>
                <span>{project.artifact}</span>
                <i className="status-indicator">{project.state}</i>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Missing Zone */}
      {beyond && (
        <section className="missing-zone" id="missing">
          <div className="varal-wrap">
            <div className="envelope-wrapper">
              <div className="envelope-label">FORA DO VARAL_</div>
              <div className="envelope-content">
                <span className="zone-eyebrow">03 / {copy.missing}</span>
                <h2>Há projetos sem build</h2>
                <p>Alguns projetos têm código preservado mas nunca foram compilados.</p>
                <a 
                  className="btn btn-dark" 
                  href="/entities/beyond-racing-3d"
                  onClick={() => recordVisit('beyond-racing-3d')}
                >
                  Ver envelope ↗
                </a>
              </div>
              <div className="envelope-mark">BUILD<br /><span>?</span></div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="varal-footer">
        <div className="varal-wrap">
          <div className="footer-content">
            <div className="footer-brand">
              <strong>VARAL_do_arquivo</strong>
              <span>feito de coisas que sobraram</span>
            </div>
            <div className="footer-stats">
              <span>CANON: {projects.length}</span>
              <span>ROOMS: 21</span>
              <span>VISITAS: {visited.length}</span>
            </div>
            <div className="footer-links">
              <a href="/about">sobre ↗</a>
              <a href="/archaeology">arqueologia ↗</a>
              <a href="/graveyard">cemitério ↗</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <div className="toast-container" id="toastContainer" />
    </main>
  );
}
