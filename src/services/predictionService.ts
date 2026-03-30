// src/services/predictionService.ts
import prisma from '../config/db'; // Prisma bağlantın neredeyse oradan import et (örn: '../config/db')

export class PredictionService {
  
  /**
   * 🥇 KURAL 1: KAŞİF ROZETİ VE KISITLAMA
   * Bir oyuncuyu sistemde İLK 3 KEŞFEDEN kişi "Kaşif Rozeti" alır.
   * 4. kişi ve sonrası rozet alamaz, sadece standart puan kazanır.
   */
  static async createPrediction(userId: string, playerId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Bu oyuncu için daha önce kaç tahmin yapılmış?
      const existingPredictions = await tx.prediction.count({
        where: { playerId: playerId }
      });

      // 2. İlk 3 kişi içinde mi? (Sıfırdan başladığı için 0, 1, 2)
      const isEarlyBird = existingPredictions < 3;

      // 3. Tahmini kaydet (Başlangıçta isVisible: false yani profilinde gizli)
      const newPrediction = await tx.prediction.create({
        data: {
          userId: userId,
          playerId: playerId,
          hasScoutBadge: isEarlyBird,
          isVisible: false 
        }
      });

      return {
        success: true,
        prediction: newPrediction,
        message: isEarlyBird 
          ? "Tebrikler! Bu oyuncuyu ilk keşfedenlerden biri oldun ve Kaşif Rozeti kazandın!" 
          : "Tahmin kaydedildi. Rozet sınırı dolduğu için standart çarpan uygulanacak."
      };
    });
  }

  /**
   * ⏳ KURAL 2: ZAMAN ÇARPANI (TIME-DECAY) VE PUANLAMA
   * Reyting * Zaman Çarpanı * Rozet Bonusu
   */
  static calculatePoints(rating: number, predictedAt: Date, hasBadge: boolean): number {
    const today = new Date();
    // Tahmin tarihinden bugüne kaç gün geçmiş?
    const diffTime = Math.abs(today.getTime() - predictedAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    // Zaman Çarpanı: ln(gün + 1) / 5 formülü ile logaritmik artış. 
    // Erken keşfedenin çarpanı yavaş yavaş ve adil bir şekilde artar.
    const timeDecayMultiplier = 1 + (Math.log(diffDays + 1) / 5);
    
    // Rozet Bonusu: Rozeti varsa %20 ekstra puan (1.2), yoksa normal (1.0)
    const badgeBonus = hasBadge ? 1.2 : 1.0;

    // Nihai Puan Hesabı
    const finalScore = rating * timeDecayMultiplier * badgeBonus;
    
    return parseFloat(finalScore.toFixed(2)); // Virgülden sonra 2 hane
  }

  /**
   * 🏆 KURAL 3: LİDERLİK TABLOSU EŞİTLİK BOZMA (TIE-BREAKER)
   * Eğer iki kişinin puanı aynıysa, kim şampiyon olacak?
   */
  static async getMonthlyLeaderboard() {
    return await prisma.user.findMany({
      take: 100, // İlk 100 kişiyi getir
      orderBy: [
        { totalScoutScore: 'desc' },       // Kriter 1: Toplam Puanı en yüksek olan
        { successfulPredictions: 'desc' }, // Kriter 2: En çok başarılı tahmin yapan
        { createdAt: 'asc' }               // Kriter 3: En eski üye olan (Sadakat)
      ],
      select: {
        id: true,
        name: true,
        totalScoutScore: true,
        successfulPredictions: true,
        createdAt: true
      }
    });
  }
}