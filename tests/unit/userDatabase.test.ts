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
  normalizeIdentifier,
  verifyUserPassword,
  hashUserPassword,
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

describe('Unit: User Database - Phone & Email Normalization and Credential Security', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  it('normalizes Vietnamese phone numbers across all formats to 0-prefix 10-digit format', () => {
    // International format (+84)
    expect(normalizeIdentifier('+84966592831')).toBe('0966592831');
    // International format with spaces
    expect(normalizeIdentifier('+84 966 592 831')).toBe('0966592831');
    // Local format with spaces
    expect(normalizeIdentifier('0966 592 831')).toBe('0966592831');
    // Local format with dots
    expect(normalizeIdentifier('0966.592.831')).toBe('0966592831');
    // Local format with hyphens
    expect(normalizeIdentifier('0966-592-831')).toBe('0966592831');
    // International format with leading 0 after +84
    expect(normalizeIdentifier('+840966592831')).toBe('0966592831');
  });

  it('normalizes and lowercases email addresses while stripping surrounding whitespace', () => {
    expect(normalizeIdentifier('User@MealWise.vn')).toBe('user@mealwise.vn');
    expect(normalizeIdentifier('   User@MealWise.vn   ')).toBe('user@mealwise.vn');
    expect(normalizeIdentifier('TEST.ACCOUNT@GMAIL.COM')).toBe('test.account@gmail.com');
  });

  it('cross-format user lookup finds exact registered user between +84 and 0-prefix', () => {
    // Register with +84 international phone format
    const { user: registered } = registerUserInDatabase({
      name: 'Nguyễn Văn Đạt',
      email: '+84966592831',
      password: 'Password123'
    });

    expect(registered.email).toBe('0966592831');

    // Look up with 0-prefix format
    const foundWithZero = getRegisteredUserByEmail('0966592831');
    expect(foundWithZero).toBeTruthy();
    expect(foundWithZero?.id).toBe(registered.id);
    expect(foundWithZero?.name).toBe('Nguyễn Văn Đạt');
    expect(foundWithZero?.email).toBe('0966592831');

    // Look up with spaced format
    const foundWithSpaces = getRegisteredUserByEmail('0966 592 831');
    expect(foundWithSpaces).toBeTruthy();
    expect(foundWithSpaces?.id).toBe(registered.id);

    // Look up with dotted format
    const foundWithDots = getRegisteredUserByEmail('0966.592.831');
    expect(foundWithDots).toBeTruthy();
    expect(foundWithDots?.id).toBe(registered.id);

    // Look up with +84 format
    const foundWithPlus84 = getRegisteredUserByEmail('+84966592831');
    expect(foundWithPlus84).toBeTruthy();
    expect(foundWithPlus84?.id).toBe(registered.id);
  });

  it('verifyUserPassword returns { valid: false, user: null } for non-existent users', () => {
    // Non-existent email
    const resEmail = verifyUserPassword('nonexistent.user@mealwise.vn', 'AnyPassword123');
    expect(resEmail.valid).toBe(false);
    expect(resEmail.user).toBeNull();

    // Non-existent phone number
    const resPhone = verifyUserPassword('0988777666', 'AnyPassword123');
    expect(resPhone.valid).toBe(false);
    expect(resPhone.user).toBeNull();
  });

  it('verifyUserPassword returns { valid: false, user: existing } for empty or undefined password when passwordHash exists', () => {
    const { user } = registerUserInDatabase({
      name: 'Lê Hoàng Nam',
      email: '0966592831',
      password: 'MySecretPassword123'
    });
    expect(user.passwordHash).toBeTruthy();

    // Empty string password
    const resEmpty = verifyUserPassword('0966592831', '');
    expect(resEmpty.valid).toBe(false);
    expect(resEmpty.user).toBeTruthy();
    expect(resEmpty.user?.id).toBe(user.id);

    // Whitespace-only password
    const resSpaces = verifyUserPassword('0966592831', '   ');
    expect(resSpaces.valid).toBe(false);
    expect(resSpaces.user).toBeTruthy();
    expect(resSpaces.user?.id).toBe(user.id);

    // Undefined password
    const resUndefined = verifyUserPassword('0966592831', undefined);
    expect(resUndefined.valid).toBe(false);
    expect(resUndefined.user).toBeTruthy();
    expect(resUndefined.user?.id).toBe(user.id);

    // Wrong password
    const resWrong = verifyUserPassword('0966592831', 'WrongPassword');
    expect(resWrong.valid).toBe(false);
    expect(resWrong.user).toBeTruthy();
    expect(resWrong.user?.id).toBe(user.id);

    // Correct password
    const resCorrect = verifyUserPassword('0966592831', 'MySecretPassword123');
    expect(resCorrect.valid).toBe(true);
    expect(resCorrect.user).toBeTruthy();
    expect(resCorrect.user?.id).toBe(user.id);
  });

  it('preserves existing display name when calling registerUserInDatabase on login with phone or email prefix', () => {
    // 1. Initial registration with custom Vietnamese full name
    const { user: initialUser } = registerUserInDatabase({
      name: 'Trần Thị Thu Trang',
      email: '0966592831',
      password: 'Password123'
    });
    expect(initialUser.name).toBe('Trần Thị Thu Trang');

    // 2. Returning login with phone number as name
    const { user: loginWithPhoneName } = registerUserInDatabase({
      name: '0966592831',
      email: '0966592831'
    });
    expect(loginWithPhoneName.name).toBe('Trần Thị Thu Trang');

    // 3. Returning login with +84 format as name
    const { user: loginWithPlus84Name } = registerUserInDatabase({
      name: '+84966592831',
      email: '+84966592831'
    });
    expect(loginWithPlus84Name.name).toBe('Trần Thị Thu Trang');

    // 4. Returning login with empty name or generic placeholder
    const { user: loginWithEmptyName } = registerUserInDatabase({
      name: '',
      email: '0966592831'
    });
    expect(loginWithEmptyName.name).toBe('Trần Thị Thu Trang');

    const { user: loginWithPlaceholder } = registerUserInDatabase({
      name: 'Thành Viên Mealy',
      email: '0966592831'
    });
    expect(loginWithPlaceholder.name).toBe('Trần Thị Thu Trang');

    // 5. Preserves display name for email accounts when passing email prefix as name on login
    const { user: emailUser } = registerUserInDatabase({
      name: 'Phạm Minh Khôi',
      email: 'khoi.pham@mealwise.vn',
      password: 'Password123'
    });
    expect(emailUser.name).toBe('Phạm Minh Khôi');

    const { user: emailLoginPrefix } = registerUserInDatabase({
      name: 'khoi.pham',
      email: 'khoi.pham@mealwise.vn'
    });
    expect(emailLoginPrefix.name).toBe('Phạm Minh Khôi');
  });

});

