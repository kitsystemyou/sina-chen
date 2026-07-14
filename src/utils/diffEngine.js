import { diffLines } from 'diff';

// TRPGで重要なキーワード
const TRPG_KEYWORDS = [
  '判定', 'ダイス', '成功', '失敗', '技能', 'ダメージ', 'SAN', '正気度', 
  'HP', 'MP', 'ロール', 'クリティカル', 'ファンブル', 'ボーナス', 'ペナルティ',
  '装甲', '耐久力', '回避', '狂気', 'クトゥルフ', 'STR', 'CON', 'POW', 'DEX', 'APP', 'SIZ', 'INT', 'EDU'
];

export const isTrpgImportant = (text) => {
  if (!text) return false;
  return TRPG_KEYWORDS.some(keyword => text.includes(keyword));
};

export const computeDiff = (oldText, newText) => {
  const diffs = diffLines(oldText || '', newText || '');
  
  // diffの配列を整形して返す
  // 追加、削除、そしてTRPG的に重要かどうかのフラグを付ける
  return diffs.map(part => ({
    value: part.value,
    added: part.added,
    removed: part.removed,
    isImportant: (part.added || part.removed) && isTrpgImportant(part.value)
  }));
};
