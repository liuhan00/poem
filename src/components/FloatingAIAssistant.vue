<template>
  <!-- 悬浮AI助手按钮 -->
  <div class="floating-assistant">
    <!-- 悬浮按钮 -->
    <div 
      class="assistant-button"
      :class="{ 'button-hidden': isOpen }"
      @click="toggleAssistant"
    >
      <el-icon class="assistant-icon">
        <ChatDotRound />
      </el-icon>
      <span class="assistant-text">AI助手</span>
    </div>

    <!-- 聊天窗口 -->
    <transition name="slide-up">
      <div v-if="isOpen" class="chat-window">
        <!-- 聊天窗口头部 -->
        <div class="chat-header">
          <div class="header-info">
            <el-icon class="header-icon"><ChatDotRound /></el-icon>
            <span class="header-title">AI诗词助手</span>
          </div>
          <div class="header-actions">
            <el-button 
              @click="clearChat" 
              type="text" 
              size="small"
              title="清空对话"
            >
              <el-icon><Refresh /></el-icon>
            </el-button>
            <el-button 
              @click="toggleAssistant" 
              type="text" 
              size="small"
              title="最小化"
            >
              <el-icon><Minus /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 聊天消息区域 -->
        <div class="chat-messages" ref="messagesContainer">
          <div 
            v-for="message in chatMessages" 
            :key="message.id"
            :class="['message', message.type]"
          >
            <div class="message-avatar">
              <el-icon v-if="message.type === 'ai'">
                <ChatDotRound />
              </el-icon>
              <el-icon v-else>
                <User />
              </el-icon>
            </div>
            <div class="message-content">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>

        <!-- 聊天输入区域 -->
        <div class="chat-input">
          <el-input
            v-model="userMessage"
            placeholder="问我任何关于诗词的问题..."
            @keyup.enter="sendMessage"
            type="textarea"
            :rows="2"
            resize="none"
            maxlength="500"
            show-word-limit
          />
          <div class="input-actions">
            <el-button 
              @click="suggestQuestion" 
              type="text" 
              size="small"
            >
              问题建议
            </el-button>
            <el-button 
              @click="sendMessage" 
              type="primary" 
              :loading="sending"
              :disabled="!userMessage.trim()"
            >
              {{ sending ? '发送中...' : '发送' }}
            </el-button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatDotRound, User, Minus, Refresh } from '@element-plus/icons-vue'

// 响应式数据
const isOpen = ref(false)
const userMessage = ref('')
const sending = ref(false)
const messagesContainer = ref<HTMLElement>()

// 聊天消息
const chatMessages = ref([
  {
    id: 1,
    type: 'ai',
    content: '您好！我是您的AI诗词助手，可以为您解答关于诗词的各种问题，比如诗词鉴赏、作者介绍、创作背景等。',
    timestamp: new Date()
  }
])

// 方法
const toggleAssistant = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

const sendMessage = async () => {
  if (!userMessage.value.trim()) {
    ElMessage.warning('请输入问题内容')
    return
  }

  const message = userMessage.value
  userMessage.value = ''
  sending.value = true

  // 添加用户消息
  chatMessages.value.push({
    id: Date.now(),
    type: 'user',
    content: message,
    timestamp: new Date()
  })

  scrollToBottom()

  try {
    // 调用n8n AI工作流
    const aiResponse = await callN8NAI(message)
    chatMessages.value.push({
      id: Date.now(),
      type: 'ai',
      content: aiResponse,
      timestamp: new Date()
    })
    sending.value = false
    scrollToBottom()
  } catch (error) {
    console.error('发送消息失败:', error)
    // 如果n8n调用失败，使用本地回复
    const localResponse = generateAIResponse(message)
    chatMessages.value.push({
      id: Date.now(),
      type: 'ai',
      content: localResponse,
      timestamp: new Date()
    })
    sending.value = false
    scrollToBottom()
  }
}

// 调用n8n AI工作流
const callN8NAI = async (question: string): Promise<string> => {
  const n8nWebhookUrl = 'https://n8n-iqksksnv.ap-southeast-1.clawcloudrun.com/webhook-test/58324d15-40b6-4d25-9e45-c38cf92996af'
  
  try {
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: question,
        timestamp: new Date().toISOString(),
        source: 'poem-app'
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.answer || data.response || '抱歉，我暂时无法回答这个问题。'
  } catch (error) {
    console.warn('n8n工作流调用失败，使用本地智能回复:', error)
    throw error // 抛出错误让上层处理
  }
}

const suggestQuestion = () => {
  const questions = [
    '赏析《静夜思》的背景和意境',
    '《春晓》的翻译和赏析',
    '介绍诗人杜甫的生平和诗风',
    '《登高》的艺术特色分析',
    '王维《相思》的创作背景'
  ]

  const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
  userMessage.value = randomQuestion
}

