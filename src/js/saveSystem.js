/**
 * 修仙录 - 存档系统
 * 
 * 负责游戏状态的保存和加载，包含版本迁移机制。
 * 存档结构:
 * {
 *   meta: { saveVersion, gameVersion, savedAt, createdAt }
 *   player: { name, pathId, realmIndex, subRealmIndex, realmName, ... }
 *   skills: { [skillId]: { level, exp } }
 *   inventory: { [itemId]: count }
 *   stats: { ... }
 *   flags: { ... }  // 游戏进度标记
 * }
 * 
 * 版本迁移：当 SAVE_VERSION 升级时，migrateSave 函数会将旧版存档升级到新版。
 */

const SAVE_VERSION = 2;

/**
 * 创建一个全新的存档数据
 * @param {Object} options - { name, gender, region, attrs: {strength, wisdom, agility, luck, spirit_attr} }
 * 流派(pathId)不再在创建时指定，进入游戏后由玩家自由选择
 */
function createNewSave(options) {
  const now = Date.now();
  const name = options.name || "无名";
  const gender = options.gender || "无性别";
  const regionId = options.region || "zhongyuan";
  const attrs = options.attrs || {};

  // 随机降临到该地区的某个角落
  const region = window.GameData.REGIONS[regionId] || window.GameData.REGIONS.zhongyuan;
  const corners = region.corners || ["无名之地"];
  const location = corners[Math.floor(Math.random() * corners.length)];

  // 五维属性（每个 1-10）
  const strength = Math.min(10, Math.max(1, attrs.strength || 5));
  const wisdom = Math.min(10, Math.max(1, attrs.wisdom || 5));
  const agility = Math.min(10, Math.max(1, attrs.agility || 5));
  const luck = Math.min(10, Math.max(1, attrs.luck || 5));
  const spirit_attr = Math.min(10, Math.max(1, attrs.spirit_attr || 5));

  // 初始化技能（全部未学习）
  const skills = {};
  for (const skill of window.GameData.SKILLS) {
    skills[skill.id] = { level: 0, exp: 0, unlocked: false };
  }

  // 初始属性影响血量/灵力
  const baseHealth = 80 + strength * 4;
  const baseSpirit = 60 + spirit_attr * 4 + wisdom * 2;

  return {
    meta: {
      saveVersion: SAVE_VERSION,
      gameVersion: window.GameData.GAME_VERSION,
      createdAt: now,
      savedAt: now
    },
    player: {
      name: name,
      gender: gender,
      region: regionId,
      regionName: region.name,
      location: location,
      pathId: null,          // 流派在游戏内选择
      pathName: "散修",       // 未入门前为散修
      realmIndex: 0,
      subRealmIndex: 0,
      realmName: "凡人",      // 未入门前为凡人
      cultivation: 0,
      maxCultivation: window.GameData.getRequirement(0, 0),
      age: 16,
      lifespan: 100,
      health: baseHealth,
      maxHealth: baseHealth,
      spirit: baseSpirit,
      maxSpirit: baseSpirit,
      // 五维属性
      strength: strength,
      wisdom: wisdom,
      agility: agility,
      luck: luck,
      spirit_attr: spirit_attr,
      playTime: 0,
      createdAt: now
    },
    skills: skills,
    inventory: {
      spirit_stone: 100,      // 初始灵石
      rice: 3,                // 初始食物
      lingcao: 2              // 初始灵草
    },
    stats: {
      totalCultivation: 0,
      breakthroughCount: 0,
      skillsLearned: 0,
      enemiesDefeated: 0
    },
    flags: {
      tutorialDone: false,
      pathChosen: false,      // 是否已选择流派
      unlockedSkills: []
    }
  };
}

/**
 * 保存游戏
 */
