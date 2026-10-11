/**
 * 修仙录 - 游戏核心数据
 * 
 * 数据结构说明：
 * - PATHS: 修行流派（主流7种 + 小众流派）
 * - 每个流派有 13 个大境界，每个大境界有 4 个小境界（初期/中期/后期/圆满）
 * - SKILLS: 修仙百艺，共 100 种技能
 * 
 * 版本: 1.0.0
 */

const GAME_VERSION = "1.0.0";
const SAVE_VERSION = 1;

// 小境界名称
const SUB_REALMS = ["初期", "中期", "后期", "圆满"];

// 七大主流流派
const PATHS = {
  xiandao: {
    id: "xiandao",
    name: "仙道",
    desc: "修仙正宗，以长生久视、羽化登仙为目标。",
    type: "mainstream",
    realms: [
      "练气期", "筑基期", "金丹期", "元婴期", "化神期",
      "炼虚期", "合体期", "大乘期", "渡劫期", "仙人",
      "天仙", "金仙", "大罗金仙"
    ]
  },
  wudao: {
    id: "wudao",
    name: "武道",
    desc: "以武入道，锤炼肉身，拳碎星辰，脚踏乾坤。",
    type: "mainstream",
    realms: [
      "淬体境", "练力境", "易筋境", "洗髓境", "换骨境",
      "通玄境", "真元境", "化罡境", "金丹境", "元神境",
      "武圣", "武神", "武祖"
    ]
  },
  rudao: {
    id: "rudao",
    name: "儒道",
    desc: "修身齐家治国平天下，以浩然正气铸就圣人之躯。",
    type: "mainstream",
    realms: [
      "童生", "秀才", "举人", "进士", "翰林",
      "大学士", "大儒", "半圣", "亚圣", "圣人",
      "圣王", "圣帝", "圣尊"
    ]
  },
  foxiu: {
    id: "foxiu",
    name: "佛修",
    desc: "明心见性，普渡众生，以慈悲心修金刚不坏之身。",
    type: "mainstream",
    realms: [
      "沙弥", "比丘", "须陀洹", "斯陀含", "阿那含",
      "阿罗汉", "辟支佛", "菩萨", "佛", "世尊",
      "如来", "佛陀", "佛祖"
    ]
  },
  moxiu: {
    id: "moxiu",
    name: "魔修",
    desc: "我行我素，杀伐果断，以杀证道，以血祭魔。",
    type: "mainstream",
    realms: [
      "聚煞期", "凝魔期", "魔丹期", "魔婴期", "化魔期",
      "炼魔期", "合魔期", "魔劫期", "魔尊", "魔王",
      "魔皇", "魔帝", "魔神"
    ]
  },
  yaoxiu: {
    id: "yaoxiu",
    name: "妖修",
    desc: "妖族修炼，吸天地灵气，化形问道，逍遥天地间。",
    type: "mainstream",
    realms: [
      "开灵期", "化形期", "凝丹期", "妖婴期", "化神期",
      "炼妖期", "合妖期", "大妖", "妖王", "妖皇",
      "妖帝", "妖尊", "妖圣"
    ]
  },
  guixiu: {
    id: "guixiu",
    name: "鬼修",
    desc: "魂修一脉，以幽冥之力修炼神魂，超脱生死轮回。",
    type: "mainstream",
    realms: [
      "游魂期", "凝魂期", "鬼丹期", "鬼婴期", "化鬼期",
      "炼魂期", "合魂期", "鬼劫期", "鬼王", "鬼皇",
      "鬼帝", "鬼尊", "鬼祖"
    ]
  },
  // 小众流派
  jianxiu: {
    id: "jianxiu",
    name: "剑修",
    desc: "一剑破万法，以剑入道，剑意冲霄。",
    type: "niche",
    realms: [
      "剑意", "剑心", "剑魂", "剑胆", "剑魄",
      "剑灵", "剑罡", "剑域", "剑圣", "剑神",
      "剑帝", "剑尊", "剑道"
    ]
  },
  danxiu: {
    id: "danxiu",
    name: "丹修",
    desc: "以丹入道，炼丹化神，一粒金丹吞入腹，始知我命由我不由天。",
    type: "niche",
    realms: [
      "识药", "辨药", "采药", "炼药", "成丹",
      "丹师", "丹宗", "丹王", "丹皇", "丹帝",
      "丹尊", "丹圣", "丹道"
    ]
  },
  tixiu: {
    id: "tixiu",
    name: "体修",
    desc: "以肉身成圣，锤炼筋骨皮膜，肉身即法宝。",
    type: "niche",
    realms: [
      "皮膜境", "筋骨境", "血肉境", "脏腑境", "骨髓境",
      "窍穴境", "经络境", "血脉境", "体王", "体皇",
      "体帝", "体尊", "体圣"
    ]
  },
  guxiu: {
    id: "guxiu",
    name: "蛊修",
    desc: "养蛊控蛊，以蛊入道，万蛊噬天。",
    type: "niche",
    realms: [
      "养蛊", "控蛊", "蛊兵", "蛊将", "蛊王",
      "蛊皇", "蛊帝", "蛊尊", "蛊圣", "蛊神",
      "蛊祖", "蛊仙", "蛊道"
    ]
  },
  lexiu: {
    id: "lexiu",
    name: "乐修",
    desc: "以音入道，琴音动天地，一曲定乾坤。",
    type: "niche",
    realms: [
      "闻音", "识律", "通韵", "达意", "传情",
      "动心", "惑神", "裂魂", "乐王", "乐皇",
      "乐帝", "乐尊", "乐道"
    ]
  },
  yixiu: {
    id: "yixiu",
    name: "医修",
    desc: "以医入道，悬壶济世，妙手回春。",
    type: "niche",
    realms: [
      "识药", "诊脉", "针灸", "疗伤", "解毒",
      "续命", "回春", "医王", "医皇", "医帝",
      "医尊", "医圣", "医道"
    ]
  },
  chongxiu: {
    id: "chongxiu",
    name: "虫修",
    desc: "御虫百万，以虫入道，虫潮可吞天。",
    type: "niche",
    realms: [
      "养虫", "驱虫", "御虫", "虫兵", "虫将",
      "虫王", "虫皇", "虫帝", "虫尊", "虫圣",
      "虫神", "虫祖", "虫道"
    ]
  },
  huaxiu: {
    id: "huaxiu",
    name: "画修",
    desc: "以画入道，画中自有乾坤，一笔一画定山河。",
    type: "niche",
    realms: [
      "涂鸦", "临摹", "写意", "传神", "入圣",
      "画王", "画皇", "画帝", "画尊", "画圣",
      "画神", "画祖", "画道"
    ]
  }
};

