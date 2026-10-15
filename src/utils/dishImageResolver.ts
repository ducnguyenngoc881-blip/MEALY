/**
 * MealWise Semantic Dish Image Matching Engine
 * Accurately maps any dish, drink, or snack by semantic title & category
 * to high-definition, authentic, appetizing Vietnamese & International food photography.
 * 
 * Supports 55+ granular culinary clusters, Vietnamese diacritic normalization,
 * pre-lexical homograph disambiguation, and deterministic CDN rotation.
 */

import { removeVietnameseTones } from './textUtils';

// ============================================================================
// 1. OVERUSED & DEAD PLACEHOLDER BLACKLIST
// ============================================================================
export const OVERUSED_PLACEHOLDER_IDS = [
  'photo-1544025162-d76694265947', // overused ribs (was repeated in pork & beef)
  'photo-1540420773420-3366772f4999', // overused generic salad
  'photo-1547592166-23ac45744acd', // overused generic soup bowl (50+ times in db)
  'photo-1528735602780-2552fd46c7af', // overused grilled sandwich (58 times in db)
  'photo-1574484284002-952d92456975', // overused street bowl (52 times in db)
  'photo-1541832676-9b763b0239ab', // overused clay pot (45 times in db)
  'photo-1534422298391-e4f8c172dddb', // overused dumplings (161 times in db, falsely on fruits)
  'photo-1546069901-ba9599a7e63c', // overused salad greens (120 times in db, falsely on sweet soup)
  'photo-1512058564366-18510be2db19', // overused xoi (119 times in db)
  'photo-1528207776546-365bb710ee93', // overused pancakes (42 times in db, falsely on beefsteak)
  'photo-1576107232684-1279f3908594', // DEAD URL (HTTP 404 Not Found)
  'photo-176107232684-1279f3908594', // DEAD URL (HTTP 404 Not Found)
  'photo-1627054234057-a41764661031', // DEAD URL (HTTP 404 Not Found)
  'photo-1621996346565-e3d5d6281744', // DEAD URL (HTTP 404 Not Found in snackPool)
  'photo-1621996346565-e3d5d6281292', // DEAD URL (HTTP 404 Not Found in westernDishes500 & mockMealSets)
  'photo-1573140247632-f8fd74997d5c', // HUMAN FACE - strictly blacklisted from all food displays
  'photo-1556761175-5973dc0f32e7', // NON-FOOD: office meeting room with people and TV
  'photo-1555396273-367ea4eb4db5', // NON-FOOD: restaurant storefront interior with people
  'photo-1587593810167-a84920ea0781', // RAW UNCOOKED CARCASS: raw whole dead chicken on cutting board
  'photo-1615141982883-c7ad0e69fd62', // RAW UNCOOKED CARCASS: raw dead fish on crushed ice
  'photo-1615485500704-8e990f9900f7', // RAW DRY LEAVES: dried tea leaves scattered on paper
  'photo-1596040033229-a9821ebd058d', // RAW DRY SPICES: dry spice powder on wooden board
  'photo-1518977676601-b53f82aba655', // RAW UNPEELED POTATOES: pile of raw unpeeled potatoes
  'photo-1590779033100-9f60a05a013d', // RAW GROCERIES: raw uncooked grocery vegetables
  'photo-1558857563-b37cfb42e77b', // DEAD URL (HTTP 404 Not Found)
  'photo-1533089860892-a7c6f0a88666', // OVERUSED TOAST WITH EGG
  'photo-1559737558-2f5a35f4523b', // MISLABELED: 3 whole shrimp on white plate (was in ca_kho_to)
  'photo-1598515213692-5f252f75d785', // MISLABELED: salmon with cherry tomatoes (was in bbq_ribs_roast)
  'photo-1558030137-a56c1b004fa3', // MISLABELED: raw meat on dark grill (was in bbq_ribs_roast)
  'photo-1779939855630-ee3c7744d9c5', // MISLABELED: mango sticky rice (was in bun_cha)
  'photo-1544787219-7f47ccb76574', // MISLABELED: hot tea cup with cookies (was in nuoc_mia_nuoc_sam)
  'photo-1551024601-bec78aea704b', // MISLABELED: chocolate donuts (was in che_truyen_thong)
  'photo-1565958011703-44f9829ba187', // MISLABELED: strawberry cake slice (was in che_truyen_thong)
  'photo-1551024506-0bccd828d307', // MISLABELED: ice cream sundae (was in flan_caramen)
  'photo-1553279768-865429fa0078', // MISLABELED: yellow mango (was in sau_rieng_dac_san)
  'photo-1584776296944-ab6fb57b0bdd', // MISLABELED: dry toasted bread slices (was in trung_cuon_omelette)
  'photo-1788927783922-8b1299701b45', // MISLABELED: tonkatsu pork cutlet (was in banh_xeo_banh_khot)
  'photo-1623476663364-12de7c8b8b8d', // MISLABELED: sliced steak on black plate (was in chao_vietnam)
  'photo-1771355117563-8fe1bfa08f25', // MISLABELED: raw uncut vegetables (was in canh_kho_qua)
  'photo-1603087132487-c420466d5856', // MISLABELED: raw uncut vegetables (was in canh_kho_qua)
];

/**
 * Pre-flight validation helper to detect broken, dead, or blacklisted image URLs.
 */
export function isDeadOrPlaceholderUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image/')) {
    return true;
  }
  if (trimmed.startsWith('data:image/svg+xml')) {
    return true;
  }
  return OVERUSED_PLACEHOLDER_IDS.some(badId => trimmed.includes(badId));
}

