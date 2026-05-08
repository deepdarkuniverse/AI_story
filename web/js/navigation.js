/**
 * 导航管理模块
 * 管理左侧的一级导航（分类）和二级导航（章节）
 */

const Navigation = {
  data: null,
  activeGroup: null,
  activeItem: null,
  inSettingsMode: false,

  /**
   * 初始化导航系统
   */
  init() {
    this.data = Storage.getNavigation();
    // 如果没有数据，初始化默认数据
    if (!this.data || !this.data.groups || this.data.groups.length === 0) {
      this.data = {
        groups: [
          {
            id: Storage.generateId(),
            name: '小说创作',
            children: [
              { id: Storage.generateId(), name: '第一章：开端', content: '' },
              { id: Storage.generateId(), name: '第二章：发展', content: '' }
            ]
          },
          {
            id: Storage.generateId(),
            name: '世界观设定',
            children: [
              { id: Storage.generateId(), name: '地理环境', content: '' },
              { id: Storage.generateId(), name: '人物设定', content: '' }
            ]
          }
        ]
      };
      Storage.setNavigation(this.data);
    }
    this.render();
    this.bindEvents();

    // 默认展开第一个一级导航
    if (this.data.groups.length > 0) {
      this.toggleGroup(0, true);
    }
  },

  /**
   * 渲染导航
   */
  render() {
    this.renderNav();
  },

  /**
   * 渲染左侧导航
   */
  renderNav() {
    const container = document.getElementById('navContent');
    if (!container) return;

    container.innerHTML = this.data.groups.map((group, groupIndex) => `
      <div class="nav-group ${this.activeGroup === groupIndex ? 'expanded' : ''}" data-group-index="${groupIndex}">
        <div class="nav-group-header" data-group-index="${groupIndex}">
          <span class="nav-arrow">▼</span>
          <span class="nav-group-name">${group.name}</span>
        </div>
        <div class="nav-group-items">
          ${group.children.map((child, childIndex) => `
            <div class="nav-item ${this.activeGroup === groupIndex && this.activeItem === childIndex ? 'active' : ''}"
                 data-group-index="${groupIndex}" data-item-index="${childIndex}">
              <span class="nav-item-name">${child.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  },

  /**
   * 绑定事件
   */
  bindEvents() {
    // 导航内容点击
    document.getElementById('navContent')?.addEventListener('click', (e) => {
      if (this.inSettingsMode) return;

      // 检查是否点击了一级导航（分组标题）
      const groupHeader = e.target.closest('.nav-group-header');
      if (groupHeader) {
        const index = parseInt(groupHeader.dataset.groupIndex);
        this.toggleGroup(index);
        return;
      }

      // 检查是否点击了二级导航项
      const navItem = e.target.closest('.nav-item');
      if (navItem) {
        const groupIndex = parseInt(navItem.dataset.groupIndex);
        const itemIndex = parseInt(navItem.dataset.itemIndex);
        this.selectItem(groupIndex, itemIndex);
      }
    });

    // 设置按钮
    document.getElementById('settingsBtn')?.addEventListener('click', () => {
      this.toggleSettings();
    });

    document.getElementById('settingsBtnFloat')?.addEventListener('click', () => {
      this.toggleSettings();
    });

    // 返回按钮
    document.getElementById('backBtn')?.addEventListener('click', () => {
      this.toggleSettings();
    });
  },

  /**
   * 切换设置模式
   */
  toggleSettings() {
    this.inSettingsMode = !this.inSettingsMode;

    const settingsBtn = document.getElementById('settingsBtn');
    const backBtn = document.getElementById('backBtn');
    const settingsBtnFloat = document.getElementById('settingsBtnFloat');
    const editorSection = document.getElementById('editorSection');
    const settingsSection = document.getElementById('settingsSection');
    const navHeader = document.querySelector('.nav-header .nav-title');

    if (this.inSettingsMode) {
      // 进入设置模式
      settingsBtn.style.display = 'none';
      backBtn.style.display = 'flex';
      settingsBtnFloat.style.display = 'none';
      editorSection.style.display = 'none';
      settingsSection.style.display = 'block';
      navHeader.textContent = '设置';
      // 初始化设置页面
      Settings.render();
    } else {
      // 返回编辑模式
      settingsBtn.style.display = 'flex';
      backBtn.style.display = 'none';
      settingsBtnFloat.style.display = 'flex';
      editorSection.style.display = 'flex';
      settingsSection.style.display = 'none';
      navHeader.textContent = '目录';
      // 重置选中状态
      this.activeGroup = null;
      this.activeItem = null;
      // 刷新导航
      this.render();
      this.showEmptyContent();
    }
  },

  /**
   * 切换分组展开/收起
   */
  toggleGroup(index, forceExpand = false) {
    if (this.activeGroup === index && !forceExpand) {
      // 收起当前分组
      this.activeGroup = null;
      this.activeItem = null;
    } else {
      this.activeGroup = index;
      // 如果没有选中的项，自动选中第一个
      if (this.activeItem === null || !this.data.groups[index]?.children?.[this.activeItem]) {
        if (this.data.groups[index]?.children?.length > 0) {
          this.activeItem = 0;
          this.showContent(this.data.groups[index].children[0]);
        } else {
          this.activeItem = null;
          this.showEmptyContent();
        }
      } else {
        this.showContent(this.data.groups[index].children[this.activeItem]);
      }
    }
    this.render();
  },

  /**
   * 选择二级导航项
   */
  selectItem(groupIndex, itemIndex) {
    this.activeGroup = groupIndex;
    this.activeItem = itemIndex;

    const item = this.data.groups[groupIndex]?.children?.[itemIndex];
    if (item) {
      this.showContent(item);
    }

    this.render();
  },

  /**
   * 显示内容
   */
  showContent(item) {
    const container = document.getElementById('editorContent');
    if (container) {
      container.innerHTML = `
        <div class="editor-container">
          <div class="editor-toolbar">
            <div class="toolbar-group">
              <button class="toolbar-btn" title="加粗"><b>B</b></button>
              <button class="toolbar-btn" title="斜体"><i>I</i></button>
              <button class="toolbar-btn" title="下划线"><u>U</u></button>
            </div>
            <div class="toolbar-group">
              <button class="toolbar-btn" title="标题1">H1</button>
              <button class="toolbar-btn" title="标题2">H2</button>
              <button class="toolbar-btn" title="引用">"</button>
            </div>
            <div class="toolbar-group">
              <button class="toolbar-btn" title="列表">☰</button>
              <button class="toolbar-btn" title="编号列表">1.</button>
            </div>
            <div class="toolbar-group">
              <button class="toolbar-btn" title="撤销">↩</button>
              <button class="toolbar-btn" title="重做">↪</button>
            </div>
          </div>
          <div class="editor-body">
            <textarea class="editor-textarea" id="storyEditor" placeholder="开始写作...">${item.content || ''}</textarea>
          </div>
          <div class="ai-assistant">
            <div class="ai-assistant-header">
              <h4>AI 写作助手</h4>
            </div>
            <textarea class="ai-prompt-input" placeholder="输入指令，让 AI 帮你续写、润色或修改..."></textarea>
            <div class="ai-actions">
              <button class="btn btn-primary btn-sm">发送</button>
            </div>
          </div>
          <div class="status-bar">
            <div class="status-item">
              <span class="status-indicator"></span>
              <span id="agentStatus">未配置</span>
            </div>
            <div class="status-item">
              <span id="charCount">${item.content?.length || 0} 字</span>
            </div>
          </div>
        </div>
      `;

      this.bindEditorEvents();
    }
  },

  /**
   * 绑定编辑器事件
   */
  bindEditorEvents() {
    const editor = document.getElementById('storyEditor');
    const charCount = document.getElementById('charCount');

    editor?.addEventListener('input', () => {
      if (charCount) {
        charCount.textContent = `${editor.value.length} 字`;
      }

      // 保存内容
      const navData = Storage.getNavigation();
      const currentItem = navData.groups[Navigation.activeGroup]?.children?.[Navigation.activeItem];
      if (currentItem) {
        currentItem.content = editor.value;
        Storage.setNavigation(navData);
      }
    });

    // 更新 Agent 状态
    const agents = Storage.getAgents();
    const activeAgent = agents.find(a => a.active);
    const statusEl = document.getElementById('agentStatus');
    if (statusEl) {
      statusEl.textContent = activeAgent ? '已连接' : '未配置';
    }
  },

  /**
   * 显示空内容
   */
  showEmptyContent() {
    const container = document.getElementById('editorContent');
    if (container) {
      container.innerHTML = `
        <div class="welcome-message">
          <h1>欢迎使用 AI Story</h1>
          <p>选择左侧分类开始创作</p>
        </div>
      `;
    }
  }
};

// 导出给全局使用
if (typeof window !== 'undefined') {
  window.Navigation = Navigation;
}