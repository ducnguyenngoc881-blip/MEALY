import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  X, 
  Smartphone, 
  Download, 
  Sparkles, 
  Refrigerator, 
  Calendar, 
  UtensilsCrossed, 
  Share2, 
  ShieldCheck,
  Apple,
  Star,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  FolderDown,
  FileText,
  Copy,
  Check,
  Send
} from 'lucide-react';

interface StorePosterItem {
  id: string;
  slide: number;
  pill: string;
  title: string;
  subtitle: string;
  posterSrc: string;
  fallbackSrc: string;
  badges: string[];
}

const STORE_POSTERS: StorePosterItem[] = [
  {
    id: 'poster-01-mam-com-3-mon',
    slide: 1,
    pill: 'Mâm Cơm Hôm Nay',
    title: 'Trợ lý thực đơn & mâm cơm gia đình',
    subtitle: 'Tự động gợi ý bộ 3 món Mặn, Canh, Rau đủ chất và tiết kiệm chi phí mỗi ngày.',
    posterSrc: '/store-assets/posters/poster-01-mam-com-3-mon.png',
    fallbackSrc: '/store-assets/raw-screens/01_screen_mam_com_3_mon.png',
    badges: ['Ứng Dụng Gia Đình Xuất Sắc 2026', 'Cân đối dinh dưỡng tự động']
  },
  {
    id: 'poster-02-thuc-don-tuan',
    slide: 2,
    pill: 'Thực Đơn Cả Tuần',
    title: 'Lên lịch 7 ngày trong 1 lần chạm',
    subtitle: 'Tối ưu thực đơn theo khẩu vị vùng miền Bắc, Trung, Nam và kiểm soát trọn vẹn ngân sách.',
    posterSrc: '/store-assets/posters/poster-02-thuc-don-tuan.png',
    fallbackSrc: '/store-assets/raw-screens/02_screen_thuc_don_tuan.png',
    badges: ['Hơn 45.000+ đánh giá 5 sao', 'Khớp ngân sách gia đình']
  },
  {
    id: 'poster-03-di-cho-chung',
    slide: 3,
    pill: 'Đi Chợ Thông Minh',
    title: 'Đi chợ chung thời gian thực',
    subtitle: 'Tự động gom nguyên liệu theo từng quầy hàng tại chợ, đồng bộ tức thì giỏ hàng giữa các thành viên.',
    posterSrc: '/store-assets/posters/poster-03-di-cho-chung.png',
    fallbackSrc: '/store-assets/raw-screens/03_screen_di_cho_chung.png',
    badges: ['Phòng mua chung trực tiếp', 'Tự động phân loại theo quầy']
  },
  {
    id: 'poster-04-tu-lanh-thong-minh',
    slide: 4,
    pill: 'Tủ Lạnh Thông Minh',
    title: 'Nhắc hạn tủ lạnh thông minh',
    subtitle: 'Quản lý hạn dùng thực phẩm, nhận cảnh báo trước khi ôi thiu và gợi ý món ngon vét sạch tủ lạnh.',
    posterSrc: '/store-assets/posters/poster-04-tu-lanh-thong-minh.png',
    fallbackSrc: '/store-assets/raw-screens/04_screen_tu_lanh_thong_minh.png',
    badges: ['Cảnh báo hạn dùng thông minh', 'Không bao giờ quên đồ trong tủ']
  },
  {
    id: 'poster-05-cong-thuc-chuan-vi',
    slide: 5,
    pill: 'Công Thức Chuẩn Vị',
    title: 'Nấu ăn thảnh thơi từng bước chuẩn vị',
    subtitle: 'Định lượng chính xác từng muỗng thìa, tự tay đánh dấu sơ chế và hẹn giờ thông minh ngay trên bếp.',
    posterSrc: '/store-assets/posters/poster-05-cong-thuc-chuan-vi.png',
    fallbackSrc: '/store-assets/raw-screens/05_screen_so_tay_cong_thuc.png',
    badges: ['Định lượng thìa muỗng chuẩn gia đình', 'Hẹn giờ nấu ăn thông minh']
  },
  {
    id: 'poster-06-mam-co-tiec',
    slide: 6,
    pill: 'Tiệc Vui Sum Vầy',
    title: 'Trọn vẹn hương vị mâm cỗ sum vầy',
    subtitle: 'Hơn 50 bộ thực đơn liên hoan, ẩm thực 3 miền và lưu trữ đồng bộ đám mây trên cả iOS và Android.',
    posterSrc: '/store-assets/posters/poster-06-mam-co-tiec.png',
    fallbackSrc: '/store-assets/raw-screens/06_screen_tiec_gia_dinh.png',
    badges: ['50+ thực đơn đãi tiệc phong phú', 'Đồng bộ iOS & Android tức thì']
  }
];

