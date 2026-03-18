# Mahmut Elipek Kişisel Portföy Web Sitesi Dokümantasyonu

## Genel Bakış

Bu proje, Mahmut Elipek adlı ürün ve deneyim tasarımcısının kişisel portföy web sitesidir. Modern, etkileşimli ve görsel açıdan çarpıcı bir deneyim sunmak için React, TypeScript, Three.js ve Supabase kullanılarak geliştirilmiştir.

---

## Teknoloji Yığını

### Frontend
- **React 19** - Kullanıcı arayüzü kütüphanesi
- **TypeScript** - Tip güvenliği için
- **Vite 7** - Build aracı ve geliştirme sunucusu
- **React Router DOM 7** - Yönlendirme
- **Framer Motion 12** - Animasyon kütüphanesi
- **Three.js / React Three Fiber** - 3D grafikler ve WebGL efektleri
- **@use-gesture/react** - Dokunmatik ve fare etkileşimleri

### Backend & Veritabanı
- **Supabase** - PostgreSQL veritabanı ve autentikasyon
- **@supabase/supabase-js** - Supabase istemci kütüphanesi

### UI & Fonts
- **Lucide React** - İkon kütüphanesi
- **Geist** - Font ailesi
- **Mona Sans** - Birincil font
- **Suisse Intl Mono** - Monospace font

---

## Proje Yapısı

```
portfolio-site/
├── public/
│   └── fonts/
│       └── Suisse_Intl_Mono.ttf
├── src/
│   ├── components/
│   │   ├── AuraHero.tsx          # 3D parçacık efekti içeren hero bölümü
│   │   ├── DecryptedText.tsx     # Şifreli metin animasyonu bileşeni
│   │   ├── DomeGallery.tsx       # Kubik galeri - şirket logoları için
│   │   ├── Footer.tsx            # Site altbilgisi
│   │   ├── Hero.tsx              # Alternatif hero bileşeni
│   │   ├── Navbar.tsx            # Navigasyon barı
│   │   ├── OrbitImages.tsx       # Dönen görseller bileşeni
│   │   ├── PixelCard.tsx         # Piksel kart bileşeni
│   │   ├── PixelCard.css         # Piksel kart stilleri
│   │   ├── SelectedWorks.tsx     # Seçilmiş çalışmalar bölümü
│   │   └── ShinyText.tsx         # Parlak metin efekti
│   ├── lib/
│   │   ├── supabase.ts           # Supabase istemci yapılandırması
│   │   └── types.ts              # TypeScript tip tanımlamaları
│   ├── pages/
│   │   ├── Admin.tsx             # Yönetici paneli (CRUD işlemleri)
│   │   ├── Home.tsx              # Ana sayfa
│   │   └── ProjectDetail.tsx     # Proje detay sayfası
│   ├── styles/
│   ├── App.tsx                   # Ana uygulama bileşeni
│   ├── App.css                   # App düzeyinde stiller
│   ├── index.css                 # Global stiller ve CSS değişkenleri
│   └── main.tsx                  # React uygulama giriş noktası
├── supabase_schema.sql           # Veritabanı şeması
├── site_settings.sql              # Site ayarları
├── update_schema.sql              # Şema güncellemeleri
├── about_blocks_schema.sql        # Hakkında blokları şeması
├── dummy_data.sql                 # Örnek veriler
├── seed.js                        # Veri tohumlama scripti
├── package.json                   # NPM bağımlılıkları
├── tsconfig.json                  # TypeScript yapılandırması
├── vite.config.ts                # Vite yapılandırması
└── .env.example                   # Çevre değişkenleri şablonu
```

---

## Sayfalar ve Rotalar

| Yol | Bileşen | Açıklama |
|-----|----------|----------|
| `/` | `Home` | Ana sayfa - hero, çalışmalar ve galeri |
| `/works/:slug` | `ProjectDetail` | Proje detay sayfası |
| `/admin` | `Admin` | Yönetici paneli |

---

## Bileşenler

### 1. AuraHero
3D parçacık sürüsü (particle swarm) efekti içeren etkileşimli hero bölümü. React Three Fiber ve Three.js kullanılarak oluşturulmuştur. Yaklaşık 19.683 parçacık içeren kübik bir yapıdadır.

**Özellikler:**
- Otomatik dönen parçacık animasyonu
- Unreal Bloom post-processing efekti
- Fresnel shader efekti
- Tam ekran kaplama

