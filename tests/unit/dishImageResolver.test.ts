import { describe, it, expect } from '../helpers/testRunner';
import {
  getDishImageUrl,
  FOOD_IMAGE_POOLS,
  CULINARY_82_POOLS,
  OVERUSED_PLACEHOLDER_IDS,
  normalizeVietnameseDish,
  hashDishTitle,
  resolveCulinaryCluster,
  isDeadOrPlaceholderUrl
} from '../../src/utils/dishImageResolver';
import { mockRecipes } from '../../src/data/mockRecipes';

describe('Unit: Semantic Dish Image Matching Engine (dishImageResolver)', () => {

  // ==========================================================================
  // Category 1: Fast Food & Snacks
  // ==========================================================================
  it('should match Burger dishes with authentic burger photography', () => {
    const dishes = [
      'Burger Bò Nướng Phô Mai Tan Chảy',
      'Burger Gà Chiên Giòn Sốt Mayonnaise',
      'Hamburger Bò Mỹ 2 Tầng Phô Mai',
      'Double Beef Burger with Cheddar'
    ];
    dishes.forEach(title => {
      const url = getDishImageUrl(title, 'mon-chinh');
      expect(FOOD_IMAGE_POOLS.burger.includes(url)).toBe(true);
    });
  });

  it('should match Crispy Fried Chicken dishes with golden fried chicken photography', () => {
    const chickenDishes = [
      'Cơm Gà Xối Mỡ Đùi Góc Tư Giòn Da',
      'Gà Rán Giòn Cay Sốt Hàn Quốc',
      'Cánh Gà Chiên Nước Mắm Giòn Rụm',
      'Đùi Gà Chiên Giòn Tan Da',
      'Chicken Nuggets Lắc Phô Mai'
    ];
    chickenDishes.forEach(title => {
      const url = getDishImageUrl(title, 'mon-chinh');
      expect(FOOD_IMAGE_POOLS.fried_chicken.includes(url)).toBe(true);
    });
  });

  it('should match Bánh Tráng Nướng & Bánh Tráng Trộn with snack pools', () => {
    const nuongUrl = getDishImageUrl('Bánh Tráng Nướng Trứng Cút Mỡ Hành', 'an-vat');
    expect(FOOD_IMAGE_POOLS.banh_trang_nuong.includes(nuongUrl)).toBe(true);

    const tronUrl = getDishImageUrl('Bánh Tráng Trộn Sa Tế Khô Bò', 'an-vat');
    expect(FOOD_IMAGE_POOLS.banh_trang_tron.includes(tronUrl)).toBe(true);
  });

  it('should match French Fries & Nem Chua Rán', () => {
    const friesUrl = getDishImageUrl('Khoai Tây Chiên Lắc Phô Mai Béo Ngậy', 'an-vat');
    expect(FOOD_IMAGE_POOLS.french_fries.includes(friesUrl)).toBe(true);

    const nemUrl = getDishImageUrl('Nem Chua Rán Phố Cổ Hà Nội', 'an-vat');
    expect(FOOD_IMAGE_POOLS.nem_chua_ran.includes(nemUrl)).toBe(true);
  });

  // ==========================================================================
  // Category 2: Vietnamese Noodle & Rice Classics
  // ==========================================================================
  it('should match Phở Bò vs Phở Gà to their dedicated clusters', () => {
    const phoBoUrl = getDishImageUrl('Phở Bò Tái Lăn Hà Nội', 'mon-chinh');
    expect(FOOD_IMAGE_POOLS.pho_bo.includes(phoBoUrl)).toBe(true);
    // Also satisfies legacy alias
    expect(FOOD_IMAGE_POOLS.pho_noodles.includes(phoBoUrl)).toBe(true);

    const phoGaUrl = getDishImageUrl('Phở Gà Đồi Lá Chanh Thơm Lừng', 'mon-chinh');
    expect(FOOD_IMAGE_POOLS.pho_ga.includes(phoGaUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.pho_noodles.includes(phoGaUrl)).toBe(true);
  });

  it('should match Bún Chả, Bún Bò Huế, Bún Riêu, and Bún Đậu', () => {
    const bunChaUrl = getDishImageUrl('Bún Chả Nem Cua Bể Hà Nội', 'mon-chinh');
    expect(FOOD_IMAGE_POOLS.bun_cha.includes(bunChaUrl)).toBe(true);

    const bunBoUrl = getDishImageUrl('Bún Bò Huế Chả Cua Giò Heo Đậm Đà', 'mon-chinh');
    expect(FOOD_IMAGE_POOLS.bun_bo_hue.includes(bunBoUrl)).toBe(true);

    const bunRieuUrl = getDishImageUrl('Bún Riêu Cua Đồng Ốc Đậu Phụ', 'mon-chinh');
    expect(FOOD_IMAGE_POOLS.bun_rieu.includes(bunRieuUrl)).toBe(true);

    const bunDauUrl = getDishImageUrl('Bún Đậu Mắm Tôm Thập Cẩm Chả Cốm', 'mon-chinh');
    expect(FOOD_IMAGE_POOLS.bun_dau_mam_tom.includes(bunDauUrl)).toBe(true);
  });

  it('should match Bánh Mì dishes with crusty baguette photography', () => {
    const banhMiDishes = [
      'Bánh Mì Pate Chả Lụa Thịt Nguội',
      'Bánh Mì Xíu Mại Sốt Cà Chua Đà Lạt',
      'Bánh Mì Chảo Trứng Pate Xúc Xích',
      'Sandwich Kẹp Thịt Xông Khói & Phô Mai'
    ];
    banhMiDishes.forEach(title => {
      const url = getDishImageUrl(title, 'an-nhanh');
      expect(FOOD_IMAGE_POOLS.banh_mi.includes(url)).toBe(true);
    });
  });

  it('should match Cơm Tấm and Cơm Rang', () => {
    const comTamUrl = getDishImageUrl('Cơm Tấm Sườn Bì Chả Trứng Ốp La', 'mon-chinh');
    expect(FOOD_IMAGE_POOLS.com_tam.includes(comTamUrl)).toBe(true);

    const comRangUrl = getDishImageUrl('Cơm Rang Dưa Bò Phố Cổ', 'mon-chinh');
    expect(FOOD_IMAGE_POOLS.com_rang.includes(comRangUrl)).toBe(true);
  });

  // ==========================================================================
  // Category 3: Home-Cooked Meal Sets & Tone-Homograph Disambiguation
  // ==========================================================================
  it('should distinguish Cá Kho Tộ from Cà Chua / Cà Tím dishes without false positives', () => {
    // True Fish Dish
    const caKhoUrl = getDishImageUrl('Cá Kho Tộ Ba Sa Đậm Vị', 'mon-man');
    expect(FOOD_IMAGE_POOLS.ca_kho_to.includes(caKhoUrl)).toBe(true);

    // Tomato Tofu Dish (Contains "cà chua", MUST NOT resolve to ca_kho_to or fish_seafood)
    const tomatoTofuUrl = getDishImageUrl('Đậu Sốt Cà Chua Nhồi Thịt', 'mon-man');
    expect(FOOD_IMAGE_POOLS.dau_sot_ca_chua.includes(tomatoTofuUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.ca_kho_to.includes(tomatoTofuUrl)).toBe(false);

    // Eggplant Stir-Fry (Contains "cà tím", MUST NOT resolve to ca_kho_to)
    const eggplantUrl = getDishImageUrl('Cà Tím Xào Thịt Băm Lá Lốt', 'mon-xao');
    expect(FOOD_IMAGE_POOLS.rau_xao_thap_cam.includes(eggplantUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.ca_kho_to.includes(eggplantUrl)).toBe(false);
  });

  it('should distinguish Hủ Tiếu Nam Vang from mushroom vegetable dishes', () => {
    const huTieuUrl = getDishImageUrl('Hủ Tiếu Nam Vang Thập Cẩm Tôm Mực Thịt', 'mon-chinh');
    expect(FOOD_IMAGE_POOLS.hu_tieu.includes(huTieuUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.rau_xao_thap_cam.includes(huTieuUrl)).toBe(false);
  });

  it('should distinguish Canh Sườn from Sườn Ram', () => {
    const canhSuonUrl = getDishImageUrl('Canh Sườn Nấu Sấu Chua Thanh', 'mon-canh');
    expect(FOOD_IMAGE_POOLS.canh_suon_sau_kim_chi.includes(canhSuonUrl)).toBe(true);

    const suonRamUrl = getDishImageUrl('Sườn Non Ram Mặn Ngọt Đậm Đà', 'mon-man');
    expect(FOOD_IMAGE_POOLS.suon_ram.includes(suonRamUrl)).toBe(true);
  });

  it('should match Canh Chua and Canh Cua dishes correctly', () => {
    const canhChuaUrl = getDishImageUrl('Canh Chua Cá Lóc Nấu Thơm Dọc Mùng', 'mon-canh');
    expect(FOOD_IMAGE_POOLS.canh_chua.includes(canhChuaUrl)).toBe(true);

    const canhCuaUrl = getDishImageUrl('Canh Cua Mồng Tơi Rau Đay Mướp', 'mon-canh');
    expect(FOOD_IMAGE_POOLS.canh_cua_rau_day.includes(canhCuaUrl)).toBe(true);
  });

  // ==========================================================================
  // Category 4: Beverages & Desserts
  // ==========================================================================
  it('should match Beverages (Coffee, Boba, Fruit Tea) with drink photography', () => {
    const coffeeUrl = getDishImageUrl('Cà Phê Sữa Đá Sài Gòn Đậm Vị', 'nuoc-uong');
    expect(FOOD_IMAGE_POOLS.ca_phe_vietnam.includes(coffeeUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.coffee.includes(coffeeUrl)).toBe(true);

    const saltCoffeeUrl = getDishImageUrl('Cà Phê Muối Cố Đô Xứ Huế', 'nuoc-uong');
    expect(FOOD_IMAGE_POOLS.ca_phe_muoi_artisan.includes(saltCoffeeUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.coffee.includes(saltCoffeeUrl)).toBe(true);

    const bobaUrl = getDishImageUrl('Trà Sữa Trân Châu Đường Đen Hoàng Kim', 'nuoc-uong');
    expect(FOOD_IMAGE_POOLS.tra_sua_tran_chau.includes(bobaUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.tea_drink.includes(bobaUrl)).toBe(true);

    const peachTeaUrl = getDishImageUrl('Trà Đào Cam Sả Hạt Chia Mát Lạnh', 'nuoc-uong');
    expect(FOOD_IMAGE_POOLS.tra_dao_cam_sa.includes(peachTeaUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.tea_drink.includes(peachTeaUrl)).toBe(true);
  });

  it('should match Desserts (Chè, Flan, Kem)', () => {
    const cheUrl = getDishImageUrl('Chè Khúc Bạch Phô Mai Thanh Mát', 'trang-mieng');
    expect(FOOD_IMAGE_POOLS.che_duong_nhan_khuc_bach.includes(cheUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.dessert.includes(cheUrl)).toBe(true);

    const flanUrl = getDishImageUrl('Bánh Flan Caramen Sữa Tươi Cốt Dừa', 'trang-mieng');
    expect(FOOD_IMAGE_POOLS.flan_caramen.includes(flanUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.dessert.includes(flanUrl)).toBe(true);
  });

  // ==========================================================================
  // Category 5: Dare & Street Novelties
  // ==========================================================================
  it('should match Dare dishes (Mắm Tôm, Sầu Riêng, Hột Vịt Lộn)', () => {
    const mamTomUrl = getDishImageUrl('Mắm Tôm Nguyên Chất Sủi Bọt Tắc Ớt', 'doc-la');
    expect(FOOD_IMAGE_POOLS.mam_tom_mam_nem.includes(mamTomUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.bizarre_dare.includes(mamTomUrl)).toBe(true);

    const sauRiengUrl = getDishImageUrl('Sầu Riêng Ri6 Nướng Mỡ Hành Siêu Độc', 'doc-la');
    expect(FOOD_IMAGE_POOLS.sau_rieng_dac_san.includes(sauRiengUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.bizarre_dare.includes(sauRiengUrl)).toBe(true);

    const trungLonUrl = getDishImageUrl('Hột Vịt Lộn Luộc Ngải Cứu Cay Nồng', 'doc-la');
    expect(FOOD_IMAGE_POOLS.trung_vit_lon.includes(trungLonUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.bizarre_dare.includes(trungLonUrl)).toBe(true);

    const conTrungUrl = getDishImageUrl('Dế Mèn Chiên Giòn Bơ Tỏi Cay', 'doc-la');
    expect(FOOD_IMAGE_POOLS.con_trung_chien_gion.includes(conTrungUrl)).toBe(true);

    const miCayUrl = getDishImageUrl('Mì Cay 7 Cấp Độ Hải Sản Siêu Cay', 'doc-la');
    expect(FOOD_IMAGE_POOLS.do_cay_nong_extreme.includes(miCayUrl)).toBe(true);
  });

  // ==========================================================================
  // Modifier Weighting & Compound Differentiation
  // ==========================================================================
  it('should apply modifier weighting (fried chicken vs boiled chicken vs chicken rice)', () => {
    // Fried chicken
    const friedUrl = getDishImageUrl('Gà Rán Giòn Cay Sốt Mắm', 'mon-chinh');
    expect(FOOD_IMAGE_POOLS.fried_chicken.includes(friedUrl)).toBe(true);

    // Boiled / Braised chicken
    const boiledUrl = getDishImageUrl('Gà Luộc Lá Chanh Thảo Mộc', 'mon-man');
    expect(FOOD_IMAGE_POOLS.ga_kho_gung_sa.includes(boiledUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.fried_chicken.includes(boiledUrl)).toBe(false);

    // Ginger braised chicken
    const braisedUrl = getDishImageUrl('Gà Kho Gừng Cay Nồng', 'mon-man');
    expect(FOOD_IMAGE_POOLS.ga_kho_gung_sa.includes(braisedUrl)).toBe(true);

    // Chicken rice (crispy fat)
    const chickenRiceUrl = getDishImageUrl('Cơm Gà Xối Mỡ Đùi Giòn', 'mon-chinh');
    expect(FOOD_IMAGE_POOLS.fried_chicken.includes(chickenRiceUrl)).toBe(true);
  });

  // ==========================================================================
  // Integrity: Blacklisted Overused & Dead 404 URLs
  // ==========================================================================
  it('should replace overused placeholder ribs photo with the correct semantic photo', () => {
    const overusedRibs = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80';

    const burgerResult = getDishImageUrl('Burger Bò Phô Mai', 'mon-chinh', overusedRibs);
    expect(FOOD_IMAGE_POOLS.burger.includes(burgerResult)).toBe(true);
    expect(burgerResult).not.toBe(overusedRibs);

    const chickenResult = getDishImageUrl('Cơm Gà Xối Mỡ Đùi Góc Tư Giòn Da', 'mon-chinh', overusedRibs);
    expect(FOOD_IMAGE_POOLS.fried_chicken.includes(chickenResult)).toBe(true);
    expect(chickenResult).not.toBe(overusedRibs);

    const soupResult = getDishImageUrl('Canh Cua Mồng Tơi Rêu Cua', 'mon-canh', overusedRibs);
    expect(FOOD_IMAGE_POOLS.soup_dish.includes(soupResult)).toBe(true);
    expect(soupResult).not.toBe(overusedRibs);
  });

  it('should replace dead HTTP 404 Unsplash URLs', () => {
    const deadUrl1 = 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80';
    const deadUrl2 = 'https://images.unsplash.com/photo-1621996346565-e3d5d6281744?auto=format&fit=crop&w=600&q=80';

    const fixedFries = getDishImageUrl('Khoai Tây Chiên Giòn', 'an-vat', deadUrl1);
    expect(fixedFries).not.toBe(deadUrl1);
    expect(FOOD_IMAGE_POOLS.french_fries.includes(fixedFries)).toBe(true);

    const fixedSnack = getDishImageUrl('Xúc Xích Nướng Phô Mai', 'an-vat', deadUrl2);
    expect(fixedSnack).not.toBe(deadUrl2);
    expect(FOOD_IMAGE_POOLS.hotdogs_sausage.includes(fixedSnack)).toBe(true);
  });

  // ==========================================================================
  // Fallback Cascade & Determinism
  // ==========================================================================
  it('should cascade to category default when dish title is unrecognized', () => {
    // Unknown soup name
    const unknownSoup = getDishImageUrl('Món Canh Thần Bí Gia Truyền Cổ Điển', 'mon-canh');
    expect(FOOD_IMAGE_POOLS.canh_thanh_mat.includes(unknownSoup)).toBe(true);

    // Unknown drink name
    const unknownDrink = getDishImageUrl('Nước Thần Kỳ Bí Vũ Trụ', 'nuoc-uong');
    expect(FOOD_IMAGE_POOLS.tra_dao_cam_sa.includes(unknownDrink)).toBe(true);

    // Completely unknown title and category
    const universalDefault = getDishImageUrl('Something Completely Unknown 12345', 'unknown-cat');
    expect(FOOD_IMAGE_POOLS.com_tam.includes(universalDefault)).toBe(true);
  });

  it('should maintain deterministic photo assignment based on dish title seed', () => {
    const url1 = getDishImageUrl('Burger Bò Phô Mai Cheddar');
    const url2 = getDishImageUrl('Burger Bò Phô Mai Cheddar');
    expect(url1).toBe(url2);

    // String hashing seed distribution
    const hash1 = hashDishTitle('Dish A');
    const hash2 = hashDishTitle('Dish A');
    expect(hash1).toBe(hash2);
    expect(typeof hash1).toBe('number');
    expect(hash1).toBeGreaterThanOrEqual(0);
  });

  // ==========================================================================
  // Legacy Pool Backward Compatibility
  // ==========================================================================
  it('should maintain 100% backward compatibility for all 11 legacy alias pools', () => {
    expect(Array.isArray(FOOD_IMAGE_POOLS.pho_noodles)).toBe(true);
    expect(Array.isArray(FOOD_IMAGE_POOLS.coffee)).toBe(true);
    expect(Array.isArray(FOOD_IMAGE_POOLS.tea_drink)).toBe(true);
    expect(Array.isArray(FOOD_IMAGE_POOLS.soup_dish)).toBe(true);
    expect(Array.isArray(FOOD_IMAGE_POOLS.fish_seafood)).toBe(true);
    expect(Array.isArray(FOOD_IMAGE_POOLS.beef_dish)).toBe(true);
    expect(Array.isArray(FOOD_IMAGE_POOLS.pork_dish)).toBe(true);
    expect(Array.isArray(FOOD_IMAGE_POOLS.veggie_dish)).toBe(true);
    expect(Array.isArray(FOOD_IMAGE_POOLS.dessert)).toBe(true);
    expect(Array.isArray(FOOD_IMAGE_POOLS.bizarre_dare)).toBe(true);
    expect(Array.isArray(FOOD_IMAGE_POOLS.snacks)).toBe(true);

    const porkUrl = getDishImageUrl('Thịt Ba Chỉ Rang Cháy Cạnh', 'mon-man');
    expect(FOOD_IMAGE_POOLS.pork_dish.includes(porkUrl)).toBe(true);

    const beefUrl = getDishImageUrl('Bò Xào Cần Tỏi Thơm Ngon', 'mon-man');
    expect(FOOD_IMAGE_POOLS.beef_dish.includes(beefUrl)).toBe(true);

    const vegUrl = getDishImageUrl('Rau Muống Xào Tỏi Xanh Mướt', 'mon-xao');
    expect(FOOD_IMAGE_POOLS.veggie_dish.includes(vegUrl)).toBe(true);
  });

  // ==========================================================================
  // Specification 2: Internal Pool Purity & Food Photography Invariants
  // ==========================================================================
  it('should assert internal pool purity across all keys in FOOD_IMAGE_POOLS and CULINARY_82_POOLS (Spec 2)', () => {
    const poolViolations: { pool: string; url: string; reason: string }[] = [];
    const allBadIds = [
      ...OVERUSED_PLACEHOLDER_IDS,
      'photo-1621996346565-e3d5d6281292',
      'photo-1621996346565-e3d5d6281744',
      'photo-1576107232684-1279f3908594',
      'photo-1627054234057-a41764661031',
      'photo-176107232684-1279f3908594',
      'photo-1573140247632-f8fd74997d5c', // portrait / human face
    ];

    // Assert CULINARY_82_POOLS has at least 82 cluster keys
    const clusterKeys = Object.keys(CULINARY_82_POOLS);
    expect(clusterKeys.length).toBeGreaterThanOrEqual(82);

    // Assert FOOD_IMAGE_POOLS has at least 102 keys (82 + western aliases + legacy aliases)
    const foodPoolKeys = Object.keys(FOOD_IMAGE_POOLS);
    expect(foodPoolKeys.length).toBeGreaterThanOrEqual(102);

    for (const [poolName, urls] of Object.entries(FOOD_IMAGE_POOLS)) {
      expect(Array.isArray(urls)).toBe(true);
      expect(urls.length).toBeGreaterThanOrEqual(1);

      for (const url of urls) {
        if (!url || typeof url !== 'string' || !url.startsWith('https://images.unsplash.com/')) {
          poolViolations.push({ pool: poolName, url: String(url), reason: 'invalid_url_format' });
        }

        for (const badId of allBadIds) {
          if (url.includes(badId)) {
            poolViolations.push({ pool: poolName, url, reason: `blacklisted_id: ${badId}` });
          }
        }

        // Verify CDN crop parameters
        if (!url.includes('auto=format') || !url.includes('fit=crop')) {
          poolViolations.push({ pool: poolName, url, reason: 'missing_format_or_crop_params' });
        }

        // Verify no offline cloches or data URIs
        if (url.startsWith('data:image/svg+xml')) {
          poolViolations.push({ pool: poolName, url, reason: 'svg_cloche_in_pool' });
        }
      }
    }

    expect(poolViolations.length).toBe(0);
  });

  // ==========================================================================
  // Specification 3: Dedicated Western Culinary Semantic Mappings
  // ==========================================================================
  it('should assert dedicated Western culinary semantic mappings across breakfasts, steaks, pastas, soups, salads, and seafood (Spec 3)', () => {
    // 1. Omelette & Egg skillet: "Trứng Cuộn Omelette Xúc Xích Đức & Bánh Mì Bơ" (western-bfast-433)
    const omeletteUrl = getDishImageUrl('Trứng Cuộn Omelette Xúc Xích Đức & Bánh Mì Bơ', 'an-sang');
    expect(FOOD_IMAGE_POOLS.western_omelette_egg.includes(omeletteUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.trung_cuon_omelette.includes(omeletteUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.burger.includes(omeletteUrl)).toBe(false);

    // 2. French Toast & Pancakes & Avocado Toast
    const frenchToastUrl = getDishImageUrl('Bánh Mì Nướng Kiểu Pháp (French Toast)', 'an-sang');
    expect(FOOD_IMAGE_POOLS.western_toast_pancake.includes(frenchToastUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.burger.includes(frenchToastUrl)).toBe(false);

    const pancakeUrl = getDishImageUrl('Pancakes Mật Ong Rừng', 'an-sang');
    expect(FOOD_IMAGE_POOLS.western_toast_pancake.includes(pancakeUrl)).toBe(true);

    const avoToastUrl = getDishImageUrl('Avocado Toast Bơ Sáp', 'an-sang');
    expect(FOOD_IMAGE_POOLS.western_toast_pancake.includes(avoToastUrl)).toBe(true);

    // 3. Beefsteak
    const steakUrl = getDishImageUrl('Bò Bít Tết Sốt Tiêu Đen Kiểu Pháp', 'mon-man');
    expect(FOOD_IMAGE_POOLS.western_steak.includes(steakUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.steak_beef.includes(steakUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.burger.includes(steakUrl)).toBe(false);

    const ribeyeUrl = getDishImageUrl('Ribeye Steak Nướng Thảo Mộc', 'mon-man');
    expect(FOOD_IMAGE_POOLS.western_steak.includes(ribeyeUrl)).toBe(true);

    // 4. Italian Pasta (Bolognese, Carbonara, Pesto)
    const bologneseUrl = getDishImageUrl('Mì Ý Spaghetti Sốt Bò Bằm Bolognese', 'mon-man');
    expect(FOOD_IMAGE_POOLS.western_pasta.includes(bologneseUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.my_y_pasta.includes(bologneseUrl)).toBe(true);

    const carbonaraUrl = getDishImageUrl('Mì Ý Carbonara Sốt Kem Trứng', 'mon-man');
    expect(FOOD_IMAGE_POOLS.western_pasta.includes(carbonaraUrl)).toBe(true);

    const pestoUrl = getDishImageUrl('Mì Ý Sốt Húng Tây Pesto Hải Sản', 'mon-man');
    expect(FOOD_IMAGE_POOLS.western_pasta.includes(pestoUrl)).toBe(true);

    // 5. Clam Chowder & Western Cream Soups
    const chowderUrl = getDishImageUrl('Clam Chowder Súp Nghêu Kiểu Mỹ', 'mon-canh');
    expect(FOOD_IMAGE_POOLS.western_soup.includes(chowderUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.sup_kem_tay_chowder.includes(chowderUrl)).toBe(true);

    const pumpkinSoupUrl = getDishImageUrl('Súp Kem Bí Đỏ Hạt Dẻ', 'mon-canh');
    expect(FOOD_IMAGE_POOLS.western_soup.includes(pumpkinSoupUrl)).toBe(true);

    // 6. Caesar Salad & Western Salads
    const caesarUrl = getDishImageUrl('Caesar Salad Lườn Gà Nướng Parmesan', 'mon-xao');
    expect(FOOD_IMAGE_POOLS.western_salad.includes(caesarUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.salad_tay_caesar.includes(caesarUrl)).toBe(true);

    const coleslawUrl = getDishImageUrl('Coleslaw Bắp Cải Tươi', 'mon-xao');
    expect(FOOD_IMAGE_POOLS.western_salad.includes(coleslawUrl)).toBe(true);

    // 7. Western Seafood (Salmon steak, pan-seared garlic seafood)
    const salmonUrl = getDishImageUrl('Cá Hồi Áp Chảo Sốt Cam', 'mon-man');
    expect(FOOD_IMAGE_POOLS.western_seafood.includes(salmonUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.seafood_western.includes(salmonUrl)).toBe(true);

    const shrimpGarlicUrl = getDishImageUrl('Tôm Bơ Tỏi', 'mon-man');
    expect(FOOD_IMAGE_POOLS.western_seafood.includes(shrimpGarlicUrl)).toBe(true);
  });

  // ==========================================================================
  // Specification 4: Traditional Vietnamese Semantic Mapping & Homograph Disambiguation
  // ==========================================================================
  it('should assert traditional Vietnamese semantic mappings and homograph disambiguation (Spec 4)', () => {
    // 1. Thịt Kho Tàu
    const thitKhoUrl = getDishImageUrl('Thịt Kho Tàu Nước Dừa Hột Vịt', 'mon-man');
    expect(FOOD_IMAGE_POOLS.thit_kho_tau.includes(thitKhoUrl)).toBe(true);

    // 2. Canh Chua
    const canhChuaUrl = getDishImageUrl('Canh Chua Cá Hồi Nấu Thơm Bạc Hà', 'mon-canh');
    expect(FOOD_IMAGE_POOLS.canh_chua.includes(canhChuaUrl)).toBe(true);

    // 3. Cá Basa Kho Tộ
    const caKhoUrl = getDishImageUrl('Cá Basa Kho Tộ Đậm Đà', 'mon-man');
    expect(FOOD_IMAGE_POOLS.ca_kho_to.includes(caKhoUrl)).toBe(true);

    // 4. Gà Luộc Lá Chanh
    const gaLuocUrl = getDishImageUrl('Gà Luộc Lá Chanh Thảo Mộc', 'mon-man');
    expect(FOOD_IMAGE_POOLS.ga_kho_gung_sa.includes(gaLuocUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.fried_chicken.includes(gaLuocUrl)).toBe(false);

    // 5. Canh Cua Mồng Tơi
    const canhCuaUrl = getDishImageUrl('Canh Cua Mồng Tơi Mướp Hương', 'mon-canh');
    expect(FOOD_IMAGE_POOLS.canh_cua_rau_day.includes(canhCuaUrl)).toBe(true);

    // 6. Đậu Phụ Sốt Cà Chua MUST NOT resolve to fish (ca_kho_to) or meat (thit_kho_tau)
    const dauPhuUrl = getDishImageUrl('Đậu Phụ Sốt Cà Chua', 'mon-man');
    expect(FOOD_IMAGE_POOLS.dau_sot_ca_chua.includes(dauPhuUrl)).toBe(true);
    expect(FOOD_IMAGE_POOLS.ca_kho_to.includes(dauPhuUrl)).toBe(false);
    expect(FOOD_IMAGE_POOLS.thit_kho_tau.includes(dauPhuUrl)).toBe(false);
    expect(FOOD_IMAGE_POOLS.fish_seafood.includes(dauPhuUrl)).toBe(false);

    // 7. Cà Tím Xào Thịt Băm MUST NOT resolve to fish (ca_kho_to)
    const caTimUrl = getDishImageUrl('Cà Tím Xào Thịt Băm', 'mon-xao');
    expect(FOOD_IMAGE_POOLS.ca_kho_to.includes(caTimUrl)).toBe(false);
    expect(FOOD_IMAGE_POOLS.fish_seafood.includes(caTimUrl)).toBe(false);
  });

  // ==========================================================================
  // Specification 5: Zero Offline Cloche Graphics in Online Mode
  // ==========================================================================
  it('should assert zero offline cloche graphics in online mode for all 1,245 recipes in mockRecipes (Spec 5)', () => {
    expect(mockRecipes.length).toBe(1245);

    let clocheCount = 0;
    let emptyCount = 0;
    let nonHttpCount = 0;

    mockRecipes.forEach(recipe => {
      // 1. With existingUrl
      const url = getDishImageUrl(recipe.title, recipe.category, recipe.imageUrl);
      if (!url || typeof url !== 'string' || url.trim() === '') {
        emptyCount++;
      } else {
        if (url.startsWith('data:image/svg+xml') || url.includes('Offline') || url.includes('Ngoại Tuyến')) {
          clocheCount++;
        }
        if (!url.startsWith('https://images.unsplash.com/') && !url.startsWith('http')) {
          nonHttpCount++;
        }
      }

      // 2. Pure semantic resolution (without existingUrl)
      const pureResolved = getDishImageUrl(recipe.title, recipe.category);
      if (!pureResolved || typeof pureResolved !== 'string' || pureResolved.trim() === '') {
        emptyCount++;
      } else {
        if (pureResolved.startsWith('data:image/svg+xml') || pureResolved.includes('Offline') || pureResolved.includes('Ngoại Tuyến')) {
          clocheCount++;
        }
        if (!pureResolved.startsWith('https://images.unsplash.com/') && !pureResolved.startsWith('http')) {
          nonHttpCount++;
        }
      }
    });

    expect(clocheCount).toBe(0);
    expect(emptyCount).toBe(0);
    expect(nonHttpCount).toBe(0);
  });
});
