import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useMealWise, ExtraGroceryItem } from '../context/MealWiseContext';
import { 
  X, 
  Clock, 
  Flame, 
  Users, 
  Utensils, 
  ChefHat, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Sparkles,
  Timer,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  ShoppingCart,
  Play,
  Pause,
  Bell,
  CheckCircle2,
  Volume2,
  FileText,
  Gamepad2,
  Dices,
  Share2,
  Lock,
  Camera
} from 'lucide-react';
import { SafeImage } from './SafeImage';
import { Ingredient, CookingInstruction, Recipe } from '../types';
import { getCookingStepImageUrl, hasUserProvidedRecipeImage } from '../utils/dishImageResolver';
import { VolunteerAdSequenceModal } from './VolunteerAdSequenceModal';
import { recordAdImpression, recordVolunteerAdWatched, isUserAdFree } from '../utils/adTrackingService';

export async function shareCustomRecipe(
  recipe: Recipe,
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void
) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mealwise:open-share-recipe', { detail: recipe }));
    return;
  }
  showToast('⚠️ Không thể mở bảng chia sẻ lúc này.', 'warning');
}

// Gen Z Easter Egg Funny Quotes for "Nấu rảnh tay"
const GEN_Z_HANDS_FREE_QUOTES = [
  "Rảnh tay lướt TikTok đê mà vẫn nấu được ngon ơ! 📱✨",
  "Bật mode chill: Tay lướt Threads hóng biến, nồi cơm vẫn tự sôi thơm phức 🍲💅",
  "Đầu bếp hệ Gen Z: Nấu ăn bằng tâm linh, canh giờ bằng thuật toán Tóp Tóp 🔮🧑‍🍳",
  "Nấu ăn không quạu: Tay lướt video, mắt liếc nồi canh, 10 điểm không có nhưng! 💯😎",
  "Bận chữa lành trên Reels nhưng bếp núc vẫn keo lỳ tái châu nha mí bà 💖🥗",
  "Rảnh tay chốt đơn Shopee, nồi thịt kho vẫn lên màu chuẩn cánh gián cực mượt 🛒🍳",
  "Flex nhẹ khả năng đa nhiệm: Vừa hóng drama vừa luộc rau xanh mướt không bị úa 🥬🔥",
  "Hệ tư tưởng nấu ăn mới: Thong dong như idol Kpop, món ngon ra lò xịn đét 🎤🥘",
  "Ủa alo, rảnh tay thế này làm một con nhảy biến hình xong là đồ ăn chín vừa đẹp! 💃🍲",
  "Bật mood thảnh thơi: Việc gì khó có Mealy lo, việc bạn là slay và măm măm ✨😋",
  "Trạng thái hiện tại: Đầu óc trên mây, tay bấm điện thoại, mâm cơm vẫn chuẩn cơm mẹ nấu! 🚀🍛",
  "Không áp lực, chỉ có ẩm thực! Vừa nghe lofi vừa nấu ăn đỉnh chóp hết nấc 🎧🍳"
];

interface CategorizedGroup {
  key: 'thit-ca' | 'rau-cu' | 'gia-vi';
  title: string;
  badgeLabel: string;
  badgeClass: string;
  dotClass: string;
  items: { ingredient: Ingredient; originalIndex: number }[];
}

interface PantryMatchResult {
  inFridge: boolean;
  pantryId?: string;
  pantryName?: string;
  quantity?: string;
}

/**
 * Intelligent helper to match a recipe ingredient name against current pantry items
 */
