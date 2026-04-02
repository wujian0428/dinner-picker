import { AppState, Dish, DailyRecord } from './types';
import { dishesData } from './dishes-data';

const STORAGE_KEY = 'dinner-picker-data';

// 使用菜品数据库作为默认菜品（兼容旧格式数据）
export const defaultDishes: Dish[] = dishesData;

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      // 如果旧数据中没有菜品图片等信息，用数据库里的补充
      if (parsed.dishes && parsed.dishes.length > 0) {
        // 合并：优先用数据库的详细信息覆盖
        const dbMap = new Map(dishesData.map(d => [d.name, d]));
        const mergedDishes = parsed.dishes.map(dish => {
          const dbDish = dbMap.get(dish.name);
          if (dbDish) {
            return { ...dbDish, ...dish, id: dbDish.id }; // 保留用户喜欢的状态
          }
          return dish;
        });
        return { ...parsed, dishes: mergedDishes };
      }
      return parsed;
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

export const difficultyColors: Record<string, string> = {
  '简单': 'bg-green-100 text-green-700',
  '中等': 'bg-yellow-100 text-yellow-700',
  '困难': 'bg-red-100 text-red-700',
};
