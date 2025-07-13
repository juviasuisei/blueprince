/**
 * Performance Monitor for Blue Prince Guide
 *
 * This script provides additional performance monitoring capabilities
 * for production deployments. Include this script to get detailed
 * performance metrics and monitoring.
 */

(function () {
  "use strict";

  // Performance monitoring configuration
  const config = {
    enableLogging: localStorage.getItem("debug") === "true",
    enableAnalytics: false, // Set to true to enable analytics
    thresholds: {
      loadTime: 3000, // 3 seconds
      memoryUsage: 50, // 50MB
      imageLoadTime: 2000, // 2 seconds
    },
  };

  // Performance metrics collector
  const PerformanceMonitor = {
    metrics: {
      pageLoad: null,
      imageLoads: [],
      errors: [],
      memoryUsage: [],
      userInteractions: [],
    },

    init() {
      this.setupPageLoadMonitoring();
      this.setupImageLoadMonitoring();
      this.setupMemoryMonitoring();
      this.setupUserInteractionMonitoring();
      this.setupErrorMonitoring();

      if (config.enableLogging) {
        console.log("Performance Monitor initialized");
      }
    },

    setupPageLoadMonitoring() {
      window.addEventListener("load", () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType("navigation")[0];
          if (perfData) {
            this.metrics.pageLoad = {
              loadTime: perfData.loadEventEnd - perfData.loadEventStart,
              domContentLoaded:
                perfData.domContentLoadedEventEnd -
                perfData.domContentLoadedEventStart,
              totalTime: perfData.loadEventEnd - perfData.fetchStart,
              timestamp: Date.now(),
            };

            this.checkLoadTimeThreshold();
            this.logMetric("Page Load", this.metrics.pageLoad);
          }
        }, 0);
      });
    },

    setupImageLoadMonitoring() {
      // Monitor image loading performance
      const imageObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.initiatorType === "img") {
            const imageMetric = {
              url: entry.name,
              loadTime: entry.responseEnd - entry.startTime,
              size: entry.transferSize,
              timestamp: Date.now(),
            };

            this.metrics.imageLoads.push(imageMetric);

            if (imageMetric.loadTime > config.thresholds.imageLoadTime) {
              this.logWarning("Slow image load", imageMetric);
            }
          }
        });
      });

      if ("PerformanceObserver" in window) {
        imageObserver.observe({ entryTypes: ["resource"] });
      }
    },

    setupMemoryMonitoring() {
      if (performance.memory) {
        setInterval(() => {
          const memory = performance.memory;
          const memoryMetric = {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
            timestamp: Date.now(),
          };

          this.metrics.memoryUsage.push(memoryMetric);

          // Keep only last 10 measurements
          if (this.metrics.memoryUsage.length > 10) {
            this.metrics.memoryUsage.shift();
          }

          if (memoryMetric.used > config.thresholds.memoryUsage) {
            this.logWarning("High memory usage", memoryMetric);
          }
        }, 30000); // Check every 30 seconds
      }
    },

    setupUserInteractionMonitoring() {
      // Monitor user interactions for performance impact
      ["click", "keydown", "scroll"].forEach((eventType) => {
        document.addEventListener(
          eventType,
          (event) => {
            const interactionStart = performance.now();

            requestAnimationFrame(() => {
              const interactionTime = performance.now() - interactionStart;

              if (interactionTime > 16) {
                // More than one frame (60fps)
                this.metrics.userInteractions.push({
                  type: eventType,
                  target: event.target.tagName,
                  duration: interactionTime,
                  timestamp: Date.now(),
                });

                // Keep only last 20 interactions
                if (this.metrics.userInteractions.length > 20) {
                  this.metrics.userInteractions.shift();
                }
              }
            });
          },
          { passive: true }
        );
      });
    },

    setupErrorMonitoring() {
      // Enhanced error monitoring
      window.addEventListener("error", (event) => {
        const errorMetric = {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
          timestamp: Date.now(),
        };

        this.metrics.errors.push(errorMetric);
        this.logError("JavaScript Error", errorMetric);
      });

      window.addEventListener("unhandledrejection", (event) => {
        const errorMetric = {
          reason: event.reason,
          promise: event.promise,
          timestamp: Date.now(),
        };

        this.metrics.errors.push(errorMetric);
        this.logError("Unhandled Promise Rejection", errorMetric);
      });
    },

    checkLoadTimeThreshold() {
      if (
        this.metrics.pageLoad &&
        this.metrics.pageLoad.totalTime > config.thresholds.loadTime
      ) {
        this.logWarning("Slow page load", {
          totalTime: this.metrics.pageLoad.totalTime,
          threshold: config.thresholds.loadTime,
        });
      }
    },

    logMetric(type, data) {
      if (config.enableLogging) {
        console.log(`[Performance] ${type}:`, data);
      }

      if (config.enableAnalytics) {
        this.sendToAnalytics(type, data);
      }
    },

    logWarning(type, data) {
      if (config.enableLogging) {
        console.warn(`[Performance Warning] ${type}:`, data);
      }

      if (config.enableAnalytics) {
        this.sendToAnalytics(`Warning: ${type}`, data);
      }
    },

    logError(type, data) {
      if (config.enableLogging) {
        console.error(`[Performance Error] ${type}:`, data);
      }

      if (config.enableAnalytics) {
        this.sendToAnalytics(`Error: ${type}`, data);
      }
    },

    sendToAnalytics(type, data) {
      // Placeholder for analytics integration
      // Replace with your analytics service
      /*
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, timestamp: Date.now() })
      }).catch(err => console.warn('Analytics send failed:', err));
      */
    },

    getReport() {
      return {
        summary: {
          pageLoadTime: this.metrics.pageLoad?.totalTime || "N/A",
          imageLoadsCount: this.metrics.imageLoads.length,
          errorsCount: this.metrics.errors.length,
          averageMemoryUsage: this.getAverageMemoryUsage(),
          slowInteractions: this.metrics.userInteractions.filter(
            (i) => i.duration > 50
          ).length,
        },
        detailed: this.metrics,
      };
    },

    getAverageMemoryUsage() {
      if (this.metrics.memoryUsage.length === 0) return "N/A";

      const total = this.metrics.memoryUsage.reduce(
        (sum, m) => sum + m.used,
        0
      );
      return Math.round(total / this.metrics.memoryUsage.length) + "MB";
    },

    exportReport() {
      const report = this.getReport();
      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `performance-report-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  };

  // Global access for debugging
  window.PerformanceMonitor = PerformanceMonitor;

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      PerformanceMonitor.init()
    );
  } else {
    PerformanceMonitor.init();
  }

  // Console commands for debugging
  if (config.enableLogging) {
    console.log("Performance Monitor Commands:");
    console.log("- PerformanceMonitor.getReport() - Get performance report");
    console.log("- PerformanceMonitor.exportReport() - Export report as JSON");
    console.log("- PerformanceMonitor.metrics - View raw metrics");
  }
})();
