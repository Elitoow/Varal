# VARAL - Rede Social de Projetos Inacabados

## 🧷 O que é o VARAL?

Uma rede social onde criadores penduram seus projetos inacabados, WIPs, experimentos e ideias em desenvolvimento. Mistura o melhor do Instagram, GitHub e Itch.io focado no **processo criativo**.

## 🚀 Funcionalidades

- **Feed Principal**: Posts estilo Instagram de projetos em andamento
- **Coleções**: Organize projetos por pastas (Jogos, Arte, Escrita, Música, Físico, Código)
- **Sistema de Contas**: Login/cadastro com Supabase Auth
- **Mensagens Diretas**: Chat entre usuários
- **Likes, Comentários e Saves**: Interação com projetos
- **Perfis Personalizados**: Bio, avatar, nível baseado em visitas
- **Filtros por Categoria**: Descubra projetos por tipo

## 📋 Pré-requisitos

1. Node.js >= 20
2. Conta no [Supabase](https://supabase.com)

## ⚙️ Configuração

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com/dashboard
2. Crie um novo projeto
3. Aguarde a inicialização

### 2. Configurar Banco de Dados

No SQL Editor do Supabase, execute:

```sql
-- Tabela de perfis
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  level INTEGER DEFAULT 1,
  visits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de coleções
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📁',
  color TEXT DEFAULT '#457b9d',
  projects_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de likes
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Tabela de mensagens
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Funções para contadores
CREATE OR REPLACE FUNCTION increment_like_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET likes_count = likes_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_like_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Collections viewable by everyone"
  ON collections FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own collections"
  ON collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Posts viewable by everyone"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own likes"
  ON likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
```

### 3. Configurar Variáveis de Ambiente

1. Copie `.env.local.example` para `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Edite `.env.local` com suas credenciais do Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Instalar e Rodar

```bash
npm install
npm run dev
```

Acesse http://localhost:3000

## 📁 Estrutura do Projeto

```
/workspace
├── app/                  # Next.js App Router
│   ├── api/             # API Routes
│   ├── layout.tsx       # Layout principal
│   └── page.tsx         # Página principal (VARAL)
├── components/          # Componentes React
│   ├── auth/           # Login, Cadastro
│   ├── feed/           # Feed, Posts
│   ├── collections/    # Coleções
│   ├── chat/           # Mensagens
│   └── ui/             # Componentes base
├── lib/                 # Utilitários e Supabase
│   ├── supabase/       # Clientes e funções
│   └── utils.ts        # Utilitários gerais
└── public/             # Assets estáticos
```

## 🎨 Design System

- **Cores**: Warm cream (#f4efe2), Vermelho (#e63946), Azul (#457b9d), Amarelo (#ffb703)
- **Fontes**: Bricolage Grotesque, Karla, Space Mono
- **Estilo**: Papel pinned, alfinetes coloridos, animações suaves

## 🚧 Próximos Passos

- [ ] Upload de imagens/vídeos
- [ ] Sistema de comentários completo
- [ ] Notificações em tempo real
- [ ] Busca avançada
- [ ] Ferramentas de criação (editor, kanban)
- [ ] Export de projetos

## 📄 Licença

MIT

---

Feito com ❤️ para criadores de todo o mundo pendurarem suas ideias no varal!