// ============================================================================
// 2. CURATED HIGH-DEFINITION CULINARY POOLS (VERIFIED CDN)
// ============================================================================
export const CULINARY_82_POOLS: Record<string, string[]> = {
  // 1. burger
  burger: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80',
  ],

  // 2. fried_chicken
  fried_chicken: [
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=600&q=80',
  ],

  // 3. pizza
  pizza: [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80',
  ],

  // 4. french_fries
  french_fries: [
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
  ],

  // 5. hotdogs_sausage
  hotdogs_sausage: [
    'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1585325701165-351af916e581?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1591989330748-777649e84466?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1552913903-2cffa1962dc7?auto=format&fit=crop&w=600&q=80',
  ],

  // 6. tacos_wraps
  tacos_wraps: [
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1640983743761-4f0e0204bc58?auto=format&fit=crop&w=600&q=80',
  ],

  // 7. banh_trang_nuong (Authentic Vietnamese Grilled Rice Paper Pizza)
  banh_trang_nuong: [
    'https://upload.wikimedia.org/wikipedia/commons/8/8c/Pizzabanhtrangnuong2.jpg?auto=format&fit=crop&w=600&q=80',
    'https://upload.wikimedia.org/wikipedia/commons/2/25/Pizzabanhtrangnuong.JPG?auto=format&fit=crop&w=600&q=80',
    'https://upload.wikimedia.org/wikipedia/commons/d/d8/Pizzabanhtrangnuong1.jpg?auto=format&fit=crop&w=600&q=80',
    'https://upload.wikimedia.org/wikipedia/commons/a/a9/Pizzabanhtrangnuong3.JPG?auto=format&fit=crop&w=600&q=80',
  ],

  // 8. banh_trang_tron (Authentic Vietnamese Mixed Rice Paper Salad)
  banh_trang_tron: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/63/Vietnamese_%22banh_trang_tron%22.JPG/960px-Vietnamese_%22banh_trang_tron%22.JPG?auto=format&fit=crop&w=600&q=80',
    'https://upload.wikimedia.org/wikipedia/commons/8/82/Banh_trang_tron_%28mua_tai_truong_thpt_giadinh%29.jpg?auto=format&fit=crop&w=600&q=80',
    'https://upload.wikimedia.org/wikipedia/commons/b/b3/Banhtrangtron.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1706176224199-cd97c73d7640?auto=format&fit=crop&w=600&q=80',
  ],

  // 9. nem_chua_ran (Authentic Vietnamese Fried Fermented Pork & Chả Giò)
  nem_chua_ran: [
    'https://upload.wikimedia.org/wikipedia/commons/2/26/Nem-chua-ran2.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1695712641569-05eee7b37b6d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1695712641388-87c0f9c2d36e?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Ch%E1%BA%A3_gi%C3%B2_SG_%28nem_r%C3%A1n_gi%C3%B2n%29_%E1%BB%9F_qu%C3%A1n_b%C3%BAn_ri%C3%AAu_B%C3%A0_Ti_ng26th7n2023_%283%29.jpg/960px-Ch%E1%BA%A3_gi%C3%B2_SG_%28nem_r%C3%A1n_gi%C3%B2n%29_%E1%BB%9F_qu%C3%A1n_b%C3%BAn_ri%C3%AAu_B%C3%A0_Ti_ng26th7n2023_%283%29.jpg?auto=format&fit=crop&w=600&q=80',
  ],

  // 10. xien_que_ca_vien
  xien_que_ca_vien: [
    'https://images.unsplash.com/photo-1779939855594-5fae616d0481?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1779939855552-eb0838225f82?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1779939855602-235fff374e16?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1763994682737-477d8200dd5d?auto=format&fit=crop&w=600&q=80',
  ],

  // 11. pho_bo
  pho_bo: [
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1631709497146-a239ef373cf1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1533787761082-492a5b83e614?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1766050586763-723571af4dde?auto=format&fit=crop&w=600&q=80',
  ],

  // 12. pho_ga
  pho_ga: [
    'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512003867696-6d5ce6835040?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1736631879709-ee5341d7d31c?auto=format&fit=crop&w=600&q=80',
  ],

  // 13. bun_cha (Authentic Bún Chả Hà Nội)
  bun_cha: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/87/B%C3%BAn_ch%E1%BA%A3_H%C3%A0_N%E1%BB%99i_%28th%E1%BB%8Bt_n%C6%B0%E1%BB%9Bng%29_t%E1%BA%A1i_Nguy%E1%BB%85n_S%C6%A1n%2C_T%C3%A2n_Ph%C3%BA_%281%29.jpg/960px-B%C3%BAn_ch%E1%BA%A3_H%C3%A0_N%E1%BB%99i_%28th%E1%BB%8Bt_n%C6%B0%E1%BB%9Bng%29_t%E1%BA%A1i_Nguy%E1%BB%85n_S%C6%A1n%2C_T%C3%A2n_Ph%C3%BA_%281%29.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b7/B%C3%BAn_ch%E1%BA%A3_H%C3%A0_N%E1%BB%99i_%28th%E1%BB%8Bt_n%C6%B0%E1%BB%9Bng%29_t%E1%BA%A1i_Nguy%E1%BB%85n_S%C6%A1n%2C_T%C3%A2n_Ph%C3%BA_%282%29.jpg/960px-B%C3%BAn_ch%E1%BA%A3_H%C3%A0_N%E1%BB%99i_%28th%E1%BB%8Bt_n%C6%B0%E1%BB%9Bng%29_t%E1%BA%A1i_Nguy%E1%BB%85n_S%C6%A1n%2C_T%C3%A2n_Ph%C3%BA_%282%29.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1763703544688-2ac7839b0659?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1583316175701-0bc5f25a0a44?auto=format&fit=crop&w=600&q=80',
  ],

  // 14. bun_bo_hue (Authentic Bún Bò Huế)
  bun_bo_hue: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Bun_Bo_Hue_1.jpg/960px-Bun_Bo_Hue_1.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/00/Bun-Bo-Hue-from-Huong-Giang-2011.jpg/960px-Bun-Bo-Hue-from-Huong-Giang-2011.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/B%C3%BAn_b%C3%B2_Hu%E1%BA%BF_minh28397.jpg/960px-B%C3%BAn_b%C3%B2_Hu%E1%BA%BF_minh28397.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80',
  ],

  // 15. bun_rieu (Authentic Bún Riêu Cua)
  bun_rieu: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/B%C3%BAn_ri%C3%AAu_cua_n%C6%B0%E1%BB%9Bc.jpg/960px-B%C3%BAn_ri%C3%AAu_cua_n%C6%B0%E1%BB%9Bc.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/Bowl_of_Vietnamese_bun_rieu_soup_with_tomato.jpg/960px-Bowl_of_Vietnamese_bun_rieu_soup_with_tomato.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/Bun_rieu_with_herbs.jpg/960px-Bun_rieu_with_herbs.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/B%C3%BAn_ri%C3%AAu_%C4%91%E1%BA%B7c_bi%E1%BB%87t.jpg/960px-B%C3%BAn_ri%C3%AAu_%C4%91%E1%BA%B7c_bi%E1%BB%87t.jpg?auto=format&fit=crop&w=600&q=80',
  ],

  // 16. bun_dau_mam_tom (Authentic Bún Đậu Mắm Tôm)
  bun_dau_mam_tom: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/B%C3%BAn_%C4%91%E1%BA%ADu_m%E1%BA%AFm_t%C3%B4m.jpg/960px-B%C3%BAn_%C4%91%E1%BA%ADu_m%E1%BA%AFm_t%C3%B4m.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/B%C3%BAn_%C4%91%E1%BA%ADu_m%E1%BA%AFm_t%C3%B4m%2C_b%C3%BAn_nem_r%C3%A1n.JPG/960px-B%C3%BAn_%C4%91%E1%BA%ADu_m%E1%BA%AFm_t%C3%B4m%2C_b%C3%BAn_nem_r%C3%A1n.JPG?auto=format&fit=crop&w=600&q=80',
    'https://upload.wikimedia.org/wikipedia/commons/1/11/B%C3%BAn_%C4%91%E1%BA%ADu_m%E1%BA%AFm_t%C3%B4m_%282019%29.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/85/B%C3%BAn_%C4%91%E1%BA%ADu_m%E1%BA%AFm_t%C3%B4m_%281%29.jpg/960px-B%C3%BAn_%C4%91%E1%BA%ADu_m%E1%BA%AFm_t%C3%B4m_%281%29.jpg?auto=format&fit=crop&w=600&q=80',
  ],

  // 17. bun_thit_nuong (Authentic Bún Thịt Nướng Chả Giò)
  bun_thit_nuong: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Bun_thit_nuong.jpg/960px-Bun_thit_nuong.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/B%C3%BAn_Th%E1%BB%8Bt_N%C6%B0%E1%BB%9Bng_Ch%E1%BA%A3_Gi%C3%B2.JPG/960px-B%C3%BAn_Th%E1%BB%8Bt_N%C6%B0%E1%BB%9Bng_Ch%E1%BA%A3_Gi%C3%B2.JPG?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1710395295500-2b9725b2a067?auto=format&fit=crop&w=600&q=80',
  ],

  // 18. hu_tieu (Authentic Hủ Tiếu Nam Vang)
  hu_tieu: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/H%E1%BB%A7_ti%E1%BA%BFu_Nam_Vang.jpg/960px-H%E1%BB%A7_ti%E1%BA%BFu_Nam_Vang.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/H%E1%BB%A7_ti%E1%BA%BFu_Nam_Vang_S%C3%A0i_G%C3%B2n.jpg/960px-H%E1%BB%A7_ti%E1%BA%BFu_Nam_Vang_S%C3%A0i_G%C3%B2n.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1605311572312-a926afe51604?auto=format&fit=crop&w=600&q=80',
  ],

  // 19. mi_quang_cao_lau (Authentic Mì Quảng & Cao Lầu)
  mi_quang_cao_lau: [
    'https://upload.wikimedia.org/wikipedia/commons/f/f8/Cao_L%E1%BA%A7u.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Cao_l%E1%BA%A7u_H%E1%BB%99i_An.jpg/960px-Cao_l%E1%BA%A7u_H%E1%BB%99i_An.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/Mi_Quang_-_Quan_Hat_Mi_Quang%2C_Cao_Lau_VND2000.jpg/960px-Mi_Quang_-_Quan_Hat_Mi_Quang%2C_Cao_Lau_VND2000.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/Mi_Quang_1A_Danang.jpg/960px-Mi_Quang_1A_Danang.jpg?auto=format&fit=crop&w=600&q=80',
  ],

  // 20. banh_mi (Authentic Vietnamese Bánh Mì Baguette)
  banh_mi: [
    'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/Vietnamese_B%C3%A1nh_m%C3%AC_%28Banh_Mi%29_Sandwich.jpg/960px-Vietnamese_B%C3%A1nh_m%C3%AC_%28Banh_Mi%29_Sandwich.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1647169953827-a7c85f324caf?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1600454309261-3dc9b7597637?auto=format&fit=crop&w=600&q=80',
  ],

  // 21. com_tam (Authentic Cơm Tấm Sườn Bì Chả)
  com_tam: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_b%C3%AC_ch%E1%BA%A3.jpg/960px-C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_b%C3%AC_ch%E1%BA%A3.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_c%C3%A2y.JPG/960px-C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_c%C3%A2y.JPG?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1569058242252-623df46b5025?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1762305193367-91e072e47c3f?auto=format&fit=crop&w=600&q=80',
  ],

  // 22. com_rang
  com_rang: [
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512058556646-c4da40fba323?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512058533999-106ee01bf777?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1630914441929-0d8ea69f95e6?auto=format&fit=crop&w=600&q=80',
  ],

  // 23. xoi (Authentic Xôi Xéo & Xôi Gấc)
  xoi: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f9/X%C3%B4i_x%C3%A9o.jpg/960px-X%C3%B4i_x%C3%A9o.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/X%C3%B4i_g%E1%BA%A5c.JPG/960px-X%C3%B4i_g%E1%BA%A5c.JPG?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1788928808407-531f4779bd50?auto=format&fit=crop&w=600&q=80',
  ],

  // 24. thit_kho_tau (Authentic Thịt Kho Tàu Hột Vịt)
  thit_kho_tau: [
    'https://upload.wikimedia.org/wikipedia/commons/5/5b/Caramelized_Pork_and_Eggs.jpg?auto=format&fit=crop&w=600&q=80',
    'https://upload.wikimedia.org/wikipedia/commons/f/f7/Bi-quyet-nau-thit-kho-tau-thom-ngon-vang-ngay1.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/Vietnamese_thit_kho%2C_braised_pork_belly_and_boiled_eggs.jpg/960px-Vietnamese_thit_kho%2C_braised_pork_belly_and_boiled_eggs.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Th%E1%BB%8Bt_kho_h%E1%BB%99t_v%E1%BB%8Bt.jpg/960px-Th%E1%BB%8Bt_kho_h%E1%BB%99t_v%E1%BB%8Bt.jpg?auto=format&fit=crop&w=600&q=80',
  ],

  // 25. thit_rang_chay_canh
  thit_rang_chay_canh: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Thit_rang_chay_canh.jpg/960px-Thit_rang_chay_canh.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1566749382513-5e93b380138d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1707056503922-91c9ebaf0774?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1625477811233-044633d10dd1?auto=format&fit=crop&w=600&q=80',
  ],

  // 26. ca_kho_to (Authentic Cá Kho Tộ & Braised/Fried Fish — ZERO shrimp!)
  ca_kho_to: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/C%C3%A1_kho_t%E1%BB%99.JPG/960px-C%C3%A1_kho_t%E1%BB%99.JPG?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/C%C3%A1_kho_t%E1%BB%99%2C_c%C3%A1_h%C3%BA.jpg/960px-C%C3%A1_kho_t%E1%BB%99%2C_c%C3%A1_h%C3%BA.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1767436093457-84ea9122eb4e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1616557938459-b9baef2b7be3?auto=format&fit=crop&w=600&q=80',
  ],

  // 27. suon_ram (Authentic Sườn Xào Chua Ngọt & Sườn Ram)
  suon_ram: [
    'https://upload.wikimedia.org/wikipedia/commons/7/78/Suon_xao_chua_ngot.png?auto=format&fit=crop&w=600&q=80',
    'https://upload.wikimedia.org/wikipedia/commons/7/7c/Suon_xao_chua_ngot_bac_ninh.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1761315412952-a3a9e3ed06ff?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1761315414596-62d1f1ed5ed9?auto=format&fit=crop&w=600&q=80',
  ],

  // 28. ga_kho_gung_sa
  ga_kho_gung_sa: [
    'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1606728035253-49e8a23146de?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1747628857852-2ffef1e3d06b?auto=format&fit=crop&w=600&q=80',
  ],

  // 29. bo_xao_can_toi
  bo_xao_can_toi: [
    'https://images.unsplash.com/photo-1760504526069-ff0f8bf6e4ca?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1723531055852-744d14ac00b4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1723531055833-49fb132cbaab?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1601226809816-b8c32440158a?auto=format&fit=crop&w=600&q=80',
  ],

  // 30. tom_rim_hai_san
  tom_rim_hai_san: [
    'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1688084468401-4938b073aef2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1771573042846-9f3631a48058?auto=format&fit=crop&w=600&q=80',
  ],

  // 31. dau_sot_ca_chua (Authentic Đậu Sốt Cà Chua Nhồi Thịt)
  dau_sot_ca_chua: [
    'https://upload.wikimedia.org/wikipedia/commons/b/b7/Dau_sot_ca%2C_tofu_stuffed_with_pork%2C_in_tomato_sauce.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1680173073730-852e0ec93bec?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1789999018388-68773a66b33f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1680991172715-4074203a40d3?auto=format&fit=crop&w=600&q=80',
  ],

  // 32. canh_chua (Authentic Canh Chua Cá Lóc / Cá Diêu Hồng)
  canh_chua: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/Canh_chua_c%C3%A1_di%C3%AAu_h%E1%BB%93ng.jpg/960px-Canh_chua_c%C3%A1_di%C3%AAu_h%E1%BB%93ng.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Canh_chua_c%C3%A1_l%C3%B3c_%E1%BB%9F_Th%E1%BB%A7y_Tr%C3%BAc_Qu%C3%A1n%2C_%C4%91%C6%B0%E1%BB%9Dng_Nguy%E1%BB%85n_Nh%E1%BB%AF_L%C3%A3m_%281%29.jpg/960px-Canh_chua_c%C3%A1_l%C3%B3c_%E1%BB%9F_Th%E1%BB%A7y_Tr%C3%BAc_Qu%C3%A1n%2C_%C4%91%C6%B0%E1%BB%9Dng_Nguy%E1%BB%85n_Nh%E1%BB%AF_L%C3%A3m_%281%29.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6d/Canh_chua_%C4%90%C3%B4ng_H%C3%A0.jpg/960px-Canh_chua_%C4%90%C3%B4ng_H%C3%A0.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=600&q=80',
  ],

  // 33. canh_cua_rau_day
  canh_cua_rau_day: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Canh_Ngh%C3%AAu_n%E1%BA%A5u_rau_mu%E1%BB%91ng.jpg/960px-Canh_Ngh%C3%AAu_n%E1%BA%A5u_rau_mu%E1%BB%91ng.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1554054204-b2f70b09d031?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1789296719195-729ce93ca4aa?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1659603667872-915f2b953cb7?auto=format&fit=crop&w=600&q=80',
  ],

  // 34. canh_suon_sau_kim_chi
  canh_suon_sau_kim_chi: [
    'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1665593998976-d957f2827fe7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1608500218861-01091cdc501e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1755438538539-695f7bbfff6a?auto=format&fit=crop&w=600&q=80',
  ],

  // 35. canh_thanh_mat
  canh_thanh_mat: [
    'https://images.unsplash.com/photo-1684866907269-2248f7334a09?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1763470260582-894ae15f43bb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1758293121435-396ed31ebcf4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1584003397078-45ef96d6174d?auto=format&fit=crop&w=600&q=80',
  ],

  // 36. canh_kho_qua (Authentic Canh Khổ Qua Nhồi Thịt)
  canh_kho_qua: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Canh_kh%E1%BB%95_qua.JPG/960px-Canh_kh%E1%BB%95_qua.JPG?auto=format&fit=crop&w=600&q=80',
    'https://upload.wikimedia.org/wikipedia/commons/a/ae/Soup_made_from_stuffed_bitter_melon%2C_Canh_Kho_Qua.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Canh_kh%E1%BB%95_qua_nh%E1%BB%93i_th%E1%BB%8Bt.png/960px-Canh_kh%E1%BB%95_qua_nh%E1%BB%93i_th%E1%BB%8Bt.png?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1750677637369-7fae4d9e361b?auto=format&fit=crop&w=600&q=80',
  ],

  // 37. rau_muong_xao_luoc (Authentic Rau Muống Xào Tỏi)
  rau_muong_xao_luoc: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Rau_mu%E1%BB%91ng_x%C3%A0o_t%E1%BB%8Fi.jpg/960px-Rau_mu%E1%BB%91ng_x%C3%A0o_t%E1%BB%8Fi.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Rau_mu%E1%BB%91ng_x%C3%A0o_t%E1%BB%8Fi%2C_th%C3%A1ng_4_n%C4%83m_2018.jpg/960px-Rau_mu%E1%BB%91ng_x%C3%A0o_t%E1%BB%8Fi%2C_th%C3%A1ng_4_n%C4%83m_2018.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1707270686208-5d1fc168dd7b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1680676066605-08566beed799?auto=format&fit=crop&w=600&q=80',
  ],

  // 38. rau_cu_luoc_kho_quet (Authentic Boiled Vegetables & Kho Quẹt — ZERO scorched rice cake!)
  rau_cu_luoc_kho_quet: [
    'https://images.unsplash.com/photo-1540420828642-fca2c5c18abe?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1780842819206-435e9b52bc60?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1584495018406-036108e89aa2?auto=format&fit=crop&w=600&q=80',
  ],

  // 39. rau_xao_thap_cam
  rau_xao_thap_cam: [
    'https://images.unsplash.com/photo-1576402187878-974f70c890a5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1592578630143-fac65cda7a67?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1648422709905-8c3d148974e1?auto=format&fit=crop&w=600&q=80',
  ],

  // 40. ca_phe_vietnam
  ca_phe_vietnam: [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=600&q=80',
  ],

  // 41. ca_phe_muoi_artisan
  ca_phe_muoi_artisan: [
    'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
  ],

  // 42. tra_dao_cam_sa
  tra_dao_cam_sa: [
    'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1676693420436-7fa448f054eb?auto=format&fit=crop&w=600&q=80',
  ],

  // 43. tra_sua_tran_chau
  tra_sua_tran_chau: [
    'https://images.unsplash.com/photo-1639927663411-35f23bb792b7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1756132539966-8d65f7a9eed8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=600&q=80',
  ],

  // 44. sinh_to_trai_cay
  sinh_to_trai_cay: [
    'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80',
  ],

  // 45. nuoc_mia_nuoc_sam
  nuoc_mia_nuoc_sam: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/39/N%C6%B0%E1%BB%9Bc_m%C3%ADa_Vi%E1%BB%87t_Nam_si%C3%AAu_to_kh%E1%BB%95ng_l%E1%BB%93_20201201.jpg/960px-N%C6%B0%E1%BB%9Bc_m%C3%ADa_Vi%E1%BB%87t_Nam_si%C3%AAu_to_kh%E1%BB%95ng_l%E1%BB%93_20201201.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1624487394217-6d192d003564?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1665582313032-29058cee9c94?auto=format&fit=crop&w=600&q=80',
  ],

  // 46. che_duong_nhan_khuc_bach (Authentic Chè Khúc Bạch Long Nhãn)
  che_duong_nhan_khuc_bach: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/Ch%C3%A8_kh%C3%BAc_b%E1%BA%A1ch_%E1%BB%9F_qu%C3%A1n_Th%E1%BA%A3o_Vy_2020_09_06.jpg/960px-Ch%C3%A8_kh%C3%BAc_b%E1%BA%A1ch_%E1%BB%9F_qu%C3%A1n_Th%E1%BA%A3o_Vy_2020_09_06.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/M%C3%B3n_ti%E1%BB%87c_c%C6%B0%E1%BB%9Bi_%E1%BB%9F_T%C3%A2n_B%C3%ACnh_ng6th8n2023_%28m%C3%B3n_tr%C3%A1ng_mi%E1%BB%87ng%2C_ch%C3%A8_kh%C3%BAc_b%E1%BA%A1ch_long_nh%C3%A3n%29_%281%29.jpg/960px-M%C3%B3n_ti%E1%BB%87c_c%C6%B0%E1%BB%9Bi_%E1%BB%9F_T%C3%A2n_B%C3%ACnh_ng6th8n2023_%28m%C3%B3n_tr%C3%A1ng_mi%E1%BB%87ng%2C_ch%C3%A8_kh%C3%BAc_b%E1%BA%A1ch_long_nh%C3%A3n%29_%281%29.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/M%C3%B3n_ti%E1%BB%87c_c%C6%B0%E1%BB%9Bi_%E1%BB%9F_T%C3%A2n_B%C3%ACnh_ng6th8n2023_%28m%C3%B3n_tr%C3%A1ng_mi%E1%BB%87ng%2C_ch%C3%A8_kh%C3%BAc_b%E1%BA%A1ch_long_nh%C3%A3n%29_%282%29.jpg/960px-M%C3%B3n_ti%E1%BB%87c_c%C6%B0%E1%BB%9Bi_%E1%BB%9F_T%C3%A2n_B%C3%ACnh_ng6th8n2023_%28m%C3%B3n_tr%C3%A1ng_mi%E1%BB%87ng%2C_ch%C3%A8_kh%C3%BAc_b%E1%BA%A1ch_long_nh%C3%A3n%29_%282%29.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1786351763756-32f23f5efd2b?auto=format&fit=crop&w=600&q=80',
  ],

  // 47. che_truyen_thong (Authentic Vietnamese Chè Đậu Xanh, Chè Trôi Nước, Chè Hạt Sen)
  che_truyen_thong: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e2/Vietblackeyedpeas.jpg/960px-Vietblackeyedpeas.jpg?auto=format&fit=crop&w=600&q=80',
    'https://upload.wikimedia.org/wikipedia/commons/b/ba/Banhchay.JPG?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/Ch%C3%A8_Th%E1%BA%A1ch_Tr%E1%BA%AFng_%C4%90%E1%BA%ADu_Xanh_Nh%C3%A3n_Nh%E1%BB%A5c.JPG/960px-Ch%C3%A8_Th%E1%BA%A1ch_Tr%E1%BA%AFng_%C4%90%E1%BA%ADu_Xanh_Nh%C3%A3n_Nh%E1%BB%A5c.JPG?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ec/Ch%C3%A8_%C4%91%E1%BA%ADu_xanh_nha_%C4%91am.jpg/960px-Ch%C3%A8_%C4%91%E1%BA%ADu_xanh_nha_%C4%91am.jpg?auto=format&fit=crop&w=600&q=80',
    'https://upload.wikimedia.org/wikipedia/commons/2/2a/Ch%C3%A8_xo%C3%A0i.jpg?auto=format&fit=crop&w=600&q=80',
  ],

  // 48. flan_caramen (Authentic Bánh Flan Caramen)
  flan_caramen: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Homemade_Flan.jpg/960px-Homemade_Flan.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Italian_Creme_Caramel.JPG/960px-Italian_Creme_Caramel.JPG?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1653988354010-39637252a2db?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1752245055475-8b7c3b4756ac?auto=format&fit=crop&w=600&q=80',
  ],

  // 49. kem_gelato_yogurt
  kem_gelato_yogurt: [
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80',
  ],

  // 50. mam_tom_mam_nem
  mam_tom_mam_nem: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Fried_tofu%2C_rice_noodle_with_shrimp_paste.jpg/960px-Fried_tofu%2C_rice_noodle_with_shrimp_paste.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/Nh%C3%A0_m%C3%ACnh_d%E1%BB%8Bp_L%E1%BB%85_2th9n2023_%28ch%C3%A9n_n%C6%B0%E1%BB%9Bc_m%E1%BA%AFm_t%E1%BB%8Fi_%E1%BB%9Bt%29_%282%29.jpg/960px-Nh%C3%A0_m%C3%ACnh_d%E1%BB%8Bp_L%E1%BB%85_2th9n2023_%28ch%C3%A9n_n%C6%B0%E1%BB%9Bc_m%E1%BA%AFm_t%E1%BB%8Fi_%E1%BB%9Bt%29_%282%29.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1680169610391-1c7d1ede96b9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1779939855596-8506096e2ebe?auto=format&fit=crop&w=600&q=80',
  ],

  // 51. sau_rieng_dac_san (Authentic Opened Durian Fruit)
  sau_rieng_dac_san: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0b/Durian_fruit_opened_PJ_DSC_0802.jpg/960px-Durian_fruit_opened_PJ_DSC_0802.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Durian_eating_at_Magsaysay_Davao_City.jpg/960px-Durian_eating_at_Magsaysay_Davao_City.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1588482415422-a061902e00a4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1648299732724-b480cbb65548?auto=format&fit=crop&w=600&q=80',
  ],

  // 52. trung_vit_lon (Authentic Hột Vịt Lộn / Balut)
  trung_vit_lon: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/Hotvitlon.jpg/960px-Hotvitlon.jpg?auto=format&fit=crop&w=600&q=80',
    'https://upload.wikimedia.org/wikipedia/commons/6/64/Chinese_Balut_sold_in_Nanjing_20100115.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/06749jfCuisine_Foods_Takoyaki_cooking_Balut_Penoy_Baliuag_Bulacanfvf_22.jpg/960px-06749jfCuisine_Foods_Takoyaki_cooking_Balut_Penoy_Baliuag_Bulacanfvf_22.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1682596044362-e280d6bceb7e?auto=format&fit=crop&w=600&q=80',
  ],

  // 53. con_trung_chien_gion
  con_trung_chien_gion: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Tray_with_bowls_of_food_including_fried_insects_used_in_Lao_cuisine.jpg/960px-Tray_with_bowls_of_food_including_fried_insects_used_in_Lao_cuisine.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1761321626747-a2da185beab3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1762488186475-0fc616459bab?auto=format&fit=crop&w=600&q=80',
  ],

  // 54. do_cay_nong_extreme
  do_cay_nong_extreme: [
    'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1637024698421-533d83c7b883?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1709433420422-731e1be1c9aa?auto=format&fit=crop&w=600&q=80',
  ],

  // 55. bizarre_modern_fusion
  bizarre_modern_fusion: [
    'https://images.unsplash.com/photo-1657251867365-912394b305ea?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1657251867373-e1c96a9ed57f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1727867183198-bf1a1b248f22?auto=format&fit=crop&w=600&q=80',
  ],

  // --- GRANULAR CULINARY CLUSTERS (56 - 83) ---
  // 56. trung_cuon_omelette (Authentic Omelette & Scrambled Eggs — ZERO dry bread!)
  trung_cuon_omelette: [
    'https://images.unsplash.com/photo-1776286952319-53e7320e0cd0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1709754521379-00166805eea4?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/Classic_argentine_omelette_%28dish%29.jpg/960px-Classic_argentine_omelette_%28dish%29.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=600&q=80',
  ],

  // 57. steak_beef
  steak_beef: [
    'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=600&q=80',
  ],

  // 58. my_y_pasta
  my_y_pasta: [
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=600&q=80',
  ],

  // 59. burrito_quesadilla
  burrito_quesadilla: [
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1671572579845-52270341950f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1632660346941-023cc64e1252?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1752095809096-f09d22c466c5?auto=format&fit=crop&w=600&q=80',
  ],

  // 60. sup_kem_tay_chowder
  sup_kem_tay_chowder: [
    'https://images.unsplash.com/photo-1578861256505-d3be7cb037d3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1666083580269-6f409e1765d8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1757489345059-31d51e241a3e?auto=format&fit=crop&w=600&q=80',
  ],

  // 61. salad_tay_caesar
  salad_tay_caesar: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1582034986517-30d163aa1da9?auto=format&fit=crop&w=600&q=80',
  ],

  // 62. banh_mi_sandwich_toast
  banh_mi_sandwich_toast: [
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1613769049987-b31b641f25b1?auto=format&fit=crop&w=600&q=80',
  ],

  // 63. risotto_paella
  risotto_paella: [
    'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1621841957884-1210fe19d66d?auto=format&fit=crop&w=600&q=80',
  ],

  // 64. seafood_western
  seafood_western: [
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1641898378716-1f38ec04bb0f?auto=format&fit=crop&w=600&q=80',
  ],

  // 65. bbq_ribs_roast (Authentic BBQ Pork Ribs & Chops — ZERO whole chicken or salmon!)
  bbq_ribs_roast: [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Boston_Market_BBQ_Ribs_close_up_%2827988017902%29.jpg/960px-Boston_Market_BBQ_Ribs_close_up_%2827988017902%29.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fa/Plate_of_brisket%2C_BBQ_ribs%2C_pulled_pork%2C_South_Texas_beans_and_pickled_jalape%C3%B1os_from_the_Pinkerton%27s_BBQ_San_Antonio_location.jpg/960px-Plate_of_brisket%2C_BBQ_ribs%2C_pulled_pork%2C_South_Texas_beans_and_pickled_jalape%C3%B1os_from_the_Pinkerton%27s_BBQ_San_Antonio_location.jpg?auto=format&fit=crop&w=600&q=80',
  ],

  // 66. pancake_waffle
  pancake_waffle: [
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1612182062633-9ff3b3598e96?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1620991565081-82743a5a499c?auto=format&fit=crop&w=600&q=80',
  ],

  // 67. overnight_oats_granola
  overnight_oats_granola: [
    'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1654923064926-be7e64267a31?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1692071106919-01bc0b9b0919?auto=format&fit=crop&w=600&q=80',
  ],

  // 68. curry_dishes
  curry_dishes: [
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80',
  ],

  // 69. soup_clear_western
  soup_clear_western: [
    'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1643786661490-966f1877effa?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1672667509947-865215fa66db?auto=format&fit=crop&w=600&q=80',
  ],

  // 70. goi_nom_vietnam
  goi_nom_vietnam: [
    'https://images.unsplash.com/photo-1729292836660-1bd9884457dc?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1582088498475-efe525179fe0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1749146878349-b6dc0f931d5d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
  ],

  // 71. cha_ca_vietnam (Authentic Chả Cá Lã Vọng Hà Nội)
  cha_ca_vietnam: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Ch%E1%BA%A3_c%C3%A1_L%C3%A3_V%E1%BB%8Dng.jpg/960px-Ch%E1%BA%A3_c%C3%A1_L%C3%A3_V%E1%BB%8Dng.jpg?auto=format&fit=crop&w=600&q=80',
    'https://upload.wikimedia.org/wikipedia/commons/0/02/Cha_ca_La_Vong.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/Ch%E1%BA%A3_c%C3%A1_L%C3%A3_V%E1%BB%8Dng_H%C3%A0_N%E1%BB%99i.jpg/960px-Ch%E1%BA%A3_c%C3%A1_L%C3%A3_V%E1%BB%8Dng_H%C3%A0_N%E1%BB%99i.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1758705206993-f141bbe56193?auto=format&fit=crop&w=600&q=80',
  ],

  // 72. banh_xeo_banh_khot (Authentic Bánh Xèo & Bánh Khọt)
  banh_xeo_banh_khot: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/B%C3%A1nh_x%C3%A8o_1.jpg/960px-B%C3%A1nh_x%C3%A8o_1.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/B%C3%A1nh_x%C3%A8o_with_n%C6%B0%E1%BB%9Bc_m%E1%BA%AFm.jpg/960px-B%C3%A1nh_x%C3%A8o_with_n%C6%B0%E1%BB%9Bc_m%E1%BA%AFm.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d0/B%C3%A1nh_kh%E1%BB%8Dt_by_Baoothersks.jpg/960px-B%C3%A1nh_kh%E1%BB%8Dt_by_Baoothersks.jpg?auto=format&fit=crop&w=600&q=80',
    'https://upload.wikimedia.org/wikipedia/commons/b/b2/B%C3%A1nh_kh%E1%BB%8Dt_%282020-3-28%29.jpg?auto=format&fit=crop&w=600&q=80',
  ],

  // 73. banh_cuon_banh_uot
  banh_cuon_banh_uot: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/B%C3%A1nh_cu%E1%BB%91n.jpg/960px-B%C3%A1nh_cu%E1%BB%91n.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1786114774610-8696925848c6?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1719454261026-fc7f0ffc1835?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1719454260936-caa0a804f154?auto=format&fit=crop&w=600&q=80',
  ],

  // 74. chao_vietnam (Authentic Vietnamese Cháo)
  chao_vietnam: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Ch%C3%A1o_l%C3%B2ng.jpg/960px-Ch%C3%A1o_l%C3%B2ng.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/Ch%C3%A1o_l%C3%B2ng_B%C3%ACnh_Long_ng%C3%A0y_02_th%C3%A1ng_11_n%C4%83m_2018_%282%29.jpg/960px-Ch%C3%A1o_l%C3%B2ng_B%C3%ACnh_Long_ng%C3%A0y_02_th%C3%A1ng_11_n%C4%83m_2018_%282%29.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1766761562530-c8dd12c96d9a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1621658537360-dfcb008fe19f?auto=format&fit=crop&w=600&q=80',
  ],

  // 75. lau_vietnam
  lau_vietnam: [
    'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1777557888437-a017aaef828a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1708597523963-40b30f846281?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1682496178113-6275890f1fd7?auto=format&fit=crop&w=600&q=80',
  ],

  // 76. nem_cuon_spring_rolls (Authentic Gỏi Cuốn Tôm Thịt)
  nem_cuon_spring_rolls: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Summer_roll.jpg/960px-Summer_roll.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f2/Goi_cuon_Phuongnhu.JPG/960px-Goi_cuon_Phuongnhu.JPG?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/G%E1%BB%8Fi_cu%E1%BB%91n.jpg/960px-G%E1%BB%8Fi_cu%E1%BB%91n.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1594020293008-5f99f60bd4d7?auto=format&fit=crop&w=600&q=80',
  ],

  // 77. trung_chien_op_la
  trung_chien_op_la: [
    'https://images.unsplash.com/photo-1691480184494-d9f822edd4d1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1582169505937-b9992bd01ed9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1612487439139-c2d7bac13577?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1608039762150-b682eb589303?auto=format&fit=crop&w=600&q=80',
  ],

  // 78. ha_cao_dimsum
  ha_cao_dimsum: [
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1789999375811-d20146a62be4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1550303659-a777c03a27bd?auto=format&fit=crop&w=600&q=80',
  ],

  // 79. muc_bach_tuoc_nuong_xao (Authentic Grilled Squid & Octopus)
  muc_bach_tuoc_nuong_xao: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Calamari_grillati.JPG/960px-Calamari_grillati.JPG?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Grilled_squid_001.jpg/960px-Grilled_squid_001.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Flavorful_Grilled_Squid.jpg/960px-Flavorful_Grilled_Squid.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=600&q=80',
  ],

  // 80. thit_heo_quay_kho_dua (Authentic Crispy Roast Pork Belly)
  thit_heo_quay_kho_dua: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/Crispy_Roasted_Pork_Belly_with_Rice.jpg/960px-Crispy_Roasted_Pork_Belly_with_Rice.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/Roast_pork_and_Char_Siu_Rice%2C_Singapore_September_2017.jpg/960px-Roast_pork_and_Char_Siu_Rice%2C_Singapore_September_2017.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1759670338079-8633e15653f2?auto=format&fit=crop&w=600&q=80',
  ],

  // 81. canh_kim_chi_hai_san
  canh_kim_chi_hai_san: [
    'https://images.unsplash.com/photo-1760228865341-675704c22a5b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1777113310299-c3e41dec4e0f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1746718547557-1a0e05bed94b?auto=format&fit=crop&w=600&q=80',
  ],

  // 82. mon_chay_tofu_mushroom
  mon_chay_tofu_mushroom: [
    'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1785031765104-9af3d84fd3ff?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1762305194201-077e7e23ccf2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1591522913962-3ecfa6b271f1?auto=format&fit=crop&w=600&q=80',
  ],

  // 83. western_chicken_roast (Authentic Western Roast / Pan-Seared / Baked Chicken Breast & Thigh)
  western_chicken_roast: [
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/Chicken_piccata.jpg/960px-Chicken_piccata.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Cordon_Bleu_Mit_Kroketten.jpg/960px-Cordon_Bleu_Mit_Kroketten.jpg?auto=format&fit=crop&w=600&q=80',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Chicken_cordon_bleu%2C_Bee%27s_Steak_and_Shake%2C_Sleman%2C_Yogyakarta.jpg/960px-Chicken_cordon_bleu%2C_Bee%27s_Steak_and_Shake%2C_Sleman%2C_Yogyakarta.jpg?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=600&q=80',
  ],
};

