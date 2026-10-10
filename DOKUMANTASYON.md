# Mahmut Elipek Portföy Sitesi

Kişisel portföy sitesi. React + TypeScript + Vite ile yazıldı, veriler Supabase'den geliyor, Vercel'de yayınlanıyor. Canlı adres: https://www.mahmutelipek.com

## Teknoloji

- **React 19**, **TypeScript**, **Vite 7**
- **React Router** (sayfalar), **Framer Motion** (animasyonlar), **Lenis** (yumuşak kaydırma)
- **Lottie** (açılış animasyonu), **Lucide** (ikonlar), **ascii.rest** (anasayfadaki ASCII kapak, MIT lisanslı)
- **Supabase**: veritabanı (`projects`, `logos`, `site_settings`) ve görsel depolama (`portfolio` bucket'ı)
- **Vercel**: yayın ve iki sunucu fonksiyonu (`api/`)
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
api/
├── project.js          # /works/:slug için sunucu tarafında başlık, açıklama ve paylaşım görseli
└── sitemap.js          # /sitemap.xml, görünür projelerden anlık üretilir
src/
├── components/
│   ├── AsciiCover.tsx     # Anasayfa üstündeki ASCII "earthrise" kapağı (geç yüklenir)
│   ├── BrandIcons.tsx     # X ve LinkedIn logoları (SVG)
│   ├── Clock.tsx          # Footer'daki canlı saat (saat dilimi ve yer adı dosyanın başında)
│   ├── CountUp.tsx        # Açılıştaki 0-100 sayacı
│   ├── FitMedia.tsx       # Proje görseli/videosu kutuları ve "Click to zoom" etiketi
│   ├── Footer.tsx
│   ├── Frame.css          # Ortak "çerçeveli sütun" stilleri, ASCII kapak, lightbox, zoom etiketi
│   ├── Lightbox.tsx       # Tek görseli/videoyu tam ekran büyüten katman
│   ├── LogoMarquee.tsx    # "Worked with" logo bandı (Projects'in üstünde)
│   ├── Navbar.tsx         # Sabit üst çubuk
│   ├── SelectedWorks.tsx  # Anasayfadaki proje listesi
│   ├── SplashLottie.tsx   # Lottie animasyonu (ayrı parça olarak geç yüklenir)
│   └── StorageCleanup.tsx # Admin'de kullanılmayan dosyaları listeleyip silen araç
├── lib/
│   ├── devProjects.ts     # Sadece geliştirmede kullanılan örnek projeler
│   ├── glass.ts           # Tam ekran bulanık katman stili
│   ├── idle.ts            # whenIdle: sayfa yüklenip tarayıcı boşalınca iş çalıştırır
│   ├── image.ts           # Görsel boyut/kalite yardımcıları (aşağıda "Görseller")
│   ├── logoMetrics.ts     # Logoların görünür boyutunu ve koyu/açık durumunu ölçer
│   ├── store.ts           # Sayfalar arası basit önbellek
│   ├── storageCleanup.ts  # Kullanılmayan Storage dosyalarını bulma ve silme
│   ├── supabase.ts        # Supabase istemcisi
│   ├── types.ts
│   └── useDocumentTitle.ts # Sayfaya göre sekme başlığı ve meta etiketleri (ünvan metni burada)
└── pages/
    ├── Home.tsx           # Açılış, ASCII kapak, tanıtım, logolar, projeler
    ├── ProjectDetail.tsx  # /works/:slug
    └── Admin.tsx          # /admin (içerik yönetimi)
public/
├── covers/                # Proje kapakları (aşağıda "Kapaklar")
├── fonts/Switzer-Variable.ttf
├── logos/flowla.svg       # Yerel logo
├── favicon.svg, favicon.ico, favicon-32.png, icon-192.png, icon-512.png, apple-touch-icon.png
└── og-image.jpg           # Genel paylaşım görseli (1200x630)
```

## Sayfalar

| Yol | Sayfa |
|-----|-------|
| `/` | Anasayfa. ASCII kapak, kısa tanıtım, bağlantılar, logolar ve proje listesi |
| `/works/:slug` | Proje detayı. Bilgiler, metin, görsel ve video blokları, önceki/sonraki |
| `/admin` | Yönetim paneli (projeler, logolar, site ayarları) |
| `/sitemap.xml` | `api/sitemap.js` üretir |

`Admin` ve `ProjectDetail` ayrı parçalar halinde (lazy) yüklenir, ilk açılışta indirilmez. Ayrı bir About sayfası yok; eski `about_blocks` tablosu silindi.

## Anasayfa

- **Açılış (splash):** Siteye her tam yüklemede (adrese girme, yenileme) Lottie animasyonu ve 0-100 sayacı çıkar. Site içinde gezinirken anasayfaya dönünce tekrar çıkmaz (`globalStore.homeVisited`).
- **ASCII kapak:** Tanıtımın üstünde alçak bir şerit. `ascii.rest`'in "earthrise" parçası, orijinal 15 kare/sn hızında çalışır. İlk hazırlığı ağır olduğu için açılışın arkasında, tarayıcı boşalınca (`whenIdle`) hazırlanır.
- **Logo bandı:** `logos` tablosundaki logolar yatay kayar. `logoMetrics.ts` her logonun görünür kutusunu ve yoğunluğunu ölçer, `LogoMarquee.tsx` hepsini gözle eşit görünecek boyuta getirir. Bir logo hâlâ büyük ya da küçük duruyorsa `SIZE_BOOST` listesine logo id'siyle bir çarpan eklenir. Koyu logolar otomatik ters çevrilir.
- **Seçili metin rengi:** Space gray (`src/index.css`, `::selection`).
- **Google Analytics:** Ölçüm kimliği `site_settings`'te, Admin'den girilir. Betik, sayfa boşalınca eklenir (`App.tsx`).

## Tasarım dili

Ortada 720px'lik dar bir sütun, iki yanında ince taralı şeritler (`.rails`), bölümler arasında taralı bantlar (`.hatch`). Yatay çizgiler sütunun dışına taşmaz. Ortak değerler `src/components/Frame.css` içinde. Metin Switzer, giriş yazısında 14px / 20px satır yüksekliği.

Anasayfadaki isim ve ünvan, tanıtım metni, bağlantı rozetleri ve ürün adresleri (`PRODUCT_URLS`) `src/pages/Home.tsx` içinde.

## Görseller

- **Yükleme (Admin):** Görseller tarayıcıda WebP'ye çevrilir, en çok 2560px ve kalite 0,92 ile (yaklaşık 4 MB sınırı) yüklenir, uzun süreli önbellek başlığıyla saklanır. Büyük, keskin orijinal yüklemek önemli: büyütünce görünen detay buna bağlı.
- **Sayfadaki gösterim:** `src/lib/image.ts` Supabase'in görsel dönüştürme adresini (`/storage/v1/render/image/public/...`) kullanıp 800 ve 1400px'lik kopyalar ister, kalite 90. Dönüştürme çalışmazsa orijinal görsele döner. SVG ve GIF olduğu gibi gösterilir.
- **Kutu:** Proje medyası 1280x768 oranlı sabit bir kutuya konur. Görseller `contain` ile sığar, videolar `cover` ile kutuyu doldurur.
- **Yükleme sırası:** İlk üç görsel hemen, diğerleri kaydırıldıkça yüklenir (`loading="lazy"`).
- **Büyütme (Lightbox):** Proje detayında bir görsele ya da videoya tıklayınca tek başına tam ekran büyür. Kapatma: X düğmesi, Esc, arka plana tıklama. Büyütmede sıkıştırılmış kopya değil orijinal dosya gösterilir. Fareli cihazlarda görselin üstünde imleci takip eden "Click to zoom" etiketi çıkar, dokunmatikte çıkmaz; telefonda iki parmakla yakınlaştırma çalışır.

### Kapaklar

Anasayfa kartlarındaki ve paylaşım görsellerindeki kapaklar siteyle birlikte yayınlanır (Supabase'e bağlı değildir):

```
public/covers/<slug>.webp      # 1600px, kartlarda büyük ekran/retina için
public/covers/<slug>-800.webp  # 800px, kartlarda normal ekran için
public/covers/<slug>-og.jpg    # 1200x630, paylaşım görseli (orta kırpım)
```

`<slug>`, projenin `slug` değeri. Projenin `cover_image_url` alanı `/covers/<slug>.webp` olursa `image.ts` iki boyutu otomatik kullanır. Mevcut kapaklar: norma, hotpepper, frink, elva, loodos, theviewhospital, humble, firecrawl, flowla.

## Paylaşım önizlemeleri

LinkedIn, X, WhatsApp ve Facebook JavaScript çalıştırmaz, sayfanın HTML'indeki etiketlere bakar. Bu yüzden:

- **Genel:** `index.html` içindeki Open Graph ve Twitter etiketleri `https://www.mahmutelipek.com/og-image.jpg?v=3` görselini gösterir. Görseli değiştirince sondaki `?v=` numarasını artır, aksi halde platformlar eskisini önbellekten verir.
- **Proje başına:** `/works/:slug` adresi `vercel.json` ile `api/project.js`'e gider. Fonksiyon projeyi Supabase'ten okuyup başlığı (`<Proje> | Mahmut Elipek`), açıklamayı (ilk metin bloğundan, en çok iki cümle) ve görseli projeye göre değiştirir. Site tarayıcıda aynı şekilde açılır.
- **Proje görseli:** Kapak `/covers/<slug>.webp` ise `<slug>-og.jpg` kullanılır (sondaki `?v=` numarası `api/project.js`'te). Kapak Supabase'teyse 1200px'lik kopyası istenir. Kapak yoksa genel görsel kalır.
- **Hata durumu:** Veritabanı yanıt vermezse ya da slug yoksa genel sayfa döner, site bozulmaz. Başarılı yanıtlar 10 dakika, hatalılar 1 dakika önbellekte kalır.
- **Eski önizleme:** Daha önce paylaşılmış linkler, platformun önbelleği (genelde 1-4 hafta) dolana kadar eski kartı gösterebilir. Yeni linkler hemen güncel çıkar. X'te zorlamak için linkin sonuna `?v=2` eklenebilir.
- **Test:** Login istemeyen bir kontrol için linki opengraph.xyz'e yapıştır.

Simgeler (`favicon.svg` ve yedekleri) siteyle birlikte yayınlanır, Supabase'te değildir.

## Admin paneli

`/admin`, Supabase Auth ile giriş ister. Üç sekme var:

- **Projects:** Proje ekleme, düzenleme, sıralama, gizleme/gösterme. Metin, görsel ve video blokları buradan eklenir. Kaydet, projenin tamamını yazar: eski bir sekmeden kaydetmek veritabanında sonradan yapılan değişikliklerin üstüne yazabilir.
- **Teams (Logos):** "Worked with" bandındaki logolar.
- **Site Assets:** Google Analytics kimliği ve **Storage temizleme**. Temizleme aracı, projelerin, logoların ve ayarların işaret etmediği dosyaları (eski kapaklar, değiştirilmiş görseller, deneme yüklemeleri) listeler; seçip silebilirsin. Silmeden önce listeyi kontrol et.

## Yayın

Vercel `main` branch'ini yayınlar. `vercel.json`:

1. `/sitemap.xml` → `api/sitemap`
2. `/works/:slug` → `api/project?slug=:slug`
3. diğer her adres → `index.html`

Vercel'de aynı iki ortam değişkeni (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) tanımlı olmalı; `api/` fonksiyonları da bunları kullanır. Çalışma branch'indeki push'lar önizleme yayını üretir; önizleme, GitHub'ın geçici hız sınırına takılıp hata verebilir, kodla ilgisi yoktur.

## Veritabanı

Şema dosyaları kök dizinde: `supabase_schema.sql`, `site_settings.sql`, `visibility_schema.sql`, `add_link_column.sql`, `update_schema.sql`. Yeni bir Supabase projesinde Supabase SQL Editor'de çalıştır. Tablolar: `projects` (içerik blokları `content_blocks` alanında JSON olarak), `logos`, `site_settings`. Yazma izinleri sadece giriş yapmış kullanıcıya açık.

## Yeni proje eklerken

1. Admin → Projects → yeni proje. Başlık, `slug`, tarih, roller, bağlantı ve blokları doldur, görselleri büyük (2560px) yükle.
2. Anasayfa kartı için kapak gerekir. Yerel kapak istiyorsan `public/covers/` altına üç dosyayı (`<slug>.webp`, `<slug>-800.webp`, `<slug>-og.jpg`) ekleyip `cover_image_url`'u `/covers/<slug>.webp` yap. Aksi halde Admin'den yüklenen kapak çalışır, paylaşım görseli o kapaktan üretilir.
3. Göz düğmesiyle projeyi görünür yap ve kaydet. Sıralama `sort_order` ile belirlenir.
4. Paylaşım önizlemesini opengraph.xyz'de kontrol et.
