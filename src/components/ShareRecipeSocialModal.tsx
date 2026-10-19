import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  ChefHat,
  Clock,
  Flame,
  Sparkles,
  Volume2,
  QrCode,
  Users,
  Sun,
  Moon
} from 'lucide-react';
import { Recipe } from '../types';
import { useMealWise } from '../context/MealWiseContext';
import { SafeImage } from './SafeImage';

export function buildSharedDishUrl(recipe: Recipe, chefNameOverride?: string): string {
  try {
    const compactPayload = {
      t: recipe.title,
      c: recipe.category,
      r: recipe.region || 'toan-quoc',
      m: recipe.cookTimeMinutes || 25,
      v: recipe.estimatedCostVnd || 65000,
      k: recipe.calories || 450,
      a: chefNameOverride || recipe.authorName || '',
      n: recipe.authorNote || '',
      p: recipe.chefTip || recipe.instructions?.[0]?.content || '',
      i: (recipe.ingredients || []).map(ing => ({
        n: ing.name,
        a: ing.amount,
        u: ing.unit,
        c: ing.category
      })),
      img: recipe.imageUrl && !recipe.imageUrl.startsWith('data:') ? recipe.imageUrl : ''
    };
    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(compactPayload)))));
    const origin = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://mealwise.vn/';
    return `${origin}?sharedDish=${encoded}`;
  } catch {
    return typeof window !== 'undefined' ? window.location.href : 'https://mealwise.vn/';
  }
}

export function buildSocialPostCaption(recipe: Recipe, chefName: string, shareUrl: string): string {
  const ingLines = (recipe.ingredients || [])
    .slice(0, 8)
    .map(ing => `• ${ing.name}: ${ing.amount} ${ing.unit}`)
    .join('\n');
  const tipText = recipe.chefTip || recipe.instructions?.map(s => s.content).join('\n') || 'Nấu theo khẩu vị gia đình.';
  const noteLine = recipe.authorNote ? `\n💬 Tâm sự bếp nhà: "${recipe.authorNote}"` : '';
  const voiceLine = recipe.authorVoiceUrl ? `\n🎙️ Có đính kèm bản ghi âm lời dặn của người nấu` : '';

  return [
    `👨‍🍳 GÓC BẾP ĐẦU BẾP: ${recipe.title.toUpperCase()}`,
    `✍️ Sáng tạo bởi: Đầu bếp ${chefName} • Cộng Đồng Đầu Bếp Mealy`,
    `⏱️ ${recipe.cookTimeMinutes || 25} phút • 💰 ${(recipe.estimatedCostVnd || 65000).toLocaleString('vi-VN')}đ • 🔥 ${recipe.calories || 450} kcal${noteLine}${voiceLine}`,
    ``,
    `🛒 Nguyên liệu chuẩn bị:`,
    ingLines || '• Nguyên liệu tươi ngon theo mùa',
    ``,
    `✨ Bí quyết để món ngon tròn vị:`,
    tipText,
    ``,
    `📲 Lưu ngay công thức này vào Sổ Bếp Mealy của bạn tại đây:`,
    shareUrl,
    ``,
    `#Mealy #CongDongDauBep #YeuBep #MamComViet #SoBepGiaDinh`
  ].join('\n');
}

// Deterministic visual QR matrix generator (21x21 Version-1 layout) from URL string
function generateDeterministicQrMatrix(data: string): boolean[][] {
  const size = 21;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const placeFinder = (rowOffset: number, colOffset: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = rowOffset + r;
        const cc = colOffset + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        reserved[rr][cc] = true;
        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[rr][cc] = isBorder || isCenter;
        }
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  let hash = 2166136261;
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (reserved[r][c]) continue;
      if (r === 6 || c === 6) {
        matrix[r][c] = (r + c) % 2 === 0;
        continue;
      }
      hash ^= (r * 31 + c * 17) & 0xff;
      hash = Math.imul(hash, 16777619);
      matrix[r][c] = (Math.abs(hash) % 10) < 5;
    }
  }
  return matrix;
}

