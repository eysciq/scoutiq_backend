import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Dünya Yıldızları stadyuma iniyor...');

  const stars = [
    { name: 'Lionel Messi', position: 'Sağ Kanat', rating: '93', age: 36, height: 170, weight: 72, foot: 'Sol' },
    { name: 'Cristiano Ronaldo', position: 'Santrfor', rating: '90', age: 39, height: 187, weight: 83, foot: 'Sağ' },
    { name: 'Arda Güler', position: 'On Numara', rating: '77', age: 19, height: 175, weight: 68, foot: 'Sol' },
    { name: 'Kylian Mbappé', position: 'Santrfor', rating: '91', age: 25, height: 178, weight: 73, foot: 'Sağ' },
    { name: 'Jude Bellingham', position: 'Merkez Orta Saha', rating: '87', age: 20, height: 186, weight: 75, foot: 'Sağ' },
    { name: 'Kenan Yıldız', position: 'İkinci Forvet', rating: '74', age: 18, height: 185, weight: 80, foot: 'Sağ' },
    { name: 'Semih Kılıçsoy', position: 'Santrfor', rating: '72', age: 18, height: 178, weight: 75, foot: 'Her İkisi' }
  ];

  for (const player of stars) {
    // Email oluştururken Türkçe karakterleri ve boşlukları temizleyelim (Daha güvenli)
    const safeName = player.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Aksanları temizle
      .replace(/\s+/g, '')
      .toLowerCase();
    
    const email = `star_${safeName}@scoutiq.com`;

    await prisma.user.upsert({
      where: { email: email },
      update: {}, // Eğer varsa dokunma
      create: {
        email: email,
        name: player.name, // Şemadaki name alanını da dolduralım
        // 🔥 ÖNEMLİ: Controller ile aynı formatı koruyoruz
        password: `${player.name}|${player.position}|${player.rating}`, 
        age: player.age,
        height: player.height,
        weight: player.weight,
        foot: player.foot,
        isGlobal: true,    // 🌍 Keşfet (Radar) kısmında gözükür
        isVerified: true,  // ✅ Onaylı veri
        discoveredBy: 'Sistem',
        scoutScore: 0,
        reportsCount: 0
      },
    });
    console.log(`✅ Transfer Tamamlandı: ${player.name}`);
  }

  console.log('🏆 Tüm yıldızlar başarıyla veritabanına işlendi!');
}

main()
  .catch((e) => {
    console.error("❌ Hata oluştu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });