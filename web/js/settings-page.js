/**
 * 设置页面模块（嵌入在主页中）
 */

const Settings = {
  selectedLevel1: null,
  selectedLevel2: null,

  /**
   * 初始化
   */
  init() {
    // 不再需要初始化，因为Settings作为模块直接使用
  },

  /**
   * 渲染页面
   */
  render() {
    this.renderLevel1();
    this.renderLevel2();
    this.renderApiList();
    this.bindSettingsEvents();
  },

  /**
   * 渲染一级标题列表
   */
  renderLevel1() {
    const container = document.getElementById('level1List');
    const navData = Storage.getNavigation();

    if (!navData.groups || navData.groups.length === 0) {
      container.innerHTML = `
        <div class="column-empty">
          <p>暂无一级导航</p>
        </div>
      `;
      return;
    }

    container.innerHTML = navData.groups.map((item, index) => `
      <div class="column-item ${this.selectedLevel1 === index ? 'active' : ''}" data-index="${index}">
        <div class="column-item-name">${item.name}</div>
        <div class="column-item-meta">${item.children?.length || 0} 个子项</div>
        <div class="column-actions">
          <button class="edit" data-index="${index}">编辑</button>
          <button class="delete" data-index="${index}">删除</button>
        </div>
      </div>
    `).join('');
  },

  /**
   * 渲染二级标题列表
   */
  renderLevel2() {
    const container = document.getElementById('level2List');
    const titleEl = document.getElementById('level2Title');
    const addBtn = document.getElementById('addLevel2Btn');
    const navData = Storage.getNavigation();

    if (this.selectedLevel1 === null) {
      titleEl.textContent = '二级导航';
      addBtn.style.display = 'none';
      container.innerHTML = `
        <div class="column-empty">
          <p>请先选择一个一级导航</p>
        </div>
      `;
      return;
    }

    const currentNav = navData.groups[this.selectedLevel1];
    titleEl.textContent = currentNav.name;
    addBtn.style.display = 'flex';

    const children = currentNav.children || [];

    if (children.length === 0) {
      container.innerHTML = `
        <div class="column-empty">
          <p>暂无二级导航</p>
        </div>
      `;
      return;
    }

    container.innerHTML = children.map((child, index) => `
      <div class="column-item ${this.selectedLevel2 === index ? 'active' : ''}" data-index="${index}">
        <div class="column-item-name">${child.name}</div>
        <div class="column-actions">
          <button class="edit" data-index="${index}">编辑</button>
          <button class="delete" data-index="${index}">删除</button>
        </div>
      </div>
    `).join('');
  },

  /**
   * 渲染 API 列表
   */
  renderApiList() {
    const container = document.getElementById('apiList');
    const apis = Storage.getAgents();

    if (apis.length === 0) {
      container.innerHTML = `
        <div class="api-empty">
          <p>暂无 API 配置</p>
          <button class="btn btn-primary" id="addApiEmptyBtn">+ 添加配置</button>
        </div>
      `;
      document.getElementById('addApiEmptyBtn')?.addEventListener('click', () => this.addApi());
      return;
    }

    container.innerHTML = apis.map((api, index) => `
      <div class="api-card ${api.expanded ? 'expanded' : ''}" data-index="${index}">
        <div class="api-card-header" data-index="${index}">
          <div class="api-card-title">
            <input type="text" value="${api.name}" data-field="name" placeholder="配置名称" class="api-name-input">
            <div class="api-status">
              <span class="api-status-dot ${api.active ? 'connected' : ''}"></span>
              <span>${api.active ? '已连接' : '未连接'}</span>
            </div>
          </div>
          <div class="api-card-actions">
            <button class="expand" data-index="${index}" title="${api.expanded ? '收起' : '展开'}">
              ${api.expanded ? '▲' : '▼'}
            </button>
            <button class="test" data-index="${index}">测试</button>
            <button class="delete" data-index="${index}">删除</button>
          </div>
        </div>
        <div class="api-card-body">
          <div class="api-field full">
            <label>API Key</label>
            <input type="password" value="${api.apiKey}" data-field="apiKey" placeholder="输入 API Key">
          </div>
          <div class="api-field full">
            <label>Base URL</label>
            <input type="text" value="${api.baseUrl}" data-field="baseUrl" placeholder="https://api.example.com/v1">
          </div>
        </div>
      </div>
    `).join('');
  },

  /**
   * 绑定设置页面事件
   */
  bindSettingsEvents() {
    // 添加一级导航
    document.getElementById('addLevel1Btn')?.addEventListener('click', () => {
      this.showAddModal('一级导航', (name) => this.addLevel1(name));
    });

    // 添加二级导航
    document.getElementById('addLevel2Btn')?.addEventListener('click', () => {
      this.showAddModal('二级导航', (name) => this.addLevel2(name));
    });

    // 一级导航列表点击
    document.getElementById('level1List')?.addEventListener('click', (e) => {
      this.handleLevelClick(e, 1);
    });

    // 二级导航列表点击
    document.getElementById('level2List')?.addEventListener('click', (e) => {
      this.handleLevelClick(e, 2);
    });

    // 添加 API
    document.getElementById('addApiBtn')?.addEventListener('click', () => {
      this.addApi();
    });

    // API 列表点击
    document.getElementById('apiList')?.addEventListener('click', (e) => {
      const action = e.target.closest('button');

      if (action?.classList.contains('expand')) {
        const index = parseInt(action.dataset.index);
        this.toggleApiExpand(index);
      } else if (action?.classList.contains('delete')) {
        const index = parseInt(action.dataset.index);
        this.deleteApi(index);
      } else if (action?.classList.contains('test')) {
        const index = parseInt(action.dataset.index);
        this.testApi(index);
      }
    });

    // API 字段变化
    document.getElementById('apiList')?.addEventListener('input', (e) => {
      const card = e.target.closest('.api-card');
      if (!card) return;

      const index = parseInt(card.dataset.index);
      const field = e.target.dataset.field;

      if (field) {
        const apis = Storage.getAgents();
        apis[index][field] = e.target.value;
        Storage.setAgents(apis);
      }
    });
  },

  /**
   * 处理列点击
   */
  handleLevelClick(e, level) {
    const item = e.target.closest('.column-item');
    if (!item) return;

    const index = parseInt(item.dataset.index);
    const action = e.target.closest('button');

    if (action?.classList.contains('edit')) {
      if (level === 1) {
        this.showEditModal('一级导航', this.getLevel1Name(index), (name) => this.editLevel1(index, name));
      } else {
        this.showEditModal('二级导航', this.getLevel2Name(index), (name) => this.editLevel2(index, name));
      }
    } else if (action?.classList.contains('delete')) {
      if (level === 1) {
        this.deleteLevel1(index);
      } else {
        this.deleteLevel2(index);
      }
    } else {
      if (level === 1) {
        this.selectLevel1(index);
      } else {
        this.selectLevel2(index);
      }
    }
  },

  /**
   * 选择一级标题
   */
  selectLevel1(index) {
    this.selectedLevel1 = index;
    this.selectedLevel2 = null;
    this.renderLevel2();
    this.renderLevel1();
  },

  /**
   * 选择二级标题
   */
  selectLevel2(index) {
    this.selectedLevel2 = index;
    this.renderLevel2();
  },

  /**
   * 获取一级标题名称
   */
  getLevel1Name(index) {
    return Storage.getNavigation().groups[index]?.name || '';
  },

  /**
   * 获取二级标题名称
   */
  getLevel2Name(index) {
    const navData = Storage.getNavigation();
    return navData.groups[this.selectedLevel1]?.children?.[index]?.name || '';
  },

  /**
   * 添加一级标题
   */
  addLevel1(name) {
    const navData = Storage.getNavigation();
    navData.groups.push({
      id: Storage.generateId(),
      name,
      children: []
    });
    Storage.setNavigation(navData);
    this.render();
  },

  /**
   * 添加二级标题
   */
  addLevel2(name) {
    if (this.selectedLevel1 === null) return;
    const navData = Storage.getNavigation();
    navData.groups[this.selectedLevel1].children.push({
      id: Storage.generateId(),
      name,
      content: ''
    });
    Storage.setNavigation(navData);
    this.render();
  },

  /**
   * 编辑一级标题
   */
  editLevel1(index, name) {
    const navData = Storage.getNavigation();
    navData.groups[index].name = name;
    Storage.setNavigation(navData);
    this.render();
  },

  /**
   * 编辑二级标题
   */
  editLevel2(index, name) {
    const navData = Storage.getNavigation();
    navData.groups[this.selectedLevel1].children[index].name = name;
    Storage.setNavigation(navData);
    this.render();
  },

  /**
   * 删除一级标题
   */
  deleteLevel1(index) {
    if (!confirm('确定要删除这个一级导航及其所有子项吗？')) return;
    const navData = Storage.getNavigation();
    navData.groups.splice(index, 1);
    Storage.setNavigation(navData);
    this.selectedLevel1 = navData.groups.length > 0 ? 0 : null;
    this.selectedLevel2 = null;
    this.render();
  },

  /**
   * 删除二级标题
   */
  deleteLevel2(index) {
    if (!confirm('确定要删除吗？')) return;
    const navData = Storage.getNavigation();
    navData.groups[this.selectedLevel1].children.splice(index, 1);
    Storage.setNavigation(navData);
    this.selectedLevel2 = null;
    this.render();
  },

  /**
   * 展开/收起 API 配置
   */
  toggleApiExpand(index) {
    const apis = Storage.getAgents();
    apis[index].expanded = !apis[index].expanded;
    Storage.setAgents(apis);
    this.renderApiList();
  },

  /**
   * 添加 API
   */
  addApi() {
    const apis = Storage.getAgents();
    apis.push({
      id: Storage.generateId(),
      name: '新配置',
      apiKey: '',
      baseUrl: 'https://claude.api.ceo-tech.cn/v1/messages',
      active: false,
      expanded: true
    });
    Storage.setAgents(apis);
    this.renderApiList();
  },

  /**
   * 删除 API
   */
  deleteApi(index) {
    if (!confirm('确定要删除这个配置吗？')) return;
    const apis = Storage.getAgents();
    apis.splice(index, 1);
    Storage.setAgents(apis);
    this.renderApiList();
  },

  /**
   * 测试 API 连接
   */
  async testApi(index) {
    const apis = Storage.getAgents();
    const api = apis[index];

    if (!api.apiKey) {
      Toast.error('请先输入 API Key');
      return;
    }

    Toast.info('正在测试连接...');

    try {
      const response = await fetch(api.baseUrl.replace('/messages', '/keys-usage'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${api.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        api.active = true;
        Toast.success('连接成功！');
      } else {
        api.active = false;
        Toast.error(`连接失败: ${response.status}`);
      }
    } catch (error) {
      api.active = false;
      Toast.error(`连接失败: ${error.message}`);
    }

    Storage.setAgents(apis);
    this.renderApiList();
  },

  /**
   * 显示添加模态框
   */
  showAddModal(title, onConfirm) {
    Modal.show({
      title: `添加${title}`,
      body: `
        <div class="form-group">
          <label>名称</label>
          <input type="text" id="modalInput" placeholder="输入名称">
        </div>
      `,
      onConfirm: () => {
        const name = document.getElementById('modalInput')?.value.trim();
        if (name) {
          onConfirm(name);
        }
      }
    });
  },

  /**
   * 显示编辑模态框
   */
  showEditModal(title, currentName, onConfirm) {
    Modal.show({
      title: `编辑${title}`,
      body: `
        <div class="form-group">
          <label>名称</label>
          <input type="text" id="modalInput" value="${currentName}">
        </div>
      `,
      onConfirm: () => {
        const name = document.getElementById('modalInput')?.value.trim();
        if (name) {
          onConfirm(name);
        }
      }
    });
  }
};

// 导出给全局使用
if (typeof window !== 'undefined') {
  window.Settings = Settings;
}