# مشروع Backend — Sowar Honey Store

هذا المستودع يحتوي على الـ backend لتطبيق متجر عسل "سوار" مبني بـ Spring Boot (Java 17).

قائمة التحقق (Checklist)
- تحديث/إنشاء ملف README هذا (تم)
- تعليمات التشغيل والبناء محلياً
- ملاحظات أمان وبيئة (JWT، uploads، CORS)
- روابط للـ API وSwagger

ملخص سريع
- حزمة الجافا الرئيسية: `com.sowar.store`
- ملف الدخول (main): `SowarHoneyStoreApplication.java`
- هيكل معماري متبع: controller → service → repository، DTOs تحت `dto/`، الكيانات تحت `entity/`.

المميزات الأساسية
- تسجيل وتسجيل دخول العملاء (بـ JWT)
- صلاحيات: عملاء و admins
- منتجات بفئات، صور متعددة، عروض، وتتبع المخزون
- سلة مشتريات، طلبات، طريقة دفع عند الاستلام (COD)
- مراجعات وأسئلة عن المنتج
- إدارة شحن حسب المحافظات
- تقارير مالية شهرية وسنوية

المتطلبات (Prerequisites)
- Java 17
- Maven
- PostgreSQL (قاعدة بيانات)

تشغيل المشروع محلياً
1. جهز قاعدة PostgreSQL وأنشئ قاعدة جديدة (مثال: `sowar_store`) أو استخدم الإعداد الافتراضي في `src/main/resources/application.yml`.
2. تأكد من ضبط إعدادات الاتصال في `application.yml` أو عبر متغيرات البيئة.
3. تشغيل في وضع التطوير (يوفر إعادة تحميل للمطورين):

```powershell
mvn spring-boot:run
```

أو تجميع ثم تشغيل الـ JAR (PowerShell):

```powershell
mvn -DskipTests package ; java -jar target/honey-store-0.0.1-SNAPSHOT.jar
```

مثال تشغيل مع متغيرات بيئة مطلوبة (PowerShell):

```powershell
$env:SOWAR_MAIL_HOST='smtp.example.com'; $env:app__jwt__secret='your-long-secret-should-be-very-long-and-random'; java -jar target/honey-store-0.0.1-SNAPSHOT.jar
```

توثيق API (Swagger)
- بعد التشغيل، واجهة Swagger متاحة عادة على:

```text
http://localhost:8080/swagger-ui.html
```

ملاحظات تكوين مهمة
- مفتاح JWT: الخاصية `app.jwt.secret` يجب أن تكون طويلة وعشوائية لأنها تُستخدم لإنشاء HMAC key. إذا كانت قصيرة سيخفق التوقيع.
- مجلد رفع الملفات: `app.upload-dir` (افتراضي `uploads/`). الملفات المرفوعة تُخزن وتُخدم عبر `StaticResourceConfig` على المسار `/uploads/**`.
- CORS: السماح لمواقع التطوير مثل `http://localhost:4200` مُعد في `config/CorsConfig.java`.
- الانتباه: في `application.yml` الخاص بالمشروع قيمة `spring.jpa.hibernate.ddl-auto` مُعطاة كـ `drop-and-create` — هذا سيحذف ويُعيد إنشاء الجداول عند كل تشغيل. لا تستخدم على قواعد بيانات إنتاجية.

أمن وصلاحيات
- نقاط الدخول العامة: `/api/auth/**`, `/uploads/**`, وواجهة Swagger.
- بعض GETs للمنتجات والفئات مُسموح بها للمجهولين (انظر `SecurityConfig.java`).
- مسارات الإدارة تحت `/api/admin/**` تتطلب دور `ADMIN`.
- الخدمة المسؤولة عن JWT: `security/JwtService.java`.

نقاط بداية مفيدة (أمثلة سريعة)
- تسجيل مستخدم: `POST /api/auth/register`
- تسجيل دخول: `POST /api/auth/login`
- الحصول على منتجات (مباشر): `GET /api/products`
- صفحة منتجات مفصّلة: `GET /api/products/page` (دعم البحث والفرز والصفحات)
- إنشاء طلب: `POST /api/orders`
- صفحات الإدارة (منتجات/فئات/طلبات): تحت `/api/admin/**`

البنية والملفات المهمة
- `src/main/java/com/sowar/store/controller` — Controllers (APIs)
- `src/main/java/com/sowar/store/service` — Business logic
- `src/main/java/com/sowar/store/repository` — Spring Data repositories
- `src/main/resources/application.yml` — إعدادات البيئة (DB, JWT, upload-dir, admin defaults)
- `config/AdminSeeder` — يقوم بإنشاء مستخدم أدمن عند التشغيل إن لم يكن موجودًا (مفيد للتطوير المحلي)

نصائح عند التطوير
- لا تقم بتغيير `application.yml` في البيئات الحية بدون مراجعة بسبب خيار `ddl-auto`.
- لا تُخزن أسرار (مثل `app.jwt.secret`) في المستودع؛ استخدم متغيرات البيئة لإعدادها في الإنتاج.
- عند الحاجة للتعامل مع الملفات المرفوعة، استخدم القيمة من `@Value("${app.upload-dir}")` بدلاً من hard-code.

دعم وملاحظات
- يحتوي المشروع على معالجات أخطاء مركزية في `common/GlobalExceptionHandler.java` ويستخدم أصناف `ApiException` و`ErrorCode` لردود منظمة عند الأخطاء.
- إن احتجت مساعدة إضافية أو تعديل README بلغني بما تريد تشديده (مثال: شرح إعداد البريد، خطوات اختبارات أو CI/CD).

الترخيص
- (اكتب هنا نوع الترخيص إن وُجد أو اترك هذا الجزء لمالك المشروع)

شكراً — بالتوفيق في التطوير!
