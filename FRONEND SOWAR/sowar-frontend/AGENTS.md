 # AGENTS.md — Project guidance for AI coding agents

Purpose: give an AI agent the minimal, actionable knowledge to be immediately productive in this Spring Boot project.

Quick start (build & run)
- Build: `mvn -DskipTests package` (project root contains `pom.xml` with Spring Boot 3.3.5 and Java 17).
- Run (PowerShell example with required env vars):
  $env:SOWAR_MAIL_HOST='smtp.example.com'; $env:app__jwt__secret='your-long-secret'; java -jar target/honey-store-0.0.1-SNAPSHOT.jar
- Dev run: `mvn spring-boot:run` (uses `src/main/resources/application.yml`).

Big-picture architecture
- Spring Boot monolith, package root `com.sowar.store` (main class: `SowarHoneyStoreApplication.java`).
- Layering convention: `controller` → `service` → `repository` with DTOs in `dto` and persistence in `entity`.
- Controllers live under `controller/*` (public APIs in `PublicCatalogController`, auth in `AuthController`, admin under `/api/admin/**`).
- Services encapsulate business logic; controllers call service methods that return DTOs (e.g. `CatalogService` returns `ProductResponse`, `PageResponse`).
- Data flow: controllers accept DTOs, services use repositories to access `entity` objects, map to DTOs for responses.

Security & auth
- JWT-based stateless security set up in `security/SecurityConfig.java` and `security/JwtAuthenticationFilter.java`.
- Token generation/parsing: `security/JwtService.java` (uses `app.jwt.secret` and `app.jwt.expiration-minutes` from `application.yml`).
- Principal: `security/CurrentUser` record is stored as Authentication principal — services often expect `CurrentUser`.
- Open endpoints: `/api/auth/**`, `/uploads/**`, Swagger UI (`/swagger-ui.html`), certain GETs for `/api/products/**` and `/api/categories/**` are permitted to anonymous users (see `SecurityConfig` request matchers).
- Admin: endpoints under `/api/admin/**` require role `ADMIN`.

Configuration & environment
- `src/main/resources/application.yml` defines defaults (Postgres JDBC URL, `app.upload-dir`, `app.jwt.secret`, admin defaults). Important keys:
  - `app.jwt.secret` — MUST be a sufficiently long random secret (used with jjwt Keys.hmacShaKeyFor).
  - `app.upload-dir` — defaults to `uploads` and is served at `/uploads/**` via `StaticResourceConfig`.
  - `spring.jpa.hibernate.ddl-auto` is `drop-and-create` (destructive) — dev convenience; be careful when running against real DB.
- Environment variable patterns: many properties accept `SOWAR_*` overrides (see `application.yml`).

Static files & uploads
- Uploaded files are stored in the `uploads/` directory in project root (examples already present) and served via `StaticResourceConfig`.
- CORS is configured to allow `http://localhost:4200` and `http://127.0.0.1:4200` for `/api/**` and `/uploads/**` in `config/CorsConfig.java`.

Startup behavior & seeds
- `config/AdminSeeder` runs on startup and creates an admin user if missing using `app.admin.*` config values. Useful for local testing.

API docs
- OpenAPI/Swagger available at `/swagger-ui.html` (dependency: `springdoc-openapi-starter-webmvc-ui` in `pom.xml`).

Error handling conventions
- Centralized error handling via `common/GlobalExceptionHandler.java`.
- The project uses domain-specific `ApiException` and `ErrorCode` for structured error responses — agent should construct or translate exceptions into those when adding new controllers or services.

Patterns and conventions specific to this repo
- DTO-first controllers: controller methods typically accept DTOs (`dto.*`) and return DTOs or `PageResponse<T>` instead of entities.
- Service method names are descriptive and carry intent (e.g., `searchPublicProductsPage`, `askQuestion`, `listProductQuestions`). Use existing service names as templates.
- Security principal usage: if a controller method needs the current user, it receives `@AuthenticationPrincipal CurrentUser currentUser` (see `PublicCatalogController#askQuestion`).
- Static resources: never hardcode upload paths; use `@Value("${app.upload-dir}")` or `StaticResourceConfig` resolution.

Integration points & external systems
- Postgres (JDBC driver included). Default URL: `jdbc:postgresql://localhost:5432/Sowar` (credentials in `application.yml`).
- SMTP mail (Spring Boot mail starter) — controlled via `SOWAR_MAIL_*` environment variables.
- JWT library: `io.jsonwebtoken` (jjwt) — token signing and parsing must use the configured secret and correct API (`JwtService`).

Common pitfalls for agents modifying code
- Changing `application.yml` defaults affects dev DB and may drop data (due to `ddl-auto: drop-and-create`).
- JWT secret must be long enough for HMAC key creation; tests or local runs will fail with invalid key length.
- Uploaded files in `uploads/` are referenced by path; moving them requires updating `StaticResourceConfig` and possibly existing DB references.
- CORS is intentionally permissive for localhost 4200; adjust when adding new frontends.

Useful files to inspect when making changes
- `pom.xml` — dependency versions and build plugin.
- `src/main/resources/application.yml` — environment and runtime defaults.
- `src/main/java/com/sowar/store/security/*` — authentication and token handling.
- `src/main/java/com/sowar/store/config/*` — CORS, static resources, admin seeder.
- `src/main/java/com/sowar/store/controller/*` — example request/response patterns.
- `src/main/java/com/sowar/store/common/*` — exception handling and error codes.

If you need to modify behavior
- For API changes: add new DTOs under `dto/`, implement business logic in a service, then expose via controller. Follow existing method naming and response shapes.
- For database changes: update `entity/`, create repository methods, add migrations (project currently relies on hibernate `ddl-auto` — consider switching to a migration tool before changing schema for real deployments).

Contact points for human maintainers
- Admin email default is `app.admin.email` in `application.yml`. For urgent environment questions, check README.md.

---

This document is intentionally concise; reference the listed files above for examples and to preserve consistency.

