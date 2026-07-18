import { diffLines } from 'diff';

// TRPGで重要なキーワード
const TRPG_KEYWORDS = [
  '判定', 'ダイス', '成功', '失敗', '技能', 'ダメージ', 'SAN', '正気度', 
  'HP', 'MP', 'ロール', 'クリティカル', 'ファンブル', 'ボーナス', 'ペナルティ',
  '装甲', '耐久力', '回避', '狂気', 'クトゥルフ', 'STR', 'CON', 'POW', 'DEX', 'APP', 'SIZ', 'INT', 'EDU',
  'こぶし', 'キック', '組み付き', '頭突き', '目星', '聞き耳', '図書館', '精神分析', '応急手当'
];

export const isTrpgImportant = (text) => {
  if (!text) return false;
  
  // キーワードの一致確認
  if (TRPG_KEYWORDS.some(keyword => text.includes(keyword))) {
    return true;
  }
  
  // ダイスロール表記 (1d3, 1d6, 1D100など) や ダメージボーナス (db, DB) の正規表現確認
  const diceRegex = /\d+[dD]\d+|[dD][bB]/;
  return diceRegex.test(text);
};

export const computeDiff = (oldText, newText) => {
  const diffs = diffLines(oldText || '', newText || '');
  
  // diffの配列を整形して返す
  // 追加、削除、そしてTRPG的に重要かどうかのフラグを付ける
  return diffs.reduce((acc, part) => {
    // ページマーカーを取り除いた純粋なテキスト
    const textWithoutMarkers = part.value.replace(/\[---PAGE_MARKER:\s*\d+\s*---\]/g, '');
    
    // 空白や改行のみかどうかを判定
    const isOnlyWhitespace = textWithoutMarkers.trim() === '';

    // 空行の追加や削除は差分として表示しない（ノイズになるため除外する）
    if (isOnlyWhitespace && (part.added || part.removed)) {
      return acc;
    }

    acc.push({
      value: part.value,
      added: part.added,
      removed: part.removed,
      isImportant: (part.added || part.removed) && isTrpgImportant(part.value)
    });

    return acc;
  }, []);
};
