# 🍯 Sowar Honey Store - Full Stack Application

تطبيق متجر عسل Sowar - تطبيق متكامل للتجارة الإلكترونية لبيع المنتجات الطبيعية

---

## 📋 نظرة عامة على المشروع

**Sowar Honey Store** هو تطبيق تجارة إلكترونية متكامل مكتوب بأحدث التقنيات:
- **Frontend**: Angular 19.2 مع TypeScript و SCSS
- **Backend**: Spring Boot 3.3.5 مع Java 17
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI

---

## 🚀 المتطلبات

### متطلبات الفرونتند:
- Node.js 18+ 
- npm 9+
- Angular CLI 19+

### متطلبات الباكند:
- Java 17+
- Maven 3.8+
- PostgreSQL 12+

---

## 🛠️ التثبيت والإعداد

### 1️⃣ الفرونتند (Frontend) - Angular

#### التثبيت:
```bash
# دخول مجلد المشروع
cd sowar-frontend

# تثبيت المكتبات
npm install
```

#### تشغيل الخادم المحلي:
```bash
npm start
# أو
ng serve
```
التطبيق سيكون متاحاً على: `http://localhost:4200`

#### البناء للإنتاج:
```bash
npm run build
# أو
ng build --configuration production
```

#### تشغيل الاختبارات:
```bash
npm test
# أو
ng test
```

#### المراقبة والتطوير:
```bash
npm run watch
# أو
ng build --watch --configuration development
```

---

### 2️⃣ الباكند (Backend) - Spring Boot

#### التثبيت والبناء:
```bash
# بناء المشروع باستخدام Maven
mvn clean install

# أو فقط الترجمة بدون الاختبارات
mvn clean install -DskipTests
```

#### تشغيل الخادم:
```bash
# تشغيل التطبيق
mvn spring-boot:run

# أو بعد بناء الـ JAR
java -jar target/honey-store-0.0.1-SNAPSHOT.jar
```

الخادم سيكون متاحاً على: `http://localhost:8080`

#### الوثائق (API Documentation):
بعد تشغيل الخادم، الوثائق متاحة على:
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **API Docs**: `http://localhost:8080/v3/api-docs`

---

## 📁 هيكل المشروع

```
sowar-frontend/
├── src/
│   ├── app/
│   │   ├── core/              # الخدمات الأساسية
│   │   │   ├── api.service.ts       # خدمة الـ API
│   │   │   ├── auth.service.ts      # خدمة المصادقة
│   │   │   ├── auth.guard.ts        # حماية المسارات
│   │   │   ├── auth.interceptor.ts  # معالج المصادقة
│   │   │   ├── error.interceptor.ts # معالج الأخطاء
│   │   │   ├── toast.service.ts     # خدمة التنبيهات
│   │   │   └── models.ts            # نماذج البيانات
│   │   │
│   │   ├── pages/             # المكونات/الصفحات
│   │   │   ├── home.component.ts
│   │   │   ├── products.component.ts
│   │   │   ├── product-details.component.ts
│   │   │   ├── cart.component.ts
│   │   │   ├── checkout.component.ts
│   │   │   ├── orders.component.ts
│   │   │   ├── order-details.component.ts
│   │   │   ├── login.component.ts
│   │   │   ├── register.component.ts
│   │   │   ├── profile.component.ts
│   │   │   ├── wishlist.component.ts
│   │   │   ├── logout.component.ts
│   │   │   ├── admin-dashboard.component.ts
│   │   │   ├── admin-products.component.ts
│   │   │   └── admin-order-details.component.ts
│   │   │
│   │   ├── shared/            # المكونات المشتركة
│   │   │   └── product-card.component.ts
│   │   │
│   │   ├── app.config.ts      # إعدادات التطبيق
│   │   ├── app.routes.ts      # التوجيه (Routing)
│   │   └── app.component.ts   # المكون الرئيسي
│   │
│   ├── styles/                # الأنماط
│   │   ├── styles.scss
│   │   ├── styles-admin-theme.scss
│   │   ├── styles-client-theme.scss
│   │   └── styles-premium.scss
│   │
│   ├── main.ts                # نقطة الدخول
│   └── index.html             # الصفحة الرئيسية
│
├── public/
│   └── favicon.ico
├── angular.json               # إعدادات Angular
├── tsconfig.json             # إعدادات TypeScript
├── package.json              # المكتبات والنصوص
└── pom.xml                   # إعدادات Maven (للباكند)
```

---

## 🔐 المصادقة (Authentication)

التطبيق يستخدم **JWT (JSON Web Tokens)** للمصادقة:

