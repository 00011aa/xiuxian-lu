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

const SAVE_VERSION = 1;

/**
 * 创建一个全新的存档数据
 */
function createNewSave(playerName, pathId) {
  const now = Date.now();
  const path = window.GameData.PATHS[pathId];
  const realmName = window.GameData.getRealmName(pathId, 0, 0);

  // 初始化技能（全部未学习）
  const skills = {};
  for (const skill of window.GameData.SKILLS) {
    skills[skill.id] = { level: 0, exp: 0, unlocked: false };
  }

  return {
    meta: {
      saveVersion: SAVE_VERSION,
      gameVersion: window.GameData.GAME_VERSION,
      createdAt: now,
      savedAt: now
    },
    player: {
      name: playerName,
      pathId: pathId,
      pathName: path.name,
      realmIndex: 0,
      subRealmIndex: 0,
      realmName: realmName,
      cultivation: 0,        // 当前修为值
      maxCultivation: window.GameData.getRequirement(0, 0),
      age: 16,
      lifespan: 100,
      health: 100,
      maxHealth: 100,
      spirit: 100,
      maxSpirit: 100,
      playTime: 0,           // 游戏时长（秒）
      createdAt: now
    },
    skills: skills,
    inventory: {
      spirit_stone: 100      // 初始灵石
    },
    stats: {
      totalCultivation: 0,
      breakthroughCount: 0,
      skillsLearned: 0,
      enemiesDefeated: 0
    },
    flags: {
      tutorialDone: false,
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
  
  // 未来版本迁移可在此添加（version < 2, version < 3, ...）
  
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