// 修仙世界 - 地区
const REGIONS = {
  zhongyuan: {
    id: "zhongyuan", name: "中原", type: "main",
    desc: "天下腹地，宗门林立，人族繁华，灵气均衡，各大圣地、皇朝盘踞于此。",
    corners: ["青云山脚", "落霞镇", "玄武城郊外", "翠微谷", "白马渡", "松林坡", "黄沙古道", "望月湖畔"]
  },
  nanman: {
    id: "nanman", name: "南蛮", type: "main",
    desc: "湿热密林瘴气弥漫，古兽、蛮族、巫道盛行，多上古遗迹。",
    corners: ["瘴雾林边", "百蛊滩", "赤炎谷口", "蛇骨沼泽", "藤木寨外", "雷鸣盆地", "枯木林", "毒雾河口"]
  },
  xirong: {
    id: "xirong", name: "西戎", type: "main",
    desc: "戈壁大漠、雪山荒原，佛道、异族部落，流沙秘境多。",
    corners: ["流沙边缘", "月牙泉畔", "烽火台下", "乱石滩", "驼铃古道", "雪线之下", "佛窟外", "枯井旁"]
  },
  beidi: {
    id: "beidi", name: "北狄", type: "main",
    desc: "冰原冻土，苦寒之地，妖兽横行，冰修、蛮族部落。",
    corners: ["冰封原边", "狼牙口", "霜桦林", "冻骨河", "白熊岭", "冻土裂谷", "极光下", "冰窟窿"]
  },
  dongyi: {
    id: "dongyi", name: "东夷", type: "main",
    desc: "滨海群岛，汪洋浩瀚，海妖、水修，海岛仙门。",
    corners: ["潮汐码头", "贝壳滩", "海鸥岩", "沉船湾", "珊瑚礁边", "海眼旁", "孤岛岸", "迷雾海峡"]
  },
  youyu: {
    id: "youyu", name: "幽域", type: "special",
    desc: "黑暗，鬼怪横行。",
    corners: ["鬼门关外", "幽冥河畔", "白骨林", "忘川桥头", "孤魂野", "阴气谷", "尸骸山", "无明洞口"]
  },
  wujinhaiyang: {
    id: "wujinhaiyang", name: "无尽海洋", type: "special",
    desc: "龙族栖息之地，深处包含海底巨兽，凶险。",
    corners: ["浅海礁", "洋流边缘", "深海沟口", "龙宫外岛", "漩涡海", "珊瑚迷宫", "沉船墓场", "海眼边缘"]
  },
  jibeizhiyu: {
    id: "jibeizhiyu", name: "极北之域", type: "special",
    desc: "寒冷之地，非常寒冷，处于世界的最北边。",
    corners: ["冰川尽头", "永冻之原", "极光冰原", "冰封峡谷", "霜龙巢穴", "冰晶林", "冻海边缘", "寒冥洞口"]
  },
  xingchendao: {
    id: "xingchendao", name: "星辰岛", type: "special",
    desc: "世界的上层，拥有无穷无尽的星辰，有的星辰上面可以住人，有的星辰富庶。",
    corners: ["碎星带", "陨星坑", "星砂平原", "星辉河", "空心星内", "星核碎片旁", "彗星尾迹", "星轨交点"]
  },
  qianfenglu: {
    id: "qianfenglu", name: "千峰陆", type: "special",
    desc: "土元素极其旺盛，里面有非常多的山峰，山脉等等。",
    corners: ["万仞峰下", "裂谷深渊", "石林之间", "崖壁栈道", "山腹矿洞", "分水岭", "飞来石下", "山巅云海"]
  },
  wancuicangmingsen: {
    id: "wancuicangmingsen", name: "万萃苍冥森", type: "special",
    desc: "森林巨多，精灵栖息之地，包含非常多的生灵。",
    corners: ["古木林深处", "精灵树边", "菌菇地", "藤蔓迷宫", "月光林中空地", "古树根部", "迷雾林地", "生命之泉旁"]
  },
  zhufengjing: {
    id: "zhufengjing", name: "逐风境", type: "special",
    desc: "拥有无穷无尽的风气，剑气，里面充满了风元素。",
    corners: ["风眼边缘", "剑风峡", "龙卷平原", "气刃谷", "风蚀岩林", "风暴中心外", "漂浮岛下", "罡风带"]
  }
};

