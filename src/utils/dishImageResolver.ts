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
// 2. CURATED HIGH-DEFINITION CULINARY POOLS (VERIFIED UNSPLASH CDN)
// ============================================================================
export const CULINARY_82_POOLS: Record<string, string[]> = {
  // 1. burger
  burger: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=600&q=80',
  ],

  // 2. fried_chicken
  fried_chicken: [
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=600&q=80',
  ],

  // 3. pizza
  pizza: [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80',
  ],

  // 4. french_fries
  french_fries: [
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80',
  ],

  // 5. hotdogs_sausage
  hotdogs_sausage: [
    'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
  ],

  // 6. tacos_wraps
  tacos_wraps: [
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=600&q=80',
  ],

  // 7. banh_trang_nuong
  banh_trang_nuong: [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
  ],

  // 8. banh_trang_tron
  banh_trang_tron: [
    'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
  ],

  // 9. nem_chua_ran
  nem_chua_ran: [
    'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
  ],

  // 10. xien_que_ca_vien
  xien_que_ca_vien: [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
  ],

  // 11. pho_bo
  pho_bo: [
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80',
  ],

  // 12. pho_ga
  pho_ga: [
    'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
  ],

  // 13. bun_cha
  bun_cha: [
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
  ],

  // 14. bun_bo_hue
  bun_bo_hue: [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
  ],

  // 15. bun_rieu
  bun_rieu: [
    'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80',
  ],

  // 16. bun_dau_mam_tom
  bun_dau_mam_tom: [
    'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  ],

  // 17. bun_thit_nuong
  bun_thit_nuong: [
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
  ],

  // 18. hu_tieu
  hu_tieu: [
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?auto=format&fit=crop&w=600&q=80',
  ],

  // 19. mi_quang_cao_lau
  mi_quang_cao_lau: [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
  ],

  // 20. banh_mi
  banh_mi: [
    'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  ],

  // 21. com_tam
  com_tam: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
  ],

  // 22. com_rang
  com_rang: [
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
  ],

  // 23. xoi
  xoi: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
  ],

  // 24. thit_kho_tau
  thit_kho_tau: [
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
  ],

  // 25. thit_rang_chay_canh
  thit_rang_chay_canh: [
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
  ],

  // 26. ca_kho_to
  ca_kho_to: [
    'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=600&q=80',
  ],

  // 27. suon_ram
  suon_ram: [
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
  ],

  // 28. ga_kho_gung_sa
  ga_kho_gung_sa: [
    'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1606728035253-49e8a23146de?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80',
  ],

  // 29. bo_xao_can_toi
  bo_xao_can_toi: [
    'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
  ],

  // 30. tom_rim_hai_san
  tom_rim_hai_san: [
    'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=600&q=80',
  ],

  // 31. dau_sot_ca_chua
  dau_sot_ca_chua: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1578861256505-d3be7cb037d3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
  ],

  // 32. canh_chua
  canh_chua: [
    'https://images.unsplash.com/photo-1578861256505-d3be7cb037d3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
  ],

  // 33. canh_cua_rau_day
  canh_cua_rau_day: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1578861256505-d3be7cb037d3?auto=format&fit=crop&w=600&q=80',
  ],

  // 34. canh_suon_sau_kim_chi
  canh_suon_sau_kim_chi: [
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1578861256505-d3be7cb037d3?auto=format&fit=crop&w=600&q=80',
  ],

  // 35. canh_thanh_mat
  canh_thanh_mat: [
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1578861256505-d3be7cb037d3?auto=format&fit=crop&w=600&q=80',
  ],

  // 36. canh_kho_qua
  canh_kho_qua: [
    'https://images.unsplash.com/photo-1578861256505-d3be7cb037d3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
  ],

  // 37. rau_muong_xao_luoc
  rau_muong_xao_luoc: [
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  ],

  // 38. rau_cu_luoc_kho_quet
  rau_cu_luoc_kho_quet: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
  ],

  // 39. rau_xao_thap_cam
  rau_xao_thap_cam: [
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  ],

  // 40. ca_phe_vietnam
  ca_phe_vietnam: [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
  ],

  // 41. ca_phe_muoi_artisan
  ca_phe_muoi_artisan: [
    'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
  ],

  // 42. tra_dao_cam_sa
  tra_dao_cam_sa: [
    'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
  ],

  // 43. tra_sua_tran_chau
  tra_sua_tran_chau: [
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=600&q=80',
  ],

  // 44. sinh_to_trai_cay
  sinh_to_trai_cay: [
    'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
  ],

  // 45. nuoc_mia_nuoc_sam
  nuoc_mia_nuoc_sam: [
    'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
  ],

  // 46. che_duong_nhan_khuc_bach
  che_duong_nhan_khuc_bach: [
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  ],

  // 47. che_truyen_thong
  che_truyen_thong: [
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  ],

  // 48. flan_caramen
  flan_caramen: [
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80',
  ],

  // 49. kem_gelato_yogurt
  kem_gelato_yogurt: [
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80',
  ],

  // 50. mam_tom_mam_nem
  mam_tom_mam_nem: [
    'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80',
  ],

  // 51. sau_rieng_dac_san
  sau_rieng_dac_san: [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80',
  ],

  // 52. trung_vit_lon
  trung_vit_lon: [
    'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  ],

  // 53. con_trung_chien_gion
  con_trung_chien_gion: [
    'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
  ],

  // 54. do_cay_nong_extreme
  do_cay_nong_extreme: [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
  ],

  // 55. bizarre_modern_fusion
  bizarre_modern_fusion: [
    'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  ],

  // --- 27 NEW GRANULAR CULINARY CLUSTERS (56 - 82) ---
  // 56. trung_cuon_omelette
  trung_cuon_omelette: [
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=600&q=80',
  ],

  // 57. steak_beef
  steak_beef: [
    'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=600&q=80',
  ],

  // 58. my_y_pasta
  my_y_pasta: [
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80',
  ],

  // 59. burrito_quesadilla
  burrito_quesadilla: [
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=600&q=80',
  ],

  // 60. sup_kem_tay_chowder
  sup_kem_tay_chowder: [
    'https://images.unsplash.com/photo-1578861256505-d3be7cb037d3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=600&q=80',
  ],

  // 61. salad_tay_caesar
  salad_tay_caesar: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=600&q=80',
  ],

  // 62. banh_mi_sandwich_toast
  banh_mi_sandwich_toast: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
  ],

  // 63. risotto_paella
  risotto_paella: [
    'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
  ],

  // 64. seafood_western
  seafood_western: [
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=600&q=80',
  ],

  // 65. bbq_ribs_roast
  bbq_ribs_roast: [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
  ],

  // 66. pancake_waffle
  pancake_waffle: [
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
  ],

  // 67. overnight_oats_granola
  overnight_oats_granola: [
    'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=600&q=80',
  ],

  // 68. curry_dishes
  curry_dishes: [
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1578861256505-d3be7cb037d3?auto=format&fit=crop&w=600&q=80',
  ],

  // 69. soup_clear_western
  soup_clear_western: [
    'https://images.unsplash.com/photo-1578861256505-d3be7cb037d3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=600&q=80',
  ],

  // 70. goi_nom_vietnam
  goi_nom_vietnam: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
  ],

  // 71. cha_ca_vietnam
  cha_ca_vietnam: [
    'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=600&q=80',
  ],

  // 72. banh_xeo_banh_khot
  banh_xeo_banh_khot: [
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
  ],

  // 73. banh_cuon_banh_uot
  banh_cuon_banh_uot: [
    'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
  ],

  // 74. chao_vietnam
  chao_vietnam: [
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
  ],

  // 75. lau_vietnam
  lau_vietnam: [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
  ],

  // 76. nem_cuon_spring_rolls
  nem_cuon_spring_rolls: [
    'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  ],

  // 77. trung_chien_op_la
  trung_chien_op_la: [
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
  ],

  // 78. ha_cao_dimsum
  ha_cao_dimsum: [
    'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
  ],

  // 79. muc_bach_tuoc_nuong_xao
  muc_bach_tuoc_nuong_xao: [
    'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=600&q=80',
  ],

  // 80. thit_heo_quay_kho_dua
  thit_heo_quay_kho_dua: [
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
  ],

  // 81. canh_kim_chi_hai_san
  canh_kim_chi_hai_san: [
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1578861256505-d3be7cb037d3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
  ],

  // 82. mon_chay_tofu_mushroom
  mon_chay_tofu_mushroom: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1578861256505-d3be7cb037d3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
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
  western_toast_pancake: CULINARY_82_POOLS.banh_mi_sandwich_toast,
  western_sides: [
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
  ],
  western_seafood: CULINARY_82_POOLS.seafood_western,
  trai_cay_trang_mieng: [
    'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
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
  [/cà tím|ca tim/gi, '__VEG_CA_TIM__'],
  [/cà pháo|ca phao/gi, '__VEG_CA_PHAO__'],
  [/cà ri|ca ri|curry/gi, '__DISH_CA_RI__'],
  [/cà phê|ca phe|coffee|càphe/gi, '__DRINK_CA_PHE__'],
  [/phô mai|pho mai/gi, '__INGR_PHO_MAI__'],
  [/bơ lạt|bo lat|bơ thơm|bo thom/gi, '__INGR_BUTTER__'],
  [/sốt kem|sot kem|kem chua|kem nấm|kem nam|kem tỏi|kem toi|kem béo|kem beo/gi, '__SAUCE_CREAM__'],
  [/nam vang/gi, '__GEO_NAM_VANG__'],
  [/bánh mì chảo|banh mi chao/gi, '__DISH_BANH_MI_CHAO__'],
  [/cơm gà xối mỡ|com ga xoi mo/gi, '__DISH_COM_GA_XOI_MO__'],
  [/bún đậu mắm tôm|bun dau mam tom/gi, '__DISH_BUN_DAU_MAM_TOM__'],
  [/bún chả|bun cha/gi, '__DISH_BUN_CHA__'],
  [/bún bò huế|bun bo hue/gi, '__DISH_BUN_BO_HUE__'],
  [/bún riêu|bun rieu/gi, '__DISH_BUN_RIEU__'],
  [/mì quảng|mi quang/gi, '__DISH_MI_QUANG__'],
  [/cao lầu|cao lau/gi, '__DISH_CAO_LAU__'],
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

  let text = rawTitle.toLowerCase();

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
      'canh ga ap chao', 'thit ga kieu au', 'ga ap chao'
    ],
    requiredTokenGroups: [
      ['ga', 'chicken'],
      ['ran', 'xoi mo', 'chien', 'nuggets', 'pop', 'gion', 'crispy', 'ap chao']
    ],
    modifiers: ['ran', 'chien', 'xoi mo', 'gion', 'canh ga', 'dui ga', 'sot cay'],
    disqualifiers: ['burger', 'hamburger', 'sandwich', 'banh mi', 'luoc', 'hap', 'chao ga', 'pho ga'],
    categoryBonus: ['an-nhanh', 'mon-chinh', 'mon-man'],
  },
  {
    key: 'pizza',
    exactCompounds: ['pizza'],
    requiredTokenGroups: [['pizza']],
    disqualifiers: ['banh trang nuong'],
  },
  {
    key: 'french_fries',
    exactCompounds: ['khoai tay chien', 'khoai lang ken', 'khoai lac', 'french fries', 'potato chips', 'khoai tay'],
    requiredTokenGroups: [
      ['khoai'],
      ['chien', 'lac', 'ken', 'tay']
    ],
    categoryBonus: ['an-vat'],
  },
  {
    key: 'hotdogs_sausage',
    exactCompounds: ['hotdog', 'xuc xich', 'lap xuong', 'xuc xich duc', 'xuc xich nuong'],
    requiredTokenGroups: [['hotdog', 'xuc xich', 'lap xuong']],
    disqualifiers: ['omelette', 'trung cuon', 'banh mi', '__dish_banh_mi_chao__', 'chao', 'my y', 'pasta'],
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
      'pho nam', 'pho gau', 'pho sot vang', 'pho bap bo'
    ],
    requiredTokenGroups: [
      ['pho'],
      ['bo', 'tai', 'chin', 'gau', 'nam', 'bap', 'sot vang']
    ],
    disqualifiers: [
      'pho ga', 'xao', 'cuon', '__ingr_pho_mai__', 'pho mai', 'salad',
      'banh mi', 'pizza', 'pasta', 'burger', 'sandwich', 'caprese', 'anchor', 'parmesan'
    ],
    categoryBonus: ['mon-chinh'],
  },
  {
    key: 'pho_ga',
    exactCompounds: ['pho ga', 'pho ga doi', 'pho ga tron', 'pho ga ta', 'pho dui ga', 'pho ga xe'],
    requiredTokenGroups: [
      ['pho'],
      ['ga']
    ],
    disqualifiers: ['bo', 'xao'],
    categoryBonus: ['mon-chinh'],
  },
  {
    key: 'bun_cha',
    exactCompounds: ['__dish_bun_cha__', 'bun cha', 'bun cha ha noi', 'cha mieng cha bam'],
    requiredTokenGroups: [
      ['bun cha', '__dish_bun_cha__']
    ],
    categoryBonus: ['mon-chinh'],
  },
  {
    key: 'bun_bo_hue',
    exactCompounds: ['__dish_bun_bo_hue__', 'bun bo hue', 'bun bo gio heo', 'bun bo cay'],
    requiredTokenGroups: [
      ['bun bo hue', '__dish_bun_bo_hue__']
    ],
    categoryBonus: ['mon-chinh'],
  },
  {
    key: 'bun_rieu',
    exactCompounds: ['__dish_bun_rieu__', 'bun rieu', 'bun rieu cua', 'bun rieu oc', 'canh bun', 'bun oc'],
    requiredTokenGroups: [
      ['bun rieu', '__dish_bun_rieu__', 'canh bun', 'bun oc']
    ],
    categoryBonus: ['mon-chinh'],
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
    exactCompounds: ['bun thit nuong', 'bun thit nuong cha gio', 'bun cha gio', 'bun thit xao'],
    requiredTokenGroups: [
      ['bun'],
      ['thit nuong', 'cha gio', 'thit xao']
    ],
    categoryBonus: ['mon-chinh'],
  },
  {
    key: 'hu_tieu',
    exactCompounds: ['hu tieu', 'hu tieu nam vang', '__geo_nam_vang__', 'hu tieu muc', 'hu tieu go', 'hu tieu suon'],
    requiredTokenGroups: [
      ['hu tieu', '__geo_nam_vang__']
    ],
    categoryBonus: ['mon-chinh'],
  },
  {
    key: 'mi_quang_cao_lau',
    exactCompounds: ['__dish_mi_quang__', '__dish_cao_lau__', 'mi quang', 'cao lau', 'cao lau hoi an', 'mi quang tom thit'],
    requiredTokenGroups: [
      ['mi quang', 'cao lau', '__dish_mi_quang__', '__dish_cao_lau__']
    ],
    categoryBonus: ['mon-chinh'],
  },
  {
    key: 'banh_mi',
    exactCompounds: [
      'banh mi', '__dish_banh_mi_chao__', 'banh mi pate', 'banh mi kep',
      'banh mi chao', 'banh mi heo quay', 'sandwich', 'banh mi xiu mai',
      'banh mi que', 'pate'
    ],
    requiredTokenGroups: [
      ['banh mi', '__dish_banh_mi_chao__', 'sandwich']
    ],
    disqualifiers: ['banh mi nuong muoi ot'],
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
    categoryBonus: ['mon-chinh'],
  },
  {
    key: 'com_rang',
    exactCompounds: ['com rang', 'com chien', 'com rang dua bo', 'com rang duong chau', 'com chien duong chau'],
    requiredTokenGroups: [
      ['com'],
      ['rang', 'chien']
    ],
    categoryBonus: ['mon-chinh'],
  },
  {
    key: 'xoi',
    exactCompounds: ['xoi xeo', 'xoi ga', 'xoi thit kho', 'xoi man', 'xoi khuc', 'xoi'],
    requiredTokenGroups: [['xoi']],
    categoryBonus: ['mon-chinh', 'an-nhanh'],
  },

  // --- HOME-COOKED MEAL SETS (MÓN MẶN, CANH, RAU) ---
  {
    key: 'thit_kho_tau',
    exactCompounds: ['thit kho tau', 'thit kho trung', 'thit kho hot vit', 'thit kho nuoc dua'],
    requiredTokenGroups: [
      ['thit', 'ba chi'],
      ['kho tau', 'kho trung', 'nuoc dua']
    ],
    categoryBonus: ['mon-man'],
  },
  {
    key: 'thit_rang_chay_canh',
    exactCompounds: ['thit rang chay canh', 'thit ba chi rang', 'thit rang man', 'ba chi chay canh'],
    requiredTokenGroups: [
      ['thit', 'ba chi'],
      ['rang', 'chay canh']
    ],
    categoryBonus: ['mon-man'],
  },
  {
    key: 'ca_kho_to',
    exactCompounds: [
      'ca kho to', 'ca kho tieu', 'ca kho rieng', 'ca ba sa kho', 'ca bong kho',
      'ca basa kho', 'ca loc kho', 'ca nuc kho', 'ca kho', 'ca chien', 'ca nuong', 'ca dieu hong'
    ],
    requiredTokenGroups: [
      ['ca', 'fish'],
      ['kho', 'chien', 'nuong', 'to', 'kho to', 'basa', 'loc', 'nuc', 'hoi', 'dieu hong']
    ],
    disqualifiers: [
      '__veg_ca_chua__', '__veg_ca_tim__', '__veg_ca_phao__', '__drink_ca_phe__',
      'vien', 'canh chua', 'canh', 'cha ca', 'fish and chips', 'fish & chips',
      'kieu au', 'nauy', 'tartar', 'seafood'
    ],
    categoryBonus: ['mon-man'],
  },
  {
    key: 'suon_ram',
    exactCompounds: ['suon ram', 'suon xao chua ngot', 'suon rim', 'suon nuong com tam', 'suon non ram', 'suon nuong'],
    requiredTokenGroups: [
      ['suon'],
      ['ram', 'xao chua ngot', 'rim', 'nuong', 'man']
    ],
    disqualifiers: ['canh suon', 'canh', 'bbq', 'ribs'],
    categoryBonus: ['mon-man'],
  },
  {
    key: 'ga_kho_gung_sa',
    exactCompounds: [
      'ga kho gung', 'ga kho sa', 'ga rang gung', 'ga kho sa ot',
      'ga luoc', 'ga hap la chanh', 'ga rang', 'ga hap', 'ga xe phay'
    ],
    requiredTokenGroups: [
      ['ga'],
      ['kho', 'rang', 'luoc', 'hap', 'gung', 'sa', 'xe phay', 'la chanh']
    ],
    modifiers: ['gung', 'sa', 'ot', 'la chanh', 'tieu', 'kho'],
    disqualifiers: ['ran', 'xoi mo', 'gion', 'chien', 'pho ga', 'chao ga'],
    categoryBonus: ['mon-man'],
  },
  {
    key: 'bo_xao_can_toi',
    exactCompounds: [
      'bo xao can toi', 'bo xao', 'bo xao can tay', 'bo xao hanh tay',
      'bo luc lac', 'thit bo xao'
    ],
    requiredTokenGroups: [
      ['bo', 'beef'],
      ['xao', 'luc lac', 'can toi']
    ],
    disqualifiers: ['pho', 'bun bo', 'steak', 'bit tet', 'beefsteak'],
    categoryBonus: ['mon-man', 'mon-xao'],
  },
  {
    key: 'tom_rim_hai_san',
    exactCompounds: ['tom rim', 'tom rim man ngot', 'tom rang thit', 'tom rang muoi', 'muc xao', 'muc hap', 'hai san xao'],
    requiredTokenGroups: [
      ['tom', 'muc', 'bach tuoc', 'hai san', 'cua'],
      ['rim', 'xao', 'hap', 'nuong', 'rang']
    ],
    categoryBonus: ['mon-man', 'mon-xao'],
  },
  {
    key: 'dau_sot_ca_chua',
    exactCompounds: [
      'dau sot ca chua', 'dau nhoi thit', 'dau hu sot ca', 'dau phu sot ca',
      '__veg_ca_chua__ nhoi thit', 'ca chua nhoi thit', 'dau hu don thit', 'dau phu sot'
    ],
    requiredTokenGroups: [
      ['dau', 'dau hu', 'dau phu', '__veg_ca_chua__'],
      ['sot', 'nhoi thit', 'sot ca', 'don thit']
    ],
    categoryBonus: ['mon-man', 'mon-chay'],
  },
  {
    key: 'canh_chua',
    exactCompounds: ['canh chua', 'canh chua ca loc', 'canh chua ca hu', 'canh chua tom', 'canh chua ca hoi', 'canh chua nam bo'],
    requiredTokenGroups: [
      ['canh chua']
    ],
    categoryBonus: ['mon-canh'],
  },
  {
    key: 'canh_cua_rau_day',
    exactCompounds: ['canh cua', 'canh cua rau day', 'canh cua mong toi', 'canh cua dong', 'canh rieu cua', 'reu cua'],
    requiredTokenGroups: [
      ['canh cua', 'canh rieu cua', 'reu cua']
    ],
    categoryBonus: ['mon-canh'],
  },
  {
    key: 'canh_suon_sau_kim_chi',
    exactCompounds: ['canh suon', 'canh suon sau', 'canh suon chua', 'canh suon bi', 'canh suon ham'],
    requiredTokenGroups: [
      ['canh'],
      ['suon', 'sau']
    ],
    disqualifiers: ['kim chi'],
    categoryBonus: ['mon-canh'],
  },
  {
    key: 'canh_thanh_mat',
    exactCompounds: [
      'canh rau ngot', 'canh bi do', 'canh cai thia', 'canh muop',
      'canh bau', 'canh rau', 'canh ngao', 'canh thit bam', 'canh rong bien', 'canh ngot'
    ],
    requiredTokenGroups: [
      ['canh', 'sup'],
      ['ngao', 'thit bam', 'rau ngot', 'rong bien', 'bi xanh', 'bi do', 'mong toi', 'thanh mat', 'cai', 'muop', 'bau']
    ],
    categoryBonus: ['mon-canh'],
  },
  {
    key: 'canh_kho_qua',
    exactCompounds: ['canh kho qua', 'kho qua nhoi thit', 'canh muop dang'],
    requiredTokenGroups: [
      ['canh kho qua', 'kho qua nhoi thit', 'muop dang']
    ],
    categoryBonus: ['mon-canh'],
  },
  {
    key: 'rau_muong_xao_luoc',
    exactCompounds: ['rau muong xao toi', 'rau muong luoc', 'rau muong dam sau', 'rau muong'],
    requiredTokenGroups: [
      ['rau muong']
    ],
    categoryBonus: ['mon-xao', 'mon-chay'],
  },
  {
    key: 'rau_cu_luoc_kho_quet',
    exactCompounds: [
      'rau cu luoc kho quet', 'kho quet', 'rau tap tang', 'cu qua luoc',
      'bap cai luoc', 'cai ngot luoc', 'ca phao', '__veg_ca_phao__', 'rau cu luoc'
    ],
    requiredTokenGroups: [
      ['kho quet', 'rau cu luoc', 'rau luoc', 'bap cai luoc', 'ca phao', '__veg_ca_phao__']
    ],
    categoryBonus: ['mon-xao', 'mon-chay', 'mon-rau'],
  },
  {
    key: 'rau_xao_thap_cam',
    exactCompounds: [
      'rau xao thap cam', 'cai ngot xao', 'cai thia xao', 'nam xao',
      '__veg_ca_tim__ xao', 'ca tim xao', 'bong cai xao', 'dau que xao',
      'muop dang xao trung', 'su su xao'
    ],
    requiredTokenGroups: [
      ['rau', 'cai', 'nam', '__veg_ca_tim__', 'ca tim', 'bong cai', 'dau que', 'dau ve', 'su su', 'muop dang'],
      ['xao', 'luoc', 'salad', 'chay', 'trung']
    ],
    categoryBonus: ['mon-xao', 'mon-chay'],
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
    exactCompounds: ['tra dao', 'tra dao cam sa', 'tra vai', 'tra mang cau', 'tra chanh', 'tra tac', 'tra quat', 'tra quat mat ong'],
    requiredTokenGroups: [
      ['tra'],
      ['dao', 'cam sa', 'vai', 'mang cau', 'chanh', 'tac', 'quat', 'trai cay', 'mint']
    ],
    categoryBonus: ['nuoc-uong', 'do-uong'],
  },
  {
    key: 'tra_sua_tran_chau',
    exactCompounds: ['tra sua', 'tra sua tran chau', 'tra sua duong den', 'tra sua oolong', 'tra sua o long', 'matcha'],
    requiredTokenGroups: [
      ['tra sua', 'milk tea', 'boba', 'matcha']
    ],
    categoryBonus: ['nuoc-uong', 'do-uong'],
  },
  {
    key: 'sinh_to_trai_cay',
    exactCompounds: ['sinh to', 'sinh to bo', 'sinh to xoai', 'sinh to mang cau', 'nuoc ep', 'nuoc ep cam', 'smoothie'],
    requiredTokenGroups: [
      ['sinh to', 'nuoc ep', 'smoothie', 'juice']
    ],
    categoryBonus: ['nuoc-uong', 'do-uong'],
  },
  {
    key: 'nuoc_mia_nuoc_sam',
    exactCompounds: ['nuoc mia', 'nuoc sam', 'nuoc sam bi dao', 'tra atiso', 'nuoc mat', 'nuoc mia sieu sach'],
    requiredTokenGroups: [
      ['nuoc mia', 'nuoc sam', 'atiso', 'nuoc mat']
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
    exactCompounds: ['che buoi', 'che dau den', 'che dau do', 'che hat sen', 'che thai', 'che buoi an giang', 'che thai sau rieng'],
    requiredTokenGroups: [
      ['che'],
      ['buoi', 'dau den', 'dau do', 'hat sen', 'thai', 'khoai mon', 'bap']
    ],
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
    exactCompounds: ['kem bo', 'sua chua tran chau', 'gelato', 'kem ly', 'ice cream', 'kem bo da lat', 'kem gelato'],
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
    exactCompounds: ['mam tom', 'mam nem', 'mam ruoc', 'mam tep'],
    requiredTokenGroups: [
      ['mam tom', 'mam nem', 'mam ruoc', 'mam tep']
    ],
    disqualifiers: ['__dish_bun_dau_mam_tom__', 'bun dau'],
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
    exactCompounds: ['trung vit lon', 'hot vit lon', 'cut lon xao me', 'trung bac thao'],
    requiredTokenGroups: [
      ['trung vit lon', 'hot vit lon', 'cut lon xao me', 'trung bac thao', 'cut lon']
    ],
    categoryBonus: ['doc-la', 'an-vat'],
  },
  {
    key: 'con_trung_chien_gion',
    exactCompounds: ['de men', 'nhong tam', 'chau chau', 'con trung chien', 've sau', 'de men chien gion'],
    requiredTokenGroups: [
      ['de men', 'nhong tam', 'chau chau', 'con trung']
    ],
    categoryBonus: ['doc-la'],
  },
  {
    key: 'do_cay_nong_extreme',
    exactCompounds: ['mi cay 7 cap do', 'ot hiem', 'cay xe luoi', 'cay te tai', 'sieu cay', 'mi cay'],
    requiredTokenGroups: [
      ['mi cay', 'ot hiem', 'sieu cay', 'cay xe luoi', 'cay te tai']
    ],
    categoryBonus: ['doc-la'],
  },
  {
    key: 'bizarre_modern_fusion',
    exactCompounds: ['tra sua hanh la', 'dau hu thoi', 'kem ot cay', 'ca phe mam tom', 'kem ot'],
    requiredTokenGroups: [
      ['tra sua hanh la', 'dau hu thoi', 'kem ot', 'ca phe mam tom']
    ],
    categoryBonus: ['doc-la'],
  },

  // ==========================================================================
  // 27 NEW GRANULAR CULINARY CLUSTERS (TOTAL 82 TAXONOMY CLUSTERS)
  // ==========================================================================
  {
    key: 'trung_cuon_omelette',
    exactCompounds: [
      'trung cuon omelette', 'omelette', 'trung cuon', 'scrambled eggs', 'trung khuay',
      'tamagoyaki', 'frittata', 'trung cuon xuc xich', 'omelet', 'skillet eggs'
    ],
    requiredTokenGroups: [
      ['trung cuon', 'omelette', 'scrambled', 'tamagoyaki', 'frittata', 'omelet']
    ],
    modifiers: ['xuc xich', 'pho mai', 'nam', 'thit', 'bo', 'duc'],
    categoryBonus: ['an-sang'],
  },
  {
    key: 'steak_beef',
    exactCompounds: [
      'bo bit tet', 'beefsteak', 'steak', 'than noi', 'than lung', 'ribeye', 'striploin',
      'bo bit tet sot tieu', 'than bo my', 'bap bo uc sot', 'bit tet',
      'beef stroganoff', 'stroganoff', 'bap bo kieu nga', 'de suon bo kieu nga'
    ],
    requiredTokenGroups: [
      ['bit tet', 'steak', 'ribeye', 'striploin', 'beefsteak', 'than noi', 'than lung', 'stroganoff', 'beef stroganoff']
    ],
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
      'chowder', 'pumpkin cream soup', 'sup kem tay', 'sup bi do hat de'
    ],
    requiredTokenGroups: [
      ['sup kem', 'chowder', 'sup bi do', 'sup nam']
    ],
    categoryBonus: ['mon-canh'],
  },
  {
    key: 'salad_tay_caesar',
    exactCompounds: [
      'salad caesar', 'caesar salad', 'greek salad', 'cobb salad', 'salad luon ga',
      'salad ga nuong', 'coleslaw', 'caesar', 'caprese', 'salad caprese',
      'salad bo', 'salad trai cay', 'salad qua bo', 'salad rau cu'
    ],
    requiredTokenGroups: [
      ['salad caesar', 'caesar salad', 'caesar', 'coleslaw', 'greek salad', 'caprese', 'salad']
    ],
    categoryBonus: ['mon-rau', 'mon-chay'],
  },
  {
    key: 'banh_mi_sandwich_toast',
    exactCompounds: [
      'french toast', 'garlic bread', 'avocado toast', 'banh mi nuong bo toi',
      'banh mi nuong kieu phap', 'banh mi bo sap', 'garlic toast'
    ],
    requiredTokenGroups: [
      ['french toast', 'avocado toast', 'banh mi nuong kieu phap', 'banh mi bo sap', 'garlic bread']
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
      'fish and chips', 'fish & chips', 'ca hoi nauy', 'ca hoi nuong', 'ca vuoc', 'ca tuyet',
      'hai san kieu au', 'seafood kieu au'
    ],
    requiredTokenGroups: [
      ['ca hoi', 'salmon', 'ca tuyet', 'ca vuoc', 'fish and chips', 'fish & chips', 'tom bo toi', 'hai san', 'muc', 'ngheu']
    ],
    categoryBonus: ['mon-man', 'mon-chinh'],
  },
  {
    key: 'bbq_ribs_roast',
    exactCompounds: [
      'suon nuong bbq', 'bbq ribs', 'roast beef', 'bo dut lo', 'ga quay thao moc',
      'suon tang nuong', 'suon bbq', 'schnitzel', 'pulled pork', 'suon cay heo',
      'thit cot let', 'thit heo xe', 'viennese schnitzel', 'thit heo kieu au', 'chien xu kieu ao'
    ],
    requiredTokenGroups: [
      ['bbq ribs', 'roast beef', 'suon nuong bbq', 'suon bbq', 'suon tang', 'schnitzel', 'pulled pork', 'suon cay heo', 'thit cot let', 'thit heo xe', 'viennese schnitzel', 'thit heo kieu au']
    ],
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
      'yen mach sua chua', 'overnight oat'
    ],
    requiredTokenGroups: [
      ['overnight oats', 'granola', 'muesli', 'yen mach ngam']
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
      'goi tom thit', 'nom rau muong', 'nom sua'
    ],
    requiredTokenGroups: [
      ['goi', 'nom'],
      ['ngo sen', 'bo kho', 'du du', 'tai heo', 'xe phay', 'tom thit', 'rau muong', 'sua']
    ],
    disqualifiers: ['goi cuon'],
    categoryBonus: ['mon-xao', 'mon-chay'],
  },
  {
    key: 'cha_ca_vietnam',
    exactCompounds: ['cha ca la vong', 'cha ca thi la', 'cha ca chien rim', 'cha ca ha noi'],
    requiredTokenGroups: [
      ['cha ca la vong', 'cha ca thi la', 'cha ca ha noi']
    ],
    categoryBonus: ['mon-chinh', 'mon-man'],
  },
  {
    key: 'banh_xeo_banh_khot',
    exactCompounds: ['banh xeo', 'banh khot', 'banh xeo mien tay', 'banh khot vung tau', 'banh xeo tom thit'],
    requiredTokenGroups: [
      ['banh xeo', 'banh khot']
    ],
    categoryBonus: ['an-nhanh', 'mon-chinh'],
  },
  {
    key: 'banh_cuon_banh_uot',
    exactCompounds: ['banh cuon', 'banh uot', 'banh cuon nong', 'banh cuon cha que', 'banh uot long ga'],
    requiredTokenGroups: [
      ['banh cuon', 'banh uot']
    ],
    categoryBonus: ['an-sang', 'mon-chinh'],
  },
  {
    key: 'chao_vietnam',
    exactCompounds: [
      'chao suon', 'chao ga', 'chao bo', 'chao long', 'chao ca', 'chao vit', 'chao ech', 'chao nam'
    ],
    requiredTokenGroups: [
      ['chao'],
      ['suon', 'ga', 'bo', 'long', 'ca', 'vit', 'ech', 'nam', 'thit']
    ],
    categoryBonus: ['mon-canh', 'mon-chinh', 'an-sang'],
  },
  {
    key: 'lau_vietnam',
    exactCompounds: [
      'lau thai', 'lau rieu cua', 'lau ga la giang', 'lau bo', 'lau hai san', 'lau nam', 'lau ech'
    ],
    requiredTokenGroups: [
      ['lau'],
      ['thai', 'rieu cua', 'la giang', 'bo', 'hai san', 'nam', 'ech', 'chua cay']
    ],
    categoryBonus: ['mon-chinh'],
  },
  {
    key: 'nem_cuon_spring_rolls',
    exactCompounds: ['goi cuon', 'nem cuon', 'goi cuon tom thit', 'bi cuon', 'summer rolls'],
    requiredTokenGroups: [
      ['goi cuon', 'nem cuon', 'bi cuon', 'summer rolls']
    ],
    categoryBonus: ['an-nhanh', 'an-vat'],
  },
  {
    key: 'trung_chien_op_la',
    exactCompounds: [
      'trung op la', 'trung chien', 'trung ran', 'trung op la long dao', 'trung chien thit bam'
    ],
    requiredTokenGroups: [
      ['trung'],
      ['op la', 'chien', 'ran', 'long dao']
    ],
    disqualifiers: ['omelette', 'trung cuon', 'vit lon', 'scrambled'],
    categoryBonus: ['an-sang', 'mon-man'],
  },
  {
    key: 'ha_cao_dimsum',
    exactCompounds: ['ha cao', 'dimsum', 'dim sum', 'xiu mai', 'ha cao tom', 'banh bao hap', 'xiu mai sot ca'],
    requiredTokenGroups: [
      ['ha cao', 'dimsum', 'dim sum', 'xiu mai', 'banh bao']
    ],
    categoryBonus: ['an-nhanh', 'an-sang'],
  },
  {
    key: 'muc_bach_tuoc_nuong_xao',
    exactCompounds: [
      'muc nuong', 'bach tuoc nuong', 'muc sa te', 'muc xao sa te', 'bach tuoc nuong muoi ot', 'muc mot nang'
    ],
    requiredTokenGroups: [
      ['muc', 'bach tuoc'],
      ['nuong', 'sa te', 'muoi ot', 'mot nang', 'xao cay']
    ],
    categoryBonus: ['mon-man', 'mon-xao'],
  },
  {
    key: 'thit_heo_quay_kho_dua',
    exactCompounds: [
      'thit heo quay', 'heo quay', 'heo quay gion bi', 'ba chi kho dua', 'thit kho dua cai', 'thit quay'
    ],
    requiredTokenGroups: [
      ['heo quay', 'thit quay', 'kho dua']
    ],
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
    exactCompounds: ['dau hu kho nam', 'nam kho chay', 'dau non sot nam', 'dau hu chien sa ot', 'mon chay'],
    requiredTokenGroups: [
      ['dau hu', 'dau phu', 'nam'],
      ['kho chay', 'sot nam', 'chay', 'kho nam']
    ],
    categoryBonus: ['mon-chay'],
  },

  // Western aliases
  {
    key: 'western_sides',
    exactCompounds: [
      'khoai tay nghien', 'khoai tay mui cau', 'banh mi bo toi', 'mang tay ap chao',
      'dau que ap chao', 'khoai tay dut lo'
    ],
    requiredTokenGroups: [
      ['khoai tay nghien', 'khoai tay mui cau', 'banh mi bo toi', 'mang tay ap chao']
    ],
    categoryBonus: ['mon-rau'],
  },
  {
    key: 'trai_cay_trang_mieng',
    exactCompounds: [
      'dua hau', 'xoai cat', 'xoai chin', 'oi bo', 'thanh long', 'du du chin', 'buoi da xanh',
      'trai cay dia', 'hoa qua trang mieng', 'dia dua hau'
    ],
    requiredTokenGroups: [
      ['dua hau', 'xoai', 'oi bo', 'thanh long', 'du du', 'buoi', 'trai cay', 'hoa qua']
    ],
    categoryBonus: ['trang-mieng', 'an-vat'],
  },
];