function combinePools(...poolKeys: string[]): string[] {
  const urls: string[] = [];
  for (const key of poolKeys) {
    const list = CULINARY_82_POOLS[key];
    if (list) urls.push(...list);
  }
  return Array.from(new Set(urls));
}

export const CULINARY_55_POOLS = CULINARY_82_POOLS;

export const FOOD_IMAGE_POOLS: Record<string, string[]> = {
  ...CULINARY_82_POOLS,

  // ==========================================================================
  // WESTERN ALIAS POOLS (100% test & semantic backward compatibility)
  // ==========================================================================
  western_omelette_egg: CULINARY_82_POOLS.trung_cuon_omelette,
  western_steak: CULINARY_82_POOLS.steak_beef,
  western_pasta: CULINARY_82_POOLS.my_y_pasta,
  western_soup: CULINARY_82_POOLS.sup_kem_tay_chowder,
  western_salad: CULINARY_82_POOLS.salad_tay_caesar,
  western_toast_pancake: combinePools('banh_mi_sandwich_toast', 'pancake_waffle'),
  western_sides: [
    'https://images.unsplash.com/photo-1707616954324-99c89a78a20d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1724041305788-afe63ae3bb5a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1771161409352-16aa1819632b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1625938144755-652e08e359b7?auto=format&fit=crop&w=600&q=80',
  ],
  western_seafood: CULINARY_82_POOLS.seafood_western,
  trai_cay_trang_mieng: [
    'https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80',
  ],

  // ==========================================================================
  // LEGACY BACKWARD-COMPATIBILITY ALIAS POOLS
  // (Ensures 100% compatibility with all existing tests and callers)
  // ==========================================================================
  pho_noodles: combinePools('pho_bo', 'pho_ga', 'bun_cha', 'bun_bo_hue', 'bun_rieu', 'hu_tieu', 'mi_quang_cao_lau'),
  coffee: combinePools('ca_phe_vietnam', 'ca_phe_muoi_artisan'),
  tea_drink: combinePools('tra_dao_cam_sa', 'tra_sua_tran_chau', 'nuoc_mia_nuoc_sam'),
  soup_dish: combinePools('canh_chua', 'canh_cua_rau_day', 'canh_suon_sau_kim_chi', 'canh_thanh_mat', 'canh_kho_qua'),
  fish_seafood: combinePools('ca_kho_to', 'tom_rim_hai_san', 'cha_ca_vietnam', 'seafood_western'),
  beef_dish: combinePools('bo_xao_can_toi', 'steak_beef'),
  pork_dish: combinePools('thit_kho_tau', 'thit_rang_chay_canh', 'suon_ram', 'thit_heo_quay_kho_dua'),
  veggie_dish: combinePools('rau_muong_xao_luoc', 'rau_cu_luoc_kho_quet', 'rau_xao_thap_cam', 'dau_sot_ca_chua', 'mon_chay_tofu_mushroom'),
  dessert: combinePools('che_duong_nhan_khuc_bach', 'che_truyen_thong', 'flan_caramen', 'kem_gelato_yogurt'),
  bizarre_dare: combinePools(
    'mam_tom_mam_nem',
    'sau_rieng_dac_san',
    'trung_vit_lon',
    'con_trung_chien_gion',
    'do_cay_nong_extreme',
    'bizarre_modern_fusion'
  ),
  snacks: combinePools(
    'french_fries',
    'hotdogs_sausage',
    'banh_trang_nuong',
    'banh_trang_tron',
    'nem_chua_ran',
    'xien_que_ca_vien'
  ),
};

