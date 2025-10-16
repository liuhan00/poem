// 简单测试随机诗词功能
console.log('测试随机诗词功能...')

// 模拟前端随机诗词逻辑
function simulateRandomPoem() {
  console.log('1. 检查是否有诗词数据...')
  
  // 模拟热门诗词数据
  const popularPoems = [
    { id: '1', title: '如梦令·常记溪亭日暮', author: '李清照' },
    { id: '2', title: '赋得古原草送别', author: '白居易' }
  ]
  
  console.log(`当前有 ${popularPoems.length} 首诗词`)
  
  if (popularPoems.length === 0) {
    console.log('没有诗词数据，无法跳转')
    return
  }
  
  // 随机选择
  const randomIndex = Math.floor(Math.random() * popularPoems.length)
  const randomPoem = popularPoems[randomIndex]
  
  console.log(`随机选择诗词: ${randomPoem.title} (ID: ${randomPoem.id})`)
  console.log(`应该跳转到: /poem/${randomPoem.id}`)
  
  // 模拟跳转
  console.log('跳转逻辑执行成功！')
}

simulateRandomPoem()