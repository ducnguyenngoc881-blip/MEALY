const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.resolve(__dirname, '..', 'screenshots', 'app-screens');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('Starting automated screen capture...');
  console.log('Output directory:', OUT_DIR);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();
  
  // Set mobile viewport (iPhone 16 Pro Max dimensions: 430 x 932 @ 2x pixel ratio for retina sharpness)
  await page.setViewport({
    width: 430,
    height: 932,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  // Navigate to application
  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(1000);

  // Ensure helper is loaded
  const hasHelper = await page.evaluate(() => typeof window.__mealwise !== 'undefined');
  if (!hasHelper) {
    console.error('window.__mealwise not found!');
    await browser.close();
    process.exit(1);
  }
  console.log('Connected to MealWise context helper successfully.');

  // Set theme to light initially for consistent baseline
  await page.evaluate(() => {
    window.__mealwise.setTheme('light');
    document.documentElement.classList.remove('dark');
  });
  await sleep(500);

  // Helper to capture
  async function capture(filename, description) {
    const filePath = path.join(OUT_DIR, filename);
    await sleep(700); // let animations settle
    await page.screenshot({ path: filePath, fullPage: false });
    const stat = fs.statSync(filePath);
    console.log(`[✓] Captured: ${filename} (${(stat.size / 1024).toFixed(1)} KB) - ${description}`);
  }

  // Helper to reset modals
  async function resetModals() {
    await page.evaluate(() => {
      const mw = window.__mealwise;
      if (mw.setSelectedRecipe) mw.setSelectedRecipe(null);
      if (mw.setSelectedMealSet) mw.setSelectedMealSet(null);
      if (mw.closeApexModal) mw.closeApexModal();
      if (mw.closeMinigameHub) mw.closeMinigameHub();
      if (mw.closeDrinkRoulette) mw.closeDrinkRoulette();
      if (mw.closeAuthModal) mw.closeAuthModal();
      if (mw.closeDownloadAppModal) mw.closeDownloadAppModal();
      if (mw.setIsTutorialOpen) mw.setIsTutorialOpen(false);
      if (mw.setIsShareModalOpen) mw.setIsShareModalOpen(false);
      if (mw.setShowOnboarding) mw.setShowOnboarding(false);
      if (mw.closeConfirmModal) mw.closeConfirmModal();
    });
    await sleep(400);
  }

  // 1. Thực Đơn Tuần (Weekly Plan)
  await resetModals();
  await page.evaluate(() => window.__mealwise.setActiveTab('weekly'));
  await capture('01_thuc_don_tuan.png', 'Thực Đơn Tuần (WeeklyBoard)');

  // 2. Đi Chợ Tự Động (Grocery List)
  await resetModals();
  await page.evaluate(() => window.__mealwise.setActiveTab('grocery'));
  await capture('02_di_cho_tu_dong.png', 'Đi Chợ Tự Động (GroceryList)');

  // 3. Tủ Lạnh & Đồ Thừa (Fridge & Leftovers)
  await resetModals();
  await page.evaluate(() => window.__mealwise.setActiveTab('pantry'));
  await capture('03_tu_lanh_do_thua.png', 'Tủ Lạnh & Đồ Thừa (FridgeView)');

  // 4. Sổ Tay Công Thức (Recipe Catalog)
  await resetModals();
  await page.evaluate(() => window.__mealwise.setActiveTab('recipes'));
  await capture('04_so_tay_cong_thuc.png', 'Sổ Tay Công Thức (RecipeCatalog)');

  // 5. Tài Khoản Cá Nhân (Personal Account)
  await resetModals();
  await page.evaluate(() => window.__mealwise.setActiveTab('account'));
  await capture('05_tai_khoan_ca_nhan.png', 'Tài Khoản Cá Nhân (AccountView)');

  // 6. Mâm Cơm Hôm Nay (Today Meal Sets Explorer)
  await resetModals();
  await page.evaluate(() => window.__mealwise.setActiveTab('meal-sets'));
  await capture('06_mam_com_hom_nay.png', 'Mâm Cơm Hôm Nay (MealSetExplorer)');

  // 7. Tiệc & Catering (Party & Catering Planner)
  await resetModals();
  await page.evaluate(() => window.__mealwise.setActiveTab('party'));
  await capture('07_tiec_va_catering.png', 'Tiệc & Catering (CateringPartyPlanner)');

  // 8. Bảng Quản Trị Admin (Admin Dashboard Desktop & Mobile View)
  await resetModals();
  await page.evaluate(() => {
    // Grant admin session
    window.__mealwise.loginUser({ name: 'MealWise Administrator', email: 'admin@mealwise.vn' });
  });
  await sleep(600);
  await page.evaluate(() => {
    window.__mealwise.setActiveTab('admin');
  });
  await sleep(1000);
  // Capture in mobile viewport
  await capture('08_bang_quan_tri_admin_mobile.png', 'Bảng Quản Trị (Admin Mobile View)');
  
  // Also capture in desktop viewport for full admin portal fidelity
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  await sleep(800);
  await capture('08_bang_quan_tri_admin.png', 'Bảng Quản Trị (Admin Dashboard Desktop)');
  
  // Restore mobile viewport and revert admin view
  await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.evaluate(() => {
    window.__mealwise.setActiveTab('weekly');
  });
  await sleep(600);

  // 9. Chi Tiết Công Thức (RecipeDetailModal)
  await resetModals();
  await page.evaluate(() => {
    const r = window.__mealwise.recipes[0];
    window.__mealwise.setSelectedRecipe(r);
  });
  await capture('09_chi_tiet_cong_thuc.png', 'Chi Tiết Công Thức Món Ăn (RecipeDetailModal)');

  // 10. Chi Tiết Mâm Cơm 3 Món (MealSetDetailModal)
  await resetModals();
  await page.evaluate(() => {
    const ms = window.__mealwise.mealSets[0];
    window.__mealwise.setSelectedMealSet(ms);
  });
  await capture('10_chi_tiet_mam_com_3_mon.png', 'Chi Tiết Mâm Cơm 3 Món (MealSetDetailModal)');

  // 11. Khảo Sát Khẩu Vị (OnboardingModal)
  await resetModals();
  await page.evaluate(() => {
    window.__mealwise.setShowOnboarding(true);
  });
  await capture('11_khao_sat_khau_vi_onboarding.png', 'Khảo Sát Khẩu Vị Đầu Vào (OnboardingModal)');

  // 12. Mở Hòm Bữa Cơm (FastMealApexModal)
  await resetModals();
  await page.evaluate(() => {
    window.__mealwise.openApexModal();
  });
  await capture('12_mo_hom_bua_com_apex.png', 'Mở Hòm Bữa Cơm May Mắn (FastMealApexModal)');

  // 13. Vòng Quay Bàn Nhậu (DrinkRouletteModal)
  await resetModals();
  await page.evaluate(() => {
    window.__mealwise.openDrinkRoulette();
  });
  await capture('13_vong_quay_ban_nhau_roulette.png', 'Vòng Quay Bàn Nhậu (DrinkRouletteModal)');

  // 14. Khu Trò Chơi Minigame Hub (MinigameHubModal)
  await resetModals();
  await page.evaluate(() => {
    window.__mealwise.openMinigameHub();
  });
  await capture('14_khu_tro_choi_minigame_hub.png', 'Khu Trò Chơi Bàn Tiệc (MinigameHubModal)');

  // 15. Chia Sẻ Mua Chung / Collaborative Cart (ShareCollabCartModal)
  await resetModals();
  await page.evaluate(() => {
    window.__mealwise.setActiveTab('grocery');
    window.__mealwise.setIsShareModalOpen(true);
  });
  await capture('15_chia_se_gio_hang_collab.png', 'Sảnh Chia Sẻ Đi Chợ Mua Chung (ShareCollabCartModal)');

  // 16. Đăng Nhập & Đăng Ký (AuthModal)
  await resetModals();
  await page.evaluate(() => {
    window.__mealwise.openAuthModal('login');
  });
  await capture('16_dang_nhap_tai_khoan_auth.png', 'Đăng Nhập / Đăng Ký Thành Viên (AuthModal)');

  // 17. Tải Ứng Dụng Mobile (DownloadAppModal)
  await resetModals();
  await page.evaluate(() => {
    window.__mealwise.openDownloadAppModal('Trải Nghiệm Toàn Diện');
  });
  await capture('17_tai_ung_dung_mobile_modal.png', 'Cài Đặt Ứng Dụng Smartphone (DownloadAppModal)');

  // 18. Hướng Dẫn Tương Tác (InteractiveTutorialModal)
  await resetModals();
  await page.evaluate(() => {
    window.__mealwise.setIsTutorialOpen(true);
  });
  await capture('18_huong_dan_tuong_tac_tutorial.png', 'Hướng Dẫn Tương Tác Đi Chợ & Nấu Ăn (InteractiveTutorialModal)');

  // 19. Giao Diện Chế Độ Tối (Dark Mode)
  await resetModals();
  await page.evaluate(() => {
    window.__mealwise.setTheme('dark');
    document.documentElement.classList.add('dark');
    window.__mealwise.setActiveTab('weekly');
  });
  await capture('19_giao_dien_che_do_toi.png', 'Giao Diện Ban Đêm Sang Trọng (Dark Theme Mode)');

  // 20. Giao Diện Tủ Lạnh Chế Độ Tối (Bonus Fridge Dark)
  await resetModals();
  await page.evaluate(() => {
    window.__mealwise.setActiveTab('pantry');
  });
  await capture('20_tu_lanh_che_do_toi.png', 'Tủ Lạnh & Đồ Thừa Chế Độ Tối (Fridge Dark Mode)');

  // 21. Giao Diện Mâm Cơm Chế Độ Tối (Bonus Meal Sets Dark)
  await resetModals();
  await page.evaluate(() => {
    window.__mealwise.setActiveTab('meal-sets');
  });
  await capture('21_mam_com_che_do_toi.png', 'Mâm Cơm Hôm Nay Chế Độ Tối (MealSets Dark Mode)');

  // 22. Giao Diện Sổ Tay Công Thức Chế Độ Tối (Bonus Recipes Dark)
  await resetModals();
  await page.evaluate(() => {
    window.__mealwise.setActiveTab('recipes');
  });
  await capture('22_so_tay_cong_thuc_che_do_toi.png', 'Sổ Tay Công Thức Chế Độ Tối (Recipes Dark Mode)');

  // 23. Giao Diện Tiệc & Catering Chế Độ Tối (Bonus Party Dark)
  await resetModals();
  await page.evaluate(() => {
    window.__mealwise.setActiveTab('party');
  });
  await capture('23_tiec_catering_che_do_toi.png', 'Tiệc & Catering Chế Độ Tối (Party Dark Mode)');

  // Reset back to light theme for user
  await page.evaluate(() => {
    window.__mealwise.setTheme('light');
    document.documentElement.classList.remove('dark');
    window.__mealwise.setActiveTab('weekly');
  });

  await browser.close();
  console.log('\n[SUCCESS] All screens and modals systematically captured and verified!');
}

run().catch((err) => {
  console.error('Fatal error during screen capture:', err);
  process.exit(1);
});