// ============================================================================
// 3. PRE-LEXICAL PHRASE MASKING & NORMALIZATION
// ============================================================================

export interface NormalizedDish {
  raw: string;
  normalized: string;
  tokens: string[];
  hasTomatoMask: boolean;
  hasEggplantMask: boolean;
  hasCoffeeMask: boolean;
  hasNamVangMask: boolean;
  hasCurryMask: boolean;
}

/**
 * Pre-lexical mask definitions for tone-homographs and multi-word idioms.
 * Prevents "cà chua" (tomato), "cà tím" (eggplant), or "cà phê" (coffee)
 * from colliding with "cá" (fish) after diacritic removal.
 */
const PRE_LEXICAL_MASKS: [RegExp, string][] = [
  [/cà chua|ca chua/gi, '__VEG_CA_CHUA__'],
  [/sốt cà|xốt cà/gi, 'sốt __VEG_CA_CHUA__'],
  [/cà tím|ca tim/gi, '__VEG_CA_TIM__'],
  [/cà pháo|ca phao/gi, '__VEG_CA_PHAO__'],
  [/cà ri|ca ri|curry/gi, '__DISH_CA_RI__'],
  [/cà phê|ca phe|coffee|càphe/gi, '__DRINK_CA_PHE__'],
  [/phô mai|pho mai/gi, '__INGR_PHO_MAI__'],
  [/bơ lạt|bo lat|bơ thơm|bo thom/gi, '__INGR_BUTTER__'],
  [/sốt kem|sot kem|kem chua|kem nấm|kem nam|kem tỏi|kem toi|kem béo|kem beo/gi, '__SAUCE_CREAM__'],
  [/nam vang/gi, '__GEO_NAM_VANG__'],
  [/miền tây|miền trung|miền bắc|miền nam|mien tay|mien trung|mien bac|mien nam/gi, '__GEO_REGION__'],
  [/bánh mì chảo|banh mi chao/gi, '__DISH_BANH_MI_CHAO__'],
  [/cơm gà xối mỡ|com ga xoi mo/gi, '__DISH_COM_GA_XOI_MO__'],
  [/cơm cháy|com chay(?=.*(?:mo hanh|cha bong|day noi|kho quet|nuoc mam|mam|gion))/gi, '__DISH_COM_CHAY__'],
  [/bún đậu mắm tôm|bun dau mam tom/gi, '__DISH_BUN_DAU_MAM_TOM__'],
  [/bún chả|bun cha/gi, '__DISH_BUN_CHA__'],
  [/bún bò huế|bun bo hue/gi, '__DISH_BUN_BO_HUE__'],
  [/bún riêu|bun rieu/gi, '__DISH_BUN_RIEU__'],
  [/mì quảng|mi quang/gi, '__DISH_MI_QUANG__'],
  [/cao lầu|cao lau/gi, '__DISH_CAO_LAU__'],
  [/nấm đùi gà|nam dui ga/gi, '__VEG_NAM_DUI_GA__'],
  [/cải bó xôi|cai bo xoi/gi, '__VEG_SPINACH__'],
  [/cá trứng|ca trung/gi, '__FISH_CAPELIN__'],
  [/bánh mì tôm|banh mi tom/gi, '__DISH_BANH_MI_TOM__'],
  [/cà rốt|ca rot/gi, '__VEG_CA_ROT__'],
  [/quế hồi|que hoi/gi, '__SPICE_QUE_HOI__'],
  [/muối xổi|muoi xoi|bóp xổi|bop xoi/gi, '__PREP_MUOI_XOI__'],
  [/mùi chảo|mui chao|chảo gang|chao gang/gi, '__PREP_WOK__'],
  [/chảy nước mắt|chay nuoc mat/gi, '__IDIOM_TEARS__'],
];

export function normalizeVietnameseDish(rawTitle: string): NormalizedDish {
  if (!rawTitle) {
    return {
      raw: '',
      normalized: '',
      tokens: [],
      hasTomatoMask: false,
      hasEggplantMask: false,
      hasCoffeeMask: false,
      hasNamVangMask: false,
      hasCurryMask: false,
    };
  }

  let text = rawTitle.toLowerCase().replace(/œ/g, 'oe').replace(/Œ/g, 'oe');

  let hasTomatoMask = false;
  let hasEggplantMask = false;
  let hasCoffeeMask = false;
  let hasNamVangMask = false;
  let hasCurryMask = false;

  for (const [pattern, mask] of PRE_LEXICAL_MASKS) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      if (mask === '__VEG_CA_CHUA__') hasTomatoMask = true;
      if (mask === '__VEG_CA_TIM__') hasEggplantMask = true;
      if (mask === '__DRINK_CA_PHE__') hasCoffeeMask = true;
      if (mask === '__GEO_NAM_VANG__') hasNamVangMask = true;
      if (mask === '__DISH_CA_RI__') hasCurryMask = true;
      pattern.lastIndex = 0;
      text = text.replace(pattern, mask);
    }
  }

  const normalized = removeVietnameseTones(text).toLowerCase();

  const tokens = normalized
    .replace(/[^a-z0-9_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    raw: rawTitle,
    normalized,
    tokens,
    hasTomatoMask,
    hasEggplantMask,
    hasCoffeeMask,
    hasNamVangMask,
    hasCurryMask,
  };
}

// ============================================================================
// 4. PRECEDENCE-WEIGHTED SEMANTIC CLUSTER RULE DEFINITIONS
// ============================================================================

interface ClusterRule {
  key: string;
  exactCompounds?: string[];
  requiredTokenGroups?: string[][]; // (group1 OR) AND (group2 OR)
  modifiers?: string[];
  disqualifiers?: string[];
  categoryBonus?: string[];
}

function matchesTokenOrPhrase(phrase: string, normTitle: string, tokens: string[]): boolean {
  if (phrase.includes(' ')) {
    return normTitle.includes(phrase);
  }
  return tokens.includes(phrase);
}