function findPantryMatchForIngredient(
  ingredientName: string,
  pantryItems: Array<{ id: string; name: string; quantity?: string }>
): PantryMatchResult {
  if (!ingredientName || !pantryItems || pantryItems.length === 0) {
    return { inFridge: false };
  }
  const ingClean = ingredientName.toLowerCase().trim();

  // Strip prep/form words for broader entity matching
  const stripPrep = (str: string) =>
    str
      .toLowerCase()
      .replace(/\b(thịt|con|miếng|quả|củ|nhánh|tép|trái|gói|hộp|tươi|khô|sống|chín|băm|xay|thái|cắt|lát|khúc)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const ingStripped = stripPrep(ingClean);

  const match = pantryItems.find(p => {
    const pClean = p.name.toLowerCase().trim();
    if (ingClean === pClean) return true;
    if (ingClean.includes(pClean) || pClean.includes(ingClean)) return true;

    const pStripped = stripPrep(pClean);
    if (ingStripped && pStripped && (ingStripped.includes(pStripped) || pStripped.includes(ingStripped))) {
      return true;
    }
    return false;
  });

  if (match) {
    return { inFridge: true, pantryId: match.id, pantryName: match.name, quantity: match.quantity };
  }
  return { inFridge: false };
}

export const RecipeDetailModal: React.FC = () => {
  const { selectedRecipe, setSelectedRecipe, selectedMealSet, addExtraGroceryItems, showToast, user, pantryItems, removePantryItem, addCustomRecipe, customRecipes, activeTab, activePlanScope } = useMealWise();
  const isNextWeekPlanView = activeTab === 'weekly' && activePlanScope === 'next';
  const [dragY, setDragY] = useState<number>(0);
  const touchStartY = useRef<number | null>(null);

  // Pre-calculate pantry item availability for recipe ingredients
  const pantryIngredientMatches = useMemo<Record<number, PantryMatchResult>>(() => {
    if (!selectedRecipe || !pantryItems || pantryItems.length === 0) return {};
    const map: Record<number, PantryMatchResult> = {};
    selectedRecipe.ingredients.forEach((ing, idx) => {
      const match = findPantryMatchForIngredient(ing.name, pantryItems);
      if (match.inFridge) {
        map[idx] = match;
      }
    });
    return map;
  }, [selectedRecipe, pantryItems]);

  // Servings Stepper State
  const [servings, setServings] = useState<number>(selectedRecipe?.servings || 4);

  // Interactive Ingredient Checklist State
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  // Equivalent Exchange State (e.g. Olive Oil -> Household Cooking Oil) & Next Week Warning Override
  const [swappedEquivalentIngredients, setSwappedEquivalentIngredients] = useState<Record<number, boolean>>({});
  const [isNextWeekWarningDismissed, setIsNextWeekWarningDismissed] = useState<boolean>(false);

  // 2-Step Recipe Navigation: Step 1 (Ingredients) -> Step 2 (Cooking Instructions)
  const [cookingPhase, setCookingPhase] = useState<1 | 2>(1);

  // Cooking Steps Accordion & Progress State
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Hands-Free Step-by-Step Cooking Mode State
  const [isHandsFreeMode, setIsHandsFreeMode] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [showHandsFreeIngredients, setShowHandsFreeIngredients] = useState<boolean>(false);

  // Gen Z Easter Egg Quote Popup State
  const [easterEggQuote, setEasterEggQuote] = useState<string | null>(null);

  // Actionable Countdown Timer State
  const [isTimerOpen, setIsTimerOpen] = useState<boolean>(false);
  const [timerTotalDuration, setTimerTotalDuration] = useState<number>(0);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
  const [timerIsRunning, setTimerIsRunning] = useState<boolean>(false);
  const [timerLabel, setTimerLabel] = useState<string>('Hẹn giờ nấu');

  // Gaming Loading-Screen Tips & Food Easter Eggs State
  const [timerTipIndex, setTimerTipIndex] = useState<number>(0);

  // 30s Meal Completion Ad State (Triggers on ticking final step)
  const [isCompletionAdOpen, setIsCompletionAdOpen] = useState<boolean>(false);

  // Enlarged Step Completion Image Lightbox State
  const [enlargedStepImage, setEnlargedStepImage] = useState<{
    step: number;
    title: string;
    imageUrl: string;
    content: string;
  } | null>(null);

  // Hands-Free Step Card View Mode: 'text' (instruction text) vs 'image' (large step-completion photo)
  const [handsFreeCardView, setHandsFreeCardView] = useState<'text' | 'image'>('text');
  const stepBoxSwipeStartX = useRef<number | null>(null);
  const stepBoxSwipeStartY = useRef<number | null>(null);

  const handleStepBoxTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    stepBoxSwipeStartX.current = e.touches[0].clientX;
    stepBoxSwipeStartY.current = e.touches[0].clientY;
  };

  const handleStepBoxTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (stepBoxSwipeStartX.current === null || stepBoxSwipeStartY.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - stepBoxSwipeStartX.current;
    const deltaY = endY - stepBoxSwipeStartY.current;
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (handsFreeCardView === 'text') {
        setHandsFreeCardView('image');
      } else {
        setHandsFreeCardView('text');
      }
    }
    stepBoxSwipeStartX.current = null;
    stepBoxSwipeStartY.current = null;
  };

  // Author Voice Note Playback State
  const [isPlayingAuthorVoice, setIsPlayingAuthorVoice] = useState<boolean>(false);
  const authorVoiceAudioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAuthorVoicePlayback = () => {
    if (!selectedRecipe) return;
    if (isPlayingAuthorVoice) {
      if (authorVoiceAudioRef.current) {
        authorVoiceAudioRef.current.pause();
        authorVoiceAudioRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAuthorVoice(false);
      return;
    }

    const voiceUrl = selectedRecipe.authorVoiceUrl || '';
    if (voiceUrl.startsWith('data:audio')) {
      try {
        const audio = new Audio(voiceUrl);
        authorVoiceAudioRef.current = audio;
        setIsPlayingAuthorVoice(true);
        audio.onended = () => setIsPlayingAuthorVoice(false);
        audio.onerror = () => setIsPlayingAuthorVoice(false);
        audio.play().catch(() => setIsPlayingAuthorVoice(false));
        return;
      } catch {}
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const spokenText =
        (voiceUrl.startsWith('voice-tts:') ? voiceUrl.replace('voice-tts:', '') : '') ||
        selectedRecipe.authorNote ||
        `Món ${selectedRecipe.title}, nhớ nêm vừa miệng và ăn lúc còn nóng nhé!`;
      const utter = new SpeechSynthesisUtterance(spokenText);
      utter.lang = 'vi-VN';
      utter.rate = 0.95;
      setIsPlayingAuthorVoice(true);
      utter.onend = () => setIsPlayingAuthorVoice(false);
      utter.onerror = () => setIsPlayingAuthorVoice(false);
      window.speechSynthesis.speak(utter);
    }
  };

  // Roll a funny randomized Gen Z Easter Egg Quote
  const rollNewEasterEggQuote = () => {
    const available = GEN_Z_HANDS_FREE_QUOTES.filter(q => q !== easterEggQuote);
    const randomQuote = available[Math.floor(Math.random() * available.length)] || GEN_Z_HANDS_FREE_QUOTES[0];
    setEasterEggQuote(randomQuote);
  };

  // Play audio alert safely using Web Audio API
  const playTimerAlarm = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // Fallback if browser audio policy prevents sound
    }
  };

  // Sync state when recipe changes
  useEffect(() => {
    if (selectedRecipe) {
      setServings(selectedRecipe.servings || 4);
      setCookingPhase(1);
      setIsHandsFreeMode(false);
      setActiveStepIndex(0);
      setShowHandsFreeIngredients(false);
      setIsNextWeekWarningDismissed(false);
      setSwappedEquivalentIngredients({});
      setEnlargedStepImage(null);
      setHandsFreeCardView('text');

      // Start with all ingredient preparation checkboxes unchecked so the user checks them manually while preparing the meal
      setCheckedIngredients({});

      // Restore saved step completion from localStorage
      try {
        const savedProgress = localStorage.getItem(`mealwise_recipe_progress_${selectedRecipe.id}`);
        if (savedProgress) {
          setCompletedSteps(JSON.parse(savedProgress));
        } else {
          setCompletedSteps({});
        }
      } catch {
        setCompletedSteps({});
      }

      // Default expand all steps for easy scanning
      const allOpen: Record<number, boolean> = {};
      selectedRecipe.instructions.forEach(inst => {
        allOpen[inst.step] = true;
      });
      setExpandedSteps(allOpen);
    }
  }, [selectedRecipe?.id]);

  // Actionable Countdown Timer interval
  useEffect(() => {
    let interval: any = null;
    if (timerIsRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft(prev => {
          if (prev <= 1) {
            playTimerAlarm();
            showToast(`⏰ Hết giờ! Thời gian nấu cho "${timerLabel}" đã hoàn tất!`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerSecondsLeft === 0 && timerIsRunning) {
      setTimerIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerIsRunning, timerSecondsLeft, timerLabel]);

  // Touch Drag-to-dismiss gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) {
      setDragY(Math.min(diff, 200));
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 75) {
      setSelectedRecipe(null);
      setIsHandsFreeMode(false);
      setIsTimerOpen(false);
    }
    setDragY(0);
    touchStartY.current = null;
  };

  // Dynamic ingredient scaling
  const formatScaledAmount = (amount: number | string): string => {
    if (!selectedRecipe || (selectedRecipe.servings || 4) <= 0) return String(amount);
    const ratio = servings / (selectedRecipe.servings || 4);

    if (typeof amount === 'number') {
      const scaled = amount * ratio;
      if (Number.isInteger(scaled)) {
        return scaled.toString();
      }
      const rounded = Math.round(scaled * 100) / 100;
      return rounded.toString().replace('.', ',');
    }

    const str = String(amount).trim();

    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 2) {
        const num = parseFloat(parts[0].trim());
        const den = parseFloat(parts[1].trim());
        if (!isNaN(num) && !isNaN(den) && den !== 0) {
          const scaled = (num / den) * ratio;
          if (Number.isInteger(scaled)) {
            return scaled.toString();
          }
          const rounded = Math.round(scaled * 100) / 100;
          return rounded.toString().replace('.', ',');
        }
      }
    }

    const parsed = parseFloat(str.replace(',', '.'));
    if (!isNaN(parsed) && isFinite(parsed)) {
      const scaled = parsed * ratio;
      if (Number.isInteger(scaled)) {
        return scaled.toString();
      }
      const rounded = Math.round(scaled * 100) / 100;
      return rounded.toString().replace('.', ',');
    }

    return str;
  };

  // Categorize ingredient list into clean visual sections (MUST be called before any early return)
  const categorizedGroups = useMemo<CategorizedGroup[]>(() => {
    if (!selectedRecipe?.ingredients) return [];

    const groups: Record<'thit-ca' | 'rau-cu' | 'gia-vi', { ingredient: Ingredient; originalIndex: number }[]> = {
      'thit-ca': [],
      'rau-cu': [],
      'gia-vi': []
    };

    selectedRecipe.ingredients.forEach((ing, originalIndex) => {
      const cat = ing.category;
      if (cat === 'rau-cu') {
        groups['rau-cu'].push({ ingredient: ing, originalIndex });
      } else if (cat === 'gia-vi' || cat === 'do-kho') {
        groups['gia-vi'].push({ ingredient: ing, originalIndex });
      } else if (cat === 'thit-ca') {
        groups['thit-ca'].push({ ingredient: ing, originalIndex });
      } else {
        // Fallback heuristic based on common Vietnamese culinary keywords
        const lower = (ing.name || '').toLowerCase();
        if (/rau|cải|cà chua|dưa|nấm|hành|tỏi|ớt|gừng|sả|chanh|mướp|bầu|bí|giá|ngò|thì là|chuối|đậu bắp|đậu cô ve|bắp/.test(lower)) {
          groups['rau-cu'].push({ ingredient: ing, originalIndex });
        } else if (/nước mắm|nước tương|muối|tiêu|đường|hạt nêm|mì chính|bột ngọt|dầu|dầu hào|giấm|rượu|sa tế|ngũ vị|bột|mắm|tương|mè|vừng|quế|hồi/.test(lower)) {
          groups['gia-vi'].push({ ingredient: ing, originalIndex });
        } else {
          groups['thit-ca'].push({ ingredient: ing, originalIndex });
        }
      }
    });

    const result: CategorizedGroup[] = [];

    if (groups['thit-ca'].length > 0) {
      result.push({
        key: 'thit-ca',
        title: 'Nguyên liệu chính',
        badgeLabel: 'Đạm & Cốt lõi',
        badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
        dotClass: 'bg-rose-500',
        items: groups['thit-ca']
      });
    }

    if (groups['rau-cu'].length > 0) {
      result.push({
        key: 'rau-cu',
        title: 'Rau củ',
        badgeLabel: 'Rau củ tươi',
        badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
        dotClass: 'bg-emerald-500',
        items: groups['rau-cu']
      });
    }

    if (groups['gia-vi'].length > 0) {
      result.push({
        key: 'gia-vi',
        title: 'Gia vị & Ướp',
        badgeLabel: 'Gia vị & Đồ ướp',
        badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
        dotClass: 'bg-amber-500',
        items: groups['gia-vi']
      });
    }

    return result;
  }, [selectedRecipe?.ingredients]);

  // Generate contextual food tips and cooking loading-screen tips
  const loadingScreenTips = useMemo(() => {
    if (!selectedRecipe) return [];
    const tips: { text: string; tag: string }[] = [];

    // 1. Chef's secret if available
    if (selectedRecipe.chefTip) {
      tips.push({
        text: selectedRecipe.chefTip,
        tag: 'Bí Kíp Đầu Bếp'
      });
    }

    // 2. Food-specific techniques based on recipe name / ingredients
    const titleLower = (selectedRecipe.title || '').toLowerCase();
    if (titleLower.includes('kho') || titleLower.includes('rim') || titleLower.includes('ram')) {
      tips.push({
        text: 'Nấu lửa liu riu giúp gia vị ngấm sâu vào từng thớ thịt mà nước sốt không bị cạn khét.',
        tag: 'Mẹo Kho Rim'
      });
      tips.push({
        text: 'Nước dừa tươi giúp món kho mềm bở tự nhiên và lên màu cánh gián óng ả cực đẹp mắt.',
        tag: 'Mẹo Kho Rim'
      });
    }

    if (titleLower.includes('canh') || titleLower.includes('súp') || titleLower.includes('lẩu')) {
      tips.push({
        text: 'Khi nước canh bắt đầu sôi, vặn nhỏ lửa và hớt sạch bọt để nước canh luôn trong veo thanh ngọt.',
        tag: 'Mẹo Nấu Canh'
      });
      tips.push({
        text: 'Nêm rau thơm (ngò rí, hành hoa, thì là) vào nồi canh ngay sau khi tắt bếp để giữ trọn hương thơm thanh khiết.',
        tag: 'Mẹo Nấu Canh'
      });
    }

    if (titleLower.includes('xào') || titleLower.includes('chiên') || titleLower.includes('rán')) {
      tips.push({
        text: 'Đợi dầu thật nóng già mới cho nguyên liệu vào để mặt ngoài giòn rụm mà bên trong vẫn mọng nước.',
        tag: 'Kỹ Thuật Xào'
      });
      tips.push({
        text: 'Rắc một nhúm muối nhỏ vào chảo dầu trước khi chiên rán để giảm đến 80% tình trạng văng dầu.',
        tag: 'Mẹo Chiên Rán'
      });
    }

    if (titleLower.includes('rau') || titleLower.includes('luộc')) {
      tips.push({
        text: 'Cho chút muối hạt vào nồi nước sôi sùng sục và không đậy nắp nồi để rau giữ nguyên sắc xanh tươi mát.',
        tag: 'Mẹo Luộc Rau'
      });
    }

    // 3. Witty cooking loading-screen tips (pure food context, no awkward game starter lines)
    tips.push({
      text: `Món "${selectedRecipe.title}" trên bếp hoàn toàn là hàng thật 100%, hãy kiên nhẫn đợi chín tới nhé!`,
      tag: 'Gợi Ý Món Ăn'
    });
    tips.push({
      text: 'Giữ lửa nhỏ liu riu tăng tỉ lệ thịt chín mềm đều và ngấm trọn vị đậm đà.',
      tag: 'Kỹ Thuật Bếp'
    });
    tips.push({
      text: 'Hành tỏi phi vàng kết hợp cùng một thìa nước mắm ngon là bí quyết dậy mùi của mọi bữa cơm nhà.',
      tag: 'Bí Quyết Vị Ngon'
    });
    tips.push({
      text: 'Đừng bao giờ rời mắt khỏi chảo thắng nước màu quá 15 giây nếu không muốn quay xe từ cánh gián sang bóng đêm.',
      tag: 'Mẹo Bếp Nhanh'
    });
    tips.push({
      text: 'Nồi cơm điện sẽ không tự động nấu chín nếu bạn quên gạt sang nút "Cook" trước khi cắm dây!',
      tag: 'Nhắc Nhở Nấu Nướng'
    });
    tips.push({
      text: 'Luôn nếm thử một muỗng nhỏ canh hoặc nước sốt ở nhiệt độ vừa phải trước khi bày ra mâm ăn.',
      tag: 'Kỹ Thuật Nếm Vị'
    });
    tips.push({
      text: 'Thịt sau khi chiên hoặc nướng xong nên để nghỉ 2-3 phút trước khi thái để giữ trọn độ mọng nước.',
      tag: 'Bí Kíp Đầu Bếp'
    });
    tips.push({
      text: 'Rau xanh sau khi luộc vớt ra ngâm ngay vào âu nước đá lạnh sẽ giữ được độ giòn sần sật cực lâu.',
      tag: 'Mẹo Luộc Giòn'
    });

    return tips;
  }, [selectedRecipe]);

  // Auto-cycle tips when timer is running and timer drawer is open
  useEffect(() => {
    if (!isTimerOpen || !timerIsRunning || loadingScreenTips.length <= 1) return;
    const interval = setInterval(() => {
      setTimerTipIndex(prev => (prev + 1) % loadingScreenTips.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isTimerOpen, timerIsRunning, loadingScreenTips.length]);

  const nextLoadingTip = () => {
    if (loadingScreenTips.length <= 1) return;
    setTimerTipIndex(prev => (prev + 1) % loadingScreenTips.length);
  };

  // Automatically receive & open a shared custom family dish from URL (?sharedDish=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const sharedParam = params.get('sharedDish');
    if (!sharedParam) return;

    try {
      const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(sharedParam))));
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.t) {
        const importedRecipe: Recipe = {
          id: `shared-custom-${Date.now()}`,
          title: String(parsed.t),
          category: parsed.c || 'mon-man',
          region: parsed.r || 'toan-quoc',
          cookTimeMinutes: Number(parsed.m) || 25,
          prepTimeMinutes: 10,
          servings: 4,
          difficulty: 'Dễ',
          calories: Number(parsed.k) || 450,
          estimatedCostVnd: Number(parsed.v) || 65000,
          imageUrl: parsed.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
          description: parsed.n ? `Công thức chia sẻ — ${parsed.n}` : 'Món ngon gia đình được chia sẻ từ Sổ Bếp Mealy.',
          tags: ['Món Bếp Nhà', 'Được Chia Sẻ'],
          isCustom: true,
          authorName: parsed.a || 'Đầu Bếp Mealy',
          authorNote: parsed.n || 'Công thức gia đình chia sẻ',
          chefTip: parsed.p || '',
          ingredients: Array.isArray(parsed.i)
            ? parsed.i.map((ing: any) => ({
                name: String(ing.n || 'Nguyên liệu'),
                amount: Number(ing.a) || 1,
                unit: String(ing.u || 'phần'),
                category: ing.c || 'gia-vi'
              }))
            : [],
          instructions: [
            {
              step: 1,
              title: 'Sơ chế nguyên liệu',
              content: 'Chuẩn bị các nguyên liệu theo định lượng đã chia sẻ.'
            },
            {
              step: 2,
              title: 'Chế biến theo bí quyết gia đình',
              content: parsed.p || 'Nấu chín vừa lửa và nêm nếm hợp khẩu vị gia đình.'
            }
          ]
        };

        const alreadyExists = (customRecipes || []).some(
          r => r.title.toLowerCase().trim() === importedRecipe.title.toLowerCase().trim()
        );
        if (!alreadyExists && typeof addCustomRecipe === 'function') {
          addCustomRecipe(importedRecipe);
        }
        setSelectedRecipe(importedRecipe);
        showToast(`🎁 Đã nhận món "${importedRecipe.title}" và lưu vào Sổ Bếp Gia Đình!`, 'success');

        // Clean ?sharedDish from URL bar without reloading
        const cleanUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch (e) {
      console.error('Failed to decode sharedDish URL parameter', e);
    }
  }, []);

  if (!selectedRecipe) return null;

  const scaledCost = Math.round(((selectedRecipe.estimatedCostVnd || 30000) * servings) / (selectedRecipe.servings || 4));
  const scaledCalories = Math.round(((selectedRecipe.calories || 400) * servings) / (selectedRecipe.servings || 4));

  // Checklist controls
  const totalIngredients = selectedRecipe.ingredients.length;
  const checkedIngredientsCount = selectedRecipe.ingredients.filter((ing, idx) => checkedIngredients[`${ing.name}_${idx}`]).length;
  const isAllIngredientsChecked = totalIngredients > 0 && checkedIngredientsCount === totalIngredients;
  const ingredientsPrepPercent = totalIngredients > 0 ? Math.round((checkedIngredientsCount / totalIngredients) * 100) : 0;

  const toggleIngredientChecked = (key: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCheckedIngredients(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(`mealwise_recipe_ing_${selectedRecipe.id}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const checkAllIngredients = () => {
    const all: Record<string, boolean> = {};
    selectedRecipe.ingredients.forEach((ing, idx) => {
      all[`${ing.name}_${idx}`] = true;
    });
    setCheckedIngredients(all);
    try {
      localStorage.setItem(`mealwise_recipe_ing_${selectedRecipe.id}`, JSON.stringify(all));
    } catch {}
  };

  const resetIngredientsChecklist = () => {
    setCheckedIngredients({});
    try {
      localStorage.removeItem(`mealwise_recipe_ing_${selectedRecipe.id}`);
    } catch {}
  };

  // Timer controls
  const formatTimerDisplay = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimerWithDuration = (seconds: number, label: string = 'Hẹn giờ') => {
    setTimerTotalDuration(seconds);
    setTimerSecondsLeft(seconds);
    setTimerLabel(label);
    setTimerIsRunning(true);
    setIsTimerOpen(true);
  };

  const addTimerSeconds = (additionalSeconds: number, label: string = 'Hẹn giờ') => {
    setTimerSecondsLeft(prevLeft => {
      const newLeft = prevLeft > 0 ? prevLeft + additionalSeconds : additionalSeconds;
      setTimerTotalDuration(prevTotal => (prevLeft > 0 ? prevTotal + additionalSeconds : additionalSeconds));
      return newLeft;
    });
    setTimerLabel(prevLabel => {
      if (!prevLabel || timerSecondsLeft === 0) return label;
      return prevLabel;
    });
    setTimerIsRunning(true);
    setIsTimerOpen(true);
  };

  const toggleTimerPlayPause = () => {
    if (timerSecondsLeft === 0 && timerTotalDuration > 0) {
      setTimerSecondsLeft(timerTotalDuration);
      setTimerIsRunning(true);
    } else {
      setTimerIsRunning(prev => !prev);
    }
  };

  const resetTimer = () => {
    setTimerIsRunning(false);
    setTimerSecondsLeft(timerTotalDuration || 300);
  };

  const clearTimer = () => {
    setTimerIsRunning(false);
    setTimerSecondsLeft(0);
    setTimerTotalDuration(0);
    setIsTimerOpen(false);
  };

  // Accordion controls
  const toggleStepExpanded = (stepNum: number) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepNum]: !prev[stepNum]
    }));
  };

  const expandAllSteps = () => {
    const all: Record<number, boolean> = {};
    selectedRecipe.instructions.forEach(inst => {
      all[inst.step] = true;
    });
    setExpandedSteps(all);
  };

  const collapseAllSteps = () => {
    setExpandedSteps({});
  };

  const consumeUsedFridgeIngredients = (): string[] => {
    if (!selectedRecipe || !pantryItems || pantryItems.length === 0 || typeof removePantryItem !== 'function') {
      return [];
    }
    const removedIds = new Set<string>();
    const removedNames: string[] = [];

    selectedRecipe.ingredients.forEach((ing) => {
      const match = findPantryMatchForIngredient(ing.name, pantryItems);
      if (match.inFridge && match.pantryId && !removedIds.has(match.pantryId)) {
        removedIds.add(match.pantryId);
        removedNames.push(match.pantryName || ing.name);
        removePantryItem(match.pantryId);
      }
    });

    return removedNames;
  };

  const toggleStepCompleted = (stepNum: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isNextWeekPlanView && !isNextWeekWarningDismissed) {
      showToast('⚠️ Món ăn này thuộc Thực Đơn Tuần Sau — hãy bấm nút Tiếp tục ở Bước 1 nếu bạn muốn nấu ngay!', 'warning');
      return;
    }
    setCompletedSteps(prev => {
      const willBeCompleted = !prev[stepNum];
      const next = { ...prev, [stepNum]: willBeCompleted };
      try {
        localStorage.setItem(`mealwise_recipe_progress_${selectedRecipe.id}`, JSON.stringify(next));
      } catch {}

      // Trigger 30s Ad and auto-consume fridge ingredients when user ticks the final step of the meal
      const totalSteps = selectedRecipe.instructions.length;
      if (willBeCompleted && stepNum === totalSteps) {
        const consumedNames = consumeUsedFridgeIngredients();
        const consumedSuffix = consumedNames.length > 0
          ? ` (Đã tự động trừ ${consumedNames.length} nguyên liệu khỏi Tủ Lạnh: ${consumedNames.slice(0, 3).join(', ')}${consumedNames.length > 3 ? '...' : ''})`
          : '';
        const adFree = isUserAdFree() || user?.role === 'admin';
        if (adFree) {
          showToast(`🎉 Tuyệt vời! Bạn đã hoàn thành món ${selectedRecipe.title}!${consumedSuffix}`, 'success');
        } else {
          if (consumedNames.length > 0) {
            showToast(`🧊 Đã tự động đánh dấu đã dùng & trừ ${consumedNames.length} nguyên liệu khỏi Tủ Lạnh!`, 'success');
          }
          setIsCompletionAdOpen(true);
        }
      }

      return next;
    });
  };

  const resetCookingProgress = () => {
    setCompletedSteps({});
    try {
      localStorage.removeItem(`mealwise_recipe_progress_${selectedRecipe.id}`);
    } catch {}
  };

  // Hands-free mode navigation
  const enterHandsFreeMode = (stepIndex: number = 0) => {
    setActiveStepIndex(Math.max(0, Math.min(stepIndex, selectedRecipe.instructions.length - 1)));
    setHandsFreeCardView('text');
    setIsHandsFreeMode(true);
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setHandsFreeCardView('text');
      setActiveStepIndex(prev => prev - 1);
    }
  };

  const handleNextStep = () => {
    if (activeStepIndex < totalSteps - 1) {
      setHandsFreeCardView('text');
      setActiveStepIndex(prev => prev + 1);
    } else {
      const consumedNames = consumeUsedFridgeIngredients();
      const consumedSuffix = consumedNames.length > 0
        ? ` • Đã tự động trừ ${consumedNames.length} nguyên liệu khỏi Tủ Lạnh!`
        : '';
      showToast(`🎉 Chúc mừng! Bạn đã hoàn thành nấu món "${selectedRecipe.title}"!${consumedSuffix}`);
      setIsHandsFreeMode(false);
    }
  };

  // 1-Click push scaled ingredients to extraGroceryItems (excludes olive oil if swapped to household cooking oil)
  const handlePushToGrocery = () => {
    if (!selectedRecipe) return;
    const factor = Math.max(0.1, servings / (selectedRecipe.servings || 4));
    const filteredIngredients = selectedRecipe.ingredients.filter((_, idx) => !swappedEquivalentIngredients[idx]);
    const newItems: ExtraGroceryItem[] = filteredIngredients.map(ing => {
      const numAmount = typeof ing.amount === 'number' ? ing.amount : parseFloat(String(ing.amount).replace(',', '.')) || 1;
      const scaledAmount = Math.round(numAmount * factor * 10) / 10;
      const costPortion = Math.round(((selectedRecipe.estimatedCostVnd || 30000) * factor) / (selectedRecipe.ingredients.length || 1));
      return {
        name: ing.name,
        amount: scaledAmount,
        unit: ing.unit,
        category: (ing.category as any) || 'thit-ca',
        cost: costPortion
      };
    });

    if (typeof addExtraGroceryItems === 'function') {
      addExtraGroceryItems(newItems);
    } else {
      try {
        const saved = localStorage.getItem('mealwise_extra_grocery');
        const existing: ExtraGroceryItem[] = saved ? JSON.parse(saved) : [];
        localStorage.setItem('mealwise_extra_grocery', JSON.stringify([...existing, ...newItems]));
      } catch (e) {
        console.error('Failed to update mealwise_extra_grocery in localStorage', e);
      }
    }

    showToast(`🛒 Đã thêm ${newItems.length} nguyên liệu món "${selectedRecipe.title}" (${servings} người) vào danh sách Đi Chợ!`);
  };

  const totalSteps = selectedRecipe.instructions.length;
  const completedCount = selectedRecipe.instructions.filter(inst => completedSteps[inst.step]).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const isAllCompleted = totalSteps > 0 && completedCount === totalSteps;

  const currentInstruction = selectedRecipe.instructions[activeStepIndex] || selectedRecipe.instructions[0];
  const isCurrentStepCompleted = currentInstruction ? !!completedSteps[currentInstruction.step] : false;

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 dark:bg-stone-950/80 backdrop-blur-sm animate-fade-in"
      onClick={() => {
        if (enlargedStepImage) {
          setEnlargedStepImage(null);
          return;
        }
        if (easterEggQuote) {
          setEasterEggQuote(null);
          return;
        }
        setSelectedRecipe(null);
        setIsHandsFreeMode(false);
        setIsTimerOpen(false);
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: dragY === 0 ? 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
        }}
        className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-white dark:bg-[#1A1918] rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col animate-slide-up border border-[#E8E2D8] dark:border-[#252220] relative overflow-hidden"
      >
        {/* Swipe Handle Bar (Mobile Drag Zone) */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full py-2.5 cursor-grab active:cursor-grabbing shrink-0 flex sm:hidden items-center justify-center touch-none select-none"
        >
          <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
        </div>

        {/* Top Header Bar */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="px-4 pt-2 sm:pt-4 pb-2 flex items-center justify-between shrink-0 select-none border-b border-stone-100 dark:border-stone-800/80 gap-2"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {selectedMealSet ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedRecipe(null);
                  setIsHandsFreeMode(false);
                  setIsTimerOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs font-black text-stone-900 dark:text-white hover:text-stone-700 dark:hover:text-stone-300 transition-colors truncate group min-h-[36px] cursor-pointer"
                title={`Trở lại mâm ${selectedMealSet.title}`}
              >
                <ChevronLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                <span className="truncate">Về mâm: {selectedMealSet.title}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRecipe(null);
                    setIsHandsFreeMode(false);
                    setIsTimerOpen(false);
                  }}
                  className="flex items-center gap-1 text-xs font-black text-stone-900 dark:text-white hover:text-stone-700 dark:hover:text-stone-300 transition-colors shrink-0 group min-h-[36px] cursor-pointer"
                  title="Trở về danh sách công thức"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                  <span>Trở về</span>
                </button>
                <span className="text-stone-300 dark:text-stone-700 shrink-0">•</span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 shrink-0">
                  {selectedRecipe.category === 'mon-man' ? 'Món Mặn'
                    : selectedRecipe.category === 'mon-canh' ? 'Món Canh'
                    : selectedRecipe.category === 'mon-rau' ? 'Món Rau'
                    : selectedRecipe.category === 'mon-chay' ? 'Món Chay'
                    : selectedRecipe.category === 'an-sang' ? 'Bữa Sáng'
                    : selectedRecipe.category === 'trang-mieng' ? 'Tráng Miệng'
                    : 'Món Bếp Nhà'}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {selectedRecipe.isCustom && (
              <button
                type="button"
                onClick={() => shareCustomRecipe(selectedRecipe, showToast)}
                className="px-2.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border bg-blue-50 dark:bg-blue-950/50 text-[#1D4ED8] dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-all cursor-pointer min-h-[36px]"
                title="Chia sẻ công thức món bếp nhà cho người thân"
              >
                <Share2 className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px]">Chia sẻ</span>
              </button>
            )}
            {/* Actionable Countdown Timer Quick Trigger Button */}
            <button
              type="button"
              onClick={() => setIsTimerOpen(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer min-h-[36px] ${
                timerSecondsLeft > 0
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 border-stone-800 dark:border-white animate-pulse font-black shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:text-stone-900 dark:hover:text-white'
              }`}
              title="Bộ đếm giờ nấu ăn"
              aria-label="Bộ đếm giờ nấu ăn"
            >
              <Timer className="w-3.5 h-3.5 shrink-0 text-stone-700 dark:text-stone-300" />
              <span className="text-[11px]">
                {timerSecondsLeft > 0 ? formatTimerDisplay(timerSecondsLeft) : 'Hẹn giờ'}
              </span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedRecipe(null);
                setIsHandsFreeMode(false);
                setIsTimerOpen(false);
              }}
              className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white transition-colors flex items-center justify-center shrink-0 border border-stone-200 dark:border-stone-700 cursor-pointer min-h-[36px] min-w-[36px]"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Actionable Cooking Timer Drawer / Banner (Expandable) */}
        {isTimerOpen && (
          <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#1A202C] border-b border-[#E2E8F0] dark:border-[#2D3748] shrink-0 space-y-3 animate-fade-in select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-stone-900 dark:text-stone-200 uppercase tracking-wide">
                <Timer className="w-4 h-4 text-stone-800 dark:text-stone-300" />
                <span>Bộ Đếm Giờ Nấu Ăn</span>
              </div>
              <button
                type="button"
                onClick={() => setIsTimerOpen(false)}
                className="text-[11px] font-bold text-stone-500 hover:text-stone-800 dark:hover:text-white p-1 cursor-pointer"
                aria-label="Thu nhỏ hẹn giờ"
              >
                Thu nhỏ
              </button>
            </div>

            {/* Digital Display & Timer Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#121110] p-3 rounded-2xl border border-[#E8E2D8] dark:border-[#252220]">
              <div className="text-center sm:text-left min-w-0">
                <div className="text-3xl font-black font-mono tracking-wider text-stone-950 dark:text-white">
                  {formatTimerDisplay(timerSecondsLeft)}
                </div>
                <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 truncate max-w-[200px]">
                  {timerLabel}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleTimerPlayPause}
                  disabled={timerSecondsLeft === 0 && timerTotalDuration === 0}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm cursor-pointer min-h-[44px] ${
                    timerIsRunning
                      ? 'bg-stone-900 text-white hover:bg-stone-800 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-100'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {timerIsRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Tạm dừng</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{timerSecondsLeft > 0 ? 'Tiếp tục' : 'Bắt đầu'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetTimer}
                  disabled={timerTotalDuration === 0}
                  className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-[#E8E2D8] dark:border-[#252220] transition-colors disabled:opacity-40 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Đặt lại bộ đếm"
                  aria-label="Đặt lại bộ đếm"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={clearTimer}
                  className="px-2.5 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-rose-500 transition-colors cursor-pointer min-h-[44px]"
                >
                  Xóa
                </button>
              </div>
            </div>

            {/* Quick Timer Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-extrabold text-stone-500 dark:text-stone-400 uppercase mr-1">
                Phím nhanh:
              </span>
              {[
                { label: '2 phút', sec: 120 },
                { label: '5 phút', sec: 300 },
                { label: '15 phút', sec: 900 },
                { label: '30 phút', sec: 1800 }
              ].map(p => (
                <button
                  key={p.sec}
                  type="button"
                  onClick={() => addTimerSeconds(p.sec, `Hẹn giờ ${p.label}`)}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-[#E8E2D8] dark:border-[#252220] text-stone-700 dark:text-stone-300 hover:border-stone-900 dark:hover:border-stone-400 hover:text-stone-950 dark:hover:text-white text-xs font-bold transition-all shadow-xs min-h-[36px] cursor-pointer"
                >
                  +{p.label}
                </button>
              ))}
              {selectedRecipe.cookTimeMinutes > 0 && (
                <button
                  type="button"
                  onClick={() => addTimerSeconds(selectedRecipe.cookTimeMinutes * 60, `Nấu ${selectedRecipe.title}`)}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-200/70 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 text-xs font-black transition-all shadow-xs min-h-[36px] cursor-pointer"
                >
                  +{selectedRecipe.cookTimeMinutes}p (Tổng nấu)
                </button>
              )}
            </div>

            {/* Gaming Loading Screen Tip Banner (Only visible while timer is actively running) */}
            {timerIsRunning && timerSecondsLeft > 0 && loadingScreenTips.length > 0 && (
              <div className="relative mt-2 p-3 rounded-2xl bg-amber-50/70 dark:bg-stone-900/80 border border-amber-200/80 dark:border-amber-900/50 shadow-xs animate-fade-in">
                {/* Header with Game Loading Indicator & Roll Button */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Gamepad2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1 truncate">
                      <span>Mẹo Màn Hình Chờ</span>
                      <span className="opacity-60">•</span>
                      <span className="text-amber-700 dark:text-amber-400 font-extrabold truncate">
                        {loadingScreenTips[timerTipIndex % loadingScreenTips.length]?.tag}
                      </span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={nextLoadingTip}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold text-amber-900 dark:text-amber-200 bg-amber-200/60 hover:bg-amber-200 dark:bg-amber-950/70 dark:hover:bg-amber-900 transition-colors cursor-pointer shrink-0"
                    title="Đổi mẹo khác"
                  >
                    <Dices className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                    <span>Đổi mẹo</span>
                  </button>
                </div>

                {/* Tip Content with smooth key transition */}
                <p 
                  key={timerTipIndex}
                  className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-relaxed italic animate-fade-in"
                >
                  "{loadingScreenTips[timerTipIndex % loadingScreenTips.length]?.text}"
                </p>

                {/* Subtle Game Loading Bar Accent */}
                <div className="mt-2 h-1 rounded-full bg-amber-200/60 dark:bg-stone-800 overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-linear"
                    style={{ 
                      width: `${timerTotalDuration > 0 ? Math.min(100, Math.round(((timerTotalDuration - timerSecondsLeft) / timerTotalDuration) * 100)) : 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating Mini Timer Indicator (When Timer is running but drawer is minimized) */}
        {!isTimerOpen && timerSecondsLeft > 0 && (
          <div 
            onClick={() => setIsTimerOpen(true)}
            className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 font-black text-xs flex items-center justify-between cursor-pointer shadow-md select-none shrink-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Timer className="w-4 h-4 animate-spin shrink-0 text-amber-400 dark:text-amber-600" />
              <span className="truncate">Đang hẹn giờ: {timerLabel}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-sm tracking-wider">{formatTimerDisplay(timerSecondsLeft)}</span>
              <span className="text-[10px] underline uppercase">Mở</span>
            </div>
          </div>
        )}

        {/* Scrollable Sheet Content */}
        <div className="overflow-y-auto px-4 py-4 pb-[calc(3rem+env(safe-area-inset-bottom,0px))] space-y-4">
          
          {/* ============================================================ */}
          {/* HANDS-FREE STEP-BY-STEP COOKING MODE VIEW                    */}
          {/* ============================================================ */}
          {isHandsFreeMode ? (
            <div className="space-y-4 animate-fade-in">
              {/* Step Mode Header & Switcher */}
              <div className="p-3.5 sm:p-4 rounded-3xl bg-[#FAF8F5] dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] space-y-2.5">
                {/* Centered Mode Toggle: Công thức vs Thực hành */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center p-0.5 rounded-xl bg-stone-200/60 dark:bg-stone-800 border border-stone-300/60 dark:border-stone-700/80 shadow-xs select-none">
                    <button
                      type="button"
                      onClick={() => setIsHandsFreeMode(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer min-h-[30px] ${
                        !isHandsFreeMode
                          ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                          : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-semibold'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Công thức</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => enterHandsFreeMode(activeStepIndex >= 0 ? activeStepIndex : 0)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer min-h-[30px] ${
                        isHandsFreeMode
                          ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-xs'
                          : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-semibold'
                      }`}
                    >
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Thực hành</span>
                    </button>
                  </div>
                </div>

                {/* Step Dots Progress Strip - Slimmed Down */}
                <div className="flex items-center gap-1.5 py-1">
                  {selectedRecipe.instructions.map((inst, idx) => {
                    const isStepDone = !!completedSteps[inst.step];
                    const isStepActive = idx === activeStepIndex;
                    return (
                      <button
                        key={inst.step}
                        type="button"
                        onClick={() => {
                          setHandsFreeCardView('text');
                          setActiveStepIndex(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all cursor-pointer flex-1 ${
                          isStepActive 
                            ? 'bg-stone-900 dark:bg-white ring-1 ring-stone-400/50 shadow-xs' 
                            : isStepDone 
                            ? 'bg-emerald-600/80 hover:bg-emerald-600' 
                            : 'bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600'
                        }`}
                        title={`Bước ${inst.step}: ${inst.title}`}
                        aria-label={`Chuyển tới bước ${inst.step}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Connected Stepper Wizard Header (Step 1: Nguyên liệu -> Step 2: Chế biến) */}
              <div className="py-3 px-6 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220]">
                <div className="relative flex items-center justify-between max-w-xs mx-auto">
                  {/* Background connecting track line */}
                  <div className="absolute left-[36px] right-[36px] top-4 h-0.5 bg-stone-200 dark:bg-stone-800 -z-0" />
                  {/* Active filled connecting track line */}
                  <div 
                    className="absolute left-[36px] top-4 h-0.5 bg-emerald-500 transition-all duration-300 -z-0" 
                    style={{ width: 'calc(100% - 72px)' }}
                  />

                  {/* Step 1 Node */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsHandsFreeMode(false);
                      setCookingPhase(1);
                    }}
                    className="relative z-10 flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all shadow-xs bg-emerald-600 text-white">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <span className="text-[11px] font-black tracking-tight transition-colors whitespace-nowrap text-stone-700 dark:text-stone-300">
                      Chuẩn Bị Nguyên Liệu
                    </span>
                  </button>

                  {/* Step 2 Node */}
                  <button
                    type="button"
                    onClick={() => setCookingPhase(2)}
                    className="relative z-10 flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all shadow-xs bg-emerald-600 text-white ring-4 ring-emerald-500/20">
                      <span>2</span>
                    </div>
                    <span className="text-[11px] font-black tracking-tight transition-colors whitespace-nowrap text-emerald-700 dark:text-emerald-400">
                      Chế Biến Món Ăn
                    </span>
                  </button>
                </div>
              </div>

              {/* Active Step Card with Large Typography & Switchable Text / Step Result Image Box */}
              {currentInstruction && (() => {
                const currentStepImageUrl = getCookingStepImageUrl(selectedRecipe, currentInstruction, totalSteps);
                const hasStepPhoto = Boolean(currentStepImageUrl && currentStepImageUrl.trim().length > 0);
                const cleanCurrentStepTitle = currentInstruction.title.replace(/^bước\s*\d+\s*:\s*/i, '').trim();
                const isShowingStepPhoto = hasStepPhoto && handsFreeCardView === 'image';

                return (
                  <div className="p-5 rounded-3xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] shadow-sm space-y-4">
                    {/* Step Title & Flame / Timer Meta Badges */}
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-stone-900 dark:bg-white text-white dark:text-stone-950">
                          Bước {currentInstruction.step}
                        </span>
                        {currentInstruction.heatLevel && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                            <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            Canh lửa: {currentInstruction.heatLevel}
                          </span>
                        )}
                        {currentInstruction.durationMinutes && (
                          <button
                            type="button"
                            onClick={() => startTimerWithDuration(currentInstruction.durationMinutes! * 60, `Bước ${currentInstruction.step}: ${currentInstruction.title}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer min-h-[32px]"
                          >
                            <Timer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            Hẹn giờ: {currentInstruction.durationMinutes} phút
                          </button>
                        )}
                      </div>

                      <h4 className="text-lg sm:text-xl md:text-2xl font-black text-stone-900 dark:text-white leading-snug">
                        {cleanCurrentStepTitle}
                      </h4>
                    </div>

                    {/* Switchable Content Box: Swipe or Tap Arrow to switch between Text and Step Result Image */}
                    <div
                      className="relative select-none"
                      onTouchStart={hasStepPhoto ? handleStepBoxTouchStart : undefined}
                      onTouchEnd={hasStepPhoto ? handleStepBoxTouchEnd : undefined}
                    >
                      {!isShowingStepPhoto ? (
                        <div className={`p-4 md:p-6 ${hasStepPhoto ? 'pr-11 md:pr-14' : ''} rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-stone-800 dark:text-stone-100 text-base sm:text-lg md:text-xl leading-relaxed font-normal min-h-[175px] md:min-h-[220px] flex items-center relative`}>
                          <p>{currentInstruction.content}</p>

                          {/* Minimal Right-Edge Arrow Only (Shown only when step has an image) */}
                          {hasStepPhoto && (
                            <button
                              type="button"
                              onClick={() => setHandsFreeCardView('image')}
                              aria-label={`Xem ảnh Bước ${currentInstruction.step}`}
                              title={`Xem ảnh Bước ${currentInstruction.step}`}
                              className="absolute right-1.5 md:right-2.5 top-1/2 -translate-y-1/2 w-8 h-10 md:w-10 md:h-12 rounded-full text-stone-400 hover:text-stone-800 dark:text-stone-500 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                            >
                              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 stroke-[2.5]" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div
                          data-testid={`handsfree-step-image-${currentInstruction.step}`}
                          className="relative w-full h-64 sm:h-72 md:h-96 lg:h-[420px] rounded-2xl overflow-hidden border border-[#E8E2D8] dark:border-[#252220] bg-stone-900 shadow-sm animate-fade-in"
                        >
                          <SafeImage
                            src={currentStepImageUrl}
                            alt={`Bước ${currentInstruction.step}: ${cleanCurrentStepTitle}`}
                            fallbackTitle={selectedRecipe.title}
                            category={selectedRecipe.category}
                            className="w-full h-full object-cover"
                            onClick={() =>
                              setEnlargedStepImage({
                                step: currentInstruction.step,
                                title: cleanCurrentStepTitle,
                                imageUrl: currentStepImageUrl,
                                content: currentInstruction.content
                              })
                            }
                          />

                          {/* Minimal Left-Edge Arrow Only */}
                          <button
                            type="button"
                            onClick={() => setHandsFreeCardView('text')}
                            aria-label="Quay lại hướng dẫn"
                            title="Quay lại hướng dẫn"
                            className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center cursor-pointer backdrop-blur-xs transition-transform active:scale-95"
                          >
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 stroke-[2.5]" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Step Micro-Tip (if present) */}
                    {currentInstruction.tip && (
                      <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-stone-800 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-2 font-medium">
                        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-stone-900 dark:text-amber-300">Mẹo nhỏ:</strong> {currentInstruction.tip}
                        </div>
                      </div>
                    )}

                    {/* Step Completion Toggle (48px+ tap target) */}
                    <button
                      type="button"
                      onClick={(e) => toggleStepCompleted(currentInstruction.step, e)}
                      className={`w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer min-h-[48px] ${
                        isCurrentStepCompleted 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20' 
                          : 'bg-white dark:bg-[#121110] text-stone-700 dark:text-stone-200 border-[#E8E2D8] dark:border-[#252220] hover:border-stone-400'
                      }`}
                    >
                      <Check className={`w-4 h-4 stroke-[3] ${isCurrentStepCompleted ? 'text-white' : 'text-stone-400'}`} />
                      <span>{isCurrentStepCompleted ? 'Đã hoàn thành bước này ✓' : 'Đánh dấu đã hoàn thành bước này'}</span>
                    </button>
                  </div>
                );
              })()}

              {/* Navigation Action Buttons (48px+ tap targets) */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={activeStepIndex === 0}
                  className="py-3 px-4 rounded-2xl bg-white dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-stone-700 dark:text-stone-200 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer min-h-[48px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Bước trước</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-stone-900/10 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
                >
                  <span>{activeStepIndex === totalSteps - 1 ? 'Hoàn tất nấu ăn 🎉' : 'Bước tiếp theo'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Peek Ingredients in Hands-Free Mode */}
              <div className="pt-2 border-t border-[#E8E2D8] dark:border-[#252220]">
                <button
                  type="button"
                  onClick={() => setShowHandsFreeIngredients(prev => !prev)}
                  className="w-full py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-between transition-colors min-h-[44px] cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                    Xem nhanh định lượng nguyên liệu ({selectedRecipe.ingredients.length})
                  </span>
                  {showHandsFreeIngredients ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showHandsFreeIngredients && (
                  <div className="mt-2 p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] space-y-1.5 max-h-56 overflow-y-auto animate-fade-in">
                    {selectedRecipe.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-stone-200/60 dark:border-stone-800/60 last:border-none">
                        <span className="font-medium text-stone-800 dark:text-stone-200">{ing.name}</span>
                        <span className="font-extrabold text-stone-900 dark:text-white">
                          {formatScaledAmount(ing.amount)} {ing.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* STANDARD OVERVIEW MODE                                       */
            /* ============================================================ */
            <>
              {/* Hero Image, Metrics, and Description (Shown in Step 1, Hidden in Step 2 per user request) */}
              {cookingPhase === 1 ? (
                <>
                  {/* Hero Image & Title (Only shows photo if system dish or user uploaded their own photo) */}
                  {hasUserProvidedRecipeImage(selectedRecipe) ? (
                    <div className="relative h-[34dvh] min-h-[260px] sm:h-[38dvh] md:h-[42dvh] md:min-h-[320px] rounded-2xl overflow-hidden shadow-md shrink-0">
                      <SafeImage 
                        src={selectedRecipe.imageUrl} 
                        alt={selectedRecipe.title} 
                        fallbackTitle={selectedRecipe.title}
                        category={selectedRecipe.category}
                        className="w-full h-full object-cover"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/35 to-transparent" />
                      <div className="absolute bottom-3.5 left-4 right-4 md:bottom-5 md:left-6 md:right-6">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-sm">
                          {selectedRecipe.title}
                        </h2>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 sm:p-5 md:p-6 rounded-2xl bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 border border-stone-700/60 shadow-sm shrink-0 space-y-1.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-[10px] md:text-xs font-black uppercase tracking-wider">
                        <ChefHat className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span>Món Bếp Nhà</span>
                      </span>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
                        {selectedRecipe.title}
                      </h2>
                    </div>
                  )}

                  {/* Metrics & Servings Stepper Grid (Preserving exact grid class for layout tests) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-center">
                    
                    {/* Metric 1: Time */}
                    <div className="flex flex-col items-center justify-center p-1">
                      <span className="text-[10px] font-extrabold text-stone-600 dark:text-stone-400 block uppercase">
                        THỜI GIAN
                      </span>
                      <span className="text-xs font-black text-stone-900 dark:text-white flex items-center justify-center gap-1 mt-1">
                        <Clock className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                        {selectedRecipe.cookTimeMinutes} phút
                      </span>
                    </div>

                    {/* Metric 2: Interactive Servings Stepper */}
                    <div className="flex flex-col items-center justify-center p-1">
                      <span className="text-[10px] font-extrabold text-stone-600 dark:text-stone-400 block uppercase">
                        KHẨU PHẦN
                      </span>
                      <div className="flex items-center gap-1 mt-1 justify-center">
                        <button
                          type="button"
                          onClick={() => setServings(s => Math.max(1, s - 1))}
                          disabled={servings <= 1}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] text-stone-700 dark:text-stone-200 flex items-center justify-center font-extrabold text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shadow-xs cursor-pointer min-h-[36px] min-w-[36px]"
                          aria-label="Giảm khẩu phần"
                        >
                          -
                        </button>
                        <div className="flex items-center bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] rounded-lg px-1.5 py-0.5 shadow-xs">
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={servings}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val)) {
                                setServings(Math.max(1, Math.min(20, val)));
                              } else if (e.target.value === '') {
                                setServings(1);
                              }
                            }}
                            className="w-7 text-center text-xs font-black text-stone-900 dark:text-white bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            aria-label="Số người ăn"
                          />
                          <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 select-none">
                            người
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setServings(s => Math.min(20, s + 1))}
                          disabled={servings >= 20}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] text-stone-700 dark:text-stone-200 flex items-center justify-center font-extrabold text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shadow-xs cursor-pointer min-h-[36px] min-w-[36px]"
                          aria-label="Tăng khẩu phần"
                        >
                          +
                        </button>
                      </div>
                      {servings !== selectedRecipe.servings && (
                        <button
                          type="button"
                          onClick={() => setServings(selectedRecipe.servings)}
                          className="text-[10px] text-stone-700 dark:text-stone-300 font-bold hover:underline mt-0.5 truncate cursor-pointer"
                        >
                          Gốc: {selectedRecipe.servings} người
                        </button>
                      )}
                    </div>

                    {/* Metric 3: Scaled Cost */}
                    <div className="flex flex-col items-center justify-center p-1">
                      <span className="text-[10px] font-extrabold text-stone-600 dark:text-stone-400 block uppercase">
                        CHI PHÍ DỰ KIẾN
                      </span>
                      <span className="text-xs font-black text-stone-900 dark:text-white block mt-1">
                        {scaledCost.toLocaleString('vi-VN')} đ
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                        ~{Math.round(scaledCost / servings).toLocaleString('vi-VN')} đ/người
                      </span>
                    </div>

                    {/* Metric 4: Scaled Calories */}
                    <div className="flex flex-col items-center justify-center p-1">
                      <span className="text-[10px] font-extrabold text-stone-600 dark:text-stone-400 block uppercase">
                        CALO
                      </span>
                      <span className="text-xs font-black text-stone-900 dark:text-white flex items-center justify-center gap-0.5 mt-1">
                        <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        {scaledCalories} kcal
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                        ~{Math.round(scaledCalories / servings)} kcal/người
                      </span>
                    </div>

                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                    {selectedRecipe.description}
                  </p>

                  {(selectedRecipe.authorNote || selectedRecipe.authorVoiceUrl) && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-950 dark:text-amber-200 flex items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <ChefHat className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[11px] text-amber-900 dark:text-amber-300">Dấu ấn bếp nhà</p>
                          <p className="text-xs text-stone-800 dark:text-stone-200 mt-0.5 leading-relaxed">
                            {selectedRecipe.authorNote || 'Lời nhắn ghi âm từ người nấu'}
                          </p>
                        </div>
                      </div>
                      {(selectedRecipe.authorVoiceUrl || selectedRecipe.isCustom) && (
                        <button
                          type="button"
                          onClick={toggleAuthorVoicePlayback}
                          className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs ${
                            isPlayingAuthorVoice
                              ? 'bg-rose-600 text-white animate-pulse'
                              : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                          }`}
                          title="Nghe lời nhắn của người nấu"
                        >
                          {isPlayingAuthorVoice ? (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current" />
                              <span>Đang phát...</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>
                                Nghe lời dặn
                                {selectedRecipe.authorVoiceDurationSec ? ` (${selectedRecipe.authorVoiceDurationSec}s)` : ''}
                              </span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Uniform Mode Header & Switcher (Step 2: Công thức vs Thực hành) */
                <div className="p-3.5 sm:p-4 rounded-3xl bg-[#FAF8F5] dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] space-y-2.5 animate-fade-in">
                  {/* Centered Mode Toggle: Công thức vs Thực hành */}
                  <div className="flex justify-center">
                    <div className="inline-flex items-center p-0.5 rounded-xl bg-stone-200/60 dark:bg-stone-800 border border-stone-300/60 dark:border-stone-700/80 shadow-xs select-none">
                      <button
                        type="button"
                        onClick={() => setIsHandsFreeMode(false)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer min-h-[30px] ${
                          !isHandsFreeMode
                            ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                            : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-semibold'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Công thức</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => enterHandsFreeMode(activeStepIndex >= 0 ? activeStepIndex : 0)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer min-h-[30px] ${
                          isHandsFreeMode
                            ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-xs'
                            : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-semibold'
                        }`}
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Thực hành</span>
                      </button>
                    </div>
                  </div>

                  {/* Step Dots Progress Strip - Slimmed Down */}
                  <div className="flex items-center gap-1.5 py-1">
                    {selectedRecipe.instructions.map((inst, idx) => {
                      const isStepDone = !!completedSteps[inst.step];
                      const isStepActive = idx === activeStepIndex;
                      return (
                        <button
                          key={inst.step}
                          type="button"
                          onClick={() => {
                            setActiveStepIndex(idx);
                            toggleStepExpanded(inst.step);
                          }}
                          className={`h-1.5 rounded-full transition-all cursor-pointer flex-1 ${
                            isStepActive 
                              ? 'bg-stone-900 dark:bg-white ring-1 ring-stone-400/50 shadow-xs' 
                              : isStepDone 
                              ? 'bg-emerald-600/80 hover:bg-emerald-600' 
                              : 'bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600'
                          }`}
                          title={`Bước ${inst.step}: ${inst.title}`}
                          aria-label={`Chuyển tới bước ${inst.step}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Connected Stepper Wizard Header (Step 1: Nguyên liệu -> Step 2: Chế biến) */}
              <div className="py-3 px-6 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220]">
                <div className="relative flex items-center justify-between max-w-xs mx-auto">
                  {/* Background connecting track line */}
                  <div className="absolute left-[36px] right-[36px] top-4 h-0.5 bg-stone-200 dark:bg-stone-800 -z-0" />
                  {/* Active filled connecting track line */}
                  <div 
                    className="absolute left-[36px] top-4 h-0.5 bg-emerald-500 transition-all duration-300 -z-0" 
                    style={{ width: cookingPhase === 2 ? 'calc(100% - 72px)' : '0%' }}
                  />

                  {/* Step 1 Node */}
                  <button
                    type="button"
                    onClick={() => setCookingPhase(1)}
                    className="relative z-10 flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all shadow-xs ${
                      cookingPhase === 1
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {cookingPhase === 2 ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span>1</span>
                      )}
                    </div>
                    <span className={`text-[11px] font-black tracking-tight transition-colors whitespace-nowrap ${
                      cookingPhase === 1
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-stone-700 dark:text-stone-300'
                    }`}>
                      Chuẩn Bị Nguyên Liệu
                    </span>
                  </button>

                  {/* Step 2 Node */}
                  <button
                    type="button"
                    onClick={() => setCookingPhase(2)}
                    className="relative z-10 flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all shadow-xs ${
                      cookingPhase === 2
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20'
                        : 'bg-stone-100 dark:bg-stone-800 border-2 border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-500'
                    }`}>
                      <span>2</span>
                    </div>
                    <span className={`text-[11px] font-black tracking-tight transition-colors whitespace-nowrap ${
                      cookingPhase === 2
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-stone-400 dark:text-stone-500'
                    }`}>
                      Chế Biến Món Ăn
                    </span>
                  </button>
                </div>
              </div>

              {/* ============================================================ */}
              {/* STEP 1: CATEGORIZED INGREDIENT CHECKLIST SECTION             */}
              {/* ============================================================ */}
              {cookingPhase === 1 && (
                <div className="space-y-3 pt-1 animate-fade-in">
                  {/* Header (Preserving exact flex string for layout tests) */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                    Nguyên Liệu Cần Chuẩn Bị
                  </h3>
                  {servings !== selectedRecipe.servings && (
                    <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full border border-[#E8E2D8] dark:border-[#252220] shrink-0">
                      Đã tự động nhân tỉ lệ ({servings}/{selectedRecipe.servings})
                    </span>
                  )}
                </div>

                {/* Interactive Ingredient Checklist Progress Bar & Actions */}
                <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="font-bold text-stone-700 dark:text-stone-300">
                      Sơ chế sẵn sàng: <strong className="text-stone-950 dark:text-white font-extrabold">{checkedIngredientsCount}/{totalIngredients}</strong> nguyên liệu ({ingredientsPrepPercent}%)
                    </span>
                    <button
                      type="button"
                      onClick={isAllIngredientsChecked ? resetIngredientsChecklist : checkAllIngredients}
                      className="text-[11px] font-extrabold text-stone-900 dark:text-stone-100 hover:underline min-h-[32px] flex items-center cursor-pointer"
                    >
                      {isAllIngredientsChecked ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  </div>
                  <div className="h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300 ease-out"
                      style={{ width: `${ingredientsPrepPercent}%` }}
                    />
                  </div>
                </div>

                {/* Categorized Sections: "Nguyên liệu chính", "Rau củ", "Gia vị & Ướp" */}
                <div className="space-y-3">
                  {categorizedGroups.map(group => (
                    <div key={group.key} className="space-y-1.5">
                      {/* Section Title with Badge and Count */}
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${group.dotClass}`} />
                          <h4 className="text-xs font-black text-stone-900 dark:text-white">
                            {group.title}
                          </h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${group.badgeClass}`}>
                          {group.items.length} nguyên liệu
                        </span>
                      </div>

                      {/* Ingredient Checklist Rows */}
                      <div className="space-y-1.5">
                        {group.items.map(({ ingredient: ing, originalIndex }) => {
                          const key = `${ing.name}_${originalIndex}`;
                          const isChecked = !!checkedIngredients[key];
                          const scaledAmountStr = formatScaledAmount(ing.amount);
                          const isOliveOil = /dầu\s*(ô\s*liu|ô-liu|oliu|olive)/i.test(ing.name || '');
                          const isSwappedToCookingOil = Boolean(swappedEquivalentIngredients[originalIndex]);

                          return (
                            <div 
                              key={originalIndex} 
                              onClick={() => toggleIngredientChecked(key)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs min-h-[44px] cursor-pointer transition-all select-none ${
                                isChecked 
                                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/40 dark:border-emerald-800/40 text-stone-400 dark:text-stone-500' 
                                  : 'bg-white dark:bg-[#1A1918] border-[#E8E2D8] dark:border-[#252220] hover:border-stone-300 dark:hover:border-stone-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={(e) => toggleIngredientChecked(key, e)}
                                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 min-h-[24px] min-w-[24px] cursor-pointer ${
                                    isChecked 
                                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                                      : 'bg-white dark:bg-[#121110] border-stone-300 dark:border-stone-600 text-transparent hover:border-stone-500'
                                  }`}
                                  aria-label={`Đánh dấu nguyên liệu ${ing.name}`}
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </button>
                                <div className="min-w-0 flex-1 flex flex-wrap items-center gap-1.5">
                                  <span className={`font-semibold min-w-0 leading-relaxed transition-all ${
                                    isChecked ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'
                                  }`}>
                                    {isOliveOil && isSwappedToCookingOil
                                      ? 'Dầu ăn thực vật (Thay tương đương Dầu ô liu)'
                                      : ing.name}
                                  </span>
                                  {pantryIngredientMatches[originalIndex]?.inFridge && (
                                    <span 
                                      className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded-md border border-sky-200 dark:border-sky-800 shrink-0"
                                      title={`Thực phẩm có sẵn trong tủ lạnh: ${pantryIngredientMatches[originalIndex]?.pantryName || ing.name}`}
                                    >
                                      <span>🧊 Có sẵn trong tủ</span>
                                    </span>
                                  )}
                                  {isOliveOil && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const willSwap = !isSwappedToCookingOil;
                                        setSwappedEquivalentIngredients(prev => ({ ...prev, [originalIndex]: willSwap }));
                                        showToast(
                                          willSwap
                                            ? '🔄 Đã đổi tương đương sang Dầu ăn thường có sẵn trong bếp!'
                                            : '↩️ Đã chuyển lại nguyên liệu gốc: Dầu ô liu.'
                                        );
                                      }}
                                      className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md border transition-colors cursor-pointer shrink-0 ${
                                        isSwappedToCookingOil
                                          ? 'bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                                          : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300/80 dark:border-amber-700/70'
                                      }`}
                                      title="Dầu ô liu không phổ biến ở mọi gia đình, có thể dùng Dầu ăn thông thường để thay thế tương đương 1:1"
                                    >
                                      <span>
                                        {isSwappedToCookingOil
                                          ? '🧂 Đã thay bằng Dầu ăn có sẵn (Bấm để hoàn tác)'
                                          : '🔄 Thay tương đương: Dùng Dầu ăn có sẵn'}
                                      </span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Preserving exact shrink-0 whitespace-nowrap for test suite */}
                              <span className="font-extrabold text-stone-900 dark:text-stone-100 bg-[#FAF8F5] dark:bg-[#121110] px-2.5 py-1 rounded-lg border border-[#E8E2D8] dark:border-[#252220] text-[11px] shadow-xs shrink-0 whitespace-nowrap">
                                {scaledAmountStr} {ing.unit}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Step 1 Primary Confirmation CTA & 1-Click Push to Grocery List (Single Warning Override Button when viewing Next Week tab) */}
                {isNextWeekPlanView && !isNextWeekWarningDismissed ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNextWeekWarningDismissed(true);
                      showToast('✓ Đã mở khóa nấu & đi chợ cho món thuộc Thực Đơn Tuần Sau!');
                    }}
                    className="w-full p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100/90 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700/80 text-amber-950 dark:text-amber-100 shadow-xs active:scale-[0.98] transition-all cursor-pointer text-left flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Lock className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-amber-950 dark:text-amber-100 leading-snug">
                          ⚠️ Món ăn này thuộc Thực Đơn Tuần Sau
                        </p>
                        <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300/90 mt-0.5 leading-snug">
                          Bạn có muốn tiếp tục bắt đầu nấu hoặc đi chợ món này ngay không?
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-[11px] shrink-0 shadow-2xs">
                      Tiếp tục ➔
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        checkAllIngredients();
                        setCookingPhase(2);
                        showToast('✨ Đã chuẩn bị đủ nguyên liệu! Bắt đầu chế biến món ăn.');
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all min-h-[46px]"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Tôi Đã Chuẩn Bị Đủ Nguyên Liệu — Bắt Đầu Nấu ➔</span>
                    </button>

                    {/* 1-Click Push to Grocery List (min 44px tap target) */}
                    <button
                      type="button"
                      onClick={handlePushToGrocery}
                      className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[40px]"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300 shrink-0" />
                      <span>🛒 Đi Chợ Món Này ({servings} người • {selectedRecipe.ingredients.length} nguyên liệu)</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 2: COOKING STEPS ACCORDION WITH PROGRESS TRACKING       */}
            {/* ============================================================ */}
            {cookingPhase === 2 && (
              <div className="space-y-3 pt-1 animate-fade-in">
                
                {/* Header with Title */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-stone-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ChefHat className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                    Các Bước Chế Biến & Tiến Độ
                  </h3>
                </div>

                {/* Progress Bar & Status */}
                <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700 dark:text-stone-300">
                      Tiến độ nấu: <strong className="text-stone-950 dark:text-white font-extrabold">{completedCount}/{totalSteps}</strong> bước
                    </span>
                    <span className="text-xs font-black text-stone-900 dark:text-white">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Completion Banner */}
                {isAllCompleted && (
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200 font-bold animate-fade-in">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Tuyệt vời! Bạn đã hoàn thành tất cả các bước chế biến món {selectedRecipe.title}! Chúc cả nhà ngon miệng!</span>
                  </div>
                )}

                {/* Accordion Steps List */}
                <div className="space-y-2">
                  {selectedRecipe.instructions.map(inst => {
                    const isExpanded = expandedSteps[inst.step] ?? true;
                    const isCompleted = !!completedSteps[inst.step];
                    const cleanStepTitle = inst.title.replace(/^bước\s*\d+\s*:\s*/i, '').trim();

                    return (
                      <div 
                        key={inst.step} 
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isCompleted 
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/40 dark:border-emerald-800/40' 
                            : 'bg-white dark:bg-[#1A1918] border-[#E8E2D8] dark:border-[#252220]'
                        }`}
                      >
                        {/* Step Accordion Header */}
                        <div 
                          onClick={() => toggleStepExpanded(inst.step)}
                          className="p-3 flex items-center justify-between gap-2 cursor-pointer select-none hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors min-h-[44px]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* Checkbox button */}
                            <button
                              type="button"
                              onClick={(e) => toggleStepCompleted(inst.step, e)}
                              className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 min-h-[24px] min-w-[24px] cursor-pointer ${
                                isCompleted 
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                                  : 'bg-white dark:bg-[#121110] border-stone-300 dark:border-stone-600 text-transparent hover:border-stone-500'
                              }`}
                              aria-label={`Đánh dấu hoàn thành bước ${inst.step}`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>

                            <div className="min-w-0 flex-1">
                              <h4 className={`text-xs sm:text-sm font-extrabold transition-colors truncate ${
                                isCompleted 
                                  ? 'text-emerald-900 dark:text-emerald-300 line-through opacity-80' 
                                  : 'text-stone-900 dark:text-white'
                              }`}>
                                Bước {inst.step}: {cleanStepTitle}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-1">
                            {isCompleted && (
                              <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md whitespace-nowrap">
                                Đã xong
                              </span>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-stone-500 dark:text-stone-400 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-stone-500 dark:text-stone-400 shrink-0" />
                            )}
                          </div>
                        </div>

                        {/* Step Accordion Content */}
                        {isExpanded && (
                          <div className="px-3.5 pb-3 pt-0 text-xs text-stone-600 dark:text-stone-300 pl-11 leading-relaxed border-t border-[#E8E2D8]/60 dark:border-[#252220]/60 mt-1 space-y-2">
                            <p>{inst.content}</p>

                            {/* Badges & Actions row */}
                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                              {inst.heatLevel && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 min-h-[28px]">
                                  <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                  <span>{inst.heatLevel}</span>
                                </span>
                              )}
                              {inst.durationMinutes && (
                                <button
                                  type="button"
                                  onClick={() => startTimerWithDuration(inst.durationMinutes! * 60, `Bước ${inst.step}: ${cleanStepTitle}`)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer min-h-[28px]"
                                  title={`Hẹn giờ ${inst.durationMinutes} phút`}
                                >
                                  <Timer className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                                  <span>Hẹn giờ {inst.durationMinutes}p</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => rollNewEasterEggQuote()}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer min-h-[28px]"
                                title="Bí kíp rảnh tay lướt Tóp Tóp ✨"
                              >
                                <ChefHat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                <span>Nấu rảnh tay</span>
                              </button>
                            </div>

                            {inst.tip && (
                              <div className="mt-2 p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-stone-800 dark:text-amber-200 text-[11px] flex items-start gap-1.5 font-medium">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <span><strong className="text-stone-900 dark:text-amber-300">Mẹo nhỏ:</strong> {inst.tip}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Chef's Secret / Mẹo Bếp Vàng */}
                {selectedRecipe.chefTip && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1A202C] border border-amber-300/60 dark:border-amber-700/40 text-xs sm:text-sm text-stone-900 dark:text-stone-100 space-y-1.5 mt-3 shadow-sm">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 font-black uppercase text-xs text-amber-900 dark:text-amber-300">
                        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Bí Quyết Đầu Bếp</span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                        Chuẩn Vị Cơm Nhà
                      </span>
                    </div>
                    <p className="leading-relaxed pl-5 font-medium text-stone-700 dark:text-stone-300">
                      {selectedRecipe.chefTip}
                    </p>
                  </div>
                )}
                {/* Return to Step 1 Ingredients */}
                <button
                  type="button"
                  onClick={() => setCookingPhase(1)}
                  className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[40px] mt-2"
                >
                  <span>⟵ Xem lại danh sách nguyên liệu (Bước 1)</span>
                </button>
              </div>
            )}
          </>
        )}

        </div>
      </div>

      {/* Step Completion Image Lightbox Modal */}
      {enlargedStepImage && (
        <div
          className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setEnlargedStepImage(null);
          }}
        >
          <div
            className="relative w-full max-w-md md:max-w-xl lg:max-w-2xl rounded-3xl bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 sm:h-72 md:h-96 w-full bg-stone-950">
              <SafeImage
                src={enlargedStepImage.imageUrl}
                alt={`Kết quả Bước ${enlargedStepImage.step}: ${enlargedStepImage.title}`}
                fallbackTitle={selectedRecipe.title}
                category={selectedRecipe.category}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEnlargedStepImage(null);
                }}
                className="absolute top-3 right-3 w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 cursor-pointer"
                aria-label="Đóng ảnh phóng to"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <div className="absolute bottom-3 left-4 right-4 md:bottom-4 md:left-6 md:right-6 text-white">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] md:text-xs font-black uppercase tracking-wider mb-1">
                  <Camera className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  <span>Kết quả Bước {enlargedStepImage.step}</span>
                </span>
                <h4 className="text-base md:text-xl font-black leading-snug drop-shadow">
                  {enlargedStepImage.title}
                </h4>
              </div>
            </div>
            <div className="p-4 md:p-6 space-y-3">
              <p className="text-xs sm:text-sm md:text-base text-stone-700 dark:text-stone-200 leading-relaxed">
                {enlargedStepImage.content}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEnlargedStepImage(null);
                }}
                className="w-full py-2.5 md:py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-200 text-white dark:text-stone-950 font-black text-xs md:text-sm cursor-pointer min-h-[42px] md:min-h-[48px]"
              >
                Đóng xem ảnh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 30s Meal Completion Ad Modal */}
      {isCompletionAdOpen && (
        <VolunteerAdSequenceModal
          isOpen={isCompletionAdOpen}
          onClose={() => setIsCompletionAdOpen(false)}
          onComplete={() => {
            setIsCompletionAdOpen(false);
            recordAdImpression(
              'rewarded_video',
              `Quảng Cáo Hoàn Thành Món: ${selectedRecipe.title} (30s)`,
              30,
              4,
              user?.name || 'Thành Viên Mealy'
            );
            try {
              recordVolunteerAdWatched(1);
            } catch {}
            showToast(`🎉 Tuyệt vời! Bạn đã hoàn thành món ${selectedRecipe.title}! Chúc cả nhà ngon miệng!`);
          }}
          singleAdMode={true}
          title="Quảng Cáo Hoàn Thành Món Ăn"
          completionTitle="🎉 Món Ăn Đã Hoàn Tất!"
          completionSubtitle={`Bạn đã hoàn tất tất cả các bước chế biến món "${selectedRecipe.title}" (${servings} người ăn). Chúc cả nhà có một bữa cơm thơm ngon tròn vị!`}
        />
      )}

      {/* Gen Z Cooking Easter Egg Popup Modal */}
      {easterEggQuote && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setEasterEggQuote(null);
          }}
        >
          <div 
            className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#1A202C] border border-amber-300/80 dark:border-amber-700/60 p-5 shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Badge */}
            <div className="flex items-center justify-center gap-1.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-stone-950 shadow-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gen Z Bếp Mode · Easter Egg</span>
              </span>
            </div>

            {/* Funny Quote Box */}
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 relative">
              <div className="text-3xl mb-2 select-none animate-bounce">📱✨</div>
              <p className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-100 leading-snug">
                "{easterEggQuote}"
              </p>
              <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                  #RảnhTayLướtTópTóp
                </span>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                  #VẫnNấuNgon
                </span>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
                  #MealyGenZ
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setEasterEggQuote(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-extrabold text-xs transition-colors cursor-pointer min-h-[40px] flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>😂 Quá chuẩn / Đóng</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
