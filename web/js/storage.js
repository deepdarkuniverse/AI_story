/**
 * 存储管理模块
 * 使用 localStorage 保存数据
 */

const Storage = {
  /**
   * 保存数据到 localStorage
   * @param {string} key - 存储键名
   * @param {any} data - 要存储的数据
   */
  set(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },

  /**
   * 从 localStorage 获取数据
   * @param {string} key - 存储键名
   * @param {any} defaultValue - 默认值
   * @returns {any}
   */
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error('Storage get error:', e);
      return defaultValue;
    }
  },

  /**
   * 删除指定键名的数据
   * @param {string} key - 存储键名
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Storage remove error:', e);
      return false;
    }
  },

  /**
   * 获取导航配置
   * @returns {Object}
   */
  getNavigation() {
    return this.get(Config.storageKeys.navigation, Config.defaultNavigation);
  },

  /**
   * 保存导航配置
   * @param {Object} navigation
   */
  setNavigation(navigation) {
    return this.set(Config.storageKeys.navigation, navigation);
  },

  /**
   * 获取 Agent 列表
   * @returns {Array}
   */
  getAgents() {
    return this.get(Config.storageKeys.agents, []);
  },

  /**
   * 保存 Agent 列表
   * @param {Array} agents
   */
  setAgents(agents) {
    return this.set(Config.storageKeys.agents, agents);
  },

  /**
   * 生成唯一 ID
   * @returns {string}
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

// 导出给全局使用
if (typeof window !== 'undefined') {
  window.Storage = Storage;
}