import { storage } from "./storage";
import bcrypt from "bcryptjs";

export async function seedTestUsers() {
  try {
    console.log("Seeding test users...");
    
    // Проверяем, существуют ли уже тестовые пользователи
    const existingAdmin = await storage.getUserByEmail("admin@test.kz");
    if (existingAdmin) {
      console.log("Test users already exist, skipping seed");
      // Still seed basic data if it doesn't exist
      await seedBasicData();
      return;
    }
    
    // Создаем тестового пользователя
    await storage.createUser({
      email: "user@test.kz",
      password: await bcrypt.hash("123456", 12),
      firstName: "Тест",
      lastName: "Пользователь",
      role: "user",
      authProvider: "local",
      isVerified: true
    });
    
    // Создаем тестового поставщика
    await storage.createUser({
      email: "supplier@test.kz", 
      password: await bcrypt.hash("123456", 12),
      firstName: "Тест",
      lastName: "Поставщик",
      role: "supplier",
      authProvider: "local",
      isVerified: true
    });
    
    // Создаем тестового администратора
    await storage.createUser({
      email: "admin@test.kz",
      password: await bcrypt.hash("admin123", 12),
      firstName: "Админ",
      lastName: "Система",
      role: "admin",
      authProvider: "local",
      isVerified: true
    });
    
    console.log("✓ Test users created successfully");
    
    // Seed basic sections and content
    await seedBasicData();
    
  } catch (error) {
    console.error("Error seeding test users:", error);
  }
}

async function seedBasicData() {
  try {
    // Check if sections already exist
    const existingSections = await storage.getSections();
    if (existingSections.length > 0) {
      console.log("Basic data already exists");
      return;
    }
    
    console.log("Seeding basic sections...");
    
    // Create basic sections
    const normDocSection = await storage.createSection({
      title: "Нормативные документы",
      slug: "normative-documents", 
      description: "Нормативно-правовые акты по пожарной безопасности",
      icon: "fas fa-file-text",
      sortOrder: 1,
      isActive: true
    });
    
    const educSection = await storage.createSection({
      title: "Образовательные материалы",
      slug: "educational-materials",
      description: "Обучающие материалы и курсы",
      icon: "fas fa-book",
      sortOrder: 2,
      isActive: true
    });
    
    const newsSection = await storage.createSection({
      title: "Новости",
      slug: "news",
      description: "Новости пожарной безопасности",
      icon: "fas fa-newspaper",
      sortOrder: 3,
      isActive: true
    });
    
    console.log("✓ Basic sections created successfully");
    
    // Seed marketplace categories
    await seedMarketplaceCategories();
    
  } catch (error) {
    console.error("Error seeding basic data:", error);
  }
}

async function seedMarketplaceCategories() {
  try {
    // Check if categories already exist
    const existingCategories = await storage.getAdCategories();
    if (existingCategories.length > 0) {
      console.log("Marketplace categories already exist");
      return;
    }
    
    console.log("Seeding marketplace categories...");
    
    // Create marketplace categories
    await storage.createAdCategory({
      title: "Проектирование систем пожарной безопасности",
      slug: "fire-system-design",
      description: "Разработка проектов автоматических систем пожаротушения, пожарной сигнализации и других систем ПБ",
      icon: "fas fa-drafting-compass",
      order: 1,
      isActive: true
    });
    
    await storage.createAdCategory({
      title: "Монтаж и наладка оборудования",
      slug: "equipment-installation",
      description: "Установка и настройка противопожарного оборудования",
      icon: "fas fa-tools",
      order: 2,
      isActive: true
    });
    
    await storage.createAdCategory({
      title: "Техническое обслуживание",
      slug: "technical-maintenance",
      description: "Регулярное обслуживание систем пожарной безопасности",
      icon: "fas fa-cogs",
      order: 3,
      isActive: true
    });
    
    await storage.createAdCategory({
      title: "Экспертиза и консультации",
      slug: "expertise-consulting",
      description: "Экспертные заключения и консультации по вопросам пожарной безопасности",
      icon: "fas fa-user-tie",
      order: 4,
      isActive: true
    });
    
    await storage.createAdCategory({
      title: "Поставка оборудования",
      slug: "equipment-supply",
      description: "Поставка противопожарного оборудования и материалов",
      icon: "fas fa-truck",
      order: 5,
      isActive: true
    });
    
    await storage.createAdCategory({
      title: "Обучение персонала",
      slug: "staff-training",
      description: "Обучение и повышение квалификации по пожарной безопасности",
      icon: "fas fa-chalkboard-teacher",
      order: 6,
      isActive: true
    });
    
    console.log("✓ Marketplace categories created successfully");
    
  } catch (error) {
    console.error("Error seeding marketplace categories:", error);
  }
}