### 2. Navbar
Sabit pozisyonlu navigasyon barı. Scroll pozisyonuna göre animasyonlar içerir.

**Özellikler:**
- "me." logosu
- Sosyal medya bağlantıları (X, LinkedIn, Layers)
- "Get in Touch" parlak metin efekti
- Mobil uyumlu tasarım

### 3. SelectedWorks
Seçilmiş çalışmaları listeleyen bölüm.

**Özellikler:**
- Framer Motion ile yumuşak geçiş animasyonları
- Hover durumunda görsel büyütme efekti
- Proje rolleri ve başlık görüntüleme

### 4. DomeGallery
Şirket logolarını sergileyen interaktif kubik galeri.

**Özellikler:**
- 3D küresel düzen
- Sürükleme ile döndürme
- Tıklama ile büyütme efekti
- Eylemsellik (inertia) animasyonu

### 5. ProjectDetail
Proje detay sayfası.

**Özellikler:**
- Esnek içerik blokları sistemi
- Görsel galeri
- Proje meta bilgileri (müşteri, rol, yıl)
- Responsive tasarım

### 6. Admin
Yönetici paneli - projeler ve logolar için CRUD işlemleri.

**Özellikler:**
- Proje ekleme/düzenleme/silme
- Logo ekleme/düzenleme/silme
- Sürükle-bırak sıralama
- Görsel yükleme
- İçerik bloğu yönetimi

---

## Veritabanı Şeması

### Projects Tablosu

```sql
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  client text NOT NULL,
  date date NOT NULL,
  cover_image_url text NOT NULL,
  gallery jsonb DEFAULT '[]'::jsonb,
  content_body text,
  roles text[] DEFAULT '{}'::text[],
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Logos Tablosu

```sql
CREATE TABLE public.logos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  url text NOT NULL,
  website_url text,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---

## Tip Tanımlamaları

### Project
```typescript
interface Project {
  id: string;
  title: string;
  slug: string;
  client: string;
  date: string;
  cover_image_url: string;
  gallery?: string[];
  content_body?: string;
  roles: string[];
  sort_order?: number;
  content_blocks?: ContentBlock[];
}
```

### ContentBlock
```typescript
interface ContentBlock {
  id: string;
  type: 'text' | 'image';
  title?: string;
  value: string;
}
```

### Logo
```typescript
interface Logo {
  id: string;
  url: string;
  name: string;
  website_url?: string;
  sort_order?: number;
}
```

---

## CSS Değişkenleri

```css
:root {
  --bg-color: #030303;
  --text-primary: #F5F5F7;
  --text-secondary: #86868B;
  --border-color: #1D1D1F;
  --accent-color: #FFFFFF;
  --font-mono: 'Mona Sans', sans-serif;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --spacing-xl: 4rem;
  --spacing-xxl: 8rem;
}
```

---

## Kurulum

### 1. Bağımlılıkları Yükleyin
```bash
cd portfolio-site
npm install
```

### 2. Çevre Değişkenlerini Ayarlayın
`.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Veritabanını Yapılandırın
Supabase SQL editöründe `supabase_schema.sql` dosyasını çalıştırın.

### 4. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

---

## Özel Efektler

### ShinyText
Metin üzerinde parlama efekti oluşturan bileşen. CSS gradient ve Framer Motion kullanılarak yapılmıştır.

### DecryptedText
Rastgele karakterlerle şifreleme efekti uygulayan bileşen. Hover veya tıklama ile metni çözer.

### ParticleSwarm (AuraHero)
Three.js instanced mesh kullanarak oluşturulan 3D parçacık sistemi. Fresnel efekti ve bloom post-processing içerir.

---

## Güvenlik

- Row Level Security (RLS) etkin
- Public SELECT politikaları
- Authenticated kullanıcılar için INSERT/UPDATE/DELETE politikaları

---

## Performans İpuçları

1. **Görseller**: WebP formatı kullanın ve sıkıştırın
2. **3D Efektler**: AuraHero'daki parçacık sayısını azaltabilirsiniz
3. **Code Splitting**: React.lazy() kullanarak sayfaları ayırabilirsiniz
4. **Lazy Loading**: Görseller için lazy loading uygulayın

---

## Gelecek Geliştirmeler

- Blog/eğitim yazıları bölümü
- İletişim formu entegrasyonu
- Dark/Light mode toggle
- Çeviri desteği (i18n)
- PWA desteği

---

## Lisans

Tüm hakları Mahmut Elipek'e aittir. © 2026