const STORE_REVIEWS = [
  {
    id: 'rev-1',
    author: 'Chị Minh Anh',
    role: 'Gia đình 4 người',
    location: 'TP. Hồ Chí Minh',
    rating: 5,
    content: 'Ứng dụng này đã thay đổi hoàn toàn căn bếp nhà mình. Bộ 3 món mặn canh rau nấu rất vừa miệng cả nhà, chi phí đi chợ giảm hẳn.'
  },
  {
    id: 'rev-2',
    author: 'Anh Minh Đức',
    role: 'Kỹ sư công nghệ',
    location: 'Đà Nẵng',
    rating: 5,
    content: 'Tính năng đi chợ chung cực kỳ tiện lợi. Vợ ở nhà thêm món vào giỏ, mình đi chợ nhìn danh sách chia theo từng quầy rau thịt là mua nhoáng cái xong.'
  }
];

export const DownloadAppModal: React.FC = () => {
  // All React Hooks placed unconditionally at top
  const { 
    isDownloadAppModalOpen, 
    closeDownloadAppModal, 
    downloadAppFeatureName 
  } = useMealWise();

  const [activePlatformTab, setActivePlatformTab] = useState<'apple' | 'google'>('apple');
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [lightboxPosterIndex, setLightboxPosterIndex] = useState<number | null>(null);
  const [isKitOpen, setIsKitOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lightboxPosterIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxPosterIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxPosterIndex(prev => (prev !== null && prev > 0 ? prev - 1 : STORE_POSTERS.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxPosterIndex(prev => (prev !== null && prev < STORE_POSTERS.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxPosterIndex]);

  const scrollToSlide = useCallback((index: number) => {
    setActiveSlide(index);
    if (carouselRef.current) {
      const cardWidth = 252;
      carouselRef.current.scrollTo({
        left: index * (cardWidth + 14),
        behavior: 'smooth'
      });
    }
  }, []);

  const handleNextSlide = useCallback(() => {
    const next = (activeSlide + 1) % STORE_POSTERS.length;
    scrollToSlide(next);
  }, [activeSlide, scrollToSlide]);

  const handlePrevSlide = useCallback(() => {
    const prev = (activeSlide - 1 + STORE_POSTERS.length) % STORE_POSTERS.length;
    scrollToSlide(prev);
  }, [activeSlide, scrollToSlide]);

  // Unified primary install action that works on both iOS and Android tabs
  const handleUnifiedInstallAction = useCallback(() => {
    setDownloadStarted(true);
    if (activePlatformTab === 'google') {
      const link = document.createElement('a');
      link.href = '/MealWise.apk';
      link.download = 'Mealy.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setShowIosGuide(prev => !prev);
    }
    setTimeout(() => setDownloadStarted(false), 3500);
  }, [activePlatformTab]);

  const handleCopyManifest = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/store-assets/manifest.json`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }, []);

  // Conditional early return ONLY after all hooks
  if (!isDownloadAppModalOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-[95] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
        onClick={closeDownloadAppModal}
        role="dialog"
        aria-modal="true"
      >
        <div 
          className="bg-[#09090B] border border-zinc-800/90 rounded-[32px] max-w-xl w-full p-4 sm:p-5 shadow-2xl space-y-4 max-h-[93vh] overflow-y-auto animate-scale-up text-zinc-100"
          onClick={e => e.stopPropagation()}
        >
          {/* Top Store Navigation Bar (Matching User's Reference Store Header) */}
          <div className="flex items-center justify-between gap-2 pb-2">
            <button
              type="button"
              onClick={closeDownloadAppModal}
              className="flex items-center gap-1 text-blue-500 hover:text-blue-400 font-semibold text-sm transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 -ml-1" />
              <span>Ứng Dụng</span>
            </button>

            {/* Centered Mini App Squircle Icon */}
            <div className="w-11 h-11 rounded-2xl overflow-hidden border border-zinc-700/80 shadow-lg bg-zinc-900 shrink-0">
              <img 
                src="/store-assets/icons/app-icon-512.png" 
                alt="Mealy"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.indexOf('nano-app-icon.jpg') === -1) {
                    target.src = '/store-assets/nano-app-icon.jpg';
                  }
                }}
              />
            </div>

            {/* Right Action Pill Button ("Nhận" / "Cài Đặt") */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[10px] text-zinc-400 text-right leading-tight">
                Miễn phí<br />Trọn đời
              </span>
              <button
                type="button"
                onClick={handleUnifiedInstallAction}
                className="px-5 py-1.5 rounded-full bg-[#007AFF] hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/25 active:scale-95 transition-all cursor-pointer"
              >
                {downloadStarted ? '✓ Đã chọn' : 'Nhận'}
              </button>
            </div>
          </div>

          {/* Unified iOS & Android Store Switcher (Both stores share identical layout & posters) */}
          <div className="flex rounded-2xl bg-zinc-900/90 p-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => setActivePlatformTab('apple')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activePlatformTab === 'apple'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Apple className="w-4 h-4" />
              <span>Apple App Store</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/80 font-mono text-zinc-200">
                iOS
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatformTab('google')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activePlatformTab === 'google'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Google Play</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 font-mono text-emerald-300 border border-emerald-800/50">
                CH Play
              </span>
            </button>
          </div>

          {/* Feature Lock Notice (if opened from a locked guest feature) */}
          {downloadAppFeatureName && (
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-[12px]">
                <span>🔒</span>
                <span>Tính năng tối ưu trên bản Di Động</span>
              </div>
              <p className="text-[11px] text-amber-300/90 leading-relaxed">
                Tính năng <strong className="underline">{downloadAppFeatureName}</strong> được đồng bộ đầy đủ trên ứng dụng di động Mealy cho cả iOS và Android.
              </p>
            </div>
          )}

          {/* Optional iOS Safari Quick-Add Guide when "Nhận" is tapped on iOS tab */}
          {showIosGuide && activePlatformTab === 'apple' && (
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-blue-500/40 space-y-2 text-xs animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="font-bold text-blue-400 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4" />
                  <span>Cài đặt Mealy lên màn hình chính iPhone &amp; Android:</span>
                </p>
                <button
                  type="button"
                  onClick={() => setShowIosGuide(false)}
                  className="text-zinc-400 hover:text-white text-xs cursor-pointer"
                >
                  Đóng
                </button>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-300 leading-relaxed">
                <li>Nhấn nút <strong>Chia sẻ 📤</strong> trên trình duyệt di động hoặc tải tệp APK trực tiếp bên dưới.</li>
                <li>Chọn <strong>&quot;Thêm vào Màn hình chính&quot; ➕</strong> để mở Mealy toàn màn hình như ứng dụng gốc.</li>
              </ol>
            </div>
          )}

          {/* Unified 4-Column Store Metrics Strip (Identical for iOS & Android, matching Reference Screenshot) */}
          <div className="grid grid-cols-4 divide-x divide-zinc-800 border-y border-zinc-800/90 py-3 text-center">
            <div className="px-1 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                45.2K ĐÁNH GIÁ
              </span>
              <span className="text-xl font-black text-zinc-100 mt-0.5">4.9</span>
              <div className="flex items-center gap-0.5 mt-0.5 text-zinc-300">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-zinc-300 text-zinc-300" />
                ))}
              </div>
            </div>

            <div className="px-1 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                ĐỘ TUỔI
              </span>
              <span className="text-xl font-black text-zinc-100 mt-0.5">4+</span>
              <span className="text-[11px] text-zinc-400 mt-0.5">Tuổi</span>
            </div>

            <div className="px-1 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                DANH MỤC
              </span>
              <Send className="w-5 h-5 text-zinc-300 my-1 -rotate-12" />
              <span className="text-[11px] text-zinc-400">Ẩm thực</span>
            </div>

            <div className="px-1 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                NHÀ PHÁT TRIỂN
              </span>
              <span className="text-sm font-black text-zinc-200 my-1">MealWise</span>
              <span className="text-[11px] text-zinc-400">iOS &amp; Android</span>
            </div>
          </div>

          {/* Horizontal Store Poster Carousel (Clean Rounded Cards Showing Full Pastel Artwork) */}
          <div className="space-y-2.5">
            <div 
              ref={carouselRef}
              className="flex gap-3.5 overflow-x-auto pb-2 pt-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {STORE_POSTERS.map((poster, index) => (
                <div 
                  key={poster.id}
                  onClick={() => setLightboxPosterIndex(index)}
                  className="shrink-0 w-[248px] sm:w-[264px] snap-start rounded-[28px] overflow-hidden border border-zinc-800/80 bg-[#EEF2FF] shadow-xl hover:scale-[1.01] transition-all duration-300 cursor-pointer group relative"
                >
                  <div className="relative w-full aspect-[9/19.5] overflow-hidden">
                    <img 
                      src={poster.posterSrc} 
                      alt={poster.title}
                      className="w-full h-full object-cover"
                      loading="eager"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.indexOf(poster.fallbackSrc) === -1) {
                          target.src = poster.fallbackSrc;
                        }
                      }}
                    />
                    <span className="absolute top-3 right-3 p-1.5 rounded-full bg-black/35 text-white opacity-0 group-hover:opacity-100 backdrop-blur-md transition-opacity">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Controls & Device Compatibility Strip (Matching Reference Bottom Bar) */}
            <div className="flex items-center justify-between pt-1 px-1 text-zinc-400 text-xs">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-zinc-400" />
                <span className="font-medium text-[12px] text-zinc-400">
                  Đồng bộ iPhone, iPad &amp; Điện thoại Android
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono text-zinc-400 px-1">
                  {activeSlide + 1}/{STORE_POSTERS.length}
                </span>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
                  aria-label="Ảnh tiếp theo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Unified Direct Download & Store Kit Section */}
          <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-900/70">
            <button
              type="button"
              onClick={() => setIsKitOpen(!isKitOpen)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zinc-800/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FolderDown className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-xs font-black text-white">
                    Tải Bộ Nhận Diện &amp; Hình Ảnh Cửa Hàng
                  </p>
                  <p className="text-[10.5px] text-zinc-400">
                    6 áp phích chuẩn 1290x2796 dùng chung cho cả App Store &amp; CH Play
                  </p>
                </div>
              </div>

              <span className={`text-xs text-zinc-400 transform transition-transform ${isKitOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {isKitOpen && (
              <div className="p-3.5 border-t border-zinc-800 space-y-3 bg-zinc-950 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="/store-assets/icons/app-icon-1024.png"
                    download="Mealy-App-Icon-1024.png"
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 font-bold text-zinc-200 flex items-center justify-between transition-colors"
                  >
                    <span>Biểu tượng iOS 1024x1024</span>
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                  </a>

                  <a
                    href="/store-assets/icons/app-icon-512.png"
                    download="Mealy-App-Icon-512.png"
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 font-bold text-zinc-200 flex items-center justify-between transition-colors"
                  >
                    <span>Biểu tượng CH Play 512x512</span>
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                  </a>

                  <a
                    href="/store-assets/feature-graphic/feature-graphic-1024x500.png"
                    download="Mealy-Feature-Graphic-1024x500.png"
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 font-bold text-zinc-200 flex items-center justify-between transition-colors sm:col-span-2"
                  >
                    <span>Ảnh bìa nổi bật 1024x500 PNG</span>
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                  </a>
                </div>

                <div className="pt-1 space-y-1.5">
                  <p className="text-[10.5px] font-black uppercase text-zinc-400">
                    6 Áp Phích Dọc Đồng Nhất iOS &amp; Android (1290x2796)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {STORE_POSTERS.map((p) => (
                      <a
                        key={p.id}
                        href={p.posterSrc}
                        download={`${p.id}.png`}
                        className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-semibold text-zinc-300 flex items-center justify-between truncate"
                      >
                        <span className="truncate">Áp phích 0{p.slide}</span>
                        <Download className="w-3 h-3 text-zinc-400 ml-1 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
                  <a
                    href="/store-assets/manifest.json"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 font-bold flex items-center gap-1.5 hover:underline text-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Xem tệp kê khai manifest.json</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyManifest}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Đã chép link</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Sao chép link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Full-Screen Poster Zoom */}
      {lightboxPosterIndex !== null && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-6 bg-black/95 backdrop-blur-xl animate-fade-in"
          onClick={() => setLightboxPosterIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative max-w-md w-full h-[90vh] flex flex-col items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white">
                  {STORE_POSTERS[lightboxPosterIndex].pill}
                </span>
                <span className="text-xs text-zinc-300 truncate font-semibold">
                  {STORE_POSTERS[lightboxPosterIndex].title}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={STORE_POSTERS[lightboxPosterIndex].posterSrc}
                  download={`${STORE_POSTERS[lightboxPosterIndex].id}.png`}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Tải ảnh về máy"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxPosterIndex(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Đóng phóng to"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative w-full flex-1 rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center shadow-2xl">
              <img 
                src={STORE_POSTERS[lightboxPosterIndex].posterSrc} 
                alt={STORE_POSTERS[lightboxPosterIndex].title}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.indexOf(STORE_POSTERS[lightboxPosterIndex].fallbackSrc) === -1) {
                    target.src = STORE_POSTERS[lightboxPosterIndex].fallbackSrc;
                  }
                }}
              />

              <button
                type="button"
                onClick={() => setLightboxPosterIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : STORE_POSTERS.length - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setLightboxPosterIndex((prev) => (prev !== null && prev < STORE_POSTERS.length - 1 ? prev + 1 : 0))}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
                aria-label="Ảnh sau"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
