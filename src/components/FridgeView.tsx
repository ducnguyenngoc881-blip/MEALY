import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock, 
  ChefHat, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  ShoppingCart, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Info,
  RotateCcw,
  AlertCircle,
  X
} from 'lucide-react';
import { useMealWise } from '../context/MealWiseContext';
import { PantryItem, Recipe } from '../types';
import { SafeImage } from './SafeImage';
import { 
  findLeftoverRecipeSuggestions, 
  findLeftoverRecipeSuggestionsWithCount,
  findWholeFridgeRecipeSuggestions,
  matchRecipeWithPantryItem,
  isCondiment,
  hasCookableRecipes,
  WholeFridgeSuggestionResult
} from '../utils/fridgeMatcher';
import { normalizeSearchString, matchesFoodSearch } from '../utils/textUtils';

export interface PresetPantrySuggestion {
  name: string;
  category: string;
  qty: string;
  days: number;
  isLeftover: boolean;
  discountVnd?: number;
  note?: string;
  icon?: string;
  keywords?: string[];
  compartment?: 'freezer' | 'fridge' | 'crisper';
}

export const PRESET_FOOD_SUGGESTIONS: PresetPantrySuggestion[] = [
  // --- Đậu & Trứng ---
  { name: 'Đậu phụ sống', category: 'Trứng & Đậu', qty: '2 bìa', days: 1, isLeftover: false, discountVnd: 15000, compartment: 'fridge', note: 'Rán lướt ván giòn tan, nhồi thịt hoặc sốt cà chua', icon: '🧈', keywords: ['đậu hũ', 'dau hu', 'tàu hũ', 'tau hu', 'đậu phụ', 'dau phu'] },
  { name: 'Đậu hũ phô mai', category: 'Trứng & Đậu', qty: '1 gói', days: 3, isLeftover: false, discountVnd: 35000, compartment: 'fridge', note: 'Thả lẩu, chiên giòn sốt me hoặc nướng phô mai', icon: '🧀', keywords: ['đậu phụ phô mai', 'dau phu pho mai', 'đậu hũ', 'dau hu'] },
  { name: 'Đậu hũ non', category: 'Trứng & Đậu', qty: '1 hộp', days: 2, isLeftover: false, discountVnd: 12000, compartment: 'fridge', note: 'Nấu canh rong biển, hấp trứng thịt băm hoặc sốt Tứ Xuyên', icon: '🧈', keywords: ['đậu phụ non', 'dau phu non', 'tàu hũ non', 'đậu non'] },
  { name: 'Đậu hũ chiên sẵn', category: 'Trứng & Đậu', qty: '3 miếng', days: 2, isLeftover: false, discountVnd: 15000, compartment: 'fridge', note: 'Kho tương, xào sả ớt hoặc nhồi nấm mộc nhĩ', icon: '🧈', keywords: ['đậu phụ rán', 'dau phu ran', 'đậu rán', 'đậu chiên'] },
  { name: 'Đậu que / Đậu cô ve', category: 'Rau củ quả', qty: '200 g', days: 4, isLeftover: false, discountVnd: 15000, compartment: 'crisper', note: 'Xào thịt bò giòn ngọt hoặc luộc chấm kho quẹt', icon: '🫛', keywords: ['đậu cô ve', 'dau co ve', 'đậu ve'] },
  { name: 'Đậu bắp', category: 'Rau củ quả', qty: '200 g', days: 3, isLeftover: false, discountVnd: 12000, compartment: 'crisper', note: 'Luộc chấm chao hoặc nướng mỡ hành sa tế', icon: '🫛', keywords: ['dau bap'] },
  { name: 'Đậu Hà Lan', category: 'Rau củ quả', qty: '150 g', days: 4, isLeftover: false, discountVnd: 20000, compartment: 'crisper', note: 'Nấu súp gà ngô non hoặc xào tôm nõn', icon: '🫛', keywords: ['dau ha lan'] },
  { name: 'Đậu phộng / Lạc củ', category: 'Đồ khô & Gia vị', qty: '150 g', days: 14, isLeftover: false, discountVnd: 15000, compartment: 'fridge', note: 'Rang muối tỏi ớt đưa cơm hoặc nấu canh bí', icon: '🥜', keywords: ['lạc', 'hạt lạc', 'lac rang', 'đậu phộng'] },
  { name: 'Đậu xanh / Đậu đen', category: 'Đồ khô & Gia vị', qty: '200 g', days: 14, isLeftover: false, discountVnd: 18000, compartment: 'fridge', note: 'Nấu chè thanh nhiệt hoặc nấu cháo', icon: '🫘', keywords: ['đỗ xanh', 'đỗ đen', 'do xanh'] },
  { name: 'Trứng gà ta', category: 'Trứng & Đậu', qty: '4 quả', days: 5, isLeftover: false, discountVnd: 20000, compartment: 'fridge', note: 'Chiên trứng thịt băm, cuộn hành hoặc ốp la lòng đào', icon: '🥚', keywords: ['hột gà', 'hot ga'] },
  { name: 'Trứng vịt', category: 'Trứng & Đậu', qty: '4 quả', days: 6, isLeftover: false, discountVnd: 20000, compartment: 'fridge', note: 'Kho thịt tàu hoặc chiên khổ qua', icon: '🥚', keywords: ['hột vịt', 'hot vit'] },
  { name: 'Trứng cút', category: 'Trứng & Đậu', qty: '10 quả', days: 5, isLeftover: false, discountVnd: 15000, compartment: 'fridge', note: 'Kho sườn, sốt me chua ngọt hoặc thả lẩu', icon: '🥚', keywords: ['hột cút', 'hot cut'] },

  // --- Món ăn thừa bữa trước (Leftovers - Ngăn mát) ---
  { name: 'Cơm nguội bữa trước', category: 'Đồ ăn thừa', qty: '1 tô to', days: 1, isLeftover: true, discountVnd: 15000, compartment: 'fridge', note: 'Chiên cơm rang dưa bò, cơm chiên trứng hoặc cơm rang kim chi', icon: '🍚', keywords: ['cơm thừa', 'cơm chiên', 'com nguoi'] },
  { name: 'Thịt kho tàu thừa', category: 'Đồ ăn thừa', qty: '250 g', days: 2, isLeftover: true, discountVnd: 45000, compartment: 'fridge', note: 'Hâm nóng ăn với dưa cải chua hoặc kho thêm trứng', icon: '🍲', keywords: ['thịt lợn kho', 'thit lon kho', 'thịt heo kho', 'thịt kho tàu', 'thit kho'] },
  { name: 'Thịt gà luộc thừa', category: 'Đồ ăn thừa', qty: '300 g', days: 1, isLeftover: true, discountVnd: 40000, compartment: 'fridge', note: 'Xé phay làm gỏi bắp cải hoặc nấu cháo gà nấm', icon: '🍗', keywords: ['gà luộc', 'ga luoc', 'gà xé'] },
  { name: 'Thịt heo luộc thừa', category: 'Đồ ăn thừa', qty: '200 g', days: 1, isLeftover: true, discountVnd: 35000, compartment: 'fridge', note: 'Thái mỏng cuốn bánh tráng hoặc rang sả ớt giòn cay', icon: '🥩', keywords: ['thịt lợn luộc', 'thit lon luoc', 'thịt luộc', 'thịt heo luộc', 'thịt lợn', 'thit lon', 'lợn luộc', 'heo luộc'] },
  { name: 'Canh rau thừa', category: 'Đồ ăn thừa', qty: '1 bát', days: 1, isLeftover: true, discountVnd: 15000, compartment: 'fridge', note: 'Nên đun sôi lại kỹ trước khi dùng', icon: '🥣', keywords: ['canh thừa', 'canh rau'] },
  { name: 'Cá kho thừa', category: 'Đồ ăn thừa', qty: '200 g', days: 2, isLeftover: true, discountVnd: 35000, compartment: 'fridge', note: 'Kho rim lại cho keo săn đậm đà', icon: '🐟', keywords: ['cá kho', 'ca kho'] },
  { name: 'Sườn xào chua ngọt thừa', category: 'Đồ ăn thừa', qty: '200 g', days: 2, isLeftover: true, discountVnd: 45000, compartment: 'fridge', note: 'Hâm nóng dùng ngay với cơm nóng', icon: '🍖', keywords: ['sườn lợn', 'sườn heo', 'suon lon', 'suon heo', 'sườn xào'] },
  { name: 'Bò xào cần tỏi thừa', category: 'Đồ ăn thừa', qty: '1 đĩa', days: 1, isLeftover: true, discountVnd: 40000, compartment: 'fridge', note: 'Đảo nóng lại làm món xào hoặc ăn kèm mì tôm', icon: '🥩', keywords: ['bò xào', 'thịt bò'] },
  { name: 'Gà rán / Gà chiên thừa', category: 'Đồ ăn thừa', qty: '2 miếng', days: 1, isLeftover: true, discountVnd: 35000, compartment: 'fridge', note: 'Quay nồi chiên không dầu 5 phút cho giòn rụm', icon: '🍗', keywords: ['gà rán', 'ga ran', 'gà chiên'] },
  { name: 'Canh sườn hầm thừa', category: 'Đồ ăn thừa', qty: '1 tô', days: 1, isLeftover: true, discountVnd: 30000, compartment: 'fridge', note: 'Đun sôi lại, có thể nấu thêm bát bún sườn', icon: '🍲', keywords: ['canh sườn lợn', 'canh sườn heo', 'canh sườn'] },

  // --- Thịt / Hải sản tươi dùng ngay (Ngăn mát) ---
  { name: 'Thịt ba chỉ tươi', category: 'Thịt / Hải sản', qty: '300 g', days: 2, isLeftover: false, discountVnd: 45000, compartment: 'fridge', note: 'Rang cháy cạnh, luộc cuốn bánh tráng hoặc kho dưa cải chua', icon: '🥩', keywords: ['thịt ba rọi', 'ba rọi', 'ba chỉ lợn', 'thịt lợn ba chỉ', 'thịt lợn', 'thit lon', 'thịt heo ba chỉ', 'ba chỉ heo'] },
  { name: 'Thịt heo nạc dăm', category: 'Thịt / Hải sản', qty: '300 g', days: 2, isLeftover: false, discountVnd: 40000, compartment: 'fridge', note: 'Xào hành tây, băm nấu canh hoặc tẩm bột chiên xù', icon: '🥩', keywords: ['thịt lợn nạc', 'thit lon nac', 'thịt lợn', 'thit lon', 'nạc dăm lợn', 'nạc heo', 'thịt nạc'] },
  { name: 'Thịt bò phi lê', category: 'Thịt / Hải sản', qty: '250 g', days: 2, isLeftover: false, discountVnd: 70000, compartment: 'fridge', note: 'Xào cần tỏi, bò lúc lắc hoặc xào rau muống giòn', icon: '🥩', keywords: ['thịt bò', 'thit bo', 'thăn bò'] },
  { name: 'Thịt bò xay', category: 'Thịt / Hải sản', qty: '200 g', days: 2, isLeftover: false, discountVnd: 50000, compartment: 'fridge', note: 'Làm sốt cà chua mì Ý hoặc nhồi mướp đắng nấu canh', icon: '🥩', keywords: ['bò băm', 'thịt bò xay'] },
  { name: 'Sườn non heo', category: 'Thịt / Hải sản', qty: '400 g', days: 2, isLeftover: false, discountVnd: 60000, compartment: 'fridge', note: 'Sườn xào chua ngọt, nướng mật ong hoặc nấu canh chua', icon: '🍖', keywords: ['sườn non lợn', 'sườn lợn', 'suon lon', 'suon heo', 'sườn heo', 'sườn non'] },
  { name: 'Tôm tươi', category: 'Thịt / Hải sản', qty: '250 g', days: 1, isLeftover: false, discountVnd: 55000, compartment: 'fridge', note: 'Tôm rim mặn ngọt, hấp bia sả hoặc nấu canh bầu bí', icon: '🦐', keywords: ['tôm sú', 'tôm thẻ', 'tom tuoi'] },
  { name: 'Mực ống tươi', category: 'Thịt / Hải sản', qty: '250 g', days: 1, isLeftover: false, discountVnd: 60000, compartment: 'fridge', note: 'Mực xào cần tỏi dứa hoặc hấp gừng giòn sần sật', icon: '🦑', keywords: ['mực', 'muc ong', 'muc tuoi'] },
  { name: 'Cá hồi tươi', category: 'Thịt / Hải sản', qty: '200 g', days: 2, isLeftover: false, discountVnd: 75000, compartment: 'fridge', note: 'Áp chảo bơ tỏi chanh hoặc nấu canh chua thì là', icon: '🐟', keywords: ['cá hồi', 'ca hoi'] },
  { name: 'Cá điêu hồng / Cá lóc', category: 'Thịt / Hải sản', qty: '1 con', days: 1, isLeftover: false, discountVnd: 50000, compartment: 'fridge', note: 'Nấu canh chua dọc mùng hoặc kho tộ riềng sả', icon: '🐟', keywords: ['cá quả', 'cá trôi', 'cá lóc', 'ca dieu hong'] },
  { name: 'Ngao / Nghêu sống', category: 'Thịt / Hải sản', qty: '500 g', days: 1, isLeftover: false, discountVnd: 30000, compartment: 'fridge', note: 'Nấu canh chua ngao thì là hoặc hấp sả ớt thơm lừng', icon: '🦪', keywords: ['ngao', 'nghêu', 'ngao trắng'] },

  // --- Đồ đông lạnh & Cấp đông (Ngăn đá) ---
  { name: 'Thịt ba chỉ cấp đông', category: 'Thịt / Hải sản', qty: '500 g', days: 30, isLeftover: false, discountVnd: 75000, compartment: 'freezer', note: 'Chia túi zip nhỏ, rã đông trước khi nấu', icon: '🥩', keywords: ['thịt đông lạnh', 'thit dong lanh', 'ba rọi đông lạnh', 'ba rọi cấp đông'] },
  { name: 'Cá lóc cắt khúc cấp đông', category: 'Thịt / Hải sản', qty: '1 con', days: 30, isLeftover: false, discountVnd: 60000, compartment: 'freezer', note: 'Kho tộ hoặc nấu canh chua cá lóc', icon: '🐟', keywords: ['cá quả đông lạnh', 'ca loc cap dong'] },
  { name: 'Chả giò tôm thịt đông lạnh', category: 'Đồ ăn thừa', qty: '1 gói (12 cuốn)', days: 45, isLeftover: false, discountVnd: 50000, compartment: 'freezer', note: 'Chiên vàng giòn không cần rã đông', icon: '🥟', keywords: ['nem rán', 'chả giò', 'cha gio dong lanh'] },
  { name: 'Bò viên / Cá viên thả lẩu', category: 'Thịt / Hải sản', qty: '300 g', days: 30, isLeftover: false, discountVnd: 35000, compartment: 'freezer', note: 'Thả lẩu, nấu hủ tiếu hoặc chiên ăn vặt', icon: '🍢', keywords: ['cá viên', 'bò viên', 'viên lẩu', 'tôm viên'] },
  { name: 'Kem vani / Sữa chua dẻo', category: 'Đồ uống', qty: '1 hộp', days: 20, isLeftover: false, discountVnd: 25000, compartment: 'freezer', note: 'Tráng miệng mát lạnh', icon: '🍨', keywords: ['kem', 'ice cream', 'sữa chua bịch'] },
  { name: 'Đá viên sạch', category: 'Đồ uống', qty: '1 khay to', days: 60, isLeftover: false, discountVnd: 5000, compartment: 'freezer', note: 'Dùng uống nước, pha trà hoặc ướp lạnh bia', icon: '🧊', keywords: ['đá', 'nước đá', 'da vien'] },

  // --- Rau củ quả (Ngăn rau củ) ---
  { name: 'Cà chua chín', category: 'Rau củ quả', qty: '3 quả', days: 3, isLeftover: false, discountVnd: 10000, compartment: 'crisper', note: 'Làm sốt cà chua đậu hũ hoặc nấu canh trứng', icon: '🍅', keywords: ['cà chua', 'ca chua'] },
  { name: 'Hành lá & Rau thơm', category: 'Rau củ quả', qty: '1 bó nhỏ', days: 2, isLeftover: false, discountVnd: 5000, compartment: 'crisper', note: 'Gia vị nêm nếm các món canh và xào', icon: '🌿', keywords: ['hành hoa', 'hanh hoa', 'ngò rí', 'rau mùi', 'hành lá'] },
  { name: 'Bắp cải / Cà rốt', category: 'Rau củ quả', qty: '1/2 bắp', days: 4, isLeftover: false, discountVnd: 12000, compartment: 'crisper', note: 'Luộc chấm trứng hoặc xào thịt giòn ngọt', icon: '🥬', keywords: ['bắp cải', 'bap cai', 'bắp sú', 'cà rốt'] },
  { name: 'Rau muống', category: 'Rau củ quả', qty: '1 bó', days: 2, isLeftover: false, discountVnd: 10000, compartment: 'crisper', note: 'Luộc lấy nước dầm sấu hoặc xào tỏi xanh mướt', icon: '🥬', keywords: ['rau muong'] },
  { name: 'Rau ngót', category: 'Rau củ quả', qty: '1 bó', days: 2, isLeftover: false, discountVnd: 10000, compartment: 'crisper', note: 'Nấu canh thịt băm hoặc canh tôm ngọt mát', icon: '🥬', keywords: ['rau ngot', 'bồ ngót'] },
  { name: 'Cải ngọt / Cải thìa', category: 'Rau củ quả', qty: '1 bó', days: 3, isLeftover: false, discountVnd: 12000, compartment: 'crisper', note: 'Xào dầu hào hoặc nấu canh gừng ấm bụng', icon: '🥬', keywords: ['cải thìa', 'cải ngọt', 'rau cải'] },
  { name: 'Dưa leo / Dưa chuột', category: 'Rau củ quả', qty: '3 quả', days: 4, isLeftover: false, discountVnd: 10000, compartment: 'crisper', note: 'Ăn sống giòn mát, bóp nộm hoặc xào thịt bò', icon: '🥒', keywords: ['dưa chuột', 'dua chuot', 'dưa leo', 'dua leo'] },
  { name: 'Khoai tây', category: 'Rau củ quả', qty: '3 củ', days: 7, isLeftover: false, discountVnd: 15000, compartment: 'crisper', note: 'Hầm sườn non, làm khoai tây nghiền hoặc chiên giòn', icon: '🥔', keywords: ['khoai tay'] },
  { name: 'Nấm kim châm', category: 'Rau củ quả', qty: '1 gói', days: 3, isLeftover: false, discountVnd: 15000, compartment: 'crisper', note: 'Cuộn bò nướng hoặc nấu canh rong biển', icon: '🍄', keywords: ['nấm kim châm', 'nam kim cham'] },
  { name: 'Nấm rơm / Nấm hương', category: 'Rau củ quả', qty: '150 g', days: 2, isLeftover: false, discountVnd: 20000, compartment: 'crisper', note: 'Xào thịt heo hoặc nấu canh đậu hũ', icon: '🍄', keywords: ['nấm hương', 'nấm đông cô', 'nấm mèo', 'mộc nhĩ'] },
  { name: 'Bí xanh / Bí đao', category: 'Rau củ quả', qty: '1 khúc', days: 5, isLeftover: false, discountVnd: 12000, compartment: 'crisper', note: 'Nấu canh sườn non hoặc tôm khô mát lành', icon: '🥒', keywords: ['bí đao', 'bí xanh', 'bi dao'] },

  // --- Khác & Chế biến sẵn ---
  { name: 'Chả lụa / Giò lụa', category: 'Thịt / Hải sản', qty: '200 g', days: 3, isLeftover: false, discountVnd: 30000, compartment: 'fridge', note: 'Kho tiêu đưa cơm hoặc kẹp bánh mì', icon: '🥓', keywords: ['giò lụa', 'chả lụa', 'gio lua', 'cha lua'] },
  { name: 'Xúc xích', category: 'Thịt / Hải sản', qty: '3 cây', days: 5, isLeftover: false, discountVnd: 25000, compartment: 'fridge', note: 'Chiên ăn vặt hoặc rang cơm thập cẩm', icon: '🌭', keywords: ['xuc xich', 'lạp xưởng'] },
  { name: 'Bún tươi / Phở tươi', category: 'Đồ ăn thừa', qty: '500 g', days: 1, isLeftover: false, discountVnd: 15000, compartment: 'fridge', note: 'Nấu canh chua hoặc xào thịt bò', icon: '🍜', keywords: ['bún', 'phở', 'bun tuoi', 'pho tuoi'] },
  { name: 'Kim chi Hàn Quốc', category: 'Rau củ quả', qty: '1 hộp nhỏ', days: 10, isLeftover: false, discountVnd: 25000, compartment: 'fridge', note: 'Nấu canh kim chi thịt bò đậu hũ cay nồng', icon: '🥬', keywords: ['kim chi', 'kimchi'] }
];

