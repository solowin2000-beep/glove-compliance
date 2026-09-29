/*
 * 负松量模型 —— 本站唯一的"工厂经验值"来源。
 *
 * 定义：负松量（negative ease）= 成品尺寸比身体围度小多少（%）。
 * 数字为正表示成品比身体小。改这一个文件，工具页和厚度页同时生效。
 *
 * 数据来源：工厂经验值（2026-09 确认版）
 *   0.40mm 基准 12-15%；越厚弹性越小 -> 收得越少，每档约减 2 个点。
 */

export const GARMENT_OPTIONS = [
  { value: 'catsuit', label: 'Full catsuit', icon: 'catsuit' },
  { value: 'neckentry', label: 'Catsuit (neck entry)', icon: 'neckentry' },
  { value: 'dress', label: 'Dress', icon: 'dress' },
  { value: 'top', label: 'Top / shirt', icon: 'top' },
  { value: 'leggings', label: 'Leggings / trousers', icon: 'leggings' },
];

export const THICKNESS_OPTIONS = [
  { value: '0.25', label: '0.25 mm (ultra thin)', icon: 'layers' },
  { value: '0.40', label: '0.40 mm (standard)', icon: 'layers' },
  { value: '0.60', label: '0.60 mm (heavy)', icon: 'layers' },
  { value: '0.80', label: '0.80 mm (rigid)', icon: 'layers' },
  { value: '1.00', label: '1.00 mm (extra rigid)', icon: 'layers' },
];

// 按厚度的围度基础负松量 [最少收, 最多收]
export const EASE_BY_THICKNESS = {
  '0.25': [14, 17],
  '0.40': [12, 15],
  '0.60': [10, 13],
  '0.80': [8, 11],
  '1.00': [6, 9],
};

// 各部位在基础值上的百分点偏移（+ 表示比基础值收得更多）
export const PART_OFFSET = {
  chest: 0,
  underbust: -1,
  waist: 1,
  hip: 0,
  thigh: 2,
  upperArm: 2,
  neck: -5,
};

// 长度方向（躯干长）单独给值，不套用围度公式
export const LENGTH_EASE = [2, 4];

// 松紧偏好对负松量的整体偏移（百分点）
export const TENSION_OFFSET = { relaxed: -2, standard: 0, snug: 2 };

export const PARTS = [
  { id: 'chest', label: 'Chest / bust', note: 'Widest point', icon: 'chest' },
  { id: 'underbust', label: 'Underbust', note: 'Optional for tops and dresses', icon: 'underbust' },
  { id: 'waist', label: 'Waist', note: 'Narrowest point', icon: 'waist' },
  { id: 'hip', label: 'Hip', note: 'Widest point', icon: 'hip' },
  { id: 'thigh', label: 'Thigh', note: 'Upper thigh, widest', icon: 'thigh' },
  { id: 'upperArm', label: 'Upper arm', note: 'Relaxed arm, widest', icon: 'upperarm' },
  { id: 'neck', label: 'Neck', note: 'Base of the neck', icon: 'neck' },
  { id: 'torsoLength', label: 'Torso length', note: 'Side of neck to crotch', icon: 'torsolength', length: true },
];