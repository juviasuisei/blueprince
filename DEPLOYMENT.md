# Blue Prince Guide - Deployment Documentation

## Overview

This document provides comprehensive instructions for deploying the Blue Prince Spoiler Free Guide & Tracking application to production environments.

## Quick Start

1. **Build for Production**

   ```bash
   node build.js
   ```

2. **Deploy the `dist/` folder** to your web server

3. **Configure your web server** using the provided configuration files

## Production Build Process

### Automated Build

The `build.js` script automatically:

- ✅ Minifies all JavaScript files (app.js, data.js, sections.js, checkboxes.js, information.js)
- ✅ Optimizes HTML with production meta tags and service worker registration
- ✅ Creates a service worker for offline caching
- ✅ Generates web server configuration files
- ✅ Outputs everything to the `dist/` directory

### Manual Build Steps

If you prefer manual deployment:

1. **Copy Files**

   ```bash
   mkdir dist
   cp index.html app.js data.js sections.js checkboxes.js information.js dist/
   ```

2. **Minify JavaScript** (optional but recommended)

   - Use any JavaScript minifier or the provided build script

3. **Configure Web Server** using the examples below

## Web Server Configuration

### Apache (.htaccess)

The build script creates a `.htaccess` file with:

- **Compression**: Gzip compression for text files
- **Caching**: Long-term caching for static assets
- **Security**: Security headers (XSS protection, content type sniffing prevention)
- **HTTPS**: Optional HTTPS redirect (commented out)

### Nginx

The build script creates a `nginx.conf` with:

- **Static File Serving**: Efficient serving of assets
- **Caching**: Appropriate cache headers
- **Compression**: Gzip compression
- **Security**: Security headers

### Node.js/Express

For Node.js deployments:

```javascript
const express = require('express');
const path = require('path');
const app = express();

// Serve static files with caching
app.use(express.static('dist', {
  maxAge: '1y', // Cache for 1 year
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache'); // Don't cache HTML
    }
  }
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
```

## Deployment Platforms

### Static Hosting (Recommended)

**Netlify**

1. Connect your repository to Netlify
2. Set build command: `node build.js`
3. Set publish directory: `dist`
4. Deploy

**Vercel**

1. Connect your repository to Vercel
2. Set build command: `node build.js`
3. Set output directory: `dist`
4. Deploy

**GitHub Pages**

1. Build locally: `node build.js`
2. Push `dist/` contents to `gh-pages` branch
3. Enable GitHub Pages in repository settings

**AWS S3 + CloudFront**

1. Create S3 bucket with static website hosting
2. Upload `dist/` contents to bucket
3. Configure CloudFront distribution
4. Set up custom domain (optional)

### Traditional Web Hosting

**cPanel/Shared Hosting**

1. Build locally: `node build.js`
2. Upload `dist/` contents to `public_html/` or `www/`
3. The `.htaccess` file will handle configuration

**VPS/Dedicated Server**

1. Install web server (Apache/Nginx)
2. Upload `dist/` contents to web root
3. Configure server using provided config files

## Performance Optimizations

### Implemented Optimizations

- **Lazy Loading**: Images load only when needed
- **Service Worker**: Offline caching and faster repeat visits
- **Debounced State Saving**: Reduces localStorage writes
- **Optimized DOM Operations**: Batched updates and efficient rendering
- **Memory Management**: Automatic cleanup and monitoring
- **Carousel Optimization**: Efficient initialization and lazy loading

### Additional Recommendations

1. **CDN**: Use a CDN for external libraries
2. **Image Optimization**: Optimize images before deployment
3. **Monitoring**: Set up performance monitoring
4. **Analytics**: Add analytics if needed (respecting privacy)

## Security Considerations

### Implemented Security

- **Content Security Policy**: Prevents XSS attacks
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer Policy**: Controls referrer information

### Additional Security

1. **HTTPS**: Always use HTTPS in production
2. **Regular Updates**: Keep dependencies updated
3. **Input Validation**: All user inputs are validated
4. **Local Storage**: Only non-sensitive data is stored

## Monitoring and Logging

### Built-in Monitoring

The application includes:

- **Performance Monitoring**: Memory usage tracking
- **Error Logging**: Console error logging
- **Image Loading**: Failed image load tracking
- **State Management**: localStorage operation monitoring

### Production Monitoring Setup

1. **Error Tracking**

   ```javascript
   // Add to app.js for production error tracking
   window.addEventListener("error", (event) => {
     console.error("Global error:", event.error);
     // Send to your error tracking service
   });
   ```

2. **Performance Tracking**
   ```javascript
   // Add performance tracking
   if ("performance" in window) {
     window.addEventListener("load", () => {
       const loadTime =
         performance.timing.loadEventEnd - performance.timing.navigationStart;
       console.log("Page load time:", loadTime + "ms");
       // Send to your analytics service
     });
   }
   ```

## Troubleshooting

### Common Issues

**Images Not Loading**

- Check image URLs in data files
- Verify CORS settings for external images
- Check browser console for errors

**Service Worker Issues**

- Clear browser cache
- Check browser developer tools > Application > Service Workers
- Verify service worker registration

**Performance Issues**

- Check browser developer tools > Performance tab
- Monitor memory usage in console
- Verify lazy loading is working

**Local Storage Issues**

- Check browser privacy settings
- Verify localStorage is available
- Check for quota exceeded errors

### Debug Mode

Enable debug mode by adding to localStorage:

```javascript
localStorage.setItem("debug", "true");
```

This enables additional console logging for troubleshooting.

## Maintenance

### Regular Tasks

1. **Update Dependencies**: Check for updates to Alpine.js, Tailwind, Swiper
2. **Monitor Performance**: Check loading times and memory usage
3. **Review Analytics**: Monitor user behavior and performance
4. **Backup Data**: Backup user progress data if needed

### Content Updates

To update content:

1. Modify data files (sections.js, checkboxes.js, information.js)
2. Test locally
3. Run build script
4. Deploy updated files

## Support

For deployment issues:

1. Check browser console for errors
2. Verify web server configuration
3. Test with different browsers
4. Check network requests in developer tools

## Changelog

### Version 1.0

- Initial production build system
- Performance optimizations
- Service worker implementation
- Comprehensive deployment documentation
