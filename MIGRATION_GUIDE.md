# Critical Issues Migration Guide

This document outlines the critical issues that were fixed and how to use the new patterns.

## 🚨 Issues Fixed

### 1. Route Organization Fixed
- **Problem**: Business logic routes were mixed with UI demo routes
- **Solution**: Separated into `businessRoutes` and `uiRoutes`
- **Impact**: Better code organization and maintainability

### 2. Duplicate Route Removed
- **Problem**: `/menu/dashboard` was defined twice
- **Solution**: Removed duplicate definition from `uiRoutes`
- **Impact**: Prevents routing conflicts

### 3. Duplicate Services Folder Removed
- **Problem**: Both `services/` and `servicios/` folders existed
- **Solution**: Removed `services/` folder, kept `servicios/`
- **Impact**: Eliminates confusion and maintains Spanish naming convention

### 4. Centralized API Client
- **Problem**: Inconsistent API calling patterns across service providers
- **Solution**: Created centralized `apiClient` with standardized error handling
- **File**: `src/helpers/apiClient.ts`

### 5. Global Error Handling
- **Problem**: No consistent error handling across the application
- **Solution**: Added `ErrorBoundary` component and error handling utilities
- **Files**: 
  - `src/components/ErrorBoundary.tsx`
  - `src/utils/errorHandler.ts`

### 6. Environment Configuration
- **Problem**: Hardcoded configuration values
- **Solution**: Added proper environment configuration system
- **Files**:
  - `src/configs/environment.ts`
  - `.env.example`

### 7. Bundle Optimization
- **Problem**: No bundle optimization configured
- **Solution**: Added chunk splitting and optimization to `vite.config.ts`

### 8. **NEW: Session Expiration Handling** ✨
- **Problem**: No automatic logout when JWT tokens expire
- **Solution**: Implemented comprehensive session management with automatic logout
- **Files**:
  - `src/utils/tokenUtils.ts` - JWT token utilities
  - `src/utils/sessionManager.ts` - Session monitoring service
  - `src/components/SessionStatus.tsx` - Session status component
  - Enhanced `src/helpers/apiClient.ts` - Automatic 401 handling
  - Enhanced `src/context/useAuthContext.tsx` - Session expiration warnings
  - `src/servicios/usuarioService.new.ts` - Example with session handling

## 🔧 How to Use New Patterns

### Using the New API Client

```typescript
// OLD WAY (inconsistent)
const response = await fetch(`${API_URL}usuarios`, {
  headers: { "Authorization": `Bearer ${token}` }
});
const data = await response.json();

// NEW WAY (standardized with session handling)
import apiClient from '@/helpers/apiClient';

const response = await apiClient.get<Usuario[]>('usuarios');
const users = response.data;
```

### Using Error Handling

```typescript
// OLD WAY
try {
  const data = await fetchUsers();
} catch (error) {
  console.error(error);
  Swal.fire('Error', 'Something went wrong', 'error');
}

// NEW WAY
import { handleError } from '@/utils/errorHandler';

try {
  const data = await fetchUsers();
} catch (error) {
  handleError(error, { 
    context: 'UserComponent.loadUsers',
    display: true,
    displayOptions: { title: 'Error al cargar usuarios' }
  });
}
```

### Service Provider Pattern

See `src/servicios/usuarioService.new.ts` for the recommended pattern with session handling:

```typescript
class UsuarioService {
  private static readonly ENDPOINT_BASE = 'usuarios';

  static async fetchAll(): Promise<Usuario[]> {
    try {
      const response = await apiClient.get<Usuario[]>(this.ENDPOINT_BASE);
      return response.data || [];
    } catch (error) {
      handleError(error, { context: 'UsuarioService.fetchAll' });
      return [];
    }
  }
}
```

### Session Expiration Handling ✨

The new session management automatically:

- **Validates tokens** before each API request
- **Shows warnings** when session is about to expire (5 minutes before)
- **Automatically logs out** when token expires
- **Handles 401 responses** from the server

```typescript
// Import session utilities
import { isTokenExpired, getTimeUntilExpiration } from '@/utils/tokenUtils';
import { sessionManager } from '@/utils/sessionManager';

// Check if current session is valid
const isValid = sessionManager.isSessionValid();

// Get session information
const sessionInfo = sessionManager.getSessionInfo();
console.log(sessionInfo.state); // 'valid', 'expiring-soon', 'expired', or 'invalid'
```

