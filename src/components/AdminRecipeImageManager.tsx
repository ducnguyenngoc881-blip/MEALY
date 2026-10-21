import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Camera, 
  Search, 
  Upload, 
  Link2, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Check,
  Plus,
  Trash2,
  ChefHat,
  ShoppingBag,
  ListOrdered,
  Eye,
  Clock,
  Flame,
  DollarSign,
  Users,
  ArrowUp,
  ArrowDown,
  Edit3,
  Monitor,
  Lock
} from 'lucide-react';
import { Recipe, Ingredient, CookingInstruction, MealCategory, Region } from '../types';
import { SafeImage } from './SafeImage';
import { 
  AdminRecipeImageOverride,
  getAdminRecipeImageOverrides,
  setAdminDishFullOverride,
  removeAdminRecipeImageOverride,
  syncAdminRecipeImageOverridesFromServer,
  getClusterCandidatesForDish,
  getDishImageUrl,
  getCookingStepImageUrl,
  COOKING_STEP_IMAGE_PRESETS,
  normalizeRecipeOverrideKey,
  applyAdminOverrideToRecipe
} from '../utils/dishImageResolver';
import { removeVietnameseTones } from '../utils/textUtils';
import { recordTelemetryEvent } from '../utils/telemetryEngine';

interface AdminRecipeImageManagerProps {
  recipes: Recipe[];
  onStatusMessage?: (msg: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  'all': 'Tất Cả Món',
  'customized': 'Đã Chỉnh Sửa',
  'mon-man': 'Món Mặn',
  'mon-canh': 'Món Canh',
  'mon-rau': 'Món Rau & Phụ',
  'mon-chay': 'Món Chay',
  'an-sang': 'Bữa Sáng',
  'trang-mieng': 'Tráng Miệng & Đồ Uống'
};

const REGION_LABELS: Record<Region, string> = {
  'bac': 'Miền Bắc',
  'trung': 'Miền Trung',
  'nam': 'Miền Nam',
  'toan-quoc': 'Toàn Quốc'
};

const INGREDIENT_CATEGORY_LABELS: Record<Ingredient['category'], string> = {
  'thit-ca': 'Quầy Thịt & Cá',
  'rau-cu': 'Quầy Rau Củ',
  'gia-vi': 'Quầy Gia Vị',
  'do-kho': 'Quầy Đồ Khô',
  'khac': 'Quầy Khác'
};

const HEAT_LEVEL_OPTIONS: Array<NonNullable<CookingInstruction['heatLevel']>> = [
  'lửa lớn',
  'lửa vừa',
  'lửa nhỏ',
  'riu riu',
  'không dùng nhiệt'
];

function compressImageFileToDataUrl(file: File, maxWidth = 720, quality = 0.84): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Không thể đọc tệp ảnh'));
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('Lỗi khi tải tệp ảnh'));
    reader.readAsDataURL(file);
  });
}

export function checkIsDesktopForAdminEditor(): boolean {
  if (typeof window === 'undefined') return true;
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
  const isMobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isWideViewport = window.innerWidth >= 1024;
  return !isMobileUa && isWideViewport;
}

