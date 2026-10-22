import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Clock, 
  Flame, 
  Utensils, 
  ChevronRight, 
  ChevronDown,
  X, 
  MapPin, 
  Tag, 
  Plus, 
  PlusCircle,
  Calendar,
  Sparkles, 
  ChefHat,
  Camera,
  Upload,
  Heart,
  Trash2,
  Pencil,
  Check,
  Image as ImageIcon,
  Mic,
  Square,
  Play,
  Pause,
  Volume2,
  Share2
} from 'lucide-react';
import { Recipe, Ingredient, MealCategory, Region, MealSlot } from '../types';
import { matchesRecipeSearch, matchesSearchTerm, normalizeSearchString } from '../utils/textUtils';
import { SafeImage } from './SafeImage';
import { shareCustomRecipe } from './RecipeDetailModal';

const BASE_VIETNAMESE_INGREDIENTS: Ingredient[] = [
  // Rau củ & Rau thơm
  { name: 'Rau muống', amount: 1, unit: 'bó', category: 'rau-cu' },
  { name: 'Rau mồng tơi', amount: 1, unit: 'bó', category: 'rau-cu' },
  { name: 'Rau mùi / Ngò rí', amount: 1, unit: 'mớ', category: 'rau-cu' },
  { name: 'Rau mùi tàu / Ngò gai', amount: 1, unit: 'mớ', category: 'rau-cu' },
  { name: 'Rau má', amount: 1, unit: 'bó', category: 'rau-cu' },
  { name: 'Rau mầm', amount: 1, unit: 'hộp', category: 'rau-cu' },
  { name: 'Rau ngót', amount: 1, unit: 'bó', category: 'rau-cu' },
  { name: 'Rau đay', amount: 1, unit: 'bó', category: 'rau-cu' },
  { name: 'Rau lang', amount: 1, unit: 'bó', category: 'rau-cu' },
  { name: 'Rau dền', amount: 1, unit: 'bó', category: 'rau-cu' },
  { name: 'Rau cải ngọt', amount: 1, unit: 'bó', category: 'rau-cu' },
  { name: 'Rau cải thìa', amount: 1, unit: 'bó', category: 'rau-cu' },
  { name: 'Rau cải xanh / Cải bẹ', amount: 1, unit: 'bó', category: 'rau-cu' },
  { name: 'Rau cải cúc / Tần ô', amount: 1, unit: 'bó', category: 'rau-cu' },
  { name: 'Rau cần nước', amount: 1, unit: 'bó', category: 'rau-cu' },
  { name: 'Rau rút / Rau nhút', amount: 1, unit: 'bó', category: 'rau-cu' },
  { name: 'Rau răm', amount: 1, unit: 'mớ', category: 'rau-cu' },
  { name: 'Rau húng quế', amount: 1, unit: 'mớ', category: 'rau-cu' },
  { name: 'Rau kinh giới', amount: 1, unit: 'mớ', category: 'rau-cu' },
  { name: 'Rau tía tô', amount: 1, unit: 'mớ', category: 'rau-cu' },
  { name: 'Rau ngổ / Ngò om', amount: 1, unit: 'mớ', category: 'rau-cu' },
  { name: 'Rau thì là', amount: 1, unit: 'mớ', category: 'rau-cu' },
  { name: 'Bắp cải', amount: 0.5, unit: 'cái', category: 'rau-cu' },
  { name: 'Cải thảo', amount: 1, unit: 'cây', category: 'rau-cu' },
  { name: 'Súp lơ xanh / Bông cải xanh', amount: 1, unit: 'bông', category: 'rau-cu' },
  { name: 'Bầu tươi', amount: 1, unit: 'quả', category: 'rau-cu' },
  { name: 'Bí đao', amount: 1, unit: 'quả', category: 'rau-cu' },
  { name: 'Bí đỏ', amount: 300, unit: 'g', category: 'rau-cu' },
  { name: 'Mướp hương', amount: 1, unit: 'quả', category: 'rau-cu' },
  { name: 'Khổ qua / Mướp đắng', amount: 2, unit: 'quả', category: 'rau-cu' },
  { name: 'Su su', amount: 2, unit: 'quả', category: 'rau-cu' },
  { name: 'Su hào', amount: 1, unit: 'củ', category: 'rau-cu' },
  { name: 'Cà chua', amount: 3, unit: 'quả', category: 'rau-cu' },
  { name: 'Cà tím', amount: 2, unit: 'quả', category: 'rau-cu' },
  { name: 'Dưa leo / Dưa chuột', amount: 2, unit: 'quả', category: 'rau-cu' },
  { name: 'Dưa cải chua', amount: 300, unit: 'g', category: 'rau-cu' },
  { name: 'Cà rốt', amount: 1, unit: 'củ', category: 'rau-cu' },
  { name: 'Khoai tây', amount: 3, unit: 'củ', category: 'rau-cu' },
  { name: 'Khoai sọ / Khoai môn', amount: 300, unit: 'g', category: 'rau-cu' },
  { name: 'Củ cải trắng', amount: 1, unit: 'củ', category: 'rau-cu' },
  { name: 'Măng chua / Măng tươi', amount: 300, unit: 'g', category: 'rau-cu' },
  { name: 'Giá đỗ', amount: 200, unit: 'g', category: 'rau-cu' },
  { name: 'Đậu bắp', amount: 200, unit: 'g', category: 'rau-cu' },
  { name: 'Đậu cô ve', amount: 200, unit: 'g', category: 'rau-cu' },
  { name: 'Dọc mùng / Bạc hà', amount: 2, unit: 'nhánh', category: 'rau-cu' },
  { name: 'Thơm / Dứa', amount: 0.5, unit: 'quả', category: 'rau-cu' },
  { name: 'Nấm rơm', amount: 150, unit: 'g', category: 'rau-cu' },
  { name: 'Nấm hương', amount: 50, unit: 'g', category: 'rau-cu' },
  { name: 'Nấm kim châm', amount: 1, unit: 'gói', category: 'rau-cu' },
  { name: 'Mộc nhĩ / Nấm mèo', amount: 30, unit: 'g', category: 'rau-cu' },
  { name: 'Hành lá', amount: 1, unit: 'mớ', category: 'rau-cu' },
  { name: 'Hành tây', amount: 1, unit: 'củ', category: 'rau-cu' },

  // Thịt, Cá & Hải sản
  { name: 'Thịt ba chỉ', amount: 500, unit: 'g', category: 'thit-ca' },
  { name: 'Thịt nạc vai', amount: 400, unit: 'g', category: 'thit-ca' },
  { name: 'Thịt chân giò', amount: 500, unit: 'g', category: 'thit-ca' },
  { name: 'Thịt heo xay / Thịt băm', amount: 300, unit: 'g', category: 'thit-ca' },
  { name: 'Sườn non heo', amount: 500, unit: 'g', category: 'thit-ca' },
  { name: 'Thịt bò thăn', amount: 300, unit: 'g', category: 'thit-ca' },
  { name: 'Thịt bắp bò', amount: 400, unit: 'g', category: 'thit-ca' },
  { name: 'Thịt gà ta', amount: 0.5, unit: 'con', category: 'thit-ca' },
  { name: 'Cánh gà / Đùi gà', amount: 500, unit: 'g', category: 'thit-ca' },
  { name: 'Thịt vịt', amount: 0.5, unit: 'con', category: 'thit-ca' },
  { name: 'Cá bống', amount: 400, unit: 'g', category: 'thit-ca' },
  { name: 'Cá lóc / Cá quả', amount: 1, unit: 'con', category: 'thit-ca' },
  { name: 'Cá trắm cắt khúc', amount: 500, unit: 'g', category: 'thit-ca' },
  { name: 'Cá điêu hồng', amount: 1, unit: 'con', category: 'thit-ca' },
  { name: 'Cá thu', amount: 2, unit: 'lát', category: 'thit-ca' },
  { name: 'Cá hồi', amount: 250, unit: 'g', category: 'thit-ca' },
  { name: 'Cá cơm tươi', amount: 300, unit: 'g', category: 'thit-ca' },
  { name: 'Cá hú', amount: 400, unit: 'g', category: 'thit-ca' },
  { name: 'Tôm tươi', amount: 300, unit: 'g', category: 'thit-ca' },
  { name: 'Tôm khô', amount: 50, unit: 'g', category: 'do-kho' },
  { name: 'Cua đồng xay', amount: 300, unit: 'g', category: 'thit-ca' },
  { name: 'Mực ống tươi', amount: 300, unit: 'g', category: 'thit-ca' },
  { name: 'Ngao / Nghêu', amount: 500, unit: 'g', category: 'thit-ca' },
  { name: 'Hến làm sẵn', amount: 300, unit: 'g', category: 'thit-ca' },
  { name: 'Giò sống', amount: 200, unit: 'g', category: 'thit-ca' },

  // Trứng & Đậu
  { name: 'Trứng gà', amount: 4, unit: 'quả', category: 'do-kho' },
  { name: 'Trứng vịt', amount: 4, unit: 'quả', category: 'do-kho' },
  { name: 'Trứng cút', amount: 15, unit: 'quả', category: 'do-kho' },
  { name: 'Đậu phụ / Đậu hũ', amount: 3, unit: 'bìa', category: 'do-kho' },
  { name: 'Đậu hũ non', amount: 1, unit: 'hộp', category: 'do-kho' },
  { name: 'Lạc / Đậu phộng', amount: 100, unit: 'g', category: 'do-kho' },

  // Gia vị & Đồ khô
  { name: 'Hành tím / Hành khô', amount: 3, unit: 'củ', category: 'gia-vi' },
  { name: 'Tỏi', amount: 1, unit: 'củ', category: 'gia-vi' },
  { name: 'Ớt hiểm', amount: 3, unit: 'quả', category: 'gia-vi' },
  { name: 'Gừng tươi', amount: 1, unit: 'nhánh', category: 'gia-vi' },
  { name: 'Riềng tươi', amount: 1, unit: 'củ', category: 'gia-vi' },
  { name: 'Sả cây', amount: 3, unit: 'cây', category: 'gia-vi' },
  { name: 'Nghệ tươi', amount: 1, unit: 'nhánh', category: 'gia-vi' },
  { name: 'Lá chanh', amount: 5, unit: 'lá', category: 'gia-vi' },
  { name: 'Lá lốt', amount: 1, unit: 'bó', category: 'rau-cu' },
  { name: 'Me chua', amount: 1, unit: 'vắt', category: 'gia-vi' },
  { name: 'Quả sấu', amount: 4, unit: 'quả', category: 'gia-vi' },
  { name: 'Nước mắm truyền thống', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
  { name: 'Nước tương / Xì dầu', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
  { name: 'Dầu hào', amount: 1, unit: 'muỗng canh', category: 'gia-vi' },
  { name: 'Mắm tôm', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' },
  { name: 'Mẻ chua', amount: 2, unit: 'muỗng canh', category: 'gia-vi' },
  { name: 'Tiêu sọ / Tiêu xay', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' },
  { name: 'Đường cát / Đường phèn', amount: 1, unit: 'muỗng canh', category: 'gia-vi' },
  { name: 'Nước hàng / Nước màu kho', amount: 1, unit: 'muỗng canh', category: 'gia-vi' },
  { name: 'Nước dừa tươi', amount: 1, unit: 'quả', category: 'gia-vi' },
  { name: 'Nước cốt dừa', amount: 150, unit: 'ml', category: 'gia-vi' },
  { name: 'Hạt nêm', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' },
  { name: 'Muối hạt', amount: 1, unit: 'muỗng cà phê', category: 'gia-vi' }
];

export const RecipeCatalog: React.FC = () => {
  const { recipes, customRecipes, addCustomRecipe, deleteCustomRecipe, setSelectedRecipe, addRecipeToSlot, weeklyPlan, viewMode, openConfirmModal, isRegistered, openAuthModal, showToast, user } = useMealWise();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [visibleLimit, setVisibleLimit] = useState(30);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assigningRecipe, setAssigningRecipe] = useState<Recipe | null>(null);
  const [targetDay, setTargetDay] = useState<string>('mon');
  const [targetSlot, setTargetSlot] = useState<MealSlot>('dinner');
  const [assignDragY, setAssignDragY] = useState<number>(0);
  const assignTouchStartY = useRef<number | null>(null);

  // New / Edit custom recipe form state
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<MealCategory>('mon-man');
  const [newRegion, setNewRegion] = useState<Region>('toan-quoc');
  const [newAuthorNote, setNewAuthorNote] = useState('');
  const [newAuthorVoiceUrl, setNewAuthorVoiceUrl] = useState('');
  const [newAuthorVoiceDurationSec, setNewAuthorVoiceDurationSec] = useState<number>(0);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingElapsedSec, setRecordingElapsedSec] = useState(0);
  const [isPlayingVoicePreview, setIsPlayingVoicePreview] = useState(false);
  const [playingCardVoiceId, setPlayingCardVoiceId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingStartMsRef = useRef<number>(0);
  const speechRecRef = useRef<any>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const [newSecretTips, setNewSecretTips] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [isIngredientDropdownOpen, setIsIngredientDropdownOpen] = useState(false);
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState('');
  const [ingredientCategoryFilter, setIngredientCategoryFilter] = useState<'all' | 'thit-ca' | 'rau-cu' | 'gia-vi' | 'do-kho'>('all');
  const ingredientSearchInputRef = useRef<HTMLInputElement | null>(null);
  const [newCost, setNewCost] = useState('65000');
  const [newCookTime, setNewCookTime] = useState('25');
  const [newCalories, setNewCalories] = useState('450');
  const [newImageUrl, setNewImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Merge BASE_VIETNAMESE_INGREDIENTS with all unique ingredients across system recipes
  const allSystemIngredients = useMemo<Ingredient[]>(() => {
    const map = new Map<string, Ingredient>();
    for (const item of BASE_VIETNAMESE_INGREDIENTS) {
      map.set(normalizeSearchString(item.name), item);
    }
    for (const r of recipes) {
      if (!r.ingredients) continue;
      for (const ing of r.ingredients) {
        if (!ing.name) continue;
        const cleanName = ing.name.trim();
        const key = normalizeSearchString(cleanName);
        if (!key || map.has(key)) continue;
        map.set(key, {
          name: cleanName,
          amount: ing.amount || 1,
          unit: (ing.unit || 'phần').replace(/\s*\([^)]*\)/g, '').trim() || 'phần',
          category: ing.category || 'thit-ca'
        });
      }
    }
    return Array.from(map.values());
  }, [recipes]);

  const filteredSystemIngredients = useMemo<Ingredient[]>(() => {
    const q = ingredientSearchQuery.trim();
    const normQ = normalizeSearchString(q);
    const matches = allSystemIngredients.filter(item => {
      if (ingredientCategoryFilter !== 'all' && item.category !== ingredientCategoryFilter) {
        return false;
      }
      if (!q) return true;
      return matchesSearchTerm(item.name, q);
    });

    if (normQ) {
      matches.sort((a, b) => {
        const aStarts = normalizeSearchString(a.name).startsWith(normQ) ? 0 : 1;
        const bStarts = normalizeSearchString(b.name).startsWith(normQ) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.name.localeCompare(b.name, 'vi');
      });
    }
    return matches;
  }, [allSystemIngredients, ingredientSearchQuery, ingredientCategoryFilter]);

  const isIngredientSelected = (name: string) => {
    const key = normalizeSearchString(name);
    return selectedIngredients.some(i => normalizeSearchString(i.name) === key);
  };

  const handleToggleSelectIngredient = (item: Ingredient) => {
    const key = normalizeSearchString(item.name);
    setSelectedIngredients(prev => {
      const exists = prev.some(i => normalizeSearchString(i.name) === key);
      if (exists) {
        return prev.filter(i => normalizeSearchString(i.name) !== key);
      }
      return [...prev, { ...item }];
    });
  };

  const handleAddCustomSearchIngredient = () => {
    const customName = ingredientSearchQuery.trim();
    if (!customName) return;
    if (!isIngredientSelected(customName)) {
      setSelectedIngredients(prev => [
        ...prev,
        {
          name: customName,
          amount: 1,
          unit: 'phần',
          category: ingredientCategoryFilter === 'all' ? 'thit-ca' : ingredientCategoryFilter
        }
      ]);
    }
    setIngredientSearchQuery('');
  };

  const handleRemoveSelectedIngredient = (index: number) => {
    setSelectedIngredients(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateSelectedIngredientAmount = (index: number, val: string) => {
    const num = parseFloat(val);
    setSelectedIngredients(prev =>
      prev.map((item, idx) => (idx === index ? { ...item, amount: isNaN(num) || num <= 0 ? 1 : num } : item))
    );
  };

  const handleUpdateSelectedIngredientUnit = (index: number, unit: string) => {
    setSelectedIngredients(prev =>
      prev.map((item, idx) => (idx === index ? { ...item, unit } : item))
    );
  };

  const PRESET_DISH_IMAGES = [
    { title: 'Thịt Kho Tàu', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80' },
    { title: 'Cá Kho Tộ', url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80' },
    { title: 'Canh Cua / Chua', url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80' },
    { title: 'Sườn Xào Chua Ngọt', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80' },
    { title: 'Gà Luộc Lá Chanh', url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80' },
    { title: 'Rau Xào Tỏi', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80' }
  ];

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') return;
      const rawDataUrl = reader.result;
      // Client-side HTML5 Canvas smart compression (max 1080px, JPEG quality 0.82 -> ~120-180 KB)
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 1080;
          let targetW = img.width;
          let targetH = img.height;
          if (targetW > maxDim || targetH > maxDim) {
            if (targetW >= targetH) {
              targetH = Math.round((targetH * maxDim) / targetW);
              targetW = maxDim;
            } else {
              targetW = Math.round((targetW * maxDim) / targetH);
              targetH = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, targetW, targetH);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
            setNewImageUrl(compressedDataUrl);
            showToast('📸 Đã tối ưu ảnh món ăn sắc nét & nhẹ máy!', 'info');
            return;
          }
        } catch {
          // Fallback to rawDataUrl if canvas fails
        }
        setNewImageUrl(rawDataUrl);
      };
      img.onerror = () => {
        setNewImageUrl(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCustomRecipe = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;

    const ingredients: Ingredient[] = selectedIngredients.length > 0
      ? selectedIngredients
      : [
          { name: newTitle.trim(), amount: 1, unit: 'phần', category: 'thit-ca' as const }
        ];

    const fallbackImg = PRESET_DISH_IMAGES[0].url;

    const customRecipe: Recipe = {
      id: editingRecipeId || `custom-${Date.now()}`,
      title: newTitle.trim(),
      description: newAuthorNote.trim() || 'Món ngon gia đình tự nấu chuẩn vị cơm nhà.',
      category: newCategory,
      region: newRegion,
      prepTimeMinutes: 10,
      cookTimeMinutes: parseInt(newCookTime, 10) || 25,
      servings: 4,
      calories: parseInt(newCalories, 10) || 450,
      estimatedCostVnd: parseInt(newCost.replace(/\D/g, ''), 10) || 65000,
      imageUrl: newImageUrl || fallbackImg,
      ingredients,
      instructions: newSecretTips.trim()
        ? [
            {
              step: 1,
              title: 'Bí Quyết & Chế Biến',
              content: newSecretTips.trim(),
              tip: newAuthorNote.trim() || undefined
            }
          ]
        : [
            {
              step: 1,
              title: 'Chế Biến Gia Đình',
              content: 'Nấu theo khẩu vị gia đình, nêm nếm vừa miệng và canh lửa phù hợp.',
            }
          ],
      tags: ['Món Của Tôi', newAuthorNote.trim()].filter(Boolean),
      chefTip: newSecretTips.trim() || undefined,
      authorName: user?.name || 'Đầu Bếp Tại Gia',
      authorNote: newAuthorNote.trim() || (newAuthorVoiceUrl ? 'Lời nhắn từ người nấu' : undefined),
      authorVoiceUrl: newAuthorVoiceUrl || undefined,
      authorVoiceDurationSec: newAuthorVoiceDurationSec || undefined,
      isCustom: true
    };

    addCustomRecipe(customRecipe);
    setSelectedCategory('mon-cua-toi');
    setIsCreateModalOpen(false);

    // Reset form
    setEditingRecipeId(null);
    setCreateStep(1);
    setNewTitle('');
    setNewAuthorNote('');
    setNewAuthorVoiceUrl('');
    setNewAuthorVoiceDurationSec(0);
    setNewSecretTips('');
    setSelectedIngredients([]);
    setIngredientSearchQuery('');
    setIsIngredientDropdownOpen(false);
    setNewImageUrl('');
  };

  const stopAllVoicePlayback = () => {
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingVoicePreview(false);
    setPlayingCardVoiceId(null);
  };

  const playVoiceNote = (voiceUrl: string, fallbackText: string, cardId?: string) => {
    // Toggle off if already playing the same target
    if ((cardId && playingCardVoiceId === cardId) || (!cardId && isPlayingVoicePreview)) {
      stopAllVoicePlayback();
      return;
    }

    stopAllVoicePlayback();

    if (voiceUrl && voiceUrl.startsWith('data:audio')) {
      try {
        const audio = new Audio(voiceUrl);
        voiceAudioRef.current = audio;
        if (cardId) setPlayingCardVoiceId(cardId);
        else setIsPlayingVoicePreview(true);

        audio.onended = () => {
          setIsPlayingVoicePreview(false);
          setPlayingCardVoiceId(null);
        };
        audio.onerror = () => {
          setIsPlayingVoicePreview(false);
          setPlayingCardVoiceId(null);
        };
        audio.play().catch(() => {
          setIsPlayingVoicePreview(false);
          setPlayingCardVoiceId(null);
        });
        return;
      } catch {
        // Fallback to speechSynthesis below
      }
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const spokenMsg =
        (voiceUrl && voiceUrl.startsWith('voice-tts:') ? voiceUrl.replace('voice-tts:', '') : '') ||
        fallbackText ||
        'Nhớ nấu lửa vừa và nêm nếm vừa miệng cho cả nhà cùng thưởng thức nhé!';
      const utter = new SpeechSynthesisUtterance(spokenMsg);
      utter.lang = 'vi-VN';
      utter.rate = 0.95;
      if (cardId) setPlayingCardVoiceId(cardId);
      else setIsPlayingVoicePreview(true);
      utter.onend = () => {
        setIsPlayingVoicePreview(false);
        setPlayingCardVoiceId(null);
      };
      utter.onerror = () => {
        setIsPlayingVoicePreview(false);
        setPlayingCardVoiceId(null);
      };
      window.speechSynthesis.speak(utter);
    }
  };

  const startVoiceRecording = async () => {
    stopAllVoicePlayback();
    setRecordingElapsedSec(0);
    recordingStartMsRef.current = Date.now();
    setIsRecordingVoice(true);

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = setInterval(() => {
      setRecordingElapsedSec(Math.max(1, Math.round((Date.now() - recordingStartMsRef.current) / 1000)));
    }, 500);

    // Optional Speech-to-Text auto transcription while recording
    try {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        const rec = new SpeechRec();
        rec.lang = 'vi-VN';
        rec.continuous = true;
        rec.interimResults = false;
        rec.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript + ' ';
            }
          }
          if (transcript.trim()) {
            setNewAuthorNote(prev => (prev.trim() ? `${prev.trim()} ${transcript.trim()}` : transcript.trim()));
          }
        };
        rec.start();
        speechRecRef.current = rec;
      }
    } catch {
      // Ignore if speech recognition is not supported
    }

    // Real Microphone Audio Recording via MediaRecorder
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const duration = Math.max(1, Math.round((Date.now() - recordingStartMsRef.current) / 1000));
          setNewAuthorVoiceDurationSec(duration);
          stream.getTracks().forEach(t => t.stop());

          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                setNewAuthorVoiceUrl(reader.result);
              }
            };
            reader.readAsDataURL(blob);
          } else {
            setNewAuthorVoiceUrl(`voice-tts:${newAuthorNote.trim() || 'Món này nhớ nêm vừa miệng và ăn lúc còn nóng nhé!'}`);
          }
        };

        recorder.start();
      }
    } catch {
      // If no physical mic is plugged in or permission is denied, keep timer running for voice-tts fallback
    }
  };

  const stopVoiceRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch {}
      speechRecRef.current = null;
    }
    const duration = Math.max(1, Math.round((Date.now() - recordingStartMsRef.current) / 1000));
    setNewAuthorVoiceDurationSec(duration);
    setIsRecordingVoice(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    } else {
      setNewAuthorVoiceUrl(`voice-tts:${newAuthorNote.trim() || 'Món này nhớ nêm vừa miệng và ăn lúc còn nóng nhé!'}`);
    }
  };

  const handleApplyRecipe = () => {
    if (!assigningRecipe) return;
    addRecipeToSlot(targetDay, targetSlot, assigningRecipe.id);
    setAssigningRecipe(null);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = matchesRecipeSearch(recipe, searchQuery);
    const matchesCategory = 
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'mon-cua-toi'
          ? Boolean(recipe.isCustom)
          : recipe.category === selectedCategory;
    const matchesRegion = selectedRegion === 'all' || recipe.region === selectedRegion;
    return matchesSearch && matchesCategory && matchesRegion;
  });

  const visibleRecipes = filteredRecipes.slice(0, visibleLimit);

  const isMobile = viewMode === 'mobile';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedRegion('all');
    setVisibleLimit(30);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setVisibleLimit(30);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setVisibleLimit(30);
  };

  const handleRegionChange = (reg: string) => {
    setSelectedRegion(reg);
    setVisibleLimit(30);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedRegion !== 'all';

  const openCreateScreen = () => {
    if (!isRegistered) {
      showToast('🔒 Sổ Bếp Gia Đình & Ghi Âm Lời Dặn chỉ dành cho Thành Viên! Vui lòng đăng ký tài khoản miễn phí để lưu giữ món ngon.', 'warning');
      openAuthModal('register');
      return;
    }
    stopAllVoicePlayback();
    setEditingRecipeId(null);
    setCreateStep(1);
    setNewTitle('');
    setNewCategory('mon-man');
    setNewRegion('toan-quoc');
    setNewAuthorNote('');
    setNewAuthorVoiceUrl('');
    setNewAuthorVoiceDurationSec(0);
    setIsRecordingVoice(false);
    setNewSecretTips('');
    setSelectedIngredients([]);
    setIngredientSearchQuery('');
    setIsIngredientDropdownOpen(false);
    setNewCost('65000');
    setNewCookTime('25');
    setNewCalories('450');
    setNewImageUrl('');
    setIsCreateModalOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditCustomRecipe = (recipe: Recipe) => {
    if (!isRegistered) {
      showToast('🔒 Sổ Bếp Gia Đình & Ghi Âm Lời Dặn chỉ dành cho Thành Viên! Vui lòng đăng ký tài khoản miễn phí.', 'warning');
      openAuthModal('register');
      return;
    }
    stopAllVoicePlayback();
    setEditingRecipeId(recipe.id);
    setCreateStep(1);
    setNewTitle(recipe.title || '');
    setNewCategory(recipe.category || 'mon-man');
    setNewRegion(recipe.region || 'toan-quoc');
    setNewAuthorNote(recipe.authorNote || '');
    setNewAuthorVoiceUrl(recipe.authorVoiceUrl || '');
    setNewAuthorVoiceDurationSec(recipe.authorVoiceDurationSec || 0);
    setIsRecordingVoice(false);
    setNewSecretTips(recipe.chefTip || recipe.instructions?.[0]?.content || '');
    setSelectedIngredients(recipe.ingredients ? [...recipe.ingredients] : []);
    setIngredientSearchQuery('');
    setIsIngredientDropdownOpen(false);
    setNewCost(String(recipe.estimatedCostVnd || 65000));
    setNewCookTime(String(recipe.cookTimeMinutes || 25));
    setNewCalories(String(recipe.calories || 450));
    setNewImageUrl(recipe.imageUrl || '');
    setIsCreateModalOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onEditEvent = (e: Event) => {
      const customEv = e as CustomEvent<Recipe>;
      if (customEv.detail) {
        handleEditCustomRecipe(customEv.detail);
      }
    };
    window.addEventListener('mealwise:edit-custom-recipe', onEditEvent);
    return () => {
      window.removeEventListener('mealwise:edit-custom-recipe', onEditEvent);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // ==================== DEDICATED FULL-SCREEN VIEW: GHI LẠI MÓN BẾP NHÀ ====================
  if (isCreateModalOpen) {
    return (
      <div className="space-y-4 animate-fade-in">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              setIsCreateModalOpen(false);
              setEditingRecipeId(null);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <span>← Quay lại Sổ Tay Công Thức</span>
          </button>

          <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60 text-[11px] font-black">
            Bước {createStep} / 3
          </span>
        </div>

        {/* Full-Screen 3-Step Wizard Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Screen Header + Interactive 3-Step Progress Tabs */}
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-400 shrink-0">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {editingRecipeId ? 'Chỉnh Sửa Món Bếp Nhà' : 'Ghi Lại Món Bếp Nhà'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {createStep === 1
                    ? 'Bước 1: Đặt tên món ăn & chọn các nguyên liệu bạn đã dùng'
                    : createStep === 2
                      ? 'Bước 2: Ghi lại cách làm & bí quyết nêm nếm chuẩn vị nhà mình'
                      : 'Bước 3: Ước tính thời gian, chi phí & chọn ảnh đại diện món ăn'}
                </p>
              </div>
            </div>

            {/* Interactive 3-Step Indicator Tabs */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { step: 1 as const, label: '1. Tên & Nguyên liệu' },
                { step: 2 as const, label: '2. Cách làm' },
                { step: 3 as const, label: '3. Hoàn tất' }
              ].map(s => {
                const isActive = createStep === s.step;
                const isCompleted = createStep > s.step;
                const canJump = s.step === 1 || Boolean(newTitle.trim());
                return (
                  <button
                    key={s.step}
                    type="button"
                    disabled={!canJump}
                    onClick={() => canJump && setCreateStep(s.step)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border ${
                      isActive
                        ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-xs font-black'
                        : isCompleted
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200/70 dark:border-slate-800'
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />}
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full-Screen Step Form Body */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (createStep < 3) {
                if (!newTitle.trim()) return;
                setCreateStep(prev => (prev === 1 ? 2 : 3));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                handleSaveCustomRecipe();
              }
            }}
          >
            <div className="p-4 sm:p-6 space-y-5">
              {/* ==================== STEP 1: TÊN MÓN & NGUYÊN LIỆU ==================== */}
              {createStep === 1 && (
                <div className="space-y-5 animate-fade-in">
                  {/* Dish Title */}
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                      Tên Món Ăn Gia Đình <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      autoFocus
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      placeholder="Ví dụ: Cá bống kho tiêu của Mẹ, Canh chua sườn..." 
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#1D4ED8] font-bold shadow-2xs"
                    />
                  </div>

                  {/* 1-Tap Category Chips */}
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                      Phân Loại Món
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'mon-man', label: 'Món Mặn', icon: '🍲' },
                        { id: 'mon-canh', label: 'Món Canh', icon: '🥣' },
                        { id: 'mon-rau', label: 'Món Rau', icon: '🥬' },
                        { id: 'mon-chay', label: 'Món Chay', icon: '🌱' },
                        { id: 'an-sang', label: 'Bữa Sáng', icon: '🍜' },
                        { id: 'trang-mieng', label: 'Tráng Miệng', icon: '🍮' }
                      ].map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setNewCategory(cat.id as MealCategory)}
                          className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            newCategory === cat.id
                              ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-xs font-black'
                              : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                          }`}
                        >
                          <span className="text-sm">{cat.icon}</span>
                          <span className="truncate">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive System Ingredient Picker */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        Nguyên Liệu Đã Dùng
                      </label>
                      {selectedIngredients.length > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[11px] font-black text-[#1D4ED8] dark:text-blue-300">
                          Đã chọn {selectedIngredients.length} món
                        </span>
                      )}
                    </div>

                    {/* Popular 1-Tap Ingredient Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 font-semibold">Chạm chọn nhanh:</span>
                      {[
                        { name: 'Thịt ba chỉ', amount: 500, unit: 'g', category: 'thit-ca' as const },
                        { name: 'Sườn non heo', amount: 500, unit: 'g', category: 'thit-ca' as const },
                        { name: 'Cá bống', amount: 400, unit: 'g', category: 'thit-ca' as const },
                        { name: 'Trứng gà', amount: 4, unit: 'quả', category: 'do-kho' as const },
                        { name: 'Đậu phụ / Đậu hũ', amount: 3, unit: 'bìa', category: 'do-kho' as const },
                        { name: 'Cà chua', amount: 3, unit: 'quả', category: 'rau-cu' as const },
                        { name: 'Rau muống', amount: 1, unit: 'bó', category: 'rau-cu' as const },
                        { name: 'Hành lá', amount: 1, unit: 'mớ', category: 'rau-cu' as const }
                      ].map((ing, i) => {
                        const isSel = isIngredientSelected(ing.name);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleToggleSelectIngredient(ing)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                              isSel
                                ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-2xs'
                                : 'bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-transparent'
                            }`}
                          >
                            {isSel ? `✓ ${ing.name}` : `+ ${ing.name}`}
                          </button>
                        );
                      })}
                    </div>

                    {/* Search Box */}
                    <div className="relative">
                      <div
                        onClick={() => {
                          setIsIngredientDropdownOpen(true);
                          setTimeout(() => ingredientSearchInputRef.current?.focus(), 0);
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border transition-colors flex items-center gap-2 cursor-text ${
                          isIngredientDropdownOpen
                            ? 'border-[#1D4ED8] ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <Search className="w-4 h-4 text-[#1D4ED8] dark:text-blue-400 shrink-0" />
                        <input
                          ref={ingredientSearchInputRef}
                          type="text"
                          value={ingredientSearchQuery}
                          onFocus={() => setIsIngredientDropdownOpen(true)}
                          onChange={e => {
                            setIngredientSearchQuery(e.target.value);
                            setIsIngredientDropdownOpen(true);
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (filteredSystemIngredients.length > 0) {
                                handleToggleSelectIngredient(filteredSystemIngredients[0]);
                              } else if (ingredientSearchQuery.trim()) {
                                handleAddCustomSearchIngredient();
                              }
                            }
                          }}
                          placeholder="Gõ tìm thêm nguyên liệu: tôm tươi, nấm hương, sả cây..."
                          className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
                        />
                        {ingredientSearchQuery && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setIngredientSearchQuery('');
                              ingredientSearchInputRef.current?.focus();
                            }}
                            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            title="Xóa từ khóa"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setIsIngredientDropdownOpen(prev => !prev);
                          }}
                          className="p-1 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer shrink-0"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isIngredientDropdownOpen ? 'rotate-180 text-[#1D4ED8] dark:text-blue-400' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Expandable System Ingredients Dropdown Panel */}
                      {isIngredientDropdownOpen && (
                        <div className="mt-2 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden animate-fade-in">
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {[
                                { id: 'all', label: 'Tất cả' },
                                { id: 'thit-ca', label: '🥩 Thịt & Cá' },
                                { id: 'rau-cu', label: '🥬 Rau củ' },
                                { id: 'gia-vi', label: '🧄 Gia vị' },
                                { id: 'do-kho', label: '🥚 Đậu & Trứng' }
                              ].map(tab => (
                                <button
                                  key={tab.id}
                                  type="button"
                                  onClick={() => setIngredientCategoryFilter(tab.id as any)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    ingredientCategoryFilter === tab.id
                                      ? 'bg-[#1D4ED8] text-white shadow-2xs'
                                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  {tab.label}
                                </button>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsIngredientDropdownOpen(false)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#1D4ED8] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer shrink-0"
                            >
                              Thu gọn
                            </button>
                          </div>

                          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                            {filteredSystemIngredients.length > 0 ? (
                              filteredSystemIngredients.map((item, idx) => {
                                const selected = isIngredientSelected(item.name);
                                const catBadge =
                                  item.category === 'rau-cu'
                                    ? '🥬'
                                    : item.category === 'thit-ca'
                                      ? '🥩'
                                      : item.category === 'gia-vi'
                                        ? '🧄'
                                        : '🥚';
                                return (
                                  <button
                                    key={`${item.name}-${idx}`}
                                    type="button"
                                    onClick={() => handleToggleSelectIngredient(item)}
                                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                                      selected
                                        ? 'bg-emerald-500/10 dark:bg-emerald-500/15'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-sm shrink-0">{catBadge}</span>
                                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {item.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                                        {item.amount} {item.unit}
                                      </span>
                                      {selected ? (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center gap-1">
                                          <Check className="w-3 h-3 stroke-[3]" />
                                          <span>Đã chọn</span>
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                                          + Chọn
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })
                            ) : (
                              <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                                Không tìm thấy &quot;{ingredientSearchQuery}&quot; trong danh sách sẵn có
                              </div>
                            )}

                            {ingredientSearchQuery.trim() !== '' &&
                              !allSystemIngredients.some(
                                i => normalizeSearchString(i.name) === normalizeSearchString(ingredientSearchQuery)
                              ) && (
                                <button
                                  type="button"
                                  onClick={handleAddCustomSearchIngredient}
                                  className="w-full px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-[#1D4ED8] dark:text-blue-300 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Thêm nguyên liệu mới: &quot;{ingredientSearchQuery.trim()}&quot;</span>
                                  </span>
                                  <span className="text-[10px] underline">Chạm để thêm</span>
                                </button>
                              )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Selected Ingredients List */}
                    {selectedIngredients.length > 0 && (
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 space-y-2">
                        {selectedIngredients.map((ing, idx) => (
                          <div
                            key={`${ing.name}-${idx}`}
                            className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-2xs"
                          >
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate flex-1">
                              {ing.name}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <input
                                type="number"
                                min="0.1"
                                step="any"
                                value={ing.amount}
                                onChange={e => handleUpdateSelectedIngredientAmount(idx, e.target.value)}
                                className="w-16 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#1D4ED8]"
                                title="Định lượng"
                              />
                              <input
                                type="text"
                                value={ing.unit}
                                onChange={e => handleUpdateSelectedIngredientUnit(idx, e.target.value)}
                                className="w-18 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:border-[#1D4ED8]"
                                title="Đơn vị"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveSelectedIngredient(idx)}
                                className="w-7 h-7 rounded-full hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                                title="Xóa nguyên liệu"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== STEP 2: CÁCH NẤU & BÍ QUYẾT ==================== */}
              {createStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  {/* Secret Seasoning & Cooking Steps */}
                  <div className="space-y-2.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>Cách Làm & Bí Quyết Nêm Nếm</span>
                      <span className="text-[11px] text-[#1D4ED8] dark:text-blue-400 font-semibold">Linh hồn món ăn</span>
                    </label>
                    <textarea 
                      rows={5}
                      autoFocus
                      value={newSecretTips}
                      onChange={e => setNewSecretTips(e.target.value)}
                      placeholder="Ghi lại các bước nấu hoặc mẹo riêng cho món ăn..." 
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#1D4ED8] leading-relaxed"
                    />

                    {/* 1-Tap Quick-Insert Cooking Step Chips */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 block font-medium">
                        Chạm để chèn nhanh thao tác nấu:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'Ướp gia vị 15 phút cho thấm.',
                          'Phi thơm hành tỏi với dầu ăn.',
                          'Kho lửa nhỏ liu riu đến khi sánh kẹo.',
                          'Đun sôi hớt bọt cho nước canh trong.',
                          'Nêm chút nước mắm ngon trước khi tắt bếp.'
                        ].map((phrase, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setNewSecretTips(prev => prev.trim() ? `${prev.trim()} ${phrase}` : phrase);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#1D4ED8] text-xs font-semibold transition-colors cursor-pointer"
                          >
                            + {phrase}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Family Memory / Author Note + Voice Recording */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        Dấu Ấn Bếp Nhà • Lời Nhắn Yêu Thương
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (isRecordingVoice) {
                            stopVoiceRecording();
                          } else {
                            startVoiceRecording();
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer shadow-2xs ${
                          isRecordingVoice
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/70'
                        }`}
                        title={isRecordingVoice ? 'Chạm để dừng thu âm lời dặn' : 'Ghi âm lời dặn dò của người nấu cho gia đình'}
                      >
                        {isRecordingVoice ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span>Dừng ghi ({recordingElapsedSec}s)</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5" />
                            <span>{newAuthorVoiceUrl ? 'Thu âm lại' : 'Ghi âm lời nhắn'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <input 
                        type="text" 
                        value={newAuthorNote}
                        onChange={e => setNewAuthorNote(e.target.value)}
                        placeholder="Ví dụ: Món ruột của Bố, nhớ kho nhỏ lửa cho thấm nhé..." 
                        className="w-full pl-4 pr-11 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#1D4ED8]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (isRecordingVoice) {
                            stopVoiceRecording();
                          } else {
                            startVoiceRecording();
                          }
                        }}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isRecordingVoice
                            ? 'bg-rose-600 text-white animate-pulse shadow-sm'
                            : 'bg-slate-200/70 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400'
                        }`}
                        title={isRecordingVoice ? 'Dừng ghi âm' : 'Chạm để ghi âm lời nhắn'}
                      >
                        {isRecordingVoice ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Live Recording Status Pill */}
                    {isRecordingVoice && (
                      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 animate-fade-in">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
                          <span className="text-xs font-bold text-rose-700 dark:text-rose-300 truncate">
                            Đang thu lời nhắn cho người nấu sau ({recordingElapsedSec}s)...
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={stopVoiceRecording}
                          className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[11px] font-black shrink-0 cursor-pointer"
                        >
                          Xong
                        </button>
                      </div>
                    )}

                    {/* Recorded Voice Note Playback Pill */}
                    {!isRecordingVoice && newAuthorVoiceUrl && (
                      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 animate-fade-in">
                        <button
                          type="button"
                          onClick={() => playVoiceNote(newAuthorVoiceUrl, newAuthorNote)}
                          className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group"
                        >
                          <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                            {isPlayingVoicePreview ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                              <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>
                                {isPlayingVoicePreview
                                  ? 'Đang phát lời nhắn bếp nhà...'
                                  : `Nghe lời nhắn đã thu${newAuthorVoiceDurationSec ? ` (${newAuthorVoiceDurationSec}s)` : ''}`}
                              </span>
                            </p>
                            <p className="text-[11px] text-amber-700/80 dark:text-amber-300/70 truncate">
                              Người nấu sau sẽ nghe được lời dặn này khi mở món
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            stopAllVoicePlayback();
                            setNewAuthorVoiceUrl('');
                            setNewAuthorVoiceDurationSec(0);
                          }}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                          title="Xóa bản thu âm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 1-Tap Region Chips */}
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                      Hương Vị Vùng Miền
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'toan-quoc', label: 'Toàn Quốc' },
                        { id: 'bac', label: 'Miền Bắc' },
                        { id: 'trung', label: 'Miền Trung' },
                        { id: 'nam', label: 'Miền Nam' }
                      ].map(reg => (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() => setNewRegion(reg.id as Region)}
                          className={`py-2.5 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                            newRegion === reg.id
                              ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-xs font-black'
                              : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                          }`}
                        >
                          {reg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== STEP 3: HOÀN TẤT & ẢNH MÓN ==================== */}
              {createStep === 3 && (
                <div className="space-y-5 animate-fade-in">
                  {/* Cook Time & Cost with Quick Presets */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                        Chi Phí Đi Chợ (đ)
                      </label>
                      <input 
                        type="number" 
                        min="0"
                        step="5000"
                        value={newCost}
                        onChange={e => setNewCost(e.target.value)}
                        placeholder="65000" 
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none font-bold"
                      />
                      <div className="flex items-center gap-1.5">
                        {['40000', '65000', '90000', '120000'].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setNewCost(val)}
                            className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border cursor-pointer ${
                              newCost === val
                                ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-300 border-blue-300 dark:border-blue-700'
                                : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            {parseInt(val, 10) / 1000}k
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                        Thời gian nấu
                      </label>
                      <input 
                        type="number" 
                        min="5"
                        max="300"
                        value={newCookTime}
                        onChange={e => setNewCookTime(e.target.value)}
                        placeholder="25" 
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none font-bold"
                      />
                      <div className="flex items-center gap-1.5">
                        {['15', '25', '40', '60'].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setNewCookTime(val)}
                            className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border cursor-pointer ${
                              newCookTime === val
                                ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-300 border-blue-300 dark:border-blue-700'
                                : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            {val}p
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dish Photo */}
                  <div className="space-y-2.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block">
                      Hình Ảnh Món Ăn
                    </label>

                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#1D4ED8] bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-[#1D4ED8] dark:text-blue-400" />
                      <span>Chụp ảnh món ăn hoặc Tải từ điện thoại</span>
                    </button>

                    {newImageUrl && (
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs">
                        <img 
                          src={newImageUrl} 
                          alt="Ảnh món ăn" 
                          className="w-full h-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={() => setNewImageUrl('')}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/70 text-white hover:bg-slate-900 transition-colors cursor-pointer"
                          title="Bỏ chọn ảnh"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="pt-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        Hoặc chọn ảnh minh họa sẵn:
                      </p>
                      <div className="grid grid-cols-3 gap-2.5">
                        {PRESET_DISH_IMAGES.map((preset, idx) => {
                          const isSelected = newImageUrl === preset.url;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setNewImageUrl(preset.url)}
                              className={`relative aspect-video rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group text-left ${
                                isSelected 
                                  ? 'border-[#1D4ED8] ring-2 ring-blue-500/30 shadow-xs' 
                                  : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700 opacity-80 hover:opacity-100'
                              }`}
                            >
                              <img 
                                src={preset.url} 
                                alt={preset.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                              <span className="absolute bottom-1.5 left-2 right-2 text-[10.5px] font-bold text-white truncate">
                                {preset.title}
                              </span>
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step Navigation Footer */}
            <div className="p-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 flex items-center justify-between gap-2">
              {createStep === 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingRecipeId(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCreateStep(prev => (prev === 3 ? 2 : 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ← Quay Lại
                </button>
              )}

              <div className="flex items-center gap-2">
                {createStep < 3 && newTitle.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleSaveCustomRecipe()}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#1D4ED8] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                    title="Lưu ngay mà không cần qua các bước sau"
                  >
                    {editingRecipeId ? 'Lưu Thay Đổi' : 'Lưu Nhanh'}
                  </button>
                )}

                {createStep < 3 ? (
                  <button
                    type="submit"
                    disabled={!newTitle.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{createStep === 1 ? 'Tiếp: Cách Làm' : 'Tiếp: Hoàn Tất'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!newTitle.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <ChefHat className="w-4 h-4" />
                    <span>{editingRecipeId ? 'Lưu Thay Đổi' : 'Lưu Vào Sổ Bếp'}</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold mb-2">
              <BookOpen className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-blue-400" />
              <span>Sổ Tay Công Thức Món Việt</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Khám Phá Món Ăn Truyền Thống
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Tuyển tập công thức chuẩn vị 3 miền từ thịt rang cháy cạnh, canh cua đồng tới thịt kho tàu.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateScreen}
            className={`px-4 py-2.5 rounded-2xl active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shrink-0 shadow-xs transition-all cursor-pointer ${
              isRegistered
                ? 'bg-[#1D4ED8] hover:bg-blue-800'
                : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 border border-amber-400/50'
            }`}
            title={isRegistered ? 'Thêm công thức món ăn của riêng bạn' : 'Đăng ký tài khoản miễn phí để mở khóa Sổ Bếp Gia Đình & Ghi Âm Lời Dặn'}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isRegistered ? 'Thêm Món Mới' : 'Thêm Món Mới 🔒'}</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="mt-4 relative max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Tìm theo tên món, nguyên liệu, tag (thịt rang, cua đồng, cay...)..."
            className="w-full pl-10 pr-9 py-2.5 sm:py-3 min-h-[44px] rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-white flex items-center justify-center transition-colors cursor-pointer min-h-[32px] min-w-[32px]"
              aria-label="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls Container */}
      <div className="space-y-3">
        
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'Tất Cả Món' },
            { id: 'mon-cua-toi', label: isRegistered ? 'Món Của Tôi ⭐️' : 'Món Của Tôi 🔒' },
            { id: 'mon-man', label: 'Món Mặn' },
            { id: 'mon-canh', label: 'Món Canh' },
            { id: 'mon-rau', label: 'Món Rau' },
            { id: 'mon-chay', label: 'Món Chay' },
            { id: 'an-sang', label: 'Ăn Sáng' },
            { id: 'trang-mieng', label: 'Tráng Miệng' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#1D4ED8] text-white dark:bg-blue-600 dark:text-white shadow-xs font-black'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white font-semibold'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Region Filter Tabs */}
        <div className="flex items-center flex-wrap gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mr-1 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Vùng Miền:</span>
          </div>
          {[
            { id: 'all', label: 'Tất Cả Miền' },
            { id: 'bac', label: 'Miền Bắc' },
            { id: 'trung', label: 'Miền Trung' },
            { id: 'nam', label: 'Miền Nam' },
            { id: 'toan-quoc', label: 'Toàn Quốc' }
          ].map(reg => (
            <button
              key={reg.id}
              onClick={() => handleRegionChange(reg.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedRegion === reg.id
                  ? 'bg-[#1D4ED8] text-white dark:bg-blue-600 dark:text-white shadow-2xs font-black'
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>

      </div>

      {/* Result Count and Reset Action */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
        <span>
          Tìm thấy <strong className="text-slate-900 dark:text-white font-black">{filteredRecipes.length}</strong> món ngon phù hợp
        </span>
        {hasActiveFilters && (
          <button
            onClick={resetAllFilters}
            className="text-xs text-[#1D4ED8] dark:text-blue-400 hover:underline font-bold shrink-0 cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredRecipes.length === 0 ? (
        selectedCategory === 'mon-cua-toi' ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-400 flex items-center justify-center mx-auto">
              <ChefHat className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isRegistered ? 'Chưa Có Món Nào Trong Sổ Bếp Gia Đình' : 'Mở Khóa Sổ Bếp Gia Đình & Ghi Âm Lời Dặn 🔒'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {isRegistered
                  ? 'Mỗi gia đình đều có những hương vị độc nhất từ bàn tay của mẹ hoặc người thân. Hãy ghi lại công thức để lưu giữ trọn đời và dễ dàng xếp vào thực đơn hàng tuần!'
                  : 'Đăng ký tài khoản miễn phí để tạo công thức gia truyền, thu âm giọng nói dặn dò của mẹ hoặc người thân, và đồng bộ sổ bếp riêng của gia đình bạn trên mọi thiết bị!'}
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateScreen}
              className="px-5 py-2.5 rounded-2xl bg-[#1D4ED8] hover:bg-blue-800 active:scale-95 text-white font-black text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isRegistered ? 'Ghi Lại Món Đầu Tiên' : 'Đăng Ký Mở Khóa Miễn Phí 🔒'}</span>
            </button>
          </div>
        ) : (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <Utensils className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Không tìm thấy món ăn phù hợp
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              Thử tìm kiếm không dấu (ví dụ: &quot;thit rang&quot;, &quot;canh rau&quot;) hoặc đặt lại tiêu chí lọc vùng miền/thể loại.
            </p>
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Xem tất cả công thức
            </button>
          </div>
        )
      ) : (
        /* Recipe Grid (responsive 1 -> 2 -> 3 columns) */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {visibleRecipes.map(recipe => (
              <div
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group border border-slate-200 dark:border-slate-800 select-none"
                title="Xem Chi Tiết Món"
                aria-label={`Xem Chi Tiết Món: ${recipe.title}`}
              >
                <SafeImage 
                  src={recipe.imageUrl} 
                  alt={recipe.title} 
                  fallbackTitle={recipe.title}
                  category={recipe.category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* High-contrast gradient overlay to ensure text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

                {/* Unified Top Bar: Badges (Left) + Action Buttons (Right) — Never Overlaps */}
                <div className="absolute top-3 left-3 right-3 z-10 flex items-start justify-between gap-2 pointer-events-none">
                  {/* Top Left: Custom Badge & Region */}
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
                    {recipe.isCustom && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/90 backdrop-blur-md text-slate-950 text-[10px] font-black border border-amber-300 shadow-xs flex items-center gap-1 shrink-0">
                        <span>👨‍🍳</span>
                        <span className="truncate max-w-[110px]">{recipe.authorName || 'Món Bếp Nhà'}</span>
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-950/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/10 shadow-xs shrink-0">
                      {recipe.region === 'bac' ? 'Miền Bắc' : recipe.region === 'nam' ? 'Miền Nam' : recipe.region === 'trung' ? 'Miền Trung' : 'Toàn Quốc'}
                    </span>
                    {!recipe.isCustom && recipe.calories && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-950/60 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-white/10 flex items-center gap-0.5 shadow-xs shrink-0">
                        <Flame className="w-3 h-3 text-amber-400" />
                        {recipe.calories} kcal
                      </span>
                    )}
                  </div>

                  {/* Top Right: Actions (Edit & Delete for custom + Quick-Add) */}
                  <div className="flex items-center gap-1.5 shrink-0 pointer-events-auto">
                    {recipe.isCustom && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            shareCustomRecipe(recipe, showToast);
                          }}
                          className="w-9 h-9 rounded-2xl bg-slate-950/60 hover:bg-[#1D4ED8] active:scale-90 backdrop-blur-md text-white/90 hover:text-white border border-white/20 flex items-center justify-center transition-all shadow-md cursor-pointer touch-manipulation"
                          title="Chia Sẻ Món Bếp Nhà"
                          aria-label={`Chia Sẻ Món: ${recipe.title}`}
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCustomRecipe(recipe);
                          }}
                          className="w-9 h-9 rounded-2xl bg-slate-950/60 hover:bg-amber-500 active:scale-90 backdrop-blur-md text-white/90 hover:text-slate-950 border border-white/20 flex items-center justify-center transition-all shadow-md cursor-pointer touch-manipulation"
                          title="Chỉnh Sửa Món"
                          aria-label={`Chỉnh Sửa Món: ${recipe.title}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openConfirmModal({
                              title: 'Xóa Món Khỏi Sổ Bếp',
                              message: `Bạn có chắc muốn xóa món "${recipe.title}" khỏi sổ bếp gia đình?`,
                              confirmLabel: 'Xóa Món',
                              cancelLabel: 'Giữ Lại',
                              isDanger: true,
                              onConfirm: () => {
                                deleteCustomRecipe(recipe.id);
                              }
                            });
                          }}
                          className="w-9 h-9 rounded-2xl bg-slate-950/60 hover:bg-rose-600 active:scale-90 backdrop-blur-md text-white/90 hover:text-white border border-white/20 flex items-center justify-center transition-all shadow-md cursor-pointer touch-manipulation"
                          title="Xóa Món Khỏi Sổ Bếp"
                          aria-label={`Xóa Món: ${recipe.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAssigningRecipe(recipe);
                      }}
                      className="w-9 h-9 rounded-2xl bg-slate-950/60 hover:bg-[#1D4ED8] active:scale-90 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all shadow-md cursor-pointer touch-manipulation group/btn"
                      title="Chọn Món Này"
                      aria-label={`Chọn Món Này: ${recipe.title}`}
                    >
                      <PlusCircle className="w-5 h-5 text-white/90 group-hover/btn:text-white group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Bottom Content: Title and Price / Time / Calories or Tag */}
                <div className="absolute bottom-3 left-3.5 right-3.5 text-white z-10 pointer-events-none">
                  <h4 className="text-base sm:text-lg font-extrabold leading-tight tracking-tight text-white drop-shadow-xs truncate">
                    {recipe.title}
                  </h4>
                  {(recipe.authorNote || recipe.authorVoiceUrl) && (
                    <div className="flex items-center gap-2 mt-0.5">
                      {recipe.authorNote && (
                        <p className="text-[11px] text-amber-300 font-semibold drop-shadow-xs truncate">
                          ❤️ {recipe.authorNote}
                        </p>
                      )}
                      {recipe.authorVoiceUrl && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            playVoiceNote(recipe.authorVoiceUrl!, recipe.authorNote || recipe.title, recipe.id);
                          }}
                          className={`pointer-events-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black transition-all shrink-0 cursor-pointer shadow-xs ${
                            playingCardVoiceId === recipe.id
                              ? 'bg-rose-600 text-white animate-pulse'
                              : 'bg-amber-400/95 hover:bg-amber-300 text-slate-950'
                          }`}
                          title="Nghe lời nhắn ghi âm của người nấu"
                        >
                          {playingCardVoiceId === recipe.id ? (
                            <>
                              <Pause className="w-2.5 h-2.5 fill-current" />
                              <span>Đang phát...</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>Nghe lời dặn{recipe.authorVoiceDurationSec ? ` (${recipe.authorVoiceDurationSec}s)` : ''}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-200 mt-0.5 font-semibold">
                    <span className="text-white font-black">{recipe.estimatedCostVnd.toLocaleString('vi-VN')} đ</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                      {recipe.cookTimeMinutes} phút
                    </span>
                    {recipe.isCustom && recipe.calories ? (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-amber-300 font-bold">
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          {recipe.calories} kcal
                        </span>
                      </>
                    ) : recipe.tags && recipe.tags.length > 0 ? (
                      <>
                        <span>•</span>
                        <span className="text-slate-300 truncate max-w-[120px]">#{recipe.tags[0]}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {visibleLimit < filteredRecipes.length && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => setVisibleLimit(prev => prev + 30)}
                className="px-6 py-3 min-h-[44px] rounded-2xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Xem thêm món ngon ({filteredRecipes.length - visibleLimit} món còn lại)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* NATIVE MOBILE BOTTOM SHEET TO ASSIGN RECIPE TO WEEKLY SLOT */}
      {assigningRecipe && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setAssigningRecipe(null)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              transform: assignDragY > 0 ? `translateY(${assignDragY}px)` : undefined,
              transition: assignDragY === 0 ? 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
            }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl p-4 sm:p-5 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] space-y-4 animate-slide-up border-t border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
          >
            {/* Swipe handle bar */}
            <div 
              onTouchStart={(e) => { assignTouchStartY.current = e.touches[0].clientY; }}
              onTouchMove={(e) => {
                if (assignTouchStartY.current === null) return;
                const diff = e.touches[0].clientY - assignTouchStartY.current;
                setAssignDragY(Math.max(0, diff));
              }}
              onTouchEnd={() => {
                if (assignDragY > 75) setAssigningRecipe(null);
                setAssignDragY(0);
                assignTouchStartY.current = null;
              }}
              className="w-full py-2 cursor-grab active:cursor-grabbing flex items-center justify-center -mt-2 mb-1"
            >
              <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1D4ED8] dark:text-blue-400" />
                <span>Xếp Vào Thực Đơn Tuần</span>
              </h3>
              <button 
                onClick={() => setAssigningRecipe(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Gán món <strong className="text-slate-900 dark:text-white">{assigningRecipe.title}</strong> vào thực đơn tuần để chuẩn bị nguyên liệu đi chợ.
            </p>

            {/* Day Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chọn Ngày:</label>
              <select
                value={targetDay}
                onChange={e => setTargetDay(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs focus:outline-none"
              >
                {weeklyPlan.map(day => (
                  <option key={day.dayId} value={day.dayId}>
                    {day.dayName}
                  </option>
                ))}
              </select>
            </div>

            {/* Meal Slot Selector: 4 Slots (Breakfast, Lunch, Dinner, Snack) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Bữa Ăn:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'breakfast', label: 'Sáng', icon: '☀️' },
                  { id: 'lunch', label: 'Trưa', icon: '🌤️' },
                  { id: 'dinner', label: 'Tối', icon: '🌙' },
                  { id: 'snack', label: 'Xế', icon: '🍎' }
                ].map(slot => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setTargetSlot(slot.id as MealSlot)}
                    className={`p-2 rounded-xl border text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      targetSlot === slot.id
                        ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white font-black shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-sm">{slot.icon}</span>
                    <span>{slot.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setAssigningRecipe(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleApplyRecipe}
                className="flex-1 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-black text-xs shadow-xs cursor-pointer"
              >
                Xác Nhận Gán
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