// 获取主区域
function getMainRegions() {
  return Object.values(REGIONS).filter(r => r.type === "main");
}
// 获取特殊区域
function getSpecialRegions() {
  return Object.values(REGIONS).filter(r => r.type === "special");
}
// 获取所有区域
function getAllRegions() {
  return Object.values(REGIONS);
}

// 修仙百艺 - 100种技能
const SKILLS = [
  // 炼丹类 1-5
  { id: "liandan", name: "炼丹", category: "炼丹", desc: "炼制丹药，提升修为或治疗伤势。" },
  { id: "lianyao", name: "炼药", category: "炼丹", desc: "炼制各类药剂，效果各异。" },
  { id: "cuiqu", name: "萃取", category: "炼丹", desc: "从灵材中萃取精华，提纯药力。" },
  { id: "paozhi", name: "炮制", category: "炼丹", desc: "处理药材，去除杂质增强药效。" },
  { id: "yaodao", name: "药道", category: "炼丹", desc: "深谙药理，可自创丹方。" },
  // 炼器类 6-10
  { id: "lianqi", name: "炼器", category: "法器", desc: "炼制法宝兵器，威能无穷。" },
  { id: "duanda", name: "锻打", category: "法器", desc: "锤炼灵材，改变其形态属性。" },
  { id: "cuihuo", name: "淬火", category: "法器", desc: "以灵火淬炼，增强器物品质。" },
  { id: "xiangqian", name: "镶嵌", category: "法器", desc: "将宝石符文嵌入器物之中。" },
  { id: "qidao", name: "器道", category: "法器", desc: "器道大成，可炼制仙器。" },
  // 阵法类 11-15
  { id: "lianzhen", name: "炼阵", category: "阵法", desc: "炼制阵盘阵旗，布下阵法。" },
  { id: "buzhen", name: "布阵", category: "阵法", desc: "依地形布设阵法，攻防兼备。" },
  { id: "pozhen", name: "破阵", category: "阵法", desc: "寻阵眼破阵法，化险为夷。" },
  { id: "zhenwen", name: "阵纹", category: "阵法", desc: "刻画阵纹于器物之上。" },
  { id: "zhendao", name: "阵道", category: "阵法", desc: "阵道宗师，可布天地大阵。" },
  // 符箓类 16-20
  { id: "lianfu", name: "炼符", category: "符箓", desc: "炼制符箓，蕴含法术威能。" },
  { id: "huafu", name: "画符", category: "符箓", desc: "以符笔蘸朱砂绘制符箓。" },
  { id: "zhifu", name: "制符", category: "符箓", desc: "制作符纸符墨，提升符箓品质。" },
  { id: "fuyin", name: "符印", category: "符箓", desc: "凝聚符印，瞬发法术。" },
  { id: "fudao", name: "符道", category: "符箓", desc: "符道通神，一念万符齐发。" },
  // 傀儡类 21-25
  { id: "kuilei", name: "傀儡", category: "傀儡", desc: "炼制傀儡，代己行事。" },
  { id: "jiguan", name: "机关", category: "傀儡", desc: "制作机关器械，巧夺天工。" },
  { id: "yukui", name: "驭傀", category: "傀儡", desc: "心神操控傀儡作战。" },
  { id: "kuileixin", name: "傀儡心", category: "傀儡", desc: "为傀儡植入灵智核心。" },
  { id: "kuidao", name: "傀道", category: "傀儡", desc: "傀道至极，傀儡如生。" },
  // 种植类 26-30
  { id: "zhongzhi", name: "种植", category: "灵植", desc: "种植灵草灵药，收获灵材。" },
  { id: "peiyu", name: "培育", category: "灵植", desc: "培育灵植，提升品质品阶。" },
  { id: "jiajie", name: "嫁接", category: "灵植", desc: "嫁接灵植，培育新品种。" },
  { id: "cuisheng", name: "催生", category: "灵植", desc: "以灵力催生灵植快速生长。" },
  { id: "zhidao", name: "植道", category: "灵植", desc: "植道大成，可催熟万年灵材。" },
  // 御兽类 31-35
  { id: "yushou", name: "御兽", category: "御兽", desc: "驾驭灵兽，并肩作战。" },
  { id: "xunshou", name: "驯兽", category: "御兽", desc: "驯服野兽，使其听命。" },
  { id: "qiyue", name: "契约", category: "御兽", desc: "与灵兽签订契约，心灵相通。" },
  { id: "lingchong", name: "灵宠", category: "御兽", desc: "培育灵宠，相伴修行。" },
  { id: "shoudao", name: "兽道", category: "御兽", desc: "兽道至尊，万兽来朝。" },
  // 蛊虫类 36-40
  { id: "liangu", name: "炼蛊", category: "蛊虫", desc: "炼制蛊虫，以毒攻毒。" },
  { id: "yuchong", name: "驭虫", category: "蛊虫", desc: "操控虫群，铺天盖地。" },
  { id: "yanggu", name: "养蛊", category: "蛊虫", desc: "饲养蛊虫，培育蛊王。" },
  { id: "gudu2", name: "蛊毒", category: "蛊虫", desc: "炼制蛊毒，杀人无形。" },
  { id: "gudao", name: "蛊道", category: "蛊虫", desc: "蛊道通神，万蛊噬天。" },
  // 琴棋书画 41-45
  { id: "qindao", name: "琴道", category: "文道", desc: "以琴入道，琴音动天地。" },
  { id: "qidao2", name: "棋道", category: "文道", desc: "以棋入道，棋局定乾坤。" },
  { id: "shudao", name: "书道", category: "文道", desc: "以书入道，字字含玄机。" },
  { id: "huadao", name: "画道", category: "文道", desc: "以画入道，画中有乾坤。" },
  { id: "wendao", name: "文道", category: "文道", desc: "文道大成，浩然正气冲霄汉。" },
  // 医毒类 46-50
  { id: "yidao", name: "医道", category: "医毒", desc: "精通医理，妙手回春。" },
  { id: "dudao", name: "毒道", category: "医毒", desc: "深谙毒理，毒杀仙人。" },
  { id: "zhenjiu", name: "针灸", category: "医毒", desc: "以银针刺激穴位，疗伤治病。" },
  { id: "liaoshang", name: "疗伤", category: "医毒", desc: "快速恢复伤势。" },
  { id: "dushu", name: "毒术", category: "医毒", desc: "下毒解毒，随心所欲。" },
  // 术数类 51-55
  { id: "zhanbu", name: "占卜", category: "术数", desc: "推演天机，预知祸福。" },
  { id: "fengshui", name: "风水", category: "术数", desc: "观风水龙脉，寻福地洞天。" },
  { id: "xiangshu", name: "相术", category: "术数", desc: "观人面相，知其命运。" },
  { id: "wangqi", name: "望气", category: "术数", desc: "望天地之气，辨吉凶。" },
  { id: "busuan", name: "卜算", category: "术数", desc: "演算命理，趋吉避凶。" },
  // 五行遁术 56-60
  { id: "yufeng", name: "御风", category: "五行", desc: "驾驭风灵，风行天下。" },
  { id: "yuhuo", name: "御火", category: "五行", desc: "控火之术，焚尽万物。" },
  { id: "yushui", name: "御水", category: "五行", desc: "控水之术，水滴石穿。" },
  { id: "yutu", name: "御土", category: "五行", desc: "御土之术，厚重如山。" },
  { id: "yulei", name: "御雷", category: "五行", desc: "御雷之术，雷霆万钧。" },
  // 冰光暗 61-63
  { id: "yubing", name: "御冰", category: "冰光暗", desc: "寒冰之术，冰封千里。" },
  { id: "yuguang", name: "御光", category: "冰光暗", desc: "光明之术，普照大地。" },
  { id: "yuan", name: "御暗", category: "冰光暗", desc: "黑暗之术，吞噬光明。" },
  // 时空因果 64-67
  { id: "kongjian", name: "空间", category: "时空", desc: "操控空间，瞬移虚空。" },
  { id: "shijian", name: "时间", category: "时空", desc: "操控时间，岁月如梭。" },
  { id: "yinguo", name: "因果", category: "时空", desc: "掌控因果，影响命运。" },
  { id: "lunhui", name: "轮回", category: "时空", desc: "参悟轮回，超脱生死。" },
  // 战斗技巧 68-77
  { id: "jianshu", name: "剑术", category: "武技", desc: "御剑之术，剑剑穿心。" },
  { id: "daofa", name: "刀法", category: "武技", desc: "刀法凌厉，一刀两断。" },
  { id: "qiangfa", name: "枪法", category: "武技", desc: "枪法如龙，一往无前。" },
  { id: "gunfa", name: "棍法", category: "武技", desc: "棍法刚猛，横扫千军。" },
  { id: "quanfa", name: "拳法", category: "武技", desc: "拳法霸道，拳拳到肉。" },
  { id: "zhangfa", name: "掌法", category: "武技", desc: "掌法绵柔，暗劲伤人。" },
  { id: "zhifa", name: "指法", category: "武技", desc: "指法凌厉，点穴制敌。" },
  { id: "tuifa", name: "腿法", category: "武技", desc: "腿法如风，踢断山河。" },
  { id: "bianfa", name: "鞭法", category: "武技", desc: "鞭法灵动，抽裂虚空。" },
  { id: "anqi", name: "暗器", category: "武技", desc: "暗器手法，杀人无形。" },
  // 身法 78-80
  { id: "dunshu", name: "遁术", category: "身法", desc: "遁地之术，神出鬼没。" },
  { id: "feixing", name: "飞行", category: "身法", desc: "腾空飞行，遨游九天。" },
  { id: "yinshen", name: "隐身", category: "身法", desc: "隐身匿迹，无影无踪。" },
  // 变化 81-83
  { id: "bianhua", name: "变化", category: "神通", desc: "七十二变，变化万千。" },
  { id: "fenshen", name: "分身", category: "神通", desc: "身外化身，分身万千。" },
  { id: "yirong", name: "易容", category: "神通", desc: "改头换面，以假乱真。" },
  // 元神魂魄 84-87
  { id: "yuanshen", name: "元神", category: "神魂", desc: "修炼元神，神魂不灭。" },
  { id: "shenshi", name: "神识", category: "神魂", desc: "神识外放，洞察万物。" },
  { id: "hunpo", name: "魂魄", category: "神魂", desc: "稳固魂魄，不惧邪祟。" },
  { id: "chuqiao", name: "出窍", category: "神魂", desc: "元神出窍，神游天外。" },
  // 肉身气血 88-90
  { id: "roushen", name: "肉身", category: "肉身", desc: "锤炼肉身，金刚不坏。" },
  { id: "qixue", name: "气血", category: "肉身", desc: "旺盛气血，如龙似虎。" },
  { id: "duanti", name: "锻体", category: "肉身", desc: "锻体之术，脱胎换骨。" },
  // 真元灵力 91-93
  { id: "zhenyuan", name: "真元", category: "灵力", desc: "凝练真元，生生不息。" },
  { id: "lingli", name: "灵力", category: "灵力", desc: "吸纳灵力，修为日进。" },
  { id: "fali", name: "法力", category: "灵力", desc: "法力深厚，神通广大。" },
  // 神通法术 94-97
  { id: "shentong", name: "神通", category: "神通", desc: "先天神通，威能莫测。" },
  { id: "fashu", name: "法术", category: "神通", desc: "后天法术，变化多端。" },
  { id: "mifa", name: "秘法", category: "神通", desc: "秘传之法，威力惊人。" },
  { id: "jinshu", name: "禁术", category: "神通", desc: "禁忌之术，代价惨重。" },
  // 咒幻 98-99
  { id: "zhoushu", name: "咒术", category: "咒幻", desc: "言出法随，咒杀强敌。" },
  { id: "huanshu", name: "幻术", category: "咒幻", desc: "制造幻境，迷惑心神。" },
  // 100. 问道
  { id: "qiudao", name: "问道", category: "大道", desc: "叩问大道，追寻本源，万法归一。" }
];

