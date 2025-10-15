-- 诗词鉴赏平台 - 初始数据库架构
-- 创建时间: 2025-10-15
-- 作者: AI开发助手

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 创建作者表
CREATE TABLE authors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dynasty VARCHAR(50) NOT NULL,
    biography TEXT,
    literary_style TEXT,
    achievements TEXT,
    life_period VARCHAR(100),
    portrait_url TEXT,
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建诗词表
CREATE TABLE poems (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    author_id UUID REFERENCES authors(id) ON DELETE CASCADE,
    dynasty VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    rhythmic_pattern VARCHAR(200),
    annotation TEXT,
    translation TEXT,
    appreciation TEXT,
    background TEXT,
    tags TEXT[] DEFAULT '{}',
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    popularity INTEGER DEFAULT 0,
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建用户资料表
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    learning_level INTEGER DEFAULT 1 CHECK (learning_level >= 1 AND learning_level <= 10),
    preferred_dynasties TEXT[] DEFAULT '{}',
    preferred_themes TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建知识图谱表
CREATE TABLE knowledge_graph (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('poem', 'author', 'allusion')),
    source_id UUID NOT NULL,
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('poem', 'author', 'allusion')),
    target_id UUID NOT NULL,
    relationship_type VARCHAR(100) NOT NULL,
    weight DECIMAL(3,2) DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建用户行为表
CREATE TABLE user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('read', 'search', 'share', 'collect', 'create')),
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('poem', 'author')),
    target_id UUID NOT NULL,
    duration INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建收藏表
CREATE TABLE favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    poem_id UUID REFERENCES poems(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, poem_id)
);

-- 创建搜索历史表
CREATE TABLE search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    result_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建AI对话记录表
CREATE TABLE ai_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'ai')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引优化查询性能

-- 诗词表索引
CREATE INDEX idx_poems_title ON poems(title);
CREATE INDEX idx_poems_dynasty ON poems(dynasty);
CREATE INDEX idx_poems_author_id ON poems(author_id);
CREATE INDEX idx_poems_tags ON poems USING GIN(tags);
CREATE INDEX idx_poems_difficulty ON poems(difficulty_level);
CREATE INDEX idx_poems_popularity ON poems(popularity);
CREATE INDEX idx_poems_embedding ON poems USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 作者表索引
CREATE INDEX idx_authors_name ON authors(name);
CREATE INDEX idx_authors_dynasty ON authors(dynasty);
CREATE INDEX idx_authors_embedding ON authors USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 用户行为表索引
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_activity_type ON user_activities(activity_type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);

-- 收藏表索引
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_poem_id ON favorites(poem_id);

-- 知识图谱表索引
CREATE INDEX idx_knowledge_graph_source ON knowledge_graph(source_type, source_id);
CREATE INDEX idx_knowledge_graph_target ON knowledge_graph(target_type, target_id);
CREATE INDEX idx_knowledge_graph_relationship ON knowledge_graph(relationship_type);

-- 搜索历史表索引
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_created_at ON search_history(created_at);

-- 启用行级安全(RLS)
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_graph ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略

-- 作者表策略：所有人都可以读取
CREATE POLICY "任何人都可以查看作者" ON authors FOR SELECT USING (true);

-- 诗词表策略：所有人都可以读取
CREATE POLICY "任何人都可以查看诗词" ON poems FOR SELECT USING (true);

-- 知识图谱策略：所有人都可以读取
CREATE POLICY "任何人都可以查看知识图谱" ON knowledge_graph FOR SELECT USING (true);

