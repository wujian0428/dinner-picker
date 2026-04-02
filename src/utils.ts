import { AppState, Dish, DailyRecord } from './types';

const STORAGE_KEY = 'dinner-picker-data';

export const defaultDishes: Dish[] = [
  { id: '1', name: '红烧肉', category: '家常菜', emoji: '🥩', liked: true, tags: ['重口', '下饭'], addedAt: '2026-01-01' },
  { id: '2', name: '番茄炒鸡蛋', category: '家常菜', emoji: '🍅', liked: true, tags: ['清淡', '快手'], addedAt: '2026-01-01' },
  { id: '3', name: '麻婆豆腐', category: '川菜', emoji: '🍲', liked: true, tags: ['辣', '下饭'], addedAt: '2026-01-01' },
  { id: '4', name: '夫妻肺片', category: '川菜', emoji: '🌶️', liked: true, tags: ['辣', '凉菜'], addedAt: '2026-01-01' },
  { id: '5', name: '寿司拼盘', category: '日料', emoji: '🍣', liked: true, tags: ['清淡', '精致'], addedAt: '2026-01-01' },
  { id: '6', name: '牛肉火锅', category: '火锅', emoji: '🫕', liked: true, tags: ['辣', '聚餐'], addedAt: '2026-01-01' },
  { id: '7', name: '阳春面', category: '面食', emoji: '🍜', liked: true, tags: ['清淡', '快手'], addedAt: '2026-01-01' },
  { id: '8', name: '烤串', category: '烧烤', emoji: '🍢', liked: true, tags: ['香', '聚餐'], addedAt: '2026-01-01' },
  { id: '9', name: '蒜蓉虾', category: '粤菜', emoji: '🦐', liked: true, tags: ['鲜', '清淡'], addedAt: '2026-01-01' },
  { id: '10', name: '炸鸡外卖', category: '外卖', emoji: '🍗', liked: true, tags: ['香', '快手'], addedAt: '2026-01-01' },
];

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AppState;
    }
  } catch (e) {
    console.error('Failed to load state', e);
  }
  return { dishes: defaultDishes, records: [] };
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

export function getTodayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function getWeekDay(dateStr: string): string {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  const d = new Date(dateStr);
  return `周${days[d.getDay()]}`;
}

export function randomPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const categoryEmojis: Record<string, string> = {
  '家常菜': '🏠',
  '川菜': '🌶️',
  '粤菜': '🦐',
  '日料': '🍣',
  '火锅': '🫕',
  '面食': '🍜',
  '烧烤': '🔥',
  '外卖': '📦',
  '其他': '✨',
};

export const moodLabels = {
  '😍': '超好吃！',
  '😊': '不错',
  '😐': '一般',
  '😅': '下次换一个',
};

export function getTodayRecord(records: DailyRecord[]): DailyRecord | null {
  const today = getTodayString();
  return records.find(r => r.date === today) || null;
}
