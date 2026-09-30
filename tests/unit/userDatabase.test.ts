import { describe, it, expect, beforeEach } from '../helpers/testRunner';
import {
  getOrCreateGuestSession,
  updateGuestSession,
  loadGuestPartition,
  saveGuestPartition,
  hasCustomGuestData,
  getAllRegisteredUsers,
  getRegisteredUserByEmail,
  registerUserInDatabase,
  loadUserPartition,
  saveUserPartition,
  migrateGuestDataToUser,
  getUserDatabaseStats,
  USERS_DB_KEY,
  GUEST_SESSION_KEY,
  GUEST_PARTITION_KEY,
  USER_PARTITION_PREFIX
} from '../../src/services/userDatabase';
import { DailyMealPlan, PantryItem } from '../../src/types';

describe('Unit: User Database - Dual-Track Guest and Registered Users', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  it('generates a stable persistent guest session for non-registered users', () => {
    const session1 = getOrCreateGuestSession();
    expect(session1.guestId.startsWith('guest_')).toBe(true);
    expect(session1.planModified).toBe(false);
    expect(session1.fridgeItemCount).toBe(0);

    // Repeated calls return the same session ID
    const session2 = getOrCreateGuestSession();
    expect(session2.guestId).toBe(session1.guestId);
  });

  it('tracks guest trial meal plans and detects custom guest data', () => {
    expect(hasCustomGuestData()).toBe(false);

    const mockPlan: DailyMealPlan[] = [
      {
        dayId: 'mon',
        dayName: 'Thứ Hai',
        meals: {
          breakfast: {
            id: 'dish-1',
            title: 'Phở Bò',
            description: '',
            category: 'an-sang',
            region: 'bac',
            prepTimeMinutes: 10,
            cookTimeMinutes: 15,
            servings: 4,
            calories: 450,
            estimatedCostVnd: 50000,
            imageUrl: '',
            ingredients: [],
            instructions: [],
            tags: []
          },
          lunch: null,
          dinner: null
        }
      }
    ];

    saveGuestPartition({ weeklyPlan: mockPlan });
    expect(hasCustomGuestData()).toBe(true);

    const loaded = loadGuestPartition();
    expect(loaded).toBeTruthy();
    expect(loaded?.weeklyPlan?.length).toBe(1);
    expect(loaded?.weeklyPlan?.[0]?.meals?.breakfast?.title).toBe('Phở Bò');
  });

  it('tracks guest trial fridge inventory', () => {
    const mockPantry: PantryItem[] = [
      {
        id: 'p-1',
        name: 'Thịt ba chỉ thừa',
        category: 'Đồ ăn thừa',
        quantity: '300 g',
        daysLeft: 2,
        status: 'warning',
        isLeftover: true,
        addedAt: '30/09/2026'
      }
    ];

    saveGuestPartition({ pantryItems: mockPantry });
    expect(hasCustomGuestData()).toBe(true);

    const loaded = loadGuestPartition();
    expect(loaded?.pantryItems?.length).toBe(1);
    expect(loaded?.pantryItems?.[0]?.name).toBe('Thịt ba chỉ thừa');
  });

  it('registers a new user and assigns unique user ID', () => {
    const { user, migrated } = registerUserInDatabase({
      name: 'Nguyễn Văn A',
      email: 'vana.nguyen@gmail.com'
    });

    expect(user.id?.startsWith('usr_')).toBe(true);
    expect(user.name).toBe('Nguyễn Văn A');
    expect(user.email).toBe('vana.nguyen@gmail.com');
    expect(user.isRegistered).toBe(true);
    expect(user.role).toBe('user');
    expect(migrated).toBe(false);

    const allUsers = getAllRegisteredUsers();
    expect(allUsers.some(u => u.email === 'vana.nguyen@gmail.com')).toBe(true);
  });

  it('seamlessly retains and migrates guest trial meal plan when registering (3-day trial scenario)', () => {
    // 1. Guest explores app for 3 days and customizes their weekly plan and fridge
    const trialPlan: DailyMealPlan[] = [
      {
        dayId: 'mon',
        dayName: 'Thứ Hai',
        meals: {
          breakfast: null,
          lunch: {
            id: 'dish-thit-kho',
            title: 'Thịt Kho Tàu Trứng',
            description: '',
            category: 'mon-man',
            region: 'nam',
            prepTimeMinutes: 15,
            cookTimeMinutes: 45,
            servings: 4,
            calories: 520,
            estimatedCostVnd: 75000,
            imageUrl: '',
            ingredients: [],
            instructions: [],
            tags: []
          },
          dinner: null
        }
      }
    ];
    const trialPantry: PantryItem[] = [
      {
        id: 'pantry-egg',
        name: 'Trứng gà ta',
        category: 'Trứng & Đậu',
        quantity: '4 quả',
        daysLeft: 4,
        status: 'fresh',
        addedAt: '27/09/2026'
      }
    ];

    saveGuestPartition({
      weeklyPlan: trialPlan,
      pantryItems: trialPantry
    });

    expect(hasCustomGuestData()).toBe(true);

    // 2. 3 days later, guest decides to register
    const { user, migrated } = registerUserInDatabase(
      {
        name: 'Trần Thị Bích',
        email: 'bich.tran@mealwise.vn'
      },
      {
        migrateGuestData: true
      }
    );

    expect(migrated).toBe(true);
    expect(user.id).toBeTruthy();

    // 3. User's isolated partition in database contains the migrated trial plan and fridge!
    const userPartition = loadUserPartition(user.id!);
    expect(userPartition).toBeTruthy();
    expect(userPartition?.weeklyPlan?.length).toBe(1);
    expect(userPartition?.weeklyPlan?.[0]?.meals?.lunch?.title).toBe('Thịt Kho Tàu Trứng');
    expect(userPartition?.pantryItems?.[0]?.name).toBe('Trứng gà ta');
  });

  it('guarantees complete data isolation between User A and User B', () => {
    const { user: userA } = registerUserInDatabase({
      name: 'User A',
      email: 'usera@mealwise.vn'
    });
    const { user: userB } = registerUserInDatabase({
      name: 'User B',
      email: 'userb@mealwise.vn'
    });

    expect(userA.id).not.toBe(userB.id);

    // Save different meal plans for User A and User B
    const planA: DailyMealPlan[] = [
      {
        dayId: 'mon',
        dayName: 'Thứ Hai',
        meals: {
          breakfast: {
            id: 'dish-a',
            title: 'Món của User A',
            description: '',
            category: 'mon-man',
            region: 'bac',
            prepTimeMinutes: 10,
            cookTimeMinutes: 20,
            servings: 4,
            calories: 400,
            estimatedCostVnd: 50000,
            imageUrl: '',
            ingredients: [],
            instructions: [],
            tags: []
          },
          lunch: null,
          dinner: null
        }
      }
    ];

    const planB: DailyMealPlan[] = [
      {
        dayId: 'mon',
        dayName: 'Thứ Hai',
        meals: {
          breakfast: {
            id: 'dish-b',
            title: 'Món của User B',
            description: '',
            category: 'mon-man',
            region: 'nam',
            prepTimeMinutes: 15,
            cookTimeMinutes: 25,
            servings: 4,
            calories: 450,
            estimatedCostVnd: 60000,
            imageUrl: '',
            ingredients: [],
            instructions: [],
            tags: []
          },
          lunch: null,
          dinner: null
        }
      }
    ];

    saveUserPartition(userA.id!, { weeklyPlan: planA });
    saveUserPartition(userB.id!, { weeklyPlan: planB });

    // Verify isolation
    const loadedA = loadUserPartition(userA.id!);
    const loadedB = loadUserPartition(userB.id!);

    expect(loadedA?.weeklyPlan?.[0]?.meals?.breakfast?.title).toBe('Món của User A');
    expect(loadedB?.weeklyPlan?.[0]?.meals?.breakfast?.title).toBe('Món của User B');
  });

  it('provides aggregated statistics for Admin Dashboard observability', () => {
    // 1 guest + default bootstrap users
    getOrCreateGuestSession();
    updateGuestSession({ planModified: true });

    const stats = getUserDatabaseStats();
    expect(stats.totalRegistered).toBeGreaterThan(0);
    expect(stats.totalGuests).toBe(1);
    expect(stats.guestsWithCustomPlan).toBe(1);
    expect(stats.conversionRatePercent).toBeGreaterThan(0);
  });

  it('exempts administrator accounts and automatically marks onboarding completed', () => {
    const { user: adminUser } = registerUserInDatabase({
      name: 'Admin',
      email: 'admin@mealwise.vn'
    });

    expect(adminUser.role).toBe('admin');
    expect(adminUser.onboardingCompleted).toBe(true);
  });

});
