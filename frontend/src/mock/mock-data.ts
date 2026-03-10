// ─────────────────────────────────────────────────────────────────────────────
// mock-data.ts  —  3 akun (1 main + 2 competitor), 15 post per akun
// Letakkan di: src/mocks/mock-data.ts
// ─────────────────────────────────────────────────────────────────────────────

import type { Account, RawPost, AnalysisResult } from "@/components/instagram/shared/types"

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNTS
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_ACCOUNTS: Account[] = [
  {
    id:             "acc_main_001",
    username:       "mybrand.id",
    fullName:       "My Brand Indonesia",
    accountType:    "main",
    followersCount: 48_320,
    followingCount: 612,
    postsCount:     214,
    profilePicUrl:  "https://i.pravatar.cc/150?img=10",
    biography:      "🇮🇩 Premium lifestyle brand · Jakarta · DM for collab",
    website:        "https://mybrand.id",
    isVerified:     false,
    avgLikes:       1_240,
    avgComments:    88,
    avgViews:       9_400,
    engagementRate: 2.75,
    location:       "Jakarta, Indonesia",
    category:       "Brand",
    createdAt:      "2021-03-15T00:00:00.000Z",
    updatedAt:      "2025-07-08T10:00:00.000Z",
  },
  {
    id:             "acc_comp_001",
    username:       "competitor_alpha",
    fullName:       "Alpha Store Official",
    accountType:    "competitor",
    followersCount: 92_500,
    followingCount: 480,
    postsCount:     388,
    profilePicUrl:  "https://i.pravatar.cc/150?img=20",
    biography:      "Alpha quality, alpha price 🔥",
    website:        "https://alphastore.co.id",
    isVerified:     true,
    avgLikes:       2_100,
    avgComments:    145,
    avgViews:       18_000,
    engagementRate: 2.42,
    location:       "Surabaya, Indonesia",
    category:       "Retail",
    createdAt:      "2020-07-01T00:00:00.000Z",
    updatedAt:      "2025-07-08T10:00:00.000Z",
  },
  {
    id:             "acc_comp_002",
    username:       "brand_beta_idn",
    fullName:       "Beta Brand Indonesia",
    accountType:    "competitor",
    followersCount: 31_200,
    followingCount: 920,
    postsCount:     156,
    profilePicUrl:  "https://i.pravatar.cc/150?img=30",
    biography:      "Gaya hidup modern 🌿 Bandung based",
    website:        "https://betabrand.id",
    isVerified:     false,
    avgLikes:       780,
    avgComments:    52,
    avgViews:       5_200,
    engagementRate: 2.67,
    location:       "Bandung, Indonesia",
    category:       "Lifestyle",
    createdAt:      "2022-01-10T00:00:00.000Z",
    updatedAt:      "2025-07-08T10:00:00.000Z",
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// POSTS  —  acc_main_001  (15 posts)
// ─────────────────────────────────────────────────────────────────────────────

export const POSTS_MAIN: RawPost[] = [
  {
    id: "post_main_001", accountId: "acc_main_001",
    shortcode: "SCMAIN01", mediaType: "IMAGE",
    thumbnailUrl: "https://picsum.photos/seed/main01/400/400",
    permalink: "https://www.instagram.com/p/SCMAIN01/",
    caption: "Koleksi terbaru sudah hadir! 🔥 Dapatkan sekarang sebelum kehabisan. #mybrand #newcollection #fashion #ootd #lifestyle",
    likesCount: 2_340, commentsCount: 118, viewsCount: 0, engagementRate: 5.08,
    takenAt: "2025-07-07T09:00:00.000Z", locationName: "Jakarta",
    hashtags: ["mybrand", "newcollection", "fashion", "ootd", "lifestyle"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_main_002", accountId: "acc_main_001",
    shortcode: "SCMAIN02", mediaType: "VIDEO",
    thumbnailUrl: "https://picsum.photos/seed/main02/400/400",
    permalink: "https://www.instagram.com/p/SCMAIN02/",
    caption: "Behind the scenes pembuatan produk kami 🎬 Kualitas nomor satu! #behindthescenes #quality #mybrand",
    likesCount: 3_180, commentsCount: 204, viewsCount: 22_400, engagementRate: 6.98,
    takenAt: "2025-07-05T14:30:00.000Z", locationName: "Jakarta",
    hashtags: ["behindthescenes", "quality", "mybrand"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_main_003", accountId: "acc_main_001",
    shortcode: "SCMAIN03", mediaType: "CAROUSEL_ALBUM",
    thumbnailUrl: "https://picsum.photos/seed/main03/400/400",
    permalink: "https://www.instagram.com/p/SCMAIN03/",
    caption: "5 cara mix & match outfit favorit kamu 👗 Swipe untuk lihat semua! #mixandmatch #ootd #fashiontips #style",
    likesCount: 1_870, commentsCount: 93, viewsCount: 0, engagementRate: 4.06,
    takenAt: "2025-07-03T11:00:00.000Z", locationName: "Jakarta",
    hashtags: ["mixandmatch", "ootd", "fashiontips", "style"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_main_004", accountId: "acc_main_001",
    shortcode: "SCMAIN04", mediaType: "IMAGE",
    thumbnailUrl: "https://picsum.photos/seed/main04/400/400",
    permalink: "https://www.instagram.com/p/SCMAIN04/",
    caption: "Customer favorite bulan ini ⭐ Terima kasih atas kepercayaannya! #customerreview #mybrand #trusted",
    likesCount: 1_120, commentsCount: 67, viewsCount: 0, engagementRate: 2.46,
    takenAt: "2025-07-01T08:00:00.000Z", locationName: "Jakarta",
    hashtags: ["customerreview", "mybrand", "trusted"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_main_005", accountId: "acc_main_001",
    shortcode: "SCMAIN05", mediaType: "VIDEO",
    thumbnailUrl: "https://picsum.photos/seed/main05/400/400",
    permalink: "https://www.instagram.com/p/SCMAIN05/",
    caption: "Flash sale 50% OFF mulai besok! ⏱️ Set alarm sekarang! #flashsale #diskon #promo #mybrand",
    likesCount: 4_210, commentsCount: 387, viewsCount: 31_500, engagementRate: 9.50,
    takenAt: "2025-06-29T16:00:00.000Z", locationName: "Jakarta",
    hashtags: ["flashsale", "diskon", "promo", "mybrand"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_main_006", accountId: "acc_main_001",
    shortcode: "SCMAIN06", mediaType: "IMAGE",
    thumbnailUrl: "https://picsum.photos/seed/main06/400/400",
    permalink: "https://www.instagram.com/p/SCMAIN06/",
    caption: "Aesthetic workspace goals 🖥️ Produk kami cocok untuk semua suasana #aesthetic #workspace #mybrand #lifestyle",
    likesCount: 1_450, commentsCount: 79, viewsCount: 0, engagementRate: 3.16,
    takenAt: "2025-06-27T10:00:00.000Z", locationName: "Jakarta",
    hashtags: ["aesthetic", "workspace", "mybrand", "lifestyle"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_main_007", accountId: "acc_main_001",
    shortcode: "SCMAIN07", mediaType: "CAROUSEL_ALBUM",
    thumbnailUrl: "https://picsum.photos/seed/main07/400/400",
    permalink: "https://www.instagram.com/p/SCMAIN07/",
    caption: "Summer collection 2025 sudah tiba! ☀️ 8 pilihan warna baru. Swipe untuk semua pilihan #summer2025 #newcollection #mybrand",
    likesCount: 2_670, commentsCount: 151, viewsCount: 0, engagementRate: 5.83,
    takenAt: "2025-06-25T09:30:00.000Z", locationName: "Bali",
    hashtags: ["summer2025", "newcollection", "mybrand"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_main_008", accountId: "acc_main_001",
    shortcode: "SCMAIN08", mediaType: "VIDEO",
    thumbnailUrl: "https://picsum.photos/seed/main08/400/400",
    permalink: "https://www.instagram.com/p/SCMAIN08/",
    caption: "Unboxing pengalaman belanja di mybrand.id 📦 Review jujur dari @pelanggan_setia #unboxing #review #mybrand",
    likesCount: 2_890, commentsCount: 166, viewsCount: 19_800, engagementRate: 6.31,
    takenAt: "2025-06-23T13:00:00.000Z", locationName: "Jakarta",
    hashtags: ["unboxing", "review", "mybrand"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_main_009", accountId: "acc_main_001",
    shortcode: "SCMAIN09", mediaType: "IMAGE",
    thumbnailUrl: "https://picsum.photos/seed/main09/400/400",
    permalink: "https://www.instagram.com/p/SCMAIN09/",
    caption: "Tampilan pagi yang sempurna dengan produk kami ☀️ #morningvibes #lifestyle #mybrand #ootd",
    likesCount: 980, commentsCount: 44, viewsCount: 0, engagementRate: 2.12,
    takenAt: "2025-06-21T07:30:00.000Z", locationName: "Bandung",
    hashtags: ["morningvibes", "lifestyle", "mybrand", "ootd"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_main_010", accountId: "acc_main_001",
    shortcode: "SCMAIN10", mediaType: "CAROUSEL_ALBUM",
    thumbnailUrl: "https://picsum.photos/seed/main10/400/400",
    permalink: "https://www.instagram.com/p/SCMAIN10/",
    caption: "Gift guide untuk orang tersayang 🎁 Pilihan terbaik dari mybrand. Swipe! #giftguide #present #mybrand #gift",
    likesCount: 1_780, commentsCount: 128, viewsCount: 0, engagementRate: 3.94,
    takenAt: "2025-06-19T12:00:00.000Z", locationName: "Jakarta",
    hashtags: ["giftguide", "present", "mybrand", "gift"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_main_011", accountId: "acc_main_001",
    shortcode: "SCMAIN11", mediaType: "VIDEO",
    thumbnailUrl: "https://picsum.photos/seed/main11/400/400",
    permalink: "https://www.instagram.com/p/SCMAIN11/",
    caption: "Tutorial styling cepat kurang dari 60 detik ⚡ #stylingtips #tutorial #fashion #mybrand",
    likesCount: 3_540, commentsCount: 219, viewsCount: 27_600, engagementRate: 7.76,
    takenAt: "2025-06-17T15:00:00.000Z", locationName: "Jakarta",
    hashtags: ["stylingtips", "tutorial", "fashion", "mybrand"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_main_012", accountId: "acc_main_001",
    shortcode: "SCMAIN12", mediaType: "IMAGE",
    thumbnailUrl: "https://picsum.photos/seed/main12/400/400",
    permalink: "https://www.instagram.com/p/SCMAIN12/",
    caption: "Tim kami yang luar biasa 💪 Orang-orang di balik mybrand.id #teamwork #behindthescenes #mybrand",
    likesCount: 1_230, commentsCount: 88, viewsCount: 0, engagementRate: 2.72,
    takenAt: "2025-06-15T10:00:00.000Z", locationName: "Jakarta",
    hashtags: ["teamwork", "behindthescenes", "mybrand"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_main_013", accountId: "acc_main_001",
    shortcode: "SCMAIN13", mediaType: "CAROUSEL_ALBUM",
    thumbnailUrl: "https://picsum.photos/seed/main13/400/400",
    permalink: "https://www.instagram.com/p/SCMAIN13/",
    caption: "10 outfit ideas untuk week yang produktif 💼 Kamu yang mana? #workstyle #ootd #productivemonday #mybrand",
    likesCount: 2_100, commentsCount: 143, viewsCount: 0, engagementRate: 4.64,
    takenAt: "2025-06-13T08:00:00.000Z", locationName: "Jakarta",
    hashtags: ["workstyle", "ootd", "productivemonday", "mybrand"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_main_014", accountId: "acc_main_001",
    shortcode: "SCMAIN14", mediaType: "IMAGE",
    thumbnailUrl: "https://picsum.photos/seed/main14/400/400",
    permalink: "https://www.instagram.com/p/SCMAIN14/",
    caption: "Weekend vibes ✌️ Santai tapi tetap stylish bersama mybrand.id #weekend #casualstyle #mybrand #lifestyle",
    likesCount: 1_640, commentsCount: 72, viewsCount: 0, engagementRate: 3.53,
    takenAt: "2025-06-11T11:00:00.000Z", locationName: "Bali",
    hashtags: ["weekend", "casualstyle", "mybrand", "lifestyle"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_main_015", accountId: "acc_main_001",
    shortcode: "SCMAIN15", mediaType: "VIDEO",
    thumbnailUrl: "https://picsum.photos/seed/main15/400/400",
    permalink: "https://www.instagram.com/p/SCMAIN15/",
    caption: "Kami merayakan 3 tahun bersama kalian 🎂 Terima kasih atas 48K followers! Hadiah spesial menunggu #anniversary #mybrand #thankyou",
    likesCount: 5_120, commentsCount: 431, viewsCount: 38_900, engagementRate: 11.48,
    takenAt: "2025-06-09T09:00:00.000Z", locationName: "Jakarta",
    hashtags: ["anniversary", "mybrand", "thankyou"],
    isSponsored: false, productTags: [],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// POSTS  —  acc_comp_001 / competitor_alpha  (15 posts)
// ─────────────────────────────────────────────────────────────────────────────

export const POSTS_COMP_001: RawPost[] = [
  {
    id: "post_comp1_001", accountId: "acc_comp_001",
    shortcode: "SCALP01", mediaType: "IMAGE",
    thumbnailUrl: "https://picsum.photos/seed/alpha01/400/400",
    permalink: "https://www.instagram.com/p/SCALP01/",
    caption: "Produk baru siap menggebrak pasar! 💥 Order sekarang link di bio. #alphastore #newproduct #premium",
    likesCount: 3_420, commentsCount: 221, viewsCount: 0, engagementRate: 3.93,
    takenAt: "2025-07-07T08:00:00.000Z", locationName: "Surabaya",
    hashtags: ["alphastore", "newproduct", "premium"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp1_002", accountId: "acc_comp_001",
    shortcode: "SCALP02", mediaType: "VIDEO",
    thumbnailUrl: "https://picsum.photos/seed/alpha02/400/400",
    permalink: "https://www.instagram.com/p/SCALP02/",
    caption: "Review jujur dari ribuan pelanggan setia kami 💛 #alphastore #review #trusted #qualityproduct",
    likesCount: 4_780, commentsCount: 312, viewsCount: 35_200, engagementRate: 5.50,
    takenAt: "2025-07-05T13:00:00.000Z", locationName: "Surabaya",
    hashtags: ["alphastore", "review", "trusted", "qualityproduct"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp1_003", accountId: "acc_comp_001",
    shortcode: "SCALP03", mediaType: "CAROUSEL_ALBUM",
    thumbnailUrl: "https://picsum.photos/seed/alpha03/400/400",
    permalink: "https://www.instagram.com/p/SCALP03/",
    caption: "Koleksi signature series eksklusif 🖤 Hanya tersedia 100 pcs. Swipe untuk lihat detail! #exclusive #limited #alphastore",
    likesCount: 5_100, commentsCount: 398, viewsCount: 0, engagementRate: 5.94,
    takenAt: "2025-07-03T10:00:00.000Z", locationName: "Surabaya",
    hashtags: ["exclusive", "limited", "alphastore"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp1_004", accountId: "acc_comp_001",
    shortcode: "SCALP04", mediaType: "IMAGE",
    thumbnailUrl: "https://picsum.photos/seed/alpha04/400/400",
    permalink: "https://www.instagram.com/p/SCALP04/",
    caption: "Gratis ongkir ke seluruh Indonesia! 🚚 Berlaku hari ini saja. #freeongkir #alphastore #promo",
    likesCount: 6_200, commentsCount: 487, viewsCount: 0, engagementRate: 7.23,
    takenAt: "2025-07-01T07:00:00.000Z", locationName: "Surabaya",
    hashtags: ["freeongkir", "alphastore", "promo"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp1_005", accountId: "acc_comp_001",
    shortcode: "SCALP05", mediaType: "VIDEO",
    thumbnailUrl: "https://picsum.photos/seed/alpha05/400/400",
    permalink: "https://www.instagram.com/p/SCALP05/",
    caption: "Cara mudah dapat cashback 30%! 💰 Ikuti langkahnya di video ini #cashback #alphastore #tips",
    likesCount: 3_890, commentsCount: 267, viewsCount: 28_100, engagementRate: 4.49,
    takenAt: "2025-06-29T15:00:00.000Z", locationName: "Surabaya",
    hashtags: ["cashback", "alphastore", "tips"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp1_006", accountId: "acc_comp_001",
    shortcode: "SCALP06", mediaType: "IMAGE",
    thumbnailUrl: "https://picsum.photos/seed/alpha06/400/400",
    permalink: "https://www.instagram.com/p/SCALP06/",
    caption: "Flagship store kami kini hadir di Surabaya 🏬 Kunjungi dan rasakan sendiri! #flagshipstore #alphastore #surabaya",
    likesCount: 2_640, commentsCount: 178, viewsCount: 0, engagementRate: 3.04,
    takenAt: "2025-06-27T09:00:00.000Z", locationName: "Surabaya",
    hashtags: ["flagshipstore", "alphastore", "surabaya"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp1_007", accountId: "acc_comp_001",
    shortcode: "SCALP07", mediaType: "CAROUSEL_ALBUM",
    thumbnailUrl: "https://picsum.photos/seed/alpha07/400/400",
    permalink: "https://www.instagram.com/p/SCALP07/",
    caption: "Komparasi produk Alpha vs brand lain — kamu pilih yang mana? 🤔 #comparison #alphastore #best",
    likesCount: 4_320, commentsCount: 354, viewsCount: 0, engagementRate: 5.05,
    takenAt: "2025-06-25T11:00:00.000Z", locationName: "Surabaya",
    hashtags: ["comparison", "alphastore", "best"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp1_008", accountId: "acc_comp_001",
    shortcode: "SCALP08", mediaType: "VIDEO",
    thumbnailUrl: "https://picsum.photos/seed/alpha08/400/400",
    permalink: "https://www.instagram.com/p/SCALP08/",
    caption: "Viral challenge bareng fans! 🔥 Tag kami dan menangkan hadiah utama #viralchallenge #alphastore #giveaway",
    likesCount: 7_840, commentsCount: 612, viewsCount: 54_300, engagementRate: 9.14,
    takenAt: "2025-06-23T14:00:00.000Z", locationName: "Surabaya",
    hashtags: ["viralchallenge", "alphastore", "giveaway"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp1_009", accountId: "acc_comp_001",
    shortcode: "SCALP09", mediaType: "IMAGE",
    thumbnailUrl: "https://picsum.photos/seed/alpha09/400/400",
    permalink: "https://www.instagram.com/p/SCALP09/",
    caption: "Packaging premium baru kini hadir 🎁 Kesan pertama yang tak terlupakan #packaging #alphastore #premium",
    likesCount: 1_980, commentsCount: 112, viewsCount: 0, engagementRate: 2.26,
    takenAt: "2025-06-21T08:30:00.000Z", locationName: "Surabaya",
    hashtags: ["packaging", "alphastore", "premium"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp1_010", accountId: "acc_comp_001",
    shortcode: "SCALP10", mediaType: "CAROUSEL_ALBUM",
    thumbnailUrl: "https://picsum.photos/seed/alpha10/400/400",
    permalink: "https://www.instagram.com/p/SCALP10/",
    caption: "Milestone 90K followers! 🎉 Terima kasih atas dukungan kalian. Swipe untuk lihat perjalanan kami #milestone #alphastore",
    likesCount: 8_100, commentsCount: 743, viewsCount: 0, engagementRate: 9.56,
    takenAt: "2025-06-19T10:00:00.000Z", locationName: "Surabaya",
    hashtags: ["milestone", "alphastore"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp1_011", accountId: "acc_comp_001",
    shortcode: "SCALP11", mediaType: "VIDEO",
    thumbnailUrl: "https://picsum.photos/seed/alpha11/400/400",
    permalink: "https://www.instagram.com/p/SCALP11/",
    caption: "Proses produksi dari awal hingga produk sampai ke tangan kamu 🏭 #production #alphastore #transparent",
    likesCount: 3_150, commentsCount: 198, viewsCount: 21_400, engagementRate: 3.62,
    takenAt: "2025-06-17T14:00:00.000Z", locationName: "Surabaya",
    hashtags: ["production", "alphastore", "transparent"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp1_012", accountId: "acc_comp_001",
    shortcode: "SCALP12", mediaType: "IMAGE",
    thumbnailUrl: "https://picsum.photos/seed/alpha12/400/400",
    permalink: "https://www.instagram.com/p/SCALP12/",
    caption: "Outfit of the week pilihan editor kami 🌟 #ootw #editorspick #alphastore #style",
    likesCount: 2_430, commentsCount: 154, viewsCount: 0, engagementRate: 2.79,
    takenAt: "2025-06-15T09:00:00.000Z", locationName: "Surabaya",
    hashtags: ["ootw", "editorspick", "alphastore", "style"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp1_013", accountId: "acc_comp_001",
    shortcode: "SCALP13", mediaType: "CAROUSEL_ALBUM",
    thumbnailUrl: "https://picsum.photos/seed/alpha13/400/400",
    permalink: "https://www.instagram.com/p/SCALP13/",
    caption: "Kolaborasi eksklusif dengan desainer lokal terbaik 🤝 Swipe untuk lihat hasilnya! #collab #localdesigner #alphastore",
    likesCount: 4_670, commentsCount: 329, viewsCount: 0, engagementRate: 5.40,
    takenAt: "2025-06-13T11:00:00.000Z", locationName: "Surabaya",
    hashtags: ["collab", "localdesigner", "alphastore"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp1_014", accountId: "acc_comp_001",
    shortcode: "SCALP14", mediaType: "IMAGE",
    thumbnailUrl: "https://picsum.photos/seed/alpha14/400/400",
    permalink: "https://www.instagram.com/p/SCALP14/",
    caption: "Sertifikat kualitas internasional kami 🏆 Standar global untuk produk terbaik #certified #quality #alphastore",
    likesCount: 1_760, commentsCount: 89, viewsCount: 0, engagementRate: 2.00,
    takenAt: "2025-06-11T08:00:00.000Z", locationName: "Surabaya",
    hashtags: ["certified", "quality", "alphastore"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp1_015", accountId: "acc_comp_001",
    shortcode: "SCALP15", mediaType: "VIDEO",
    thumbnailUrl: "https://picsum.photos/seed/alpha15/400/400",
    permalink: "https://www.instagram.com/p/SCALP15/",
    caption: "Alpha menjawab semua pertanyaan kalian! 💬 Q&A terlengkap ada di sini #qanda #alphastore #faq",
    likesCount: 2_980, commentsCount: 241, viewsCount: 18_700, engagementRate: 3.48,
    takenAt: "2025-06-09T15:00:00.000Z", locationName: "Surabaya",
    hashtags: ["qanda", "alphastore", "faq"],
    isSponsored: false, productTags: [],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// POSTS  —  acc_comp_002 / brand_beta_idn  (15 posts)
// ─────────────────────────────────────────────────────────────────────────────

export const POSTS_COMP_002: RawPost[] = [
  {
    id: "post_comp2_001", accountId: "acc_comp_002",
    shortcode: "SCBET01", mediaType: "IMAGE",
    thumbnailUrl: "https://picsum.photos/seed/beta01/400/400",
    permalink: "https://www.instagram.com/p/SCBET01/",
    caption: "Pagi yang tenang bersama produk favorit kita ☕🌿 #betabrand #morning #slowliving #lifestyle",
    likesCount: 1_120, commentsCount: 64, viewsCount: 0, engagementRate: 3.79,
    takenAt: "2025-07-07T07:30:00.000Z", locationName: "Bandung",
    hashtags: ["betabrand", "morning", "slowliving", "lifestyle"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp2_002", accountId: "acc_comp_002",
    shortcode: "SCBET02", mediaType: "VIDEO",
    thumbnailUrl: "https://picsum.photos/seed/beta02/400/400",
    permalink: "https://www.instagram.com/p/SCBET02/",
    caption: "Cara kami menjaga lingkungan tetap lestari 🌱 Sustainable living dimulai dari pilihan kita #sustainable #ecofriendly #betabrand",
    likesCount: 1_890, commentsCount: 132, viewsCount: 11_200, engagementRate: 6.48,
    takenAt: "2025-07-05T12:00:00.000Z", locationName: "Bandung",
    hashtags: ["sustainable", "ecofriendly", "betabrand"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp2_003", accountId: "acc_comp_002",
    shortcode: "SCBET03", mediaType: "CAROUSEL_ALBUM",
    thumbnailUrl: "https://picsum.photos/seed/beta03/400/400",
    permalink: "https://www.instagram.com/p/SCBET03/",
    caption: "Palette warna terbaru untuk musim ini 🎨 Temukan warna yang paling cocok denganmu! Swipe! #color #betabrand #newcollection",
    likesCount: 1_340, commentsCount: 87, viewsCount: 0, engagementRate: 4.57,
    takenAt: "2025-07-03T10:30:00.000Z", locationName: "Bandung",
    hashtags: ["color", "betabrand", "newcollection"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp2_004", accountId: "acc_comp_002",
    shortcode: "SCBET04", mediaType: "IMAGE",
    thumbnailUrl: "https://picsum.photos/seed/beta04/400/400",
    permalink: "https://www.instagram.com/p/SCBET04/",
    caption: "Minimalis tapi berkelas 🤍 Filosofi desain kami ada di setiap produk #minimalist #design #betabrand",
    likesCount: 980, commentsCount: 53, viewsCount: 0, engagementRate: 3.31,
    takenAt: "2025-07-01T09:00:00.000Z", locationName: "Bandung",
    hashtags: ["minimalist", "design", "betabrand"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp2_005", accountId: "acc_comp_002",
    shortcode: "SCBET05", mediaType: "VIDEO",
    thumbnailUrl: "https://picsum.photos/seed/beta05/400/400",
    permalink: "https://www.instagram.com/p/SCBET05/",
    caption: "Vlog sehari di Bandung bersama tim Beta 🎥 Inspirasi dari kota kembang #bandung #vlog #betabrand #behindthescenes",
    likesCount: 2_210, commentsCount: 158, viewsCount: 14_800, engagementRate: 7.59,
    takenAt: "2025-06-29T14:00:00.000Z", locationName: "Bandung",
    hashtags: ["bandung", "vlog", "betabrand", "behindthescenes"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp2_006", accountId: "acc_comp_002",
    shortcode: "SCBET06", mediaType: "IMAGE",
    thumbnailUrl: "https://picsum.photos/seed/beta06/400/400",
    permalink: "https://www.instagram.com/p/SCBET06/",
    caption: "Produk ramah lingkungan pilihan komunitas kami ♻️ #recycled #green #betabrand #community",
    likesCount: 840, commentsCount: 47, viewsCount: 0, engagementRate: 2.84,
    takenAt: "2025-06-27T08:00:00.000Z", locationName: "Bandung",
    hashtags: ["recycled", "green", "betabrand", "community"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp2_007", accountId: "acc_comp_002",
    shortcode: "SCBET07", mediaType: "CAROUSEL_ALBUM",
    thumbnailUrl: "https://picsum.photos/seed/beta07/400/400",
    permalink: "https://www.instagram.com/p/SCBET07/",
    caption: "Lookbook summer edition bersama model lokal terbaik 📸 Swipe untuk semua tampilan #lookbook #summer #betabrand",
    likesCount: 1_670, commentsCount: 103, viewsCount: 0, engagementRate: 5.67,
    takenAt: "2025-06-25T10:00:00.000Z", locationName: "Bali",
    hashtags: ["lookbook", "summer", "betabrand"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp2_008", accountId: "acc_comp_002",
    shortcode: "SCBET08", mediaType: "VIDEO",
    thumbnailUrl: "https://picsum.photos/seed/beta08/400/400",
    permalink: "https://www.instagram.com/p/SCBET08/",
    caption: "Tips hidup minimalis yang bisa kamu mulai hari ini 🧘 #minimalism #lifetips #betabrand #slowliving",
    likesCount: 2_560, commentsCount: 187, viewsCount: 17_300, engagementRate: 8.80,
    takenAt: "2025-06-23T13:30:00.000Z", locationName: "Bandung",
    hashtags: ["minimalism", "lifetips", "betabrand", "slowliving"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp2_009", accountId: "acc_comp_002",
    shortcode: "SCBET09", mediaType: "IMAGE",
    thumbnailUrl: "https://picsum.photos/seed/beta09/400/400",
    permalink: "https://www.instagram.com/p/SCBET09/",
    caption: "Koleksi tote bag baru dari bahan daur ulang 🛍️ Fashion yang bertanggung jawab #totebag #sustainable #betabrand",
    likesCount: 1_090, commentsCount: 72, viewsCount: 0, engagementRate: 3.72,
    takenAt: "2025-06-21T09:00:00.000Z", locationName: "Bandung",
    hashtags: ["totebag", "sustainable", "betabrand"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp2_010", accountId: "acc_comp_002",
    shortcode: "SCBET10", mediaType: "CAROUSEL_ALBUM",
    thumbnailUrl: "https://picsum.photos/seed/beta10/400/400",
    permalink: "https://www.instagram.com/p/SCBET10/",
    caption: "Cerita perjalanan brand kami dari 0 hingga 30K followers 💚 Swipe untuk lihat perjalanannya! #journey #betabrand #milestone",
    likesCount: 2_340, commentsCount: 201, viewsCount: 0, engagementRate: 8.14,
    takenAt: "2025-06-19T11:00:00.000Z", locationName: "Bandung",
    hashtags: ["journey", "betabrand", "milestone"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp2_011", accountId: "acc_comp_002",
    shortcode: "SCBET11", mediaType: "VIDEO",
    thumbnailUrl: "https://picsum.photos/seed/beta11/400/400",
    permalink: "https://www.instagram.com/p/SCBET11/",
    caption: "Cara perawatan produk supaya tahan lama 🧼 Tutorial lengkap ada di sini! #care #tutorial #betabrand",
    likesCount: 1_430, commentsCount: 96, viewsCount: 9_800, engagementRate: 4.89,
    takenAt: "2025-06-17T14:30:00.000Z", locationName: "Bandung",
    hashtags: ["care", "tutorial", "betabrand"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp2_012", accountId: "acc_comp_002",
    shortcode: "SCBET12", mediaType: "IMAGE",
    thumbnailUrl: "https://picsum.photos/seed/beta12/400/400",
    permalink: "https://www.instagram.com/p/SCBET12/",
    caption: "Partner komunitas lokal kami di Bandung 💚 Bersama kita lebih kuat #community #localpartner #betabrand #bandung",
    likesCount: 760, commentsCount: 41, viewsCount: 0, engagementRate: 2.57,
    takenAt: "2025-06-15T08:30:00.000Z", locationName: "Bandung",
    hashtags: ["community", "localpartner", "betabrand", "bandung"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp2_013", accountId: "acc_comp_002",
    shortcode: "SCBET13", mediaType: "CAROUSEL_ALBUM",
    thumbnailUrl: "https://picsum.photos/seed/beta13/400/400",
    permalink: "https://www.instagram.com/p/SCBET13/",
    caption: "Rekomendasi outfit untuk setiap mood 😊☁️🌟 Kamu lagi mood apa hari ini? Swipe! #moodoutfit #betabrand #ootd",
    likesCount: 1_580, commentsCount: 119, viewsCount: 0, engagementRate: 5.44,
    takenAt: "2025-06-13T10:00:00.000Z", locationName: "Bandung",
    hashtags: ["moodoutfit", "betabrand", "ootd"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp2_014", accountId: "acc_comp_002",
    shortcode: "SCBET14", mediaType: "IMAGE",
    thumbnailUrl: "https://picsum.photos/seed/beta14/400/400",
    permalink: "https://www.instagram.com/p/SCBET14/",
    caption: "Bahan alami pilihan terbaik kami 🌿 Nyaman dipakai seharian #natural #material #betabrand #comfort",
    likesCount: 870, commentsCount: 49, viewsCount: 0, engagementRate: 2.94,
    takenAt: "2025-06-11T09:30:00.000Z", locationName: "Bandung",
    hashtags: ["natural", "material", "betabrand", "comfort"],
    isSponsored: false, productTags: [],
  },
  {
    id: "post_comp2_015", accountId: "acc_comp_002",
    shortcode: "SCBET15", mediaType: "VIDEO",
    thumbnailUrl: "https://picsum.photos/seed/beta15/400/400",
    permalink: "https://www.instagram.com/p/SCBET15/",
    caption: "Giveaway spesial! 🎁 Follow + like + tag 2 teman untuk menang. #giveaway #betabrand #win #hadiah",
    likesCount: 3_890, commentsCount: 482, viewsCount: 26_400, engagementRate: 13.88,
    takenAt: "2025-06-09T12:00:00.000Z", locationName: "Bandung",
    hashtags: ["giveaway", "betabrand", "win", "hadiah"],
    isSponsored: false, productTags: [],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// AI ANALYSIS  —  acc_main_001  (15 analyses, satu per post)
// ─────────────────────────────────────────────────────────────────────────────

export const ANALYSIS_MAIN: AnalysisResult = {
  success: true,
  accountId: "acc_main_001",
  analyses: [
    { id: "an_main_001", postId: "post_main_001", accountId: "acc_main_001", hookScore: 7.8, productionQuality: 8.2, engagementPotential: 8.5, overallScore: 8.2, resultJson: { overallAssessment: { recommendation: "Posting jam 09:00 sangat optimal, pertahankan konsistensi ini.", viralPotential: 7.5 } } },
    { id: "an_main_002", postId: "post_main_002", accountId: "acc_main_001", hookScore: 8.9, productionQuality: 9.1, engagementPotential: 9.2, overallScore: 9.1, resultJson: { overallAssessment: { recommendation: "Konten video BTS performa sangat baik, buat seri reguler.", viralPotential: 9.0 } } },
    { id: "an_main_003", postId: "post_main_003", accountId: "acc_main_001", hookScore: 7.2, productionQuality: 7.8, engagementPotential: 7.5, overallScore: 7.5, resultJson: { overallAssessment: { recommendation: "Carousel tips mendapat engagement tinggi, tambah CTA yang lebih kuat.", viralPotential: 6.8 } } },
    { id: "an_main_004", postId: "post_main_004", accountId: "acc_main_001", hookScore: 5.8, productionQuality: 6.5, engagementPotential: 5.5, overallScore: 5.9, resultJson: { overallAssessment: { recommendation: "Post testimoni kurang hook, coba tambahkan angka spesifik di caption.", viralPotential: 4.5 } } },
    { id: "an_main_005", postId: "post_main_005", accountId: "acc_main_001", hookScore: 9.5, productionQuality: 8.8, engagementPotential: 9.8, overallScore: 9.4, resultJson: { overallAssessment: { recommendation: "Flash sale adalah konten terbaik, gunakan lebih sering dengan variasi.", viralPotential: 9.5 } } },
    { id: "an_main_006", postId: "post_main_006", accountId: "acc_main_001", hookScore: 6.4, productionQuality: 7.5, engagementPotential: 6.8, overallScore: 6.9, resultJson: { overallAssessment: { recommendation: "Aesthetic post perlu caption lebih engaging, tambah pertanyaan.", viralPotential: 6.0 } } },
    { id: "an_main_007", postId: "post_main_007", accountId: "acc_main_001", hookScore: 8.1, productionQuality: 8.6, engagementPotential: 8.3, overallScore: 8.3, resultJson: { overallAssessment: { recommendation: "Carousel koleksi baru sangat efektif, pertahankan kualitas visual.", viralPotential: 8.2 } } },
    { id: "an_main_008", postId: "post_main_008", accountId: "acc_main_001", hookScore: 8.7, productionQuality: 8.9, engagementPotential: 8.6, overallScore: 8.7, resultJson: { overallAssessment: { recommendation: "Konten UGC + unboxing sangat authentic, dorong lebih banyak user untuk share.", viralPotential: 8.5 } } },
    { id: "an_main_009", postId: "post_main_009", accountId: "acc_main_001", hookScore: 5.2, productionQuality: 6.0, engagementPotential: 5.0, overallScore: 5.4, resultJson: { overallAssessment: { recommendation: "Konten morning vibes terlalu generik, tambahkan value spesifik produk.", viralPotential: 4.0 } } },
    { id: "an_main_010", postId: "post_main_010", accountId: "acc_main_001", hookScore: 7.6, productionQuality: 7.9, engagementPotential: 7.8, overallScore: 7.8, resultJson: { overallAssessment: { recommendation: "Gift guide efektif untuk moment tertentu, jadwalkan menjelang hari besar.", viralPotential: 7.0 } } },
    { id: "an_main_011", postId: "post_main_011", accountId: "acc_main_001", hookScore: 9.2, productionQuality: 9.3, engagementPotential: 9.0, overallScore: 9.2, resultJson: { overallAssessment: { recommendation: "Tutorial singkat adalah format terbaik untuk Reels, buat lebih banyak.", viralPotential: 9.3 } } },
    { id: "an_main_012", postId: "post_main_012", accountId: "acc_main_001", hookScore: 6.0, productionQuality: 7.2, engagementPotential: 6.1, overallScore: 6.4, resultJson: { overallAssessment: { recommendation: "Konten tim mendapat respon hangat, coba format story-telling yang lebih dalam.", viralPotential: 5.5 } } },
    { id: "an_main_013", postId: "post_main_013", accountId: "acc_main_001", hookScore: 7.9, productionQuality: 8.1, engagementPotential: 7.7, overallScore: 7.9, resultJson: { overallAssessment: { recommendation: "Carousel inspirasi outfit kerja sangat relevan untuk target audience.", viralPotential: 7.2 } } },
    { id: "an_main_014", postId: "post_main_014", accountId: "acc_main_001", hookScore: 6.8, productionQuality: 7.6, engagementPotential: 6.5, overallScore: 6.9, resultJson: { overallAssessment: { recommendation: "Weekend content performa cukup, coba tambahkan elemen interaktif (poll).", viralPotential: 6.2 } } },
    { id: "an_main_015", postId: "post_main_015", accountId: "acc_main_001", hookScore: 9.8, productionQuality: 9.5, engagementPotential: 9.9, overallScore: 9.7, resultJson: { overallAssessment: { recommendation: "Anniversary content adalah yang terbaik! Buat kampanye tahunan yang konsisten.", viralPotential: 9.8 } } },
  ],
  summary: {
    totalAnalyzed:          15,
    avgHookScore:           7.66,
    avgProductionScore:     8.07,
    avgEngagementPotential: 7.75,
    avgOverallScore:        7.84,
    topContentThemes:       ["Video Tutorial", "Flash Sale", "Anniversary/Milestone"],
    improvementAreas:       ["Perkuat hook di konten lifestyle", "Tambahkan CTA lebih eksplisit", "Posting lebih konsisten di jam prime time"],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// MAP HELPERS  —  mudah diakses per accountId
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_POSTS_BY_ACCOUNT: Record<string, RawPost[]> = {
  acc_main_001:  POSTS_MAIN,
  acc_comp_001:  POSTS_COMP_001,
  acc_comp_002:  POSTS_COMP_002,
}

export const ALL_ANALYSIS_BY_ACCOUNT: Record<string, AnalysisResult> = {
  acc_main_001: ANALYSIS_MAIN,
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK API  —  drop-in replacement for src/components/instagram/shared/api.ts
// ─────────────────────────────────────────────────────────────────────────────

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))
let _jobCounter = 1

export const mockApi = {
  async getAccounts() {
    await delay(400)
    return { success: true, accounts: MOCK_ACCOUNTS }
  },

  async getAccountPosts(accountId: string, limit = 100) {
    await delay(300)
    const posts = (ALL_POSTS_BY_ACCOUNT[accountId] ?? []).slice(0, limit)
    return { success: true, accountId, posts, total: posts.length }
  },

  async getAccountAnalysis(accountId: string, limit = 50) {
    await delay(350)
    const result = ALL_ANALYSIS_BY_ACCOUNT[accountId]
    if (!result) return { success: true, accountId, analyses: [], summary: null }
    return { ...result, analyses: result.analyses.slice(0, limit) }
  },

  async startScrape() {
    await delay(150)
    return { success: true, jobId: `job_scrape_${_jobCounter++}` }
  },

  async startAiAnalysis() {
    await delay(150)
    return { success: true, jobId: `job_analyze_${_jobCounter++}` }
  },

  async getJobStatus(jobId: string) {
    await delay(250)
    return {
      id:          jobId,
      status:      "completed" as const,
      message:     jobId.includes("scrape") ? "15 post berhasil di-scrape" : "AI analysis selesai untuk 15 post",
      completedAt: new Date().toISOString(),
    }
  },
}

// Gunakan ini sebagai pengganti `api` di shared/api.ts:
// export const api = mockApi