const CLUSTER_RULES: ClusterRule[] = [
  // --- FAST FOOD & SNACKS ---
  {
    key: 'burger',
    exactCompounds: ['burger', 'hamburger', 'cheeseburger', 'beef burger'],
    requiredTokenGroups: [['burger', 'hamburger', 'cheeseburger']],
    modifiers: ['bo', 'ga', 'ca', 'tom', 'cheese', 'pho mai', 'bacon', 'trung', 'bbq', 'crispy'],
    categoryBonus: ['an-nhanh', 'mon-chinh'],
  },
  {
    key: 'fried_chicken',
    exactCompounds: [
      '__dish_com_ga_xoi_mo__', 'ga xoi mo', 'ga ran', 'ga chien', 'canh ga chien',
      'dui ga chien', 'chicken nuggets', 'ga pop', 'ga sot cay', 'ga sot me', 'ga sot bo', 'ga gion',
      'canh ga ap chao', 'ran gion rum'
    ],
    requiredTokenGroups: [
      ['ga', 'chicken'],
      ['ran', 'xoi mo', 'chien', 'nuggets', 'pop', 'gion', 'crispy']
    ],
    modifiers: ['ran', 'chien', 'xoi mo', 'gion', 'canh ga', 'dui ga', 'sot cay'],
    disqualifiers: ['burger', 'hamburger', 'sandwich', 'banh mi', 'luoc', 'hap', 'chao ga', 'pho ga', '__veg_nam_dui_ga__', 'cordon bleu', 'piccata', 'parmigiana'],
    categoryBonus: ['an-nhanh', 'mon-chinh', 'mon-man'],
  },
  {
    key: 'western_chicken_roast',
    exactCompounds: [
      'thit ga kieu au', 'uc ga phi le', 'ga cordon bleu', 'cordon bleu',
      'ga piccata', 'piccata', 'ga parmigiana', 'parmigiana', 'ga quay thao moc',
      'ga nuong thao moc', 'ga ap chao', 'dui ga nuong bbq', 'canh ga nuong bbq',
      'ga nuong bbq', 'ga nuong mat ong', 'dui ga nuong mat ong', 'canh ga nuong mat ong'
    ],
    requiredTokenGroups: [
      ['thit ga kieu au', 'uc ga phi le', 'cordon bleu', 'piccata', 'parmigiana', 'ga quay thao moc', 'ga nuong thao moc', 'dui ga nuong bbq', 'canh ga nuong bbq', 'ga nuong bbq']
    ],
    disqualifiers: ['ran gion rum'],
    categoryBonus: ['mon-man', 'mon-chinh'],
  },
  {
    key: 'pizza',
    exactCompounds: ['pizza'],
    requiredTokenGroups: [['pizza']],
    disqualifiers: ['banh trang nuong'],
  },
  {
    key: 'french_fries',
    exactCompounds: [
      'khoai tay chien', 'khoai lang ken', 'khoai lac', 'french fries', 'potato chips',
      'khoai lang luoc', 'khoai tay loc xoay', 'bap rang bo', 'snack da heo',
      'banh tai heo', 'banh quay', 'banh que', 'dau phong rang', 'hat dieu rang', 'rong bien chay toi'
    ],
    requiredTokenGroups: [
      ['khoai', 'bap rang bo', 'snack da heo', 'banh tai heo', 'banh quay', 'banh que', 'dau phong rang', 'hat dieu rang', 'rong bien chay toi'],
      ['chien', 'lac', 'ken', 'fries', 'chips', 'loc xoay', 'bap rang bo', 'snack da heo', 'banh tai heo', 'banh quay', 'banh que', 'rang', 'chay toi']
    ],
    disqualifiers: ['khoai tay nghien', 'khoai tay dut lo', 'canh', 'sup', 'ham', 'bo kho', 'ca ri', '__dish_ca_ri__'],
    categoryBonus: ['an-vat'],
  },
  {
    key: 'hotdogs_sausage',
    exactCompounds: ['hotdog', 'xuc xich', 'lap xuong', 'xuc xich duc', 'xuc xich nuong'],
    requiredTokenGroups: [['hotdog', 'xuc xich', 'lap xuong']],
    disqualifiers: [
      'omelette', 'trung cuon', 'trung khuay', 'scrambled', 'banh mi', '__dish_banh_mi_chao__',
      'chao', 'my y', 'pasta', 'com', 'com chien', 'com rang', 'xoi', 'pizza'
    ],
    categoryBonus: ['an-vat'],
  },
  {
    key: 'tacos_wraps',
    exactCompounds: ['taco', 'tacos', 'burrito', 'quesadilla', 'wrap cuon', 'wrap'],
    requiredTokenGroups: [['taco', 'tacos', 'burrito', 'quesadilla', 'wrap']],
  },
  {
    key: 'banh_trang_nuong',
    exactCompounds: ['banh trang nuong', 'pizza da lat'],
    requiredTokenGroups: [
      ['banh trang'],
      ['nuong']
    ],
    categoryBonus: ['an-vat'],
  },
  {
    key: 'banh_trang_tron',
    exactCompounds: ['banh trang tron', 'banh trang cuon', 'banh trang bo', 'banh trang me'],
    requiredTokenGroups: [
      ['banh trang'],
      ['tron', 'cuon', 'bo', 'me', 'cham', 'sa te']
    ],
    categoryBonus: ['an-vat'],
  },
  {
    key: 'nem_chua_ran',
    exactCompounds: ['nem chua ran', 'nem chua nuong', 'nem nuong nha trang', 'cha gio', 'ram cuon', 'nem ran'],
    requiredTokenGroups: [
      ['nem chua', 'nem', 'cha gio', 'ram'],
      ['ran', 'nuong', 'chien', 'cuon']
    ],
    disqualifiers: ['bun thit nuong', 'bun cha', '__dish_bun_cha__'],
    categoryBonus: ['an-vat'],
  },
  {
    key: 'xien_que_ca_vien',
    exactCompounds: ['ca vien chien', 'bo vien chien', 'xien que', 'xien banh', 'vien chien', 'ho lo nuong', 'ca vien'],
    requiredTokenGroups: [
      ['vien', 'xien', 'ho lo'],
      ['chien', 'que', 'nuong']
    ],
    categoryBonus: ['an-vat'],
  },

  // --- VIETNAMESE NOODLE & RICE CLASSICS ---
  {
    key: 'pho_bo',
    exactCompounds: [
      'pho bo', 'pho bo tai', 'pho tai lan', 'pho tai', 'pho chin',
      'pho nam', 'pho gau', 'pho sot vang', 'pho bap bo', 'pho than bo'
    ],
    requiredTokenGroups: [
      ['pho'],
      ['bo', 'tai', 'chin', 'gau', 'nam', 'bap', 'sot vang', 'than bo']
    ],
    disqualifiers: [
      'pho ga', 'pho xao', 'cuon', '__ingr_pho_mai__', 'pho mai', 'salad',
      'banh mi', 'pizza', 'pasta', 'burger', 'sandwich', 'caprese', 'anchor', 'parmesan'
    ],
    categoryBonus: ['mon-chinh', 'an-sang'],
  },
  {
    key: 'pho_ga',
    exactCompounds: [
      'pho ga', 'pho ga doi', 'pho ga tron', 'pho ga ta', 'pho dui ga', 'pho ga xe',
      'bun thang', 'bun ga', 'bun ngan', 'mien ga', 'mien ngan', 'mien vit', 'mien luon',
      'mien suon', 'mien nau', 'mi nau thit ga', 'mien cua dong'
    ],
    requiredTokenGroups: [
      ['pho', 'mien', 'bun ngan', 'bun thang', 'bun ga'],
      ['ga', 'ngan', 'vit', 'luon', 'suon', 'tom', 'moc', 'thang', 'cua dong']
    ],
    disqualifiers: ['bo', 'xao'],
    categoryBonus: ['mon-chinh', 'an-sang'],
  },
  {
    key: 'bun_cha',
    exactCompounds: ['__dish_bun_cha__', 'bun cha', 'bun cha ha noi', 'cha mieng cha bam'],
    requiredTokenGroups: [
      ['bun cha', '__dish_bun_cha__']
    ],
    disqualifiers: ['cha ca', 'cha gio'],
    categoryBonus: ['mon-chinh', 'an-sang'],
  },
  {
    key: 'bun_bo_hue',
    exactCompounds: [
      '__dish_bun_bo_hue__', 'bun bo hue', 'bun bo gio heo', 'bun bo cay',
      'bun gio heo', 'bun long heo', 'bun suon', 'bun bo tai'
    ],
    requiredTokenGroups: [
      ['bun bo hue', '__dish_bun_bo_hue__', 'bun gio heo', 'bun long heo', 'bun suon', 'bun bo tai']
    ],
    categoryBonus: ['mon-chinh', 'an-sang'],
  },
  {
    key: 'bun_rieu',
    exactCompounds: [
      '__dish_bun_rieu__', 'bun rieu', 'bun rieu cua', 'bun rieu oc', 'canh bun', 'bun oc',
      'bun moc', 'bun doc mung', 'bun ca', 'bun sua', 'bun mam', 'bun ken',
      'bun nuoc leo', 'bun suong', 'bun thit bam', 'bun cha ca', 'bun hen'
    ],
    requiredTokenGroups: [
      [
        'bun rieu', '__dish_bun_rieu__', 'canh bun', 'bun oc',
        'bun moc', 'bun doc mung', 'bun ca', 'bun sua', 'bun mam', 'bun ken',
        'bun nuoc leo', 'bun suong', 'bun thit bam', 'bun cha ca', 'bun hen'
      ]
    ],
    categoryBonus: ['mon-chinh', 'an-sang'],
  },
  {
    key: 'bun_dau_mam_tom',
    exactCompounds: ['__dish_bun_dau_mam_tom__', 'bun dau', 'bun dau mam tom', 'bun dau cha com', 'met bun dau'],
    requiredTokenGroups: [
      ['bun dau', '__dish_bun_dau_mam_tom__']
    ],
    categoryBonus: ['mon-chinh'],
  },
  {
    key: 'bun_thit_nuong',
    exactCompounds: ['bun thit nuong', 'bun thit nuong cha gio', 'bun cha gio', 'bun thit xao', 'bun tuoi'],
    requiredTokenGroups: [
      ['bun'],
      ['thit nuong', 'cha gio', 'thit xao']
    ],
    categoryBonus: ['mon-chinh', 'an-sang'],
  },
  {
    key: 'hu_tieu',
    exactCompounds: [
      'hu tieu', 'hu tieu nam vang', '__geo_nam_vang__', 'hu tieu muc', 'hu tieu go', 'hu tieu suon',
      'banh canh', 'mi hoanh thanh', 'mi van than', 'mi vit tiem', 'mien xao', 'mi xao', 'mi tron', 'mien tron',
      'mi tom', 'mi hao hao', 'banh tam bi', 'mi suon', 'mien luon xao'
    ],
    requiredTokenGroups: [
      [
        'hu tieu', '__geo_nam_vang__', 'banh canh', 'mi hoanh thanh', 'mi van than', 'mi vit tiem',
        'mien xao', 'mi xao', 'mi tron', 'mien tron', 'mi tom', 'mi hao hao', 'banh tam bi', 'mi suon', 'mien luon xao'
      ]
    ],
    disqualifiers: ['banh mi', '__dish_banh_mi_tom__', 'kep gion'],
    categoryBonus: ['mon-chinh', 'an-sang'],
  },
  {
    key: 'mi_quang_cao_lau',
    exactCompounds: ['__dish_mi_quang__', '__dish_cao_lau__', 'mi quang', 'cao lau', 'cao lau hoi an', 'mi quang tom thit'],
    requiredTokenGroups: [
      ['mi quang', 'cao lau', '__dish_mi_quang__', '__dish_cao_lau__']
    ],
    categoryBonus: ['mon-chinh', 'an-sang'],
  },
  {
    key: 'banh_mi',
    exactCompounds: [
      'banh mi', '__dish_banh_mi_chao__', '__dish_banh_mi_tom__', 'banh mi pate', 'banh mi kep',
      'banh mi chao', 'banh mi heo quay', 'sandwich', 'banh mi xiu mai',
      'banh mi que', 'pate'
    ],
    requiredTokenGroups: [
      ['banh mi', '__dish_banh_mi_chao__', '__dish_banh_mi_tom__', 'sandwich']
    ],
    disqualifiers: [
      'banh mi nuong muoi ot', 'sup', 'sup kem', 'chowder', 'soup', 'bo kho',
      'ca ri', '__dish_ca_ri__', 'french toast', 'avocado toast', 'banh mi nuong bo toi', 'banh mi bo toi',
      'banh mi nuong kieu phap', 'banh mi bo sap', 'omelette', 'trung cuon'
    ],
    categoryBonus: ['an-nhanh', 'mon-chinh'],
  },
  {
    key: 'com_tam',
    exactCompounds: [
      'com tam', 'com tam suon', 'com tam suon bi cha',
      'com suon', 'com suon non', 'com suon bi'
    ],
    requiredTokenGroups: [
      ['com tam', 'com suon']
    ],
    disqualifiers: ['mam com'],
    categoryBonus: ['mon-chinh'],
  },
  {
    key: 'com_rang',
    exactCompounds: [
      'com rang', 'com chien', 'com rang dua bo', 'com rang duong chau', 'com chien duong chau',
      '__dish_com_chay__', 'com thit heo xao kim chi', 'com ga xe phay', 'com ga hoi an', 'com luon', 'com nguoi'
    ],
    requiredTokenGroups: [
      ['com', '__dish_com_chay__'],
      ['rang', 'chien', '__dish_com_chay__', 'kim chi', 'ga xe', 'xe phay', 'hoi an', 'luon', 'unagi', 'nguoi']
    ],
    modifiers: ['duong chau', 'dua bo', 'hai san', 'trung', 'toi', 'cha bong', 'mo hanh'],
    disqualifiers: ['mam com'],
    categoryBonus: ['mon-chinh', 'an-sang'],
  },
  {
    key: 'xoi',
    exactCompounds: [
      'xoi', 'xoi xeo', 'xoi ga', 'xoi thit kho', 'xoi man', 'xoi khuc', 'xoi gac',
      'xoi vo', 'xoi bap', 'xoi dau', 'xoi lac', 'xoi san', 'xoi com', 'xoi la cam',
      'xoi pate', 'xoi lap xuong', 'xoi suon', 'xoi nam', 'xoi bo', 'xoi cha', 'xoi trung',
      'banh tet', 'banh chung', 'com lam', 'com nam'
    ],
    requiredTokenGroups: [['xoi', 'banh tet', 'banh chung', 'com lam', 'com nam']],
    modifiers: ['pate', 'lap xuong', 'suon', 'cha ca', 'cha lua', 'bo xao', 'nam', 'gac', 'xeo'],
    disqualifiers: ['__dish_com_ga_xoi_mo__', 'xoi mo', 'bop xoi', 'muoi xoi', '__prep_muoi_xoi__', '__veg_spinach__'],
    categoryBonus: ['mon-chinh', 'an-nhanh', 'an-sang'],
  },

  // --- HOME-COOKED MEAL SETS (MÓN MẶN, CANH, RAU) ---
  {
    key: 'thit_kho_tau',
    exactCompounds: [
      'thit kho tau', 'thit kho trung', 'thit kho hot vit', 'thit kho nuoc dua', 'thit ba chi kho',
      'ba chi kho', 'thit kho tieu', 'thit kho to', 'thit ba roi kho', 'mong gio heo', 'thit nac dam hap'
    ],
    requiredTokenGroups: [
      ['thit', 'ba chi', 'ba roi', 'heo', 'lon', 'mong gio', 'chan gio'],
      ['kho tau', 'kho trung', 'nuoc dua', 'kho', 'kho to', 'kho tieu', 'om chuoi', 'ninh mem']
    ],
    disqualifiers: ['thit bo', 'bo bam', 'canh'],
    categoryBonus: ['mon-man'],
  },
  {
    key: 'thit_rang_chay_canh',
    exactCompounds: [
      'thit rang chay canh', 'thit ba chi rang', 'thit rang man', 'ba chi chay canh', 'ba chi rim',
      'cha la lot', 'cha lua', 'thit dai heo', 'thit ba roi mot nang', 'thit nac dam',
      'thit ba chi nuong', 'thit ba chi chien', 'thit xa xiu', 'nem nuong', 'tai mui heo',
      'tai heo gion', 'thit ba chi luoc', 'thit bam vien', 'nau gia cay', 'xao mam ruoc',
      'tai heo ngam', 'cha ruoi'
    ],
    requiredTokenGroups: [
      ['thit', 'ba chi', 'ba roi', 'cha lua', 'cha la lot', 'nac dam', 'thit dai', 'mong gio', 'xa xiu', 'tai heo', 'thit bam', 'cha ruoi'],
      ['rang', 'chay canh', 'rim', 'ram', 'chien sa ot', 'nuong', 'ap chao', 'xao', 'sot', 'hap', 'luoc', 'gion', 'gia cay', 'mam ruoc', 'ngam giam', 'chien']
    ],
    disqualifiers: [
      '__veg_ca_chua__', 'dau hu', 'dau phu', 'nhoi thit', 'don thit', 'oc buou', 'kho qua', 'muop dang', 'canh',
      'thit bo', 'bo bam', 'nom', 'goi', 'trung hap'
    ],
    categoryBonus: ['mon-man'],
  },
  {
    key: 'ca_kho_to',
    exactCompounds: [
      'ca kho to', 'ca kho tieu', 'ca kho rieng', 'ca ba sa kho', 'ca bong kho',
      'ca basa kho', 'ca loc kho', 'ca nuc kho', 'ca kho', 'ca chien', 'ca nuong', 'ca dieu hong',
      'ca chep om dua', 'ca thu sot', 'ca ro kho', 'cakeo kho', 'ca keo kho', 'ca tram kho',
      'ca chim ran', 'ca thu ngu kho', 'ca chem phi le', 'ca trich', 'long ca ba sa', 'ca bong song',
      '__fish_capelin__', 'ca basa', 'ca loc', 'ca thu', 'ca ro', 'ca nuc', 'ca tre',
      'ca chim sot', 'ca lang nuong'
    ],
    requiredTokenGroups: [
      ['ca', 'fish', '__fish_capelin__'],
      ['kho', 'chien', 'ran', 'nuong', 'to', 'kho to', 'basa', 'loc', 'nuc', 'hoi', 'dieu hong', 'chep', 'thu', 'tram', 'ro', 'keo', 'om dua', 'chim', 'chem', 'trich', 'bong', 'rim', 'hap', 'chay toi', 'sot', 'lang']
    ],
    disqualifiers: [
      '__veg_ca_tim__', '__veg_ca_phao__', '__drink_ca_phe__', '__veg_ca_rot__',
      'dau phu', 'dau hu', 'vien', 'canh chua', 'canh', 'cha ca', 'fish and chips', 'fish & chips',
      'kieu au', 'nauy', 'na uy', 'tartar', 'seafood', 'salmon', 'ca hoi ap chao', 'ca hoi sot', 'bun ca',
      'mi y', 'pasta', 'spaghetti', 'penne', 'fettuccine', 'fusilli', 'lasagna', 'macaroni', 'chao',
      'pho mai que', 'kho bo'
    ],
    categoryBonus: ['mon-man'],
  },
  {
    key: 'suon_ram',
    exactCompounds: [
      'suon ram', 'suon xao chua ngot', 'suon rim', 'suon nuong com tam', 'suon non ram',
      'suon nuong', 'suon cot let', 'suon sun heo', 'suon cong nuong',
      'suon non heo', 'cot let heo', 'suon nuong sa ot', 'suon nuong mat ong'
    ],
    requiredTokenGroups: [
      ['suon', 'cot let'],
      ['ram', 'xao chua ngot', 'rim', 'nuong', 'man', 'chua ngot', 'kho', 'xao sa ot', 'chien sa ot', 'ap chao', 'rang chay canh', 'om chuoi', 'xao mam ruoc']
    ],
    disqualifiers: ['canh suon', 'canh', 'bbq', 'ribs', 'chao suon', 'schnitzel', 'suon non chay', 'bun suon', 'mien suon', 'mi suon', 'de suon bo'],
    categoryBonus: ['mon-man'],
  },
  {
    key: 'ga_kho_gung_sa',
    exactCompounds: [
      'ga kho gung', 'ga kho sa', 'ga rang gung', 'ga kho sa ot', 'ga xao sa ot',
      'ga luoc', 'ga hap la chanh', 'hap la chanh', 'ga rang', 'ga hap', 'uc ga xao',
      'dui ga rim', 'dui ga roti', 'ga ta tha vuon', 'dui ga goc tu', 'uc ga tuoi',
      'vit co van dinh', 'vit nuong van dinh', 'dui vit tiem', 'me ga', 'ga nuong ngu vi',
      'ga nuong muoi ot', 'chan ga rut xuong', 'chim cut', 'chim cut tuoi'
    ],
    requiredTokenGroups: [
      ['ga', 'vit', 'me ga', 'chan ga', 'chim cut'],
      ['kho', 'rang', 'luoc', 'hap', 'gung', 'sa', 'la chanh', 'xao', 'rim', 'roti', 'ram me', 'om sau', 'ap chao', 'nau xao', 'nuong', 'tiem', 'chien nuoc mam']
    ],
    modifiers: ['gung', 'sa', 'ot', 'la chanh', 'tieu', 'kho'],
    disqualifiers: ['ga ran', 'xoi mo', 'chicken nuggets', 'ga pop', 'pho ga', 'chao ga', 'chao chim cut', 'goi', 'nom', '__veg_nam_dui_ga__', 'bun ga', 'mien ga', 'mi vit', 'thit ga kieu au', 'uc ga phi le', 'cordon bleu', 'piccata', 'parmigiana'],
    categoryBonus: ['mon-man'],
  },
  {
    key: 'bo_xao_can_toi',
    exactCompounds: [
      'bo xao can toi', 'bo xao', 'bo xao can tay', 'bo xao hanh tay',
      'bo luc lac', 'thit bo xao', 'ba chi bo cuon', 'bo cuon la lot', 'bo cuon pho mai', 'bo cuon',
      'bo bam xao', 'thit bo bam', 'heo rung lai xao lan', 'bao tu heo xao', 'pheo non heo xao',
      'bap bo hoa', 'than bo mem', 'gau bo', 'nac vai bo', 'de suon bo', 'nam bo thom', 'bo to mem',
      'thit bo than ap chao', 'bo kho soi'
    ],
    requiredTokenGroups: [
      ['bo', 'beef', 'heo rung', 'bao tu', 'pheo non'],
      ['xao', 'luc lac', 'can toi', 'cuon', 'sot tieu', 'kho mat mia', 'ap chao', 'ham khoai tay', 'bo kho soi']
    ],
    disqualifiers: ['pho', 'bun bo', 'steak', 'bit tet', 'beefsteak', 'tom bo toi', 'banh mi bo toi', 'chao'],
    categoryBonus: ['mon-man', 'mon-xao'],
  },
  {
    key: 'tom_rim_hai_san',
    exactCompounds: [
      'tom rim', 'tom rim man ngot', 'tom rang thit', 'tom rang muoi',
      'hai san xao', 'tep xao', 'tep rang', 'tom lan bot chien', 'tom cang xanh', 'tom su chien',
      'oc buou nhoi thit', 'ngao hoa', 'so diep', 'hau nuong', 'met hau', 'banh tom', 'tep dong xao',
      'tom dong rim', 'tom su tuoi', 'tom dong gion', 'cha tom', 'banh cong', 'banh phong tom'
    ],
    requiredTokenGroups: [
      ['tom', 'tep', 'hai san', 'cua', 'oc buou', 'ngao', 'so diep', 'hau'],
      ['rim', 'xao', 'hap', 'nuong', 'rang', 'chien', 'chay toi', 'banh tom', 'met hau', 'nhoi thit', 'sot', 'kho to']
    ],
    disqualifiers: ['canh', 'chao', 'bun', 'mien', 'banh mi', '__dish_banh_mi_tom__', 'nom', 'goi', 'muc', 'bach tuoc'],
    categoryBonus: ['mon-man', 'mon-xao'],
  },
  {
    key: 'dau_sot_ca_chua',
    exactCompounds: [
      'dau sot ca chua', 'dau sot __veg_ca_chua__', 'dau nhoi thit', 'dau hu sot ca', 'dau phu sot ca',
      'dau hu sot __veg_ca_chua__', 'dau phu sot __veg_ca_chua__', 'dau phu nhoi thit', 'dau hu nhoi thit',
      '__veg_ca_chua__ nhoi thit', 'ca chua nhoi thit', 'dau hu don thit', 'dau phu sot',
      'dau phu ran', 'dau hu hap', 'dau hu bao bo', 'thit bam vien sot'
    ],
    requiredTokenGroups: [
      ['dau', 'dau hu', 'dau phu', '__veg_ca_chua__'],
      ['sot', 'nhoi thit', 'sot ca', '__veg_ca_chua__', 'don thit', 'ran gion', 'hap']
    ],
    disqualifiers: [
      'ca nuc', 'ca ro', 'ca tre', 'ca bong', 'ca hoi', 'muc ong', 'tom dong', 'cha ca',
      'ca thu', 'ca loc', 'ca dieu hong', 'ca basa', 'ca ba sa', 'xiu mai', 'bo bam', 'mi y'
    ],
    categoryBonus: ['mon-man', 'mon-chay'],
  },
  {
    key: 'canh_chua',
    exactCompounds: [
      'canh chua', 'canh chua ca loc', 'canh chua ca hu', 'canh chua tom', 'canh chua ca hoi',
      'canh chua nam bo', 'canh chua ca', 'nau rieu __veg_ca_chua__', 'nau chua khe'
    ],
    requiredTokenGroups: [
      ['canh chua', 'nau rieu', 'nau chua khe']
    ],
    categoryBonus: ['mon-canh'],
  },
  {
    key: 'canh_cua_rau_day',
    exactCompounds: ['canh cua', 'canh cua rau day', 'canh cua mong toi', 'canh cua dong', 'canh rieu cua', 'reu cua', 'nau cua dong'],
    requiredTokenGroups: [
      ['canh cua', 'canh rieu cua', 'reu cua', 'cua dong']
    ],
    disqualifiers: ['mien cua dong', 'banh canh'],
    categoryBonus: ['mon-canh'],
  },
  {
    key: 'canh_suon_sau_kim_chi',
    exactCompounds: [
      'canh suon', 'canh suon sau', 'canh suon chua', 'canh suon bi', 'canh suon ham',
      'canh mang chua nau suon', 'ham khoai mon', 'canh giò heo', 'canh xuong', 'canh mong gio',
      'canh duoi bo', 'duoi bo ham'
    ],
    requiredTokenGroups: [
      ['canh'],
      ['suon', 'sau', 'ham khoai mon', 'gio heo', 'xuong duoi', 'mong gio', 'chan gio', 'duoi bo']
    ],
    disqualifiers: ['kim chi', 'rang chay canh', 'thit ba chi', 'thit chan gio'],
    categoryBonus: ['mon-canh'],
  },
  {
    key: 'canh_thanh_mat',
    exactCompounds: [
      'canh rau ngot', 'canh bi do', 'canh cai thia', 'canh muop',
      'canh bau', 'canh rau', 'canh ngao', 'canh thit bam', 'canh rong bien', 'canh ngot',
      'canh nam', 'canh hen', 'canh cai', 'canh xa lach xoong', 'canh khoai mo',
      'canh bap ngot', 'canh __veg_ca_chua__', 'sup bong bong ca', 'canh ga ham',
      'nau rau ngot'
    ],
    requiredTokenGroups: [
      ['canh', 'sup'],
      [
        'ngao', 'hen', 'thit bam', 'rau ngot', 'rong bien', 'bi xanh', 'bi do', 'mong toi',
        'thanh mat', 'cai', 'muop', 'bau', 'nam', '__veg_nam_dui_ga__', 'hat sen', 'khoai mo',
        'bap ngot', '__veg_ca_chua__', 'bong bong ca', 'ga ham', 'dong trung', 'trai dong', 'trung truc'
      ]
    ],
    categoryBonus: ['mon-canh'],
  },
  {
    key: 'canh_kho_qua',
    exactCompounds: ['canh kho qua', 'kho qua nhoi thit', 'canh muop dang', 'kho qua don thit'],
    requiredTokenGroups: [
      ['canh kho qua', 'kho qua nhoi thit', 'muop dang', 'kho qua']
    ],
    categoryBonus: ['mon-canh'],
  },
  {
    key: 'rau_muong_xao_luoc',
    exactCompounds: ['rau muong xao toi', 'rau muong luoc', 'rau muong dam sau', 'rau muong', 'rau lang xao toi', 'rau khoai lang luoc'],
    requiredTokenGroups: [
      ['rau muong', 'rau lang', 'rau khoai lang']
    ],
    disqualifiers: ['thit bo', 'bo xao', 'nom'],
    categoryBonus: ['mon-xao', 'mon-chay', 'mon-rau'],
  },
  {
    key: 'rau_cu_luoc_kho_quet',
    exactCompounds: [
      'rau cu luoc kho quet', 'kho quet', 'rau tap tang', 'cu qua luoc',
      'bap cai luoc', 'cai ngot luoc', 'ca phao', '__veg_ca_phao__', 'rau cu luoc',
      'cham chao do', 'cham muoi vung', 'bap ngot luoc', 'cu cai trang luoc', 'su hao luoc', 'dau bap luoc',
      'su hao gion ngot', 'dau bap non', 'cai ngot non luoc', 'bap cai non', 'bau non thai khuc', 'muop huong non', 'rau rung tay ninh',
      'khoai lang mat hap', 'rau cu thap cam', 'bong cai xanh trang non', 'bap nuong mo hanh'
    ],
    requiredTokenGroups: [
      [
        'kho quet', 'rau cu luoc', 'rau luoc', 'bap cai luoc', 'cai ngot luoc', 'cu cai trang luoc',
        'su hao luoc', 'dau bap luoc', 'ca phao', '__veg_ca_phao__', 'cham chao do', 'cham muoi vung',
        'bap ngot luoc', 'su hao gion ngot', 'dau bap non', 'cai ngot non luoc', 'bap cai non', 'bau non thai khuc', 'rau rung tay ninh', 'khoai lang mat hap',
        'rau cu thap cam', 'bong cai xanh trang non', 'bap nuong mo hanh'
      ]
    ],
    disqualifiers: ['canh', 'xao'],
    categoryBonus: ['mon-xao', 'mon-chay', 'mon-rau'],
  },
  {
    key: 'rau_xao_thap_cam',
    exactCompounds: [
      'rau xao thap cam', 'cai ngot xao', 'cai thia xao', 'nam xao',
      '__veg_ca_tim__ xao', 'ca tim xao', 'bong cai xao', 'dau que xao',
      'muop dang xao trung', 'su su xao', 'bong bi xao', 'dua gia bop xoi', 'dua gia __prep_muoi_xoi__',
      'dot bi non', 'dau co ve non', 'muop huong non', 'mang truc tuoi',
      'hoa thien ly', 'ngo sen non', 'cai chip', 'cai ngong', 'cai thao'
    ],
    requiredTokenGroups: [
      [
        'rau', 'cai', 'nam', '__veg_nam_dui_ga__', '__veg_ca_tim__', 'ca tim', 'bong cai',
        'dau que', 'dau ve', 'dau co ve', 'su su', 'muop dang', 'bong bi', 'dua gia',
        'dot bi', 'muop huong', 'mang truc', 'hoa thien ly', 'ngo sen'
      ],
      ['xao', 'luoc', 'chay', 'trung', 'nuong', 'bop xoi', '__prep_muoi_xoi__']
    ],
    disqualifiers: ['salad', 'nom', 'goi', 'thit bo', 'bo bam', 'cham mam tom', 'cham trung ga', 'bun hen', 'mien luon', 'trung duc'],
    categoryBonus: ['mon-xao', 'mon-chay', 'mon-rau'],
  },

  // --- BEVERAGES & DESSERTS ---
  {
    key: 'ca_phe_vietnam',
    exactCompounds: [
      '__drink_ca_phe__ sua da', 'ca phe sua da', 'ca phe den da',
      'bac siu', 'ca phe phin', 'bac xiu', 'ca phe den'
    ],
    requiredTokenGroups: [
      ['ca phe', '__drink_ca_phe__', 'bac siu', 'bac xiu']
    ],
    disqualifiers: ['muoi', 'trung', 'cold brew', 'cappuccino', 'latte', 'espresso'],
    categoryBonus: ['nuoc-uong', 'do-uong'],
  },
  {
    key: 'ca_phe_muoi_artisan',
    exactCompounds: ['ca phe muoi', 'ca phe trung', 'cold brew', 'cappuccino', 'latte', 'espresso', 'latte art'],
    requiredTokenGroups: [
      ['ca phe', '__drink_ca_phe__', 'coffee'],
      ['muoi', 'trung', 'cold brew', 'latte', 'espresso', 'cappuccino']
    ],
    categoryBonus: ['nuoc-uong', 'do-uong'],
  },
  {
    key: 'tra_dao_cam_sa',
    exactCompounds: [
      'tra dao', 'tra dao cam sa', 'tra vai', 'tra mang cau', 'tra chanh', 'tra tac',
      'tra quat', 'tra quat mat ong', 'tra sen vang', 'tra dua luoi', 'tra dua hau', 'nuoc cot chanh',
      'tra dau tay', 'tra hoa cuc', 'tra da hoa cuc', 'tra hoa qua'
    ],
    requiredTokenGroups: [
      ['tra', 'nuoc cot chanh'],
      ['dao', 'cam sa', 'vai', 'mang cau', 'chanh', 'tac', 'quat', 'trai cay', ' hoa qua', 'hoa qua', 'mint', 'sen vang', 'dua luoi', 'dua hau', 'dau tay', 'hoa cuc']
    ],
    categoryBonus: ['nuoc-uong', 'do-uong', 'trang-mieng'],
  },
  {
    key: 'tra_sua_tran_chau',
    exactCompounds: ['tra sua', 'tra sua tran chau', 'tra sua duong den', 'tra sua oolong', 'tra sua o long', 'tra o long sua', 'matcha'],
    requiredTokenGroups: [
      ['tra sua', 'tra o long sua', 'milk tea', 'boba', 'matcha']
    ],
    categoryBonus: ['nuoc-uong', 'do-uong'],
  },
  {
    key: 'sinh_to_trai_cay',
    exactCompounds: ['sinh to', 'sinh to bo', 'sinh to xoai', 'sinh to mang cau', 'nuoc ep', 'nuoc ep cam', 'smoothie', 'nuoc cam', 'nuoc rau ma'],
    requiredTokenGroups: [
      ['sinh to', 'nuoc ep', 'smoothie', 'juice', 'nuoc cam', 'nuoc rau ma']
    ],
    categoryBonus: ['nuoc-uong', 'do-uong'],
  },
  {
    key: 'nuoc_mia_nuoc_sam',
    exactCompounds: ['nuoc mia', 'nuoc sam', 'nuoc sam bi dao', 'tra atiso', 'nuoc mat', 'nuoc mia sieu sach', 'tra thao moc', 'sua dau nanh', 'nuoc dau den'],
    requiredTokenGroups: [
      ['nuoc mia', 'nuoc sam', 'atiso', 'nuoc mat', 'tra thao moc', 'sua dau nanh', 'nuoc dau den']
    ],
    categoryBonus: ['nuoc-uong', 'do-uong'],
  },
  {
    key: 'che_duong_nhan_khuc_bach',
    exactCompounds: ['che duong nhan', 'che khuc bach', 'tuyet yen', 'duong nhan', 'che khuc bach pho mai'],
    requiredTokenGroups: [
      ['che duong nhan', 'che khuc bach', 'tuyet yen', 'khuc bach']
    ],
    categoryBonus: ['trang-mieng'],
  },
  {
    key: 'che_truyen_thong',
    exactCompounds: [
      'che buoi', 'che dau den', 'che dau do', 'che hat sen', 'che thai', 'che buoi an giang', 'che thai sau rieng',
      'che suong sa', 'che khoai deo', 'che thung', 'che troi nuoc', 'che dau xanh', 'che chuoi', 'che thach sen',
      'che dau trang', 'che dau ngu', 'che bi do', 'che sam bo luong', 'che ke', 'che luc tau xa', 'che nep cam', 'che bot loc',
      'tau hu tran chau', 'sua hat sen', 'rau cau dua', 'rau cau trai cay', 'banh da lon', 'banh bo thot not', 'banh chuoi hap',
      'banh khoai mi', 'banh dau xanh', 'banh tieu chien', 'banh cam chien', 'banh bong lan', 'thach den suong sao',
      'banh chuoi chien', 'thach rau cau', 'sua bap', 'khoai mi nuong', 'banh ran luc lac', 'banh trang sua dua'
    ],
    requiredTokenGroups: [
      [
        'che', 'tau hu tran chau', 'sua hat sen', 'rau cau dua', 'rau cau trai cay', 'banh da lon', 'banh bo thot not',
        'banh chuoi', 'banh khoai mi', 'banh dau xanh', 'banh tieu', 'banh cam', 'banh bong lan', 'suong sao',
        'thach rau cau', 'sua bap', 'khoai mi nuong', 'banh ran luc lac', 'banh trang sua dua'
      ]
    ],
    disqualifiers: ['che duong nhan', 'che khuc bach', 'ca chep'],
    categoryBonus: ['trang-mieng'],
  },
  {
    key: 'flan_caramen',
    exactCompounds: ['flan', 'caramen', 'banh flan', 'pudding flan', 'pudding', 'caramen flan'],
    requiredTokenGroups: [
      ['flan', 'caramen', 'pudding']
    ],
    categoryBonus: ['trang-mieng'],
  },
  {
    key: 'kem_gelato_yogurt',
    exactCompounds: ['kem bo', 'sua chua tran chau', 'gelato', 'kem ly', 'ice cream', 'kem bo da lat', 'kem gelato', 'kem que'],
    requiredTokenGroups: [
      ['kem', 'sua chua', 'gelato', 'ice cream']
    ],
    disqualifiers: [
      '__sauce_cream__', 'sot kem', 'kem chua', 'kem nam', 'kem toi', 'kem beo',
      'thit', 'bo', 'heo', 'ga', 'ca', 'muc', 'ngheu', 'so', 'stroganoff',
      'pasta', 'my y', 'sup', 'soup'
    ],
    categoryBonus: ['trang-mieng', 'an-vat'],
  },

  // --- DARE & STREET NOVELTY ---
  {
    key: 'mam_tom_mam_nem',
    exactCompounds: ['mam tom', 'mam nem', 'mam ruoc', 'mam tep', 'mam ca linh', 'mam ba khia', 'nuoc mam toi ot', 'nuoc mam ca com', 'duong dua'],
    requiredTokenGroups: [
      ['mam tom', 'mam nem', 'mam ruoc', 'mam tep', 'mam ca linh', 'mam ba khia', 'duong dua']
    ],
    disqualifiers: [
      '__dish_bun_dau_mam_tom__', 'bun dau', 'rau khoai lang', 'ca phao', '__veg_ca_phao__', 'bun mam',
      'luoc', 'cu cai', 'su hao', 'dau bap', 'cai ngot', 'bap cai', 'bau non', 'muop huong', 'rau rung', 'cha ca',
      'rau cu', 'bong cai', 'gia cay', 'thit ba chi', 'thit dai', 'cha lua', 'thit ba roi',
      'suon', 'cot let', 'muc', 'ca chim', 'ca hoi', 'ca lang', 'bap nuong'
    ],
    categoryBonus: ['doc-la'],
  },
  {
    key: 'sau_rieng_dac_san',
    exactCompounds: ['sau rieng', 'sau rieng nuong', 'xoi sau rieng', 'sau rieng ri6'],
    requiredTokenGroups: [
      ['sau rieng']
    ],
    categoryBonus: ['doc-la', 'trang-mieng'],
  },
  {
    key: 'trung_vit_lon',
    exactCompounds: ['trung vit lon', 'hot vit lon', 'cut lon xao me', 'trung bac thao', 'hot vit dua', 'trung cut luoc'],
    requiredTokenGroups: [
      ['trung vit lon', 'hot vit lon', 'cut lon xao me', 'trung bac thao', 'cut lon', 'hot vit dua', 'trung cut luoc']
    ],
    disqualifiers: ['chao'],
    categoryBonus: ['doc-la', 'an-vat'],
  },
  {
    key: 'con_trung_chien_gion',
    exactCompounds: ['de men', 'nhong tam', 'chau chau', 'con trung chien', 've sau', 'de men chien gion', 'bo xit', 'sau mang', 'sau tre', 'to ong khoai'],
    requiredTokenGroups: [
      ['de men', 'nhong tam', 'chau chau', 'con trung', 'bo xit', 'sau mang', 'sau tre', 'to ong']
    ],
    categoryBonus: ['doc-la'],
  },
  {
    key: 'do_cay_nong_extreme',
    exactCompounds: [
      'mi cay 7 cap do', 'ot xiem', 'cay xe luoi', 'cay te tai', 'sieu cay', 'mi cay',
      'nam pia', 'thang co', 'tiet canh', 'mat ca ngu', 'pin bo', 'oc heo chung',
      'dua leo cat lat', 'chanh tuoi cat lat', '__idiom_tears__', 'bia hoi ha noi dam ot'
    ],
    requiredTokenGroups: [
      [
        'mi cay', 'ot xiem', 'sieu cay', 'cay xe luoi', 'cay te tai',
        'nam pia', 'thang co', 'tiet canh', 'mat ca ngu', 'pin bo', 'oc heo', 'dua leo cat lat', 'chanh tuoi cat lat',
        '__idiom_tears__'
      ]
    ],
    disqualifiers: ['ca kho', 'ca loc', 'ca nuc', 'ga', 'chim cut', 'bo', 'rau', 'cai', 'su su', 'bong cai', 'xao'],
    categoryBonus: ['doc-la'],
  },
  {
    key: 'bizarre_modern_fusion',
    exactCompounds: ['tra sua hanh la', 'dau hu thoi', 'kem ot cay', 'ca phe mam tom', 'kem ot', 'banh quy ngot kep lat toi'],
    requiredTokenGroups: [
      ['tra sua hanh la', 'dau hu thoi', 'kem ot', 'ca phe mam tom', 'banh quy ngot']
    ],
    categoryBonus: ['doc-la'],
  },

  // ==========================================================================
  // 27 NEW GRANULAR CULINARY CLUSTERS (TOTAL 83 TAXONOMY CLUSTERS)
  // ==========================================================================
  {
    key: 'trung_cuon_omelette',
    exactCompounds: [
      'trung cuon omelette', 'omelette', 'trung cuon', 'scrambled eggs', 'trung khuay',
      'tamagoyaki', 'frittata', 'trung cuon xuc xich', 'omelet', 'skillet eggs', 'trung hap thit bam'
    ],
    requiredTokenGroups: [
      ['trung cuon', 'omelette', 'scrambled', 'trung khuay', 'tamagoyaki', 'frittata', 'omelet', 'trung hap']
    ],
    modifiers: ['xuc xich', 'pho mai', 'nam', 'thit', 'bo', 'duc'],
    disqualifiers: ['com thit heo xao kim chi'],
    categoryBonus: ['an-sang'],
  },
  {
    key: 'steak_beef',
    exactCompounds: [
      'bo bit tet', 'beefsteak', 'steak', 'than noi', 'than lung', 'ribeye', 'striploin',
      'bo bit tet sot tieu', 'than bo my', 'bap bo uc sot', 'bit tet',
      'beef stroganoff', 'stroganoff', 'bap bo kieu nga', 'de suon bo kieu nga',
      'boeuf bourguignon', 'bourguignon', 'bo ham kieu phap', 'bo ham ruou vang', 'beef stew',
      'bo sot vang', 'bo ham', 'ham khoai tay __veg_ca_rot__ sot vang'
    ],
    requiredTokenGroups: [
      ['bit tet', 'steak', 'ribeye', 'striploin', 'beefsteak', 'than noi', 'than lung', 'stroganoff', 'beef stroganoff', 'bourguignon', 'boeuf bourguignon', 'beef stew', 'bo sot vang', 'bo ham', 'sot vang']
    ],
    disqualifiers: ['canh', 'pho'],
    categoryBonus: ['mon-man', 'mon-chinh'],
  },
  {
    key: 'my_y_pasta',
    exactCompounds: [
      'spaghetti', 'mi y', 'bolognese', 'carbonara', 'pesto', 'lasagna', 'mac and cheese',
      'pasta', 'mi y sot bo bam', 'mi y carbonara', 'mi y sot kem', 'mi y sot hung tay'
    ],
    requiredTokenGroups: [
      ['mi y', 'spaghetti', 'pasta', 'bolognese', 'carbonara', 'lasagna', 'pesto']
    ],
    disqualifiers: ['thit ga kieu au', 'uc ga', 'dui ga', 'canh ga', 'ga nua con', 'bit tet', 'steak', 'parmigiana'],
    categoryBonus: ['mon-man', 'mon-chinh'],
  },
  {
    key: 'burrito_quesadilla',
    exactCompounds: ['burrito', 'quesadilla', 'fajita', 'enchilada', 'wrap bo', 'wrap ga'],
    requiredTokenGroups: [
      ['burrito', 'quesadilla', 'fajita', 'enchilada']
    ],
    categoryBonus: ['an-nhanh', 'an-vat'],
  },
  {
    key: 'sup_kem_tay_chowder',
    exactCompounds: [
      'sup kem bi do', 'sup kem nam', 'clam chowder', 'sup ngheu', 'sup kem',
      'chowder', 'pumpkin cream soup', 'sup kem tay', 'sup bi do hat de',
      'sup __sauce_cream__', 'sup __veg_ca_chua__ hung que', 'sup khoai tay toi tay'
    ],
    requiredTokenGroups: [
      ['sup kem', 'sup __sauce_cream__', 'chowder', 'sup bi do', 'sup nam', 'sup __veg_ca_chua__', 'sup khoai tay']
    ],
    categoryBonus: ['mon-canh'],
  },
  {
    key: 'salad_tay_caesar',
    exactCompounds: [
      'salad caesar', 'caesar salad', 'greek salad', 'cobb salad', 'salad luon ga',
      'salad ga nuong', 'coleslaw', 'caesar', 'caprese', 'salad caprese',
      'salad bo', 'salad trai cay', 'salad qua bo', 'salad rau cu', 'xa lach xoong trung luoc',
      'salad __veg_spinach__', '__veg_spinach__', 'salad rau mam'
    ],
    requiredTokenGroups: [
      ['salad caesar', 'caesar salad', 'caesar', 'coleslaw', 'greek salad', 'caprese', 'salad', 'xa lach xoong', '__veg_spinach__']
    ],
    disqualifiers: ['canh xa lach xoong', 'canh', 'suon que', 'suon nuong', 'bbq', 'trung chien'],
    categoryBonus: ['mon-rau', 'mon-chay'],
  },
  {
    key: 'banh_mi_sandwich_toast',
    exactCompounds: [
      'french toast', 'garlic bread', 'avocado toast', 'banh mi nuong bo toi',
      'banh mi nuong kieu phap', 'banh mi bo sap', 'garlic toast', 'banh sung bo', 'banh tart'
    ],
    requiredTokenGroups: [
      ['french toast', 'avocado toast', 'banh mi nuong kieu phap', 'banh mi bo sap', 'garlic bread', 'banh sung bo', 'banh tart']
    ],
    categoryBonus: ['an-sang'],
  },
  {
    key: 'risotto_paella',
    exactCompounds: ['risotto', 'paella', 'com y risotto', 'paella hai san', 'com tay ban nha'],
    requiredTokenGroups: [
      ['risotto', 'paella']
    ],
    categoryBonus: ['mon-man', 'mon-chinh'],
  },
  {
    key: 'seafood_western',
    exactCompounds: [
      'ca hoi ap chao', 'salmon steak', 'tom bo toi', 'ca tuyet ap chao',
      'hai san sot bo toi', 'pan seared salmon', 'ca hoi sot cam', 'ca hoi sot bo chanh',
      'fish and chips', 'fish & chips', 'ca hoi nauy', 'ca hoi na uy', 'ca hoi nuong', 'ca vuoc', 'ca tuyet',
      'hai san kieu au', 'seafood kieu au'
    ],
    requiredTokenGroups: [
      ['ca hoi', 'salmon', 'ca tuyet', 'ca vuoc', 'fish and chips', 'fish & chips', 'tom bo toi', 'hai san']
    ],
    disqualifiers: ['canh chua', 'lau', 'mi y', 'pasta', 'spaghetti', 'penne', 'fettuccine', 'fusilli', 'lasagna', 'macaroni', 'kho to', 'chien nuoc mam'],
    categoryBonus: ['mon-man', 'mon-chinh'],
  },
  {
    key: 'bbq_ribs_roast',
    exactCompounds: [
      'suon nuong bbq', 'bbq ribs', 'roast beef', 'bo dut lo',
      'suon tang nuong', 'suon bbq', 'schnitzel', 'pulled pork', 'suon cay heo',
      'thit cot let', 'thit heo xe', 'viennese schnitzel', 'thit heo kieu au', 'chien xu kieu ao',
      'suon que nuong', 'than heo cot let ap chao', 'nuong bbq han quoc', 'korean bbq', 'thit ba chi nuong sot bbq'
    ],
    requiredTokenGroups: [
      ['bbq ribs', 'roast beef', 'suon nuong bbq', 'suon bbq', 'suon tang', 'schnitzel', 'pulled pork', 'suon cay heo', 'thit cot let', 'thit heo xe', 'viennese schnitzel', 'thit heo kieu au', 'suon que nuong', 'than heo cot let', 'nuong bbq han quoc', 'korean bbq', 'thit ba chi nuong sot bbq']
    ],
    disqualifiers: ['ga', 'dui ga', 'canh ga', 'uc ga', 'chicken', 'thit ga'],
    categoryBonus: ['mon-man', 'mon-chinh'],
  },
  {
    key: 'pancake_waffle',
    exactCompounds: ['pancake', 'waffle', 'banh kep pancake', 'waffle bi', 'pancakes mat ong', 'pancakes'],
    requiredTokenGroups: [
      ['pancake', 'pancakes', 'waffle']
    ],
    categoryBonus: ['an-sang', 'trang-mieng'],
  },
  {
    key: 'overnight_oats_granola',
    exactCompounds: [
      'overnight oats', 'granola', 'yen mach ngam sua chua', 'muesli', 'granola bowl',
      'yen mach sua chua', 'overnight oat', 'chao yen mach tao do sua tuoi'
    ],
    requiredTokenGroups: [
      ['overnight oats', 'granola', 'muesli', 'yen mach ngam', 'yen mach tao do']
    ],
    categoryBonus: ['an-sang'],
  },
  {
    key: 'curry_dishes',
    exactCompounds: [
      '__dish_ca_ri__', 'ca ri', 'curry', 'ca ri ga', 'ca ri bo', 'japanese curry',
      'ca ri nhat', 'ca ri an do', 'ca ri nuoc cot dua'
    ],
    requiredTokenGroups: [
      ['__dish_ca_ri__', 'ca ri', 'curry']
    ],
    categoryBonus: ['mon-chinh', 'mon-man'],
  },
  {
    key: 'soup_clear_western',
    exactCompounds: [
      'french onion soup', 'sup hanh tay kieu phap', 'minestrone', 'goulash', 'sup trong'
    ],
    requiredTokenGroups: [
      ['french onion', 'sup hanh tay', 'minestrone', 'goulash']
    ],
    categoryBonus: ['mon-canh'],
  },
  {
    key: 'goi_nom_vietnam',
    exactCompounds: [
      'goi ngo sen', 'goi ga xe phay', 'nom bo kho', 'nom du du', 'goi tai heo',
      'goi tom thit', 'nom rau muong', 'nom sua', 'goi bo', 'goi xoai', 'goi buoi',
      'nom hoa chuoi', 'goi dua leo', 'goi bap chuoi', 'goi cu hu dua', 'goi rau cang cua',
      'dua cai sen muoi', 'dua cai muoi', 'sung nep non muoi', 'dua gia do he',
      'cu kieu hue', 'ngo sen ngam chua ngot', 'cu cai ngam mam', 'goi la tay nguyen',
      'nom ngo sen', 'nom xoai xanh', 'xoai non ngam', 'bap cai __prep_muoi_xoi__', 'dua chuot __prep_muoi_xoi__'
    ],
    requiredTokenGroups: [
      ['goi', 'nom', 'dua cai', 'sung nep', 'cu kieu', 'ngo sen ngam', 'cu cai ngam', 'xoai non ngam', '__prep_muoi_xoi__']
    ],
    disqualifiers: ['goi cuon', '3 goi'],
    categoryBonus: ['mon-xao', 'mon-chay', 'mon-rau'],
  },
  {
    key: 'cha_ca_vietnam',
    exactCompounds: ['cha ca la vong', 'cha ca thi la', 'cha ca chien rim', 'cha ca ha noi', 'cha ca sot', 'cha ca thac lac'],
    requiredTokenGroups: [
      ['cha ca la vong', 'cha ca thi la', 'cha ca ha noi', 'cha ca', 'cha ca thac lac']
    ],
    disqualifiers: ['banh mi', 'bun', 'canh'],
    categoryBonus: ['mon-chinh', 'mon-man'],
  },
  {
    key: 'banh_xeo_banh_khot',
    exactCompounds: ['banh xeo', 'banh khot', 'banh xeo __geo_region__', 'banh khot vung tau', 'banh xeo tom thit'],
    requiredTokenGroups: [
      ['banh xeo', 'banh khot']
    ],
    categoryBonus: ['an-nhanh', 'mon-chinh'],
  },
  {
    key: 'banh_cuon_banh_uot',
    exactCompounds: [
      'banh cuon', 'banh uot', 'banh cuon nong', 'banh cuon cha que', 'banh uot long ga',
      'banh gio', 'banh beo', 'banh bot loc', 'banh duc', 'banh nam', 'banh hoi', 'banh it'
    ],
    requiredTokenGroups: [
      ['banh cuon', 'banh uot', 'banh gio', 'banh beo', 'banh bot loc', 'banh duc', 'banh nam', 'banh hoi', 'banh it']
    ],
    categoryBonus: ['an-sang', 'mon-chinh'],
  },
  {
    key: 'chao_vietnam',
    exactCompounds: [
      'chao suon', 'chao ga', 'chao bo', 'chao long', 'chao ca', 'chao vit', 'chao ech',
      'chao nam', 'chao thit', 'chao dau', 'chao tom', 'chao ngao', 'chao hen', 'chao luon',
      'chao yen mach tom', 'chao hau', 'chao bi do', 'chao chim cut', 'chao trung bac thao',
      'chao yen mach nau thit', 'chao ngheu'
    ],
    requiredTokenGroups: [
      ['chao']
    ],
    disqualifiers: ['ap chao', 'banh mi chao', '__dish_banh_mi_chao__', 'bo toi', 'sot', 'cham chao', 'chao do', 'yen mach tao do', '__prep_wok__', 'pho xao'],
    categoryBonus: ['mon-canh', 'mon-chinh', 'an-sang'],
  },
  {
    key: 'lau_vietnam',
    exactCompounds: [
      'lau thai', 'lau rieu cua', 'lau ga la giang', 'lau ga', 'lau bo', 'lau hai san', 'lau nam', 'lau ech'
    ],
    requiredTokenGroups: [
      ['lau'],
      ['thai', 'rieu cua', 'la giang', 'ga', 'bo', 'hai san', 'nam', 'ech', 'chua cay']
    ],
    categoryBonus: ['mon-chinh'],
  },
  {
    key: 'nem_cuon_spring_rolls',
    exactCompounds: ['goi cuon', 'nem cuon', 'goi cuon tom thit', 'bi cuon', 'summer rolls', 'bo bia'],
    requiredTokenGroups: [
      ['goi cuon', 'nem cuon', 'bi cuon', 'summer rolls', 'bo bia']
    ],
    categoryBonus: ['an-nhanh', 'an-vat'],
  },
  {
    key: 'trung_chien_op_la',
    exactCompounds: [
      'trung op la', 'trung chien', 'trung ran', 'trung op la long dao', 'trung chien thit bam', 'ap chao trung',
      'trung duc thit'
    ],
    requiredTokenGroups: [
      ['trung'],
      ['op la', 'chien', 'ran', 'long dao', 'ap chao', 'duc thit']
    ],
    disqualifiers: ['omelette', 'trung cuon', 'vit lon', 'scrambled', 'banh mi', 'com tam', '__fish_capelin__'],
    categoryBonus: ['an-sang', 'mon-man'],
  },
  {
    key: 'ha_cao_dimsum',
    exactCompounds: ['ha cao', 'dimsum', 'dim sum', 'xiu mai', 'ha cao tom', 'banh bao hap', 'xiu mai sot ca', 'banh xep mandu', 'takoyaki'],
    requiredTokenGroups: [
      ['ha cao', 'dimsum', 'dim sum', 'xiu mai', 'banh bao', 'banh xep mandu', 'takoyaki']
    ],
    disqualifiers: ['banh mi'],
    categoryBonus: ['an-nhanh', 'an-sang'],
  },
  {
    key: 'muc_bach_tuoc_nuong_xao',
    exactCompounds: [
      'muc nuong', 'bach tuoc nuong', 'muc sa te', 'muc xao', 'bach tuoc nuong muoi ot', 'muc mot nang', 'muc rim',
      'bach tuoc xao', 'muc ong', 'muc la', 'muc sua', 'muc tuoi', 'muc hap', 'muc chien', 'muc vong', 'cha muc', 'muc xe', 'muc ngao'
    ],
    requiredTokenGroups: [
      ['muc', 'bach tuoc', 'cha muc']
    ],
    disqualifiers: ['canh', 'chao', 'bun', 'mien', 'hu tieu', 'mi y', 'pasta', 'spaghetti', 'lau', 'kieu au', 'pizza'],
    categoryBonus: ['mon-man', 'mon-xao', 'mon-chinh'],
  },
  {
    key: 'thit_heo_quay_kho_dua',
    exactCompounds: [
      'thit heo quay', 'heo quay', 'heo quay gion bi', 'ba chi kho dua', 'thit kho dua cai', 'thit quay', 'thit dong',
      'heo sua quay', 'thit ba chi quay gion bi'
    ],
    requiredTokenGroups: [
      ['heo quay', 'heo sua quay', 'thit quay', 'kho dua', 'thit dong', 'quay gion bi']
    ],
    disqualifiers: ['banh mi', 'che'],
    categoryBonus: ['mon-man'],
  },
  {
    key: 'canh_kim_chi_hai_san',
    exactCompounds: [
      'canh kim chi', 'canh kim chi dau non', 'canh kim chi hai san', 'canh rong bien', 'canh rong bien thit bo'
    ],
    requiredTokenGroups: [
      ['canh kim chi', 'canh rong bien']
    ],
    categoryBonus: ['mon-canh'],
  },
  {
    key: 'mon_chay_tofu_mushroom',
    exactCompounds: [
      'dau hu kho nam', 'nam kho chay', 'dau non sot nam', 'dau hu chien sa ot', 'mon chay', 'dau hu xao', 'dau phu chien',
      'tau hu ky', 'cha lua chay', 'suon non chay', 'mit non luoc', 'cu sen tuoi', 'cu sen kho', 'bi ngo non hap', '__veg_ca_tim__ non',
      'mam com chay'
    ],
    requiredTokenGroups: [
      ['dau hu', 'dau phu', 'nam', '__veg_nam_dui_ga__', 'tau hu ky', 'cha lua chay', 'suon non chay', 'mit non', 'cu sen', 'bi ngo non', '__veg_ca_tim__', 'mam com chay'],
      ['kho chay', 'sot nam', 'chay', 'kho nam', 'chien sa ot', 'chien', 'kho', 'xao hat sen', 'om nghe', 'thanh tinh', 'tinh tam']
    ],
    disqualifiers: ['ap chao trung', 'bun dau'],
    categoryBonus: ['mon-chay'],
  },

  // Western aliases
  {
    key: 'western_sides',
    exactCompounds: [
      'khoai tay nghien', 'khoai tay mui cau', 'banh mi bo toi', 'mang tay ap chao',
      'dau que ap chao', 'khoai tay dut lo', 'ca rot baby ap chao', '__veg_ca_rot__ baby ap chao', 'mang tay'
    ],
    requiredTokenGroups: [
      ['khoai tay nghien', 'khoai tay mui cau', 'banh mi bo toi', 'mang tay ap chao', 'mang tay', 'khoai tay dut lo']
    ],
    disqualifiers: ['ca hoi', 'salmon', 'steak', 'bit tet', 'than heo', 'cot let', 'trung khuay', 'french toast', 'sup', 'mien cua'],
    categoryBonus: ['mon-rau', 'mon-phu'],
  },
  {
    key: 'trai_cay_trang_mieng',
    exactCompounds: [
      'dua hau', 'xoai cat', 'xoai chin', 'oi bo', 'oi gion', 'thanh long', 'du du chin', 'buoi da xanh',
      'trai cay dia', 'hoa qua trang mieng', 'dia dua hau', 'chuoi tieu chin', 'coc bao tu',
      'chuoi chat non', 'khe chua', 'dua luoi', 'mit thai', 'mit say', 'chuoi say', 'xoai non', 'coc non'
    ],
    requiredTokenGroups: [
      ['dua hau', 'xoai', 'oi bo', 'oi gion', 'thanh long', 'du du', 'buoi', 'trai cay', 'hoa qua', 'chuoi tieu', 'coc bao tu', 'khe chua', 'dua luoi', 'mit thai', 'mit say', 'chuoi say', 'xoai non', 'coc non']
    ],
    disqualifiers: [
      'sinh to', 'nuoc ep', 'tra', 'goi', 'nom', 'salad', 'omelette', 'trung cuon', 'trung khuay',
      'ca ro', 'ca kho', 'kho', 'dau hu', 'dau phu', 'hap xi dau', 'rau cau', 'mam com', 'chan ga', '__idiom_tears__'
    ],
    categoryBonus: ['trang-mieng', 'an-vat'],
  },
];