// 技能分类
const SKILL_CATEGORIES = ["炼丹", "法器", "阵法", "符箓", "傀儡", "灵植", "御兽", "蛊虫", "文道", "医毒", "术数", "五行", "冰光暗", "时空", "武技", "身法", "神通", "神魂", "肉身", "灵力", "咒幻", "大道"];

// 物品类型: treasure(宝物), food(食物), spirit(灵物), material(材料), weapon(武器), armor(防具), pill(丹药), talisman(符箓)
// rarity: 凡品, 灵品, 宝品, 仙品, 神品, 混沌
const ITEMS = {
  // 食物
  rice: { id: "rice", name: "粗米饭", type: "food", rarity: "凡品", desc: "寻常人家的主食，能果腹。", effect: { health: 5 } },
  mantou: { id: "mantou", name: "白面馒头", type: "food", rarity: "凡品", desc: "松软可口，能恢复些许体力。", effect: { health: 10 } },
  roubao: { id: "roubao", name: "肉包子", type: "food", rarity: "凡品", desc: "肉馅饱满，香气扑鼻。", effect: { health: 20 } },
  yulingrou: { id: "yulingrou", name: "玉灵肉", type: "food", rarity: "灵品", desc: "灵兽之肉，蕴含灵气，食之可增气血。", effect: { health: 50, cultivation: 30 } },
  longfengeng: { id: "longfengeng", name: "龙凤羹", type: "food", rarity: "宝品", desc: "以龙凤之肉熬制，大补元气。", effect: { health: 200, maxHealth: 20, cultivation: 200 } },
  xianguo: { id: "xianguo", name: "仙桃", type: "food", rarity: "仙品", desc: "仙家果品，食之延年益寿。", effect: { health: 500, lifespan: 100, cultivation: 1000 } },
  // 丹药
  huixuandan: { id: "huixuandan", name: "回玄丹", type: "pill", rarity: "灵品", desc: "恢复灵力的常用丹药。", effect: { spirit: 50 } },
  qixuedan: { id: "qixuedan", name: "气血丹", type: "pill", rarity: "灵品", desc: "恢复气血，疗伤圣品。", effect: { health: 100 } },
  zhujidan: { id: "zhujidan", name: "筑基丹", type: "pill", rarity: "宝品", desc: "辅助筑基突破的丹药。", effect: { cultivation: 500 } },
  jiejindan: { id: "jiejindan", name: "结金丹", type: "pill", rarity: "仙品", desc: "辅助结金丹境的珍贵丹药。", effect: { cultivation: 5000 } },
  pojingdan: { id: "pojingdan", name: "破境丹", type: "pill", rarity: "仙品", desc: "强行突破一个小境界的逆天丹药。", effect: { cultivation: 99999 } },
  // 灵物
  lingcao: { id: "lingcao", name: "灵草", type: "spirit", rarity: "凡品", desc: "最普通的灵草，炼丹基础材料。", effect: {} },
  xuelinghua: { id: "xuelinghua", name: "血灵花", type: "spirit", rarity: "灵品", desc: "生长于血腥之地，可炼血丹。", effect: {} },
  xuanbingcao: { id: "xuanbingcao", name: "玄冰草", type: "spirit", rarity: "灵品", desc: "极寒之地的灵草，冰属性。", effect: {} },
  xingchensha: { id: "xingchensha", name: "星辰砂", type: "spirit", rarity: "宝品", desc: "自星辰陨落的砂粒，蕴含星辰之力。", effect: {} },
  longxu: { id: "longxu", name: "龙须", type: "spirit", rarity: "仙品", desc: "真龙的胡须，炼器极品材料。", effect: {} },
  hundunguo: { id: "hundunguo", name: "混沌果", type: "spirit", rarity: "混沌", desc: "混沌中孕育的灵果，食之可悟大道。", effect: { cultivation: 999999, lifespan: 1000 } },
  // 材料
  xuantie: { id: "xuantie", name: "玄铁", type: "material", rarity: "灵品", desc: "坚硬的炼器材料。", effect: {} },
  tiancai: { id: "tiancai", name: "天材", type: "material", rarity: "宝品", desc: "天地孕育的奇材。", effect: {} },
  // 宝物
  xumi_jie: { id: "xumi_jie", name: "须弥戒", type: "treasure", rarity: "灵品", desc: "储物法器，内含芥子空间。", effect: {} },
  hunyuan_zhu: { id: "hunyuan_zhu", name: "混元珠", type: "treasure", rarity: "仙品", desc: "蕴含混元之力的宝珠，可加速修炼。", effect: {} },
  taixujing: { id: "taixujing", name: "太虚镜", type: "treasure", rarity: "仙品", desc: "可照见虚妄，洞察万物本源。", effect: {} },
  // 武器
  tie_jian: { id: "tie_jian", name: "铁剑", type: "weapon", rarity: "凡品", desc: "普通铁剑，锋利一般。", effect: {} },
  feijian: { id: "feijian", name: "飞剑", type: "weapon", rarity: "灵品", desc: "可御剑飞行的法器。", effect: {} },
  // 防具
  buyi: { id: "buyi", name: "布衣", type: "armor", rarity: "凡品", desc: "寻常布衣。", effect: {} },
  // 灵石 (特殊货币)
  spirit_stone: { id: "spirit_stone", name: "灵石", type: "material", rarity: "灵品", desc: "修仙界的通用货币。", effect: {} }
};

