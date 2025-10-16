-- 修复RLS策略，允许匿名用户插入数据
-- 作者表：允许任何人插入作者数据
CREATE POLICY "任何人都可以插入作者" ON authors FOR INSERT WITH CHECK (true);

-- 诗词表：允许任何人插入诗词数据  
CREATE POLICY "任何人都可以插入诗词" ON poems FOR INSERT WITH CHECK (true);

-- 更新策略：允许任何人更新诗词数据
CREATE POLICY "任何人都可以更新诗词" ON poems FOR UPDATE USING (true);

-- 检查现有策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('authors', 'poems')
ORDER BY tablename, policyname;