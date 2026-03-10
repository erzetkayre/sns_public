// src/mock/mock-analysis.ts
import type { AnalysisResult, AiPost } from "@/components/instagram/shared/types"

// Helper untuk buat AiPost dengan cepat
const a = (
  postId: string,
  postType: string,
  postedAt: string,
  hookScore: number,
  productionQuality: number,
  engagementPotential: number,
  overallScore: number,
  recommendation: string,
  viralityPotential: number,
  recs: { r: string; reason: string }[],
): AiPost => ({
  postId, postType, postedAt,
  hookScore, productionQuality, engagementPotential, overallScore,
  analyzedAt: postedAt.replace("T09", "T13").replace("T14", "T18").replace("T15", "T19"),
  resultJson: {
    overallAssessment: {
      overallScore,
      contentQuality:      productionQuality,
      engagementPotential,
      viralityPotential,
      audienceResonance:   parseFloat(((hookScore + overallScore) / 2).toFixed(1)),
      brandAlignment:      parseFloat(((productionQuality + overallScore) / 2).toFixed(1)),
      analysis:            recommendation,
    },
    top3ActionableRecommendations: recs.map((r, i) => ({
      priority:       i + 1,
      recommendation: r.r,
      reasoning:      r.reason,
    })),
  },
})

export const ANALYSIS_MAIN: AnalysisResult = {
  account: { id: "acc_main_001", totalAnalyzed: 15 },
  aggregateScores: {
    averageHookScore:           7.66,
    averageProductionQuality:   8.07,
    averageEngagementPotential: 7.75,
    averageOverallScore:        7.84,
  },
  analyses: [
    a("post_main_001", "IMAGE",   "2025-07-07T09:00:00.000Z", 7.8, 8.2, 8.5, 8.2, "Posting jam 09:00 sangat optimal, pertahankan konsistensi ini.", 7.5,
      [{ r: "Tambahkan CTA yang lebih eksplisit", reason: "Meningkatkan konversi dari engagement menjadi penjualan" },
       { r: "Gunakan hashtag lebih spesifik", reason: "Menjangkau audiens yang lebih tertarget" },
       { r: "Post konsisten di jam 09:00", reason: "Algoritma Instagram menyukai konsistensi" }]),

    a("post_main_002", "VIDEO",   "2025-07-05T14:30:00.000Z", 8.9, 9.1, 9.2, 9.1, "Konten video BTS performa sangat baik, buat seri reguler.", 9.0,
      [{ r: "Buat seri BTS mingguan", reason: "Konten ini mendapat engagement 3x lebih tinggi dari rata-rata" },
       { r: "Tambahkan musik trending sebagai BGM", reason: "Meningkatkan discovery via Reels" },
       { r: "Akhiri dengan teaser konten berikutnya", reason: "Meningkatkan retention penonton" }]),

    a("post_main_003", "SIDECAR", "2025-07-03T11:00:00.000Z", 7.2, 7.8, 7.5, 7.5, "Carousel tips mendapat engagement tinggi, tambah CTA yang lebih kuat.", 6.8,
      [{ r: "Tambahkan slide terakhir sebagai CTA", reason: "Carousel tanpa CTA melewatkan peluang konversi" },
       { r: "Perkuat visual slide pertama", reason: "Thumbnail yang kuat meningkatkan swipe rate" },
       { r: "Numbering setiap tips", reason: "Membuat konten lebih mudah dikonsumsi" }]),

    a("post_main_004", "IMAGE",   "2025-07-01T08:00:00.000Z", 5.8, 6.5, 5.5, 5.9, "Post testimoni kurang hook, tambahkan angka spesifik di caption.", 4.5,
      [{ r: "Tambahkan angka konkret di caption", reason: "Spesifisitas meningkatkan kredibilitas dan klik" },
       { r: "Gunakan foto pelanggan nyata", reason: "UGC lebih authentic dari stock photo" },
       { r: "Tag akun pelanggan yang direview", reason: "Mendorong reshare dari pelanggan tersebut" }]),

    a("post_main_005", "VIDEO",   "2025-06-29T16:00:00.000Z", 9.5, 8.8, 9.8, 9.4, "Flash sale adalah konten terbaik, gunakan lebih sering dengan variasi.", 9.5,
      [{ r: "Jadwalkan flash sale rutin setiap bulan", reason: "Event berkala membangun antisipasi dan loyalitas" },
       { r: "Buat countdown timer di Stories", reason: "FOMO meningkatkan urgensi pembelian" },
       { r: "Variasikan jenis diskon (cashback, bundling)", reason: "Mencegah audiens bosan dengan format yang sama" }]),

    a("post_main_006", "IMAGE",   "2025-06-27T10:00:00.000Z", 6.4, 7.5, 6.8, 6.9, "Aesthetic post perlu caption lebih engaging, tambah pertanyaan.", 6.0,
      [{ r: "Akhiri caption dengan pertanyaan", reason: "Pertanyaan mendorong komentar dan meningkatkan reach" },
       { r: "Tambahkan product tag di foto", reason: "Memudahkan audiens untuk langsung membeli" },
       { r: "Konsistensikan color palette", reason: "Visual konsisten meningkatkan brand recognition" }]),

    a("post_main_007", "SIDECAR", "2025-06-25T09:30:00.000Z", 8.1, 8.6, 8.3, 8.3, "Carousel koleksi baru sangat efektif, pertahankan kualitas visual.", 8.2,
      [{ r: "Tambahkan harga atau info pre-order di slide", reason: "Mengurangi friction dalam customer journey" },
       { r: "Buat versi Reels dari konten ini", reason: "Repurposing konten meningkatkan efisiensi" },
       { r: "Gunakan lokasi Bali sebagai selling point", reason: "Lokasi eksotis meningkatkan aspirational value" }]),

    a("post_main_008", "VIDEO",   "2025-06-23T13:00:00.000Z", 8.7, 8.9, 8.6, 8.7, "Konten UGC + unboxing sangat authentic, dorong lebih banyak user untuk share.", 8.5,
      [{ r: "Buat program review resmi dengan reward", reason: "Mengumpulkan UGC secara sistematis" },
       { r: "Repost konten pelanggan di Stories", reason: "Menunjukkan apresiasi dan mendorong lebih banyak UGC" },
       { r: "Tambahkan unboxing ke konten rutin", reason: "Format ini mendapat engagement 40% lebih tinggi" }]),

    a("post_main_009", "IMAGE",   "2025-06-21T07:30:00.000Z", 5.2, 6.0, 5.0, 5.4, "Konten morning vibes terlalu generik, tambahkan value spesifik produk.", 4.0,
      [{ r: "Hubungkan suasana pagi dengan manfaat produk", reason: "Konteks penggunaan meningkatkan relevansi" },
       { r: "Ganti dengan foto produk yang lebih menonjol", reason: "Visual produk yang jelas meningkatkan brand recall" },
       { r: "Tambahkan rutinitas pagi yang relatable", reason: "Storytelling meningkatkan koneksi emosional" }]),

    a("post_main_010", "SIDECAR", "2025-06-19T12:00:00.000Z", 7.6, 7.9, 7.8, 7.8, "Gift guide efektif untuk moment tertentu, jadwalkan menjelang hari besar.", 7.0,
      [{ r: "Buat seri gift guide per kategori harga", reason: "Segmentasi harga membantu audiens memilih sesuai budget" },
       { r: "Jadwalkan ulang menjelang Lebaran dan Natal", reason: "Timing konten hadiah sangat mempengaruhi konversi" },
       { r: "Tambahkan opsi gift wrapping di caption", reason: "Meningkatkan value proposition untuk pembeli hadiah" }]),

    a("post_main_011", "VIDEO",   "2025-06-17T15:00:00.000Z", 9.2, 9.3, 9.0, 9.2, "Tutorial singkat adalah format terbaik untuk Reels, buat lebih banyak.", 9.3,
      [{ r: "Buat playlist tutorial di highlight Stories", reason: "Memudahkan audiens baru menemukan konten tutorial" },
       { r: "Variasikan durasi: 15s, 30s, 60s", reason: "Diversifikasi format menjangkau preferensi berbeda" },
       { r: "Kolaborasi dengan fashion creator", reason: "Memperluas jangkauan ke audiens baru yang relevan" }]),

    a("post_main_012", "IMAGE",   "2025-06-15T10:00:00.000Z", 6.0, 7.2, 6.1, 6.4, "Konten tim mendapat respon hangat, coba format story-telling yang lebih dalam.", 5.5,
      [{ r: "Buat seri 'Meet the Team' dengan format interview", reason: "Humanisasi brand meningkatkan loyalitas pelanggan" },
       { r: "Tampilkan proses kerja, bukan hanya foto formal", reason: "Behind-the-scenes lebih authentic dan engaging" },
       { r: "Tag anggota tim yang difoto", reason: "Mendorong reshare organik dari jaringan tim" }]),

    a("post_main_013", "SIDECAR", "2025-06-13T08:00:00.000Z", 7.9, 8.1, 7.7, 7.9, "Carousel inspirasi outfit kerja sangat relevan untuk target audience.", 7.2,
      [{ r: "Tambahkan tips 'dress for the job you want'", reason: "Aspirational content lebih powerful dari informational" },
       { r: "Buat versi berdasarkan tipe pekerjaan", reason: "Segmentasi meningkatkan relevansi dan save rate" },
       { r: "Integrasikan dengan produk best seller", reason: "Menghubungkan inspirasi langsung ke pembelian" }]),

    a("post_main_014", "IMAGE",   "2025-06-11T11:00:00.000Z", 6.8, 7.6, 6.5, 6.9, "Weekend content performa cukup, coba tambahkan elemen interaktif (poll).", 6.2,
      [{ r: "Tambahkan polling di Stories bersamaan", reason: "Konten interaktif meningkatkan dwell time dan algoritma" },
       { r: "Buat 'weekend outfit challenge' dengan hashtag khusus", reason: "Hashtag challenge mendorong UGC dan viral potential" },
       { r: "Posting Sabtu pagi untuk timing optimal", reason: "Weekend content performs best before 10am" }]),

    a("post_main_015", "VIDEO",   "2025-06-09T09:00:00.000Z", 9.8, 9.5, 9.9, 9.7, "Anniversary content adalah yang terbaik! Buat kampanye tahunan yang konsisten.", 9.8,
      [{ r: "Buat kampanye anniversary tahunan dengan tema berbeda", reason: "Milestone content memiliki emotional resonance tertinggi" },
       { r: "Libatkan pelanggan dalam perayaan", reason: "Co-creation meningkatkan rasa kepemilikan komunitas" },
       { r: "Gunakan momen ini untuk announce program loyalty", reason: "Anniversary adalah momen optimal untuk reward pelanggan setia" }]),
  ],
}