### Session Status Component

Add session status to your layout:

```tsx
import SessionStatus from '@/components/SessionStatus';

function Layout() {
  return (
    <div>
      <nav>
        <SessionStatus showTimeLeft={true} />
      </nav>
      {/* rest of layout */}
    </div>
  );
}
```

## 📋 Migration Checklist

### Immediate Actions Completed ✅
- [x] Fixed route duplication
- [x] Removed duplicate services folder
- [x] Added global error boundary
- [x] Created centralized API client
- [x] Added environment configuration
- [x] Optimized Vite configuration
- [x] **NEW: Implemented session expiration handling**

### Next Steps for Team
- [ ] Migrate existing service providers to use new API client pattern
- [ ] Update components to use new error handling utilities
- [ ] Add environment variables to deployment configuration
- [ ] Test error boundary with different error scenarios
- [ ] Update documentation for new patterns
- [ ] **NEW: Add SessionStatus component to main layout**
- [ ] **NEW: Test session expiration scenarios**

## 🛡️ Error Boundary Usage

The error boundary is now automatically applied to the entire app. For specific components that need custom error handling:

```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

function MyComponent() {
  return (
    <ErrorBoundary fallback={<div>Custom error UI</div>}>
      <VolatileComponent />
    </ErrorBoundary>
  );
}
```

## 📊 Performance Improvements

The new Vite configuration includes:
- **Chunk splitting**: Separates vendor, UI, and business logic code
- **Source maps**: For better debugging in production
- **Optimized imports**: Reduces bundle size
- **Development server**: Better DX with auto-reload

## 🔐 Environment Configuration

Create `.env.local` based on `.env.example`:

```bash
VITE_API_URL=https://iso.transexpress.com.gt/webservice/api/
VITE_APP_ENV=development
VITE_DEBUG=true
```

## 📞 Support

If you encounter issues with the migration:
1. Check the console for detailed error logs
2. Refer to the example service provider pattern
3. Use the new error handling utilities
4. Test with the error boundary fallback UI

The new patterns provide:
- **Better error handling**: Consistent user experience
- **Improved maintainability**: Standardized API patterns  
- **Enhanced performance**: Optimized bundles
- **Better developer experience**: Clearer error messages and debugging
- **🆕 Automatic session management**: JWT token validation and auto-logout
- **🆕 User-friendly session warnings**: Proactive session expiration alerts
- **🆕 Secure authentication flow**: Automatic handling of expired tokens

## 🔐 Session Management Features

### Automatic Token Validation
- Validates JWT tokens before each API request
- Checks token expiration using proper JWT decoding
- Prevents requests with expired tokens

### Session Expiration Warnings
- Shows warning dialog 5 minutes before token expires
- Gives users option to extend session or logout
- Countdown timer shows remaining time

### Automatic Logout
- Triggers logout when token expires
- Handles 401 responses from server
- Shows user-friendly expiration message

### Session Monitoring
- Real-time session status component
- Visual indicators for session state
- Optional time remaining display

### Testing Session Expiration

To test the session expiration functionality:

1. **Manual Testing**: 
   - Login to the application
   - Use browser dev tools to modify the JWT token expiration
   - Trigger an API call to see automatic logout

2. **Time-based Testing**:
   - Set a short-lived JWT token on the server
   - Wait for the warning dialog to appear
   - Test both "extend" and "logout" options

3. **401 Response Testing**:
   - Configure server to return 401 for specific requests
   - Verify automatic logout behavior

## 🔧 Implementation Notes

### JWT Token Structure
The system expects JWT tokens with standard claims:
- `exp`: Expiration timestamp (seconds since epoch)
- `iat`: Issued at timestamp
- `sub`: Subject (user identifier)

### Session Storage
- Uses `cookies-next` for secure token storage
- Token is stored in the `_FLACTO_AUTH_KEY_` cookie
- Automatic cleanup on logout

### Error Handling Integration
- Session expired errors are handled separately from regular API errors
- No duplicate error dialogs for authentication issues
- Seamless integration with existing error handling system
