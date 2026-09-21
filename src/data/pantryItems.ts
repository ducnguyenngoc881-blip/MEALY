import { PantryItem } from '../types';

export const INITIAL_PANTRY_ITEMS: PantryItem[] = [
  { id: 'p-1', name: 'Trứng gà ta', category: 'Trứng & Đậu', quantity: '6 quả', daysLeft: 2, status: 'warning', discountOpportunityVnd: 18000, notes: 'Ngăn mát cánh tủ' },
  { id: 'p-2', name: 'Thịt ba chỉ luộc thừa', category: 'Đồ ăn thừa', quantity: '350 g', daysLeft: 1, status: 'warning', discountOpportunityVnd: 45000, isLeftover: true, notes: 'Hộp thủy tinh ngăn mát, nên rang cháy cạnh hoặc nấu canh' },
  { id: 'p-3', name: 'Cơm nguội bữa tối qua', category: 'Đồ ăn thừa', quantity: '1 tô to', daysLeft: 1, status: 'warning', discountOpportunityVnd: 10000, isLeftover: true, notes: 'Rất hợp chiên cơm dương châu hoặc cơm rang dưa bò' },
  { id: 'p-4', name: 'Cà chua chín mọng', category: 'Rau củ quả', quantity: '4 quả', daysLeft: 3, status: 'fresh', discountOpportunityVnd: 15000, notes: 'Bọc giấy báo ngăn rau củ' },
  { id: 'p-5', name: 'Hành lá & Ngò rí', category: 'Rau củ quả', quantity: '1 bó nhỏ', daysLeft: 2, status: 'warning', discountOpportunityVnd: 5000, notes: 'Cắt rễ cắm nước hoặc bọc giấy ăn' },
  { id: 'p-6', name: 'Sữa tươi Vinamilk', category: 'Đồ uống', quantity: '500 ml', daysLeft: 5, status: 'fresh', notes: 'Ngăn mát' }
];
