/**
 * 配置管理模块
 * 管理默认配置和常量
 */

const Config = {
  // 默认导航配置
  defaultNavigation: {
    groups: []
  },

  // 默认 Agent 配置
  defaultAgent: {
    name: '新 Agent',
    apiKey: '',
    baseUrl: 'https://claude.api.ceo-tech.cn/v1/messages'
  },

  // 存储键名
  storageKeys: {
    navigation: 'ai_story_navigation',
    agents: 'ai_story_agents'
  },

  // API 端点
  apiEndpoints: {
    checkUsage: '/keys-usage'
  }
};

// 导出给全局使用
if (typeof window !== 'undefined') {
  window.Config = Config;
}