const clearChat = () => {
  chatMessages.value = [{
    id: 1,
    type: 'ai',
    content: '对话已清空，有什么可以帮您的吗？',
    timestamp: new Date()
  }]
  ElMessage.success('对话已清空')
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const generateAIResponse = (question: string): string => {
  // 诗词赏析数据库
  const poemAnalysisDB: Record<string, any> = {
    '静夜思': {
      title: '静夜思',
      author: '李白',
      dynasty: '唐',
      content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
      background: '这首诗创作于唐玄宗开元年间，李白当时客居他乡，在一个寂静的月夜思念故乡而作。',
      translation: '床前洒满了明亮的月光，好像地上铺了一层白霜。抬起头来望着天上的明月，低下头来不禁思念起远方的故乡。',
      appreciation: '这首诗以朴素的语言表达了深沉的思乡之情。前两句写景，后两句抒情，情景交融。诗人通过"明月光"与"地上霜"的比喻，营造出清冷孤寂的意境。"举头"和"低头"的动作描写，生动展现了游子思乡的典型形象。',
      poetInfo: '李白（701-762），字太白，号青莲居士，唐代伟大的浪漫主义诗人，被后人誉为"诗仙"。其诗风豪放飘逸，想象丰富，语言流转自然。',
      relatedPoems: ['《月下独酌》', '《春夜洛城闻笛》', '《关山月》']
    },
    '春晓': {
      title: '春晓',
      author: '孟浩然',
      dynasty: '唐',
      content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
      background: '这首诗描绘了春天早晨的景象，表现了诗人对大自然的热爱和对春光易逝的感慨。',
      translation: '春天的夜晚睡得香甜，不知不觉天就亮了，到处都能听到鸟儿的啼叫声。想起昨夜的风雨声，不知道有多少花儿被风雨打落。',
      appreciation: '这首诗语言清新自然，意境优美。前两句写春晨的生机，后两句转写对春光的珍惜。通过"不觉晓"表现春睡的香甜，"闻啼鸟"展现春晨的活力，"风雨声"和"花落"则暗含对春光易逝的惋惜。',
      poetInfo: '孟浩然（689-740），唐代著名的山水田园诗人，与王维并称"王孟"。其诗风清新自然，擅长描绘山水田园风光。',
      relatedPoems: ['《过故人庄》', '《宿建德江》', '《夜归鹿门歌》']
    },
    '登高': {
      title: '登高',
      author: '杜甫',
      dynasty: '唐',
      content: '风急天高猿啸哀，渚清沙白鸟飞回。无边落木萧萧下，不尽长江滚滚来。万里悲秋常作客，百年多病独登台。艰难苦恨繁霜鬓，潦倒新停浊酒杯。',
      background: '这首诗是杜甫晚年流寓夔州时所作，当时诗人年老多病，生活困顿，登高望远时感慨万千。',
      translation: '秋风急促，天空高远，猿猴的啼叫声显得悲哀。水清沙白的小洲上，鸟儿在盘旋飞翔。无边无际的树木，落叶萧萧飘下，望不到头的长江水滚滚而来。悲对秋景感慨万里漂泊常年为客，一生当中疾病缠身今日独上高台。历尽了艰难苦恨白发长满了双鬓，衰颓满心偏又暂停了浇愁的酒杯。',
      appreciation: '这首诗被誉为"古今七律第一"，全诗对仗工整，意境雄浑。前四句写景，后四句抒情，情景交融。诗人将个人的身世之悲与国家的命运之忧融为一体，展现了深沉的忧国忧民情怀。',
      poetInfo: '杜甫（712-770），字子美，自号少陵野老，唐代伟大的现实主义诗人，被后人尊为"诗圣"。其诗风沉郁顿挫，深刻反映了社会现实。',
      relatedPoems: ['《春望》', '《茅屋为秋风所破歌》', '《兵车行》']
    },
    '望岳': {
      title: '望岳',
      author: '杜甫',
      dynasty: '唐',
      content: '岱宗夫如何？齐鲁青未了。造化钟神秀，阴阳割昏晓。荡胸生曾云，决眦入归鸟。会当凌绝顶，一览众山小。',
      background: '这是杜甫青年时期游历泰山时所作，表现了诗人豪迈的胸怀和远大的志向。',
      translation: '泰山到底怎么样？在齐鲁大地上，那青翠的山色没有尽头。大自然把神奇秀丽的景色都汇聚于此，山南山北分隔出清晨和黄昏。层层白云，荡涤胸中沟壑；翩翩归鸟，飞入赏景眼圈。定要登上泰山顶峰，俯瞰群山，豪情满怀。',
      appreciation: '这首诗气势磅礴，格调高昂。诗人通过设问开篇，层层递进地描绘泰山的雄伟壮观。最后两句"会当凌绝顶，一览众山小"更是千古名句，表现了诗人勇攀高峰的豪情壮志。',
      poetInfo: '杜甫（712-770），字子美，唐代伟大的现实主义诗人。这首诗展现了他青年时期的豪迈气概。',
      relatedPoems: ['《春望》', '《登高》', '《兵车行》']
    },
    '相思': {
      title: '相思',
      author: '王维',
      dynasty: '唐',
      content: '红豆生南国，春来发几枝。愿君多采撷，此物最相思。',
      background: '这首诗是王维写给友人的，借红豆表达思念之情，后来成为表达爱情的经典诗篇。',
      translation: '红豆生长在南方，春天来了又生出了多少新枝？希望你多多采摘它，因为这东西最能寄托相思之情。',
      appreciation: '这首诗语言朴素，情感真挚。诗人借红豆这一意象，含蓄地表达了深沉的思念之情。全诗看似平淡，实则情深意长，体现了王维诗歌"诗中有画"的特点。',
      poetInfo: '王维（701-761），字摩诘，号摩诘居士，唐代著名诗人、画家，被誉为"诗佛"。其诗风清新淡远，自然脱俗。',
      relatedPoems: ['《山居秋暝》', '《使至塞上》', '《鹿柴》']
    }
  }

  // 检测诗词赏析请求
  const poemMatch = question.match(/《(.+?)》|(.+?)（诗词）|赏析(.+?)(?:诗|词)|(.+?)的(?:赏析|分析|背景|翻译)/)
  let poemTitle = ''
  
  if (poemMatch) {
    poemTitle = poemMatch[1] || poemMatch[2] || poemMatch[3] || poemMatch[4] || ''
  }

  // 如果检测到具体的诗词赏析请求
  if (poemTitle && poemAnalysisDB[poemTitle]) {
    const poem = poemAnalysisDB[poemTitle]
    return generateDetailedAnalysis(poem, question)
  }

  // 诗人信息查询
  const poetMatch = question.match(/(.+?)的(?:介绍|生平|诗风|作品)|诗人(.+?)/)
  if (poetMatch) {
    const poetName = poetMatch[1] || poetMatch[2]
    return generatePoetInfo(poetName, poemAnalysisDB)
  }

  // 简单的规则匹配生成回复
  const responses: Record<string, string> = {
    '春天': '描写春天的经典诗词有很多，比如杜甫的《春望》、孟浩然的《春晓》、白居易的《钱塘湖春行》等。这些诗词通过细腻的笔触描绘了春天的生机与美好。',
    '李白': '李白是唐代伟大的浪漫主义诗人，代表作有《静夜思》、《望庐山瀑布》、《将进酒》、《蜀道难》等。他的诗风豪放飘逸，想象丰富，语言流转自然。',
    '意境': '欣赏古诗意境可以从以下几个方面入手：1) 感受诗歌的整体氛围；2) 品味意象的组合与象征；3) 体会诗人的情感表达；4) 结合创作背景理解深层含义。',
    '唐诗宋词': '唐诗和宋词的主要区别：唐诗以五言、七言为主，格律严谨；宋词则有固定的词牌，句式灵活。唐诗重意境，宋词重抒情。唐诗多写景抒情，宋词多写情抒怀。',
    '背景': '要了解诗词背景，可以从以下几个方面入手：1) 诗人的生平经历；2) 创作时的社会环境；3) 诗词的创作年代；4) 相关的历史事件。'
  }

  // 关键词匹配
  for (const [keyword, response] of Object.entries(responses)) {
    if (question.includes(keyword)) {
      return response
    }
  }

  // 默认回复
  return `关于"${question}"，我可以为您提供专业的诗词赏析。如果您想了解具体的诗词作品（如《静夜思》、《春晓》等），请告诉我诗词名称，我会为您提供详细的背景、翻译、赏析和诗人介绍。`
}

// 生成详细的诗词分析
const generateDetailedAnalysis = (poem: any, question: string): string => {
  let analysis = `《${poem.title}》 - ${poem.dynasty}·${poem.author}

`
  analysis += `📖 诗词原文：
${poem.content}

`

  if (question.includes('背景') || !question.includes('翻译') && !question.includes('赏析')) {
    analysis += `🏛️ 创作背景：
${poem.background}

`
  }

  if (question.includes('翻译') || !question.includes('背景') && !question.includes('赏析')) {
    analysis += `🔤 现代翻译：
${poem.translation}

`
  }

  if (question.includes('赏析') || !question.includes('背景') && !question.includes('翻译')) {
    analysis += `🎨 艺术赏析：
${poem.appreciation}

`
  }

  if (question.includes('诗人') || question.includes('作者')) {
    analysis += `👤 诗人介绍：
${poem.poetInfo}

`
  }

  if (question.includes('相关') || question.includes('类似')) {
    analysis += `📚 相关作品：
${poem.relatedPoems.join('、')}

`
  }

  // 如果没有特定要求，提供完整分析
  if (!question.includes('背景') && !question.includes('翻译') && !question.includes('赏析') && 
      !question.includes('诗人') && !question.includes('相关')) {
    analysis = `《${poem.title}》 - ${poem.dynasty}·${poem.author}

`
    analysis += `📖 诗词原文：
${poem.content}

`
    analysis += `🏛️ 创作背景：
${poem.background}

`
    analysis += `🔤 现代翻译：
${poem.translation}

`
    analysis += `🎨 艺术赏析：
${poem.appreciation}

`
    analysis += `👤 诗人介绍：
${poem.poetInfo}

`
    analysis += `📚 相关作品：
${poem.relatedPoems.join('、')}`
  }

  return analysis
}

// 生成诗人信息
const generatePoetInfo = (poetName: string, db: Record<string, any>): string => {
  const poets: Record<string, any> = {
    '李白': {
      name: '李白',
      info: '李白（701-762），字太白，号青莲居士，唐代伟大的浪漫主义诗人，被后人誉为"诗仙"。其诗风豪放飘逸，想象丰富，语言流转自然，善于运用夸张的手法、生动的比喻来表现炽热的情感。',
      style: '浪漫主义，豪放飘逸，想象奇特',
     代表作: ['《静夜思》', '《望庐山瀑布》', '《将进酒》', '《蜀道难》'],
     成就: '开创了唐代诗歌的浪漫主义风格，对后世影响深远'
    },
    '杜甫': {
      name: '杜甫',
      info: '杜甫（712-770），字子美，自号少陵野老，唐代伟大的现实主义诗人，被后人尊为"诗圣"。其诗风沉郁顿挫，深刻反映了社会现实和人民疾苦。',
      style: '现实主义，沉郁顿挫，忧国忧民',
     代表作: ['《春望》', '《登高》', '《茅屋为秋风所破歌》', '《兵车行》'],
     成就: '唐代现实主义诗歌的代表人物，诗史留名'
    },
    '王维': {
      name: '王维',
      info: '王维（701-761），字摩诘，号摩诘居士，唐代著名诗人、画家，被誉为"诗佛"。其诗风清新淡远，自然脱俗，擅长描绘山水田园风光。',
      style: '山水田园，清新淡远，诗中有画',
     代表作: ['《相思》', '《山居秋暝》', '《使至塞上》', '《鹿柴》'],
     成就: '开创了山水田园诗派，诗画双绝'
    },
    '孟浩然': {
      name: '孟浩然',
      info: '孟浩然（689-740），唐代著名的山水田园诗人，与王维并称"王孟"。其诗风清新自然，擅长描绘山水田园风光。',
      style: '山水田园，清新自然，意境优美',
     代表作: ['《春晓》', '《过故人庄》', '《宿建德江》'],
     成就: '唐代山水田园诗派的代表人物'
    }
  }

  const poet = poets[poetName]
  if (poet) {
    return `👤 ${poet.name}

📝 诗人介绍：
${poet.info}

🎨 诗风特点：
${poet.style}

📚 代表作品：
${poet.代表作.join('、')}

🏆 主要成就：
${poet.成就}`
  }

  return `关于诗人"${poetName}"，我目前的信息库中相关资料有限。您可以询问李白、杜甫、王维、孟浩然等著名诗人的信息。`
}

onMounted(() => {
  // 组件挂载后的一些初始化操作
})
</script>

<style scoped>
.floating-assistant {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.assistant-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  user-select: none;
}

.assistant-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
}

.assistant-button.button-hidden {
  opacity: 0;
  pointer-events: none;
}

.assistant-icon {
  font-size: 18px;
}

.assistant-text {
  font-size: 14px;
  font-weight: 500;
}

.chat-window {
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 16px;
}

.header-title {
  font-size: 14px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f8f9fa;
}

.message {
  display: flex;
  margin-bottom: 16px;
  gap: 8px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #e74c3c;
}

.message-content {
  max-width: 70%;
  background: white;
  border-radius: 12px;
  padding: 8px 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message.user .message-content {
  background: #667eea;
  color: white;
}

.message-text {
  line-height: 1.4;
  font-size: 13px;
  margin-bottom: 4px;
}

.message-time {
  font-size: 11px;
  color: #95a5a6;
  text-align: right;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.chat-input {
  padding: 12px;
  border-top: 1px solid #e8e8e8;
  background: white;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

/* 动画效果 */
.slide-up-enter-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .floating-assistant {
    bottom: 10px;
    right: 10px;
  }
  
  .chat-window {
    width: calc(100vw - 20px);
    height: 60vh;
  }
}
</style>