export const ShareRecipeSocialModal: React.FC = () => {
  const { user, showToast } = useMealWise();
  const [targetRecipe, setTargetRecipe] = useState<Recipe | null>(null);
  const [chefName, setChefName] = useState<string>('');
  const [cardTheme, setCardTheme] = useState<'editorial-light' | 'studio-dark'>('editorial-light');
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);

  useEffect(() => {
    const handleOpenShareModal = (e: Event) => {
      const customEv = e as CustomEvent<Recipe>;
      if (customEv.detail) {
        const r = customEv.detail;
        setTargetRecipe(r);
        setChefName(r.authorName || user?.name || 'Đầu Bếp Tại Gia');
        setCopiedCaption(false);
      }
    };
    window.addEventListener('mealwise:open-share-recipe', handleOpenShareModal);
    return () => {
      window.removeEventListener('mealwise:open-share-recipe', handleOpenShareModal);
    };
  }, [user?.name]);

  if (!targetRecipe) return null;

  const displayChefName = chefName.trim() || 'Đầu Bếp Tại Gia';
  const shareUrl = buildSharedDishUrl(targetRecipe, displayChefName);
  const socialCaption = buildSocialPostCaption(targetRecipe, displayChefName, shareUrl);
  const qrMatrix = generateDeterministicQrMatrix(shareUrl);

  const regionLabel =
    targetRecipe.region === 'bac'
      ? 'Vị Bắc'
      : targetRecipe.region === 'trung'
      ? 'Vị Trung'
      : targetRecipe.region === 'nam'
      ? 'Vị Nam'
      : 'Toàn Quốc';

  const categoryLabel =
    targetRecipe.category === 'mon-man'
      ? 'Món Mặn'
      : targetRecipe.category === 'mon-canh'
      ? 'Món Canh'
      : targetRecipe.category === 'mon-rau'
      ? 'Món Rau'
      : targetRecipe.category === 'mon-chay'
      ? 'Món Chay'
      : targetRecipe.category === 'an-sang'
      ? 'Ăn Sáng'
      : 'Tráng Miệng';

  const tipSnippet =
    targetRecipe.chefTip ||
    targetRecipe.instructions?.[1]?.content ||
    targetRecipe.instructions?.[0]?.content ||
    'Canh lửa vừa và nêm nếm đậm đà chuẩn vị cơm nhà.';

  const handleCopySocialPost = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(socialCaption);
      }
      setCopiedCaption(true);
      showToast(`📋 Đã sao chép bài đăng & link công thức "${targetRecipe.title}"!`, 'success');
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch {
      showToast('⚠️ Không thể sao chép tự động, vui lòng thử lại.', 'warning');
    }
  };

  // High-resolution HTML5 Canvas social card renderer (1080 x 1350 portrait for Facebook / IG / TikTok)
  const renderCardToCanvasBlob = async (): Promise<Blob | null> => {
    const canvas = document.createElement('canvas');
    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const isDark = cardTheme === 'studio-dark';

    // 1. Background Fill
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    if (isDark) {
      bgGrad.addColorStop(0, '#0F172A');
      bgGrad.addColorStop(1, '#1E293B');
    } else {
      bgGrad.addColorStop(0, '#F8FAFC');
      bgGrad.addColorStop(1, '#EFF6FF');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Outer Card Frame
    const pad = 48;
    const cardW = W - pad * 2;
    const cardH = H - pad * 2;
    ctx.fillStyle = isDark ? '#1E293B' : '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(pad, pad, cardW, cardH, 40);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = isDark ? '#334155' : '#E2E8F0';
    ctx.stroke();

    // 2. Top Chef Community Header Bar
    ctx.fillStyle = '#1D4ED8';
    ctx.beginPath();
    ctx.roundRect(pad + 36, pad + 34, 68, 68, 20);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 32px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👨‍🍳', pad + 70, pad + 80);

    ctx.textAlign = 'left';
    ctx.fillStyle = isDark ? '#93C5FD' : '#1D4ED8';
    ctx.font = '800 20px Inter, sans-serif';
    ctx.fillText('CỘNG ĐỒNG ĐẦU BẾP MEALWISE', pad + 124, pad + 62);

    ctx.fillStyle = isDark ? '#FFFFFF' : '#0F172A';
    ctx.font = '900 30px Inter, sans-serif';
    ctx.fillText(`Đầu bếp: ${displayChefName}`, pad + 124, pad + 98);

    // Category + Region Pill on Top Right
    const pillText = `${categoryLabel} • ${regionLabel}`;
    ctx.font = '800 22px Inter, sans-serif';
    const pillW = ctx.measureText(pillText).width + 44;
    ctx.fillStyle = isDark ? '#334155' : '#EFF6FF';
    ctx.beginPath();
    ctx.roundRect(W - pad - 36 - pillW, pad + 44, pillW, 48, 24);
    ctx.fill();
    ctx.fillStyle = isDark ? '#E2E8F0' : '#1D4ED8';
    ctx.fillText(pillText, W - pad - 36 - pillW + 22, pad + 76);

    // 3. Dish Hero Image (or stylized culinary cover if cross-origin blocked)
    const imgX = pad + 36;
    const imgY = pad + 130;
    const imgW = cardW - 72;
    const imgH = 440;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(imgX, imgY, imgW, imgH, 28);
    ctx.clip();

    let imageDrawn = false;
    if (targetRecipe.imageUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = targetRecipe.imageUrl;
        });
        const scale = Math.max(imgW / img.width, imgH / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        ctx.drawImage(img, imgX + (imgW - drawW) / 2, imgY + (imgH - drawH) / 2, drawW, drawH);
        imageDrawn = true;
      } catch {
        imageDrawn = false;
      }
    }

    if (!imageDrawn) {
      const fallbackGrad = ctx.createLinearGradient(imgX, imgY, imgX + imgW, imgY + imgH);
      fallbackGrad.addColorStop(0, '#1D4ED8');
      fallbackGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = fallbackGrad;
      ctx.fillRect(imgX, imgY, imgW, imgH);
    }

    // Bottom gradient overlay on hero image
    const overlayGrad = ctx.createLinearGradient(0, imgY + imgH * 0.35, 0, imgY + imgH);
    overlayGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
    overlayGrad.addColorStop(1, 'rgba(15, 23, 42, 0.88)');
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(imgX, imgY, imgW, imgH);

    // Dish Title on Image
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 44px Inter, sans-serif';
    ctx.fillText(targetRecipe.title.slice(0, 38), imgX + 32, imgY + imgH - 76);

    // Metadata strip on Image
    ctx.fillStyle = '#FCD34D';
    ctx.font = '800 24px Inter, sans-serif';
    const metaStr = `⏱️ ${targetRecipe.cookTimeMinutes || 25} phút   •   💰 ${(targetRecipe.estimatedCostVnd || 65000).toLocaleString('vi-VN')}đ   •   🔥 ${targetRecipe.calories || 450} kcal`;
    ctx.fillText(metaStr, imgX + 32, imgY + imgH - 32);
    ctx.restore();

    let cursorY = imgY + imgH + 42;

    // 4. Chef Quote / Story Box
    if (targetRecipe.authorNote || targetRecipe.authorVoiceUrl) {
      ctx.fillStyle = isDark ? 'rgba(245, 158, 11, 0.14)' : '#FFFBEB';
      ctx.beginPath();
      ctx.roundRect(imgX, cursorY, imgW, 96, 22);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isDark ? 'rgba(245, 158, 11, 0.4)' : '#FDE68A';
      ctx.stroke();

      ctx.fillStyle = isDark ? '#FCD34D' : '#B45309';
      ctx.font = '800 21px Inter, sans-serif';
      const voiceBadge = targetRecipe.authorVoiceUrl ? ' (🎙️ Có lời dặn ghi âm)' : '';
      ctx.fillText(`💌 LỜI NHẮN TỪ ĐẦU BẾP${voiceBadge}`, imgX + 24, cursorY + 36);

      ctx.fillStyle = isDark ? '#F8FAFC' : '#1E293B';
      ctx.font = '700 24px Inter, sans-serif';
      const noteText = `"${(targetRecipe.authorNote || 'Nấu bằng cả tấm lòng dành tặng người thương.').slice(0, 68)}"`;
      ctx.fillText(noteText, imgX + 24, cursorY + 74);

      cursorY += 124;
    }

    // 5. Ingredients Section
    ctx.fillStyle = isDark ? '#94A3B8' : '#475569';
    ctx.font = '800 21px Inter, sans-serif';
    ctx.fillText(`🛒 NGUYÊN LIỆU CHÍNH (${(targetRecipe.ingredients || []).length} MÓN)`, imgX, cursorY);
    cursorY += 20;

    const topIngredients = (targetRecipe.ingredients || []).slice(0, 6);
    const colW = (imgW - 20) / 2;
    topIngredients.forEach((ing, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const boxX = imgX + col * (colW + 20);
      const boxY = cursorY + row * 58;

      ctx.fillStyle = isDark ? '#0F172A' : '#F8FAFC';
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, colW, 46, 14);
      ctx.fill();

      ctx.fillStyle = isDark ? '#E2E8F0' : '#0F172A';
      ctx.font = '700 21px Inter, sans-serif';
      ctx.fillText(`• ${ing.name.slice(0, 20)}`, boxX + 16, boxY + 30);

      ctx.textAlign = 'right';
      ctx.fillStyle = isDark ? '#60A5FA' : '#1D4ED8';
      ctx.font = '800 20px Inter, sans-serif';
      ctx.fillText(`${ing.amount} ${ing.unit}`, boxX + colW - 16, boxY + 30);
      ctx.textAlign = 'left';
    });

    cursorY += Math.max(1, Math.ceil(topIngredients.length / 2)) * 58 + 26;

    // 6. Chef Secret Tip Box
    ctx.fillStyle = isDark ? '#0F172A' : '#EFF6FF';
    ctx.beginPath();
    ctx.roundRect(imgX, cursorY, imgW, 130, 22);
    ctx.fill();

    ctx.fillStyle = isDark ? '#60A5FA' : '#1D4ED8';
    ctx.font = '800 21px Inter, sans-serif';
    ctx.fillText('✨ BÍ QUYẾT NẤU NGON CỦA ĐẦU BẾP', imgX + 24, cursorY + 36);

    ctx.fillStyle = isDark ? '#E2E8F0' : '#1E293B';
    ctx.font = '600 22px Inter, sans-serif';
    const line1 = tipSnippet.slice(0, 66);
    const line2 = tipSnippet.slice(66, 132);
    ctx.fillText(line1, imgX + 24, cursorY + 74);
    if (line2) {
      ctx.fillText(line2 + (tipSnippet.length > 132 ? '...' : ''), imgX + 24, cursorY + 106);
    }

    // 7. Bottom Footer with QR Code
    const footerY = H - pad - 150;
    ctx.strokeStyle = isDark ? '#334155' : '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(imgX, footerY - 16);
    ctx.lineTo(imgX + imgW, footerY - 16);
    ctx.stroke();

    ctx.fillStyle = isDark ? '#FFFFFF' : '#0F172A';
    ctx.font = '900 26px Inter, sans-serif';
    ctx.fillText('Mealy — Mâm Cơm Việt & Sổ Bếp Cộng Đồng', imgX, footerY + 34);

    ctx.fillStyle = isDark ? '#94A3B8' : '#64748B';
    ctx.font = '600 21px Inter, sans-serif';
    ctx.fillText('Quét mã QR hoặc truy cập link bài đăng để lưu công thức vào máy', imgX, footerY + 72);

    ctx.fillStyle = '#1D4ED8';
    ctx.font = '800 20px Inter, sans-serif';
    ctx.fillText('#Mealy   #CongDongDauBep   #YeuBep   #MamComViet', imgX, footerY + 108);

    // Draw QR Matrix on Bottom Right
    const qrBoxSize = 116;
    const qrX = imgX + imgW - qrBoxSize;
    const qrY = footerY + 4;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(qrX, qrY, qrBoxSize, qrBoxSize, 16);
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.stroke();

    const cell = (qrBoxSize - 16) / 21;
    ctx.fillStyle = '#0F172A';
    for (let r = 0; r < 21; r++) {
      for (let c = 0; c < 21; c++) {
        if (qrMatrix[r][c]) {
          ctx.fillRect(qrX + 8 + c * cell, qrY + 8 + r * cell, Math.ceil(cell), Math.ceil(cell));
        }
      }
    }

    return new Promise<Blob | null>(resolve => {
      canvas.toBlob(blob => resolve(blob), 'image/png', 0.95);
    });
  };

  const handleDownloadCardImage = async () => {
    setIsExportingImage(true);
    try {
      const blob = await renderCardToCanvasBlob();
      if (!blob) {
        showToast('⚠️ Không thể tạo ảnh thẻ công thức lúc này.', 'warning');
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const cleanSlug = targetRecipe.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      link.href = url;
      link.download = `mealwise-cong-thuc-${cleanSlug || 'bep-nha'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      showToast(`📸 Đã tải ảnh Thẻ Công Thức "${targetRecipe.title}"! Sẵn sàng đăng lên Facebook / Story / TikTok!`, 'success');
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleNativeSocialShare = async () => {
    setIsExportingImage(true);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(socialCaption);
      }
      const blob = await renderCardToCanvasBlob();
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
          const shareData: ShareData = {
            title: `Công thức Đầu Bếp ${displayChefName}: ${targetRecipe.title}`,
            text: socialCaption,
            url: shareUrl
          };
          if (blob && typeof File !== 'undefined') {
            const file = new File([blob], 'mealwise-chef-card.png', { type: 'image/png' });
            if ((navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
              shareData.files = [file];
            }
          }
          await navigator.share(shareData);
          showToast(`📤 Đã chia sẻ món "${targetRecipe.title}" lên mạng xã hội!`, 'success');
          return;
        } catch {
          // Fallback to copied caption + toast
        }
      }
      setCopiedCaption(true);
      showToast(`📋 Đã sao chép bài đăng & link chia sẻ "${targetRecipe.title}"! Bạn có thể dán ngay lên Facebook, Zalo hoặc Threads!`, 'success');
    } finally {
      setIsExportingImage(false);
    }
  };

  const isDarkCard = cardTheme === 'studio-dark';

  return (
    <div
      className="fixed inset-0 z-[220] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
      onClick={() => setTargetRecipe(null)}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-slide-up"
      >
        {/* Top Modal Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                Chia Sẻ Lên Cộng Đồng Đầu Bếp
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Tạo thẻ công thức đăng Facebook, Instagram, TikTok & Zalo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTargetRecipe(null)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Customization Strip: Chef Name + Card Theme Switcher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Nghệ danh / Tên Đầu Bếp trên thẻ
              </label>
              <input
                type="text"
                value={chefName}
                onChange={e => setChefName(e.target.value)}
                placeholder="VD: Bếp Của Mẹ, Chef Hoàng..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Giao diện Thẻ Công Thức
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCardTheme('editorial-light')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    cardTheme === 'editorial-light'
                      ? 'bg-white text-[#1D4ED8] shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sun className="w-3 h-3" />
                  <span>Tạp Chí Sáng</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCardTheme('studio-dark')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    cardTheme === 'studio-dark'
                      ? 'bg-slate-900 text-amber-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Moon className="w-3 h-3" />
                  <span>Studio Đêm</span>
                </button>
              </div>
            </div>
          </div>

          {/* LIVE VISUAL PREVIEW OF THE SOCIAL CHEF CARD */}
          <div
            className={`rounded-3xl p-4 border shadow-lg transition-colors duration-200 space-y-3 ${
              isDarkCard
                ? 'bg-slate-950 border-slate-800 text-white'
                : 'bg-gradient-to-b from-white to-blue-50/40 border-slate-200 text-slate-900'
            }`}
          >
            {/* Card Header: Chef Attribution + Community Badge */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center shadow-xs shrink-0">
                  <ChefHat className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                    Cộng Đồng Đầu Bếp Mealy
                  </span>
                  <h3 className={`text-xs font-black truncate ${isDarkCard ? 'text-white' : 'text-slate-900'}`}>
                    Đầu bếp: {displayChefName}
                  </h3>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 border ${
                  isDarkCard
                    ? 'bg-slate-900 text-slate-200 border-slate-700'
                    : 'bg-blue-50 text-[#1D4ED8] border-blue-200/70'
                }`}
              >
                {categoryLabel} • {regionLabel}
              </span>
            </div>

            {/* Hero Dish Photo */}
            <div className="relative h-44 rounded-2xl overflow-hidden border border-black/5">
              <SafeImage
                src={targetRecipe.imageUrl}
                alt={targetRecipe.title}
                category={targetRecipe.category}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />

              {targetRecipe.authorVoiceUrl && (
                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-xs">
                  <Volume2 className="w-3 h-3" />
                  <span>Có lời dặn ghi âm</span>
                </div>
              )}

              <div className="absolute bottom-2.5 left-3 right-3 text-white">
                <h4 className="text-base font-black leading-tight drop-shadow-xs truncate">
                  {targetRecipe.title}
                </h4>
                <div className="flex items-center gap-3 text-[11px] font-bold text-amber-300 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {targetRecipe.cookTimeMinutes || 25} phút
                  </span>
                  <span>•</span>
                  <span>💰 {(targetRecipe.estimatedCostVnd || 65000).toLocaleString('vi-VN')}đ</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {targetRecipe.calories || 450} kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Chef Quote / Story */}
            {(targetRecipe.authorNote || targetRecipe.authorVoiceUrl) && (
              <div
                className={`p-2.5 rounded-2xl border text-xs ${
                  isDarkCard
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    : 'bg-amber-50/90 border-amber-200/80 text-amber-950'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  💌 Tâm sự từ gian bếp
                </span>
                <p className="font-semibold italic mt-0.5 line-clamp-2">
                  &ldquo;{targetRecipe.authorNote || 'Món ngon tâm huyết chia sẻ cùng cộng đồng yêu bếp.'}&rdquo;
                </p>
              </div>
            )}

            {/* Ingredients Preview Pills */}
            <div>
              <span
                className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${
                  isDarkCard ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                🛒 Nguyên liệu ({targetRecipe.ingredients?.length || 0} món)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(targetRecipe.ingredients || []).slice(0, 6).map((ing, idx) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                      isDarkCard
                        ? 'bg-slate-900 border-slate-800 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    {ing.name}: <strong className="text-blue-600 dark:text-blue-400">{ing.amount} {ing.unit}</strong>
                  </span>
                ))}
                {(targetRecipe.ingredients?.length || 0) > 6 && (
                  <span className="px-2 py-1 rounded-xl text-[10px] font-bold text-slate-500">
                    +{(targetRecipe.ingredients?.length || 0) - 6} nguyên liệu khác
                  </span>
                )}
              </div>
            </div>

            {/* Secret Tip Box */}
            <div
              className={`p-2.5 rounded-2xl border text-xs ${
                isDarkCard
                  ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                  : 'bg-blue-50/70 border-blue-200/60 text-slate-800'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1D4ED8] dark:text-blue-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Bí quyết của Đầu bếp {displayChefName}
              </span>
              <p className="text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                {tipSnippet}
              </p>
            </div>

            {/* Bottom Community QR Footer */}
            <div
              className={`pt-2.5 border-t flex items-center justify-between gap-3 ${
                isDarkCard ? 'border-slate-800' : 'border-slate-200/80'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-blue-400 shrink-0" />
                  <span className="text-xs font-black truncate">
                    Mealy — Sổ Bếp Cộng Đồng
                  </span>
                </div>
                <p className={`text-[10.5px] mt-0.5 ${isDarkCard ? 'text-slate-400' : 'text-slate-500'}`}>
                  Quét mã QR hoặc bấm link để lưu công thức vào máy
                </p>
                <p className="text-[10px] font-extrabold text-[#1D4ED8] dark:text-blue-400 mt-0.5">
                  #Mealy #CongDongDauBep #YeuBep
                </p>
              </div>

              <div className="p-1.5 rounded-xl bg-white border border-slate-200 shrink-0 shadow-2xs flex items-center justify-center">
                <QrCode className="w-10 h-10 text-slate-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Social Action Bar */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 space-y-2 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isExportingImage}
              onClick={handleDownloadCardImage}
              className="py-2.5 px-3 rounded-2xl bg-[#1D4ED8] hover:bg-blue-800 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>{isExportingImage ? 'Đang Tạo Ảnh...' : 'Tải Ảnh Đăng Mạng'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopySocialPost}
              className="py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-black text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              {copiedCaption ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-600 dark:text-emerald-400">Đã Sao Chép Bài!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 shrink-0 text-[#1D4ED8] dark:text-blue-400" />
                  <span>Chép Bài & Link</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            disabled={isExportingImage}
            onClick={handleNativeSocialShare}
            className="w-full py-2.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>Chia Sẻ Nhanh Lên Facebook / Zalo / Story</span>
          </button>
        </div>
      </div>
    </div>
  );
};
