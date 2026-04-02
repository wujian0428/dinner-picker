export type Category = '家常菜' | '川菜' | '粤菜' | '日料' | '火锅' | '面食' | '烧烤' | '外卖' | '其他';

export interface Dish {
  id: string;
  name: string;
  category: Category;
  emoji: string;
  liked: boolean;
  tags: string[];
  addedAt: string;
}

export interface DailyRecord {
  date: string;
  selectedDishes: string[];
  note: string;
  mood: '😍' | '😊' | '😐' | '😅';
}

export interface AppState {
  dishes: Dish[];
  records: DailyRecord[];
}