const CATEGORIES = [
  'Đồ ăn thừa',
  'Thịt / Hải sản',
  'Rau củ quả',
  'Trứng & Đậu',
  'Đồ khô & Gia vị',
  'Đồ uống',
  'Khác'
];

export const STORAGE_KEY_WHOLE_FRIDGE_EXPANDED = 'mealwise_fridge_suggestions_expanded';

export type FridgeCompartment = 'all' | 'freezer' | 'fridge' | 'crisper';

export interface CompartmentTabConfig {
  id: FridgeCompartment;
  label: string;
  shortLabel: string;
  icon: string;
  borderActive: string;
  bgActive: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export const COMPARTMENT_TABS: CompartmentTabConfig[] = [
  {
    id: 'all',
    label: 'Toàn Bộ Tủ',
    shortLabel: 'Tất Cả',
    icon: '🧊',
    borderActive: 'border-[#1D4ED8] dark:border-blue-500',
    bgActive: 'bg-[#1D4ED8] text-white dark:bg-blue-600 dark:text-white shadow-xs',
    badgeBg: 'bg-slate-100 dark:bg-slate-700',
    badgeText: 'text-slate-700 dark:text-slate-200',
    description: 'Toàn bộ thực phẩm đang lưu trữ'
  },
  {
    id: 'freezer',
    label: 'Ngăn Đá (-18°C)',
    shortLabel: 'Ngăn Đá',
    icon: '❄️',
    borderActive: 'border-[#1D4ED8] dark:border-blue-500',
    bgActive: 'bg-[#1D4ED8] text-white dark:bg-blue-600 dark:text-white shadow-xs',
    badgeBg: 'bg-slate-100 dark:bg-slate-700',
    badgeText: 'text-slate-700 dark:text-slate-200',
    description: 'Thịt cá cấp đông, viên lẩu, chả giò & kem đá'
  },
  {
    id: 'fridge',
    label: 'Ngăn Mát (2-4°C)',
    shortLabel: 'Ngăn Mát',
    icon: '🧊',
    borderActive: 'border-[#1D4ED8] dark:border-blue-500',
    bgActive: 'bg-[#1D4ED8] text-white dark:bg-blue-600 dark:text-white shadow-xs',
    badgeBg: 'bg-slate-100 dark:bg-slate-700',
    badgeText: 'text-slate-700 dark:text-slate-200',
    description: 'Đồ ăn thừa, trứng, đậu hũ, thịt tươi trong ngày, sữa'
  },
  {
    id: 'crisper',
    label: 'Ngăn Rau Củ',
    shortLabel: 'Rau Củ',
    icon: '🥦',
    borderActive: 'border-[#1D4ED8] dark:border-blue-500',
    bgActive: 'bg-[#1D4ED8] text-white dark:bg-blue-600 dark:text-white shadow-xs',
    badgeBg: 'bg-slate-100 dark:bg-slate-700',
    badgeText: 'text-slate-700 dark:text-slate-200',
    description: 'Rau lá xanh, củ quả nấu canh, nấm tươi & hoa quả'
  }
];

export function inferItemCompartment(item: PantryItem): 'freezer' | 'fridge' | 'crisper' {
  const nameLower = (item.name || '').toLowerCase();
  const cat = item.category || '';
  const notesLower = (item.notes || '').toLowerCase();

  // 0. Strict Dairy Cream & Chilled Dairy Guard (Never put whipping cream, cooking cream, sour cream, cheese, or yogurt in the freezer!)
  const isDairyOrChilledCream =
    nameLower.includes('kem tươi') ||
    nameLower.includes('whipping') ||
    nameLower.includes('cooking cream') ||
    nameLower.includes('heavy cream') ||
    nameLower.includes('sour cream') ||
    nameLower.includes('cream cheese') ||
    nameLower.includes('kem béo') ||
    nameLower.includes('kem sữa') ||
    nameLower.includes('kem chua') ||
    nameLower.includes('kem phô mai') ||
    nameLower.includes('kem nấu') ||
    nameLower.includes('kem trứng') ||
    nameLower.includes('phô mai') ||
    nameLower.includes('bơ lạt') ||
    nameLower.includes('sữa tươi') ||
    nameLower.includes('sữa chua') ||
    nameLower.includes('sữa đặc') ||
    nameLower.includes('váng sữa');

  if (isDairyOrChilledCream && !nameLower.includes('đông lạnh') && !notesLower.includes('cấp đông')) {
    return 'fridge';
  }

  // 1. Explicit note hints
  if (notesLower.includes('ngăn đá') || notesLower.includes('ngăn đông') || notesLower.includes('cấp đông')) {
    return 'freezer';
  }
  if (notesLower.includes('ngăn rau') || notesLower.includes('hộc rau') || notesLower.includes('ngăn củ')) {
    return 'crisper';
  }
  if (notesLower.includes('ngăn mát') || notesLower.includes('ngăn lạnh') || notesLower.includes('cánh tủ')) {
    return 'fridge';
  }

  // 2. Veggie Crisper (Ngăn rau củ quả) — evaluated before saved fallback so grocery produce like Đậu bắp / Bạc hà / Bắp ngọt go to Rau Củ
  if (cat === 'Rau củ quả' || cat === 'rau-cu' || cat === 'trai-cay') {
    if (nameLower.includes('kim chi') || nameLower.includes('dưa muối') || nameLower.includes('cải chua') || nameLower.includes('cà pháo')) {
      return 'fridge';
    }
    return 'crisper';
  }
  if (
    !item.isLeftover && (
      nameLower.includes('rau ') || 
      nameLower.startsWith('rau') ||
      nameLower.includes('cải ') || 
      nameLower.startsWith('cải') ||
      nameLower.includes('xà lách') ||
      nameLower.includes('cà chua') || 
      nameLower.includes('cà rốt') || 
      nameLower.includes('bí ') || 
      nameLower.startsWith('bí ') ||
      nameLower.includes('bầu') || 
      nameLower.includes('mướp') || 
      nameLower.includes('khổ qua') ||
      nameLower.includes('bắp cải') || 
      nameLower.includes('bắp ngọt') ||
      nameLower.includes('bắp mỹ') ||
      nameLower.includes('ngô ngọt') ||
      nameLower.includes('đậu bắp') ||
      nameLower.includes('đậu cô ve') ||
      nameLower.includes('đậu que') ||
      nameLower.includes('đậu hà lan') ||
      nameLower.includes('bạc hà') ||
      nameLower.includes('dọc mùng') ||
      nameLower.includes('giá đỗ') ||
      nameLower.includes('măng ') ||
      nameLower.startsWith('măng') ||
      nameLower.includes('súp lơ') ||
      nameLower.includes('bông cải') ||
      nameLower.includes('cần tây') ||
      nameLower.includes('dưa leo') || 
      nameLower.includes('dưa chuột') || 
      nameLower.includes('nấm ') || 
      nameLower.startsWith('nấm') ||
      nameLower.includes('khoai tây') || 
      nameLower.includes('khoai lang') ||
      nameLower.includes('khoai môn') ||
      nameLower.includes('hành lá') ||
      nameLower.includes('hành tây') ||
      nameLower.includes('ớt chuông') ||
      nameLower.includes('dứa') ||
      nameLower.includes('thơm') ||
      nameLower.includes('trái bơ') ||
      nameLower.includes('bơ sáp') ||
      nameLower.includes('trái cây') ||
      nameLower.includes('hoa quả') ||
      nameLower.includes('táo') ||
      nameLower.includes('chuối') ||
      nameLower.includes('cam ')
    )
  ) {
    return 'crisper';
  }

  if (item.compartment) return item.compartment;

  // 3. Freezer (Ngăn đá) — only actual frozen foods & ice cream (never dairy cream!)
  if (
    nameLower.includes('đông lạnh') || 
    nameLower.includes('cấp đông') || 
    nameLower.includes('đá viên') || 
    nameLower.includes('kem que') || 
    nameLower.includes('kem ốc quế') ||
    nameLower.includes('kem hộp') ||
    nameLower.includes('kem lạnh') ||
    nameLower.includes('kem đá') ||
    nameLower.startsWith('kem ') ||
    nameLower.includes('chả giò đông') ||
    nameLower.includes('viên lẩu') ||
    nameLower.includes('cá viên') ||
    nameLower.includes('bò viên') ||
    nameLower.includes('sủi cảo') ||
    nameLower.includes('há cảo') ||
    ((cat === 'Thịt / Hải sản' || cat === 'thit' || cat === 'hai-san') && item.daysLeft >= 14)
  ) {
    return 'freezer';
  }

  // 4. Fridge (Ngăn mát / Ngăn lạnh) - Default
  return 'fridge';
}

export function getPantryItemIcon(item: PantryItem): string {
  if (item.isLeftover || item.category === 'Đồ ăn thừa') return '🍲';
  const n = (item.name || '').toLowerCase();
  const c = (item.category || '').toLowerCase();

  if (n.includes('trứng') || n.includes('hột gà') || n.includes('hột vịt')) return '🥚';
  if (n.includes('đậu phụ') || n.includes('đậu hũ') || n.includes('tàu hũ') || n.includes('bơ lạt') || n.includes('phô mai')) return '🧈';
  if (n.includes('kem tươi') || n.includes('whipping') || n.includes('sữa')) return '🥛';
  if (n.includes('tôm') || n.includes('cua') || n.includes('ghẹ') || n.includes('nghêu') || n.includes('ngao') || n.includes('ốc') || n.includes('mực')) return '🦐';
  if (n.includes('cá ') || n.startsWith('cá')) return '🐟';
  if (n.includes('gà') || n.includes('vịt')) return '🍗';
  if (n.includes('bò') || n.includes('heo') || n.includes('lợn') || n.includes('sườn') || n.includes('thịt') || n.includes('ba chỉ') || n.includes('giò') || n.includes('chả') || n.includes('xúc xích')) return '🥩';
  if (n.includes('nấm') || n.includes('mộc nhĩ')) return '🍄';
  if (n.includes('cà chua') || n.includes('cà rốt') || n.includes('khoai') || n.includes('bí') || n.includes('bắp') || n.includes('ngô')) return '🥕';
  if (n.includes('dứa') || n.includes('thơm') || n.includes('chuối') || n.includes('táo') || n.includes('cam') || n.includes('trái')) return '🍍';
  if (c === 'thịt / hải sản' || c === 'thit') return '🥩';
  if (c === 'hai-san') return '🐟';
  if (c === 'rau củ quả' || c === 'rau-cu' || c === 'trai-cay' || inferItemCompartment(item) === 'crisper') return '🥬';
  if (c === 'trứng & đậu') return '🥚';
  if (c === 'đồ khô & gia vị' || c === 'gia-vi' || c === 'gia-vi-kho') return '🧂';
  return '🧊';
}

export interface SubCategoryOption {
  id: string;
  label: string;
  icon?: string;
}

export function getSubCategoriesForCompartment(compartment: FridgeCompartment): SubCategoryOption[] {
  switch (compartment) {
    case 'freezer':
      return [
        { id: 'all', label: 'Tất Cả Ngăn Đá', icon: '❄️' },
        { id: 'frozen_meat', label: 'Thịt Cấp Đông', icon: '🥩' },
        { id: 'frozen_seafood', label: 'Cá & Thủy Hải Sản', icon: '🐟' },
        { id: 'frozen_ready', label: 'Chế Biến Sẵn & Viên Lẩu', icon: '🥟' },
        { id: 'ice_dessert', label: 'Kem, Bơ & Đá Viên', icon: '🍧' },
        { id: 'urgent', label: 'Cần Ăn Trước (Hạn Ngắn)', icon: '⏰' }
      ];
    case 'fridge':
      return [
        { id: 'all', label: 'Tất Cả Ngăn Lạnh', icon: '🧊' },
        { id: 'leftovers', label: 'Đồ Ăn Thừa Bữa Trước', icon: '🍲' },
        { id: 'fresh_protein', label: 'Thịt Tươi Nấu Liền', icon: '🥩' },
        { id: 'egg_tofu', label: 'Trứng & Đậu Phụ', icon: '🥚' },
        { id: 'ready_to_eat', label: 'Giò Chả & Ăn Liền', icon: '🥓' },
        { id: 'dairy_drinks', label: 'Sữa & Đồ Uống', icon: '🥛' },
        { id: 'sauces_pickles', label: 'Sốt, Kim Chi & Đồ Chua', icon: '🥫' },
        { id: 'urgent', label: 'Ăn Gấp ≤ 2 Ngày', icon: '⏰' }
      ];
    case 'crisper':
      return [
        { id: 'all', label: 'Tất Cả Ngăn Rau', icon: '🥦' },
        { id: 'leafy_greens', label: 'Rau Lá Xanh', icon: '🥬' },
        { id: 'tubers_squash', label: 'Củ & Quả Nấu Canh', icon: '🥕' },
        { id: 'mushrooms', label: 'Nấm Tươi', icon: '🍄' },
        { id: 'fresh_fruits', label: 'Trái Cây & Hoa Quả', icon: '🍎' },
        { id: 'urgent', label: 'Ăn Gấp ≤ 2 Ngày', icon: '⏰' }
      ];
    case 'all':
    default:
      return [
        { id: 'all', label: 'Tất Cả', icon: '✨' },
        { id: 'leftovers', label: 'Đồ Ăn Thừa', icon: '🍲' },
        { id: 'urgent', label: 'Ăn Gấp ≤ 2 Ngày', icon: '⏰' },
        { id: 'meat_seafood', label: 'Thịt / Hải Sản', icon: '🥩' },
        { id: 'veggies', label: 'Rau Củ Quả', icon: '🥦' },
        { id: 'eggs_tofu', label: 'Trứng & Đậu', icon: '🥚' },
        { id: 'condiments', label: 'Đồ Khô & Gia Vị', icon: '🧂' },
        { id: 'drinks', label: 'Đồ Uống & Khác', icon: '🧃' }
      ];
  }
}

export function matchesSubCategory(
  item: PantryItem, 
  compartment: FridgeCompartment, 
  subCatId: string
): boolean {
  if (subCatId === 'all') return true;
  if (subCatId === 'urgent') return item.daysLeft <= 2;
  if (subCatId === 'leftovers') return Boolean(item.isLeftover || item.category === 'Đồ ăn thừa');

  const name = item.name;
  const cat = item.category;

  if (compartment === 'all') {
    if (subCatId === 'meat_seafood') return cat === 'Thịt / Hải sản';
    if (subCatId === 'veggies') return cat === 'Rau củ quả';
    if (subCatId === 'eggs_tofu') return cat === 'Trứng & Đậu';
    if (subCatId === 'condiments') return cat === 'Đồ khô & Gia vị';
    if (subCatId === 'drinks') return cat === 'Đồ uống' || cat === 'Khác';
  } else if (compartment === 'freezer') {
    if (subCatId === 'frozen_meat') {
      return cat === 'Thịt / Hải sản' && 
        !matchesFoodSearch(name, 'cá') && 
        !matchesFoodSearch(name, 'tôm') && 
        !matchesFoodSearch(name, 'mực') && 
        !matchesFoodSearch(name, 'hải sản') && 
        !matchesFoodSearch(name, 'nghêu') &&
        !matchesFoodSearch(name, 'chả giò') &&
        !matchesFoodSearch(name, 'viên');
    }
    if (subCatId === 'frozen_seafood') {
      return matchesFoodSearch(name, 'cá') || 
        matchesFoodSearch(name, 'tôm') || 
        matchesFoodSearch(name, 'mực') || 
        matchesFoodSearch(name, 'hải sản') || 
        matchesFoodSearch(name, 'nghêu');
    }
    if (subCatId === 'frozen_ready') {
      return matchesFoodSearch(name, 'chả giò') || 
        matchesFoodSearch(name, 'xúc xích') || 
        matchesFoodSearch(name, 'viên') || 
        matchesFoodSearch(name, 'há cảo') || 
        matchesFoodSearch(name, 'sủi cảo') || 
        matchesFoodSearch(name, 'nem');
    }
    if (subCatId === 'ice_dessert') {
      return matchesFoodSearch(name, 'kem') || 
        matchesFoodSearch(name, 'đá') || 
        matchesFoodSearch(name, 'bơ');
    }
  } else if (compartment === 'fridge') {
    if (subCatId === 'fresh_protein') {
      return cat === 'Thịt / Hải sản' && !item.isLeftover;
    }
    if (subCatId === 'egg_tofu') {
      return cat === 'Trứng & Đậu' || matchesFoodSearch(name, 'trứng') || matchesFoodSearch(name, 'đậu');
    }
    if (subCatId === 'ready_to_eat') {
      return matchesFoodSearch(name, 'giò') || 
        matchesFoodSearch(name, 'chả') || 
        matchesFoodSearch(name, 'xúc xích') || 
        matchesFoodSearch(name, 'bún') || 
        matchesFoodSearch(name, 'phở');
    }
    if (subCatId === 'dairy_drinks') {
      return cat === 'Đồ uống' || 
        matchesFoodSearch(name, 'sữa') || 
        matchesFoodSearch(name, 'kem tươi') || 
        matchesFoodSearch(name, 'whipping') || 
        matchesFoodSearch(name, 'kem béo') || 
        matchesFoodSearch(name, 'phô mai') || 
        matchesFoodSearch(name, 'bơ lạt') || 
        matchesFoodSearch(name, 'nước') || 
        matchesFoodSearch(name, 'bia');
    }
    if (subCatId === 'sauces_pickles') {
      return cat === 'Đồ khô & Gia vị' || 
        matchesFoodSearch(name, 'kim chi') || 
        matchesFoodSearch(name, 'dưa chua') || 
        matchesFoodSearch(name, 'sốt') || 
        matchesFoodSearch(name, 'mắm') || 
        matchesFoodSearch(name, 'cà pháo');
    }
  } else if (compartment === 'crisper') {
    if (subCatId === 'leafy_greens') {
      return matchesFoodSearch(name, 'rau') || 
        matchesFoodSearch(name, 'cải') || 
        matchesFoodSearch(name, 'xà lách') || 
        matchesFoodSearch(name, 'ngò') || 
        matchesFoodSearch(name, 'hành');
    }
    if (subCatId === 'tubers_squash') {
      return matchesFoodSearch(name, 'bí') || 
        matchesFoodSearch(name, 'cà chua') || 
        matchesFoodSearch(name, 'cà rốt') || 
        matchesFoodSearch(name, 'dưa leo') || 
        matchesFoodSearch(name, 'dưa chuột') || 
        matchesFoodSearch(name, 'bầu') || 
        matchesFoodSearch(name, 'mướp') || 
        matchesFoodSearch(name, 'bắp') || 
        matchesFoodSearch(name, 'khoai');
    }
    if (subCatId === 'mushrooms') {
      return matchesFoodSearch(name, 'nấm');
    }
    if (subCatId === 'fresh_fruits') {
      return matchesFoodSearch(name, 'táo') || 
        matchesFoodSearch(name, 'cam') || 
        matchesFoodSearch(name, 'nho') || 
        matchesFoodSearch(name, 'dưa hấu') || 
        matchesFoodSearch(name, 'bưởi') || 
        matchesFoodSearch(name, 'chuối') || 
        matchesFoodSearch(name, 'xoài');
    }
  }
  return true;
}

export const FridgeView: React.FC = () => {
  const { 
    pantryItems, 
    addPantryItem, 
    removePantryItem, 
    clearPantryItems, 
    recipes, 
    setSelectedRecipe, 
    setActiveTab, 
    showToast,
    openConfirmModal
  } = useMealWise();

  const addFormRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const subDropdownRef = useRef<HTMLDivElement>(null);

  const [activeCompartment, setActiveCompartment] = useState<FridgeCompartment>('all');
  const [activeSubFilter, setActiveSubFilter] = useState<string>('all');
  const [isSubDropdownOpen, setIsSubDropdownOpen] = useState<boolean>(false);
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [isFullShelfModalOpen, setIsFullShelfModalOpen] = useState(false);
  const [isItemSuggestionModalOpen, setIsItemSuggestionModalOpen] = useState(false);
  const [pendingRecipeToConfirm, setPendingRecipeToConfirm] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemForRecipe, setSelectedItemForRecipe] = useState<PantryItem | null>(null);
  const [singleItemReloadOffset, setSingleItemReloadOffset] = useState<number>(0);
  const [isReloadingItem, setIsReloadingItem] = useState<boolean>(false);