async function saveGame(saveData) {
  saveData.meta.savedAt = Date.now();
  saveData.meta.gameVersion = window.GameData.GAME_VERSION;
  // 文件名: 角色名_时间戳.json
  const safeName = saveData.player.name.replace(/[\\/:*?"<>|]/g, '_');
  const fileName = `save_${safeName}_${Date.now()}.json`;
  const result = await window.SaveAPI.saveGame(fileName, saveData);
  return result;
}

/**
 * 自动保存（覆盖同一个文件）
 */
async function autoSave(saveData) {
  saveData.meta.savedAt = Date.now();
  saveData.meta.gameVersion = window.GameData.GAME_VERSION;
  const safeName = saveData.player.name.replace(/[\\/:*?"<>|]/g, '_');
  const fileName = `autosave_${safeName}.json`;
  const result = await window.SaveAPI.saveGame(fileName, saveData);
  return result;
}

/**
 * 加载游戏存档列表
 */
async function listSaves() {
  return await window.SaveAPI.listSaves();
}

/**
 * 加载指定存档
 */
async function loadGame(fileName) {
  const result = await window.SaveAPI.loadGame(fileName);
  if (result.success) {
    return migrateSave(result.data);
  }
  return null;
}

/**
 * 删除存档
 */
async function deleteSave(fileName) {
  return await window.SaveAPI.deleteSave(fileName);
}

/**
 * 版本迁移 - 将旧版存档升级到当前版本
 * 这是保证更新不损坏存档的关键
 */
function migrateSave(data) {
  if (!data || !data.meta) return data;
  
  let version = data.meta.saveVersion || 0;
  
  // 迁移到版本 1
  if (version < 1) {
    // 初始化缺失字段
    if (!data.player) data.player = {};
    if (!data.skills) data.skills = {};
    if (!data.inventory) data.inventory = {};
    if (!data.stats) data.stats = {};
    if (!data.flags) data.flags = {};
    
    // 确保所有技能都有条目
    for (const skill of window.GameData.SKILLS) {
      if (!data.skills[skill.id]) {
        data.skills[skill.id] = { level: 0, exp: 0, unlocked: false };
      }
    }
    
    // 确保 player 字段完整
    const defaults = {
      realmIndex: 0, subRealmIndex: 0, cultivation: 0,
      age: 16, lifespan: 100, health: 100, maxHealth: 100,
      spirit: 100, maxSpirit: 100, playTime: 0
    };
    for (const [k, v] of Object.entries(defaults)) {
      if (data.player[k] === undefined) data.player[k] = v;
    }
    
    version = 1;
  }
  
  // 迁移到版本 2：新增性别、地区、五维属性、location，流派改为可空
  if (version < 2) {
    const p = data.player;
    if (p.gender === undefined) p.gender = "无性别";
    if (p.region === undefined) p.region = "zhongyuan";
    if (p.regionName === undefined) p.regionName = "中原";
    if (p.location === undefined) p.location = "青云山脚";
    if (p.strength === undefined) p.strength = 5;
    if (p.wisdom === undefined) p.wisdom = 5;
    if (p.agility === undefined) p.agility = 5;
    if (p.luck === undefined) p.luck = 5;
    if (p.spirit_attr === undefined) p.spirit_attr = 5;
    // 旧存档已有 pathId，标记为已选择流派
    if (data.flags.pathChosen === undefined) {
      data.flags.pathChosen = !!(p.pathId);
    }
    // 若旧存档 pathId 为空字符串或无效，置为散修
    if (!p.pathId || !window.GameData.PATHS[p.pathId]) {
      p.pathId = null;
      p.pathName = "散修";
      p.realmName = "凡人";
    }
    version = 2;
  }
  
  data.meta.saveVersion = SAVE_VERSION;
  return data;
}

/**
 * 导出存档到文件
 */
async function exportSave(saveData) {
  return await window.SaveAPI.exportSave(saveData);
}

/**
 * 从文件导入存档
 */
async function importSave() {
  const result = await window.SaveAPI.importSave();
  if (result.success && result.data) {
    return migrateSave(result.data);
  }
  return null;
}

// 暴露到全局
window.SaveSystem = {
  SAVE_VERSION,
  createNewSave,
  saveGame,
  autoSave,
  listSaves,
  loadGame,
  deleteSave,
  migrateSave,
  exportSave,
  importSave
};
