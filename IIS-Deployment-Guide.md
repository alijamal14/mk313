# IIS Deployment Guide for MK313

This guide documents how to deploy the MK313 website on IIS without permission issues.

## Problem Summary

When deploying static websites to IIS, placing files under user profile directories (like `C:\Users\Administrator\source\repos\...`) causes **401.3 Access Denied** errors due to restrictive ACL inheritance that blocks IIS service accounts.

## Solution: Use Standard IIS Locations

Deploy to standard IIS directories where ACLs are properly configured for web service accounts.

---

## Step-by-Step Deployment Process

### 1. Prepare Site Files

Ensure your site has these essential files:
- `index.html` (main page)
- `web.config` (IIS configuration)
- CSS, JS, and other assets

### 2. Create Proper `web.config`

Create a minimal `web.config` in your site root:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <defaultDocument enabled="true">
      <files>
        <clear />
        <add value="index.html" />
      </files>
    </defaultDocument>

    <security>
      <authorization>
        <clear />
        <add accessType="Allow" users="*" />
      </authorization>
    </security>
  </system.webServer>

  <system.web>
    <customErrors mode="RemoteOnly" />
  </system.web>
</configuration>
```

### 3. Deploy to Standard IIS Location

**✅ Recommended Location:**
```
C:\inetpub\wwwroot\mk313\
```

**❌ Avoid User Profile Directories:**
```
C:\Users\[username]\source\repos\...
C:\Users\[username]\Documents\...
```

### 4. PowerShell Deployment Commands

```powershell
# Create site directory
New-Item -ItemType Directory -Path "C:\inetpub\wwwroot\mk313" -Force

# Copy your site files
Copy-Item "path\to\your\source\*" -Destination "C:\inetpub\wwwroot\mk313" -Recurse -Force

# Import WebAdministration module
Import-Module WebAdministration

# Create or update IIS site
if (Get-Website -Name "mk313" -ErrorAction SilentlyContinue) {
    # Update existing site physical path
    Set-ItemProperty 'IIS:\Sites\mk313' -Name physicalPath -Value 'C:\inetpub\wwwroot\mk313'
} else {
    # Create new site
    New-Website -Name "mk313" -PhysicalPath "C:\inetpub\wwwroot\mk313" -Port 80 -HostHeader "mk313.com"
    # Add www binding
    New-WebBinding -Name "mk313" -Protocol http -Port 80 -HostHeader "www.mk313.com"
}

# Create or update application pool
if (Get-WebAppPool -Name "mk313" -ErrorAction SilentlyContinue) {
    # Restart existing pool
    Restart-WebAppPool -Name "mk313"
} else {
    # Create new app pool
    New-WebAppPool -Name "mk313"
    Set-ItemProperty 'IIS:\Sites\mk313' -Name applicationPool -Value "mk313"
}
```

### 5. Verify Deployment

Test locally:
```powershell
Invoke-WebRequest -Uri "http://localhost/" -Headers @{ Host = "www.mk313.com" } -UseBasicParsing
```

Expected result: `StatusCode: 200`

---

## Troubleshooting Common Issues

### Issue: 401.3 Access Denied
**Cause:** Files in user profile directories or incorrect ACLs
**Solution:** Move to `C:\inetpub\wwwroot\` and restart app pool

### Issue: 500.19 Configuration Error
**Cause:** Invalid `web.config` (often missing URL Rewrite module)
**Solution:** Remove `<rewrite>` sections if URL Rewrite isn't installed

### Issue: Default document not working
**Cause:** Missing `defaultDocument` configuration
**Solution:** Add `web.config` with proper `defaultDocument` section

### Issue: Anonymous authentication errors
**Cause:** IIS anonymous auth disabled or authorization rules
**Solution:** Enable anonymous auth and add `<authorization>` rules

---

## Quick Deployment Checklist

- [ ] Site files ready with `index.html` and `web.config`
- [ ] Deploy to `C:\inetpub\wwwroot\mk313\` (not user directories)
- [ ] Update IIS site physical path
- [ ] Restart application pool
- [ ] Test with localhost + host header
- [ ] Verify live site works

---

## Best Practices

1. **Always use standard IIS directories** (`C:\inetpub\wwwroot\`)
2. **Include proper `web.config`** with default document and authorization
3. **Test locally first** before checking live site
4. **Use PowerShell scripts** for consistent deployments
5. **Restart app pools** after configuration changes

---

## File Structure Reference

```
C:\inetpub\wwwroot\mk313\
├── index.html
├── web.config
├── css\
│   └── styles.css
├── js\
│   └── main.js
├── about.html
└── careers.html
```

---

**Last Updated:** August 24, 2025  
**Deployment Status:** ✅ Working at https://mk313.com/ and https://www.mk313.com/
