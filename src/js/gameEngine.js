/**
 * 修仙录 - 游戏核心引擎
 * 管理玩家状态、修炼、突破、技能等核心逻辑
 */

const GameEngine = {
  state: null,         // 当前游戏存档数据
  listeners: [],       // 状态变更监听器
  autoSaveTimer: null, // 自动保存定时器

  /**
   * 初始化新游戏
   */
  startNewGame(playerName, pathId) {
    this.state = window.SaveSystem.createNewSave(playerName, pathId);
    this.notifyListeners();
    this.startAutoSave();
    return this.state;
  },

  /**
   * 加载存档
   */
  loadGame(saveData) {
    this.state = saveData;
    this.notifyListeners();
    this.startAutoSave();
    return this.state;
  },

  /**
   * 获取当前状态
   */
  getState() {
    return this.state;
  },

  /**
   * 状态变更监听
   */
  subscribe(listener) {
    this.listeners.push(listener);
  },

  unsubscribe(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  },

  notifyListeners() {
    for (const l of this.listeners) {
      try { l(this.state); } catch (e) { console.error(e); }
    }
  },

  /**
   * 修炼 - 增加修为
   * @returns {Object} 修炼结果
   */
  cultivate() {
    if (!this.state) return { success: false, msg: "无游戏状态" };
    const p = this.state.player;
    
    // 检查是否已满级
    if (p.realmIndex >= window.GameData.TOTAL_REALMS - 1 && 
        p.subRealmIndex >= window.GameData.SUB_REALM_COUNT - 1) {
      return { success: false, msg: "已达巅峰境界，再无可修" };
    }

    // 计算修炼效率（基于当前境界）
    const efficiency = 1 + p.realmIndex * 0.3;
    const gain = Math.floor(10 * efficiency * (0.8 + Math.random() * 0.4));
    
    p.cultivation += gain;
    p.spirit = Math.max(0, p.spirit - 5);
    this.state.stats.totalCultivation += gain;

    let result = { success: true, gain, breakthrough: false };

    // 检查是否可以突破
    if (p.cultivation >= p.maxCultivation) {
      result.breakthrough = this.tryBreakthrough();
    }

    this.notifyListeners();
    return result;
  },

  /**
   * 尝试突破境界
   * @returns {Object} 突破结果
   */
  tryBreakthrough() {
    const p = this.state.player;
    const path = window.GameData.PATHS[p.pathId];
    
    // 已满级
    if (p.realmIndex >= window.GameData.TOTAL_REALMS - 1 && 
        p.subRealmIndex >= window.GameData.SUB_REALM_COUNT - 1) {
      return { success: false, msg: "已达巅峰" };
    }

    // 突破成功率（小境界100%，大境界有失败率）
    const isMajorBreakthrough = p.subRealmIndex === window.GameData.SUB_REALM_COUNT - 1;
    let successRate = 1.0;
    
    if (isMajorBreakthrough) {
      // 大境界突破，基础成功率 70%，随境界降低
      successRate = Math.max(0.3, 0.7 - p.realmIndex * 0.03);
    }

    const roll = Math.random();
    if (roll > successRate) {
      // 突破失败
      p.cultivation = Math.floor(p.maxCultivation * 0.5);
      p.health = Math.max(1, p.health - 20);
      this.notifyListeners();
      return { success: false, major: isMajorBreakthrough, msg: "突破失败，修为倒退" };
    }

    // 突破成功
    if (isMajorBreakthrough) {
      p.realmIndex++;
      p.subRealmIndex = 0;
      // 大境界突破增加寿命
      p.lifespan += 50 + p.realmIndex * 20;
      p.maxHealth += 50;
      p.health = p.maxHealth;
      p.maxSpirit += 30;
      p.spirit = p.maxSpirit;
    } else {
      p.subRealmIndex++;
    }

    p.cultivation = 0;
    p.maxCultivation = window.GameData.getRequirement(p.realmIndex, p.subRealmIndex);
    p.realmName = window.GameData.getRealmName(p.pathId, p.realmIndex, p.subRealmIndex);
    this.state.stats.breakthroughCount++;

    this.notifyListeners();
    return {
      success: true,
      major: isMajorBreakthrough,
      newRealm: p.realmName
    };
  },

  /**
   * 学习技能
   */
  learnSkill(skillId) {
    if (!this.state) return { success: false, msg: "无游戏状态" };
    const skill = window.GameData.SKILLS.find(s => s.id === skillId);
    if (!skill) return { success: false, msg: "技能不存在" };
    
    const sk = this.state.skills[skillId];
    if (!sk) return { success: false, msg: "技能数据错误" };
    
    if (sk.unlocked) return { success: false, msg: "已学习此技能" };
    
    // 学习消耗灵石
    const cost = 50;
    if ((this.state.inventory.spirit_stone || 0) < cost) {
      return { success: false, msg: `需要 ${cost} 灵石` };
    }
    
    this.state.inventory.spirit_stone -= cost;
    sk.unlocked = true;
    sk.level = 1;
    sk.exp = 0;
    this.state.stats.skillsLearned++;
    
    if (!this.state.flags.unlockedSkills.includes(skillId)) {
      this.state.flags.unlockedSkills.push(skillId);
    }
    
    this.notifyListeners();
    return { success: true, skill };
  },

  /**
   * 练习技能（增加经验）
   */
  practiceSkill(skillId) {
    if (!this.state) return { success: false, msg: "无游戏状态" };
    const sk = this.state.skills[skillId];
    if (!sk || !sk.unlocked) return { success: false, msg: "未学习此技能" };
    
    const gain = Math.floor(5 + Math.random() * 10);
    sk.exp += gain;
    
    // 升级检查
    const levelUpExp = sk.level * 100;
    let leveledUp = false;
    while (sk.exp >= sk.level * 100 && sk.level < 10) {
      sk.exp -= sk.level * 100;
      sk.level++;
      leveledUp = true;
    }
    
    this.state.player.spirit = Math.max(0, this.state.player.spirit - 3);
    this.notifyListeners();
    return { success: true, gain, level: sk.level, leveledUp };
  },

  /**
   * 打坐恢复
   */
  meditate() {
    if (!this.state) return { success: false };
    const p = this.state.player;
    p.spirit = Math.min(p.maxSpirit, p.spirit + 20);
    p.health = Math.min(p.maxHealth, p.health + 10);
    this.notifyListeners();
    return { success: true, spirit: p.spirit, health: p.health };
  },

  /**
   * 获取已学习技能列表
   */
  getLearnedSkills() {
    if (!this.state) return [];
    return window.GameData.SKILLS.filter(s => this.state.skills[s.id]?.unlocked);
  },

  /**
   * 获取未学习技能列表
   */
  getUnlearnedSkills() {
    if (!this.state) return window.GameData.SKILLS;
    return window.GameData.SKILLS.filter(s => !this.state.skills[s.id]?.unlocked);
  },

  /**
   * 获取境界进度百分比
   */
  getRealmProgress() {
    if (!this.state) return 0;
    const p = this.state.player;
    return Math.min(100, (p.cultivation / p.maxCultivation) * 100);
  },

  /**
   * 增加游戏时长
   */
  tick(deltaSeconds) {
    if (this.state) {
      this.state.player.playTime += deltaSeconds;
    }
  },

  /**
   * 自动保存
   */
  startAutoSave() {
    this.stopAutoSave();
    // 每 30 秒自动保存
    this.autoSaveTimer = setInterval(async () => {
      if (this.state) {
        await window.SaveSystem.autoSave(this.state);
      }
    }, 30000);
  },

  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  },

  /**
   * 手动保存
   */
  async save() {
    if (this.state) {
      const result = await window.SaveSystem.saveGame(this.state);
      return result;
    }
    return null;
  }
};

window.GameEngine = GameEngine;