// 国家
const COUNTRIES = {
  dazhou: { id: "dazhou", name: "大周皇朝", region: "zhongyuan", desc: "中原正统皇朝，绵延八百年，国力鼎盛。", level: "皇朝" },
  xuanming: { id: "xuanming", name: "玄冥国", region: "zhongyuan", desc: "崇尚玄冥之道的古国。", level: "王国" },
  nanman_wang: { id: "nanman_wang", name: "南蛮王庭", region: "nanman", desc: "蛮族部落联盟的最高政权。", level: "王庭" },
  xirong_han: { id: "xirong_han", name: "西戎汗国", region: "xirong", desc: "戈壁上的游牧汗国。", level: "汗国" },
  beidi_guo: { id: "beidi_guo", name: "北狄冰国", region: "beidi", desc: "冰原上的苦寒国度。", level: "王国" },
  dongyi_lian: { id: "dongyi_lian", name: "东夷群岛联盟", region: "dongyi", desc: "海岛城邦的松散联盟。", level: "联盟" }
};

// 宗门
const SECTS = {
  qingyun: { id: "qingyun", name: "青云宗", region: "zhongyuan", desc: "中原七大正道之首，剑修圣地。", level: "圣地" },
  tianyin: { id: "tianyin", name: "天音寺", region: "zhongyuan", desc: "佛道大宗，普度众生。", level: "圣地" },
  wanfa: { id: "wanfa", name: "万法宫", region: "zhongyuan", desc: "儒道正宗，以文入道。", level: "圣地" },
  heihun: { id: "heihun", name: "黑魂教", region: "youyu", desc: "幽域魔修大教，行事诡秘。", level: "魔教" },
  longgong: { id: "longgong", name: "龙宫", region: "wujinhaiyang", desc: "龙族统治的海底国度。", level: "龙族" },
  jianzhong: { id: "jianzhong", name: "剑冢", region: "zhufengjing", desc: "逐风境中的剑修秘境。", level: "秘境" }
};

