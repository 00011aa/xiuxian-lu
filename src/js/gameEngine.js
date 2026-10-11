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
   * @param {Object} options - { name, gender, region, attrs: {strength, wisdom, agility, luck, spirit_attr} }
   */
  startNewGame(options) {
    this.state = window.SaveSystem.createNewSave(options);
    this.notifyListeners();
    this.startAutoSave();
    return this.state;
  },

  /**
   * 在游戏内选择流派（入门）
   */
  choosePath(pathId) {
    if (!this.state) return { success: false, msg: "无游戏状态" };
    if (this.state.flags.pathChosen) {
      return { success: false, msg: "已入门，不可改换门庭" };
    }
    const path = window.GameData.PATHS[pathId];
    if (!path) return { success: false, msg: "流派不存在" };

    const p = this.state.player;
    p.pathId = pathId;
    p.pathName = path.name;
    p.realmIndex = 0;
    p.subRealmIndex = 0;
    p.realmName = window.GameData.getRealmName(pathId, 0, 0);
    p.cultivation = 0;
    p.maxCultivation = window.GameData.getRequirement(0, 0);
    this.state.flags.pathChosen = true;

    this.notifyListeners();
    return { success: true, path: path.name };
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

    // 未选择流派时只能做基础吐纳，效率极低
    if (!p.pathId) {
      const gain = Math.floor(2 + Math.random() * 3);
      p.cultivation += gain;
      p.spirit = Math.max(0, p.spirit - 3);
      this.state.stats.totalCultivation += gain;
      this.notifyListeners();
      return { success: true, gain, breakthrough: false, msg: "未入门，吐纳所得甚微" };
    }

    // 检查是否已满级
    if (p.realmIndex >= window.GameData.TOTAL_REALMS - 1 &&
        p.subRealmIndex >= window.GameData.SUB_REALM_COUNT - 1) {
      return { success: false, msg: "已达巅峰境界，再无可修" };
    }

    // 计算修炼效率（基于悟性和当前境界）
    const wisdomBonus = 1 + (p.wisdom - 5) * 0.05;
    const efficiency = (1 + p.realmIndex * 0.3) * wisdomBonus;
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

    // 未入门无法突破
    if (!p.pathId) {
      return { success: false, msg: "尚未入门，何谈突破" };
    }

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
   * 使用物品（食物/丹药等）
   */
  useItem(itemId) {
    if (!this.state) return { success: false, msg: "无游戏状态" };
    const count = this.state.inventory[itemId] || 0;
    if (count <= 0) return { success: false, msg: "物品不足" };

    const item = window.GameData.ITEMS[itemId];
    if (!item) return { success: false, msg: "未知物品" };

    const p = this.state.player;
    const effect = item.effect || {};
    const msgs = [];

    if (effect.health) {
      p.health = Math.min(p.maxHealth, p.health + effect.health);
      msgs.push(`气血+${effect.health}`);
    }
    if (effect.maxHealth) {
      p.maxHealth += effect.maxHealth;
      p.health += effect.maxHealth;
      msgs.push(`最大气血+${effect.maxHealth}`);
    }
    if (effect.spirit) {
      p.spirit = Math.min(p.maxSpirit, p.spirit + effect.spirit);
      msgs.push(`灵力+${effect.spirit}`);
    }
    if (effect.cultivation) {
      p.cultivation += effect.cultivation;
      this.state.stats.totalCultivation += effect.cultivation;
      msgs.push(`修为+${effect.cultivation}`);
      // 检查突破
      if (p.pathId && p.cultivation >= p.maxCultivation) {
        this.tryBreakthrough();
      }
    }
    if (effect.lifespan) {
      p.lifespan += effect.lifespan;
      msgs.push(`寿命+${effect.lifespan}`);
    }

    this.state.inventory[itemId]--;
    if (this.state.inventory[itemId] <= 0) {
      delete this.state.inventory[itemId];
    }

    this.notifyListeners();
    return { success: true, msg: `使用了${item.name}。${msgs.join("，")}` };
  },

  /**
   * 获得物品
   */
  addItem(itemId, count = 1) {
    if (!this.state) return;
    this.state.inventory[itemId] = (this.state.inventory[itemId] || 0) + count;
    this.notifyListeners();
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
