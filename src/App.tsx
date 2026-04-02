import { useState, useEffect, useCallback } from 'react';
import { AppState, Dish, DailyRecord, Category, RecipeStep } from './types';
import {
  loadState, saveState, getTodayString, formatDate, getWeekDay,
  randomPick, generateId, categoryEmojis, getTodayRecord, difficultyColors
} from './utils';
import {
  Shuffle, Plus, Trash2, Heart, BookOpen, ChefHat, Star, Tag, History, X, Check, Pencil,
  Clock, Users, ChefHat as ChefHatIcon, BookText, ArrowLeft, Image as ImageIcon
} from 'lucide-react';

// ========== 菜谱详情弹窗 ==========
function RecipeModal({ dish, onClose }: { dish: Dish; onClose: () => void }) {
  const hasRecipe = dish.ingredients && dish.steps && dish.steps.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg mx-auto rounded-t-3xl max-h-[92vh] overflow-y-auto bounce-in"
        onClick={e => e.stopPropagation()}
      >
        {/* 顶部图片 */}
        {dish.image && (
          <div className="relative">
            <img
              src={dish.image}
              alt={dish.name}
              className="w-full h-52 object-cover rounded-t-3xl"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X size={16} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <h2 className="text-xl font-bold text-white">{dish.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
                  {categoryEmojis[dish.category]} {dish.category}
                </span>
                {dish.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-sm text-white/80 bg-white/20 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 无图片时的标题 */}
        {!dish.image && (
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{dish.emoji}</span>
              <h2 className="text-xl font-bold text-gray-800">{dish.name}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
        )}

        <div className="p-4">
          {/* 简介 & 基本信息 */}
          {dish.description && (
            <p className="text-gray-600 text-sm mb-3">{dish.description}</p>
          )}
          {(dish.prepTime || dish.cookTime || dish.servings || dish.difficulty) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {dish.prepTime && (
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                  <Clock size={12} /> 备 {dish.prepTime}
                </div>
              )}
              {dish.cookTime && (
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                  <ChefHatIcon size={12} /> 烹 {dish.cookTime}
                </div>
              )}
              {dish.servings && (
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                  <Users size={12} /> {dish.servings}人份
                </div>
              )}
              {dish.difficulty && (
                <div className={`text-xs px-3 py-1.5 rounded-full ${difficultyColors[dish.difficulty] || 'bg-gray-100 text-gray-600'}`}>
                  {dish.difficulty}
                </div>
              )}
            </div>
          )}

          {/* 菜谱内容 */}
          {hasRecipe ? (
            <>
              {/* 食材清单 */}
              {dish.ingredients && dish.ingredients.length > 0 && (
                <div className="mb-5">
                  <h3 className="font-bold text-gray-700 flex items-center gap-1.5 mb-2">
                    <BookText size={15} className="text-rose-400" />
                    食材清单
                  </h3>
                  <div className="bg-orange-50 rounded-xl p-3">
                    <ul className="grid grid-cols-2 gap-1.5">
                      {dish.ingredients.map((ing, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-1.5">
                          <span className="text-rose-400 mt-0.5">·</span>
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 步骤 */}
              {dish.steps && dish.steps.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-700 flex items-center gap-1.5 mb-3">
                    <BookText size={15} className="text-rose-400" />
                    制作步骤
                  </h3>
                  <div className="space-y-4">
                    {dish.steps.map((step: RecipeStep) => (
                      <div key={step.step} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {step.step}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-700 text-sm mb-1.5">{step.title}</p>
                            <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                            {step.image && (
                              <img
                                src={step.image}
                                alt={`步骤${step.step}`}
                                className="mt-2 w-full h-36 object-cover rounded-lg"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <BookText size={40} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">暂无详细菜谱</p>
              <p className="text-xs mt-1">期待下次更新~</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== 主应用 ==========
type Tab = 'today' | 'dishes' | 'history';

const CATEGORIES: Category[] = ['家常菜', '川菜', '粤菜', '日料', '火锅', '面食', '烧烤', '外卖', '其他'];
const tagSuggestions = ['辣', '清淡', '素菜', '荤菜', '快手', '下饭', '重口', '海鲜', '精致', '聚餐', '养生', '孩子爱'];

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [tab, setTab] = useState<Tab>('today');
  const [rolling, setRolling] = useState(false);
  const [rollingName, setRollingName] = useState('');
  const [showAddDish, setShowAddDish] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', category: '家常菜' as Category, emoji: '🍽️', tags: [] as string[], tagInput: '' });
  const [filterCat, setFilterCat] = useState<Category | 'all'>('all');
  const [noteInput, setNoteInput] = useState('');
  const [editingNote, setEditingNote] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    saveState(state);
  }, [state]);

  const today = getTodayString();
  const todayRecord = getTodayRecord(state.records);
  const selectedDishes = todayRecord
    ? state.dishes.filter(d => todayRecord.selectedDishes.includes(d.id))
    : [];

  const handleRandomPick = useCallback(() => {
    if (rolling || state.dishes.length === 0) return;
    setRolling(true);
    const candidates = state.dishes;
    let count = 0;
    const maxCount = 20;
    const interval = setInterval(() => {
      const randomDish = candidates[Math.floor(Math.random() * candidates.length)];
      setRollingName(randomDish.emoji + ' ' + randomDish.name);
      count++;
      if (count >= maxCount) {
        clearInterval(interval);
        const picked = randomPick(candidates, 3);
        const pickedIds = picked.map(d => d.id);
        setState(prev => {
          const newRecords = prev.records.filter(r => r.date !== today);
          const newRecord: DailyRecord = {
            date: today,
            selectedDishes: pickedIds,
            note: todayRecord?.note || '',
            mood: todayRecord?.mood || '😊',
          };
          return { ...prev, records: [...newRecords, newRecord] };
        });
        setRolling(false);
        setRollingName('');
      }
    }, 80);
  }, [rolling, state.dishes, today, todayRecord]);

  const toggleDishSelect = (dishId: string) => {
    setState(prev => {
      const existing = prev.records.find(r => r.date === today);
      let newSelected: string[];
      if (existing) {
        newSelected = existing.selectedDishes.includes(dishId)
          ? existing.selectedDishes.filter(id => id !== dishId)
          : [...existing.selectedDishes, dishId];
        const newRecords = prev.records.map(r =>
          r.date === today ? { ...r, selectedDishes: newSelected } : r
        );
        return { ...prev, records: newRecords };
      } else {
        const newRecord: DailyRecord = {
          date: today,
          selectedDishes: [dishId],
          note: '',
          mood: '😊',
        };
        return { ...prev, records: [...prev.records, newRecord] };
      }
    });
  };

  const saveNote = () => {
    setState(prev => {
      const existing = prev.records.find(r => r.date === today);
      if (existing) {
        const newRecords = prev.records.map(r =>
          r.date === today ? { ...r, note: noteInput } : r
        );
        return { ...prev, records: newRecords };
      } else {
        const newRecord: DailyRecord = {
          date: today,
          selectedDishes: [],
          note: noteInput,
          mood: '😊',
        };
        return { ...prev, records: [...prev.records, newRecord] };
      }
    });
    setEditingNote(false);
  };

  const saveMood = (mood: DailyRecord['mood']) => {
    setState(prev => {
      const existing = prev.records.find(r => r.date === today);
      if (existing) {
        const newRecords = prev.records.map(r =>
          r.date === today ? { ...r, mood } : r
        );
        return { ...prev, records: newRecords };
      } else {
        const newRecord: DailyRecord = {
          date: today,
          selectedDishes: [],
          note: '',
          mood,
        };
        return { ...prev, records: [...prev.records, newRecord] };
      }
    });
    setShowMoodPicker(false);
  };

  const handleAddDish = () => {
    if (!addForm.name.trim()) return;
    const newDish: Dish = {
      id: generateId(),
      name: addForm.name.trim(),
      category: addForm.category,
      emoji: addForm.emoji,
      liked: true,
      tags: addForm.tags,
      addedAt: today,
    };
    setState(prev => ({ ...prev, dishes: [...prev.dishes, newDish] }));
    setAddForm({ name: '', category: '家常菜', emoji: '🍽️', tags: [], tagInput: '' });
    setShowAddDish(false);
  };

  const deleteDish = (id: string) => {
    setState(prev => ({ ...prev, dishes: prev.dishes.filter(d => d.id !== id) }));
  };

  const toggleLike = (id: string) => {
    setState(prev => ({
      ...prev,
      dishes: prev.dishes.map(d => d.id === id ? { ...d, liked: !d.liked } : d)
    }));
  };

  const filteredDishes = filterCat === 'all'
    ? state.dishes
    : state.dishes.filter(d => d.category === filterCat);

  const sortedHistory = [...state.records]
    .filter(r => r.date !== today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 14);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-pink-50">
      {/* 顶部标题栏 */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍜</span>
            <div>
              <h1 className="text-lg font-bold text-rose-500 leading-tight">今晚吃什么</h1>
              <p className="text-xs text-gray-400">{formatDate(today)} {getWeekDay(today)} · {state.dishes.length}道菜</p>
            </div>
          </div>
        </div>
        {/* Tab 切换 */}
        <div className="max-w-lg mx-auto px-4 pb-2 flex gap-1">
          {([
            { key: 'today', label: '今日', icon: <ChefHat size={14} /> },
            { key: 'dishes', label: '菜单', icon: <BookOpen size={14} /> },
            { key: 'history', label: '历史', icon: <History size={14} /> },
          ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-gray-500 hover:bg-rose-50'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 pb-24">

        {/* ===== 今日点菜 ===== */}
        {tab === 'today' && (
          <div className="space-y-4">
            {/* 随机抽取卡片 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-rose-100">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-400 mb-1">今晚想吃什么？</p>
                <div className={`text-2xl font-bold text-rose-500 min-h-[2rem] ${rolling ? 'lottery-rolling' : ''}`}>
                  {rolling ? rollingName : (selectedDishes.length > 0 ? '菜单已选好 🎉' : '点击随机决定')}
                </div>
              </div>
              <button
                onClick={handleRandomPick}
                disabled={rolling}
                className={`w-full py-3 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all ${
                  rolling
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-rose-400 to-orange-400 hover:from-rose-500 hover:to-orange-500 shadow-md hover:shadow-lg active:scale-95'
                }`}
              >
                <Shuffle size={18} className={rolling ? 'animate-spin' : ''} />
                {rolling ? '抽签中...' : '随机点菜'}
              </button>
            </div>

            {/* 今日选中的菜 */}
            {selectedDishes.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-700 flex items-center gap-1">
                    <Star size={16} className="text-amber-400" /> 今晚菜单
                  </h3>
                  <span className="text-xs text-gray-400">{selectedDishes.length} 道菜</span>
                </div>
                <div className="space-y-2">
                  {selectedDishes.map(dish => (
                    <div key={dish.id} className="flex items-center justify-between p-2.5 bg-rose-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{dish.emoji}</span>
                        <div>
                          <p className="font-medium text-gray-700 text-sm">{dish.name}</p>
                          <p className="text-xs text-gray-400">{dish.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedDish(dish)}
                          className="text-rose-400 hover:bg-rose-100 p-1.5 rounded-full transition-colors text-xs flex items-center gap-0.5"
                          title="查看菜谱"
                        >
                          <BookText size={14} /> 菜谱
                        </button>
                        <button
                          onClick={() => toggleDishSelect(dish.id)}
                          className="text-gray-300 hover:text-rose-400 transition-colors p-1.5"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 手动从菜单选 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-700 flex items-center gap-1">
                  <Tag size={16} className="text-blue-400" /> 手动选菜
                </h3>
                <button
                  onClick={() => setTab('dishes')}
                  className="text-xs text-rose-500 hover:text-rose-600"
                >
                  全部 {state.dishes.length} 道 →
                </button>
              </div>
              {/* 菜品图片网格 */}
              <div className="grid grid-cols-4 gap-2">
                {state.dishes.slice(0, 16).map(dish => {
                  const isSelected = todayRecord?.selectedDishes.includes(dish.id);
                  return (
                    <button
                      key={dish.id}
                      onClick={() => toggleDishSelect(dish.id)}
                      className={`relative flex flex-col items-center rounded-xl overflow-hidden transition-all card-hover ${
                        isSelected
                          ? 'ring-2 ring-rose-400 ring-offset-1'
                          : 'ring-1 ring-gray-100 hover:ring-rose-200'
                      }`}
                    >
                      {/* 菜品图片 */}
                      <div className="w-full aspect-square bg-gray-100 overflow-hidden relative">
                        {dish.image ? (
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.style.background = 'linear-gradient(135deg, #fee2e2, #fed7aa)';
                              const span = document.createElement('span');
                              span.textContent = dish.emoji;
                              span.className = 'text-2xl';
                              span.style.position = 'absolute';
                              span.style.top = '50%';
                              span.style.left = '50%';
                              span.style.transform = 'translate(-50%,-50%)';
                              target.parentElement!.appendChild(span);
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
                            <span className="text-2xl">{dish.emoji}</span>
                          </div>
                        )}
                        {/* 已选标记 */}
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center shadow">
                            <Check size={11} className="text-white" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      {/* 菜名 */}
                      <p className={`text-xs font-medium py-1 px-1 w-full text-center truncate ${
                        isSelected ? 'text-rose-600 bg-rose-50' : 'text-gray-600'
                      }`}>
                        {dish.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 今日备注 & 心情 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-700 flex items-center gap-1">
                  <Heart size={16} className="text-rose-400" /> 今日记录
                </h3>
                <button
                  onClick={() => setShowMoodPicker(true)}
                  className="text-2xl hover:scale-110 transition-transform"
                >
                  {todayRecord?.mood || '😊'}
                </button>
              </div>
              {editingNote ? (
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-rose-300"
                    placeholder="今天吃得怎么样？记录一下~"
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveNote()}
                    autoFocus
                  />
                  <button onClick={saveNote} className="bg-rose-500 text-white rounded-lg px-3 py-1.5 text-sm">保存</button>
                  <button onClick={() => setEditingNote(false)} className="text-gray-400 px-2">取消</button>
                </div>
              ) : (
                <button
                  onClick={() => { setNoteInput(todayRecord?.note || ''); setEditingNote(true); }}
                  className="w-full text-left text-sm text-gray-400 bg-gray-50 rounded-lg px-3 py-2 hover:bg-rose-50 transition-colors flex items-center gap-2"
                >
                  <Pencil size={12} />
                  {todayRecord?.note || '添加今日备注...'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ===== 菜品库 ===== */}
        {tab === 'dishes' && (
          <div className="space-y-4">
            {/* 分类筛选 */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setFilterCat('all')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filterCat === 'all' ? 'bg-rose-500 text-white' : 'bg-white text-gray-500 border'
                }`}
              >
                全部 {state.dishes.length}
              </button>
              {CATEGORIES.map(cat => {
                const count = state.dishes.filter(d => d.category === cat).length;
                if (count === 0) return null;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCat(cat)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      filterCat === cat ? 'bg-rose-500 text-white' : 'bg-white text-gray-500 border'
                    }`}
                  >
                    {categoryEmojis[cat]} {cat} {count}
                  </button>
                );
              })}
            </div>

            {/* 切换视图 & 数量 */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">{filteredDishes.length} 道菜</p>
              <div className="flex gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-rose-100 text-rose-500' : 'text-gray-400'}`}
                  title="网格视图"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="1" width="6" height="6" rx="1"/>
                    <rect x="9" y="1" width="6" height="6" rx="1"/>
                    <rect x="1" y="9" width="6" height="6" rx="1"/>
                    <rect x="9" y="9" width="6" height="6" rx="1"/>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-rose-100 text-rose-500' : 'text-gray-400'}`}
                  title="列表视图"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="2" width="14" height="2" rx="1"/>
                    <rect x="1" y="7" width="14" height="2" rx="1"/>
                    <rect x="1" y="12" width="14" height="2" rx="1"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* 菜品网格视图 */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 gap-3">
                {filteredDishes.map(dish => (
                  <div
                    key={dish.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover"
                    onClick={() => setSelectedDish(dish)}
                  >
                    {dish.image ? (
                      <div className="relative h-28 overflow-hidden">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleLike(dish.id); }}
                          className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                            dish.liked ? 'bg-rose-500 text-white' : 'bg-white/70 text-gray-400'
                          }`}
                        >
                          <Heart size={12} fill={dish.liked ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
                        <span className="text-3xl">{dish.emoji}</span>
                      </div>
                    )}
                    <div className="p-2.5">
                      <p className="font-medium text-gray-700 text-sm truncate">{dish.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">{categoryEmojis[dish.category]} {dish.category}</span>
                        {dish.difficulty && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${difficultyColors[dish.difficulty]}`}>
                            {dish.difficulty}
                          </span>
                        )}
                      </div>
                      {dish.cookTime && (
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock size={10} /> {dish.cookTime}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 菜品列表视图 */}
            {viewMode === 'list' && (
              <div className="space-y-2">
                {filteredDishes.map(dish => (
                  <div
                    key={dish.id}
                    className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 card-hover"
                    onClick={() => setSelectedDish(dish)}
                  >
                    {dish.image ? (
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">{dish.emoji}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-700 text-sm">{dish.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                          {categoryEmojis[dish.category]} {dish.category}
                        </span>
                        {dish.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-xs text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full">{tag}</span>
                        ))}
                      </div>
                      {dish.cookTime && (
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock size={10} /> {dish.cookTime}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {dish.ingredients && dish.steps && (
                        <span className="text-xs text-rose-400 bg-rose-50 px-2 py-1 rounded-full flex items-center gap-0.5">
                          <BookText size={11} /> 菜谱
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(dish.id); }}
                        className={`p-1.5 rounded-full transition-all ${dish.liked ? 'text-rose-400' : 'text-gray-300'}`}
                      >
                        <Heart size={15} fill={dish.liked ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteDish(dish.id); }}
                        className="p-1.5 rounded-full text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredDishes.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">🍽️</div>
                <p className="text-sm">还没有菜品，快添加吧！</p>
              </div>
            )}
          </div>
        )}

        {/* ===== 历史记录 ===== */}
        {tab === 'history' && (
          <div className="space-y-3">
            {sortedHistory.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">📅</div>
                <p className="text-sm">还没有历史记录</p>
                <p className="text-xs mt-1">每天点菜后这里会有记录</p>
              </div>
            ) : (
              sortedHistory.map(record => {
                const dishes = state.dishes.filter(d => record.selectedDishes.includes(d.id));
                return (
                  <div key={record.date} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-hover">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-bold text-gray-700">{formatDate(record.date)}</span>
                        <span className="text-xs text-gray-400 ml-1">{getWeekDay(record.date)}</span>
                      </div>
                      <span className="text-xl">{record.mood}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {dishes.length > 0 ? dishes.map(dish => (
                        <span key={dish.id} className="text-xs bg-rose-50 text-rose-600 px-2 py-1 rounded-full flex items-center gap-1">
                          {dish.emoji} {dish.name}
                          <button
                            onClick={() => setSelectedDish(dish)}
                            className="text-rose-400 hover:text-rose-600"
                          >
                            <BookText size={10} />
                          </button>
                        </span>
                      )) : (
                        <span className="text-xs text-gray-400">当天未选菜</span>
                      )}
                    </div>
                    {record.note && (
                      <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1.5 italic">
                        💬 {record.note}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* 底部悬浮添加按钮 (菜单页显示) */}
      {tab === 'dishes' && (
        <button
          onClick={() => setShowAddDish(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-rose-400 to-orange-400 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-20"
        >
          <Plus size={24} />
        </button>
      )}

      {/* 添加菜品弹窗 */}
      {showAddDish && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowAddDish(false)}>
          <div
            className="bg-white rounded-t-3xl p-6 w-full max-w-lg bounce-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700 text-lg">添加菜品</h3>
              <button onClick={() => setShowAddDish(false)} className="text-gray-400"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="w-14">
                  <input
                    className="w-full text-center text-2xl border border-gray-200 rounded-xl py-2 focus:outline-none focus:border-rose-300"
                    value={addForm.emoji}
                    onChange={e => setAddForm(f => ({ ...f, emoji: e.target.value }))}
                    maxLength={2}
                  />
                </div>
                <input
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-300"
                  placeholder="菜名，如：红烧肉"
                  value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">分类</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setAddForm(f => ({ ...f, category: cat }))}
                      className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                        addForm.category === cat
                          ? 'bg-rose-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-rose-50'
                      }`}
                    >
                      {categoryEmojis[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">标签（点击添加）</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tagSuggestions.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setAddForm(f => ({
                        ...f,
                        tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
                      }))}
                      className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                        addForm.tags.includes(tag)
                          ? 'bg-orange-400 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleAddDish}
                disabled={!addForm.name.trim()}
                className="w-full py-3 bg-gradient-to-r from-rose-400 to-orange-400 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 心情选择弹窗 */}
      {showMoodPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowMoodPicker(false)}>
          <div className="bg-white rounded-2xl p-6 shadow-xl bounce-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-700 text-center mb-4">今天的用餐心情</h3>
            <div className="flex gap-4">
              {(['😍', '😊', '😐', '😅'] as DailyRecord['mood'][]).map(mood => (
                <button
                  key={mood}
                  onClick={() => saveMood(mood)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:bg-rose-50 ${
                    todayRecord?.mood === mood ? 'bg-rose-100 scale-110' : ''
                  }`}
                >
                  <span className="text-3xl">{mood}</span>
                  <span className="text-xs text-gray-500">
                    {mood === '😍' ? '超好吃' : mood === '😊' ? '不错' : mood === '😐' ? '一般' : '换一个'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 菜谱详情弹窗 */}
      {selectedDish && (
        <RecipeModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
      )}
    </div>
  );
}
