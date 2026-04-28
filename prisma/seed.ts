// Dosya Yolu: prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n\x1b[33m⏳ ScoutIQ: Yıldızlar Sahaya İniyor...\x1b[0m');

  const systemEmail = "system@scoutiq.com";

  // 1. Sistem Kullanıcısını "Master Scout" Olarak Oluşturalım
  // Bu kullanıcıyı sistemdeki verileri test etmek için kullanacağız.
  await prisma.user.upsert({
    where: { email: systemEmail },
    update: {},
    create: {
      email: systemEmail,
      name: "ScoutIQ Master",
      password: "system_secure_password_2026",
      scoutLevel: 99,
      totalXP: 9999,
      totalScoutScore: 1000,
      weeklyPredictionsLeft: 0,
      successfulPredictions: 50
    }
  });

  // 2. Yıldız Oyuncu Listesi (externalId ve value alanları eklenmiş hali)
  const stars = [
    { externalId: 1001, name: 'Lionel Messi', position: 'Sağ Kanat', rating: 93, age: 36, foot: 'Sol', value: 30000000 },
    { externalId: 1002, name: 'Cristiano Ronaldo', position: 'Santrfor', rating: 90, age: 39, foot: 'Sağ', value: 15000000 },
    { externalId: 1003, name: 'Arda Güler', position: 'On Numara', rating: 77, age: 19, foot: 'Sol', value: 45000000 },
    { externalId: 1004, name: 'Kylian Mbappé', position: 'Santrfor', rating: 91, age: 25, foot: 'Sağ', value: 180000000 },
    { externalId: 1005, name: 'Jude Bellingham', position: 'MO', rating: 87, age: 20, foot: 'Sağ', value: 150000000 },
    { externalId: 1006, name: 'Kenan Yıldız', position: 'Sol Kanat', rating: 74, age: 18, foot: 'Sağ', value: 30000000 },
    { externalId: 1007, name: 'Semih Kılıçsoy', position: 'Santrfor', rating: 72, age: 18, foot: 'Her İkisi', value: 12000000 }
  ];

  // 3. Yıldızları Veritabanına Tek Tek İşleyelim
  for (const p of stars) {
    await prisma.player.upsert({
      where: { externalId: p.externalId },
      update: {
        currentMarketValue: p.value // Eğer zaten varsa piyasa değerini güncelle
      },
      create: {
        externalId: p.externalId,
        name: p.name,
        position: p.position,
        rating: p.rating,
        age: p.age,
        foot: p.foot,
        currentMarketValue: p.value,
        country: "Global",
        league: "Efsaneler",
        team: "Dünya Karması",
        isGlobal: true
      }
    });
    // Log kısmındaki Türkçe karakter sorunu düzeltildi
    console.log(`\x1b[32m✅ Transfer Tamamlandı: ${p.name} (${(p.value / 1000000).toFixed(1)}M €)\x1b[0m`);
  }

  console.log('\n\x1b[32m\x1b[1m🏆 SCOUTIQ VERİTABANI HAZIR! SIRA KEŞİFLERDE.\x1b[0m\n');
}

// Hata yönetimi ve bağlantı kapatma
main()
  .catch((e) => {
    console.error("\x1b[31m❌ Seed Hatası:\x1b[0m", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });