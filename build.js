#!/usr/bin/env node

/**
 * Production Build Script for Blue Prince Guide
 *
 * This script creates optimized production builds by:
 * - Minifying JavaScript files
 * - Optimizing CSS (inline Tailwind)
 * - Adding cache headers and optimization
 * - Creating deployment-ready files
 */

const fs = require("fs");
const path = require("path");

// Simple minification function for JavaScript
function minifyJS(code) {
  // Advanced safe minification that preserves JavaScript syntax
  const debug = process.env.DEBUG_BUILD === "true";

  if (debug) {
    console.log("🔍 Starting minification process...");
  }

  // Step 1: Preserve all string literals and template literals
  const preservedContent = new Map();
  let globalIndex = 0;

  // Handle template literals first (more complex)
  let result = code.replace(/`(?:[^`\\]|\\.)*`/g, (match) => {
    const placeholder = `__TEMPLATE_${globalIndex}__`;
    preservedContent.set(placeholder, match);
    globalIndex++;
    return placeholder;
  });

  // Handle regular string literals
  result = result.replace(/(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, (match) => {
    const placeholder = `__STRING_${globalIndex}__`;
    preservedContent.set(placeholder, match);
    globalIndex++;
    return placeholder;
  });

  // Step 2: Preserve regex literals
  result = result.replace(
    /\/(?![*/])(?:[^\/\\\n]|\\.)+\/[gimuy]*/g,
    (match, offset) => {
      // Simple heuristic to avoid false positives (division operators)
      const before = result.charAt(offset - 1);
      if (/[a-zA-Z0-9_$)]/.test(before)) {
        return match; // Likely a division operator
      }
      const placeholder = `__REGEX_${globalIndex}__`;
      preservedContent.set(placeholder, match);
      globalIndex++;
      return placeholder;
    }
  );

  // Step 3: Safe minification operations
  result = result
    // Remove single-line comments (but preserve URLs and regex)
    .replace(
      /\/\/(?![^\n]*(?:https?:|__STRING_|__TEMPLATE_|__REGEX_)).*$/gm,
      ""
    )
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // Normalize whitespace (but preserve line breaks for safety)
    .replace(/[ \t]+/g, " ")
    // Remove trailing whitespace
    .replace(/[ \t]+$/gm, "")
    // Remove leading whitespace
    .replace(/^[ \t]+/gm, "")
    // Remove empty lines (but keep some structure)
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    // Safe space removal around specific operators (very conservative)
    .replace(/\s*([{}();,])\s*/g, "$1")
    .replace(/\s*:\s*(?![\/])/g, ":") // Avoid breaking URLs
    // Clean up any multiple spaces that might remain
    .replace(/  +/g, " ")
    .trim();

  // Step 4: Restore preserved content
  // Multiple passes to handle nested placeholders
  let previousResult;
  let passes = 0;
  const maxPasses = 5;

  do {
    previousResult = result;
    result = result.replace(/__(?:STRING|TEMPLATE|REGEX)_(\d+)__/g, (match) => {
      return preservedContent.get(match) || match;
    });
    passes++;
  } while (result !== previousResult && passes < maxPasses);

  if (debug && passes > 1) {
    console.log(`🔄 Required ${passes} restoration passes`);
  }

  return result;
}

// Validate that all template variables have been replaced
function validateTemplateReplacement(code, filename = "unknown") {
  const templatePattern = /__(?:STRING|TEMPLATE|REGEX)_\d+__/g;
  const unreplacedVariables = [];
  let match;

  while ((match = templatePattern.exec(code)) !== null) {
    unreplacedVariables.push({
      variable: match[0],
      position: match.index,
      line: code.substring(0, match.index).split("\n").length,
    });
  }

  return {
    isValid: unreplacedVariables.length === 0,
    unreplacedVariables,
    filename,
    errorMessage:
      unreplacedVariables.length > 0
        ? `Found ${
            unreplacedVariables.length
          } unreplaced template variable(s) in ${filename}: ${unreplacedVariables
            .map((v) => v.variable)
            .join(", ")}`
        : null,
  };
}

// Create production directory
function createProductionBuild() {
  const prodDir = "dist";

  // Create dist directory if it doesn't exist
  if (!fs.existsSync(prodDir)) {
    fs.mkdirSync(prodDir);
  }

  console.log("🚀 Creating production build...");

  // Copy and minify JavaScript files
  const jsFiles = [
    "app.js",
    "data.js",
    "sections.js",
    "checkboxes.js",
    "information.js",
  ];

  jsFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      const minified = minifyJS(content);

      // Validate that all template variables have been replaced
      const validation = validateTemplateReplacement(minified, file);
      if (!validation.isValid) {
        console.error(`❌ Build failed: ${validation.errorMessage}`);
        console.error("Unreplaced variables found:");
        validation.unreplacedVariables.forEach((v) => {
          console.error(
            `  - ${v.variable} at line ${v.line}, position ${v.position}`
          );
        });
        process.exit(1);
      }

      fs.writeFileSync(path.join(prodDir, file), minified);
      console.log(
        `✅ Minified ${file} (${Math.round(
          (1 - minified.length / content.length) * 100
        )}% reduction)`
      );
    }
  });

  // Copy static assets (images, favicon, etc.)
  const staticFiles = ["favicon.ico"];
  staticFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(prodDir, file));
      console.log(`✅ Copied ${file}`);
    }
  });

  // Copy images directory if it exists
  if (fs.existsSync("images")) {
    const imagesDir = path.join(prodDir, "images");
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const copyDirectory = (src, dest) => {
      const entries = fs.readdirSync(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
          fs.mkdirSync(destPath, { recursive: true });
          copyDirectory(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };

    copyDirectory("images", imagesDir);
    console.log("✅ Copied images directory");
  }

  // Copy and optimize HTML
  if (fs.existsSync("index.html")) {
    let htmlContent = fs.readFileSync("index.html", "utf8");

    // Add production optimizations to HTML
    htmlContent = htmlContent.replace(
      "<head>",
      `<head>
    <!-- Production optimizations -->
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#3B82F6">
    <link rel="preconnect" href="https://cdn.tailwindcss.com">
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link rel="dns-prefetch" href="https://picsum.photos">`
    );

    // Add service worker registration
    htmlContent = htmlContent.replace(
      "</body>",
      `  <script>
    // Register service worker for caching
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => console.log('SW registered'))
          .catch(error => console.log('SW registration failed'));
      });
    }
  </script>
