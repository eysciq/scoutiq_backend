import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * ⚽ ScoutIQ Veritabanı Yapılandırması
 * Bu dosya Prisma'nın 'schema.prisma' dosyasını ve 
 * .env içindeki 'DATABASE_URL' bağlantısını yönetir.
 */
export default defineConfig({
  // Prisma şemanın tam yerini gösteriyoruz
  schema: "prisma/schema.prisma",

  // Veritabanı değişikliklerinin (migrations) kaydedileceği klasör
  migrations: {
    path: "prisma/migrations",
  },

  // 🛡️ Bağlantı Hattı: .env dosyasındaki DATABASE_URL'i kullanır
  datasource: {
    url: process.env.DATABASE_URL || "file:./dev.db", // .env okunmazsa yerel SQLite'a düşer (güvenlik önlemi)
  },
});