# Mahmut Elipek Portföy Sitesi

Kişisel portföy sitesi. React + TypeScript + Vite ile yazıldı, veriler Supabase'den geliyor, Vercel'de yayınlanıyor.

## Teknoloji

- **React 19**, **TypeScript**, **Vite 7**
- **React Router** (sayfalar), **Framer Motion** (animasyonlar), **Lenis** (yumuşak kaydırma)
- **Lottie** (açılış animasyonu), **Lucide** (ikonlar)
- **Supabase**: veritabanı (`projects`, `logos`, `site_settings`) ve görsel depolama (`portfolio` bucket'ı)
- **Yazı tipi**: Switzer (değişken font, `public/fonts/Switzer-Variable.ttf`, kendi sunucumuzdan)

## Çalıştırma

```bash
npm install
cp .env.example .env   # VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerlerini doldur
npm run dev            # http://localhost:5173
npm run build          # üretim derlemesi (dist/)
```

`.env` yoksa `npm run dev` altı örnek proje gösterir (`src/lib/devProjects.ts`). Bu örnekler üretim derlemesine girmez.

## Yapı

```
src/
├── components/
│   ├── BrandIcons.tsx     # X ve LinkedIn logoları (SVG)
│   ├── Clock.tsx          # Footer'daki canlı saat (saat dilimi ve yer adı dosyanın başında)
│   ├── CountUp.tsx        # Açılıştaki 0-100 sayacı
│   ├── Footer.tsx
│   ├── Frame.css          # Ortak "çerçeveli sütun" stilleri (şeritler, ayraçlar, çizgiler)
│   ├── Navbar.tsx         # Sabit üst çubuk
│   ├── SelectedWorks.tsx  # Anasayfadaki proje listesi
│   └── SplashLottie.tsx   # Lottie animasyonu (ayrı parça olarak geç yüklenir)
├── lib/
│   ├── devProjects.ts     # Sadece geliştirmede kullanılan örnek projeler
│   ├── image.ts           # Supabase görsellerini küçültülmüş boyutlarda isteyen yardımcı
│   ├── store.ts           # Sayfalar arası basit önbellek
│   ├── supabase.ts        # Supabase istemcisi
│   └── types.ts
└── pages/
    ├── Home.tsx           # Tanıtım yazısı, bağlantılar, projeler
    ├── ProjectDetail.tsx  # /works/:slug
    └── Admin.tsx          # /admin (içerik yönetimi)
public/
└── fonts/Switzer-Variable.ttf
```

## Sayfalar

| Yol | Sayfa |
|-----|-------|
| `/` | Anasayfa. Kısa tanıtım, bağlantılar ve proje listesi |
| `/works/:slug` | Proje detayı. Bilgiler, metin ve görsel blokları, önceki/sonraki |
| `/admin` | Yönetim paneli (projeler, logolar, ayarlar) |

`Admin` ve `ProjectDetail` ayrı parçalar halinde (lazy) yüklenir, ilk açılışta indirilmez.

## Tasarım dili

Ortada 720px'lik dar bir sütun, iki yanında ince taralı şeritler (`.rails`), bölümler arasında taralı bantlar (`.hatch`). Yatay çizgiler sütunun dışına taşmaz. Ortak değerler `src/components/Frame.css` içinde. Metin Switzer, giriş yazısında 14px / 20px satır yüksekliği.

Anasayfadaki isim ve ünvan, tanıtım metni, bağlantı rozetleri ve ürün adresleri (`PRODUCT_URLS`) `src/pages/Home.tsx` içinde.

## Görseller

- **Yükleme (Admin):** Görseller tarayıcıda WebP'ye çevrilir, en çok 1920px ve yaklaşık 1,5 MB'a küçültülür, uzun süreli önbellek başlığıyla yüklenir.
- **Gösterim:** `src/lib/image.ts`, Supabase'in görsel dönüştürme adresini (`/storage/v1/render/image/public/...`) kullanıp ekranda gereken boyutu (700 ve 1400px) ister. Dönüştürme çalışmazsa orijinal görsele döner.
- **Yükleme sırası:** İlk proje görseli hemen, diğerleri kaydırıldıkça yüklenir (`loading="lazy"`).
- `optimize-images.js`: Eski, büyük görselleri toplu olarak WebP'ye çeviren tek seferlik betik (`.env` gerekir).

## Yayın

Vercel `main` branch'ini yayınlar. `vercel.json` tüm adresleri `index.html`'e yönlendirir. Vercel'de aynı iki ortam değişkeni (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) tanımlı olmalı.

## Veritabanı

Şema dosyaları kök dizinde: `supabase_schema.sql`, `site_settings.sql`, `about_blocks_schema.sql`, `visibility_schema.sql`, `add_link_column.sql`, `update_schema.sql`. Yeni bir Supabase projesinde Supabase SQL Editor'de çalıştır.
