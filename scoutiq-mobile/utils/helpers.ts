/**
 * ⚽ ScoutIQ Yardımcı Fonksiyonlar (Helpers)
 * Bu dosya, projenin her yerinde kullanabileceğin ortak araçları içerir.
 */

/**
 * 🧹 İsim Temizleyici: Türkçe karakterleri ve boşlukları temizler.
 * Özellikle email oluştururken veya ID üretirken kullanılır.
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD')                   // Aksanları ayırır (ü -> u + ¨)
    .replace(/[\u0300-\u036f]/g, '')     // Aksan işaretlerini siler
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')                // Boşlukları tire yapar
    .replace(/[^\w-]+/g, '')             // Alfanumerik olmayanları siler
    .replace(/--+/g, '-');               // Çift tireleri teke indirir
};

/**
 * 📅 Tarih Formatlayıcı: Veritabanından gelen karmaşık tarihi "GG.AA.YYYY" yapar.
 */
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * ⭐️ Rating Renklendirici: Reytinge göre uygun renk kodunu döndürür.
 * (Frontend'de oyuncu kartlarında kullanabilirsin)
 */
export const getRatingColor = (rating: number): string => {
  if (rating >= 85) return '#4CAF50'; // Yeşil (Yıldız)
  if (rating >= 70) return '#FF9800'; // Turuncu (Potansiyelli)
  return '#F44336';                   // Kırmızı (Gelişmeli)
};

/**
 * 🔢 Sayı Doğrulayıcı: Gelen verinin sayı olduğundan emin olur, değilse 0 döner.
 * "Kaydedilemedi" hatalarını önlemek için birebirdir.
 */
export const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

/**
 * 📧 Maskelenmiş Email: "e****m@gmail.com" formatına sokar.
 * (Gizlilik için profillerde kullanılabilir)
 */
export const maskEmail = (email: string): string => {
  const [user, domain] = email.split('@');
  return `${user[0]}****${user[user.length - 1]}@${domain}`;
};