-- 用户资料表策略：用户只能查看自己的资料
CREATE POLICY "用户只能查看自己的资料" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "用户可以更新自己的资料" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 用户行为表策略：用户只能查看和操作自己的行为记录
CREATE POLICY "用户只能查看自己的行为记录" ON user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户只能插入自己的行为记录" ON user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 收藏表策略：用户只能查看和操作自己的收藏
CREATE POLICY "用户只能查看自己的收藏" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户只能插入自己的收藏" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户只能删除自己的收藏" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- 搜索历史表策略：用户只能查看和操作自己的搜索历史
CREATE POLICY "用户只能查看自己的搜索历史" ON search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户只能插入自己的搜索历史" ON search_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI对话记录表策略：用户只能查看和操作自己的对话记录
CREATE POLICY "用户只能查看自己的对话记录" ON ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户只能插入自己的对话记录" ON ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建自动更新updated_at的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要updated_at的表创建触发器
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON authors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_poems_updated_at BEFORE UPDATE ON poems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_graph_updated_at BEFORE UPDATE ON knowledge_graph FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建用户注册后自动创建profile的触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email)
    VALUES (new.id, new.raw_user_meta_data->>'username', new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 创建示例数据

-- 插入示例作者数据
INSERT INTO authors (name, dynasty, biography, literary_style, achievements, life_period) VALUES
('李白', '唐', '唐代伟大的浪漫主义诗人，被后人誉为"诗仙"。', '浪漫主义、豪放飘逸', '创作了大量优秀的诗歌作品，对后世影响深远。', '701年-762年'),
('杜甫', '唐', '唐代伟大的现实主义诗人，被后人称为"诗圣"。', '现实主义、沉郁顿挫', '其诗具有丰富的社会内容、强烈的时代色彩和鲜明的政治倾向。', '712年-770年'),
('王维', '唐', '唐代著名诗人、画家，被誉为"诗佛"。', '山水田园、禅意深远', '诗画双绝，开创了文人画的新境界。', '701年-761年'),
('苏轼', '宋', '北宋文学家、书画家，唐宋八大家之一。', '豪放洒脱、意境开阔', '诗词、散文、书法、绘画均有极高成就。', '1037年-1101年'),
('李清照', '宋', '宋代著名女词人，婉约派代表。', '婉约细腻、情感真挚', '其词作语言清丽，富于音乐美感。', '1084年-1155年');

-- 插入示例诗词数据
INSERT INTO poems (title, author_id, dynasty, content, rhythmic_pattern, annotation, translation, tags) VALUES
(
    '静夜思',
    (SELECT id FROM authors WHERE name = '李白'),
    '唐',
    '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
    '五言绝句',
    '此诗写的是在寂静的月夜思念家乡的感受。',
    '明亮的月光洒在床前的窗户纸上，好像地上泛起了一层霜。我禁不住抬起头来，看那天窗外空中的一轮明月，不由得低头沉思，想起远方的家乡。',
    '{"思乡", "月夜", "经典"}'
),
(
    '春晓',
    (SELECT id FROM authors WHERE name = '孟浩然'),
    '唐',
    '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
    '五言绝句',
    '诗人抓住春天的早晨刚刚醒来时的一瞬间展开描写和联想，生动地表达了诗人对春天的热爱和怜惜之情。',
    '春夜酣睡天亮了也不知道，醒来只听到处处有鸟儿啼叫。想起昨夜里风声紧雨声潇潇，花儿不知道被打落了多少？',
    '{"春天", "田园", "自然"}'
),
(
    '登鹳雀楼',
    (SELECT id FROM authors WHERE name = '王之涣'),
    '唐',
    '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。',
    '五言绝句',
    '此诗虽然只有二十字，却描绘出北国河山的磅礴气势和壮丽景象。',
    '夕阳依傍着西山慢慢地沉没，滔滔黄河朝着东海汹涌奔流。若想把千里的风光景物看够，那就要登上更高的一层城楼。',
    '{"登高", "哲理", "壮阔"}'
),
(
    '水调歌头',
    (SELECT id FROM authors WHERE name = '苏轼'),
    '宋',
    '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。我欲乘风归去，又恐琼楼玉宇，高处不胜寒。起舞弄清影，何似在人间。',
    '词牌',
    '此词是中秋望月怀人之作，表达了对胞弟苏辙的无限怀念。',
    '明月从什么时候才开始出现的？我端起酒杯遥问苍天。不知道在天上的宫殿，何年何月。我想要乘御清风回到天上，又恐怕在美玉砌成的楼宇，受不住高耸九天的寒冷。翩翩起舞玩赏着月下清影，哪像是在人间。',
    '{"中秋", "怀人", "哲理"}'
);

-- 插入示例知识图谱关系
INSERT INTO knowledge_graph (source_type, source_id, target_type, target_id, relationship_type, description) VALUES
(
    'poem',
    (SELECT id FROM poems WHERE title = '静夜思'),
    'author',
    (SELECT id FROM authors WHERE name = '李白'),
    '创作关系',
    '李白创作的著名思乡诗'
),
(
    'author',
    (SELECT id FROM authors WHERE name = '李白'),
    'author',
    (SELECT id FROM authors WHERE name = '杜甫'),
    '同时代关系',
    '唐代同时期的伟大诗人'
);

-- 创建用于向量搜索的函数
CREATE OR REPLACE FUNCTION search_poems_by_semantic(query_embedding VECTOR(1536), match_threshold FLOAT DEFAULT 0.7, match_count INT DEFAULT 10)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    author_name VARCHAR,
    dynasty VARCHAR,
    content TEXT,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        a.name as author_name,
        p.dynasty,
        p.content,
        1 - (p.embedding <=> query_embedding) as similarity
    FROM poems p
    JOIN authors a ON p.author_id = a.id
    WHERE p.embedding IS NOT NULL
        AND (1 - (p.embedding <=> query_embedding)) > match_threshold
    ORDER BY p.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- 创建用于推荐相似诗词的函数
CREATE OR REPLACE FUNCTION recommend_similar_poems(poem_id UUID, limit_count INT DEFAULT 5)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    author_name VARCHAR,
    dynasty VARCHAR,
    similarity FLOAT
) AS $$
DECLARE
    target_embedding VECTOR(1536);
BEGIN
    SELECT embedding INTO target_embedding FROM poems WHERE id = poem_id;
    
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        a.name as author_name,
        p.dynasty,
        1 - (p.embedding <=> target_embedding) as similarity
    FROM poems p
    JOIN authors a ON p.author_id = a.id
    WHERE p.id != poem_id 
        AND p.embedding IS NOT NULL
        AND target_embedding IS NOT NULL
    ORDER BY p.embedding <=> target_embedding
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;