# Session Expiration Testing Guide

This guide explains how to test the new session expiration functionality.

## 🧪 Testing Scenarios

### 1. Basic Session Monitoring

1. **Start the application**: `npm run dev`
2. **Login** with valid credentials
3. **Open browser dev tools** and check the console
4. You should see session monitoring logs indicating the session is valid

### 2. Manual Token Expiration Testing

To test token expiration without waiting:

1. **Login** to the application
2. **Open browser dev tools** → Application tab → Cookies
3. **Find the cookie** `_FLACTO_AUTH_KEY_`
4. **Copy the cookie value** and decode the JWT at https://jwt.io
5. **Modify the `exp` field** to a past timestamp
6. **Update the cookie** with the modified JWT
7. **Make any API call** (e.g., navigate to a page that loads data)
8. **Verify** that you're automatically logged out

### 3. Session Warning Testing

To test the "session expiring soon" warning:

1. **Login** to the application
2. **Modify the JWT token** to expire in 4-5 minutes from now
3. **Wait** for the warning dialog to appear
4. **Test both options**:
   - "Extend Session" (refreshes monitoring)
   - "Logout" (logs out immediately)

### 4. API 401 Response Testing

If your backend supports it:

1. **Configure your API** to return 401 for a specific endpoint
2. **Make a request** to that endpoint
3. **Verify** automatic logout occurs
4. **Check** that the session expired dialog appears

### 5. Session Status Component Testing

1. **Add the SessionStatus component** to your layout:
   ```tsx
   import SessionStatus from '@/components/SessionStatus';
   
   // In your layout component:
   <SessionStatus showTimeLeft={true} />
   ```
2. **Login** and verify the status shows "Sesión activa"
3. **Modify token expiration** to test different states
4. **Verify** the badge color and text change appropriately

## 🔧 Manual Token Modification

### Step-by-Step JWT Token Editing

1. **Get the current token**:
   ```javascript
   // In browser console
   document.cookie.split(';').find(c => c.includes('_FLACTO_AUTH_KEY_'))
   ```

2. **Decode the token** at https://jwt.io or use:
   ```javascript
   // In browser console
   const token = "your-jwt-token-here";
   JSON.parse(atob(token.split('.')[1]));
   ```

3. **Calculate new expiration**:
   ```javascript
   // Expire in 2 minutes
   const newExp = Math.floor(Date.now() / 1000) + (2 * 60);
   
   // Expire in 4 minutes (for warning test)
   const newExp = Math.floor(Date.now() / 1000) + (4 * 60);
   
   // Already expired
   const newExp = Math.floor(Date.now() / 1000) - 60;
   ```

4. **Create new token** with modified expiration:
   - Use the JWT.io debugger to modify the payload
   - Copy the new token
   - Update the cookie value

## 🚨 Expected Behaviors

### Valid Session
- ✅ API calls work normally
- ✅ SessionStatus shows green "Sesión activa"
- ✅ No warnings or dialogs

### Session Expiring Soon (< 5 minutes)
- ⚠️ Warning dialog appears
- ⚠️ SessionStatus shows orange "Expira pronto"
- ⚠️ User can choose to extend or logout

### Expired Session
- ❌ Automatic logout occurs
- ❌ SessionStatus shows red "Sesión expirada"
- ❌ User redirected to login page
- ❌ Session expired dialog appears

### API 401 Response
- ❌ Immediate logout
- ❌ Session expired dialog
- ❌ Redirect to login

## 🐛 Troubleshooting

### Common Issues

1. **Session monitoring not starting**:
   - Check if user is properly authenticated
   - Verify token exists in cookies
   - Check browser console for errors

2. **Token validation failing**:
   - Ensure JWT token has proper format
   - Verify `exp` claim exists and is valid
   - Check token encoding/decoding

3. **Logout not triggering**:
   - Verify API client logout callback is set
   - Check if AuthContext is properly initialized
   - Look for JavaScript errors in console

### Debug Commands

```javascript
// In browser console

// Check current session info
import { sessionManager } from '/src/utils/sessionManager.ts';
sessionManager.getSessionInfo();

// Check token expiration
import { isTokenExpired, getTimeUntilExpiration } from '/src/utils/tokenUtils.ts';
const token = sessionManager.getCurrentToken();
console.log('Token expired:', isTokenExpired(token));
console.log('Time until expiration:', getTimeUntilExpiration(token));

// Force session validation
sessionManager.validateSession();
```

## 📊 Testing Checklist

- [ ] Basic session monitoring works
- [ ] Manual token expiration triggers logout
- [ ] Session warning appears at 5 minutes
- [ ] "Extend session" option works
- [ ] "Logout" option works  
- [ ] API 401 responses trigger logout
- [ ] SessionStatus component shows correct states
- [ ] Session expired dialog appears
- [ ] Redirect to login works
- [ ] Re-login after expiration works
- [ ] Multiple tabs handle session expiration

## 💡 Tips

- Use browser dev tools Network tab to monitor API requests
- Check Application → Cookies to verify token storage
- Console logs provide detailed session monitoring info
- Test in multiple browser tabs to verify synchronization
- Use incognito mode for clean testing environment