</body>`
    );

    fs.writeFileSync(path.join(prodDir, "index.html"), htmlContent);
    console.log("✅ Optimized index.html");
  }

  // Create service worker for caching
  createServiceWorker(prodDir);

  // Create deployment files
  createDeploymentFiles(prodDir);

  console.log("🎉 Production build complete!");
  console.log(`📁 Files created in ${prodDir}/ directory`);
}

// Create service worker for caching
function createServiceWorker(prodDir) {
  const swContent = `
// Service Worker for Blue Prince Guide
// Provides offline caching and performance optimization

const CACHE_NAME = 'blue-prince-guide-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/data.js',
  '/sections.js',
  '/checkboxes.js',
  '/information.js',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
`;

  fs.writeFileSync(path.join(prodDir, "sw.js"), swContent.trim());
  console.log("✅ Created service worker");
}

// Create deployment files
function createDeploymentFiles(prodDir) {
  // Create .htaccess for Apache servers
  const htaccessContent = `
# Blue Prince Guide - Production Configuration

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType text/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType text/html "access plus 1 hour"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>

# Enable HTTPS redirect (uncomment if using HTTPS)
# RewriteEngine On
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
`;

  fs.writeFileSync(path.join(prodDir, ".htaccess"), htaccessContent.trim());
  console.log("✅ Created .htaccess");

  // Create nginx configuration
  const nginxContent = `
# Blue Prince Guide - Nginx Configuration
# Place this in your nginx server block

location / {
    try_files $uri $uri/ /index.html;
    
    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Compression
    gzip on;
    gzip_types text/plain text/css application/javascript text/xml application/xml;
}

# Service worker
location /sw.js {
    add_header Cache-Control "no-cache";
    expires 0;
}
`;

  fs.writeFileSync(path.join(prodDir, "nginx.conf"), nginxContent.trim());
  console.log("✅ Created nginx.conf");
}

// Run the build
if (require.main === module) {
  createProductionBuild();
}

module.exports = {
  createProductionBuild,
  minifyJS,
  validateTemplateReplacement,
};
