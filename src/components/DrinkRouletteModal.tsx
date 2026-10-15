import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  X, 
  Users, 
  Flame, 
  Trophy, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Beer, 
  Sparkles,
  ArrowRight,
  Settings,
  Wine,
  UserCheck,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { useMealWise } from '../context/MealWiseContext';
import { RouletteWheel, WheelSegment } from './RouletteWheel';
import {
  calculateNextWheelAngle,
  generateShotSegments,
  applyCaBanRule,
  getDelegateCandidates,
  applyDelegatePenalty,
  applyStandardPenalty,
  rankPlayersByShots,
  Player,
  ShotPenalty,
} from '../utils/rouletteMath';
import { 
  playRouletteTick, 
  playVictoryFanfare, 
  playGlassClink, 
  setApexMuted, 
  getApexMuted 
} from '../utils/audioSynth';

export type { Player, ShotPenalty };

type GameStage = 'SETUP' | 'WHEEL_PLAYER' | 'PLAYER_SELECTED' | 'WHEEL_SHOTS' | 'WHEEL_DELEGATE' | 'RESULT';

const PLAYER_PALETTE = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#e11d48', // Rose
];

const FUN_QUOTES = [
  'Uống hết mình, tình cảm gia đình! 🍻',
  'Rượu bất khả ép, ép là phải uống! ⚡',
  'Không say không về, mà say thì khỏi về! 🛵',
  'Một ly giải sầu, hai ly bay màu! 🌈',
  'Trăm năm bia đá cũng mòn, ngàn năm bia lon vẫn còn! 🍺',
  'Bàn tiệc không phân biệt cao thấp, chỉ phân biệt ai còn tỉnh! 👑'
];

