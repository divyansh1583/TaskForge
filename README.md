# TaskForge - Production-Grade Task Management Platform

A full-stack web application built with .NET 8 and Angular 18 using Clean Architecture principles.

## 📁 Project Structure

```
TaskForge/
├── src/                           # Backend (.NET 8)
│   ├── TaskForge.Domain/          # Domain entities, constants, interfaces
│   ├── TaskForge.Application/     # Business logic, DTOs, validators
│   ├── TaskForge.Infrastructure/  # Data access, external services
│   └── TaskForge.API/             # REST API controllers, middleware
├── client/                        # Frontend (Angular 18)
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/              # Services, guards, interceptors
│   │   │   ├── features/          # Feature modules (auth, dashboard)
│   │   │   └── shared/            # Shared components, pipes, directives
│   │   └── environments/          # Environment configurations
│   └── ...
└── TaskForge.sln                  # Solution file
```

## 🚀 Phase 1 Features

### Backend
- ✅ Clean Architecture with 4 layers
- ✅ ASP.NET Core Identity with JWT authentication
- ✅ Role-based authorization (Admin, Manager, Member)
- ✅ Refresh token support
- ✅ FluentValidation for request validation
- ✅ Global exception handling
- ✅ Serilog logging
- ✅ Swagger documentation
- ✅ CORS configuration

### Frontend
- ✅ Angular 18 with standalone components
- ✅ Tailwind CSS styling
- ✅ Reactive forms with validation
- ✅ JWT interceptor with auto-refresh
- ✅ Route guards (auth & guest)
- ✅ Role-based UI rendering
- ✅ Responsive design

## 🛠️ Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/sql-server) (LocalDB, Express, or full)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

## 🏃 Getting Started

### Backend Setup

1. **Navigate to the solution directory:**
   ```bash
   cd C:\Projects\TaskForge
   ```

2. **Restore NuGet packages:**
   ```bash
   dotnet restore
   ```

3. **Update the connection string** in `src/TaskForge.API/appsettings.Development.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=TaskForgeDb_Dev;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
     }
   }
   ```

4. **Apply database migrations:**
   ```bash
   cd src/TaskForge.API
   dotnet ef migrations add InitialCreate --project ../TaskForge.Infrastructure
   dotnet ef database update --project ../TaskForge.Infrastructure
   ```

5. **Run the API:**
   ```bash
   dotnet run
   ```

   The API will be available at:
   - HTTPS: https://localhost:7001
   - Swagger: https://localhost:7001/swagger

### Frontend Setup

1. **Navigate to the client directory:**
   ```bash
   cd C:\Projects\TaskForge\client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   ng serve
   ```

   The app will be available at: http://localhost:4200

## 🔑 Default Credentials

After running the application, the following user is seeded:

| Email | Password | Role |
|-------|----------|------|
| admin@taskforge.com | Admin@123456 | Admin |

## 📡 API Endpoints (Phase 1)

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/revoke-token` | Logout (revoke refresh token) |
| GET | `/api/auth/me` | Get current user info |

### Request/Response Examples

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password@123",
  "confirmPassword": "Password@123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password@123"
}
```

#### Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "accessTokenExpiration": "2026-01-15T12:30:00Z",
  "user": {
    "id": "guid-here",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "roles": ["Member"],
    "isActive": true,
    "createdAt": "2026-01-15T12:00:00Z"
  }
}
```

## 🏗️ Architecture Decisions

### Why Clean Architecture?
- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Business logic is isolated and easily testable
- **Maintainability**: Changes in one layer don't ripple through others
- **Framework Independence**: Core business logic doesn't depend on frameworks

### Why Signals instead of NgRx?
- **Simplicity**: For this application size, NgRx adds unnecessary complexity
- **Built-in**: Angular signals are native and well-optimized
- **Less Boilerplate**: Direct state management without actions/reducers
- **RxJS Integration**: Still using RxJS for async operations

### Why FluentValidation?
- **Cleaner Code**: Validation rules are separate from DTOs
- **Testable**: Validators can be unit tested independently
- **Flexible**: Complex validation scenarios are easier to implement
- **Better Messages**: More control over error messages

### Why JWT with Refresh Tokens?
- **Stateless**: Server doesn't need to store session data
- **Scalable**: Works well with load balancers
- **Security**: Short-lived access tokens minimize risk
- **UX**: Refresh tokens enable seamless session extension

## 📋 Phase Roadmap

| Phase | Features | Status |
|-------|----------|--------|
| 1 | Project Setup & Authentication | ✅ Complete |
| 2 | Projects & Teams Management | 🔜 Next |
| 3 | Task Management System | 📅 Planned |
| 4 | Advanced Behaviors (Notifications, Search) | 📅 Planned |
| 5 | Dashboard & Analytics | 📅 Planned |
| 6 | Production Readiness | 📅 Planned |

## 🧪 Testing

### Backend
```bash
cd src/TaskForge.API
dotnet test
```

### Frontend
```bash
cd client
ng test
```

## 📝 Environment Configuration

### Backend (`appsettings.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Your-Connection-String"
  },
  "JwtSettings": {
    "Secret": "YourSecretKeyAtLeast32Characters",
    "Issuer": "TaskForge",
    "Audience": "TaskForgeUsers",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7
  },
  "Cors": {
    "AllowedOrigins": "http://localhost:4200"
  }
}
```

### Frontend (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7001/api',
  tokenKey: 'taskforge_token',
  refreshTokenKey: 'taskforge_refresh_token',
  userKey: 'taskforge_user',
};
```

## 🔒 Security Considerations

1. **JWT Secret**: Use a strong, unique secret in production
2. **HTTPS**: Always use HTTPS in production
3. **Password Policy**: Enforces strong passwords
4. **Token Expiration**: Short-lived access tokens (15 min default)
5. **Refresh Token Rotation**: New refresh token on each refresh
6. **Soft Deletes**: User data is never permanently deleted
7. **Input Validation**: All inputs validated on both client and server

## 📄 License

MIT License - See LICENSE file for details.

---

**TaskForge** - Built with ❤️ using .NET 8 and Angular 18