- عند تسجيل الدخول، يتم الحصول على Token
- يتم حفظ Token في `localStorage` أو `sessionStorage`
- يتم إرسال Token في كل طلب API في رأس `Authorization: Bearer <token>`
- رمز الدخول ينتهي بعد فترة زمنية محددة

### الخدمات ذات الصلة:
- `auth.service.ts` - إدارة المصادقة
- `auth.guard.ts` - حماية المسارات المحظورة
- `auth.interceptor.ts` - إضافة Token تلقائياً لكل طلب

---

## 🎨 المظاهر (Themes)

التطبيق يدعم عدة مظاهر:
- **Admin Theme** - لوحة تحكم الإدارة
- **Client Theme** - واجهة العميل العادي
- **Premium Theme** - ميزات إضافية للعملاء المميزين

---

## 📦 المكتبات الرئيسية

### Frontend:
```json
{
  "@angular/core": "^19.2.0",
  "@angular/forms": "^19.2.0",
  "@angular/router": "^19.2.0",
  "@angular/common": "^19.2.0",
  "rxjs": "~7.8.0",
  "typescript": "~5.7.2"
}
```

### Backend:
```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
  <dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
  </dependency>
  <dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
  </dependency>
</dependencies>
```

---

## 📧 البريد الإلكتروني

يتم استخدام `spring-boot-starter-mail` لإرسال رسائل بريد إلكترونية:
- تأكيد التسجيل
- استعادة كلمة المرور
- إشعارات الطلبيات

---

## 🧪 الاختبارات

### Karma و Jasmine:
```bash
# تشغيل الاختبارات
npm test

# توليد تقرير التغطية
ng test --code-coverage
```

---

## 🔄 واجهة برمجية (API)

### نقاط النهاية الرئيسية:

#### المصادقة:
- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/login` - تسجيل الدخول

#### المنتجات:
- `GET /api/products` - الحصول على قائمة المنتجات
- `GET /api/products/{id}` - تفاصيل منتج واحد
- `POST /api/products` - إضافة منتج جديد (Admin)
- `PUT /api/products/{id}` - تحديث منتج (Admin)
- `DELETE /api/products/{id}` - حذف منتج (Admin)

#### الطلبيات:
- `GET /api/orders` - قائمة طلبياتي
- `GET /api/orders/{id}` - تفاصيل طلب واحد
- `POST /api/orders` - إنشاء طلب جديد

#### سلة التسوق:
- `GET /api/cart` - محتويات السلة
- `POST /api/cart` - إضافة منتج للسلة
- `DELETE /api/cart/{id}` - حذف منتج من السلة

---

## 🗄️ قاعدة البيانات

قاعدة البيانات **PostgreSQL** تحتوي على:
- **Users Table** - بيانات المستخدمين
- **Products Table** - المنتجات والعسل
- **Orders Table** - الطلبيات
- **Cart Items Table** - عناصر السلة
- **Wishlist Table** - قائمة المفضلة
- وجداول أخرى للدعم

---

## 📝 ملاحظات مهمة

1. **الملفات المرفوعة**: يتم حفظ صور المنتجات في مجلد `uploads/`
2. **الإنتاج**: تأكد من تغيير جميع بيانات الاتصال والأسرار قبل النشر
3. **CORS**: تم تكوينه للسماح بالطلبات من الفرونتند
4. **الأمان**: استخدم HTTPS في الإنتاج

---

## 🚀 النشر (Deployment)

### الفرونتند:
```bash
# بناء للإنتاج
ng build --configuration production

# سيتم إنشاء مجلد dist/sowar-frontend بالملفات الجاهزة
# يمكن رفعها على أي خادم ويب (Nginx, Apache, AWS S3, إلخ)
```

### الباكند:
```bash
# بناء JAR
mvn clean install

# تشغيل على السيرفر
java -jar target/honey-store-0.0.1-SNAPSHOT.jar
```

---

## 🐛 استكشاف الأخطاء

### مشاكل شائعة:

**خطأ "Port 4200 already in use"**
```bash
ng serve --port 4300
```

**خطأ CORS**
- تأكد من تكوين CORS في الباكند
- تحقق من رابط API الصحيح

**خطأ المصادقة**
- تأكد من حفظ الـ Token بشكل صحيح
- تحقق من صلاحية الـ Token

---

## 📞 التواصل والدعم

للمزيد من المعلومات أو الإبلاغ عن مشاكل:
- البريد الإلكتروني: support@sowar.com
- الموقع: www.sowar.com

---

## 📄 الترخيص

جميع الحقوق محفوظة © 2024 Sowar Honey Store

---

## 👥 المساهمون

تم تطوير هذا المشروع بواسطة فريق Sowar للتطوير

---

**آخر تحديث**: يونيو 2024