// ============================================================================
// 5. DETERMINISTIC STRING HASHING & SEED RESOLUTION (32-BIT FNV-1a)
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

function pickDeterministicUrl(poolKey: string, seedString: string): string {
  const pool = FOOD_IMAGE_POOLS[poolKey];
  if (!pool || pool.length === 0) {
    const defaultPool = FOOD_IMAGE_POOLS['com_tam'] || [];
    return defaultPool[0] || '';
  }
  const hash = hashDishTitle(seedString);
  return pool[hash % pool.length];
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
  const parsed = normalizeVietnameseDish(rawTitle);
  const normTitle = parsed.normalized;
  const tokens = parsed.tokens;

  let bestClusterKey: string | null = null;
  let bestScore = -Infinity;

  for (const rule of CLUSTER_RULES) {
    let score = 0;

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
      }
    }

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
 * @returns Verified Unsplash CDN URL with auto=format&fit=crop&w=600&q=80.
 */
export function getDishImageUrl(
  title: string,
  category?: string,
  existingUrl?: string
): string {
  // Step A: Inspect existingUrl for validity
  if (existingUrl && !isDeadOrPlaceholderUrl(existingUrl)) {
    return existingUrl;
  }

  const rawTitle = title || '';
  const clusterKey = resolveCulinaryCluster(rawTitle, category);
  return pickDeterministicUrl(clusterKey, rawTitle);
}