export const AdminRecipeImageManager: React.FC<AdminRecipeImageManagerProps> = ({
  recipes,
  onStatusMessage
}) => {
  const [isDesktopDevice, setIsDesktopDevice] = useState<boolean>(() =>
    checkIsDesktopForAdminEditor()
  );
  const [overrides, setOverrides] = useState<Record<string, AdminRecipeImageOverride>>(() =>
    getAdminRecipeImageOverrides()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(24);

  // Full Dish Editor Modal State
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [originalTitleKey, setOriginalTitleKey] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [activeEditorTab, setActiveEditorTab] = useState<'info' | 'ingredients' | 'instructions' | 'preview'>('info');

  // Editable Draft Fields for the Dish
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftCategory, setDraftCategory] = useState<MealCategory>('mon-man');
  const [draftRegion, setDraftRegion] = useState<Region>('toan-quoc');
  const [draftDifficulty, setDraftDifficulty] = useState<'Dễ' | 'Trung bình' | 'Cầu kỳ'>('Dễ');
  const [draftPrepTime, setDraftPrepTime] = useState<number>(15);
  const [draftCookTime, setDraftCookTime] = useState<number>(25);
  const [draftServings, setDraftServings] = useState<number>(4);
  const [draftCalories, setDraftCalories] = useState<number>(450);
  const [draftCostVnd, setDraftCostVnd] = useState<number>(65000);
  const [draftChefTip, setDraftChefTip] = useState('');
  const [draftTagsText, setDraftTagsText] = useState('');
  const [draftImageUrl, setDraftImageUrl] = useState('');
  const [draftIngredients, setDraftIngredients] = useState<Ingredient[]>([]);
  const [draftInstructions, setDraftInstructions] = useState<CookingInstruction[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    syncAdminRecipeImageOverridesFromServer().then((synced) => {
      setOverrides({ ...synced });
    });

    const handleUpdate = () => {
      setOverrides({ ...getAdminRecipeImageOverrides() });
    };
    const handleViewportCheck = () => {
      const desktopNow = checkIsDesktopForAdminEditor();
      setIsDesktopDevice(desktopNow);
      if (!desktopNow) {
        setEditingRecipe(null);
      }
    };
    window.addEventListener('mealwise:recipe_images_updated', handleUpdate);
    window.addEventListener('resize', handleViewportCheck);
    return () => {
      window.removeEventListener('mealwise:recipe_images_updated', handleUpdate);
      window.removeEventListener('resize', handleViewportCheck);
    };
  }, []);

  // Deduplicate & apply overrides so every dish in the catalog reflects the latest Admin edits
  const uniqueRecipes = useMemo(() => {
    const seen = new Set<string>();
    const list: Recipe[] = [];
    for (const raw of recipes) {
      if (!raw || !raw.title) continue;
      const r = applyAdminOverrideToRecipe(raw, overrides);
      const key = normalizeRecipeOverrideKey(r.id || r.title);
      const titleKey = normalizeRecipeOverrideKey(r.title);
      if (seen.has(key) || seen.has(titleKey)) continue;
      seen.add(key);
      seen.add(titleKey);
      list.push(r);
    }
    return list;
  }, [recipes, overrides]);

  const isRecipeCustomized = (r: Recipe): boolean => {
    const byId = r.id ? overrides[normalizeRecipeOverrideKey(r.id)] : undefined;
    const byTitle = overrides[normalizeRecipeOverrideKey(r.title)];
    return Boolean(byId || byTitle);
  };

  const customizedCount = useMemo(() => {
    let count = 0;
    for (const r of uniqueRecipes) {
      if (isRecipeCustomized(r)) count++;
    }
    return count;
  }, [uniqueRecipes, overrides]);

  // Filter recipes by search query (title, ingredients, tags) & category
  const filteredRecipes = useMemo(() => {
    const qNorm = removeVietnameseTones(searchQuery.trim().toLowerCase());
    return uniqueRecipes.filter((r) => {
      const isCustom = isRecipeCustomized(r);

      if (selectedCategory === 'customized' && !isCustom) {
        return false;
      }
      if (selectedCategory !== 'all' && selectedCategory !== 'customized') {
        const cat = String(r.category || '').toLowerCase();
        if (cat !== selectedCategory) return false;
      }

      if (!qNorm) return true;
      const titleNorm = removeVietnameseTones(r.title.toLowerCase());
      const descNorm = removeVietnameseTones((r.description || '').toLowerCase());
      const ingMatch = Array.isArray(r.ingredients) && r.ingredients.some(ing =>
        removeVietnameseTones((ing.name || '').toLowerCase()).includes(qNorm)
      );
      const tagMatch = Array.isArray(r.tags) && r.tags.some(t =>
        removeVietnameseTones((t || '').toLowerCase()).includes(qNorm)
      );
      return (
        titleNorm.includes(qNorm) ||
        descNorm.includes(qNorm) ||
        ingMatch ||
        tagMatch ||
        r.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
    });
  }, [uniqueRecipes, overrides, selectedCategory, searchQuery]);

  const displayedRecipes = useMemo(
    () => filteredRecipes.slice(0, visibleCount),
    [filteredRecipes, visibleCount]
  );

  // Open editor for an existing dish
  const openEditorForRecipe = (recipe: Recipe, defaultTab: 'info' | 'ingredients' | 'instructions' | 'preview' = 'info') => {
    const merged = applyAdminOverrideToRecipe(recipe, overrides);
    const key = normalizeRecipeOverrideKey(recipe.title);
    const existingOv = (recipe.id ? overrides[normalizeRecipeOverrideKey(recipe.id)] : undefined) || overrides[key];
    const currentResolvedImage =
      existingOv?.imageUrl || getDishImageUrl(merged.title, merged.category, merged.imageUrl);

    setIsCreatingNew(false);
    setEditingRecipe(merged);
    setOriginalTitleKey(existingOv?.originalTitle || recipe.title);
    setActiveEditorTab(defaultTab);

    setDraftTitle(merged.title || '');
    setDraftDescription(merged.description || '');
    setDraftCategory(merged.category || 'mon-man');
    setDraftRegion(merged.region || 'toan-quoc');
    setDraftDifficulty(merged.difficulty || 'Dễ');
    setDraftPrepTime(Number(merged.prepTimeMinutes) || 15);
    setDraftCookTime(Number(merged.cookTimeMinutes) || 25);
    setDraftServings(Number(merged.servings) || 4);
    setDraftCalories(Number(merged.calories) || 450);
    setDraftCostVnd(Number(merged.estimatedCostVnd) || 65000);
    setDraftChefTip(merged.chefTip || '');
    setDraftTagsText(Array.isArray(merged.tags) ? merged.tags.join(', ') : '');
    setDraftImageUrl(currentResolvedImage);
    setDraftIngredients(
      Array.isArray(merged.ingredients) && merged.ingredients.length > 0
        ? merged.ingredients.map(i => ({ ...i }))
        : [{ name: 'Thịt heo', amount: 300, unit: 'g', category: 'thit-ca' }]
    );
    setDraftInstructions(
      Array.isArray(merged.instructions) && merged.instructions.length > 0
        ? merged.instructions.map((s, idx) => ({ ...s, step: idx + 1 }))
        : [
            {
              step: 1,
              title: 'Sơ chế nguyên liệu',
              content: 'Rửa sạch nguyên liệu, để ráo nước và cắt miếng vừa ăn.',
              durationMinutes: 10,
              heatLevel: 'không dùng nhiệt'
            }
          ]
    );
    setUploadError(null);
  };

  // Open editor to create a brand-new global dish
  const openCreateNewDishModal = () => {
    const newId = `admin-dish-${Date.now()}`;
    const blankRecipe: Recipe = {
      id: newId,
      title: '',
      description: 'Món ngon gia đình đậm đà, cân đối dinh dưỡng và dễ chế biến tại nhà.',
      category: 'mon-man',
      region: 'toan-quoc',
      prepTimeMinutes: 15,
      cookTimeMinutes: 25,
      servings: 4,
      calories: 480,
      estimatedCostVnd: 75000,
      imageUrl: 'https://images.unsplash.com/photo-1569058242252-623df46b5025?auto=format&fit=crop&w=600&q=80',
      ingredients: [
        { name: 'Thịt ba rọi', amount: 400, unit: 'g', category: 'thit-ca' },
        { name: 'Hành tím & Tỏi', amount: 3, unit: 'củ', category: 'gia-vi' },
        { name: 'Nước mắm ngon', amount: 2, unit: 'muỗng canh', category: 'gia-vi' }
      ],
      instructions: [
        {
          step: 1,
          title: 'Sơ chế & Ướp nguyên liệu',
          content: 'Rửa sạch nguyên liệu, thái miếng vừa ăn và ướp cùng gia vị trong 15 phút cho thấm.',
          durationMinutes: 15,
          heatLevel: 'không dùng nhiệt',
          tip: 'Ướp thêm chút đầu hành băm nhuyễn giúp món ăn dậy mùi thơm hơn.'
        },
        {
          step: 2,
          title: 'Chế biến trên bếp',
          content: 'Phi thơm hành tỏi, cho nguyên liệu chính vào đảo săn rồi rim lửa vừa đến khi chín mềm đậm vị.',
          durationMinutes: 20,
          heatLevel: 'lửa vừa'
        }
      ],
      tags: ['Cơm Nhà', 'Chuẩn Vị'],
      chefTip: 'Dùng nóng cùng cơm trắng và dưa leo thái lát sẽ rất bắt cơm.',
      difficulty: 'Dễ',
      isCustom: true
    };

    setIsCreatingNew(true);
    setEditingRecipe(blankRecipe);
    setOriginalTitleKey('');
    setActiveEditorTab('info');

    setDraftTitle('');
    setDraftDescription(blankRecipe.description);
    setDraftCategory(blankRecipe.category);
    setDraftRegion(blankRecipe.region);
    setDraftDifficulty('Dễ');
    setDraftPrepTime(15);
    setDraftCookTime(25);
    setDraftServings(4);
    setDraftCalories(480);
    setDraftCostVnd(75000);
    setDraftChefTip(blankRecipe.chefTip || '');
    setDraftTagsText('Cơm Nhà, Chuẩn Vị');
    setDraftImageUrl(blankRecipe.imageUrl);
    setDraftIngredients(blankRecipe.ingredients.map(i => ({ ...i })));
    setDraftInstructions(blankRecipe.instructions.map(s => ({ ...s })));
    setUploadError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn tệp hình ảnh hợp lệ');
      return;
    }
    setUploadError(null);
    try {
      const compressedDataUrl = await compressImageFileToDataUrl(file);
      setDraftImageUrl(compressedDataUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Không thể xử lý ảnh tải lên');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Ingredient CRUD helpers
  const handleAddIngredient = () => {
    setDraftIngredients(prev => [
      ...prev,
      { name: '', amount: 100, unit: 'g', category: 'rau-cu' }
    ]);
  };

  const handleUpdateIngredient = (index: number, patch: Partial<Ingredient>) => {
    setDraftIngredients(prev =>
      prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item))
    );
  };

  const handleRemoveIngredient = (index: number) => {
    setDraftIngredients(prev => prev.filter((_, idx) => idx !== index));
  };

  // Instruction CRUD helpers
  const handleAddInstruction = () => {
    setDraftInstructions(prev => [
      ...prev,
      {
        step: prev.length + 1,
        title: `Bước ${prev.length + 1}`,
        content: '',
        durationMinutes: 10,
        heatLevel: 'lửa vừa',
        tip: ''
      }
    ]);
  };

  const handleUpdateInstruction = (index: number, patch: Partial<CookingInstruction>) => {
    setDraftInstructions(prev =>
      prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item))
    );
  };

  const handleMoveInstruction = (index: number, direction: 'up' | 'down') => {
    setDraftInstructions(prev => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((stepObj, i) => ({ ...stepObj, step: i + 1 }));
    });
  };

  const handleRemoveInstruction = (index: number) => {
    setDraftInstructions(prev =>
      prev.filter((_, idx) => idx !== index).map((s, i) => ({ ...s, step: i + 1 }))
    );
  };

  // Save all dish fields (image, recipe steps, ingredients, nutrition, cost, metadata)
  const handleSaveFullDish = async () => {
    if (!editingRecipe) return;
    const cleanTitle = draftTitle.trim();
    if (!cleanTitle) {
      setUploadError('Vui lòng nhập tên món ăn');
      setActiveEditorTab('info');
      return;
    }
    const cleanUrl = draftImageUrl.trim() || getDishImageUrl(cleanTitle, draftCategory);
    const cleanedIngredients = draftIngredients
      .filter(i => String(i.name || '').trim().length > 0)
      .map(i => ({
        name: String(i.name).trim(),
        amount: Number.isFinite(Number(i.amount)) && String(i.amount).trim() !== '' ? Number(i.amount) : i.amount,
        unit: String(i.unit || 'g').trim(),
        category: i.category || 'khac'
      }));

    const cleanedInstructions = draftInstructions
      .filter(s => String(s.title || '').trim().length > 0 || String(s.content || '').trim().length > 0)
      .map((s, idx) => ({
        step: idx + 1,
        title: String(s.title || `Bước ${idx + 1}`).trim(),
        content: String(s.content || '').trim(),
        durationMinutes: Number(s.durationMinutes) || 5,
        heatLevel: s.heatLevel || 'lửa vừa',
        ...(s.tip ? { tip: String(s.tip).trim() } : {}),
        ...(s.imageUrl && String(s.imageUrl).trim() ? { imageUrl: String(s.imageUrl).trim() } : {})
      }));

    const parsedTags = draftTagsText
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    setIsSaving(true);
    setUploadError(null);
    try {
      const updated = await setAdminDishFullOverride({
        recipeId: editingRecipe.id,
        originalTitle: originalTitleKey || cleanTitle,
        title: cleanTitle,
        description: draftDescription.trim(),
        category: draftCategory,
        region: draftRegion,
        difficulty: draftDifficulty,
        prepTimeMinutes: Math.max(0, Number(draftPrepTime) || 0),
        cookTimeMinutes: Math.max(0, Number(draftCookTime) || 0),
        servings: Math.max(1, Number(draftServings) || 4),
        calories: Math.max(0, Number(draftCalories) || 0),
        estimatedCostVnd: Math.max(0, Number(draftCostVnd) || 0),
        chefTip: draftChefTip.trim(),
        tags: parsedTags.length > 0 ? parsedTags : ['Chuẩn Vị Nhà'],
        imageUrl: cleanUrl,
        ingredients: cleanedIngredients,
        instructions: cleanedInstructions,
        isNewAdminDish: isCreatingNew ? true : undefined
      });
      setOverrides({ ...updated });
      recordTelemetryEvent(
        'weekly',
        `Quản trị viên đã cập nhật toàn diện món "${cleanTitle}" (${cleanedIngredients.length} nguyên liệu, ${cleanedInstructions.length} bước nấu)`,
        'Quản Trị Viên'
      );
      if (onStatusMessage) {
        onStatusMessage(
          `✅ Đã lưu toàn bộ thông tin, hình ảnh, ${cleanedIngredients.length} nguyên liệu và ${cleanedInstructions.length} bước công thức cho món "${cleanTitle}"!`
        );
      }
      setEditingRecipe(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async (recipe: Recipe) => {
    setIsSaving(true);
    try {
      const key = normalizeRecipeOverrideKey(recipe.title);
      const ov = (recipe.id ? overrides[normalizeRecipeOverrideKey(recipe.id)] : undefined) || overrides[key];
      const updated = await removeAdminRecipeImageOverride(
        recipe.title,
        recipe.id,
        ov?.originalTitle || recipe.title
      );
      setOverrides({ ...updated });
      if (onStatusMessage) {
        onStatusMessage(`↩️ Đã khôi phục toàn bộ công thức, nguyên liệu và ảnh mặc định cho món "${recipe.title}"`);
      }
      if (editingRecipe && normalizeRecipeOverrideKey(editingRecipe.id) === normalizeRecipeOverrideKey(recipe.id)) {
        setEditingRecipe(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const clusterCandidates = useMemo(() => {
    if (!editingRecipe && !draftTitle) return [];
    return getClusterCandidatesForDish(draftTitle || editingRecipe?.title || '', draftCategory);
  }, [editingRecipe, draftTitle, draftCategory]);

  // STRICT DESKTOP-ONLY HARDWARE & VIEWPORT GATE
  if (!isDesktopDevice) {
    return (
      <div className="p-6 sm:p-10 rounded-3xl bg-stone-900 border border-amber-500/40 text-white shadow-2xl max-w-2xl mx-auto my-6 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/10">
          <Monitor className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-black uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Chỉ Dành Cho Máy Tính Để Bàn</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white">
            Tính Năng Quản Lý Món &amp; Công Thức Không Hỗ Trợ Trên Thiết Bị Di Động
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-lg mx-auto">
            Trình quản lý toàn diện món ăn, định lượng nguyên liệu đi chợ và các bước nấu ăn yêu cầu màn hình lớn trên máy tính để bàn hoặc laptop (tối thiểu 1024px) nhằm đảm bảo độ chính xác dữ liệu cho toàn hệ thống.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-xs text-stone-400 space-y-1.5 text-left max-w-md mx-auto">
          <p className="font-bold text-amber-300">Hướng dẫn dành cho Quản Trị Viên:</p>
          <p>• Vui lòng đăng nhập tài khoản Quản Trị trên trình duyệt máy tính để bàn hoặc laptop.</p>
          <p>• Mở rộng cửa sổ trình duyệt từ 1024px trở lên để mở khóa công cụ chỉnh sửa món ăn, công thức và nguyên liệu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header & Summary Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Quản Lý Món Ăn, Công Thức &amp; Nguyên Liệu Toàn Hệ Thống
                </h2>
                <p className="text-xs text-stone-400">
                  Chỉnh sửa tên món, hình ảnh, định lượng nguyên liệu đi chợ, các bước chế biến, chi phí và calo cho bất kỳ món ăn nào.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <span className="px-3 py-1.5 rounded-2xl bg-stone-800 border border-stone-700 text-xs font-mono font-bold text-stone-200">
              Tổng: {uniqueRecipes.length} món
            </span>
            <span className="px-3 py-1.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Đã tùy chỉnh: {customizedCount} món
            </span>
            <button
              type="button"
              onClick={openCreateNewDishModal}
              className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Món Mới</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(24);
              }}
              placeholder="Tìm theo tên món, nguyên liệu hoặc nhãn (ví dụ: Thịt kho tàu, Cá lóc, Bữa sáng...)"
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-stone-950 border border-stone-800 text-xs sm:text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
              <button
                key={catKey}
                type="button"
                onClick={() => {
                  setSelectedCategory(catKey);
                  setVisibleCount(24);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === catKey
                    ? 'bg-amber-500 text-stone-950 font-black shadow-md shadow-amber-500/20'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dish Cards Grid */}
      {displayedRecipes.length === 0 ? (
        <div className="p-12 rounded-3xl bg-stone-900 border border-stone-800 text-center space-y-3">
          <p className="text-sm font-bold text-stone-300">
            Không tìm thấy món ăn nào khớp với bộ lọc hiện tại.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-amber-400 cursor-pointer"
            >
              Xóa bộ lọc tìm kiếm
            </button>
            <button
              type="button"
              onClick={openCreateNewDishModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-stone-950 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo Món Ăn Mới</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedRecipes.map((recipe) => {
            const isCustom = isRecipeCustomized(recipe);
            const key = normalizeRecipeOverrideKey(recipe.title);
            const ov = (recipe.id ? overrides[normalizeRecipeOverrideKey(recipe.id)] : undefined) || overrides[key];
            const displayUrl = ov?.imageUrl || getDishImageUrl(recipe.title, recipe.category, recipe.imageUrl);
            const ingCount = Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0;
            const stepCount = Array.isArray(recipe.instructions) ? recipe.instructions.length : 0;
            const totalMinutes = (Number(recipe.prepTimeMinutes) || 0) + (Number(recipe.cookTimeMinutes) || 0);

            return (
              <div
                key={recipe.id || key}
                className={`rounded-3xl bg-stone-900 border overflow-hidden flex flex-col justify-between transition-all hover:border-amber-500/50 ${
                  isCustom ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-stone-800'
                }`}
              >
                <div>
                  <div className="relative h-44 w-full bg-stone-950 overflow-hidden group">
                    <SafeImage
                      src={displayUrl}
                      alt={recipe.title}
                      category={recipe.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />

                    {/* Top Status Indicator */}
                    {isCustom && (
                      <div className="absolute top-2.5 right-2.5 flex items-center justify-end">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-stone-950 text-[10px] font-black flex items-center gap-1 shadow-lg">
                          <Check className="w-3 h-3 stroke-[3]" />
                          Đã sửa
                        </span>
                      </div>
                    )}

                    {/* Dish Title & Quick Price/Calorie Overlay */}
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <p className="text-sm font-black text-white line-clamp-1 drop-shadow">
                        {recipe.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-amber-300 font-bold mt-0.5">
                        <span>{(recipe.estimatedCostVnd || 0).toLocaleString('vi-VN')}đ</span>
                        <span>•</span>
                        <span>{recipe.calories || 0} kcal</span>
                        <span>•</span>
                        <span>{totalMinutes} phút</span>
                      </div>
                    </div>
                  </div>

                  {/* Recipe & Ingredient Summary Strip */}
                  <div className="px-3.5 pt-3 pb-1 space-y-2">
                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed min-h-[32px]">
                      {recipe.description || 'Món ngon gia đình đậm đà, dễ nấu.'}
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => openEditorForRecipe(recipe, 'info')}
                        className="px-2 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-[10.5px] font-bold text-stone-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="Đổi ảnh & thông tin món"
                      >
                        <Camera className="w-3 h-3 text-amber-400" />
                        <span>Ảnh &amp; Giá</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditorForRecipe(recipe, 'ingredients')}
                        className="px-2 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-[10.5px] font-bold text-stone-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="Sửa nguyên liệu đi chợ"
                      >
                        <ShoppingBag className="w-3 h-3 text-emerald-400" />
                        <span>{ingCount} NLiệu</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditorForRecipe(recipe, 'instructions')}
                        className="px-2 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-[10.5px] font-bold text-stone-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="Sửa các bước công thức nấu"
                      >
                        <ListOrdered className="w-3 h-3 text-sky-400" />
                        <span>{stepCount} Bước</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-3.5 pt-2.5 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => openEditorForRecipe(recipe, 'info')}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Chỉnh Sửa Món</span>
                  </button>

                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => handleResetToDefault(recipe)}
                      disabled={isSaving}
                      className="p-2 rounded-xl bg-stone-800 hover:bg-rose-500/20 text-stone-300 hover:text-rose-300 border border-stone-700 transition-colors cursor-pointer"
                      title="Khôi phục toàn bộ món về mặc định"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Pagination */}
      {filteredRecipes.length > visibleCount && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 24)}
            className="px-6 py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-bold text-stone-200 transition-colors cursor-pointer"
          >
            Xem thêm món ăn ({filteredRecipes.length - visibleCount} món còn lại)
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* FULL DISH, RECIPE & INGREDIENT EDITOR MODAL                           */}
      {/* ===================================================================== */}
      {editingRecipe && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={() => setEditingRecipe(null)}
        >
          <div
            className="w-full max-w-4xl rounded-3xl bg-stone-900 border border-stone-700 shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-white truncate">
                    {isCreatingNew ? 'Thêm Món Ăn Mới Vào Hệ Thống' : `Chỉnh Sửa Toàn Diện: ${draftTitle || editingRecipe.title}`}
                  </h3>
                  <p className="text-[11px] text-stone-400 truncate">
                    Mọi thay đổi về ảnh, nguyên liệu, bước nấu và chi phí sẽ áp dụng tức thì trên toàn ứng dụng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecipe(null)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4-Tab Navigation Bar */}
            <div className="px-5 pt-3 pb-2 bg-stone-950/40 border-b border-stone-800 flex items-center gap-2 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setActiveEditorTab('info')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeEditorTab === 'info'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-md shadow-amber-500/20'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>1. Thông Tin &amp; Hình Ảnh</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveEditorTab('ingredients')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeEditorTab === 'ingredients'
                    ? 'bg-emerald-500 text-stone-950 font-black shadow-md shadow-emerald-500/20'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>2. Nguyên Liệu Đi Chợ ({draftIngredients.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveEditorTab('instructions')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeEditorTab === 'instructions'
                    ? 'bg-sky-500 text-stone-950 font-black shadow-md shadow-sky-500/20'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>3. Công Thức &amp; Bước Nấu ({draftInstructions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveEditorTab('preview')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeEditorTab === 'preview'
                    ? 'bg-purple-500 text-white font-black shadow-md shadow-purple-500/20'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>4. Xem Trước Món Ăn</span>
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 font-semibold">
                  ⚠️ {uploadError}
                </div>
              )}

              {/* =============================================================== */}
              {/* TAB 1: THÔNG TIN CHUNG, DINH DƯỠNG & HÌNH ẢNH                   */}
              {/* =============================================================== */}
              {activeEditorTab === 'info' && (
                <div className="space-y-5">
                  {/* Top Row: Image Preview & Upload Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                    <div className="md:col-span-5 rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 h-56 relative">
                      <SafeImage
                        src={draftImageUrl || getDishImageUrl(draftTitle || editingRecipe.title, draftCategory)}
                        alt={draftTitle || editingRecipe.title}
                        category={draftCategory}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/75 text-[10px] font-bold text-amber-300">
                        Ảnh hiển thị của món
                      </span>
                    </div>

                    <div className="md:col-span-7 flex flex-col justify-between space-y-3 bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-stone-300">
                          Tải ảnh mới từ máy tính hoặc dán đường dẫn ảnh
                        </label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 border border-dashed border-amber-500/50 text-xs font-bold text-amber-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Chọn tệp ảnh từ máy tính (Tự động tối ưu dung lượng)</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-stone-400 flex items-center gap-1.5">
                          <Link2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>Đường dẫn hình ảnh trực tiếp (URL hoặc Base64):</span>
                        </label>
                        <input
                          type="text"
                          value={draftImageUrl}
                          onChange={(e) => setDraftImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Quick Curated Photo Picker */}
                      {clusterCandidates.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <label className="text-[10.5px] font-bold text-stone-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Gợi ý ảnh món ăn chuẩn vị (Chạm để chọn nhanh):</span>
                          </label>
                          <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {clusterCandidates.slice(0, 6).map((candUrl, idx) => {
                              const isSelected = draftImageUrl === candUrl;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setDraftImageUrl(candUrl)}
                                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                                    isSelected ? 'border-amber-400 scale-105' : 'border-stone-800 opacity-75 hover:opacity-100'
                                  }`}
                                >
                                  <img src={candUrl} alt="" className="w-full h-full object-cover" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dish Core Metadata Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-950/50 p-4 rounded-2xl border border-stone-800">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-stone-300">Tên món ăn *</label>
                      <input
                        type="text"
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        placeholder="Ví dụ: Thịt Kho Tàu Trứng Vịt Dừa Tươi"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-stone-300">Mô tả giới thiệu món ăn</label>
                      <textarea
                        rows={2}
                        value={draftDescription}
                        onChange={(e) => setDraftDescription(e.target.value)}
                        placeholder="Mô tả hương vị, độ dinh dưỡng và điểm hấp dẫn của món ăn..."
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-300">Danh mục món ăn</label>
                      <select
                        value={draftCategory}
                        onChange={(e) => setDraftCategory(e.target.value as MealCategory)}
                        className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="mon-man">Món Mặn (Món Chính)</option>
                        <option value="mon-canh">Món Canh</option>
                        <option value="mon-rau">Món Rau &amp; Món Phụ</option>
                        <option value="mon-chay">Món Chay</option>
                        <option value="an-sang">Bữa Sáng</option>
                        <option value="trang-mieng">Tráng Miệng &amp; Đồ Uống</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-300">Vùng miền</label>
                        <select
                          value={draftRegion}
                          onChange={(e) => setDraftRegion(e.target.value as Region)}
                          className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="toan-quoc">Toàn Quốc</option>
                          <option value="bac">Miền Bắc</option>
                          <option value="trung">Miền Trung</option>
                          <option value="nam">Miền Nam</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-300">Độ khó</label>
                        <select
                          value={draftDifficulty}
                          onChange={(e) => setDraftDifficulty(e.target.value as 'Dễ' | 'Trung bình' | 'Cầu kỳ')}
                          className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="Dễ">Dễ</option>
                          <option value="Trung bình">Trung bình</option>
                          <option value="Cầu kỳ">Cầu kỳ</option>
                        </select>
                      </div>
                    </div>

                    {/* Time, Servings, Calories, Cost */}
                    <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-sky-400" />
                          <span>Sơ chế (phút)</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={draftPrepTime}
                          onChange={(e) => setDraftPrepTime(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Nấu (phút)</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={draftCookTime}
                          onChange={(e) => setDraftCookTime(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-400 flex items-center gap-1">
                          <Users className="w-3 h-3 text-emerald-400" />
                          <span>Khẩu phần</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={draftServings}
                          onChange={(e) => setDraftServings(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-stone-400 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400" />
                          <span>Calo (kcal)</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={10}
                          value={draftCalories}
                          onChange={(e) => setDraftCalories(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-white"
                        />
                      </div>

                      <div className="space-y-1 col-span-2 sm:col-span-1">
                        <label className="text-[11px] font-bold text-stone-400 flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-emerald-400" />
                          <span>Chi phí (VNĐ)</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={1000}
                          value={draftCostVnd}
                          onChange={(e) => setDraftCostVnd(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-emerald-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-300">Bí quyết / Mẹo đầu bếp</label>
                      <input
                        type="text"
                        value={draftChefTip}
                        onChange={(e) => setDraftChefTip(e.target.value)}
                        placeholder="Ví dụ: Kho bằng nước dừa tươi giúp thịt mềm và lên màu đẹp..."
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-300">Nhãn phân loại (ngăn cách bằng dấu phẩy)</label>
                      <input
                        type="text"
                        value={draftTagsText}
                        onChange={(e) => setDraftTagsText(e.target.value)}
                        placeholder="Ví dụ: Cơm Mẹ Nấu, Giàu Đạm, Ít Cay"
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* TAB 2: NGUYÊN LIỆU ĐI CHỢ (INGREDIENTS EDITOR)                  */}
              {/* =============================================================== */}
              {activeEditorTab === 'ingredients' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-emerald-400" />
                        <span>Danh Sách Nguyên Liệu Cho {draftServings} Khẩu Phần</span>
                      </h4>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Khi sửa nguyên liệu tại đây, danh sách Đi Chợ Tự Động và Sổ Tay Công Thức sẽ tự động cập nhật theo.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Nguyên Liệu</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {draftIngredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                      >
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] font-bold text-stone-400 mb-1">
                            Tên nguyên liệu #{idx + 1}
                          </label>
                          <input
                            type="text"
                            value={ing.name}
                            onChange={(e) => handleUpdateIngredient(idx, { name: e.target.value })}
                            placeholder="Ví dụ: Thịt ba chỉ rút sườn"
                            className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:col-span-3">
                          <div>
                            <label className="block text-[10px] font-bold text-stone-400 mb-1">
                              Định lượng
                            </label>
                            <input
                              type="text"
                              value={ing.amount}
                              onChange={(e) => handleUpdateIngredient(idx, { amount: e.target.value })}
                              placeholder="400"
                              className="w-full px-2.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-amber-300"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-stone-400 mb-1">
                              Đơn vị
                            </label>
                            <input
                              type="text"
                              value={ing.unit}
                              onChange={(e) => handleUpdateIngredient(idx, { unit: e.target.value })}
                              placeholder="g, ml, quả..."
                              className="w-full px-2.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-white"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold text-stone-400 mb-1">
                            Phân quầy đi chợ
                          </label>
                          <select
                            value={ing.category || 'khac'}
                            onChange={(e) =>
                              handleUpdateIngredient(idx, {
                                category: e.target.value as Ingredient['category']
                              })
                            }
                            className="w-full px-2.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs font-semibold text-white"
                          >
                            {Object.entries(INGREDIENT_CATEGORY_LABELS).map(([k, lbl]) => (
                              <option key={k} value={k}>
                                {lbl}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-4">
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(idx)}
                            className="p-2 rounded-xl bg-stone-900 hover:bg-rose-500/20 text-stone-400 hover:text-rose-400 border border-stone-800 cursor-pointer"
                            title="Xóa nguyên liệu này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* TAB 3: CÔNG THỨC & CÁC BƯỚC NẤU (INSTRUCTIONS EDITOR)           */}
              {/* =============================================================== */}
              {activeEditorTab === 'instructions' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <ListOrdered className="w-4 h-4 text-sky-400" />
                        <span>Quy Trình Chế Biến Từng Bước ({draftInstructions.length} bước)</span>
                      </h4>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Chỉnh sửa tiêu đề bước, hướng dẫn chi tiết, thời gian hẹn giờ trên bếp và mức lửa.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddInstruction}
                      className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-stone-950 font-black text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Bước Nấu</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {draftInstructions.map((inst, idx) => {
                      const resolvedStepPreviewUrl = getCookingStepImageUrl(
                        {
                          id: editingRecipe.id,
                          title: draftTitle || editingRecipe.title,
                          category: draftCategory,
                          imageUrl: draftImageUrl,
                          ingredients: draftIngredients
                        },
                        { ...inst, step: idx + 1 },
                        draftInstructions.length
                      );

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="w-7 h-7 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 font-black text-xs flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <input
                                type="text"
                                value={inst.title}
                                onChange={(e) => handleUpdateInstruction(idx, { title: e.target.value })}
                                placeholder="Tiêu đề bước (ví dụ: Sơ chế & Ướp thịt)"
                                className="flex-1 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs sm:text-sm font-bold text-white"
                              />
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleMoveInstruction(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-stone-300 border border-stone-800 cursor-pointer"
                                title="Chuyển lên"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveInstruction(idx, 'down')}
                                disabled={idx === draftInstructions.length - 1}
                                className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-stone-300 border border-stone-800 cursor-pointer"
                                title="Chuyển xuống"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveInstruction(idx)}
                                className="p-1.5 rounded-lg bg-stone-900 hover:bg-rose-500/20 text-stone-400 hover:text-rose-400 border border-stone-800 cursor-pointer"
                                title="Xóa bước này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <textarea
                            rows={2}
                            value={inst.content}
                            onChange={(e) => handleUpdateInstruction(idx, { content: e.target.value })}
                            placeholder="Nhập hướng dẫn chi tiết cho bước này..."
                            className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-100 leading-relaxed"
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-bold text-stone-400 mb-1">
                                Thời gian bước (phút)
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={inst.durationMinutes ?? 5}
                                onChange={(e) =>
                                  handleUpdateInstruction(idx, { durationMinutes: Number(e.target.value) })
                                }
                                className="w-full px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-bold text-amber-300"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-stone-400 mb-1">
                                Mức nhiệt / Lửa
                              </label>
                              <select
                                value={inst.heatLevel || 'lửa vừa'}
                                onChange={(e) =>
                                  handleUpdateInstruction(idx, {
                                    heatLevel: e.target.value as CookingInstruction['heatLevel']
                                  })
                                }
                                className="w-full px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs font-semibold text-white"
                              >
                                {HEAT_LEVEL_OPTIONS.map((hl) => (
                                  <option key={hl} value={hl}>
                                    Canh {hl}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-stone-400 mb-1">
                                Mẹo nhỏ ở bước này
                              </label>
                              <input
                                type="text"
                                value={inst.tip || ''}
                                onChange={(e) => handleUpdateInstruction(idx, { tip: e.target.value })}
                                placeholder="Ví dụ: Hớt bọt để nước trong..."
                                className="w-full px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-stone-200"
                              />
                            </div>
                          </div>

                          {/* Step Completion Image Preview & Customization */}
                          <div className="pt-2.5 border-t border-stone-800/80 flex flex-col sm:flex-row gap-3 items-start">
                            <div className="relative w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-stone-900 border border-stone-700 shrink-0">
                              <SafeImage
                                src={resolvedStepPreviewUrl}
                                alt={`Kết quả Bước ${idx + 1}`}
                                category={draftCategory}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 left-1.5 px-2 py-0.5 rounded bg-black/75 text-[9.5px] font-bold text-amber-300">
                                Kết quả Bước {idx + 1}
                              </span>
                            </div>

                            <div className="flex-1 w-full space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <label className="text-[10.5px] font-bold text-stone-300 flex items-center gap-1.5">
                                  <Camera className="w-3.5 h-3.5 text-sky-400" />
                                  <span>Ảnh minh họa kết quả sau Bước {idx + 1} (Tự động hoặc tùy chỉnh):</span>
                                </label>
                                {inst.imageUrl && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateInstruction(idx, { imageUrl: '' })}
                                    className="text-[10px] font-bold text-amber-400 hover:underline cursor-pointer"
                                  >
                                    Khôi phục ảnh tự động
                                  </button>
                                )}
                              </div>

                              <input
                                type="text"
                                value={inst.imageUrl || ''}
                                onChange={(e) => handleUpdateInstruction(idx, { imageUrl: e.target.value })}
                                placeholder="Để trống để hệ thống tự chọn ảnh bước nấu phù hợp, hoặc dán đường dẫn ảnh..."
                                className="w-full px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-xs text-white placeholder:text-stone-500"
                              />

                              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                                {COOKING_STEP_IMAGE_PRESETS.map((preset) => {
                                  const isSelected = inst.imageUrl === preset.url;
                                  return (
                                    <button
                                      key={preset.id}
                                      type="button"
                                      onClick={() => handleUpdateInstruction(idx, { imageUrl: preset.url })}
                                      title={preset.label}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap border transition-all cursor-pointer shrink-0 ${
                                        isSelected
                                          ? 'bg-sky-500 text-stone-950 border-sky-400 font-black'
                                          : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white hover:border-stone-600'
                                      }`}
                                    >
                                      {preset.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* TAB 4: XEM TRƯỚC TRỰC TIẾP (LIVE PREVIEW)                       */}
              {/* =============================================================== */}
              {activeEditorTab === 'preview' && (
                <div className="space-y-4 bg-stone-950/70 p-4 sm:p-5 rounded-2xl border border-stone-800">
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="w-full sm:w-48 h-36 rounded-2xl overflow-hidden bg-stone-900 border border-stone-700 shrink-0">
                      <SafeImage
                        src={draftImageUrl || getDishImageUrl(draftTitle || 'Món ăn', draftCategory)}
                        alt={draftTitle}
                        category={draftCategory}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h4 className="text-lg font-black text-white">
                        {draftTitle || 'Chưa đặt tên món ăn'}
                      </h4>
                      <p className="text-xs text-stone-300 leading-relaxed">
                        {draftDescription}
                      </p>
                      <div className="flex items-center gap-4 text-xs font-bold text-amber-400 pt-1 flex-wrap">
                        <span>💰 {(Number(draftCostVnd) || 0).toLocaleString('vi-VN')} đ</span>
                        <span>🔥 {draftCalories} kcal</span>
                        <span>⏱️ {Number(draftPrepTime) + Number(draftCookTime)} phút</span>
                        <span>👨‍👩‍👧‍👦 {draftServings} người</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-stone-800">
                    <div className="space-y-2">
                      <h5 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                        Nguyên Liệu ({draftIngredients.filter(i => i.name.trim()).length})
                      </h5>
                      <ul className="space-y-1.5 text-xs">
                        {draftIngredients
                          .filter(i => i.name.trim())
                          .map((ing, i) => (
                            <li
                              key={i}
                              className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-stone-900 border border-stone-800"
                            >
                              <span className="font-semibold text-stone-200">{ing.name}</span>
                              <span className="font-mono text-amber-300 font-bold">
                                {ing.amount} {ing.unit}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xs font-black uppercase tracking-wider text-sky-400">
                        Các Bước Chế Biến ({draftInstructions.length})
                      </h5>
                      <ol className="space-y-2 text-xs">
                        {draftInstructions.map((st, i) => {
                          const previewStepImg = getCookingStepImageUrl(
                            {
                              id: editingRecipe.id,
                              title: draftTitle || editingRecipe.title,
                              category: draftCategory,
                              imageUrl: draftImageUrl,
                              ingredients: draftIngredients
                            },
                            { ...st, step: i + 1 },
                            draftInstructions.length
                          );
                          return (
                            <li
                              key={i}
                              className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex items-start justify-between gap-2.5"
                            >
                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center justify-between font-bold text-white gap-2">
                                  <span className="truncate">
                                    Bước {i + 1}: {st.title}
                                  </span>
                                  <span className="text-[10px] text-amber-300 shrink-0">
                                    {st.durationMinutes || 5}p • {st.heatLevel || 'lửa vừa'}
                                  </span>
                                </div>
                                <p className="text-stone-300 text-[11px] leading-relaxed">{st.content}</p>
                              </div>
                              <div className="w-16 h-14 rounded-lg overflow-hidden border border-stone-700 shrink-0 bg-stone-950">
                                <SafeImage
                                  src={previewStepImg}
                                  alt={`Bước ${i + 1}`}
                                  category={draftCategory}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-stone-800 bg-stone-950/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div>
                {!isCreatingNew && isRecipeCustomized(editingRecipe) && (
                  <button
                    type="button"
                    onClick={() => handleResetToDefault(editingRecipe)}
                    disabled={isSaving}
                    className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-rose-500/20 text-stone-300 hover:text-rose-300 border border-stone-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Khôi Phục Mặc Định</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setEditingRecipe(null)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveFullDish}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi Toàn Hệ Thống'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
