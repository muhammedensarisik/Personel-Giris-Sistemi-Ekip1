# Walkthrough: Temiz Mimari (Clean Architecture) ve Bileşen Bazlı Görünüm Yapılandırması

Bu çalışmada, uygulamanın kod kalitesini, sürdürülebilirliğini ve test edilebilirliğini artırmak amacıyla tüm kod tabanı **Temiz Mimari (Clean Architecture)** katmanlarına ve **Bileşen Bazlı Ekran/Widget** yapısına ayrılmıştır.

---

## Mimari Yapı ve Sorumluluklar

### 1. Domain Katmanı (İş Kuralları & Modeller)
En iç katmandır, harici hiçbir kütüphane veya veritabanı kütüphanesine bağımlılığı yoktur.
* **[Personnel.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/domain/entities/Personnel.js)**: Sistemdeki personelleri (`fullName`, `department`, `role`, `createdAt`, `status`) temsil eden entity sınıfı. İsimden avatar türetme ve tarih biçimlendirme gibi iş fonksiyonlerini içerir.
* **[EntryLog.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/domain/entities/EntryLog.js)**: Giriş/çıkış kart kayıtlarını temsil eden veri modeli.
* **[Overtime.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/domain/entities/Overtime.js)**: Fazla mesai verilerini temsil eden model.
* **[LeaveRequest.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/domain/entities/LeaveRequest.js)**: İzin taleplerini temsil eden model.

### 2. Data Katmanı (Veri Kaynakları & Depolar)
Veritabanı ve ağ isteklerini yöneten katmandır. Tamamen gerçek sunucu uç noktalarına (endpoints) bağımlıdır.
* **[ApiService.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/data/sources/ApiService.js)**: Base URL `http://localhost:5168` olarak ayarlanan, hata yönetimini try/catch blokları ile kendi içerisinde ele alan HTTP istemci sınıfı.
* **[PersonnelRepository.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/data/repositories/PersonnelRepository.js)**: `/api/personnel`, `/api/attendance`, `/api/overtime` ve `/api/leaverequest` endpoints'lerine istek atan ve gelen JSON verilerini (`userId`, `leaveType`, `startDate`, `endDate`, `status`) birebir map'leyen veri deposu sınıfı. **Bütün sahte (mock) veri simülasyonları ve fallback mantıkları bu katmandan tamamen kazınmıştır.**

### 3. Presentation Katmanı (Arayüz & Kontrolörler)
Kullanıcı arayüzünü parçalı widget'lar ve bağımsız ekranlar şeklinde yönetir.
* **Layout Sınıfları**:
  * **[Sidebar.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/presentation/layout/Sidebar.js)**: Sol gezinme menüsünün seçim durumlarını ve mobil çekmece açılışını yönetir.
  * **[Header.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/presentation/layout/Header.js)**: Dark mode geçişini, profil popover menülerini ve bildirim rozetlerini kontrol eder. Üst aramalar kaldırılmıştır.
* **Ekran Sınıfları (Screens)**:
  * **[DashboardScreen.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/presentation/screens/DashboardScreen.js)**: İlgili istatistik, grafik ve tablo parçalarını birleştiren ekran. Tatil günlerinde "Bugün Gelen" ve "Geç Kalan" alanlarında `— (Tatil)` ifadesini gösterecek kontroller eklendi.
  * **[PersonnelScreen.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/presentation/screens/PersonnelScreen.js)**: Arama filtre barını ve personel listesini koordine eder.
  * **[LogsScreen.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/presentation/screens/LogsScreen.js)**: Giriş/çıkış Data Table (Veri Tablosu) ekranı.
  * **[OvertimeScreen.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/presentation/screens/OvertimeScreen.js)**: Fazla mesailerin listelendiği ana ekran yöneticisi.
  * **[LeaveScreen.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/presentation/screens/LeaveScreen.js)**: İzin taleplerinin onay durumlarını listeleyen ana ekran yöneticisi.
  * **[ReportsScreen.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/presentation/screens/ReportsScreen.js)**: Analitik raporlar ve departman grafiklerini barındırır.
