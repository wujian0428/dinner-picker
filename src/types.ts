export type Category = '家常菜' | '川菜' | '粤菜' | '日料' | '火锅' | '面食' | '烧烤' | '外卖' | '其他';

export type Difficulty = '简单' | '中等' | '困难';

export interface RecipeStep {
  step: number;
  title: string;
  description: string;
  image?: string;
}

export interface Dish {
  id: string;
  name: string;
  category: Category;
  emoji: string;
  liked: boolean;
  tags: string[];
  addedAt: string;
  // 新增：菜谱信息
  image?: string;           // 封面图 URL
  prepTime?: string;       // 准备时间，如 "10分钟"
  cookTime?: string;       // 烹饪时间，如 "20分钟"
  servings?: number;       // 份量/人份
  difficulty?: Difficulty;
  description?: string;    // 一句话简介
  ingredients?: string[];  // 食材清单
  steps?: RecipeStep[];     // 详细步骤
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