// 修仙者 NPC
const CULTIVATORS = {
  qingyun_zhanglao: { id: "qingyun_zhanglao", name: "青云长老", sect: "qingyun", realm: "化神期", desc: "青云宗的太上长老，实力深不可测。" },
  mo_dao_ren: { id: "mo_dao_ren", name: "墨道人", sect: null, realm: "元婴期", desc: "游历天下的散修，精通炼器。" },
  bai_gu_lao_zu: { id: "bai_gu_lao_zu", name: "白骨老祖", sect: "heihun", realm: "化神期", desc: "黑魂教的护教老祖，修白骨大法。" },
  long_wang: { id: "long_wang", name: "东海龙王", sect: "longgong", realm: "渡劫期", desc: "东海龙族之王，威震四海。" }
};

// 获取物品信息
function getItem(itemId) {
  return ITEMS[itemId] || null;
}
// 获取物品显示信息
function getItemInfo(itemId) {
  const item = ITEMS[itemId];
  if (!item) return { name: itemId, type: "未知", rarity: "凡品", desc: "" };
  return item;
}

// 境界总数量
const TOTAL_REALMS = 13;
const SUB_REALM_COUNT = 4;

// 计算境界进度所需修为（每个小境界）
// 公式: base * (realmIndex + 1) * (subRealmIndex + 1) * growthFactor
function getRequirement(realmIndex, subRealmIndex) {
  const base = 100;
  const growth = 2.5;
  return Math.floor(base * Math.pow(growth, realmIndex) * (subRealmIndex + 1));
}

