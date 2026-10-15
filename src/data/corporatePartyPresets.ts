import { CorporatePartyPreset } from '../types';
import { INITIAL_RECIPES } from './mockRecipes';

export const CORPORATE_PARTY_PRESETS: CorporatePartyPreset[] = [
  {
    id: 'corp-happy-hour',
    title: '🏢 Tiệc Chiều Thứ 6 & Gắn Kết Văn Phòng (Happy Hour)',
    categoryTag: 'Tiệc Nhẹ & Tụ Tập Văn Phòng',
    description: 'Thực đơn tiệc chiều thứ 6 nhẹ nhàng gắn kết phòng ban: Gà rán giòn rụm sốt mật ong, bánh mì kẹp mặn, pizza và bia mát lạnh.',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80',
    suggestedPerHeadBudgetVnd: 180000,
    defaultGuestCount: 25,
    menuRecipes: [INITIAL_RECIPES[2], INITIAL_RECIPES[3]],
    recommendedDrinks: ['Bia Heineken / Tiger Crystal (2 thùng)', 'Nước trái cây ép tươi (10 chai)', 'Trà sữa khoai môn'],
    equipmentChecklist: [
      { id: 'eq-1', text: 'Loa kéo Bluetooth & 2 Micro không dây', category: 'Thiết bị âm thanh', done: true },
      { id: 'eq-2', text: 'Bàn tiệc đứng bọc khăn phủ & Khay inox giữ nhiệt', category: 'Dụng cụ tiệc', done: true },
      { id: 'eq-3', text: 'Thùng đá ướp lạnh bia & Đĩa giấy dùng 1 lần', category: 'Dụng cụ tiệc', done: false },
      { id: 'eq-4', text: 'Đặt giao trước 16:30 chiều Thứ 6', category: 'Nhà cung cấp', done: false }
    ]
  },
  {
    id: 'corp-executive-lunch',
    title: '💼 Tiệc Trưa Chiêu Đãi Đối Tác & Ban Giám Đốc',
    categoryTag: 'Tiệc Chiêu Đãi Đối Tác & Lãnh Đạo',
    description: 'Thực đơn tiệc trưa sang trọng cho họp HĐQT & đón tiếp đối tác: Cá hồi nướng Sốt Ponzu, Bò Steak sốt tiêu đen, vang đỏ.',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    suggestedPerHeadBudgetVnd: 450000,
    defaultGuestCount: 12,
    menuRecipes: [INITIAL_RECIPES[3], INITIAL_RECIPES[0]],
    recommendedDrinks: ['Rượu Vang Đỏ Bordeaux (2 chai)', 'Nước khoáng Perrier thủy tinh (12 chai)', 'Cà phê Espresso'],
    equipmentChecklist: [
      { id: 'eq-5', text: 'Máy chiếu HDMI & Bút trình chiếu PowerPoint', category: 'Thiết bị âm thanh', done: true },
      { id: 'eq-6', text: 'Bộ dao nĩa inox & Ly thủy tinh uống vang', category: 'Dụng cụ tiệc', done: true },
      { id: 'eq-7', text: 'Khăn trải bàn trắng & Chậu hoa tươi để bàn', category: 'Dụng cụ tiệc', done: false },
      { id: 'eq-8', text: 'Thuê 1 nhân viên phục vụ tiệc cao cấp', category: 'Nhà cung cấp', done: false }
    ]
  },
  {
    id: 'corp-team-bbq',
    title: '🎉 Tiệc Dã Ngoại & Team Building BBQ',
    categoryTag: 'Tiệc Dã Ngoại & Team Building',
    description: 'Tiệc nướng BBQ ngoài trời bùng nổ năng lượng: Lẩu Thái tôm sú hải sản, thịt nướng sốt Hàn Quốc, salad tươi mát.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    suggestedPerHeadBudgetVnd: 280000,
    defaultGuestCount: 40,
    menuRecipes: [INITIAL_RECIPES[4], INITIAL_RECIPES[2], INITIAL_RECIPES[3]],
    recommendedDrinks: ['Bia Budweiser (3 thùng)', 'Nước khoáng & Nước ngọt Coca/Sprite (2 thùng)', 'Nước dừa tươi'],
    equipmentChecklist: [
      { id: 'eq-9', text: 'Bếp nướng Than hoa / Bếp ga dã ngoại (3 cái)', category: 'Dụng cụ tiệc', done: true },
      { id: 'eq-10', text: 'Bạt trải bãi cỏ & Ghế gấp du lịch', category: 'Dụng cụ tiệc', done: false },
      { id: 'eq-11', text: 'Túi rác tự hủy lớn & Kẹp gắp thịt nướng', category: 'Dụng cụ tiệc', done: true },
      { id: 'eq-12', text: 'Banner Team Building in logo công ty 3m x 1m', category: 'Thiết bị âm thanh', done: false }
    ]
  },
  {
    id: 'corp-birthday-party',
    title: '🎂 Tiệc Sinh Nhật Nhân Viên & Kỷ Niệm Phòng Ban',
    categoryTag: 'Sinh Nhật Nhân Viên & Kỷ Niệm',
    description: 'Tiệc mừng sinh nhật thành viên phòng ban: Bánh kem tươi, bánh mì sandwich nhỏ, trà hoa quả và tháp bánh ngọt.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    suggestedPerHeadBudgetVnd: 150000,
    defaultGuestCount: 20,
    menuRecipes: [INITIAL_RECIPES[3], INITIAL_RECIPES[5]],
    recommendedDrinks: ['Trà Đào Cam Sả', 'Nước ép Trái cây tổng hợp', 'Champagne Sparkling Wine (1 chai)'],
    equipmentChecklist: [
      { id: 'eq-13', text: 'Bánh sinh nhật 30cm in tên nhân viên', category: 'Nhà cung cấp', done: false },
      { id: 'eq-14', text: 'Nến sinh nhật, Pháo hoa giấy & Nón tiệc', category: 'Dụng cụ tiệc', done: true },
      { id: 'eq-15', text: 'Bộ đĩa thìa cắt bánh kem & Đèn led trang trí', category: 'Dụng cụ tiệc', done: true }
    ]
  }
];