  // Whole Fridge Suggestions state - default closed (false), remembers user preference across sessions
  const [isWholeFridgeExpanded, setIsWholeFridgeExpanded] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEY_WHOLE_FRIDGE_EXPANDED);
        if (saved !== null) {
          return saved === 'true';
        }
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
    return false; // Default setting: always closed
  });
  const [wholeFridgeReloadOffset, setWholeFridgeReloadOffset] = useState<number>(0);
  const [isReloadingWholeFridge, setIsReloadingWholeFridge] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Đồ ăn thừa');
  const [compartment, setCompartment] = useState<'freezer' | 'fridge' | 'crisper'>('fridge');
  const [quantity, setQuantity] = useState('1 phần');
  const [daysLeft, setDaysLeft] = useState<number>(2);
  const [isLeftover, setIsLeftover] = useState(true);
  const [notes, setNotes] = useState('');
  const [discountVnd, setDiscountVnd] = useState<number>(20000);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY_WHOLE_FRIDGE_EXPANDED, String(isWholeFridgeExpanded));
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [isWholeFridgeExpanded]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (subDropdownRef.current && !subDropdownRef.current.contains(e.target as Node)) {
        setIsSubDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsSubDropdownOpen(false);
        setIsAddingOpen(false);
        if (isItemSuggestionModalOpen) {
          setIsItemSuggestionModalOpen(false);
        } else {
          setIsFullShelfModalOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filteredSuggestions = useMemo(() => {
    const trimmed = name.trim();
    if (!trimmed) return [];
    return PRESET_FOOD_SUGGESTIONS.filter(item => {
      if (matchesFoodSearch(item.name, trimmed)) return true;
      if (matchesFoodSearch(item.category, trimmed)) return true;
      if (item.note && matchesFoodSearch(item.note, trimmed)) return true;
      if (item.keywords && item.keywords.some(kw => matchesFoodSearch(kw, trimmed))) return true;
      return false;
    }).slice(0, 6);
  }, [name]);

  // Compartment counts
  const compartmentCounts = useMemo(() => {
    let freezer = 0;
    let fridge = 0;
    let crisper = 0;

    for (const item of pantryItems) {
      const comp = inferItemCompartment(item);
      if (comp === 'freezer') freezer++;
      else if (comp === 'crisper') crisper++;
      else fridge++;
    }

    return {
      all: pantryItems.length,
      freezer,
      fridge,
      crisper
    };
  }, [pantryItems]);

  // Urgent counts per compartment (items with daysLeft <= 2)
  const compartmentUrgentCounts = useMemo(() => {
    let all = 0;
    let freezer = 0;
    let fridge = 0;
    let crisper = 0;

    for (const item of pantryItems) {
      if (item.daysLeft <= 2) {
        all++;
        const comp = inferItemCompartment(item);
        if (comp === 'freezer') freezer++;
        else if (comp === 'crisper') crisper++;
        else fridge++;
      }
    }

    return {
      all,
      freezer,
      fridge,
      crisper
    };
  }, [pantryItems]);

  // Contextual sub-categories for active compartment
  const currentSubCategories = useMemo(() => {
    const options = getSubCategoriesForCompartment(activeCompartment);
    const baseItems = activeCompartment === 'all'
      ? pantryItems
      : pantryItems.filter(i => inferItemCompartment(i) === activeCompartment);

    return options.map(opt => {
      const count = opt.id === 'all'
        ? baseItems.length
        : baseItems.filter(i => matchesSubCategory(i, activeCompartment, opt.id)).length;
      return {
        ...opt,
        count
      };
    });
  }, [activeCompartment, pantryItems]);

  const totalPotentialSavings = pantryItems.reduce((acc, curr) => acc + (curr.discountOpportunityVnd || 15000), 0);
  const urgentList = useMemo(() => pantryItems.filter(i => i.daysLeft <= 2), [pantryItems]);
  const leftoversList = useMemo(() => pantryItems.filter(i => i.isLeftover || i.category === 'Đồ ăn thừa'), [pantryItems]);

  // Displayed items strictly filtered by compartment, subcategory, and search
  const displayedItems = useMemo(() => {
    const list = pantryItems.filter(item => {
      // 1. Compartment filter
      if (activeCompartment !== 'all') {
        const comp = inferItemCompartment(item);
        if (comp !== activeCompartment) return false;
      }

      // 2. Contextual subcategory filter
      if (!matchesSubCategory(item, activeCompartment, activeSubFilter)) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const matchName = matchesFoodSearch(item.name, searchQuery);
        const matchCat = matchesFoodSearch(item.category, searchQuery);
        const matchNote = item.notes ? matchesFoodSearch(item.notes, searchQuery) : false;
        return matchName || matchCat || matchNote;
      }
      return true;
    });

    // Urgency & cookability sorting:
    // Items that have food to cook appear first (sorted by urgency: daysLeft ascending).
    // Ingredients without recipes or base condiments are pushed to the bottom (also sorted by daysLeft).
    return list.sort((a, b) => {
      const aCookable = hasCookableRecipes(a, recipes);
      const bCookable = hasCookableRecipes(b, recipes);

      if (aCookable !== bCookable) {
        return aCookable ? -1 : 1; // Cookable items come first, uncookable go to bottom
      }
      return a.daysLeft - b.daysLeft;
    });
  }, [pantryItems, recipes, activeCompartment, activeSubFilter, searchQuery]);

  const handleApplySuggestion = (sug: PresetPantrySuggestion) => {
    setName(sug.name);
    setNameError(null);
    setCategory(sug.category);
    setQuantity(sug.qty);
    setDaysLeft(sug.days);
    setIsLeftover(sug.isLeftover);
    setNotes(sug.note || '');
    if (sug.discountVnd) {
      setDiscountVnd(sug.discountVnd);
    }
    if (sug.compartment) {
      setCompartment(sug.compartment);
    } else {
      const inferred = inferItemCompartment({
        id: 'temp',
        name: sug.name,
        category: sug.category,
        quantity: sug.qty,
        daysLeft: sug.days,
        status: 'fresh',
        isLeftover: sug.isLeftover,
        notes: sug.note
      });
      setCompartment(inferred);
    }
    setIsAddingOpen(true);
    setIsDropdownOpen(false);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Vui lòng nhập tên món hoặc thực phẩm để lưu');
      showToast('⚠️ Vui lòng nhập tên món hoặc thực phẩm!', 'warning');
      return;
    }
    setNameError(null);

    const status: PantryItem['status'] = daysLeft <= 1 ? 'warning' : daysLeft <= 2 ? 'warning' : 'fresh';

    addPantryItem({
      name: name.trim(),
      category,
      quantity: quantity.trim() || '1 phần',
      daysLeft,
      status,
      discountOpportunityVnd: discountVnd,
      isLeftover,
      notes: notes.trim(),
      compartment,
      addedAt: new Date().toLocaleDateString('vi-VN')
    });

    setName('');
    setNameError(null);
    setQuantity('1 phần');
    setDaysLeft(2);
    setNotes('');
    setCompartment('fridge');
    setIsAddingOpen(false);
  };

  const handleSelectItemForRecipe = (item: PantryItem) => {
    if (selectedItemForRecipe?.id === item.id) {
      setSelectedItemForRecipe(null);
      setIsItemSuggestionModalOpen(false);
      return;
    }
    setSingleItemReloadOffset(0);
    setSelectedItemForRecipe(item);
  };

  // Whole-fridge multi-ingredient suggestion (Lazy & Asynchronous to prevent UI freeze)
  const [wholeFridgeData, setWholeFridgeData] = useState<{
    results: WholeFridgeSuggestionResult[];
    totalEligible: number;
  }>({ results: [], totalEligible: 0 });
  const [isWholeFridgeComputing, setIsWholeFridgeComputing] = useState(false);

  useEffect(() => {
    if (!isWholeFridgeExpanded || pantryItems.length === 0) {
      return;
    }

    setIsWholeFridgeComputing(true);
    const timer = setTimeout(() => {
      const data = findWholeFridgeRecipeSuggestions(pantryItems, recipes, 4, wholeFridgeReloadOffset);
      setWholeFridgeData(data);
      setIsWholeFridgeComputing(false);
    }, 30);

    return () => clearTimeout(timer);
  }, [isWholeFridgeExpanded, pantryItems, recipes, wholeFridgeReloadOffset]);

  // Single-item suggestion with synergy and reload offset (Strictly 3 dishes per batch)
  const [singleItemData, setSingleItemData] = useState<{
    results: Recipe[];
    totalEligible: number;
    synergyCounts: Record<string, number>;
  }>({ results: [], totalEligible: 0, synergyCounts: {} });
  const [isSingleItemComputing, setIsSingleItemComputing] = useState(false);

  useEffect(() => {
    if (!selectedItemForRecipe) {
      setSingleItemData({ results: [], totalEligible: 0, synergyCounts: {} });
      return;
    }

    setIsSingleItemComputing(true);
    const timer = setTimeout(() => {
      const data = findLeftoverRecipeSuggestionsWithCount(
        selectedItemForRecipe,
        recipes,
        3,
        singleItemReloadOffset,
        pantryItems
      );
      setSingleItemData(data);
      setIsSingleItemComputing(false);
    }, 30);

    return () => clearTimeout(timer);
  }, [selectedItemForRecipe, recipes, singleItemReloadOffset, pantryItems]);

  const suggestedRecipes = singleItemData.results;
  const singleItemTotalEligible = singleItemData.totalEligible;

  const handleReloadItemSuggestions = () => {
    if (singleItemTotalEligible <= 3) return;
    setIsReloadingItem(true);
    setSingleItemReloadOffset(prev => prev + 3);
    setTimeout(() => {
      setIsReloadingItem(false);
      showToast('Đã gợi ý 3 món khác!');
    }, 250);
  };

  const handleReloadWholeFridgeSuggestions = () => {
    if (wholeFridgeData.totalEligible <= 4) return;
    setIsReloadingWholeFridge(true);
    setWholeFridgeReloadOffset(prev => prev + 4);
    setTimeout(() => {
      setIsReloadingWholeFridge(false);
      showToast('Đã đổi sang 4 món mới từ cả tủ lạnh!');
    }, 250);
  };

  return (
    <div className="space-y-3.5 animate-fadeIn">
      {/* Top Banner & Header */}
      <div className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 sm:space-y-3 shadow-xs">
        <div>
          <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-slate-900 dark:text-white leading-snug text-balance">
            Tủ Lạnh & Đồ Ăn Thừa <span className="whitespace-nowrap text-cyan-600 dark:text-cyan-400">Thông Minh</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
            Quản lý thức ăn thừa bữa trước, theo dõi hạn dùng và tận dụng nguyên liệu sẵn có để trừ bớt tiền đi chợ.
          </p>
        </div>

        {/* 4 Summary Metric Cards: Uniform 60% Slate/White surface, 10% semantic accent strictly on numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 pt-1">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 min-w-0">
              <span className="truncate">Trong Tủ Lạnh</span>
            </span>
            <span className="text-sm sm:text-lg font-black text-slate-900 dark:text-white block mt-0.5 truncate">
              {pantryItems.length} món
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 min-w-0">
              <Clock className="w-3 h-3 shrink-0 text-rose-500" />
              <span className="truncate">Ăn Gấp ≤ 2 Ngày</span>
            </span>
            <span className={`text-sm sm:text-lg font-black block mt-0.5 truncate ${urgentList.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {urgentList.length} món
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 min-w-0">
              <span className="truncate">Đồ Ăn Thừa</span>
            </span>
            <span className="text-sm sm:text-lg font-black text-slate-900 dark:text-white block mt-0.5 truncate">
              {leftoversList.length} món
            </span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 min-w-0">
              <Sparkles className="w-3 h-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="truncate">Tiết Kiệm Đi Chợ</span>
            </span>
            <span className="text-sm sm:text-lg font-black text-emerald-600 dark:text-emerald-400 block mt-0.5 truncate">
              ~{(totalPotentialSavings / 1000).toFixed(0)}k đ
            </span>
          </div>
        </div>
      </div>

      {/* Layered Refrigerator Filter & Side-by-Side Fridge Simulator */}
      <div className="space-y-2.5">
        {/* Top Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Sub-Category Dropdown Bar */}
          <div className="relative flex-1" ref={subDropdownRef}>
            {(() => {
              const activeSub = currentSubCategories.find(s => s.id === activeSubFilter) || currentSubCategories[0];

              return (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSubDropdownOpen(prev => !prev)}
                    aria-expanded={isSubDropdownOpen}
                    className={`flex-1 flex items-center justify-between px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all shadow-2xs min-h-[42px] cursor-pointer ${
                      activeSubFilter !== 'all'
                        ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] font-extrabold'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`text-[11px] font-semibold shrink-0 ${activeSubFilter !== 'all' ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                        Phân loại:
                      </span>
                      <span className="font-extrabold truncate">
                        {activeSub?.label || 'Tất Cả'}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                        activeSubFilter !== 'all'
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {activeSub?.count || 0} món
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <span className={`text-[10px] hidden min-[360px]:inline ${activeSubFilter !== 'all' ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                        {isSubDropdownOpen ? 'Đóng' : 'Đổi loại'}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSubDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {activeSubFilter !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setActiveSubFilter('all')}
                      className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-200 dark:border-slate-700 min-h-[42px] transition-all shrink-0 cursor-pointer active:scale-95"
                      title="Xem tất cả món"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span className="hidden min-[360px]:inline">Tất cả</span>
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Dropdown Menu Panel */}
            {isSubDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-2.5 space-y-1 animate-fade-in max-h-72 overflow-y-auto">
                <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <span>Chọn danh mục lọc thực phẩm</span>
                  <span>{currentSubCategories.find(c => c.id === 'all')?.count || 0} món</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {currentSubCategories.map(sub => {
                    const active = activeSubFilter === sub.id;
                    const isUrgentOption = sub.id === 'urgent';
                    const hasUrgentItems = isUrgentOption && sub.count > 0;

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setActiveSubFilter(sub.id);
                          setIsSubDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl text-left transition-all min-h-[44px] cursor-pointer border ${
                          active
                            ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] font-black shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border-slate-200/70 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 pr-1">
                          <span className="text-sm shrink-0">{sub.icon || '🏷️'}</span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate">
                              {sub.label}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                          active
                            ? 'bg-white/20 text-white'
                            : hasUrgentItems
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}>
                          {sub.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm trong tủ..."
              className="w-full pl-8 pr-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs min-h-[42px]"
            />
          </div>
        </div>

        {/* SIDE-BY-SIDE FRIDGE SIMULATOR: 3-Shelf Fridge Appliance (Left) + 4-Item Shelf Grid (Right) */}
        <div className="flex items-stretch gap-2.5 sm:gap-3">
          
          {/* LEFT SIDEBAR: Physical 3-Shelf Refrigerator Appliance (Aligned flush top-to-bottom with the 4-item right box) */}
          <div
            data-tutorial-target="fridge-compartments-tab"
            className="w-[108px] sm:w-[124px] shrink-0 flex flex-col gap-2"
          >
            {/* Top Circle Checkbox ("Tất Cả") — ON by default, highlights the entire fridge box */}
            {(() => {
              const isAllSelected = activeCompartment === 'all';
              const allCount = compartmentCounts['all'];
              return (
                <button
                  type="button"
                  onClick={() => {
                    setActiveCompartment('all');
                    setActiveSubFilter('all');
                    setIsSubDropdownOpen(false);
                  }}
                  aria-pressed={isAllSelected}
                  title="Chọn toàn bộ các ngăn tủ lạnh"
                  className={`w-full py-2 px-2 rounded-2xl border flex items-center justify-between gap-1 transition-all cursor-pointer select-none active:scale-95 shrink-0 ${
                    isAllSelected
                      ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {/* Circle Checkbox */}
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isAllSelected
                          ? 'bg-white border-white text-[#1D4ED8]'
                          : 'border-slate-300 dark:border-slate-600 bg-transparent'
                      }`}
                    >
                      {isAllSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
                      )}
                    </span>
                    <span className="text-[11px] font-black tracking-tight whitespace-nowrap">
                      Tất Cả
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9.5px] font-black shrink-0 ${
                      isAllSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {allCount}
                  </span>
                </button>
              );
            })()}

            {/* 3-Shelf Refrigerator Chassis: Extends flush to the bottom of the right-hand 4-item box */}
            {(() => {
              const isAllSelected = activeCompartment === 'all';
              const shelves = [
                {
                  id: 'freezer' as const,
                  label: 'Ngăn Đá',
                  sub: '-18°C',
                  icon: '❄️',
                  flexClass: 'flex-1 min-h-[72px]'
                },
                {
                  id: 'fridge' as const,
                  label: 'Ngăn Mát',
                  sub: '2–4°C',
                  icon: '🧊',
                  flexClass: 'flex-[1.25] min-h-[92px]'
                },
                {
                  id: 'crisper' as const,
                  label: 'Rau Củ',
                  sub: 'Độ ẩm cao',
                  icon: '🥬',
                  flexClass: 'flex-1 min-h-[72px]'
                }
              ];

              return (
                <div
                  className={`flex-1 flex flex-col rounded-3xl overflow-hidden border-2 transition-all duration-200 p-1.5 gap-1.5 ${
                    isAllSelected
                      ? 'border-[#1D4ED8] bg-blue-50/40 dark:bg-blue-950/25 ring-2 ring-[#1D4ED8]/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/90'
                  }`}
                >
                  {shelves.map((shelf, idx) => {
                    const count = compartmentCounts[shelf.id];
                    const urgentCount = compartmentUrgentCounts[shelf.id];
                    const isShelfActive = activeCompartment === shelf.id;
                    const isHighlighted = isAllSelected || isShelfActive;

                    return (
                      <button
                        key={shelf.id}
                        type="button"
                        onClick={() => {
                          const nextComp = activeCompartment === shelf.id ? 'all' : shelf.id;
                          setActiveCompartment(nextComp);
                          setActiveSubFilter('all');
                          setIsSubDropdownOpen(false);
                        }}
                        aria-pressed={isHighlighted}
                        title={`${shelf.label} (${shelf.sub}) • ${count} món`}
                        className={`relative w-full ${shelf.flexClass} rounded-2xl px-2 py-1.5 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none active:scale-[0.98] border ${
                          isShelfActive
                            ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-xs'
                            : isAllSelected
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-blue-200 dark:border-blue-800/70 hover:bg-blue-50/60 shadow-2xs'
                            : 'bg-white/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200/70 dark:border-slate-700/60 hover:bg-white'
                        }`}
                      >
                        {/* Fridge Door Handle Visual Accent on the Left Edge */}
                        <span
                          className={`w-1 rounded-full absolute left-1.5 ${
                            idx === 1 ? 'h-6' : 'h-4'
                          } ${
                            isShelfActive
                              ? 'bg-white/45'
                              : isAllSelected
                              ? 'bg-[#1D4ED8]/35'
                              : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        />

                        {/* Urgent Dot Indicator */}
                        {urgentCount > 0 && (
                          <span
                            className={`w-2 h-2 rounded-full absolute top-1.5 right-1.5 ${
                              isShelfActive ? 'bg-amber-300' : 'bg-rose-500'
                            }`}
                            title={`${urgentCount} món sắp hết hạn`}
                          />
                        )}

                        <span className="text-sm leading-none mb-0.5">{shelf.icon}</span>
                        <span className="text-[10.5px] font-black tracking-tight leading-tight block">
                          {shelf.label}
                        </span>
                        <span
                          className={`mt-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                            isShelfActive
                              ? 'bg-white/20 text-white'
                              : isAllSelected
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-300 border border-blue-200/60 dark:border-blue-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {count} món
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* RIGHT BOX: Fridge Shelf Ingredient Container (2-Column Shelf Tile Grid, Capped at 4 Items) */}
          <div className="flex-1 min-w-0 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-3.5 shadow-xs flex flex-col justify-between min-h-[280px]">
            {/* Top Compartment Header Bar inside the Right Box */}
            <div>
              <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm shrink-0">
                      {activeCompartment === 'freezer' ? '❄️' : activeCompartment === 'fridge' ? '🧊' : activeCompartment === 'crisper' ? '🥬' : '🗄️'}
                    </span>
                    <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                      {activeCompartment === 'freezer'
                        ? 'Ngăn Đá Đông Lạnh'
                        : activeCompartment === 'fridge'
                        ? 'Ngăn Mát & Đồ Thừa'
                        : activeCompartment === 'crisper'
                        ? 'Ngăn Rau Củ Tươi'
                        : 'Toàn Bộ Tủ Lạnh'}
                    </h2>
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black shrink-0">
                      {displayedItems.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeCompartment !== 'all') {
                          setCompartment(activeCompartment);
                        }
                        setIsAddingOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 text-[#1D4ED8] dark:text-blue-400 text-[10.5px] font-black flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                      title="Thêm nguyên liệu vào ngăn này"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>Thêm</span>
                    </button>

                    {pantryItems.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          openConfirmModal({
                            title: 'Dọn Sạch Tủ Lạnh',
                            message: 'Bạn có chắc chắn muốn dọn sạch toàn bộ thực phẩm và đồ ăn thừa trong tủ lạnh?',
                            confirmLabel: 'Dọn sạch',
                            cancelLabel: 'Giữ lại',
                            isDanger: true,
                            onConfirm: () => {
                              clearPantryItems();
                              setSelectedItemForRecipe(null);
                              showToast('🧹 Đã dọn sạch thực phẩm trong tủ lạnh!');
                            }
                          });
                        }}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
                        title="Dọn sạch tủ lạnh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2-Column Fridge Shelf Tile Grid (Capped at 4 items so it never overflows the 3-shelf fridge height) */}
                {displayedItems.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {displayedItems.slice(0, 4).map(item => {
                        const isUrgent = item.daysLeft <= 2;
                        const isEmergency = item.daysLeft <= 1;
                        const isSelectedForRecipe = selectedItemForRecipe?.id === item.id;
                        const itemIcon = getPantryItemIcon(item);

                        return (
                          <div
                            key={item.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectItemForRecipe(item)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleSelectItemForRecipe(item);
                              }
                            }}
                            aria-pressed={isSelectedForRecipe}
                            title={`${item.name} (${item.quantity}) — Chạm để gợi ý món nấu hoặc xử lý`}
                            className={`relative p-2.5 rounded-2xl border text-left transition-all cursor-pointer select-none active:scale-[0.98] flex flex-col justify-between gap-1.5 ${
                              isSelectedForRecipe
                                ? 'bg-blue-50/70 dark:bg-blue-950/40 border-[#1D4ED8] ring-1 ring-[#1D4ED8]/25 shadow-2xs'
                                : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:border-blue-300 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                          >
                            {/* Top Row of Tile: Food Icon + Expiration Icon-Only Corner Badge */}
                            <div className="flex items-start justify-between gap-1">
                              <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700 flex items-center justify-center text-sm shrink-0 shadow-2xs">
                                {itemIcon}
                              </div>

                              {/* Icon-Only Expiration Warning (Only when close to expiration: daysLeft <= 2) */}
                              {isUrgent && (
                                <span
                                  title={isEmergency ? 'Sắp hết hạn (Dùng ngay hôm nay)' : `Sắp hết hạn (Còn ${item.daysLeft} ngày)`}
                                  className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                                    isEmergency
                                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500 border-rose-200 dark:border-rose-800'
                                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                  }`}
                                >
                                  {isEmergency ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                </span>
                              )}
                            </div>

                            {/* Bottom Row of Tile: Ingredient Name + Quantity */}
                            <div className="min-w-0">
                              <h3 className="text-[11.5px] sm:text-xs font-black text-slate-900 dark:text-slate-100 line-clamp-1 leading-snug">
                                {item.name}
                              </h3>
                              <div className="flex items-center justify-between gap-1 mt-0.5">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">
                                  {item.quantity}
                                </span>
                                {item.isLeftover && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] shrink-0" title="Đồ ăn thừa" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Contextual Quick-Action Dock when a Shelf Tile is Selected (or subtle hint when none selected) */}
                    {selectedItemForRecipe ? (
                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 animate-fadeIn">
                        <div className="min-w-0 flex items-center gap-1.5 flex-1">
                          <span className="text-xs font-black text-[#1D4ED8] dark:text-blue-400 truncate">
                            {selectedItemForRecipe.name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 shrink-0">
                            ({selectedItemForRecipe.quantity})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            removePantryItem(selectedItemForRecipe.id);
                            setSelectedItemForRecipe(null);
                            setIsItemSuggestionModalOpen(false);
                          }}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 transition-colors cursor-pointer shrink-0"
                          title="Xóa khỏi tủ lạnh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 text-center pt-0.5">
                        Chạm vào nguyên liệu bất kỳ để xem món gợi ý • Tự động trừ khi nấu xong
                      </p>
                    )}

                    {/* Overflow "•••" Button: ONLY shown when displayedItems.length > 4 (Icon-only as requested) */}
                    {displayedItems.length > 4 && (
                      <button
                        type="button"
                        onClick={() => setIsFullShelfModalOpen(true)}
                        aria-label={`Xem đầy đủ ${displayedItems.length} món trong ngăn này`}
                        className="w-full py-1.5 px-3 rounded-xl bg-slate-100/90 hover:bg-blue-50 dark:bg-slate-800/80 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700 hover:border-blue-300 text-slate-700 dark:text-slate-200 hover:text-[#1D4ED8] dark:hover:text-blue-400 flex items-center justify-center transition-all cursor-pointer active:scale-[0.98]"
                        title={`Xem đầy đủ ${displayedItems.length} món trong ngăn này`}
                      >
                        <span className="tracking-[0.25em] text-sm font-black leading-none">•••</span>
                      </button>
                    )}
                  </div>
                ) : (
                /* Compact Empty Shelf State inside the Right Ingredient Box */
                <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-3 space-y-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xl">
                    {activeCompartment === 'freezer' ? '❄️' : activeCompartment === 'crisper' ? '🥬' : '🧊'}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {searchQuery
                        ? 'Không tìm thấy thực phẩm'
                        : activeCompartment === 'freezer'
                        ? 'Ngăn Đá Đang Trống'
                        : activeCompartment === 'fridge'
                        ? 'Ngăn Mát Đang Trống'
                        : activeCompartment === 'crisper'
                        ? 'Ngăn Rau Củ Đang Trống'
                        : 'Tủ Lạnh Chưa Có Món Nào'}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[210px] mx-auto leading-relaxed">
                      {searchQuery
                        ? 'Thử đổi từ khóa hoặc chọn Tất Cả ở thanh tủ bên trái.'
                        : 'Thêm thức ăn thừa hoặc nguyên liệu sẵn có để tự động trừ khỏi giỏ đi chợ!'}
                    </p>
                  </div>
                  {!searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeCompartment !== 'all') {
                          setCompartment(activeCompartment);
                        }
                        setIsAddingOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-black text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      + Nhập Món Đầu Tiên
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Whole-Fridge Multi-Ingredient Suggestions Section */}
      {pantryItems.length > 0 && (
        <div className="p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div 
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer select-none group"
              onClick={() => setIsWholeFridgeExpanded(prev => !prev)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsWholeFridgeExpanded(prev => !prev);
                }
              }}
              title={isWholeFridgeExpanded ? 'Bấm để thu gọn danh sách gợi ý' : 'Bấm để mở rộng danh sách gợi ý'}
            >
              <div className="w-8 h-8 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center shadow-xs shrink-0 font-bold group-hover:scale-105 transition-transform">
                <ChefHat className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5 flex-wrap">
                  <span className="truncate group-hover:text-[#1D4ED8] dark:group-hover:text-blue-400 transition-colors">
                    Gợi Ý Nấu Từ Cả Tủ Lạnh
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                    {isWholeFridgeComputing ? 'Đang phân tích...' : wholeFridgeData.totalEligible > 0 ? `${wholeFridgeData.totalEligible} món có thể nấu` : 'Bấm để tìm món'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Đối chiếu toàn bộ {pantryItems.length} thực phẩm sẵn có trong tủ với hơn 700 công thức
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isWholeFridgeExpanded && (
                <button
                  type="button"
                  onClick={handleReloadWholeFridgeSuggestions}
                  disabled={wholeFridgeData.totalEligible <= 4 || isWholeFridgeComputing}
                  className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title={wholeFridgeData.totalEligible <= 4 ? 'Chỉ có 4 món hoặc ít hơn có thể nấu' : 'Đổi sang các món khác từ kho hơn 700 món'}
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isReloadingWholeFridge || isWholeFridgeComputing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Đổi Món Khác</span>
                  <span className="sm:hidden">Đổi Món</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsWholeFridgeExpanded(prev => !prev)}
                className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
                title={isWholeFridgeExpanded ? 'Thu gọn' : 'Mở rộng'}
                aria-label={isWholeFridgeExpanded ? 'Thu gọn gợi ý nấu' : 'Mở rộng gợi ý nấu'}
                aria-expanded={isWholeFridgeExpanded}
              >
                {isWholeFridgeExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isWholeFridgeExpanded && (
            <>
              {isWholeFridgeComputing ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-500">
                  <div className="w-6 h-6 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold">Đang đối chiếu toàn bộ thực phẩm trong tủ lạnh...</span>
                </div>
              ) : wholeFridgeData.results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {wholeFridgeData.results.map((res, idx) => {
                    const categoryLabel = 
                      res.recipe.category === 'mon-man' ? 'Món Mặn' :
                      res.recipe.category === 'mon-canh' ? 'Món Canh' :
                      res.recipe.category === 'mon-rau' ? 'Món Rau' :
                      res.recipe.category === 'mon-chay' ? 'Món Chay' :
                      res.recipe.category === 'an-sang' ? 'Bữa Sáng' :
                      res.recipe.category === 'trang-mieng' ? 'Tráng Miệng' : 'Món Ngon';

                    const costVnd = res.recipe.estimatedCostVnd || Math.round((res.recipe.calories || 500) * 120);

                    return (
                      <div 
                        key={res.recipe.id + idx}
                        onClick={() => setPendingRecipeToConfirm(res.recipe)}
                        className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group border border-slate-200 dark:border-slate-800 select-none active:scale-[0.99]"
                        title={`Xem công thức: ${res.recipe.title}`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setPendingRecipeToConfirm(res.recipe);
                          }
                        }}
                      >
                        <SafeImage 
                          src={res.recipe.imageUrl} 
                          alt={res.recipe.title} 
                          dishTitle={res.recipe.title}
                          category={res.recipe.category}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* High-contrast gradient overlay to ensure text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />
                        
                        {/* Top Left: Category Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-950/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/10 shadow-xs">
                            {categoryLabel}
                          </span>
                        </div>

                        {/* Bottom Content: Title and Price / Calories */}
                        <div className="absolute bottom-3 left-3.5 right-3.5 text-white z-10 pointer-events-none">
                          <h4 className="text-sm sm:text-base font-extrabold leading-tight tracking-tight text-white drop-shadow-xs truncate">
                            {res.recipe.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-200 mt-0.5 font-semibold">
                            <span className="text-white font-black">{costVnd.toLocaleString('vi-VN')} đ</span>
                            <span>•</span>
                            <span>{res.recipe.calories} kcal</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                  Chưa tìm thấy công thức kết hợp trực tiếp. Hãy thử thêm nguyên liệu vào tủ lạnh!
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* FAST POPUP MODAL: Add Leftover / Ingredient to Fridge */}
      {isAddingOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          onClick={() => {
            setIsDropdownOpen(false);
            setIsAddingOpen(false);
          }}
        >
          <div
            ref={addFormRef}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-visible animate-fadeIn"
          >
            {/* Modal Header */}
            <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#1D4ED8] text-white font-bold flex items-center justify-center shadow-xs shrink-0">
                  <Plus className="w-4 h-4 stroke-[2.75]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
                    Thêm Vào Tủ Lạnh
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                    Tự động đánh dấu "Có sẵn" trong giỏ đi chợ
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsAddingOpen(false);
                }}
                aria-label="Đóng cửa sổ thêm thực phẩm"
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveItem} noValidate className="p-4 space-y-3">
              {/* 1-Tap Shelf Compartment Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Chọn ngăn tủ bảo quản
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { id: 'freezer', label: 'Ngăn Đá', icon: '❄️' },
                    { id: 'fridge', label: 'Ngăn Mát', icon: '🧊' },
                    { id: 'crisper', label: 'Rau Củ', icon: '🥬' }
                  ] as const).map(comp => {
                    const active = compartment === comp.id;
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => setCompartment(comp.id)}
                        className={`py-2 px-2 rounded-xl border text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
                          active
                            ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-2xs'
                            : 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                        }`}
                      >
                        <span>{comp.icon}</span>
                        <span>{comp.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Food Name Input + Autocomplete Suggestions */}
              <div className="space-y-1 relative" ref={dropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Tên món / Thực phẩm <span className="text-rose-500">*</span>
                  </label>
                  {nameError && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 animate-shake">
                      Bắt buộc
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  autoFocus
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (nameError) setNameError(null);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => {
                    if (name.trim()) setIsDropdownOpen(true);
                  }}
                  placeholder="VD: Thịt gà luộc thừa, Đậu phụ sống, Thịt bò..."
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all shadow-2xs ${
                    nameError
                      ? 'border-2 border-rose-500 dark:border-rose-400 ring-3 ring-rose-500/15 bg-rose-50/20 dark:bg-rose-950/20 text-slate-900 dark:text-slate-100'
                      : 'border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:bg-white'
                  }`}
                />

                {/* Dropdown Keyword Suggestions */}
                {isDropdownOpen && filteredSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden animate-fadeIn max-h-52 overflow-y-auto">
                    <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <span>💡</span>
                        <span>Gợi ý theo "{name.trim()}":</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(false)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer"
                      >
                        Đóng
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {filteredSuggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onMouseDown={e => {
                            e.preventDefault();
                            handleApplySuggestion(sug);
                          }}
                          className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-blue-50/60 dark:hover:bg-blue-950/30 transition-colors cursor-pointer group active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-1">
                            <span className="text-base shrink-0">{sug.icon || (sug.isLeftover ? '🍲' : '🥬')}</span>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block truncate group-hover:text-[#1D4ED8] dark:group-hover:text-blue-400 transition-colors">
                                {sug.name}
                              </span>
                              {sug.note && (
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                                  {sug.note}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {sug.qty}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {nameError && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-[11px] font-bold mt-1 animate-shake shadow-2xs">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{nameError}</span>
                  </div>
                )}
              </div>

              {/* Quantity & Category (2-Column Compact Row) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Số lượng ước lượng
                  </label>
                  <input
                    type="text"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    placeholder="VD: 300g, 1 tô, 2 quả..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Phân loại
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Expiry Slider & Savings (2-Column Compact Row) */}
              <div className="grid grid-cols-2 gap-2.5 items-end">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Hạn dùng:</span>
                    <span className={`font-black ${daysLeft <= 1 ? 'text-rose-600' : daysLeft <= 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {daysLeft} ngày
                    </span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    value={daysLeft}
                    onChange={e => setDaysLeft(parseInt(e.target.value, 10))}
                    className="w-full accent-[#1D4ED8] cursor-pointer h-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Tiết kiệm đi chợ (đ)
                  </label>
                  <input
                    type="number"
                    step={5000}
                    min={0}
                    value={discountVnd}
                    onChange={e => setDiscountVnd(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Leftover Checkbox & Optional Note */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isLeftover}
                  onChange={e => setIsLeftover(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1D4ED8] accent-[#1D4ED8] cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  🍲 Đây là thức ăn thừa bữa trước (ưu tiên nấu lại)
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsAddingOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Lưu Vào Tủ Lạnh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL-SHELF OVERFLOW POPUP MODAL (Opened when clicking the "•••" button) */}
      {isFullShelfModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          onClick={() => setIsFullShelfModalOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md h-[85vh] max-h-[85vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-fadeIn"
          >
            {/* Modal Header */}
            <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">
                  {activeCompartment === 'freezer' ? '❄️' : activeCompartment === 'fridge' ? '🧊' : activeCompartment === 'crisper' ? '🥬' : '🗄️'}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {activeCompartment === 'freezer'
                        ? 'Ngăn Đá Đông Lạnh'
                        : activeCompartment === 'fridge'
                        ? 'Ngăn Mát & Đồ Thừa'
                        : activeCompartment === 'crisper'
                        ? 'Ngăn Rau Củ Tươi'
                        : 'Toàn Bộ Tủ Lạnh'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-300 text-[10px] font-black shrink-0">
                      {displayedItems.length} món
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Chạm vào nguyên liệu để xem món gợi ý • Tự động trừ khi nấu xong
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (activeCompartment !== 'all') {
                      setCompartment(activeCompartment);
                    }
                    setIsFullShelfModalOpen(false);
                    setIsAddingOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 text-[#1D4ED8] dark:text-blue-400 text-[11px] font-black flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                  <span>Thêm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullShelfModalOpen(false)}
                  aria-label="Đóng danh sách"
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Compartment Switcher (2x2 Grid so every label is 100% readable) & Search Bar */}
            <div className="px-4 pt-3 pb-2.5 border-b border-slate-100 dark:border-slate-800 space-y-2 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="grid grid-cols-2 gap-1.5">
                {([
                  { id: 'all', label: 'Tất Cả', icon: '🗄️', count: compartmentCounts.all },
                  { id: 'freezer', label: 'Ngăn Đá', icon: '❄️', count: compartmentCounts.freezer },
                  { id: 'fridge', label: 'Ngăn Mát', icon: '🧊', count: compartmentCounts.fridge },
                  { id: 'crisper', label: 'Rau Củ', icon: '🥬', count: compartmentCounts.crisper }
                ] as const).map(tab => {
                  const active = activeCompartment === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveCompartment(tab.id);
                        setActiveSubFilter('all');
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-between gap-1.5 transition-all cursor-pointer active:scale-[0.98] ${
                        active
                          ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${active ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {tab.count} món
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm nhanh nguyên liệu trong ngăn..."
                  className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Full 2-Column Grid */}
            <div className="p-3.5 overflow-y-auto flex-1">
              {displayedItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {displayedItems.map(item => {
                    const isUrgent = item.daysLeft <= 2;
                    const isEmergency = item.daysLeft <= 1;
                    const isSelectedForRecipe = selectedItemForRecipe?.id === item.id;
                    const itemIcon = getPantryItemIcon(item);

                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSelectItemForRecipe(item)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectItemForRecipe(item);
                          }
                        }}
                        className={`relative p-2.5 rounded-2xl border text-left transition-all cursor-pointer select-none active:scale-[0.98] flex flex-col justify-between gap-1.5 ${
                          isSelectedForRecipe
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-[#1D4ED8] ring-1 ring-[#1D4ED8]/25 shadow-2xs'
                            : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:border-blue-300 hover:bg-white dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700 flex items-center justify-center text-sm shrink-0 shadow-2xs">
                            {itemIcon}
                          </div>

                          {isUrgent && (
                            <span
                              title={isEmergency ? 'Sắp hết hạn (Dùng ngay hôm nay)' : `Sắp hết hạn (Còn ${item.daysLeft} ngày)`}
                              className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                                isEmergency
                                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500 border-rose-200 dark:border-rose-800'
                                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {isEmergency ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 line-clamp-1 leading-snug">
                            {item.name}
                          </h4>
                          <div className="flex items-center justify-between gap-1 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">
                              {item.quantity}
                            </span>
                            {item.isLeftover && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] shrink-0" title="Đồ ăn thừa" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-xs font-bold text-slate-400">
                  Không có nguyên liệu nào phù hợp.
                </div>
              )}
            </div>

            {/* Bottom Action Dock inside Full-Shelf Popup */}
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between gap-2 shrink-0">
              {selectedItemForRecipe ? (
                <>
                  <div className="min-w-0 flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#1D4ED8] dark:text-blue-400 truncate">
                      {selectedItemForRecipe.name}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">
                      ({selectedItemForRecipe.quantity})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsItemSuggestionModalOpen(true)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white text-[10.5px] font-black flex items-center gap-1 transition-colors cursor-pointer active:scale-95"
                    >
                      <ChefHat className="w-3 h-3" />
                      <span>Xem món gợi ý</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        removePantryItem(selectedItemForRecipe.id);
                        setSelectedItemForRecipe(null);
                        setIsItemSuggestionModalOpen(false);
                      }}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 transition-colors cursor-pointer"
                      title="Xóa khỏi tủ lạnh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Chọn 1 món bất kỳ để xem gợi ý nấu • Tự động trừ khi nấu xong
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFullShelfModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-black transition-colors cursor-pointer shrink-0"
                  >
                    Đóng
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* POPUP MODAL: 3 Suggested Dishes for Selected Ingredient           */}
      {/* ================================================================= */}
      {isItemSuggestionModalOpen && selectedItemForRecipe && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsItemSuggestionModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2 bg-slate-50/70 dark:bg-slate-900 shrink-0">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                  <ChefHat className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                      Món Ngon Từ "{selectedItemForRecipe.name}"
                    </h3>
                    {singleItemTotalEligible > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-300 text-[10px] font-black shrink-0">
                        {singleItemTotalEligible} công thức
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                    Chọn món để xem cách chế biến • Tự động trừ khi nấu xong
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsItemSuggestionModalOpen(false)}
                aria-label="Đóng gợi ý món"
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Suggested Dish Cards Body */}
            <div className="p-3.5 overflow-y-auto flex-1 space-y-2.5">
              {isSingleItemComputing ? (
                <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-500">
                  <div className="w-6 h-6 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold">
                    Đang tìm 3 món ngon nhất từ {selectedItemForRecipe.name}...
                  </span>
                </div>
              ) : suggestedRecipes.length > 0 ? (
                <div className="space-y-2.5">
                  {suggestedRecipes.slice(0, 3).map((recipe, idx) => {
                    const titleLower = recipe.title.toLowerCase();
                    const hasMeatInTitle =
                      (!titleLower.includes('chay') && !titleLower.includes('nấm đùi gà')) &&
                      (/\b(gà|bò|heo|lợn|sườn|cá|tôm|mực|cua|vịt|thịt|xúc xích|lạp xưởng)\b/i.test(titleLower));
                    const categoryLabel =
                      recipe.category === 'mon-canh' ? 'Món Canh' :
                      recipe.category === 'an-sang' ? 'Bữa Sáng' :
                      recipe.category === 'trang-mieng' ? 'Tráng Miệng' :
                      hasMeatInTitle ? 'Món Mặn' :
                      recipe.category === 'mon-man' ? 'Món Mặn' :
                      recipe.category === 'mon-rau' ? 'Món Rau' :
                      recipe.category === 'mon-chay' ? 'Món Chay' : 'Món Ngon';

                    const costVnd = recipe.estimatedCostVnd || Math.round((recipe.calories || 500) * 120);
                    const synergyCount = singleItemData.synergyCounts?.[recipe.id] || 0;
                    const cleanDishTitle = recipe.title.replace(/^Mâm Cơm\s+[^:]+:\s*/i, '').trim();

                    return (
                      <div
                        key={recipe.id + idx}
                        role="button"
                        tabIndex={0}
                        onClick={() => setPendingRecipeToConfirm(recipe)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setPendingRecipeToConfirm(recipe);
                          }
                        }}
                        className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 hover:bg-blue-50/50 dark:bg-slate-800/50 dark:hover:bg-slate-800 hover:border-[#1D4ED8]/50 flex items-start gap-3 transition-all cursor-pointer group active:scale-[0.99]"
                      >
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                          <SafeImage
                            src={recipe.imageUrl}
                            alt={cleanDishTitle}
                            dishTitle={recipe.title}
                            category={recipe.category}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full sm:w-auto">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-300 text-[10px] font-black">
                              {categoryLabel}
                            </span>
                            {synergyCount > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black">
                                +{synergyCount} món sẵn trong tủ
                              </span>
                            )}
                          </div>
                        </div>

                          <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#1D4ED8] dark:group-hover:text-blue-400 transition-colors leading-snug">
                            {cleanDishTitle}
                          </h4>

                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-0.5">
                            <span className="text-slate-800 dark:text-slate-200 font-black">
                              {costVnd.toLocaleString('vi-VN')} đ
                            </span>
                            <span>•</span>
                            <span>{recipe.calories} kcal</span>
                            {recipe.prepTimeMinutes && (
                              <>
                                <span>•</span>
                                <span>{recipe.prepTimeMinutes} phút</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  Chưa có công thức trực tiếp tương thích. Bạn có thể dùng nguyên liệu này để chiên, xào, nấu canh hoặc làm món phụ!
                </div>
              )}
            </div>

            {/* Modal Footer: Suggest Another 3 Dishes Button */}
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={handleReloadItemSuggestions}
                disabled={singleItemTotalEligible <= 3 || isSingleItemComputing}
                className="flex-1 py-2.5 px-3.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title={singleItemTotalEligible <= 3 ? 'Chỉ có tối đa 3 món phù hợp với nguyên liệu này' : 'Đổi sang 3 món gợi ý khác'}
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isReloadingItem ? 'animate-spin' : ''}`} />
                <span>Gợi ý 3 món khác</span>
              </button>

              <button
                type="button"
                onClick={() => setIsItemSuggestionModalOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black transition-colors cursor-pointer shrink-0"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* CONFIRMATION FORM MODAL: Prevent Accidental Misclick on Dish Card */}
      {/* ================================================================= */}
      {pendingRecipeToConfirm && (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn"
          onClick={() => setPendingRecipeToConfirm(null)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-900">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center shadow-xs shrink-0">
                  <ChefHat className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  Xác Nhận Xem Món Nấu
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setPendingRecipeToConfirm(null)}
                aria-label="Đóng xác nhận"
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                Bạn có muốn mở hướng dẫn chế biến chi tiết cho món ăn này không?
              </p>

              {/* Dish Summary Card */}
              <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-start gap-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                  <SafeImage
                    src={pendingRecipeToConfirm.imageUrl}
                    alt={pendingRecipeToConfirm.title}
                    dishTitle={pendingRecipeToConfirm.title}
                    category={pendingRecipeToConfirm.category}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-300 text-[10px] font-black">
                    {pendingRecipeToConfirm.category === 'mon-canh' ? 'Món Canh' :
                     pendingRecipeToConfirm.category === 'an-sang' ? 'Bữa Sáng' :
                     pendingRecipeToConfirm.category === 'trang-mieng' ? 'Tráng Miệng' :
                     pendingRecipeToConfirm.category === 'mon-rau' ? 'Món Rau' :
                     pendingRecipeToConfirm.category === 'mon-chay' ? 'Món Chay' : 'Món Mặn'}
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug">
                    {pendingRecipeToConfirm.title.replace(/^Mâm Cơm\s+[^:]+:\s*/i, '').trim()}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span className="text-slate-800 dark:text-slate-200 font-black">
                      {(pendingRecipeToConfirm.estimatedCostVnd || Math.round((pendingRecipeToConfirm.calories || 500) * 120)).toLocaleString('vi-VN')} đ
                    </span>
                    <span>•</span>
                    <span>{pendingRecipeToConfirm.calories} kcal</span>
                    {pendingRecipeToConfirm.prepTimeMinutes && (
                      <>
                        <span>•</span>
                        <span>{pendingRecipeToConfirm.prepTimeMinutes} phút</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {selectedItemForRecipe && (
                <div className="px-3 py-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center gap-2 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Sử dụng nguyên liệu <strong>"{selectedItemForRecipe.name}"</strong> trong tủ (chỉ tự động trừ khi bạn nấu xong bước cuối).
                  </span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPendingRecipeToConfirm(null)}
                className="flex-1 py-2.5 px-3.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black transition-colors cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = pendingRecipeToConfirm;
                  setPendingRecipeToConfirm(null);
                  setIsItemSuggestionModalOpen(false);
                  setIsFullShelfModalOpen(false);
                  setSelectedRecipe(target);
                }}
                className="flex-1 py-2.5 px-3.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Xác nhận xem món</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