// 获取境界全名
function getRealmName(pathId, realmIndex, subRealmIndex) {
  const path = PATHS[pathId];
  if (!path) return "未知";
  const realm = path.realms[realmIndex] || "未知";
  const sub = SUB_REALMS[subRealmIndex] || "";
  return `${realm}${sub}`;
}

// 获取路径列表
function getPathList() {
  return Object.values(PATHS);
}

// 获取主流流派
function getMainstreamPaths() {
  return Object.values(PATHS).filter(p => p.type === "mainstream");
}

// 获取小众流派
function getNichePaths() {
  return Object.values(PATHS).filter(p => p.type === "niche");
}

// 获取技能总数
function getSkillCount() {
  return SKILLS.length;
}

// 导出数据（在浏览器环境中通过 window 暴露）
if (typeof window !== 'undefined') {
  window.GameData = {
    GAME_VERSION,
    SAVE_VERSION,
    SUB_REALMS,
    PATHS,
    REGIONS,
    ITEMS,
    COUNTRIES,
    SECTS,
    CULTIVATORS,
    SKILLS,
    SKILL_CATEGORIES,
    TOTAL_REALMS,
    SUB_REALM_COUNT,
    getRequirement,
    getRealmName,
    getPathList,
    getMainstreamPaths,
    getNichePaths,
    getSkillCount,
    getMainRegions,
    getSpecialRegions,
    getAllRegions,
    getItem,
    getItemInfo
  };
}

// Node.js 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GAME_VERSION,
    SAVE_VERSION,
    SUB_REALMS,
    PATHS,
    REGIONS,
    ITEMS,
    COUNTRIES,
    SECTS,
    CULTIVATORS,
    SKILLS,
    SKILL_CATEGORIES,
    TOTAL_REALMS,
    SUB_REALM_COUNT,
    getRequirement,
    getRealmName,
    getPathList,
    getMainstreamPaths,
    getNichePaths,
    getSkillCount,
    getMainRegions,
    getSpecialRegions,
    getAllRegions,
    getItem,
    getItemInfo
  };
}
