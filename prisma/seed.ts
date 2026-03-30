import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n\x1b[33m⏳ ScoutIQ: Yıldızlar Sahaya İniyor...\x1b[0m');

  const systemEmail = "system@scoutiq.com";

  // 1. Önce Sistem Kullanıcısını (Scout) Garantiye Alalım
  await prisma.user.upsert({
    where: { email: systemEmail },
    update: {},
    create: {
      email: systemEmail,
      name: "ScoutIQ System",
      password: "system_secure_password_2026",
      scoutScore: 999,
      reportsCount: 7
    }
  });

  const stars = [
    { name: 'Lionel Messi', position: 'Sağ Kanat', rating: 93, age: 36, foot: 'Sol' },
    { name: 'Cristiano Ronaldo', position: 'Santrfor', rating: 90, age: 39, foot: 'Sağ' },
    { name: 'Arda Güler', position: 'On Numara', rating: 77, age: 19, foot: 'Sol' },
    { name: 'Kylian Mbappé', position: 'Santrfor', rating: 91, age: 25, foot: 'Sağ' },
    { name: 'Jude Bellingham', position: 'MO', rating: 87, age: 20, foot: 'Sağ' },
    { name: 'Kenan Yıldız', position: 'Sol Kanat', rating: 74, age: 18, foot: 'Sağ' },
    { name: 'Semih Kılıçsoy', position: 'Santrfor', rating: 72, age: 18, foot: 'Her İkisi' }
  ];

  // 2. Yıldızları PLAYER Tablosuna Ekleyelim
  for (const p of stars) {
    await prisma.player.create({
      data: {
        name: p.name,
        position: p.position,
        rating: p.rating,
        age: p.age,
        foot: p.foot,
        country: "Global",
        league: "Efsaneler",
        team: "Dünya Karması",
        isGlobal: true,
        scoutEmail: systemEmail // Şemandaki ilişkiyi bağladık
      }
    });
    console.log(`\x1b[32m✅ Transfer Tamamlandı: ${p.name}\x1b[0m`);
  }

  console.log('\n\x1b[32m\x1b[1m🏆 TÜM YILDIZLAR VERİTABANINA İŞLENDİ!\x1b[0m\n');
}

main()
  .catch((e) => {
    console.error("\x1b[31m❌ Seed Hatası:\x1b[0m", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });