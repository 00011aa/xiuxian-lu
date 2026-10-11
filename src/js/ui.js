/**
 * 修仙录 - UI 控制器
 * 负责界面渲染和用户交互
 */

const UI = {
  currentTab: 'cultivate',
  selectedPath: null,
  selectedPathType: 'mainstream',
  currentSkillCategory: 'all',

  init() {
    this.bindStartScreen();
    this.bindCreateScreen();
    this.bindGameScreen();
    this.bindSaveScreen();
    
    // 获取应用版本
    if (window.SaveAPI && window.SaveAPI.getAppVersion) {
      window.SaveAPI.getAppVersion().then(v => {
        document.getElementById('app-version').textContent = v;
        document.getElementById('about-version').textContent = v;
      });
    }
  },

  // ========== 屏幕切换 ==========
  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  },

  // ========== 开始界面 ==========
  bindStartScreen() {
    document.getElementById('btn-new-game').addEventListener('click', () => {
      this.showScreen('screen-create');
      this.renderPathList();
    });

    document.getElementById('btn-load-game').addEventListener('click', () => {
      this.showScreen('screen-load');
      this.renderSaveList();
    });

    document.getElementById('btn-import-save').addEventListener('click', async () => {
      const data = await window.SaveSystem.importSave();
      if (data) {
        window.GameEngine.loadGame(data);
        this.showScreen('screen-game');
        this.refreshAll();
      } else {
        this.alert('导入失败或已取消');
      }
    });

    document.getElementById('btn-about').addEventListener('click', () => {
      this.openModal('about');
    });
  },

  // ========== 角色创建 ==========
  bindCreateScreen() {
    document.getElementById('btn-create-back').addEventListener('click', () => {
      this.showScreen('screen-start');
    });

    document.getElementById('btn-create-confirm').addEventListener('click', () => {
      const name = document.getElementById('input-name').value.trim();
      if (!name) {
        this.alert('请输入道号');
        return;
      }
      if (!this.selectedPath) {
        this.alert('请选择流派');
        return;
      }
      window.GameEngine.startNewGame(name, this.selectedPath);
      this.showScreen('screen-game');
      this.refreshAll();
    });

    document.querySelectorAll('.path-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.path-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.selectedPathType = tab.dataset.type;
        this.selectedPath = null;
        document.getElementById('path-desc').textContent = '';
        this.renderPathList();
      });
    });
  },

  renderPathList() {
    const container = document.getElementById('path-list');
    const paths = this.selectedPathType === 'mainstream' 
      ? window.GameData.getMainstreamPaths() 
      : window.GameData.getNichePaths();
    
    container.innerHTML = paths.map(p => `
      <div class="path-card" data-path-id="${p.id}">
        <div class="path-name">${p.name}</div>
        <div class="path-type">${p.type === 'mainstream' ? '主流' : '小众'}</div>
      </div>
    `).join('');

    container.querySelectorAll('.path-card').forEach(card => {
      card.addEventListener('click', () => {
        container.querySelectorAll('.path-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedPath = card.dataset.pathId;
        const path = window.GameData.PATHS[this.selectedPath];
        document.getElementById('path-desc').innerHTML = 
          `<strong style="color:var(--gold-light)">${path.name}</strong>：${path.desc}<br>` +
          `<span style="color:var(--text-muted)">境界：${path.realms.join(' → ')}</span>`;
      });
    });
  },

  // ========== 存档列表 ==========
  bindSaveScreen() {
    document.getElementById('btn-load-back').addEventListener('click', () => {
      this.showScreen('screen-start');
    });
  },

  async renderSaveList() {
    const container = document.getElementById('save-list');
    const saves = await window.SaveSystem.listSaves();
    
    if (saves.length === 0) {
      container.innerHTML = '<div class="save-empty">暂无存档</div>';
      return;
    }

    container.innerHTML = saves.map(s => `
      <div class="save-item">
        <div class="save-icon">📜</div>
        <div class="save-info">
          <div class="save-name">${s.name} · ${s.path}</div>
          <div class="save-detail">${s.realm} | 时长: ${this.formatTime(s.playTime)} | ${new Date(s.savedAt).toLocaleString()}</div>
        </div>
        <div class="save-actions">
          <button class="small-btn" data-action="load" data-file="${s.fileName}">读取</button>
          <button class="small-btn danger" data-action="delete" data-file="${s.fileName}">删除</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.dataset.action;
        const file = btn.dataset.file;
        if (action === 'load') {
          const data = await window.SaveSystem.loadGame(file);
          if (data) {
            window.GameEngine.loadGame(data);
            this.showScreen('screen-game');
            this.refreshAll();
          } else {
            this.alert('读取存档失败');
          }
        } else if (action === 'delete') {
          if (confirm('确定删除此存档？')) {
            await window.SaveSystem.deleteSave(file);
            this.renderSaveList();
          }
        }
      });
    });
  },

  // ========== 游戏界面 ==========
  bindGameScreen() {
    // 导航切换
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // 修炼按钮
    document.getElementById('btn-cultivate').addEventListener('click', () => {
      const result = window.GameEngine.cultivate();
      if (result.success) {
        let msg = `修为 +${result.gain}`;
        if (result.breakthrough && result.breakthrough.success) {
          msg += result.breakthrough.major 
            ? ` · 突破成功！晋升 ${result.breakthrough.newRealm}！` 
            : ` · 突破至 ${result.breakthrough.newRealm}`;
        } else if (result.breakthrough && !result.breakthrough.success) {
          msg += ` · ${result.breakthrough.msg}`;
        }
        this.showResult('cultivate-result', msg, result.breakthrough?.success ? 'success' : '');
      } else {
        this.showResult('cultivate-result', result.msg, 'error');
      }
      this.refreshHUD();
      this.refreshCultivate();
    });

    document.getElementById('btn-breakthrough').addEventListener('click', () => {
      const p = window.GameEngine.state.player;
      if (p.cultivation < p.maxCultivation) {
        this.showResult('cultivate-result', '修为不足，无法突破', 'error');
        return;
      }
      const result = window.GameEngine.tryBreakthrough();
      if (result.success) {
        this.showResult('cultivate-result', 
          result.major ? `大境界突破！晋升 ${result.newRealm}！` : `突破至 ${result.newRealm}`, 
          'success');
      } else {
        this.showResult('cultivate-result', result.msg, 'error');
      }
      this.refreshHUD();
      this.refreshCultivate();
    });

    document.getElementById('btn-meditate').addEventListener('click', () => {
      const result = window.GameEngine.meditate();
      this.showResult('cultivate-result', `打坐恢复，灵力 ${result.spirit}，气血 ${result.health}`, '');
      this.refreshHUD();
    });

    // 存档按钮
    document.getElementById('btn-save-manual').addEventListener('click', async () => {
      const result = await window.GameEngine.save();
      if (result && result.success) {
        this.showResult('save-result', '保存成功！', 'success');
      } else {
        this.showResult('save-result', '保存失败：' + (result?.error || '未知错误'), 'error');
      }
    });

    document.getElementById('btn-export-save').addEventListener('click', async () => {
      const result = await window.SaveSystem.exportSave(window.GameEngine.state);
      if (result && result.success) {
        this.showResult('save-result', `已导出到：${result.filePath}`, 'success');
      } else if (result && !result.canceled) {
        this.showResult('save-result', '导出失败', 'error');
      }
    });

    document.getElementById('btn-return-title').addEventListener('click', () => {
      window.GameEngine.stopAutoSave();
      this.showScreen('screen-start');
    });
  },

  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-btn[data-tab="${tab}"]`).classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');

    if (tab === 'skills') this.renderSkills();
    if (tab === 'inventory') this.renderInventory();
    if (tab === 'status') this.renderStatus();
    if (tab === 'world') this.renderWorld();
    if (tab === 'save') this.loadSaveDir();
  },

  // ========== 刷新所有 ==========
  refreshAll() {
    this.refreshHUD();
    this.refreshCultivate();
    if (this.currentTab === 'skills') this.renderSkills();
    if (this.currentTab === 'inventory') this.renderInventory();
    if (this.currentTab === 'status') this.renderStatus();
  },

  // ========== HUD ==========
  refreshHUD() {
    const p = window.GameEngine.state.player;
    document.getElementById('hud-name').textContent = p.name;
    document.getElementById('hud-path').textContent = p.pathName;
    document.getElementById('hud-realm').textContent = p.realmName;
    document.getElementById('hud-age').textContent = `年龄: ${p.age}`;
    document.getElementById('hud-spirit').textContent = `灵力: ${p.spirit}/${p.maxSpirit}`;
    document.getElementById('hud-stone').textContent = `灵石: ${window.GameEngine.state.inventory.spirit_stone || 0}`;
    
    const pct = window.GameEngine.getRealmProgress();
    document.getElementById('hud-cultivation-fill').style.width = pct + '%';
    document.getElementById('hud-cultivation-text').textContent = `${p.cultivation} / ${p.maxCultivation}`;
  },

  // ========== 修炼面板 ==========
  refreshCultivate() {
    const p = window.GameEngine.state.player;
    document.getElementById('cult-realm-name').textContent = p.realmName;
    document.getElementById('cult-path-name').textContent = p.pathName;
    
    const pct = window.GameEngine.getRealmProgress();
    document.getElementById('cult-progress-fill').style.width = pct + '%';
    document.getElementById('cult-progress-text').textContent = `${p.cultivation} / ${p.maxCultivation}`;

    // 境界列表
    const path = window.GameData.PATHS[p.pathId];
    const realmList = document.getElementById('realm-list');
    realmList.innerHTML = path.realms.map((r, i) => {
      let subHtml = '';
      if (i < p.realmIndex) {
        return `<div class="realm-item completed"><span class="realm-num">${i + 1}</span>${r} <span class="realm-sub">圆满</span></div>`;
      } else if (i === p.realmIndex) {
        const subNames = window.GameData.SUB_REALMS.slice(0, p.subRealmIndex + 1).join('·');
        return `<div class="realm-item current"><span class="realm-num">${i + 1}</span>${r} <span class="realm-sub">${subNames}</span></div>`;
      } else {
        return `<div class="realm-item"><span class="realm-num">${i + 1}</span>${r}</div>`;
      }
    }).join('');
  },

  // ========== 技能面板 ==========
  renderSkills() {
    const state = window.GameEngine.state;
    const categories = ['all', ...window.GameData.SKILL_CATEGORIES];
    
    // 分类侧边栏
    const catContainer = document.getElementById('skill-categories');
    catContainer.innerHTML = categories.map(cat => {
      const skills = cat === 'all' 
        ? window.GameData.SKILLS 
        : window.GameData.SKILLS.filter(s => s.category === cat);
      const learned = skills.filter(s => state.skills[s.id]?.unlocked).length;
      const label = cat === 'all' ? '全部' : cat;
      return `<button class="category-btn ${this.currentSkillCategory === cat ? 'active' : ''}" data-cat="${cat}">
        ${label} <span class="count">${learned}/${skills.length}</span>
      </button>`;
    }).join('');

    catContainer.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentSkillCategory = btn.dataset.cat;
        this.renderSkills();
      });
    });

    // 技能标题
    const cat = this.currentSkillCategory;
    document.getElementById('skill-category-title').textContent = cat === 'all' ? '全部技能' : cat + '类';
    const allSkills = window.GameData.SKILLS;
    const learnedCount = allSkills.filter(s => state.skills[s.id]?.unlocked).length;
    document.getElementById('skills-count').textContent = `已学 ${learnedCount} / ${allSkills.length}`;

    // 技能列表
    const skills = cat === 'all' ? allSkills : allSkills.filter(s => s.category === cat);
    const grid = document.getElementById('skills-grid');
    grid.innerHTML = skills.map(s => {
      const sk = state.skills[s.id];
      const unlocked = sk?.unlocked;
      const level = sk?.level || 0;
      const exp = sk?.exp || 0;
      const expMax = level * 100;
      const expPct = level >= 10 ? 100 : (exp / expMax * 100);
      
      return `
        <div class="skill-card ${unlocked ? 'learned' : 'locked'}">
          <div class="skill-card-header">
            <span class="skill-name">${s.name}</span>
            ${unlocked ? `<span class="skill-level">Lv.${level}</span>` : ''}
          </div>
          <div class="skill-category-tag">${s.category}</div>
          <div class="skill-desc">${s.desc}</div>
          ${unlocked ? `
            <div class="skill-exp-bar"><div class="skill-exp-fill" style="width:${expPct}%"></div></div>
            <div class="skill-card-actions">
              <button class="small-btn" data-practice="${s.id}">练习</button>
            </div>
          ` : `
            <div class="skill-card-actions">
              <button class="small-btn" data-learn="${s.id}">学习 (50灵石)</button>
            </div>
          `}
        </div>
      `;
    }).join('');

    // 绑定按钮
    grid.querySelectorAll('[data-learn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const result = window.GameEngine.learnSkill(btn.dataset.learn);
        if (result.success) {
          this.renderSkills();
          this.refreshHUD();
        } else {
          this.alert(result.msg);
        }
      });
    });

    grid.querySelectorAll('[data-practice]').forEach(btn => {
      btn.addEventListener('click', () => {
        const result = window.GameEngine.practiceSkill(btn.dataset.practice);
        if (result.success) {
          this.renderSkills();
          this.refreshHUD();
        }
      });
    });
  },

  // ========== 背包 ==========
  renderInventory() {
    const inv = window.GameEngine.state.inventory;
    const grid = document.getElementById('inventory-grid');
    const items = Object.entries(inv);
    
    if (items.length === 0) {
      grid.innerHTML = '<div class="inventory-empty">储物袋空空如也</div>';
      return;
    }

    const itemNames = {
      spirit_stone: '灵石'
    };

    grid.innerHTML = items.map(([id, count]) => `
      <div class="item-card">
        <div class="item-icon">💎</div>
        <div class="item-name">${itemNames[id] || id}</div>
        <div class="item-count">x${count}</div>
      </div>
    `).join('');
  },

  // ========== 状态 ==========
  renderStatus() {
    const s = window.GameEngine.state;
    const p = s.player;
    document.getElementById('st-name').textContent = p.name;
    document.getElementById('st-path').textContent = p.pathName;
    document.getElementById('st-realm').textContent = p.realmName;
    document.getElementById('st-age').textContent = p.age + ' 岁';
    document.getElementById('st-lifespan').textContent = p.lifespan + ' 岁';
    document.getElementById('st-playtime').textContent = this.formatTime(p.playTime);
    document.getElementById('st-health').textContent = `${p.health} / ${p.maxHealth}`;
    document.getElementById('st-spirit').textContent = `${p.spirit} / ${p.maxSpirit}`;
    document.getElementById('st-total-cult').textContent = s.stats.totalCultivation;
    document.getElementById('st-breakthrough').textContent = s.stats.breakthroughCount;
    document.getElementById('st-skills').textContent = s.stats.skillsLearned;

    // 境界详情
    const path = window.GameData.PATHS[p.pathId];
    const nextRealmIdx = p.realmIndex + (p.subRealmIndex === 3 ? 1 : 0);
    const nextSubIdx = p.subRealmIndex === 3 ? 0 : p.subRealmIndex + 1;
    const isMax = p.realmIndex >= window.GameData.TOTAL_REALMS - 1 && p.subRealmIndex >= 3;
    
    let detail = `<p>当前境界：<strong style="color:var(--gold-light)">${p.realmName}</strong></p>`;
    detail += `<p>所属流派：${p.pathName}</p>`;
    detail += `<p>修为进度：${p.cultivation} / ${p.maxCultivation} (${window.GameEngine.getRealmProgress().toFixed(1)}%)</p>`;
    if (!isMax) {
      const nextName = window.GameData.getRealmName(p.pathId, nextRealmIdx, nextSubIdx);
      detail += `<p>下一境界：${nextName}</p>`;
      detail += `<p>突破所需修为：${p.maxCultivation - p.cultivation}</p>`;
    } else {
      detail += `<p style="color:var(--gold)">已达巅峰，再无境界可修</p>`;
    }
    detail += `<p>流派境界总览：${path.realms.join(' → ')}</p>`;
    document.getElementById('realm-detail').innerHTML = detail;
  },

  // ========== 天地 ==========
  renderWorld() {
    const paths = window.GameData.getPathList();
    const container = document.getElementById('world-paths-list');
    container.innerHTML = paths.map(p => `
      <div class="world-path-item">
        <div class="wp-name">${p.name} <span style="font-size:12px;color:var(--text-muted)">(${p.type === 'mainstream' ? '主流' : '小众'})</span></div>
        <div class="wp-realms">${p.realms.join(' · ')}</div>
      </div>
    `).join('');
  },

  // ========== 存档面板 ==========
  async loadSaveDir() {
    const dir = await window.SaveAPI.getSavesDir();
    document.getElementById('save-dir').textContent = dir;
  },

  // ========== 工具方法 ==========
  showResult(elementId, msg, type) {
    const el = document.getElementById(elementId);
    el.textContent = msg;
    el.style.color = type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--immortal)';
  },

  alert(msg) {
    document.getElementById('alert-message').textContent = msg;
    this.openModal('alert');
  },

  openModal(id) {
    document.getElementById(`modal-${id}`).classList.remove('hidden');
  },

  closeModal(id) {
    document.getElementById(`modal-${id}`).classList.add('hidden');
  },

  formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}时${m}分`;
    if (m > 0) return `${m}分${s}秒`;
    return `${s}秒`;
  }
};

// 启动
window.addEventListener('DOMContentLoaded', () => {
  UI.init();
});

// 游戏时长计时器
setInterval(() => {
  if (window.GameEngine.state) {
    window.GameEngine.tick(1);
    // 每分钟刷新一次 HUD 显示游戏时长等
    if (Math.floor(window.GameEngine.state.player.playTime) % 60 === 0) {
      UI.refreshHUD();
    }
  }
}, 1000);

// 窗口关闭前自动保存
window.addEventListener('beforeunload', async () => {
  if (window.GameEngine.state) {
    await window.SaveSystem.autoSave(window.GameEngine.state);
  }
});
