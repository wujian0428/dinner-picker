import { useState, useEffect, useCallback } from 'react';
import { AppState, Dish, DailyRecord, Category } from './types';
import {
  loadState, saveState, getTodayString, formatDate, getWeekDay,
  randomPick, generateId, categoryEmojis, getTodayRecord
} from './utils';
import {
  Shuffle, Plus, Trash2, Heart, BookOpen, ChefHat, Star, Tag, History, X, Check, Pencil
} from 'lucide-react';

type Tab = 'today' | 'dishes' | 'history';

const CATEGORIES: Category[] = ['家常菜', '川菜', '粤菜', '日料', '火锅', '面食', '烧烤', '外卖', '其他'];

const tagSuggestions = ['辣', '清淡', '素食', '荤菜', '快手', '下饭', '重口', '海鲜', '精致', '聚餐'];

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

  // 保存状态到 localStorage
  useEffect(() => {
    saveState(state);
  }, [state]);

  const today = getTodayString();
  const todayRecord = getTodayRecord(state.records);
  const selectedDishes = todayRecord
    ? state.dishes.filter(d => todayRecord.selectedDishes.includes(d.id))
    : [];

  // 随机点菜 - 有抽奖动画
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

  // 手动选/取消某道菜
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

  // 保存今日备注
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

  // 保存心情
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

  // 添加菜品
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

  // 删除菜品
  const deleteDish = (id: string) => {
    setState(prev => ({ ...prev, dishes: prev.dishes.filter(d => d.id !== id) }));
  };

  // 切换喜爱
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
              <p className="text-xs text-gray-400">{formatDate(today)} {getWeekDay(today)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-rose-400 text-sm">❤️</span>
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
                      <button
                        onClick={() => toggleDishSelect(dish.id)}
                        className="text-gray-300 hover:text-rose-400 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 手动从菜单选 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100">
              <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-1">
                <Tag size={16} className="text-blue-400" /> 手动选菜
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {state.dishes.map(dish => {
                  const isSelected = todayRecord?.selectedDishes.includes(dish.id);
                  return (
                    <button
                      key={dish.id}
                      onClick={() => toggleDishSelect(dish.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-left transition-all card-hover ${
                        isSelected
                          ? 'bg-rose-100 border-2 border-rose-400'
                          : 'bg-gray-50 border-2 border-transparent hover:border-rose-200'
                      }`}
                    >
                      <span className="text-lg">{dish.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{dish.name}</p>
                        <p className="text-xs text-gray-400">{dish.category}</p>
                      </div>
                      {isSelected && <Check size={14} className="text-rose-500 flex-shrink-0" />}
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

            {/* 菜品列表 */}
            <div className="grid grid-cols-1 gap-2">
              {filteredDishes.map(dish => (
                <div key={dish.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 card-hover">
                  <span className="text-2xl w-10 text-center">{dish.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-medium text-gray-700 text-sm">{dish.name}</span>
                      {dish.liked && <span className="text-rose-400 text-xs">❤️</span>}
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                        {categoryEmojis[dish.category]} {dish.category}
                      </span>
                      {dish.tags.map(tag => (
                        <span key={tag} className="text-xs text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleLike(dish.id)}
                      className={`p-1.5 rounded-full transition-all ${dish.liked ? 'text-rose-400' : 'text-gray-300'}`}
                    >
                      <Heart size={16} fill={dish.liked ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => deleteDish(dish.id)}
                      className="p-1.5 rounded-full text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {filteredDishes.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p className="text-sm">还没有菜品，快添加吧！</p>
                </div>
              )}
            </div>
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
                        <span key={dish.id} className="text-xs bg-rose-50 text-rose-600 px-2 py-1 rounded-full">
                          {dish.emoji} {dish.name}
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
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-rose-400 to-orange-400 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
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
    </div>
  );
}
