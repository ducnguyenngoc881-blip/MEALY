import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { ApexCaseTier, ApexLootDrop, FastMealPreferenceMode } from '../types';
import { APEX_TIERS, PREFERENCE_MODES, generateApexLootDrop, formatZaloOfficeInvite } from '../data/fastMealData';
import { 
  playServoClick, 
  playChargingHum, 
  playUnlatchSnap, 
  playRarityFanfare,
  playHeavyImpact,
  playCardFlip,
  playSparkleChime,
  playSpeedWhoosh,
  playDareStinger,
  setApexMuted,
  getApexMuted
} from '../utils/audioSynth';
import { 
  Sparkles, 
  RotateCcw, 
  Share2, 
  Check, 
  Volume2, 
  VolumeX, 
  Zap, 
  Flame, 
  Utensils, 
  Coffee, 
  X,
  FastForward,
  Package,
  Timer,
  Moon,
  Skull,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Trophy,
  Search,
  Trash2,
  UtensilsCrossed
} from 'lucide-react';
import { SafeImage } from './SafeImage';
import { 
  getModeCollectionStats, 
  getAllUnlockedDishes, 
  resetAccountCaseCollection 
} from '../utils/caseDeduplication';

interface FastMealApexModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
  isStar?: boolean;
}

export const FastMealApexModal: React.FC<FastMealApexModalProps> = ({ isOpen, onClose }) => {
  const { weeklyPlan, addRecipeToSlot, showToast, openConfirmModal, openMinigameHub } = useMealWise();
  
  const handleBackToMinigames = () => {
    onClose();
    openMinigameHub();
  };
  
  const [selectedTier, setSelectedTier] = useState<ApexCaseTier>('purple');
  const [selectedMode, setSelectedMode] = useState<FastMealPreferenceMode>('express-1dish');
  const [modalScreen, setModalScreen] = useState<'preference' | 'opener'>('preference');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [openingState, setOpeningState] = useState<'idle' | 'charging' | 'blasting' | 'revealing' | 'revealed'>('idle');
  const [revealedCards, setRevealedCards] = useState<number>(0);
  const [lootDrop, setLootDrop] = useState<ApexLootDrop | null>(null);
  const [copiedZalo, setCopiedZalo] = useState(false);
  const [isMuted, setIsMutedState] = useState(getApexMuted());
  const [equippedToday, setEquippedToday] = useState(false);
  const [dailyStreak, setDailyStreak] = useState(3);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState<'all' | FastMealPreferenceMode>('all');
  const [gallerySearch, setGallerySearch] = useState('');
  const [collectionStats, setCollectionStats] = useState(() => getModeCollectionStats(selectedMode));

  // Refresh collection stats whenever selectedMode changes or when drop arrives
  useEffect(() => {
    setCollectionStats(getModeCollectionStats(selectedMode));
  }, [selectedMode, lootDrop, isOpen]);

  // Reset to preference screen whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setModalScreen('preference');
      setIsTransitioning(false);
      setOpeningState('idle');
      setRevealedCards(0);
      setLootDrop(null);
      setEquippedToday(false);
      setCopiedZalo(false);
      setIsGalleryOpen(false);
    }
  }, [isOpen]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Cleanup all timers on unmount or reset
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimeouts();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [clearAllTimeouts]);

  // Sync mute toggle with audio synth
  const toggleMute = () => {
    const next = !isMuted;
    setIsMutedState(next);
    setApexMuted(next);
  };

  // Canvas particle fireworks trigger customized for each mode & tier
  const spawnParticles = useCallback((count = 70, tier: ApexCaseTier = 'purple', mode: FastMealPreferenceMode = 'combo') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height * 0.45;

    let colors: string[];
    if (mode === 'bizarre-dare') {
      colors = ['#ec4899', '#f43f5e', '#a855f7', '#22c55e', '#facc15', '#ffffff'];
    } else if (mode === 'express-1dish') {
      colors = ['#06b6d4', '#38bdf8', '#00d4ff', '#ffffff', '#67e8f9', '#fde047'];
    } else if (mode === 'snack-genz') {
      colors = ['#f97316', '#fbbf24', '#f59e0b', '#fdba74', '#ffffff', '#fed7aa'];
    } else {
      colors = tier === 'gold' 
        ? ['#fbbf24', '#f59e0b', '#d97706', '#fef08a', '#ffffff', '#ffd700']
        : tier === 'purple'
        ? ['#c084fc', '#a855f7', '#7e22ce', '#e9d5ff', '#ffffff', '#38bdf8']
        : ['#38bdf8', '#0284c7', '#00d4ff', '#bae6fd', '#ffffff', '#a7f3d0'];
    }

    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 9 + 4;
      newParticles.push({
        x: centerX + (Math.random() - 0.5) * 40,
        y: centerY + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 4,
        size: Math.random() * 6 + 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.018 + 0.01,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        isStar: Math.random() > 0.65
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];

    if (!animationFrameRef.current) {
      const renderParticles = () => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particlesRef.current.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.22; // gravity
          p.vx *= 0.97;
          p.alpha -= p.decay;
          p.rotation += p.vRot;

          if (p.alpha > 0) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            if (p.isStar) {
              ctx.beginPath();
              for (let s = 0; s < 4; s++) {
                ctx.rotate(Math.PI / 2);
                ctx.lineTo(p.size * 1.5, 0);
                ctx.lineTo(p.size * 0.4, p.size * 0.4);
              }
              ctx.closePath();
              ctx.fill();
            } else {
              ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }
            ctx.restore();
          }
        });

        particlesRef.current = particlesRef.current.filter(p => p.alpha > 0);

        if (particlesRef.current.length > 0) {
          animationFrameRef.current = requestAnimationFrame(renderParticles);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          animationFrameRef.current = null;
        }
      };
      animationFrameRef.current = requestAnimationFrame(renderParticles);
    }
  }, []);

  // Switch Tier
  const handleSelectTier = (tier: ApexCaseTier) => {
    if (openingState === 'charging' || openingState === 'blasting' || openingState === 'revealing') return;
    setSelectedTier(tier);
    playServoClick();
    if (openingState === 'revealed') {
      clearAllTimeouts();
      setOpeningState('idle');
      setRevealedCards(0);
      setLootDrop(null);
    }
  };

  // Pick a Preference Mode on Screen 1 (highlights card without leaving screen)
  const handlePickPreference = (mode: FastMealPreferenceMode) => {
    if (isTransitioning) return;
    setSelectedMode(mode);
    playServoClick();
  };

  // Confirm Preference & Launch Sci-Fi Transition Animation
  const handleConfirmPreference = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    playSpeedWhoosh();
    playSparkleChime();
    spawnParticles(85, selectedTier, selectedMode);

    const timer = setTimeout(() => {
      setIsTransitioning(false);
      clearAllTimeouts();
      setOpeningState('idle');
      setRevealedCards(0);
      setLootDrop(null);
      setModalScreen('opener');
      playUnlatchSnap();
    }, 1050);

    timeoutsRef.current.push(timer);
  };

  // Back to Preference Selection Screen
  const handleBackToPreferences = () => {
    if (openingState === 'charging' || openingState === 'blasting' || openingState === 'revealing' || isTransitioning) return;
    playServoClick();
    clearAllTimeouts();
    setOpeningState('idle');
    setRevealedCards(0);
    setLootDrop(null);
    setModalScreen('preference');
  };

  // Skip animation directly to revealed
  const handleSkipAnimation = () => {
    if (openingState === 'idle' || openingState === 'revealed') return;
    clearAllTimeouts();
    let drop = lootDrop;
    if (!drop) {
      drop = generateApexLootDrop(selectedTier, selectedMode);
      setLootDrop(drop);
    }
    setRevealedCards(selectedMode === 'express-1dish' ? 1 : 3);
    setOpeningState('revealed');
    if (selectedMode === 'bizarre-dare') {
      playDareStinger();
    } else if (selectedMode === 'express-1dish') {
      playSpeedWhoosh();
    } else {
      playRarityFanfare(selectedTier);
    }
  };

  // THE FULL HIGH-DOPAMINE APEX OPENING SEQUENCE
  const handleOpenCase = () => {
    if (openingState !== 'idle' && openingState !== 'revealed') return;
    clearAllTimeouts();
    setCopiedZalo(false);
    setEquippedToday(false);
    setRevealedCards(0);

    // Prepare fresh drop according to both tier and preference mode
    const drop = generateApexLootDrop(selectedTier, selectedMode);
    setLootDrop(drop);

    // STAGE 1: CHARGING (1400ms of escalating tension)
    setOpeningState('charging');
    playChargingHum(1350);

    // STAGE 2: BLASTING (Unlatching & Light Beam explosion)
    const t1 = setTimeout(() => {
      setOpeningState('blasting');
      playHeavyImpact();
      playUnlatchSnap();
      spawnParticles(85, selectedTier, selectedMode);

      // Branch: EXPRESS 1-DISH (Single rapid reveal for quick power nap)
      if (selectedMode === 'express-1dish') {
        const t2 = setTimeout(() => {
          setOpeningState('revealing');
          setRevealedCards(1);
          playSpeedWhoosh();
          playRarityFanfare(selectedTier);

          const t3 = setTimeout(() => {
            setOpeningState('revealed');
          }, 450);
          timeoutsRef.current.push(t3);
        }, 650);
        timeoutsRef.current.push(t2);
        return;
      }

      // Branch: BIZARRE DARE (Dramatic stinger & challenge reveal)
      if (selectedMode === 'bizarre-dare') {
        const t2 = setTimeout(() => {
          setOpeningState('revealing');
          setRevealedCards(1);
          playDareStinger();

          const t3 = setTimeout(() => {
            setRevealedCards(2);
            playCardFlip(1);

            const t4 = setTimeout(() => {
              setRevealedCards(3);
              playCardFlip(2);
              playRarityFanfare(selectedTier);

              const t5 = setTimeout(() => {
                setOpeningState('revealed');
              }, 500);
              timeoutsRef.current.push(t5);
            }, 450);
            timeoutsRef.current.push(t4);
          }, 450);
          timeoutsRef.current.push(t3);
        }, 750);
        timeoutsRef.current.push(t2);
        return;
      }

      // Branch: STANDARD 3-CARD SEQUENTIAL REVEAL (Combo / Snack Gen Z)
      const t2 = setTimeout(() => {
        setOpeningState('revealing');
        setRevealedCards(1);
        playCardFlip(0);

        const t3 = setTimeout(() => {
          setRevealedCards(2);
          playCardFlip(1);

          const t4 = setTimeout(() => {
            setRevealedCards(3);
            playCardFlip(2);
            playRarityFanfare(selectedTier);
            if (selectedTier === 'gold') {
              playSparkleChime();
              spawnParticles(60, 'gold', selectedMode);
            }

            const t5 = setTimeout(() => {
              setOpeningState('revealed');
            }, 550);
            timeoutsRef.current.push(t5);
          }, 500);
          timeoutsRef.current.push(t4);
        }, 450);
        timeoutsRef.current.push(t3);
      }, 750);
      timeoutsRef.current.push(t2);
    }, 1400);
    timeoutsRef.current.push(t1);
  };

  // Equip to today's Lunch
  const handleEquipToday = () => {
    if (!lootDrop) return;
    const todayId = weeklyPlan[0]?.dayId || 'mon';
    
    const ingredients = [
      { name: lootDrop.mainDish.title, amount: 1, unit: 'phần', category: 'thit-ca' },
      ...(lootDrop.sideDish ? [{ name: lootDrop.sideDish.title, amount: 1, unit: 'phần', category: 'rau-cu' }] : []),
      ...(lootDrop.officeDrink ? [{ name: lootDrop.officeDrink.title, amount: 1, unit: 'ly', category: 'khac' }] : [])
    ];

    const pseudoRecipe: any = {
      id: lootDrop.mainDish.id,
      title: lootDrop.mainDish.title,
      description: lootDrop.mainDish.description,
      category: 'mon-man',
      region: 'toan-quoc',
      prepTimeMinutes: lootDrop.speedMinutes || 10,
      cookTimeMinutes: 15,
      servings: 1,
      calories: lootDrop.totalCalories,
      estimatedCostVnd: lootDrop.totalCostVnd,
      imageUrl: lootDrop.mainDish.imageUrl,
      ingredients,
      instructions: [
        { step: 1, title: 'Thưởng thức', content: lootDrop.quoteOffice }
      ],
      tags: ['Apex Fast Meal', lootDrop.modeName, lootDrop.tierName, 'Văn Phòng']
    };

    addRecipeToSlot(todayId, 'lunch', pseudoRecipe.id);
    setEquippedToday(true);
    showToast(`🍱 Đã chốt "${lootDrop.mainDish.title}" cho bữa trưa hôm nay!`);
  };

  // Copy Zalo Invite
  const handleCopyZalo = async () => {
    if (!lootDrop) return;
    const text = formatZaloOfficeInvite(lootDrop);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedZalo(true);
      showToast('📋 Đã copy lời mời nhóm chat văn phòng vào Clipboard!');
      setTimeout(() => setCopiedZalo(false), 3000);
    } catch {
      showToast('⚠️ Không thể copy tự động, vui lòng thử lại.');
    }
  };

  if (!isOpen) return null;

  const currentTierConfig = APEX_TIERS[selectedTier];
  const currentModeConfig = PREFERENCE_MODES[selectedMode];
  const isAnimating = openingState === 'charging' || openingState === 'blasting' || openingState === 'revealing';

  // SCREEN 1 (Preference Selection): Colors fit with the chosen Preference Mode
  const preferenceAccentColor = currentModeConfig.accentColor;
  const preferenceGlow = currentModeConfig.bgGlow;

  // SCREEN 2 (Case Opening Screen): Colors strictly fit with the selected TIER (Blue / Purple / Gold)
  const tierAccentColor = currentTierConfig.colorHex;
  const tierThemeGlow = selectedTier === 'gold'
    ? 'rgba(245, 158, 11, 0.45)'
    : selectedTier === 'purple'
    ? 'rgba(168, 85, 247, 0.45)'
    : 'rgba(0, 212, 255, 0.45)';

  // Modal Container Outer Glow: Preference-based on Screen 1, Tier-based on Screen 2
  const modalOuterGlow = modalScreen === 'preference' ? preferenceGlow : tierThemeGlow;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-lg sm:max-w-xl md:max-w-2xl bg-slate-900 text-white rounded-3xl border ${modalScreen === 'opener' ? currentTierConfig.borderClass : 'border-white/15'} shadow-2xl overflow-hidden transition-colors duration-300`}
        style={{
          boxShadow: `0 0 55px ${modalOuterGlow}`
        }}
      >
        {/* Canvas Particle Overlay for Explosions */}
        <canvas 
          ref={canvasRef}
          width={520}
          height={680}
          className="absolute inset-0 pointer-events-none z-30 w-full h-full"
        />

        {/* Sci-Fi Transition Warp Overlay Between Screen 1 and Screen 2 */}
        {isTransitioning && (
          <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200 overflow-hidden">
            {/* Ambient Radial Glow */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-60"
              style={{
                background: `radial-gradient(circle at 50% 45%, ${currentModeConfig.accentColor}55 0%, transparent 65%)`
              }}
            />

            {/* Concentric Warp Rings */}
            <div 
              className="absolute w-60 h-60 rounded-full border-2 border-dashed apex-warp-ring pointer-events-none"
              style={{ borderColor: currentModeConfig.accentColor, animationDelay: '0s' }}
            />
            <div 
              className="absolute w-72 h-72 rounded-full border border-dotted apex-warp-ring pointer-events-none"
              style={{ borderColor: `${currentModeConfig.accentColor}88`, animationDelay: '0.3s' }}
            />
            <div 
              className="absolute w-88 h-88 rounded-full border border-white/20 apex-warp-ring pointer-events-none"
              style={{ animationDelay: '0.6s' }}
            />

            {/* Centered Mode Icon with Pulsing Glow */}
            <div className="relative z-10 space-y-4 flex flex-col items-center">
              <div 
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-2xl animate-bounce"
                style={{
                  backgroundColor: `${currentModeConfig.accentColor}25`,
                  border: `2px solid ${currentModeConfig.accentColor}`,
                  boxShadow: `0 0 35px ${currentModeConfig.bgGlow}`
                }}
              >
                {currentModeConfig.icon}
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-widest text-white">
                  <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span>HỆ THỐNG ĐANG KẾT NỐI HÒM</span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  {currentModeConfig.name}
                </h3>
                <p className="text-xs text-slate-300 font-medium max-w-xs">
                  {currentModeConfig.tagline}
                </p>
              </div>

              {/* Energy Loading Bar */}
              <div className="w-52 h-2 rounded-full bg-white/10 overflow-hidden relative mt-2 border border-white/20">
                <div 
                  className="h-full rounded-full apex-energy-fill"
                  style={{
                    background: `linear-gradient(90deg, ${currentModeConfig.accentColor}, #ffffff)`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Top Sci-Fi Header */}
        {modalScreen === 'preference' ? (
          /* PREFERENCE SCREEN HEADER */
          <div className="relative z-20 px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2.5 bg-white/[0.03]">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <button
                type="button"
                onClick={handleBackToMinigames}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center shrink-0 transition-all cursor-pointer active:scale-95"
                title="Quay lại danh sách minigame"
                aria-label="Quay lại danh sách minigame"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase text-white truncate">
                    Mở Hòm Bữa Cơm
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center gap-1 shrink-0 border border-amber-500/30">
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
                    <span>{dailyStreak} ngày</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                  Bước 1: Chọn gu ẩm thực hôm nay
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={toggleMute}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title={isMuted ? 'Bật âm thanh SFX' : 'Tắt âm thanh'}
                aria-label="Bật/Tắt âm thanh"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* CASE OPENER SCREEN HEADER */
          <div className="relative z-20 px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2.5 bg-white/[0.03]">
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleBackToMinigames}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
                title="Quay lại danh sách minigame"
                aria-label="Quay lại danh sách minigame"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={isAnimating}
                onClick={handleBackToPreferences}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer border border-white/10"
                title="Quay lại chọn phong cách ăn khác"
              >
                <span>Đổi gu</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isAnimating && (
                <button
                  type="button"
                  onClick={handleSkipAnimation}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-black text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Bỏ qua hiệu ứng mở hòm"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>Bỏ qua</span>
                </button>
              )}

              <button
                type="button"
                onClick={toggleMute}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title={isMuted ? 'Bật âm thanh SFX' : 'Tắt âm thanh'}
                aria-label="Bật/Tắt âm thanh"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={isAnimating}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Body Container */}
        {modalScreen === 'preference' ? (
          /* ======================================================== */
          /* SCREEN 1: PREFERENCE SELECTION SCREEN (CLEAN & AIRY)     */
          /* ======================================================== */
          <div className="relative z-10 p-4 sm:p-5 space-y-3.5 max-h-[82vh] overflow-y-auto">
            {/* Clean Introductory Banner */}
            <div className="text-center space-y-1 pt-1 pb-0.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Bước 1: Chọn phong cách bữa ăn</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Hôm Nay Bạn Đang Thèm Gì?
              </h3>
              <p className="text-xs text-slate-400">
                Chọn gu ăn uống bên dưới để bước vào phòng mở hòm gacha:
              </p>
            </div>

            {/* 4 Clean Preference Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'express-1dish' as FastMealPreferenceMode,
                  title: 'Ăn Nhanh 1 Món',
                  badge: '⏱️ 10–15 phút',
                  desc: 'Ăn gọn lẹ 10–15 phút để dành trọn giờ trưa ngủ 30 phút.',
                  icon: '⚡',
                  accentColor: '#00d4ff',
                  bgGradient: 'from-cyan-500/15 via-sky-500/5 to-transparent',
                  borderColor: 'hover:border-cyan-400/80',
                  sample: 'Bún, miến, phở, hủ tiếu, bánh mì, cơm tấm'
                },
                {
                  id: 'snack-genz' as FastMealPreferenceMode,
                  title: 'Ăn Vặt Gen Z',
                  badge: '🍟 Nhâm nhi cả chiều',
                  desc: 'Finger food bốc tay, để nguội trên bàn làm việc ăn vẫn ngon.',
                  icon: '🍗',
                  accentColor: '#fb923c',
                  bgGradient: 'from-amber-500/15 via-orange-500/5 to-transparent',
                  borderColor: 'hover:border-amber-400/80',
                  sample: 'Gà nugget, khoai lắc phô mai, nem rán, trà sữa'
                },
                {
                  id: 'combo' as FastMealPreferenceMode,
                  title: 'Cơm Trưa 3 Món',
                  badge: '🍱 Đủ dinh dưỡng',
                  desc: 'Chuẩn mâm cơm văn phòng gồm món mặn, canh rau và nước uống.',
                  icon: '🍱',
                  accentColor: '#a855f7',
                  bgGradient: 'from-purple-500/15 via-indigo-500/5 to-transparent',
                  borderColor: 'hover:border-purple-400/80',
                  sample: 'Thịt kho tàu, sườn nướng, canh chua, trà đào'
                },
                {
                  id: 'bizarre-dare' as FastMealPreferenceMode,
                  title: 'Độc Lạ Thử Thách',
                  badge: '🔥 Kèo phạt gay cấn',
                  desc: 'Thực đơn kỳ dị mạo hiểm dành riêng cho kèo cá cược văn phòng.',
                  icon: '💀',
                  accentColor: '#f43f5e',
                  bgGradient: 'from-rose-500/15 via-pink-500/5 to-transparent',
                  borderColor: 'hover:border-rose-400/80',
                  sample: 'Trứng vịt lộn me, chân gà sốt Thái, đuông dừa'
                }
              ].map((card) => {
                const isSelected = selectedMode === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handlePickPreference(card.id)}
                    className={`group relative p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden hover:scale-[1.01] active:scale-[0.99] ${card.borderColor} ${
                      isSelected 
                        ? 'border-white/60 bg-white/[0.1] shadow-2xl scale-[1.02] ring-2 ring-white/30' 
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      boxShadow: isSelected ? `0 0 25px ${card.accentColor}44` : undefined
                    }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-60 pointer-events-none group-hover:opacity-100 transition-opacity`} />

                    <div className="relative z-10 space-y-2 w-full">
                      {/* Card Header: Icon + Title + Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div 
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-base shadow-md transition-transform group-hover:scale-105 shrink-0"
                            style={{ backgroundColor: `${card.accentColor}25`, border: `1px solid ${card.accentColor}66` }}
                          >
                            {card.icon}
                          </div>
                          <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-300 transition-colors leading-snug line-clamp-1">
                            {card.title}
                          </h4>
                        </div>

                        <div className="shrink-0">
                          {isSelected ? (
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm animate-pulse whitespace-nowrap">
                              <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
                              <span>ĐÃ CHỌN</span>
                            </span>
                          ) : (
                            <span 
                              className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-white/10 bg-white/5 text-slate-300 whitespace-nowrap"
                            >
                              {card.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Concise 1-sentence Purpose */}
                      <p className="text-xs text-slate-300 font-normal leading-relaxed">
                        {card.desc}
                      </p>

                      {/* Sample Dishes / Preview */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium truncate">
                          Gợi ý: {card.sample}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 ml-1.5 transition-transform ${isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* STICKY CONFIRMATION BUTTON BAR */}
            <div className="pt-2 sticky bottom-0 z-20 -mx-1 px-1 bg-slate-900/95 backdrop-blur-md pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] border-t border-white/10 space-y-1.5">
              <button
                type="button"
                onClick={handleConfirmPreference}
                disabled={isTransitioning}
                className="w-full py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-2xl transition-all duration-200 hover:brightness-110 active:scale-[0.99] cursor-pointer text-slate-950"
                style={{
                  background: `linear-gradient(135deg, ${currentModeConfig.accentColor}, #ffffff 160%)`,
                  boxShadow: `0 4px 20px ${currentModeConfig.bgGlow}`
                }}
              >
                <span className="text-base">{currentModeConfig.icon}</span>
                <span>VÀO MỞ HÒM: {currentModeConfig.name.toUpperCase()}</span>
                <ChevronRight className="w-4 h-4 ml-0.5 animate-pulse" />
              </button>

              <div className="text-center text-[10px] text-slate-400 font-medium">
                💡 Không giới hạn lượt mở • Có thể đổi gu bất cứ lúc nào
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* SCREEN 2: CASE OPENER SCREEN                             */
          /* ======================================================== */
          <div className="relative z-10 p-4 sm:p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] space-y-3 max-h-[80vh] overflow-y-auto">
            {/* 1. TITLE & STREAK HEADER (Clean & Spacious) */}
            <div className="pb-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl shrink-0">{currentModeConfig.icon}</span>
                <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-white">
                  {currentModeConfig.name}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center gap-1 shrink-0 border border-amber-500/30 shadow-sm">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                  <span>{dailyStreak} ngày</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {currentModeConfig.tagline}
              </p>
            </div>

            {/* 2. TIER SELECTOR PODIUMS (BLUE / PURPLE / GOLD) */}
          <div className="grid grid-cols-3 gap-2">
            {(['blue', 'purple', 'gold'] as ApexCaseTier[]).map(t => {
              const cfg = APEX_TIERS[t];
              const isSelected = selectedTier === t;

              // Dynamic label tailored per mode
              let subText = t === 'blue' ? '< 35k no nê' : t === 'purple' ? 'Cơm + nước' : 'Thượng hạng';
              let priceDisplay = t === 'blue' ? '18k – 35k' : t === 'purple' ? '35k – 65k' : '65k – 120k+';
              let titleLabel = t === 'blue' ? 'Tiết Kiệm' : t === 'purple' ? 'Bình Dân' : 'Ăn Sang';

              if (selectedMode === 'express-1dish') {
                subText = t === 'blue' ? 'Bánh mì, xôi' : t === 'purple' ? 'Bún, miến, phở' : 'Thố đá, bít tết';
                priceDisplay = t === 'blue' ? '18k – 35k' : t === 'purple' ? '35k – 65k' : '65k – 120k+';
                titleLabel = t === 'blue' ? 'Nhanh Rẻ' : t === 'purple' ? 'Vừa Vặn' : 'Đặc Biệt';
              } else if (selectedMode === 'snack-genz') {
                subText = t === 'blue' ? 'Khoai, bánh tráng' : t === 'purple' ? 'Nuggets, trà sữa' : 'Đại tiệc snack';
                priceDisplay = t === 'blue' ? '18k – 35k' : t === 'purple' ? '35k – 65k' : '65k – 120k+';
                titleLabel = t === 'blue' ? 'Ăn Vặt 1' : t === 'purple' ? 'Combo Chiều' : 'Trùm Ăn Vặt';
              } else if (selectedMode === 'bizarre-dare') {
                subText = t === 'blue' ? 'Trứng bắc thảo' : t === 'purple' ? 'Hột vịt lộn, chân gà' : 'Đuông dừa, nậm pịa';
                priceDisplay = t === 'blue' ? 'Cấp Độ 6' : t === 'purple' ? 'Cấp Độ 8' : 'CỰC HẠN 10';
                titleLabel = t === 'blue' ? 'Thử Nghiệm' : t === 'purple' ? 'Cay Đắng' : 'Liều Mạng';
              }

              return (
                <button
                  key={t}
                  type="button"
                  disabled={isAnimating}
                  onClick={() => handleSelectTier(t)}
                  className={`relative p-2 sm:p-2.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between min-h-[74px] overflow-hidden ${
                    isSelected
                      ? `bg-white/10 ${cfg.borderClass} ${cfg.glowClass} scale-[1.02]`
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] opacity-70 hover:opacity-100'
                  } ${isAnimating ? 'pointer-events-none' : ''}`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[10px] font-black uppercase tracking-wider truncate ${cfg.textColor}`}>
                      {titleLabel}
                    </span>
                    <span className="text-xs shrink-0">
                      {selectedMode === 'bizarre-dare' ? (t === 'gold' ? '💀' : t === 'purple' ? '🔥' : '🐛') : (t === 'blue' ? '💙' : t === 'purple' ? '💜' : '👑')}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <span className="text-xs sm:text-[13px] font-black text-white block whitespace-nowrap truncate">
                      {priceDisplay}
                    </span>
                    <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-medium block whitespace-nowrap truncate" title={subText}>
                      {subText}
                    </span>
                  </div>

                  {isSelected && (
                    <div 
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full shadow-md"
                      style={{ backgroundColor: cfg.colorHex, boxShadow: `0 0 10px ${cfg.colorHex}` }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* MAIN STAGE: CINEMATIC LOOT TICK OR REVEALED DROP */}
          {openingState !== 'revealing' && openingState !== 'revealed' ? (
            /* ------------------ CINEMATIC ANIMATION STAGE (IDLE / CHARGING / BLASTING) ------------------ */
            <div className="relative rounded-3xl bg-slate-950/80 border border-white/10 p-5 sm:p-6 flex flex-col items-center justify-center text-center overflow-hidden min-h-[290px]">
              
              {/* Sci-Fi Background Glow & Grid Lines */}
              <div 
                className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
                  openingState === 'charging' ? 'opacity-50' : 'opacity-20'
                }`}
                style={{
                  background: `radial-gradient(circle at 50% 40%, ${tierAccentColor} 0%, transparent 70%)`
                }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              {/* 3 GIANT VERTICAL LASER BEAMS SHOOTING UP DURING BLASTING */}
              {openingState === 'blasting' && (
                <div className="absolute inset-x-0 bottom-0 top-0 flex justify-around pointer-events-none z-20">
                  <div 
                    className="w-10 h-full apex-laser blur-sm"
                    style={{ background: `linear-gradient(to top, ${tierAccentColor}, white)` }}
                  />
                  <div 
                    className="w-16 h-full apex-laser blur-sm"
                    style={{ background: `linear-gradient(to top, ${tierAccentColor}, white)` }}
                  />
                  <div 
                    className="w-10 h-full apex-laser blur-sm"
                    style={{ background: `linear-gradient(to top, ${tierAccentColor}, white)` }}
                  />
                </div>
              )}

              {/* APEX LOOT TICK (Triangular Robotic Capsule) */}
              <div className="relative z-10 my-2 flex flex-col items-center justify-center">
                
                {/* Robot + Centered Vortex Container */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  
                  {/* Energy Vortex Swirling Inward during charging */}
                  {openingState === 'charging' && (
                    <div 
                      className="absolute inset-0 -inset-6 m-auto w-48 h-48 rounded-full border-2 border-dashed apex-vortex pointer-events-none"
                      style={{ borderColor: tierAccentColor }}
                    />
                  )}

                  {/* The Robot SVG with vertical compression vibration */}
                  <div 
                    className={`w-36 h-36 flex items-center justify-center transition-transform duration-300 ${
                      openingState === 'blasting'
                        ? 'scale-110 brightness-150'
                        : openingState === 'charging' 
                        ? 'apex-tick-vibrate' 
                        : 'hover:scale-105'
                    }`}
                  >
                    <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-2xl">
                      {/* Energy Aura */}
                      <circle 
                        cx="80" 
                        cy="80" 
                        r={openingState === 'blasting' ? '76' : openingState === 'charging' ? '70' : '65'} 
                        fill={tierAccentColor} 
                        opacity={openingState === 'blasting' ? '0.75' : openingState === 'charging' ? '0.45' : '0.15'} 
                      />
                      
                      {/* 3 Articulated Mechanical Legs */}
                      <path 
                        d={openingState === 'blasting' ? "M 35 125 L 10 155" : "M 40 115 L 20 145"} 
                        stroke="#64748b" 
                        strokeWidth="6" 
                        strokeLinecap="round" 
                      />
                      <path 
                        d={openingState === 'blasting' ? "M 125 125 L 150 155" : "M 120 115 L 140 145"} 
                        stroke="#64748b" 
                        strokeWidth="6" 
                        strokeLinecap="round" 
                      />
                      <path 
                        d={openingState === 'blasting' ? "M 80 135 L 80 160" : "M 80 125 L 80 155"} 
                        stroke="#64748b" 
                        strokeWidth="6" 
                        strokeLinecap="round" 
                      />
                      
                      {/* Robotic Triangular Chassis */}
                      <polygon 
                        points={openingState === 'blasting' ? "80,10 145,120 15,120" : "80,25 135,115 25,115"} 
                        fill="#1e293b" 
                        stroke={tierAccentColor} 
                        strokeWidth={openingState === 'charging' ? '5' : '3.5'} 
                        strokeLinejoin="round" 
                      />
                      
                      {/* Internal Carbon Plates */}
                      <polygon points="80,45 118,105 42,105" fill="#0f172a" />

                      {/* Center Glowing Core Eye */}
                      <circle 
                        cx="80" 
                        cy="85" 
                        r={openingState === 'blasting' ? '22' : openingState === 'charging' ? '18' : '14'} 
                        fill={tierAccentColor} 
                        className={openingState === 'charging' ? 'animate-pulse' : ''}
                      />
                      <circle cx="80" cy="85" r="7" fill="#ffffff" />
                    </svg>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-2 flex items-center gap-1.5">
                  <span 
                    className="w-2 h-2 rounded-full animate-ping" 
                    style={{ backgroundColor: tierAccentColor }}
                  />
                  <span 
                    className="text-[11px] font-black tracking-wider uppercase" 
                    style={{ color: tierAccentColor }}
                  >
                    {openingState === 'charging'
                      ? 'Năng lượng đang tích tụ...'
                      : openingState === 'blasting'
                      ? 'Bung Khóa Hộp!'
                      : `${currentTierConfig.tier === 'gold' ? '👑' : currentTierConfig.tier === 'purple' ? '💜' : '💙'} Sẵn Sàng Bẻ Khóa Hòm ${currentTierConfig.name}`}
                  </span>
                </div>
              </div>

              {/* Vibe description & drop rate */}
              <p className="relative z-10 text-xs text-slate-300 font-medium max-w-xs mt-2">
                {openingState === 'charging' 
                  ? 'Giữ chặt tay! Hòm đang chuẩn bị bung khóa siêu phẩm...'
                  : currentModeConfig.description}
              </p>
              <span className="relative z-10 text-[10px] text-slate-400 mt-1 block italic">
                "{currentTierConfig.vibeQuote}"
              </span>

              {/* UNLATCH / OPEN BUTTON - FITS WITH THE SELECTED TIER COLOR */}
              <div className="relative z-10 mt-4 w-full max-w-xs">
                <button
                  type="button"
                  onClick={handleOpenCase}
                  disabled={isAnimating}
                  className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                    isAnimating
                      ? 'bg-gradient-to-r from-amber-400 via-purple-500 to-sky-400 animate-pulse cursor-not-allowed opacity-90'
                      : 'hover:brightness-110 shadow-lg'
                  }`}
                  style={{
                    background: isAnimating 
                      ? undefined 
                      : `linear-gradient(135deg, ${tierAccentColor}, #ffffff 180%)`,
                    boxShadow: `0 8px 26px ${tierThemeGlow}`
                  }}
                >
                  {openingState === 'charging' ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Đang Bẻ Khóa Hộp...</span>
                    </>
                  ) : openingState === 'blasting' ? (
                    <>
                      <Zap className="w-4 h-4 fill-slate-950 animate-ping" />
                      <span>Đang Bung Hộp!</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>
                        {selectedMode === 'bizarre-dare'
                          ? `💀 Mở Hòm ${currentTierConfig.name}`
                          : selectedMode === 'express-1dish'
                          ? `⚡ Mở Hòm ${currentTierConfig.name}`
                          : selectedMode === 'snack-genz'
                          ? `🍟 Mở Hòm ${currentTierConfig.name}`
                          : `Bẻ Khóa Hòm ${currentTierConfig.name}`}
                      </span>
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (
            /* ------------------ REVEALED LOOT DROP VIEW ------------------ */
            <div className="space-y-3.5 animate-in fade-in zoom-in-95 duration-300 relative">
              
              {/* Rotating Golden Rays for Legendary Gold */}
              {selectedTier === 'gold' && (
                <div className="absolute -inset-10 pointer-events-none opacity-25 overflow-hidden flex items-center justify-center">
                  <div className="w-full max-w-lg aspect-square apex-rays-spin bg-[conic-gradient(from_0deg,#fbbf24,transparent_30deg,#f59e0b,transparent_60deg,#fbbf24,transparent_90deg,#f59e0b,transparent_120deg,#fbbf24,transparent_150deg,#f59e0b,transparent_180deg,#fbbf24,transparent_210deg,#f59e0b,transparent_240deg,#fbbf24,transparent_270deg,#f59e0b,transparent_300deg,#fbbf24,transparent_330deg,#f59e0b)] rounded-full blur-sm" />
                </div>
              )}

              {/* Victory Banner */}
              <div 
                className="relative z-10 p-3 rounded-2xl border bg-white/[0.04] flex items-center justify-between flex-wrap gap-2"
                style={{ borderColor: `${tierAccentColor}66` }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-xl shrink-0">
                    {selectedMode === 'bizarre-dare' ? '💀' : selectedMode === 'express-1dish' ? '⚡' : selectedMode === 'snack-genz' ? '🍟' : '🍱'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 
                        className="text-xs font-black uppercase tracking-wider truncate"
                        style={{ color: tierAccentColor }}
                      >
                        {selectedMode === 'bizarre-dare'
                          ? 'Thử Thách Gan Dạ Đã Lộ Diện!'
                          : selectedMode === 'express-1dish'
                          ? 'Món Ăn Nhanh Chợp Mắt Sẵn Sàng!'
                          : selectedMode === 'snack-genz'
                          ? 'Đại Tiệc Ăn Vặt Gen Z Đã Mở!'
                          : 'Kèo Ăn Trưa Văn Phòng Đã Sẵn Sàng!'}
                      </h3>
                      {lootDrop?.isNewUnlock && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-emerald-500 text-slate-950 shadow-sm animate-pulse shrink-0">
                          ✨ MỚI MỞ KHÓA!
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium truncate">
                      Chi phí: <strong className="text-white">~{lootDrop?.totalCostVnd.toLocaleString('vi-VN')} đ</strong> • Bộ sưu tập: <strong className="text-amber-300">{lootDrop?.unlockedCount} / {lootDrop?.totalPoolCount} món</strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCase}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-white/10 to-white/20 hover:brightness-125 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 ml-auto"
                  title="Mở tiếp món mới không trùng lặp"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Quay Tiếp</span>
                </button>
              </div>

              {/* ----------------- BRANCH A: 1-DISH EXPRESS HERO VIEW (10-20 PHÚT ĐỂ KỊP NGỦ TRƯA) ----------------- */}
              {lootDrop?.mode === 'express-1dish' ? (
                <div className="relative z-10 p-4 rounded-3xl bg-white/[0.04] border-2 border-cyan-400/50 shadow-xl shadow-cyan-500/20 apex-card-reveal space-y-3">
                  <div className="relative h-44 sm:h-48 rounded-2xl overflow-hidden bg-slate-800 shadow-md group">
                    <SafeImage 
                      src={lootDrop.mainDish.imageUrl} 
                      alt={lootDrop.mainDish.title}
                      fallbackTitle={lootDrop.mainDish.title}
                      category="Ăn Nhanh 1 Món"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-tight shadow-md flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        Ăn trong {lootDrop.speedMinutes || 12} phút
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-extrabold tracking-tight shadow-md flex items-center gap-1">
                        <Moon className="w-3 h-3" />
                        Kịp ngủ trưa 30p
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-base sm:text-lg font-black text-white leading-snug drop-shadow-md">
                        {lootDrop.mainDish.title}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {lootDrop.mainDish.description}
                    </p>

                    <div className="p-2.5 rounded-2xl bg-cyan-950/60 border border-cyan-500/50 shadow-lg shadow-cyan-500/20 text-center space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-cyan-400 font-black text-xs uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>ĂN NHANH CHỚP NHOÁNG • KỊP GIỜ CHỢP MẮT</span>
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                      </div>
                      <p className="text-xs font-extrabold text-amber-300">
                        {lootDrop.napBuff}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Chi phí:</span>
                        <span className="text-sm font-black text-cyan-300">
                          {lootDrop.totalCostVnd.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-semibold block">Năng lượng:</span>
                        <span className="text-xs font-extrabold text-white">
                          {lootDrop.totalCalories} kcal
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ----------------- BRANCH B: 3-CARD LAYOUT (COMBO / SNACK GEN Z / BIZARRE DARE) ----------------- */
                <div className="space-y-3">
                  
                  {/* Bizarre Dare Banner */}
                  {lootDrop?.mode === 'bizarre-dare' && (
                    <div className="p-2.5 rounded-2xl bg-pink-950/60 border border-pink-500/50 shadow-lg shadow-pink-500/20 text-center space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-pink-400 font-black text-xs uppercase tracking-wider">
                        <Skull className="w-4 h-4 text-pink-400" />
                        <span>KÈO THÁCH ĐỐ GAN DẠ • DÁM ĂN KHÔNG?</span>
                        <Skull className="w-4 h-4 text-pink-400" />
                      </div>
                      <p className="text-xs font-extrabold text-amber-300">
                        ⚖️ {lootDrop.darePenalty}
                      </p>
                    </div>
                  )}

                  {/* Snack Gen Z Tagline Banner */}
                  {lootDrop?.mode === 'snack-genz' && (
                    <div className="p-2.5 rounded-2xl bg-orange-950/60 border border-orange-500/50 shadow-lg shadow-orange-500/20 text-center space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-amber-400 font-black text-xs uppercase tracking-wider">
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span>GEN Z VIBE • LAI RAI KHÔNG SỢ NGUỘI</span>
                        <Flame className="w-4 h-4 text-amber-400" />
                      </div>
                      <p className="text-xs font-extrabold text-amber-300">
                        {lootDrop.snackFeature}
                      </p>
                    </div>
                  )}

                  {/* Combo 3-Course Banner */}
                  {lootDrop?.mode === 'combo' && (
                    <div className="p-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 shadow-lg shadow-emerald-500/20 text-center space-y-1">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-black text-xs uppercase tracking-wider">
                        <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
                        <span>MÂM CƠM TRƯA CHUẨN VỊ • ĐỦ ĐẠM ĐỦ RAU</span>
                        <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-xs font-extrabold text-amber-300">
                        {lootDrop.quoteOffice}
                      </p>
                    </div>
                  )}

                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    
                    {/* CARD 1: MÓN CHÍNH / MÓN THÁCH ĐỐ / MÓN CHIÊN VẶT */}
                    {revealedCards >= 1 ? (
                      <div className={`p-3 rounded-2xl bg-white/[0.04] border transition-all flex flex-col justify-between relative group apex-card-reveal overflow-hidden ${
                        lootDrop?.mode === 'bizarre-dare'
                          ? 'border-pink-500/60 shadow-lg shadow-pink-500/25'
                          : selectedTier === 'gold'
                          ? 'border-amber-400/50 shadow-lg shadow-amber-500/20'
                          : 'border-white/15 hover:border-amber-400/50'
                      }`}>
                        <div className="space-y-2">
                          <div className="relative w-full h-28 sm:h-24 rounded-xl overflow-hidden bg-slate-800">
                            <SafeImage 
                              src={lootDrop?.mainDish.imageUrl} 
                              alt={lootDrop?.mainDish.title}
                              fallbackTitle={lootDrop?.mainDish.title}
                              category={lootDrop?.mode === 'bizarre-dare' ? 'Món Độc Lạ' : lootDrop?.mode === 'snack-genz' ? 'Món Ăn Vặt' : 'Món Chính'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                            />
                            <span 
                              className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight shadow-md"
                              style={{
                                backgroundColor: lootDrop?.mode === 'bizarre-dare' ? '#ec4899' : '#0f172a',
                                color: lootDrop?.mode === 'bizarre-dare' ? '#ffffff' : '#fbbf24'
                              }}
                            >
                              {lootDrop?.mode === 'bizarre-dare' ? '💀 Món Thách Đố' : lootDrop?.mode === 'snack-genz' ? '🍗 Món Chiên Vặt' : 'Món Chính'}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xs font-black text-white line-clamp-2 leading-snug">
                              {lootDrop?.mainDish.title}
                            </h4>
                            {lootDrop?.mode === 'bizarre-dare' && lootDrop.dareLevel ? (
                              <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 text-[9px] font-black border border-pink-500/30">
                                {lootDrop.dareLevel}
                              </span>
                            ) : (
                              <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                                {lootDrop?.mainDish.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-emerald-400">
                            {lootDrop?.mainDish.estimatedCostVnd.toLocaleString('vi-VN')} đ
                          </span>
                          <span className="text-slate-400 font-medium">
                            {lootDrop?.mainDish.calories} kcal
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-dashed border-white/15 flex flex-col items-center justify-center min-h-[160px] animate-pulse">
                        <Zap className="w-6 h-6 text-slate-600 mb-1" />
                        <span className="text-[10px] font-bold text-slate-500">Đang lật món chính...</span>
                      </div>
                    )}

                    {/* CARD 2: MÓN KÈM / RAU / MÓN NHẮM */}
                    {revealedCards >= 2 ? (
                      <div className={`p-3 rounded-2xl bg-white/[0.04] border transition-all flex flex-col justify-between relative group apex-card-reveal overflow-hidden ${
                        lootDrop?.mode === 'bizarre-dare'
                          ? 'border-pink-500/40'
                          : 'border-white/15 hover:border-emerald-400/50'
                      }`}>
                        <div className="space-y-2">
                          <div className="relative w-full h-28 sm:h-24 rounded-xl overflow-hidden bg-slate-800">
                            <SafeImage 
                              src={lootDrop?.sideDish?.imageUrl} 
                              alt={lootDrop?.sideDish?.title}
                              fallbackTitle={lootDrop?.sideDish?.title}
                              category="Món Kèm"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                            />
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[9px] font-black text-emerald-400 uppercase tracking-tight">
                              {lootDrop?.mode === 'bizarre-dare' ? '🔥 Gia Vị Kèm' : lootDrop?.mode === 'snack-genz' ? '🍿 Món Nhắm Kèm' : 'Canh / Rau Kèm'}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xs font-black text-white line-clamp-2 leading-snug">
                              {lootDrop?.sideDish?.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {lootDrop?.mode === 'bizarre-dare' ? 'Thêm hương vị bùng nổ thử thách.' : 'Bổ sung chất xơ, nhâm nhi mát ruột.'}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-emerald-400">
                            {lootDrop?.sideDish?.estimatedCostVnd.toLocaleString('vi-VN')} đ
                          </span>
                          <span className="text-slate-400 font-medium">
                            {lootDrop?.sideDish?.calories} kcal
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-dashed border-white/15 flex flex-col items-center justify-center min-h-[160px] animate-pulse">
                        <Utensils className="w-6 h-6 text-slate-600 mb-1" />
                        <span className="text-[10px] font-bold text-slate-500">Đang lật món kèm...</span>
                      </div>
                    )}

                    {/* CARD 3: ĐỒ UỐNG / TRÀ SỮA / NƯỚC GIẢI ĐỘC */}
                    {revealedCards >= 3 ? (
                      <div className={`p-3 rounded-2xl bg-white/[0.04] border transition-all flex flex-col justify-between relative group apex-card-reveal overflow-hidden ${
                        lootDrop?.mode === 'bizarre-dare'
                          ? 'border-pink-500/40'
                          : 'border-white/15 hover:border-sky-400/50'
                      }`}>
                        <div className="space-y-2">
                          <div className="relative w-full h-28 sm:h-24 rounded-xl overflow-hidden bg-slate-800">
                            <SafeImage 
                              src={lootDrop?.officeDrink?.imageUrl} 
                              alt={lootDrop?.officeDrink?.title}
                              fallbackTitle={lootDrop?.officeDrink?.title}
                              category="Đồ Uống"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                            />
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[9px] font-black text-sky-400 uppercase tracking-tight">
                              {lootDrop?.mode === 'bizarre-dare' ? '🌿 Nước Giải Độc' : lootDrop?.mode === 'snack-genz' ? '🧋 Trà Sữa / Trà Quả' : 'Nước Uống Văn Phòng'}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xs font-black text-white line-clamp-2 leading-snug">
                              {lootDrop?.officeDrink?.title}
                            </h4>
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[9px] font-extrabold shadow-sm">
                              {lootDrop?.officeDrink?.officeBuff}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-emerald-400">
                            {lootDrop?.officeDrink?.estimatedCostVnd.toLocaleString('vi-VN')} đ
                          </span>
                          <span className="text-slate-400 font-medium">
                            {lootDrop?.officeDrink?.calories} kcal
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-white/[0.02] border border-dashed border-white/15 flex flex-col items-center justify-center min-h-[160px] animate-pulse">
                        <Coffee className="w-6 h-6 text-slate-600 mb-1" />
                        <span className="text-[10px] font-bold text-slate-500">Đang lật đồ uống...</span>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* ACTION BUTTONS: EQUIP & SHARE ZALO */}
              <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={handleEquipToday}
                  disabled={equippedToday}
                  className={`flex-1 py-3 px-3.5 sm:px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer min-w-0 ${
                    equippedToday
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'hover:brightness-110 active:scale-95 text-slate-950 font-black'
                  }`}
                  style={!equippedToday ? {
                    background: `linear-gradient(135deg, ${tierAccentColor}, #ffffff 180%)`,
                    boxShadow: `0 4px 16px ${tierThemeGlow}`
                  } : {}}
                >
                  {equippedToday ? (
                    <>
                      <Check className="w-4 h-4 shrink-0" />
                      <span className="truncate">✓ Đã Chốt Vào Thực Đơn Hôm Nay!</span>
                    </>
                  ) : (
                    <>
                      <Utensils className="w-4 h-4 shrink-0" />
                      <span className="truncate">
                        {lootDrop?.mode === 'bizarre-dare'
                          ? '😈 Nhận Kèo Thách Đấu (Chốt Bữa Này)'
                          : lootDrop?.mode === 'express-1dish'
                          ? '⚡ Chốt Món Này (Ăn Nhanh Ngủ Trưa)'
                          : lootDrop?.mode === 'snack-genz'
                          ? '🍟 Chốt Mâm Ăn Vặt Này'
                          : 'Chốt Bữa Này (Ăn Trưa Nay)'}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyZalo}
                  className="py-3 px-3 sm:px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors sm:shrink-0 cursor-pointer active:scale-95 whitespace-nowrap"
                  title="Copy lời mời Zalo gửi nhóm chat văn phòng"
                >
                  {copiedZalo ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-emerald-400">Đã Copy Zalo!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>
                        {lootDrop?.mode === 'bizarre-dare'
                          ? '📢 Thách Đố Cả Phòng (Zalo)'
                          : lootDrop?.mode === 'express-1dish'
                          ? '😴 Rủ Ăn Nhanh Ngủ Trưa (Zalo)'
                          : lootDrop?.mode === 'snack-genz'
                          ? '🧋 Rủ Ăn Vặt Ké Đơn (Zalo)'
                          : 'Rủ Đồng Nghiệp (Copy Zalo)'}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Secondary Switch: Try Another Preference Mode or Re-roll */}
              <div className="pt-2 flex items-center justify-between text-xs border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setOpeningState('idle');
                    setRevealedCards(0);
                    setLootDrop(null);
                  }}
                  className="text-slate-400 hover:text-white font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Quay tiếp hòm này</span>
                </button>

                <button
                  type="button"
                  onClick={handleBackToPreferences}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>← Đổi gu ẩm thực khác</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

        {/* ======================================================== */}
        {/* MODAL 3: BỘ SƯU TẬP MÓN ĐÃ MỞ (0% TRÙNG LẶP / GALLERY)    */}
        {/* ======================================================== */}
        {isGalleryOpen && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col p-4 sm:p-5 animate-in fade-in duration-200">
            {/* Gallery Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                    <span>Sổ Sưu Tập Món Độc Quyền</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      0% Trùng Lặp
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Đã mở <strong className="text-amber-300">{getAllUnlockedDishes().length}</strong> món trên tài khoản này
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="w-7 h-7 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Đóng sổ sưu tập"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Filter Tabs & Search */}
            <div className="py-2 space-y-1.5">
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'express-1dish', label: '⚡ Ăn Nhanh' },
                  { id: 'snack-genz', label: '🍟 Ăn Vặt' },
                  { id: 'combo', label: '🍱 Cơm 3 Món' },
                  { id: 'bizarre-dare', label: '💀 Thử Thách' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setGalleryFilter(tab.id as any)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      galleryFilter === tab.id
                        ? 'bg-white text-slate-950 shadow-md font-black'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={gallerySearch}
                  onChange={e => setGallerySearch(e.target.value)}
                  placeholder="Tìm món trong kho đã mở..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
                />
              </div>
            </div>

            {/* Unlocked Dishes Grid */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[55vh]">
              {(() => {
                const all = getAllUnlockedDishes();
                const filtered = all.filter(item => {
                  const matchFilter = galleryFilter === 'all' || item.mode === galleryFilter;
                  const matchSearch = !gallerySearch || item.title.toLowerCase().includes(gallerySearch.toLowerCase()) || item.description.toLowerCase().includes(gallerySearch.toLowerCase());
                  return matchFilter && matchSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center space-y-2 text-slate-400">
                      <Package className="w-9 h-9 text-slate-600 mx-auto" />
                      <p className="text-xs font-medium">Chưa có món nào được mở trong mục này.</p>
                      <p className="text-[10px] text-slate-500">Hãy bẻ khóa hòm gacha để thu thập các món ăn độc quyền!</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {filtered.map(item => {
                      const tierColor = item.tier === 'gold' ? '#f59e0b' : item.tier === 'purple' ? '#a855f7' : '#00d4ff';
                      const tierBadge = item.tier === 'gold' ? 'VÀNG' : item.tier === 'purple' ? 'TÍM' : 'LAM';
                      return (
                        <div
                          key={item.id}
                          className="p-2 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2 hover:bg-white/[0.07] transition-all"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0 relative">
                            <SafeImage
                              src={item.imageUrl}
                              alt={item.title}
                              fallbackTitle={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className="text-[8px] font-black uppercase px-1 py-0.2 rounded"
                                style={{ backgroundColor: `${tierColor}25`, color: tierColor, border: `1px solid ${tierColor}44` }}
                              >
                                {tierBadge}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                ~{item.estimatedCostVnd.toLocaleString('vi-VN')} đ
                              </span>
                            </div>

                            <h4 className="text-xs font-black text-white truncate mt-0.5">
                              {item.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate">
                              {item.napBuff || item.snackFeature || item.darePenalty || item.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Gallery Footer */}
            <div className="pt-2 mt-auto border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <span>💡 Không bao giờ trùng lặp món</span>
              <button
                type="button"
                onClick={() => {
                  openConfirmModal({
                    title: 'Đặt Lại Kho Món Ăn',
                    message: 'Bạn có chắc muốn đặt lại kho món ăn đã mở để bắt đầu chu kỳ mới?',
                    confirmLabel: 'Đặt lại kho',
                    cancelLabel: 'Giữ lại',
                    isDanger: true,
                    onConfirm: () => {
                      resetAccountCaseCollection();
                      setCollectionStats(getModeCollectionStats(selectedMode));
                      showToast('🔄 Đã làm mới kho sưu tập món!');
                    }
                  });
                }}
                className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Đặt lại kho</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