interface DrinkRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DrinkRouletteModal: React.FC<DrinkRouletteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { openMinigameHub, openConfirmModal, showToast } = useMealWise();

  // Game Setup State
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Tôi (Chủ xị)', color: PLAYER_PALETTE[0], shotsCount: 0 },
    { id: '2', name: 'Bạn A', color: PLAYER_PALETTE[1], shotsCount: 0 },
    { id: '3', name: 'Bạn B', color: PLAYER_PALETTE[2], shotsCount: 0 },
  ]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [minShots, setMinShots] = useState<number>(1);
  const [maxShots, setMaxShots] = useState<number>(3);
  const [includeBonusSlots, setIncludeBonusSlots] = useState<boolean>(true);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState<boolean>(false);
  const [isRoundSummaryOpen, setIsRoundSummaryOpen] = useState<boolean>(false);

  const handleBackToHub = () => {
    if (isSpinning) return;
    onClose();
    openMinigameHub();
  };

  // Gameplay Stage
  const [stage, setStage] = useState<GameStage>('SETUP');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [delegatedPlayer, setDelegatedPlayer] = useState<Player | null>(null);
  const [currentPenalty, setCurrentPenalty] = useState<ShotPenalty | null>(null);

  // Wheel Animation Angles (Accumulating continuously for smooth forward rotation)
  const [isSpinning, setIsSpinning] = useState(false);
  const [playerWheelAngle, setPlayerWheelAngle] = useState(0);
  const [shotWheelAngle, setShotWheelAngle] = useState(0);
  const [delegateWheelAngle, setDelegateWheelAngle] = useState(0);
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(null);
  const [selectedShotIndex, setSelectedShotIndex] = useState<number | null>(null);
  const [selectedDelegateIndex, setSelectedDelegateIndex] = useState<number | null>(null);

  // Audio / Sound
  const [isSoundMuted, setIsSoundMuted] = useState(getApexMuted());
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync mute with global synth
  const toggleSound = () => {
    const nextMute = !isSoundMuted;
    setIsSoundMuted(nextMute);
    setApexMuted(nextMute);
  };

  // Sound ticking simulator while wheel spins
  const startTickingSound = (durationMs = 4500) => {
    if (isSoundMuted) return;
    const startTime = Date.now();
    let tickDelay = 60; // start fast

    const runTick = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= durationMs) return;

      playRouletteTick(1 + Math.random() * 0.2);

      // Decelerate tick frequency smoothly
      const progress = elapsed / durationMs;
      tickDelay = 60 + Math.pow(progress, 2.5) * 480;

      soundIntervalRef.current = setTimeout(runTick, tickDelay);
    };

    runTick();
  };

  const stopTickingSound = () => {
    if (soundIntervalRef.current) {
      clearTimeout(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopTickingSound();
    };
  }, []);

  // Quick preset shot ranges
  const applyPreset = (min: number, max: number) => {
    setMinShots(min);
    setMaxShots(max);
  };

  // Add new player
  const handleAddPlayer = () => {
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;
    const nextColor = PLAYER_PALETTE[players.length % PLAYER_PALETTE.length];
    const newP: Player = {
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      name: trimmed,
      color: nextColor,
      shotsCount: 0,
    };
    setPlayers(prev => [...prev, newP]);
    setNewPlayerName('');
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 2) return; // Keep at least 2 players
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  // Wheel 1 Segments (All Players)
  const playerSegments: WheelSegment[] = useMemo(() => {
    return players.map((p) => ({
      id: p.id,
      label: p.name,
      sublabel: `${p.shotsCount} shot`,
      color: p.color,
      textColor: '#ffffff',
    }));
  }, [players]);

  // Candidates for "Uống Hộ" Wheel (All players except the original selected player)
  const delegateCandidates: Player[] = useMemo(() => {
    if (!selectedPlayer) return [];
    return getDelegateCandidates(players, selectedPlayer.id);
  }, [players, selectedPlayer]);

  // Wheel 3 Segments ("Uống Hộ" delegate wheel)
  const delegateSegments: WheelSegment[] = useMemo(() => {
    return delegateCandidates.map((p) => ({
      id: p.id,
      label: p.name,
      sublabel: `${p.shotsCount} shot`,
      color: p.color,
      textColor: '#ffffff',
    }));
  }, [delegateCandidates]);

  // Wheel 2 Segments (Shot penalties generated dynamically from range: numeric + bonus_swap + bonus_all)
  const shotSegments: ShotPenalty[] = useMemo(() => {
    return generateShotSegments(minShots, maxShots, includeBonusSlots);
  }, [minShots, maxShots, includeBonusSlots]);

  // ==========================================================
  // SPIN WHEEL 1: PLAYER WHEEL (Exact 1-to-1 Mathematical Alignment)
  // ==========================================================
  const handleSpinPlayerWheel = () => {
    if (isSpinning || players.length < 2) return;
    setIsSpinning(true);
    setSelectedPlayer(null);
    setSelectedPlayerIndex(null);
    setDelegatedPlayer(null);

    const totalSegs = players.length;
    // Pick random winner
    const winningIndex = Math.floor(Math.random() * totalSegs);
    const winner = players[winningIndex];

    // Compute continuous forward rotation angle with exact dead-center slice landing
    const nextAngle = calculateNextWheelAngle(playerWheelAngle, winningIndex, totalSegs, 6);

    startTickingSound(4500);
    setPlayerWheelAngle(nextAngle);

    setTimeout(() => {
      stopTickingSound();
      setIsSpinning(false);
      setSelectedPlayer(winner);
      setSelectedPlayerIndex(winningIndex);
      playVictoryFanfare();
      setStage('PLAYER_SELECTED');
    }, 4600);
  };

  // PROCEED TO WHEEL 2: SHOT WHEEL
  const handleProceedToShotWheel = () => {
    setStage('WHEEL_SHOTS');
  };

  // ==========================================================
  // SPIN WHEEL 2: SHOT WHEEL (Exact 1-to-1 Mathematical Alignment)
  // ==========================================================
  const handleSpinShotWheel = () => {
    if (isSpinning || shotSegments.length === 0) return;
    setIsSpinning(true);
    setCurrentPenalty(null);
    setSelectedShotIndex(null);

    const totalSegs = shotSegments.length;
    // Pick random penalty
    const winningIndex = Math.floor(Math.random() * totalSegs);
    const winningPenalty = shotSegments[winningIndex];

    // Compute continuous forward rotation angle with exact dead-center slice landing
    const nextAngle = calculateNextWheelAngle(shotWheelAngle, winningIndex, totalSegs, 6);

    startTickingSound(4500);
    setShotWheelAngle(nextAngle);

    setTimeout(() => {
      stopTickingSound();
      setIsSpinning(false);
      setCurrentPenalty(winningPenalty);
      setSelectedShotIndex(winningIndex);
      playGlassClink();
      playVictoryFanfare();

      // EXECUTE GAME RULES:
      if (winningPenalty.id === 'bonus_all') {
        // RULE 1: CẢ BÀN CÙNG DÔ -> All players in the session gain +1 shot!
        setPlayers(prev => applyCaBanRule(prev));
        setSelectedPlayer(prev => prev ? { ...prev, shotsCount: prev.shotsCount + 1 } : null);
        setStage('RESULT');
      } else if (winningPenalty.id === 'bonus_swap' && delegateCandidates.length > 0) {
        // RULE 2: UỐNG HỘ -> Open Wheel 3 to spin among the other players!
        setStage('WHEEL_DELEGATE');
      } else {
        // Normal shot penalty: target player drinks
        if (selectedPlayer) {
          setPlayers(prev => applyStandardPenalty(prev, selectedPlayer.id, winningPenalty.shots));
          setSelectedPlayer(prev => prev ? { ...prev, shotsCount: prev.shotsCount + winningPenalty.shots } : null);
        }
        setStage('RESULT');
      }
    }, 4600);
  };

  // ==========================================================
  // SPIN WHEEL 3: DELEGATE WHEEL ("UỐNG HỘ")
  // ==========================================================
  const handleSpinDelegateWheel = () => {
    if (isSpinning || delegateCandidates.length === 0) return;
    setIsSpinning(true);
    setDelegatedPlayer(null);
    setSelectedDelegateIndex(null);

    const totalSegs = delegateCandidates.length;
    // Pick random delegate from the candidates
    const winningIndex = Math.floor(Math.random() * totalSegs);
    const chosenDelegate = delegateCandidates[winningIndex];

    const nextAngle = calculateNextWheelAngle(delegateWheelAngle, winningIndex, totalSegs, 6);

    startTickingSound(4500);
    setDelegateWheelAngle(nextAngle);

    setTimeout(() => {
      stopTickingSound();
      setIsSpinning(false);
      setDelegatedPlayer(chosenDelegate);
      setSelectedDelegateIndex(winningIndex);
      playGlassClink();
      playVictoryFanfare();

      // Assigned delegate takes the 1 shot penalty!
      setPlayers(prev => applyDelegatePenalty(prev, chosenDelegate.id, 1));

      setStage('RESULT');
    }, 4600);
  };

  // PROCEED TO NEXT ROUND
  const handleNextRound = () => {
    setRoundNumber(prev => prev + 1);
    setSelectedPlayer(null);
    setDelegatedPlayer(null);
    setCurrentPenalty(null);
    setSelectedPlayerIndex(null);
    setSelectedShotIndex(null);
    setSelectedDelegateIndex(null);
    setStage('WHEEL_PLAYER');
  };

  // RESET GAMEPLAY OR GO TO SETUP
  const handleGoToSetup = () => {
    setStage('SETUP');
  };

  // RESET ENTIRE SCOREBOARD WITH CONFIRMATION SHIELD
  const handleResetScores = () => {
    openConfirmModal({
      title: 'Đặt Lại Điểm Bàn Nhậu',
      message: 'Bạn có chắc chắn muốn xóa toàn bộ số shot đã uống và đưa điểm số của tất cả thành viên về 0?',
      confirmLabel: 'Đặt Lại Điểm',
      cancelLabel: 'Giữ Lại Điểm',
      isDanger: true,
      onConfirm: () => {
        setPlayers(prev => prev.map(p => ({ ...p, shotsCount: 0 })));
        setRoundNumber(1);
        showToast('🔄 Đã đặt lại điểm số bàn nhậu về 0!');
      }
    });
  };

  // Leaderboard sorted by highest shots
  const sortedPlayers = useMemo(() => {
    return rankPlayersByShots(players);
  }, [players]);

  const displayedPlayers = useMemo(() => {
    return showAllLeaderboard ? sortedPlayers : sortedPlayers.slice(0, 3);
  }, [sortedPlayers, showAllLeaderboard]);

  const randomQuote = useMemo(() => {
    return FUN_QUOTES[Math.floor(Math.random() * FUN_QUOTES.length)];
  }, [roundNumber]);

  const totalShots = useMemo(() => {
    return players.reduce((sum, p) => sum + p.shotsCount, 0);
  }, [players]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSpinning) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER BAR */}
        <div className="px-4 py-3 bg-[#FAF8F5] dark:bg-[#121110] border-b border-[#E8E2D8] dark:border-[#252220] flex items-center justify-between gap-2.5">
          {/* Left: Back to Minigame Hub & Title */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              type="button"
              onClick={handleBackToHub}
              disabled={isSpinning}
              className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white flex items-center justify-center shrink-0 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              title="Quay lại danh sách minigame"
              aria-label="Quay lại danh sách minigame"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-black text-stone-900 dark:text-white truncate leading-snug">
                  Vòng Quay Bàn Nhậu
                </h2>
                <span className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-full bg-rose-500 text-white shrink-0 shadow-xs">
                  HOT
                </span>
              </div>
              <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 truncate">
                {stage === 'SETUP' && 'Cài đặt người chơi & số shot phạt'}
                {stage === 'WHEEL_PLAYER' && `Vòng ${roundNumber}: Quay chọn người uống 🎯`}
                {stage === 'PLAYER_SELECTED' && `Đã chọn: ${selectedPlayer?.name}!`}
                {stage === 'WHEEL_SHOTS' && `Quay số shot phạt cho ${selectedPlayer?.name}`}
                {stage === 'WHEEL_DELEGATE' && `Quay chọn người uống hộ cho ${selectedPlayer?.name} 🤝`}
                {stage === 'RESULT' && `Kết quả Vòng ${roundNumber} 🍻`}
              </p>
            </div>
          </div>

          {/* Right: Sound toggle & Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleSound}
              className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center transition-colors cursor-pointer"
              title={isSoundMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              aria-label="Bật/Tắt âm thanh"
            >
              {isSoundMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSpinning}
              className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
              title="Đóng game"
              aria-label="Đóng game"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BODY CONTENT (STAGE ROUTING) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] space-y-4">

          {/* ========================================================== */}
          {/* STAGE: SETUP (Add Players & Set Shot Range) */}
          {/* ========================================================== */}
          {stage === 'SETUP' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Section 1: Player Roster */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-500" />
                    Danh Sách Người Chơi ({players.length})
                  </span>
                  <span className="text-[10.5px] text-slate-400 font-medium">Tối thiểu 2 người</span>
                </div>

                {/* Input Add Player */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                    placeholder="Nhập tên người chơi (vd: Nam, Linh...)"
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    maxLength={18}
                  />
                  <button
                    type="button"
                    onClick={handleAddPlayer}
                    disabled={!newPlayerName.trim()}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm
                  </button>
                </div>

                {/* Quick Add Suggestions */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">Gợi ý nhanh:</span>
                  {['+ Tôi', '+ Bạn Thân', '+ Sếp', '+ Đồng Nghiệp', '+ Vợ Yêu'].map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const cleanName = sug.replace('+ ', '');
                        const nextColor = PLAYER_PALETTE[players.length % PLAYER_PALETTE.length];
                        setPlayers(prev => [...prev, {
                          id: `p_${Date.now()}_${idx}`,
                          name: cleanName,
                          color: nextColor,
                          shotsCount: 0
                        }]);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10.5px] font-semibold text-slate-600 dark:text-slate-300 hover:border-amber-400 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>

                {/* Player Chips Grid */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {players.map((p) => (
                    <div 
                      key={p.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: p.color }} 
                      />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {p.name}
                      </span>
                      {players.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePlayer(p.id)}
                          className="text-slate-400 hover:text-rose-500 p-0.5 ml-0.5"
                          title="Xóa người chơi"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Shot Range Configuration */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    Khoảng Shot Phạt ({minShots} đến {maxShots} Shot)
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Nhẹ nhàng', min: 1, max: 2, badge: '1 - 2' },
                    { label: 'Vừa phải', min: 1, max: 3, badge: '1 - 3' },
                    { label: 'Tới bến', min: 1, max: 5, badge: '1 - 5' },
                  ].map((preset, idx) => {
                    const isSelected = minShots === preset.min && maxShots === preset.max;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyPreset(preset.min, preset.max)}
                        className={`p-2 rounded-xl text-center border transition-all ${
                          isSelected 
                            ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400 font-extrabold shadow-sm' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400'
                        }`}
                      >
                        <div className="text-[10px] uppercase tracking-wider">{preset.label}</div>
                        <div className="text-xs font-black mt-0.5">{preset.badge} shots</div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Min / Max Steppers */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tối thiểu:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMinShots(Math.max(1, minShots - 1))}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-xs flex items-center justify-center hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-amber-500">{minShots}</span>
                      <button
                        type="button"
                        onClick={() => setMinShots(Math.min(maxShots, minShots + 1))}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-xs flex items-center justify-center hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tối đa:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMaxShots(Math.max(minShots, maxShots - 1))}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-xs flex items-center justify-center hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-rose-500">{maxShots}</span>
                      <button
                        type="button"
                        onClick={() => setMaxShots(Math.min(8, maxShots + 1))}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-xs flex items-center justify-center hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bonus Toggle */}
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={includeBonusSlots}
                    onChange={(e) => setIncludeBonusSlots(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 dark:border-slate-700"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Bao gồm ô may mắn (0 shot) & ô bất ngờ (uống hộ, cả bàn dô) 🍀
                  </span>
                </label>
              </div>

              {/* Start Button */}
              <button
                type="button"
                onClick={() => {
                  setStage('WHEEL_PLAYER');
                  setSelectedPlayer(null);
                  setDelegatedPlayer(null);
                  setCurrentPenalty(null);
                }}
                disabled={players.length < 2}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Beer className="w-4 h-4" />
                BẮT ĐẦU VÒNG QUAY BÀN NHẬU
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ========================================================== */}
          {/* STAGE: WHEEL_PLAYER & PLAYER_SELECTED (Wheel 1) */}
          {/* ========================================================== */}
          {(stage === 'WHEEL_PLAYER' || stage === 'PLAYER_SELECTED') && (
            <div className="space-y-4 animate-fadeIn flex flex-col items-center w-full">
              {/* Header Info */}
              <div className="w-full text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  VÒNG 1: CHỌN NẠN NHÂN BÀN NHẬU
                </span>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                  Ai sẽ là người tiếp theo cạn ly?
                </h3>
              </div>

              {/* The Player Wheel */}
              <RouletteWheel
                segments={playerSegments}
                isSpinning={isSpinning}
                rotationAngle={playerWheelAngle}
                onSpin={handleSpinPlayerWheel}
                disabled={stage === 'PLAYER_SELECTED'}
                size={290}
                centerLabel="QUAY"
                isResultHighlighted={stage === 'PLAYER_SELECTED'}
                selectedIndex={selectedPlayerIndex}
              />

              {/* Status / Proceed button */}
              {stage === 'WHEEL_PLAYER' && (
                <button
                  type="button"
                  onClick={handleSpinPlayerWheel}
                  disabled={isSpinning}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:opacity-95 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4" />
                  {isSpinning ? 'ĐANG QUAY VÒNG...' : 'BẤM ĐỂ QUAY CHỌN NGƯỜI 🎯'}
                </button>
              )}

              {stage === 'PLAYER_SELECTED' && selectedPlayer && (
                <div className="w-full space-y-3 animate-slideUp">
                  {/* Selected Player Announcement Box */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 border-2 border-amber-500/40 text-center space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                      THẦN CỒN GỌI TÊN
                    </span>
                    <div className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
                      <span 
                        className="w-3.5 h-3.5 rounded-full" 
                        style={{ backgroundColor: selectedPlayer.color }} 
                      />
                      {selectedPlayer.name}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Bây giờ, hãy quay bánh xe thứ 2 để xem bạn phải uống mấy shot! 🍻
                    </p>
                  </div>

                  {/* Proceed to Shot Wheel CTA */}
                  <button
                    type="button"
                    onClick={handleProceedToShotWheel}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    TIẾP TỤC: QUAY SỐ SHOT PHẠT
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* STAGE: WHEEL_SHOTS (Wheel 2: Number of shots) */}
          {/* ========================================================== */}
          {stage === 'WHEEL_SHOTS' && (
            <div className="space-y-4 animate-fadeIn flex flex-col items-center w-full">
              {/* Header Info */}
              <div className="w-full text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-rose-500 flex items-center justify-center gap-1">
                  <Beer className="w-3.5 h-3.5 animate-bounce" />
                  VÒNG 2: SỐ LƯỢNG SHOT PHẢI CẠN
                </span>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5">
                  Hình phạt cho: 
                  <span className="text-amber-500 underline underline-offset-4">
                    {selectedPlayer?.name}
                  </span>
                </h3>
              </div>

              {/* The Shot Wheel */}
              <RouletteWheel
                segments={shotSegments}
                isSpinning={isSpinning}
                rotationAngle={shotWheelAngle}
                onSpin={handleSpinShotWheel}
                size={290}
                centerLabel="QUAY"
                isResultHighlighted={false}
                selectedIndex={selectedShotIndex}
              />

              {/* Spin button */}
              <button
                type="button"
                onClick={handleSpinShotWheel}
                disabled={isSpinning}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 hover:opacity-95 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Beer className="w-4 h-4" />
                {isSpinning ? 'ĐANG QUAY SỐ SHOT...' : 'BẤM ĐỂ QUAY SỐ SHOT 🍻'}
              </button>
            </div>
          )}

          {/* ========================================================== */}
          {/* STAGE: WHEEL_DELEGATE (Wheel 3: Who drinks on behalf) */}
          {/* ========================================================== */}
          {stage === 'WHEEL_DELEGATE' && selectedPlayer && (
            <div className="space-y-4 animate-fadeIn flex flex-col items-center w-full">
              {/* Header Info */}
              <div className="w-full text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-purple-500 flex items-center justify-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 animate-bounce" />
                  VÒNG 3: AI SẼ LÀ NGƯỜI UỐNG HỘ?
                </span>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="text-amber-500">{selectedPlayer.name}</span>
                  <span>quay trúng ô "Uống Hộ"!</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Quay bánh xe để chọn người chịu 1 shot phạt thay cho {selectedPlayer.name}:
                </p>
              </div>

              {/* The Delegate Wheel */}
              <RouletteWheel
                segments={delegateSegments}
                isSpinning={isSpinning}
                rotationAngle={delegateWheelAngle}
                onSpin={handleSpinDelegateWheel}
                size={290}
                centerLabel="QUAY"
                isResultHighlighted={false}
                selectedIndex={selectedDelegateIndex}
              />

              {/* Spin button */}
              <button
                type="button"
                onClick={handleSpinDelegateWheel}
                disabled={isSpinning}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:opacity-95 text-white font-black text-sm uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Beer className="w-4 h-4" />
                {isSpinning ? 'ĐANG QUAY CHỌN NGƯỜI UỐNG HỘ...' : 'BẤM ĐỂ CHỌN NGƯỜI UỐNG HỘ 🤝'}
              </button>
            </div>
          )}

          {/* ========================================================== */}
          {/* STAGE: RESULT (Verdict & Drinking Celebration) */}
          {/* ========================================================== */}
          {stage === 'RESULT' && currentPenalty && selectedPlayer && (
            <div className="space-y-4 animate-fadeIn">
              {/* Giant Result Card */}
              <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-b from-amber-500/20 via-rose-500/20 to-slate-900 border-2 border-amber-400 text-center space-y-2 shadow-2xl">
                {/* Floating Confetti Sparks */}
                <div className="text-3xl animate-bounce">
                  {currentPenalty.id === 'bonus_all' ? '🍻🎉🍻' : currentPenalty.id === 'bonus_swap' ? '🤝👑🍺' : currentPenalty.shots === 0 ? '🍀🎉🍀' : '🍻💥🥃'}
                </div>

                <span className="text-xs font-extrabold uppercase tracking-widest text-amber-500">
                  {currentPenalty.id === 'bonus_all' 
                    ? 'THẦN CỒN TRIỆU TẬP • CẢ BÀN CÙNG DÔ'
                    : currentPenalty.id === 'bonus_swap'
                    ? 'CHỈ ĐỊNH THÀNH CÔNG • UỐNG HỘ'
                    : currentPenalty.shots === 0 
                    ? 'MAY MẮN THOÁT NẠN!' 
                    : 'HÌNH PHẠT BÀN NHẬU'}
                </span>

                <h3 className="text-2xl font-black text-white leading-tight">
                  {currentPenalty.id === 'bonus_all' ? (
                    <span className="text-rose-400">
                      CẢ BÀN CÙNG NÂNG LY!
                      <br />
                      <span className="text-amber-300 text-lg">MỖI NGƯỜI UỐNG 1 SHOT!</span>
                    </span>
                  ) : currentPenalty.id === 'bonus_swap' && delegatedPlayer ? (
                    <span>
                      <span className="text-amber-300">{selectedPlayer.name}</span>
                      <span className="text-white text-base"> đã chỉ định </span>
                      <br />
                      <span className="text-purple-300">{delegatedPlayer.name}</span>
                      <span className="text-rose-400"> UỐNG HỘ 1 SHOT!</span>
                    </span>
                  ) : currentPenalty.shots === 0 ? (
                    <span>
                      <span className="text-amber-300">{selectedPlayer.name}</span>
                      <br />
                      <span className="text-emerald-400">ĐƯỢC MIỄN UỐNG (0 SHOT)!</span>
                    </span>
                  ) : (
                    <span>
                      <span className="text-amber-300">{selectedPlayer.name}</span>
                      <br />
                      <span className="text-rose-400">PHẢI UỐNG {currentPenalty.label.toUpperCase()}!</span>
                    </span>
                  )}
                </h3>

                <p className="text-xs font-bold text-slate-200">
                  {currentPenalty.id === 'bonus_all'
                    ? 'Không sót một ai! Tất cả thành viên trong bàn đều được +1 shot vào bảng điểm!'
                    : currentPenalty.id === 'bonus_swap' && delegatedPlayer
                    ? `${delegatedPlayer.name} nhận 1 shot phạt thay cho bạn hiền! Đồng cam cộng khổ! 🍻`
                    : currentPenalty.sublabel}
                </p>

                <div className="pt-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-950/60 border border-white/20 text-[11px] font-medium text-amber-200 italic">
                    "{randomQuote}"
                  </span>
                </div>
              </div>

              {/* Session Scoreboard / Leaderboard */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 truncate">
                      Nhật Ký Bàn Nhậu
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 shrink-0">
                      Top {Math.min(3, sortedPlayers.length)}{sortedPlayers.length > 3 && !showAllLeaderboard ? ` / ${sortedPlayers.length}` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetScores}
                    className="text-[10.5px] font-semibold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                  >
                    Đặt lại điểm
                  </button>
                </div>

                {/* Top 3 Highlighted & Scrollable List */}
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto overscroll-contain pr-0.5 select-none">
                  {displayedPlayers.map((p, idx) => {
                    const isTop1 = idx === 0 && p.shotsCount > 0;
                    const isTop3 = idx < 3;

                    return (
                      <div 
                        key={p.id}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                          isTop1
                            ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/70 shadow-2xs'
                            : isTop3
                              ? 'bg-white dark:bg-slate-900 border-amber-200/60 dark:border-slate-700/80 shadow-2xs'
                              : 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/40 opacity-80'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-[11px] font-black w-4 text-center shrink-0 ${
                            idx === 0
                              ? 'text-amber-500 font-black'
                              : idx === 1
                                ? 'text-slate-400 dark:text-slate-300'
                                : idx === 2
                                  ? 'text-amber-700 dark:text-amber-500'
                                  : 'text-slate-400'
                          }`}>
                            #{idx + 1}
                          </span>
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                            style={{ backgroundColor: p.color }} 
                          />
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            {p.name}
                          </span>
                          {isTop1 && (
                            <span className="text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center gap-0.5 shrink-0">
                              👑 Dẫn đầu
                            </span>
                          )}
                        </div>
                        <span className={`font-black shrink-0 ${p.shotsCount > 0 ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
                          {p.shotsCount} shot
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Show All / Collapse Toggle Button */}
                {sortedPlayers.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllLeaderboard(prev => !prev)}
                    className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
                  >
                    <span>{showAllLeaderboard ? 'Thu gọn (Top 3)' : `Xem tất cả (${sortedPlayers.length} người chơi)`}</span>
                    <span className="text-[10px]">{showAllLeaderboard ? '▲' : '▼'}</span>
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleGoToSetup}
                  className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Cài Đặt Người Chơi
                </button>
                <button
                  type="button"
                  onClick={handleNextRound}
                  className="py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  VÒNG TIẾP THEO 🔄
                </button>
              </div>

              {/* Secondary Navigation Actions: Round Summary & Back to Minigame */}
              <div className="space-y-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setIsRoundSummaryOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer select-none"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Tổng Kết Vòng</span>
                </button>

                <button
                  type="button"
                  onClick={handleBackToHub}
                  className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold text-[11.5px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay Lại Sảnh Minigame</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ROUND SUMMARY MODAL */}
      {isRoundSummaryOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none"
          onClick={() => setIsRoundSummaryOpen(false)}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-[#1A1918] border border-[#E8E2D8] dark:border-[#252220] rounded-3xl shadow-2xl p-4 sm:p-5 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 text-sm">
                  📊
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Tổng Kết Vòng {roundNumber}
                  </h3>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Chi tiết vòng đấu & thống kê bàn nhậu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRoundSummaryOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Round Penalty Spotlight */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Kết Quả Vừa Xảy Ra (Vòng {roundNumber})
              </span>
              <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                {selectedPlayer?.name || 'Chưa xác định'}: {currentPenalty?.label || `${currentPenalty?.shots || 0} shot`}
              </div>
              {delegatedPlayer && (
                <p className="text-[11px] font-semibold text-rose-500">
                  🤝 {delegatedPlayer.name} đã uống hộ 1 shot!
                </p>
              )}
            </div>

            {/* Session Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                  Tổng Shot Đã Uống
                </span>
                <span className="text-base font-black text-rose-500">
                  {totalShots} shot
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                  Số Vòng Đã Chơi
                </span>
                <span className="text-base font-black text-amber-500">
                  {roundNumber} vòng
                </span>
              </div>
            </div>

            {/* Full Player Standings */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Bảng Điểm Toàn Bộ Người Chơi ({sortedPlayers.length})
              </span>
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto overscroll-contain pr-0.5">
                {sortedPlayers.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[11px] font-black w-4 text-center shrink-0 ${
                        idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400 dark:text-slate-300' : idx === 2 ? 'text-amber-700 dark:text-amber-500' : 'text-slate-400'
                      }`}>
                        #{idx + 1}
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {p.name}
                      </span>
                      {idx === 0 && p.shotsCount > 0 && (
                        <span className="text-amber-500 font-bold text-[10px] flex items-center gap-0.5 shrink-0">
                          👑 Thần cồn
                        </span>
                      )}
                    </div>
                    <span className="font-black text-rose-500 shrink-0">
                      {p.shotsCount} shot
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsRoundSummaryOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-stone-100 text-white dark:text-stone-900 font-black text-xs transition-transform active:scale-98 cursor-pointer select-none"
            >
              Đóng & Tiếp Tục Cuộc Vui
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