// ============================================================================
// 5. DETERMINISTIC STRING HASHING & SUB-CLUSTER INDEX SELECTION (32-BIT FNV-1a)
// ============================================================================

/**
 * Deterministic 32-bit FNV-1a string hashing function.
 * Produces uniform, repeatable seed distribution across pool sizes.
 */
export function hashDishTitle(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

/**
 * Returns the valid sub-slice of pool indices for pools that contain multiple distinct sub-dishes.
 * Prevents Mashed Potatoes from getting Garlic Bread, Bánh Xèo from getting Bánh Khọt, etc.
 */
function getAllowedPoolIndices(poolKey: string, seedString: string, poolLength: number): number[] {
  const norm = removeVietnameseTones((seedString || '').toLowerCase());

  if (poolKey === 'western_sides' && poolLength >= 4) {
    if (norm.includes('banh mi') || norm.includes('garlic bread') || norm.includes('bruschetta')) {
      return [1]; // Garlic bread / Bruschetta
    }
    if (norm.includes('khoai tay nghien') || norm.includes('mashed') || norm.includes('khoai nghien')) {
      return [0]; // Mashed potatoes
    }
    if (norm.includes('mui cau') || norm.includes('dut lo') || norm.includes('wedges')) {
      return [2]; // Potato wedges
    }
    if (norm.includes('mang tay') || norm.includes('dau que') || norm.includes('ca rot')) {
      return [3]; // Pan-seared asparagus & veggies
    }
  }

  if (poolKey === 'banh_mi_sandwich_toast' && poolLength >= 4) {
    if (norm.includes('bo sap') || norm.includes('bo tuoi') || norm.includes('avocado')) {
      return [1, 2]; // Avocado toast with egg
    }
    if (norm.includes('french toast') || norm.includes('kieu phap')) {
      return [0]; // French toast
    }
    return [0, 3];
  }

  if (poolKey === 'banh_xeo_banh_khot' && poolLength >= 4) {
    if (norm.includes('banh khot')) {
      return [2, 3]; // Bánh Khọt
    }
    return [0, 1]; // Bánh Xèo
  }

  if (poolKey === 'mi_quang_cao_lau' && poolLength >= 4) {
    if (norm.includes('cao lau')) {
      return [0, 1]; // Cao Lầu
    }
    return [2, 3]; // Mì Quảng
  }

  if (poolKey === 'xoi' && poolLength >= 4) {
    if (norm.includes('xoi gac')) {
      return [1]; // Bright red-orange Xôi Gấc
    }
    return [0, 2, 3]; // Savory / yellow / white sticky rice
  }

  if (poolKey === 'chao_vietnam' && poolLength >= 4) {
    if ((norm.includes('chao long') && !norm.includes('long ga')) || norm.includes('doi tiet') || norm.includes('doi huyet')) {
      return [0, 1]; // Cháo Lòng (pork offal porridge)
    }
    return [2, 3]; // General white rice porridge
  }

  return Array.from({ length: poolLength }, (_, i) => i);
}

function pickDeterministicUrl(poolKey: string, seedString: string): string {
  const pool = FOOD_IMAGE_POOLS[poolKey];
  if (!pool || pool.length === 0) {
    const defaultPool = FOOD_IMAGE_POOLS['com_tam'] || [];
    return defaultPool[0] || '';
  }
  const allowedIndices = getAllowedPoolIndices(poolKey, seedString, pool.length);
  const hash = hashDishTitle(seedString);
  const chosenIdx = allowedIndices[hash % allowedIndices.length];
  return pool[chosenIdx];
}

// ============================================================================
// 6. TIER 2 & TIER 3 FALLBACK CASCADE
// ============================================================================

export function getCategoryFallbackKey(category?: string): string {
  if (!category) return 'com_tam';
  const cleanCat = category.toLowerCase().trim();

  switch (cleanCat) {
    case 'mon-canh':
      return 'canh_thanh_mat';
    case 'mon-xao':
      return 'rau_xao_thap_cam';
    case 'mon-chay':
      return 'mon_chay_tofu_mushroom';
    case 'mon-man':
      return 'thit_kho_tau';
    case 'an-nhanh':
      return 'banh_mi';
    case 'an-vat':
      return 'french_fries';
    case 'nuoc-uong':
    case 'do-uong':
      return 'tra_dao_cam_sa';
    case 'trang-mieng':
      return 'che_truyen_thong';
    case 'doc-la':
      return 'mam_tom_mam_nem';
    case 'an-sang':
      return 'trung_cuon_omelette';
    case 'mon-rau':
      return 'salad_tay_caesar';
    case 'mon-chinh':
    default:
      return 'com_tam';
  }
}

// ============================================================================
// 7. SEMANTIC CLUSTER RESOLUTION & PUBLIC RESOLVER FUNCTION
// ============================================================================

/**
 * Resolves a dish or recipe title to its best-matching culinary cluster key.
 */
export function resolveCulinaryCluster(title: string, category?: string): string {
  const rawTitle = title || '';
  // If title is a multi-dish combo ("Main + Soup + Drink" or "Mâm Cơm Main, Canh..."), resolve based on the primary main dish
  let primaryTitle = rawTitle.includes(' + ') ? rawTitle.split(' + ')[0].trim() : rawTitle;
  if (/^mâm cơm/i.test(primaryTitle)) {
    if (primaryTitle.includes(':')) {
      primaryTitle = primaryTitle.split(':').slice(1).join(':').trim();
    }
    if (primaryTitle.includes(',')) {
      primaryTitle = primaryTitle.split(',')[0].trim();
    }
    primaryTitle = primaryTitle.replace(/^mâm cơm\s*(miền nam|nam bộ|miền bắc|bắc bộ|miền trung|chay|healthy|âu)?\s*:?\s*/i, '').trim() || primaryTitle;
  }
  const parsed = normalizeVietnameseDish(primaryTitle);
  const normTitle = parsed.normalized;
  const tokens = parsed.tokens;

  let bestClusterKey: string | null = null;
  let bestScore = -Infinity;

  for (const rule of CLUSTER_RULES) {
    let score = 0;
    let hasPrimaryMatch = false;

    // Check disqualifiers (-100)
    if (rule.disqualifiers) {
      const hasDisqualifier = rule.disqualifiers.some(d => matchesTokenOrPhrase(d, normTitle, tokens));
      if (hasDisqualifier) {
        score -= 100;
      }
    }

    // Check exact compounds (+100)
    if (rule.exactCompounds) {
      for (const compound of rule.exactCompounds) {
        if (normTitle.includes(compound)) {
          score += 100;
          hasPrimaryMatch = true;
          break;
        }
      }
    }

    // Check required token groups (+70 if all groups satisfied)
    if (rule.requiredTokenGroups && rule.requiredTokenGroups.length > 0) {
      const allGroupsSatisfied = rule.requiredTokenGroups.every(group =>
        group.some(token => matchesTokenOrPhrase(token, normTitle, tokens))
      );
      if (allGroupsSatisfied) {
        score += 70;
        hasPrimaryMatch = true;
      }
    }

    if (hasPrimaryMatch) {
      // Check modifier tokens (+15 each)
      if (rule.modifiers) {
        for (const mod of rule.modifiers) {
          if (matchesTokenOrPhrase(mod, normTitle, tokens)) {
            score += 15;
          }
        }
      }

      // Category hint bonus (+20)
      if (category && rule.categoryBonus) {
        if (rule.categoryBonus.includes(category.toLowerCase().trim())) {
          score += 20;
        }
      }
    }

    // Track winner
    if (score > bestScore) {
      bestScore = score;
      bestClusterKey = rule.key;
    }
  }

  // Threshold >= 40 indicates positive semantic confidence
  if (bestClusterKey && bestScore >= 40) {
    return bestClusterKey;
  }

  return getCategoryFallbackKey(category);
}

/**
 * Resolves the most accurate, high-definition food photograph for a dish.
 * 
 * @param title The dish, drink, or snack title in Vietnamese or English.
 * @param category Optional category slug (e.g. 'mon-chinh', 'mon-canh', 'nuoc-uong').
 * @param existingUrl Optional existing image URL in the database.
 * @returns Verified CDN URL matching the exact culinary cluster.
 */
export function getDishImageUrl(
  title: string,
  category?: string,
  existingUrl?: string
): string {
  const rawTitle = title || '';
  const clusterKey = resolveCulinaryCluster(rawTitle, category);

  // Step A: Inspect existingUrl for validity and semantic cluster alignment
  if (existingUrl && !isDeadOrPlaceholderUrl(existingUrl)) {
    // Preserve custom non-pool URLs (e.g. external custom upload or data:image/png)
    if (!existingUrl.includes('images.unsplash.com') && !existingUrl.includes('wikimedia.org')) {
      return existingUrl;
    }
    // For pool URLs, only keep existingUrl if it belongs to the allowed sub-slice of the resolved semantic cluster pool
    const clusterPool = FOOD_IMAGE_POOLS[clusterKey] || [];
    const allowedIndices = getAllowedPoolIndices(clusterKey, rawTitle, clusterPool.length);
    const allowedPoolUrls = allowedIndices.map(idx => clusterPool[idx]).filter(Boolean);
    const existingBase = existingUrl.split('?')[0];
    const matchedPoolUrl = allowedPoolUrls.find(poolUrl => poolUrl.includes(existingBase));
    if (matchedPoolUrl) {
      return matchedPoolUrl;
    }
  }

  return pickDeterministicUrl(clusterKey, rawTitle);
}