* **Parçalar (Widgets)**:
  * **[StatsWidget.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/presentation/widgets/dashboard/StatsWidget.js)**: 4 adet durum kartını çizer. Tatil tespiti yapar.
  * **[ChartWidget.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/presentation/widgets/dashboard/ChartWidget.js)**: Trend çizgi grafiğini çizer.
  * **[RecentLogsTableWidget.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/presentation/widgets/dashboard/RecentLogsTableWidget.js)**: Bugün gelen son 5 kişiyi listeler (Giriş/çıkış entegrasyonu destekli).
  * **[FilterBarWidget.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/presentation/widgets/personnel/FilterBarWidget.js)**: İsim/departman filtresini dinler.
  * **[PersonnelTableWidget.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/presentation/widgets/personnel/PersonnelTableWidget.js)**: `fullName` ve backend kolonlarıyla eşleşen personel tablosunu çizer.
  * **[AttendanceFilterWidget.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/presentation/widgets/logs/AttendanceFilterWidget.js)**: Tarih seçiciyi ve hızlı durum filtrelerini yönetir.
  * **[AttendanceTableWidget.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/presentation/widgets/logs/AttendanceTableWidget.js)**: Giriş/çıkış zamanlarını, departmanları ve durum rozetlerini barındıran tabloyu oluşturur.
  * **[AttendanceDetailModal.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/presentation/widgets/logs/AttendanceDetailModal.js)**: "Detay" butonu popup bileşeni.
  * **[OvertimeTableWidget.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/presentation/widgets/overtime/OvertimeTableWidget.js)**: Fazla mesaileri `userId` eşleşmesiyle listeler.
  * **[LeaveTableWidget.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/presentation/widgets/leave/LeaveTableWidget.js)**: İzin taleplerini `userId` eşleşmesiyle listeler.

### 4. Ana Giriş Noktası, Giriş Ekranı & Güvenlik (Route Guard)
* **[app.js](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/app.js)**: Uygulamanın başlatıcısı. 
  * `localStorage` içerisinde `currentUser` arayarak **Route Guard (Sayfa Giriş Koruması)** sağlar. Giriş yapılmamışsa kullanıcıyı otomatik olarak Login formuna yönlendirir.
  * `POST /api/auth/login` isteğini yöneten `handleLogin` metodunu barındırır.
  * `handleLogout()` metodu ile `currentUser` verilerini temizleyip güvenli çıkış sağlar.
  * Başarılı giriş sonrasında isim, rol ve avatar baş harflerini tüm arayüz genelinde dinamik olarak doldurur.
* **[index.html](file:///C:/Users/ramde/OneDrive/Masaüstü/admin-panel-skeleton/index.html)**: 
  * Şık, modern, responsive ve koyu temayla uyumlu giriş kartı arayüzü (`#login-layout`) eklendi.
  * Panel içeriği `#app-layout` kapsayıcısına alınarak yetkisiz erişimler engellendi.
  * Profil menüsündeki "Güvenli Çıkış" butonu `handleLogout()` fonksiyonuna bağlandı.

---

## Nasıl Test Edilir?

Local sunucu Windows sisteminizde çalıştırılmıştır:
```bash
http://localhost:8081
```

Bu bağlantıya tarayıcınızdan giderek:
1. Eğer giriş yapmadıysanız, doğrudan şık ve modern **Giriş Yap** ekranıyla karşılaştığınızı doğrulayın.
2. Formu doldurup giriş yapın. Hatalı şifre girildiğinde kırmızı uyarıyı, başarılı giriş yapıldığında ise panelin açıldığını test edin.
3. Giriş sonrası sol alt profil alanında ve sağ üst dropdown alanında ad-soyad, rol ve isim baş harflerinizin (avatar) dinamik olarak yerleştiğini kontrol edin.
4. Profil menüsünden **"Güvenli Çıkış"** butonuna basarak güvenle çıkış yapılabildiğini test edin.
