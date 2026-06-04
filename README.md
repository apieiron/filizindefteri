# Filiz'in Defteri — Filiz Gür | Hikayeler ve Denemeler

Bu proje, yazar **Filiz Gür**'ün hikayelerini ve denemelerini bir araya getiren modern, şık ve okuma odaklı bir web sitesidir. 

Site, tarayıcıda doğrudan çalışacak şekilde saf HTML, CSS ve JavaScript (Vanilla JS) kullanılarak tasarlanmıştır. Herhangi bir derleme (build) veya karmaşık kütüphane kurulumu gerektirmez. Bu sayede **GitHub Pages** ve **Cloudflare Pages** üzerinde sıfır konfigürasyon ile doğrudan yayınlanabilir.

---

## 🚀 Yerel Olarak Çalıştırma

Modern web tarayıcılarının güvenlik (CORS) politikaları nedeniyle, `stories.json` dosyasının okunabilmesi için sitenin bir yerel sunucu (localhost) üzerinden açılması gerekmektedir. Dosyayı doğrudan tarayıcıya sürükleyip bırakarak açtığınızda tarayıcınız veri yüklenmesini engelleyebilir.

Projeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki yöntemlerden birini seçebilirsiniz:

### Yöntem A: Python ile (En Pratik Yöntem)
Bilgisayarınızda Python yüklü ise, proje klasöründe terminali (PowerShell veya Komut İstemi) açıp şu komutu çalıştırın:
```bash
python -m http.server 8000
```
Ardından tarayıcınızda `http://localhost:8000` adresine gidin.

### Yöntem B: Node.js ile
Eğer Node.js kurulu ise, proje klasöründe şu komutla hızlıca bir sunucu ayağa kaldırabilirsiniz:
```bash
npx serve .
```
Ardından ekranda beliren adresi (genellikle `http://localhost:3000` veya `http://localhost:5000`) tarayıcınızda açın.

### Yöntem C: VS Code "Live Server" ile
Eğer VS Code editörünü kullanıyorsanız, **Live Server** eklentisini kurup projenin altındaki `index.html` dosyasına sağ tıklayarak **"Open with Live Server"** seçeneğini seçebilirsiniz.

---

## ✍️ Yeni Hikaye Ekleme ve Güncelleme

Sitedeki tüm hikayeler [stories.json](stories.json) dosyasında saklanmaktadır. Yeni bir yazı eklemek oldukça kolaydır:

1. `stories.json` dosyasını bir kod editörü veya metin belgesi düzenleyici (Not Defteri vb.) ile açın.
2. Dosyanın en sonuna gidin ve aşağıdaki şablona uygun şekilde yeni hikayenizi ekleyin:

```json
  {
    "id": "1.206",
    "title": "Hikayenin Başlığı",
    "date": "2026-06-04 10:00:00",
    "tags": [
      "Az",
      "Pişmiş",
      "aile",
      "hayatı"
    ],
    "content": "Hikaye veya deneme metniniz buraya gelecektir.\nParagraf geçişleri için yeni satır karakterlerini kullanabilirsiniz.\nÇift tırnak kullanmanız gereken yerlerde kaçış karakteri (\\\"örnek\\\") kullanmayı unutmayın.",
    "visible": 1
  }
```

> [!TIP]
> **Görünürlük (visible) Ayarı:**
> * JSON dosyasındaki her yazı için en sonda `"visible": 1` alanı yer alır.
> * Bir yazının listede görünmesini istemiyorsanız bu değeri `0` yapmanız yeterlidir. Yazı dosyadan silinmez fakat sitede listelenmez ve geçiş düğmelerinde atlanır.
> * Belirtilmezse (varsayılan olarak) veya `1` yapılırsa yazı listede görünür.

> [!TIP]
> **Etiketler (Tags) Hakkında:**
> Sitede etiketler akıllıca gruplandırılır. Eğer yan yana gelen kelimeler "Az" ve "Pişmiş" veya "aile" ve "hayatı" ise, site bunları otomatik olarak birleştirip tek bir etiket halinde ("Az Pişmiş", "Aile Hayatı") görüntüler. 

3. Dosyayı kaydedip tarayıcınızı yenilediğinizde veya sitenizi GitHub'a yüklediğinizde yeni yazınız anında yayına girecektir.

---

## 🌐 Cloudflare & GitHub Pages'ta Yayınlama

### GitHub Pages
1. Proje klasörünü bir Git deposu haline getirin ve GitHub'a yükleyin.
2. Deponun (Repository) **Settings** -> **Pages** ayarlarına gidin.
3. *Build and deployment* altındaki Source seçeneğini **"Deploy from a branch"** yapın.
4. Main/Master dalını (branch) seçip `/ (root)` seçeneğini belirleyin ve kaydedin.
5. Birkaç dakika içinde siteniz yayında olacaktır.

### Cloudflare Pages
1. Cloudflare Dashboard'a giriş yapın ve **Workers & Pages** menüsüne gidin.
2. **Create application** -> **Pages** -> **Connect to Git** adımlarını izleyin.
3. GitHub deposunu bağlayın.
4. Kurulum ayarlarında (Build settings):
   * **Framework preset**: `None / Static HTML` (Boş bırakın)
   * **Build command**: (Boş bırakın)
   * **Build output directory**: `/` (veya boş bırakın)
5. **Save and Deploy** butonuna tıklayın.

---

## 🎨 Tasarım Özellikleri

* **Özel Temalar:** Sağ üst köşedeki düğmeleri kullanarak 4 farklı renk modu (Mola, Gündüz, Gece, Sepya) arasında geçiş yapılabilir. Okuyucunun göz konforuna en uygun mod seçilebilir.
* **Boyut Ayarı:** `A+` ve `A-` butonları ile yazı boyutu kolayca büyütülebilir veya küçültülebilir.
* **Rastgele Hikaye:** Sol menünün en altındaki **"Bana bir hikaye seç"** butonu, 205 hikaye arasından tamamen rastgele bir hikaye seçerek ekrana getirir.
* **Gelişmiş Filtreleme ve Arama:** Sol taraftaki arama çubuğu ve popüler konu başlıkları ile hikayeler arasında milisaniyeler içinde arama yapılabilir.
* **Responsive Tasarım:** Site, cep telefonlarından ultra geniş ekranlara kadar her cihazla %100 uyumludur. Mobil cihazlarda sol menü açılır-kapanır bir çekmece (drawer) haline dönüşür.
