function checklistApp() {
  return {
    data: {},
    checkedItems: [],
    expandedSections: [],
    expandedSubsections: [],
    swipers: {},
    dataLoadError: false,
    unlockedMysteries: [],
    revealedHints: {},
    showResetConfirm: false,
    showCompleteAllConfirm: false,
    version: "Unknown", // Default fallback version
    // Accessibility state
    announcements: [],
    lastAnnouncementId: 0,
    
    // Mystery message state
    mysteryMessages: [], // Array to store active mystery messages

    // Navigation state
    showNavigation: false,
    expandedNavSections: [],
    currentActiveSection: null,
    navigationEventListeners: {
      clickOutside: null,
      escapeKey: null,
    },

    async init() {
      await this.loadData();
      this.loadVersion();
      this.loadState();
      this.setupAccessibility();
      this.setupPerformanceOptimizations();
      this.$nextTick(() => {
        this.initializeSwipers();
        this.setupScrollSpy();
      });
    },

    loadVersion() {
      // Get version from the loaded data
      if (this.data && this.data.version) {
        this.version = this.data.version;
      } else {
        console.warn("Version not found in data, using default");
        // Keep the default fallback version
      }
    },

    // Performance optimization setup
    setupPerformanceOptimizations() {
      // Debounce state saving to reduce localStorage writes
      this.debouncedSaveState = this.debounce(this.saveState.bind(this), 300);

      // Set up intersection observer for lazy loading
      this.setupLazyLoading();

      // Set up performance monitoring
      this.setupPerformanceMonitoring();
    },

    // Debounce utility for performance optimization
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // Lazy loading setup for images
    setupLazyLoading() {
      if ("IntersectionObserver" in window) {
        this.imageObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                  img.src = img.dataset.src;
                  img.removeAttribute("data-src");
                  this.imageObserver.unobserve(img);
                }
              }
            });
          },
          {
            rootMargin: "50px 0px",
            threshold: 0.01,
          }
        );

        // Observe all images with data-src
        this.observeImages();
      }
    },

    // Observe all lazy loading images
    observeImages() {
      if (!this.imageObserver) return;

      requestAnimationFrame(() => {
        const lazyImages = document.querySelectorAll("img[data-src]");
        lazyImages.forEach((img) => {
          this.imageObserver.observe(img);
        });
      });
    },

    // Performance monitoring setup
    setupPerformanceMonitoring() {
      // Track initialization time
      if (performance.mark) {
        performance.mark("app-init-start");
      }

      // Monitor memory usage in development
      if (
        typeof process !== "undefined" &&
        process?.env?.NODE_ENV === "development" &&
        performance.memory
      ) {
        this.memoryMonitor = setInterval(() => {
          const memory = performance.memory;
          if (memory.usedJSHeapSize > 50 * 1024 * 1024) {
            // 50MB threshold
            console.warn("High memory usage detected:", {
              used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + "MB",
              total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + "MB",
            });
          }
        }, 30000); // Check every 30 seconds
      }

      // Setup performance optimizations for DOM operations
      this.setupDOMOptimizations();

      // Setup production error logging
      this.setupErrorLogging();
    },

    // Setup comprehensive error logging for production
    setupErrorLogging() {
      // Global error handler
      window.addEventListener("error", (event) => {
        this.logError("JavaScript Error", {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error?.stack,
        });
      });

      // Unhandled promise rejection handler
      window.addEventListener("unhandledrejection", (event) => {
        this.logError("Unhandled Promise Rejection", {
          reason: event.reason,
          promise: event.promise,
        });
      });

      // Performance monitoring
      if ("performance" in window) {
        window.addEventListener("load", () => {
          setTimeout(() => {
            const perfData = performance.getEntriesByType("navigation")[0];
            if (perfData) {
              this.logPerformance("Page Load", {
                loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                domContentLoaded:
                  perfData.domContentLoadedEventEnd -
                  perfData.domContentLoadedEventStart,
                totalTime: perfData.loadEventEnd - perfData.fetchStart,
              });
            }
          }, 0);
        });
      }
    },

    // Centralized error logging
    logError(type, details) {
      const errorData = {
        type,
        details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getUserId(), // Anonymous user ID for tracking
      };

      // Log to console in development
      if (localStorage.getItem("debug") === "true") {
        console.error("Error logged:", errorData);
      }

      // In production, you would send this to your error tracking service
      // Example: sendToErrorService(errorData);

      // Store recent errors locally for debugging
      this.storeRecentError(errorData);
    },

    // Performance logging
    logPerformance(type, metrics) {
      const perfData = {
        type,
        metrics,
        timestamp: new Date().toISOString(),
        userId: this.getUserId(),
      };

      if (localStorage.getItem("debug") === "true") {
        console.log("Performance logged:", perfData);
      }

      // In production, send to analytics service
      // Example: sendToAnalytics(perfData);
    },

    // Get or create anonymous user ID
    getUserId() {
      let userId = localStorage.getItem("anonymous-user-id");
      if (!userId) {
        userId =
          "user-" + Math.random().toString(36).substr(2, 9) + "-" + Date.now();
        localStorage.setItem("anonymous-user-id", userId);
      }
      return userId;
    },

    // Store recent errors for debugging
    storeRecentError(errorData) {
      try {
        let recentErrors = JSON.parse(
          localStorage.getItem("recent-errors") || "[]"
        );
        recentErrors.unshift(errorData);

        // Keep only last 10 errors
        recentErrors = recentErrors.slice(0, 10);

        localStorage.setItem("recent-errors", JSON.stringify(recentErrors));
      } catch (e) {
        console.warn("Failed to store error data:", e);
      }
    },

    // Get recent errors for debugging
    getRecentErrors() {
      try {
        return JSON.parse(localStorage.getItem("recent-errors") || "[]");
      } catch (e) {
        return [];
      }
    },

    // Setup DOM operation optimizations
    setupDOMOptimizations() {
      // Cache frequently accessed DOM elements
      this.cachedElements = new Map();

      // Throttle expensive operations
      this.throttledProgressUpdate = this.throttle(() => {
        this.updateProgressBars();
      }, 100);

      // Setup mutation observer for efficient DOM updates
      if ("MutationObserver" in window) {
        this.mutationObserver = new MutationObserver((mutations) => {
          let shouldUpdateImages = false;

          mutations.forEach((mutation) => {
            if (
              mutation.type === "childList" &&
              mutation.addedNodes.length > 0
            ) {
              // Check if new images were added
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  if (
                    node.tagName === "IMG" ||
                    node.querySelector("img[data-src]")
                  ) {
                    shouldUpdateImages = true;
                  }
                }
              });
            }
          });

          if (shouldUpdateImages) {
            requestAnimationFrame(() => {
              this.observeImages();
            });
          }
        });

        // Start observing
        this.mutationObserver.observe(document.body, {
          childList: true,
          subtree: true,
        });
      }
    },

    // Throttle utility for performance optimization
    throttle(func, limit) {
      let inThrottle;
      return function (...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    },

    // Optimized progress bar updates
    updateProgressBars() {
      requestAnimationFrame(() => {
        // Batch all progress bar updates to avoid layout thrashing
        const progressBars = document.querySelectorAll('[role="progressbar"]');
        progressBars.forEach((bar) => {
          const progressDiv = bar.querySelector("div");
          if (progressDiv && bar.getAttribute("aria-valuenow")) {
            const value = parseInt(bar.getAttribute("aria-valuenow"));
            progressDiv.style.width = `${value}%`;
          }
        });
      });
    },

    // Accessibility methods
    setupAccessibility() {
      // Set up keyboard navigation listeners
      document.addEventListener("keydown", this.handleGlobalKeydown.bind(this));

      // Create live region for announcements
      this.createLiveRegion();
    },

    createLiveRegion() {
      if (!document.getElementById("live-region")) {
        const liveRegion = document.createElement("div");
        liveRegion.id = "live-region";
        liveRegion.setAttribute("aria-live", "polite");
        liveRegion.setAttribute("aria-atomic", "true");
        liveRegion.className = "sr-only";
        document.body.appendChild(liveRegion);
      }
    },

    announceToScreenReader(message, priority = "polite") {
      const liveRegion = document.getElementById("live-region");
      if (liveRegion) {
        liveRegion.setAttribute("aria-live", priority);
        liveRegion.textContent = message;

        // Clear after announcement to allow repeated messages
        setTimeout(() => {
          liveRegion.textContent = "";
        }, 1000);
      }
    },

    handleGlobalKeydown(event) {
      // Handle escape key for modals
      if (event.key === "Escape") {
        if (this.showResetConfirm) {
          this.showResetConfirm = false;
          event.preventDefault();
        }
        if (this.showCompleteAllConfirm) {
          this.showCompleteAllConfirm = false;
          event.preventDefault();
        }
      }
    },

    // Enhanced keyboard navigation for sections and subsections
    handleSectionKeydown(event, sectionId) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.toggleSection(sectionId);

        const section = this.data.sections?.find((s) => s.id === sectionId);
        const isExpanded = this.expandedSections.includes(sectionId);
        this.announceToScreenReader(
          `${section?.title} section ${isExpanded ? "expanded" : "collapsed"}`
        );
      }
    },

    handleSubsectionKeydown(event, subsectionId) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.toggleSubsection(subsectionId);

        // Find subsection title for announcement
        let subsectionTitle = "";
        for (const section of this.data.sections || []) {
          const subsection = section.subsections?.find(
            (s) => s.id === subsectionId
          );
          if (subsection) {
            subsectionTitle = subsection.title;
            break;
          }
        }

        const isExpanded = this.expandedSubsections.includes(subsectionId);
        this.announceToScreenReader(
          `${subsectionTitle} subsection ${
            isExpanded ? "expanded" : "collapsed"
          }`
        );
      }
    },

    // Enhanced checkbox interaction with accessibility
    handleCheckboxKeydown(event, checkboxId) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.toggleCheckboxWithAnnouncement(checkboxId);
      }
    },

    toggleCheckboxWithAnnouncement(checkboxId) {
      const wasChecked = this.checkedItems.includes(checkboxId);
      const checkbox = this.data.checkboxes[checkboxId];

      this.toggleCheckbox(checkboxId);

      // Announce the change
      if (checkbox) {
        const isNowChecked = this.checkedItems.includes(checkboxId);
        const title = checkbox.title || checkbox.hint || "Item";

        if (checkbox.unlockKeyword && !wasChecked && isNowChecked) {
          // Mystery unlocked and checked
          this.announceToScreenReader(
            `Mystery item "${title}" unlocked and completed`
          );
        } else {
          this.announceToScreenReader(
            `${title} ${isNowChecked ? "completed" : "uncompleted"}`
          );
        }

        // Announce if new content was revealed
        if (isNowChecked && !wasChecked) {
          this.announceNewContentRevealed();
        }
      }
    },

    announceNewContentRevealed() {
      // Check if any new sections, subsections, or items became visible
      setTimeout(() => {
        const visibleSections = this.getVisibleSections().length;
        const totalSections = this.data.sections?.length || 0;

        if (visibleSections < totalSections) {
          this.announceToScreenReader(
            "New content may have been revealed. Check for new sections or items."
          );
        }
      }, 100);
    },

    async loadData() {
      // Wait for data.js to be available
      let attempts = 0;
      while (!window.checklistData && attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      // Load data from the separate data.js file (no CORS issues)
      this.data = window.checklistData;

      // Check if data loaded properly
      if (!this.data || !this.data.sections) {
        console.error("Failed to load data from data.js");
        this.dataLoadError = true;
        this.data = { sections: [], checkboxes: {}, information: {} }; // Empty structure to prevent errors
        return;
      }

      console.log("Data loaded from data.js:", this.data);
      this.dataLoadError = false;
    },

    loadState() {
      try {
        const saved = localStorage.getItem("checklist-state");
        if (saved) {
          const state = JSON.parse(saved);
          // Validate state structure before applying
          if (this.validateStateStructure(state)) {
            this.checkedItems = state.checkedItems || [];
            this.expandedSections = state.expandedSections || [];
            this.expandedSubsections = state.expandedSubsections || [];
            this.unlockedMysteries = state.unlockedMysteries || [];
            this.revealedHints = state.revealedHints || {};
          } else {
            console.warn("Invalid state structure detected, using defaults");
          }
        }
      } catch (error) {
        console.error("Failed to load state from localStorage:", error);
        // Continue with default empty state
      }
    },

    // Validate state structure to prevent corruption
    validateStateStructure(state) {
      return (
        state &&
        typeof state === "object" &&
        Array.isArray(state.checkedItems) &&
        Array.isArray(state.expandedSections) &&
        Array.isArray(state.expandedSubsections) &&
        Array.isArray(state.unlockedMysteries) &&
        (state.revealedHints === undefined ||
          typeof state.revealedHints === "object")
      );
    },

    saveState() {
      try {
        const state = {
          checkedItems: this.checkedItems,
          expandedSections: this.expandedSections,
          expandedSubsections: this.expandedSubsections,
          unlockedMysteries: this.unlockedMysteries,
          revealedHints: this.revealedHints,
          timestamp: Date.now(), // Add timestamp for debugging
        };

        // Compress state if it's getting large
        const stateString = JSON.stringify(state);
        if (stateString.length > 10000) {
          // 10KB threshold
          console.warn(
            "Large state detected:",
            stateString.length,
            "characters"
          );
        }

        localStorage.setItem("checklist-state", stateString);
      } catch (error) {
        console.error("Failed to save state to localStorage:", error);
        // Could implement fallback storage here if needed
      }
    },

    toggleCheckbox(checkboxId) {
      const index = this.checkedItems.indexOf(checkboxId);
      const checkbox = this.data.checkboxes[checkboxId];

      if (index > -1) {
        this.checkedItems.splice(index, 1);
      } else {
        this.checkedItems.push(checkboxId);

        // If this is a mystery checkbox that hasn't been unlocked yet, unlock it
        if (
          checkbox &&
          checkbox.unlockKeyword &&
          !this.unlockedMysteries.includes(checkboxId)
        ) {
          this.unlockedMysteries.push(checkboxId);
        }
      }

      // Handle cloned checkboxes - if this checkbox appears in multiple sections
      if (checkbox && checkbox.clones) {
        checkbox.clones.forEach((cloneId) => {
          const cloneIndex = this.checkedItems.indexOf(cloneId);
          if (index > -1 && cloneIndex > -1) {
            // Unchecking - remove clone
            this.checkedItems.splice(cloneIndex, 1);
          } else if (index === -1 && cloneIndex === -1) {
            // Checking - add clone
            this.checkedItems.push(cloneId);
          }
        });
      }

      // Invalidate progress cache since checkbox state changed
      this._invalidateProgressCache();

      this.debouncedSaveState();
      this.$nextTick(() => {
        this.initializeSwipers();
        this.observeImages(); // Re-observe new images after DOM updates
      });
    },

    toggleSection(sectionId) {
      const index = this.expandedSections.indexOf(sectionId);
      if (index > -1) {
        this.expandedSections.splice(index, 1);
      } else {
        this.expandedSections.push(sectionId);
      }
      this.debouncedSaveState();
      this.$nextTick(() => {
        this.initializeSwipers();
      });
    },

    toggleSubsection(subsectionId) {
      const index = this.expandedSubsections.indexOf(subsectionId);
      if (index > -1) {
        this.expandedSubsections.splice(index, 1);
      } else {
        this.expandedSubsections.push(subsectionId);
      }
      this.debouncedSaveState();
      this.$nextTick(() => {
        this.initializeSwipers();
        this.observeImages(); // Re-observe new images after DOM updates
      });
    },

    checkDependencies(dependencies, optionalDependencies = false) {
      if (!dependencies || dependencies.length === 0) return true;

      if (optionalDependencies) {
        // If optionalDependencies is true, only ONE dependency needs to be satisfied
        return dependencies.some((dep) => this.checkedItems.includes(dep));
      } else {
        // Default behavior: ALL dependencies must be satisfied
        return dependencies.every((dep) => this.checkedItems.includes(dep));
      }
    },

    getVisibleSections() {
      if (!this.data.sections) return [];
      return this.data.sections.filter((section) =>
        this.checkDependencies(
          section.dependencies,
          section.optionalDependencies
        )
      );
    },

    getVisibleSubsections(sectionId) {
      const section = this.data.sections?.find((s) => s.id === sectionId);
      if (!section || !section.subsections) return [];
      return section.subsections.filter((subsection) =>
        this.checkDependencies(
          subsection.dependencies,
          subsection.optionalDependencies
        )
      );
    },

    getVisibleCheckboxes(checkboxIds) {
      if (!checkboxIds || !this.data.checkboxes) return [];
      return checkboxIds.filter((id) => {
        const checkbox = this.data.checkboxes[id];
        return (
          checkbox &&
          this.checkDependencies(
            checkbox.dependencies,
            checkbox.optionalDependencies
          )
        );
      });
    },

    getVisibleInformation(informationIds) {
      if (!informationIds || !this.data.information) return [];
      return informationIds.filter((id) => {
        const info = this.data.information[id];
        return (
          info &&
          this.checkDependencies(info.dependencies, info.optionalDependencies)
        );
      });
    },

    getTotalCheckboxes() {
      if (!this.data.checkboxes) return 0;
      return Object.keys(this.data.checkboxes).length;
    },

    getTotalChecked() {
      return this.checkedItems.length;
    },

    getSectionTotalCount(sectionId) {
      const section = this.data.sections?.find((s) => s.id === sectionId);
      if (!section) return 0;

      let count = 0;

      // Count direct checkboxes
      if (section.checkboxes) {
        count += section.checkboxes.length;
      }

      // Count subsection checkboxes
      if (section.subsections) {
        section.subsections.forEach((subsection) => {
          if (subsection.checkboxes) {
            count += subsection.checkboxes.length;
          }
        });
      }

      return count;
    },

    getSectionCheckedCount(sectionId) {
      const section = this.data.sections?.find((s) => s.id === sectionId);
      if (!section) return 0;

      let count = 0;

      // Count direct checkboxes
      if (section.checkboxes) {
        count += section.checkboxes.filter((id) =>
          this.checkedItems.includes(id)
        ).length;
      }

      // Count subsection checkboxes
      if (section.subsections) {
        section.subsections.forEach((subsection) => {
          if (subsection.checkboxes) {
            count += subsection.checkboxes.filter((id) =>
              this.checkedItems.includes(id)
            ).length;
          }
        });
      }

      return count;
    },

    getSubsectionTotalCount(subsectionId) {
      for (const section of this.data.sections || []) {
        const subsection = section.subsections?.find(
          (s) => s.id === subsectionId
        );
        if (subsection && subsection.checkboxes) {
          return subsection.checkboxes.length;
        }
      }
      return 0;
    },

    getSubsectionCheckedCount(subsectionId) {
      for (const section of this.data.sections || []) {
        const subsection = section.subsections?.find(
          (s) => s.id === subsectionId
        );
        if (subsection && subsection.checkboxes) {
          return subsection.checkboxes.filter((id) =>
            this.checkedItems.includes(id)
          ).length;
        }
      }
      return 0;
    },

    // Visible checkbox filtering logic for progress calculations
    getVisibleCheckboxesInSection(sectionId) {
      const section = this.data.sections?.find((s) => s.id === sectionId);
      if (!section) return [];

      let visibleCheckboxes = [];

      // Get visible direct checkboxes
      if (section.checkboxes) {
        visibleCheckboxes = visibleCheckboxes.concat(
          this.getVisibleCheckboxes(section.checkboxes)
        );
      }

      // Get visible subsection checkboxes
      if (section.subsections) {
        section.subsections.forEach((subsection) => {
          if (subsection.checkboxes) {
            visibleCheckboxes = visibleCheckboxes.concat(
              this.getVisibleCheckboxes(subsection.checkboxes)
            );
          }
        });
      }

      return visibleCheckboxes;
    },

    getVisibleCheckboxesInSubsection(subsectionId) {
      for (const section of this.data.sections || []) {
        const subsection = section.subsections?.find(
          (s) => s.id === subsectionId
        );
        if (subsection && subsection.checkboxes) {
          return this.getVisibleCheckboxes(subsection.checkboxes);
        }
      }
      return [];
    },

    isCheckboxVisible(checkboxId) {
      const checkbox = this.data.checkboxes?.[checkboxId];
      if (!checkbox) return false;

      return this.checkDependencies(
        checkbox.dependencies,
        checkbox.optionalDependencies
      );
    },

    // Visible progress calculation methods with performance optimizations
    getSectionVisibleTotalCount(sectionId) {
      // Use cached result if available and still valid
      const cacheKey = `section-visible-total-${sectionId}`;
      if (
        this._progressCache &&
        this._progressCache[cacheKey] &&
        this._progressCache[cacheKey].timestamp > this._lastStateChange
      ) {
        return this._progressCache[cacheKey].value;
      }

      const visibleCheckboxes = this.getVisibleCheckboxesInSection(sectionId);
      const result = visibleCheckboxes.length;

      // Cache the result
      this._cacheProgressResult(cacheKey, result);
      return result;
    },

    getSectionVisibleCheckedCount(sectionId) {
      // Use cached result if available and still valid
      const cacheKey = `section-visible-checked-${sectionId}`;
      if (
        this._progressCache &&
        this._progressCache[cacheKey] &&
        this._progressCache[cacheKey].timestamp > this._lastStateChange
      ) {
        return this._progressCache[cacheKey].value;
      }

      const visibleCheckboxes = this.getVisibleCheckboxesInSection(sectionId);
      const result = visibleCheckboxes.filter((checkboxId) =>
        this.checkedItems.includes(checkboxId)
      ).length;

      // Cache the result
      this._cacheProgressResult(cacheKey, result);
      return result;
    },

    getSubsectionVisibleTotalCount(subsectionId) {
      // Use cached result if available and still valid
      const cacheKey = `subsection-visible-total-${subsectionId}`;
      if (
        this._progressCache &&
        this._progressCache[cacheKey] &&
        this._progressCache[cacheKey].timestamp > this._lastStateChange
      ) {
        return this._progressCache[cacheKey].value;
      }

      const visibleCheckboxes =
        this.getVisibleCheckboxesInSubsection(subsectionId);
      const result = visibleCheckboxes.length;

      // Cache the result
      this._cacheProgressResult(cacheKey, result);
      return result;
    },

    getSubsectionVisibleCheckedCount(subsectionId) {
      // Use cached result if available and still valid
      const cacheKey = `subsection-visible-checked-${subsectionId}`;
      if (
        this._progressCache &&
        this._progressCache[cacheKey] &&
        this._progressCache[cacheKey].timestamp > this._lastStateChange
      ) {
        return this._progressCache[cacheKey].value;
      }

      const visibleCheckboxes =
        this.getVisibleCheckboxesInSubsection(subsectionId);
      const result = visibleCheckboxes.filter((checkboxId) =>
        this.checkedItems.includes(checkboxId)
      ).length;

      // Cache the result
      this._cacheProgressResult(cacheKey, result);
      return result;
    },

    // Performance optimization helper methods
    _cacheProgressResult(key, value) {
      if (!this._progressCache) {
        this._progressCache = {};
      }
      this._progressCache[key] = {
        value: value,
        timestamp: Date.now(),
      };
    },

    _invalidateProgressCache() {
      this._progressCache = {};
      this._lastStateChange = Date.now();
    },

    // Hint system methods
    hasAdditionalHints(checkboxId) {
      if (!this.data || !this.data.checkboxes) return false;
      const checkbox = this.data.checkboxes[checkboxId];
      return !!(
        checkbox &&
        Array.isArray(checkbox.additionalHints) &&
        checkbox.additionalHints.length > 0
      );
    },

    getRevealedHintCount(checkboxId) {
      return this.revealedHints[checkboxId] || 0;
    },

    revealNextHint(checkboxId) {
      if (!this.hasAdditionalHints(checkboxId)) return;

      const checkbox = this.data.checkboxes[checkboxId];
      const currentCount = this.getRevealedHintCount(checkboxId);

      // Only reveal if there are more hints available
      if (currentCount < checkbox.additionalHints.length) {
        this.revealedHints[checkboxId] = currentCount + 1;
        this.debouncedSaveState();

        // Announce to screen reader
        const hintText = checkbox.additionalHints[currentCount];
        this.announceToScreenReader(`Hint revealed: ${hintText}`, "polite");
      }
    },

    getHintDisplayData(checkboxId) {
      if (!this.hasAdditionalHints(checkboxId)) return null;

      const checkbox = this.data.checkboxes[checkboxId];
      const revealedCount = this.getRevealedHintCount(checkboxId);

      return {
        checkboxId: checkboxId,
        totalHints: checkbox.additionalHints.length,
        revealedCount: revealedCount,
        hints: checkbox.additionalHints.map((hintText, index) => ({
          text: hintText,
          revealed: index < revealedCount,
          lightbulbOpacity: index < revealedCount ? 1.0 : 0.4,
        })),
      };
    },

    shouldShowHints(checkboxId) {
      // Only show hints for unchecked checkboxes that have additional hints
      return (
        !this.checkedItems.includes(checkboxId) &&
        this.hasAdditionalHints(checkboxId)
      );
    },

    getRevealedHints(checkboxId) {
      if (!this.hasAdditionalHints(checkboxId)) return [];

      const checkbox = this.data.checkboxes[checkboxId];
      const revealedCount = this.getRevealedHintCount(checkboxId);

      return checkbox.additionalHints.slice(0, revealedCount);
    },

    getUnrevealedLightbulbCount(checkboxId) {
      if (!this.hasAdditionalHints(checkboxId)) return 0;

      const checkbox = this.data.checkboxes[checkboxId];
      const revealedCount = this.getRevealedHintCount(checkboxId);

      return checkbox.additionalHints.length - revealedCount;
    },

    initializeSwiper(swiperId, color, onSlideChange) {
      // Initialize a specific Swiper instance with performance optimizations
      if (!this.swipers[swiperId]) {
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          const swiperEl = document.getElementById(swiperId);
          if (!swiperEl) return;

          const slides = swiperEl.querySelectorAll(".swiper-slide");
          const slideCount = slides.length;

          // Skip initialization if no slides
          if (slideCount === 0) return;

          console.log(
            "Initializing Swiper:",
            swiperId,
            "with",
            slideCount,
            "slides",
            "color:",
            color
          );

          // Pre-apply styles to avoid layout thrashing
          const nextBtn = swiperEl.querySelector(".swiper-button-next");
          const prevBtn = swiperEl.querySelector(".swiper-button-prev");
          if (color) {
            if (nextBtn) nextBtn.style.color = color;
            if (prevBtn) prevBtn.style.color = color;
          }

          // Remove loop option to fix synchronization issues with images and captions

          try {
            this.swipers[swiperId] = new Swiper(`#${swiperId}`, {
              navigation: {
                nextEl: `#${swiperId} .swiper-button-next`,
                prevEl: `#${swiperId} .swiper-button-prev`,
              },
              pagination: {
                el: `#${swiperId} .swiper-pagination`,
                clickable: true,
              },
              // loop: enableLoop, // Removed to fix synchronization issues
              autoHeight: true,
              spaceBetween: 10,
              // Performance optimizations
              
              // Add event handlers for navigation button visibility
              on: {
                init: function(swiper) {
                  // Initial state setup for navigation buttons
                  updateNavigationVisibility(swiper);
                },
                slideChange: function(swiper) {
                  // Update navigation buttons on slide change
                  updateNavigationVisibility(swiper);
                }
              }
              observer: true,
              observeParents: true,
              watchSlidesProgress: true,
              watchSlidesVisibility: true,
              // Lazy loading support
              lazy: {
                loadPrevNext: true,
                loadPrevNextAmount: 1,
              },
              // Add some resistance for better UX when not looping
              resistance: true,
              resistanceRatio: 0.85,
              // Optimized event handlers
              on: {
                init: (swiper) => {
                  this.applySwiperStyling(swiperEl, color);
                  if (onSlideChange) onSlideChange(swiper);
                },
                slideChange: (swiper) => {
                  this.applySwiperStyling(swiperEl, color);
                  if (onSlideChange) onSlideChange(swiper);
                },
                lazyImageReady: (swiper, slideEl, imageEl) => {
                  // Handle lazy loaded images
                  imageEl.style.opacity = "1";
                },
              },
            });

            // Setup lazy loading for images in this swiper
            this.setupSwiperLazyLoading(swiperEl);
          } catch (error) {
            console.error("Failed to initialize Swiper:", swiperId, error);
            // Fallback: remove swiper classes to show as static gallery
            swiperEl.classList.remove("swiper");
          }
        });
      }
    },

    // Optimized styling application to reduce DOM queries
    applySwiperStyling(swiperEl, color) {
      if (!color) return;

      requestAnimationFrame(() => {
        const activeBullet = swiperEl.querySelector(
          ".swiper-pagination-bullet-active"
        );
        if (activeBullet) {
          activeBullet.style.backgroundColor = color;
        }
      });
    },

    // Setup lazy loading for swiper images
    setupSwiperLazyLoading(swiperEl) {
      if (!this.imageObserver) return;

      const images = swiperEl.querySelectorAll("img[data-src]");
      images.forEach((img) => {
        this.imageObserver.observe(img);
      });
    },

    initializeSwipers() {
      // Initialize Swiper for any new carousels with performance optimization
      requestAnimationFrame(() => {
        const swipers = document.querySelectorAll(".swiper");

        // Batch DOM operations for better performance
        const swipersToInit = [];
        swipers.forEach((swiperEl) => {
          const id = swiperEl.id;
          if (!this.swipers[id] && id) {
            swipersToInit.push(id);
          }
        });

        // Initialize in batches to avoid blocking the main thread
        if (swipersToInit.length > 0) {
          this.initializeSwiperBatch(swipersToInit, 0);
        }
      });
    },

    // Initialize swipers in batches to prevent blocking
    initializeSwiperBatch(swiperIds, index) {
      if (index >= swiperIds.length) return;

      this.initializeSwiper(swiperIds[index]);

      // Process next swiper in next frame
      if (index + 1 < swiperIds.length) {
        requestAnimationFrame(() => {
          this.initializeSwiperBatch(swiperIds, index + 1);
        });
      }
    },

    // Cleanup method for performance
    cleanup() {
      // Clear intervals and observers
      if (this.memoryMonitor) {
        clearInterval(this.memoryMonitor);
      }

      if (this.imageObserver) {
        this.imageObserver.disconnect();
      }

      // Destroy swiper instances
      Object.values(this.swipers).forEach((swiper) => {
        if (swiper && typeof swiper.destroy === "function") {
          swiper.destroy(true, true);
        }
      });
      this.swipers = {};

      // Remove event listeners
      document.removeEventListener("keydown", this.handleGlobalKeydown);
    },

    // Color mapping for progress bars
    getColorHex(colorName) {
      const colors = {
        blue: "#3B82F6",
        red: "#EF4444",
        orange: "#AB6329",
        green: "#357F3E",
        gold: "#BBB16A",
        black: "#1F2937",
        purple: "#795178",
      };
      return colors[colorName?.toLowerCase()] || colors.blue; // Default to blue
    },

    // Navigation methods
    toggleNavigation() {
      this.showNavigation = !this.showNavigation;
      this.announceToScreenReader(
        `Navigation ${this.showNavigation ? "opened" : "closed"}`,
        "polite"
      );

      // Set up or clean up auto-close event listeners based on navigation state
      if (this.showNavigation) {
        // Navigation is now open - set up auto-close listeners
        this.$nextTick(() => {
          this.setupNavigationAutoClose();
        });
      } else {
        // Navigation is now closed - clean up auto-close listeners
        this.cleanupNavigationAutoClose();
      }
    },

    toggleNavSection(sectionId) {
      const index = this.expandedNavSections.indexOf(sectionId);
      if (index > -1) {
        this.expandedNavSections.splice(index, 1);
      } else {
        this.expandedNavSections.push(sectionId);
      }
    },

    scrollToSection(sectionId) {
      // Auto-expand the section if it's collapsed
      if (!this.expandedSections.includes(sectionId)) {
        this.expandedSections.push(sectionId);
        this.debouncedSaveState();
      }

      // Wait for DOM update after expansion, then scroll
      this.$nextTick(() => {
        const element = document.getElementById(`section-${sectionId}`);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          this.currentActiveSection = sectionId;
          this.announceToScreenReader(
            `Navigated to ${this.getSectionTitle(sectionId)} section`,
            "polite"
          );
        }
      });
    },

    scrollToSubsection(subsectionId) {
      // Find the parent section for this subsection
      let parentSectionId = null;
      for (const section of this.data.sections || []) {
        if (section.subsections?.some((sub) => sub.id === subsectionId)) {
          parentSectionId = section.id;
          break;
        }
      }

      // Auto-expand the parent section if it's collapsed
      if (parentSectionId && !this.expandedSections.includes(parentSectionId)) {
        this.expandedSections.push(parentSectionId);
      }

      // Auto-expand the subsection if it's collapsed
      if (!this.expandedSubsections.includes(subsectionId)) {
        this.expandedSubsections.push(subsectionId);
      }

      // Save state after expansions
      this.debouncedSaveState();

      // Wait for DOM update after expansion, then scroll
      this.$nextTick(() => {
        const element = document.getElementById(`subsection-${subsectionId}`);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          this.announceToScreenReader(
            `Navigated to ${this.getSubsectionTitle(subsectionId)} subsection`,
            "polite"
          );
        }
      });
    },

    getSectionTitle(sectionId) {
      const section = this.data.sections?.find((s) => s.id === sectionId);
      return section?.title || "Unknown Section";
    },
    getSubsectionTitle(subsectionId) {
      for (const section of this.data.sections || []) {
        const subsection = section.subsections?.find(
          (s) => s.id === subsectionId
        );
        if (subsection) {
          return subsection.title;
        }
      }
      return "Unknown Subsection";
    },

    // Navigation auto-close event listener management
    setupNavigationAutoClose() {
      try {
        // Clean up any existing listeners first
        this.cleanupNavigationAutoClose();

        // Set up click-outside listener
        this.navigationEventListeners.clickOutside = (event) => {
          this.handleClickOutside(event);
        };

        // Set up escape key listener
        this.navigationEventListeners.escapeKey = (event) => {
          this.handleNavigationEscape(event);
        };

        // Add event listeners to document
        document.addEventListener(
          "click",
          this.navigationEventListeners.clickOutside,
          true
        );
        document.addEventListener(
          "keydown",
          this.navigationEventListeners.escapeKey
        );
      } catch (error) {
        // Handle event listener setup errors gracefully
        console.warn(
          "Error setting up navigation auto-close listeners:",
          error
        );
      }
    },

    cleanupNavigationAutoClose() {
      try {
        // Remove click-outside listener
        if (this.navigationEventListeners.clickOutside) {
          document.removeEventListener(
            "click",
            this.navigationEventListeners.clickOutside,
            true
          );
          this.navigationEventListeners.clickOutside = null;
        }

        // Remove escape key listener
        if (this.navigationEventListeners.escapeKey) {
          document.removeEventListener(
            "keydown",
            this.navigationEventListeners.escapeKey
          );
          this.navigationEventListeners.escapeKey = null;
        }
      } catch (error) {
        // Handle event listener removal errors gracefully
        console.warn(
          "Error cleaning up navigation auto-close listeners:",
          error
        );
        // Still clean up references even if removal fails
        this.navigationEventListeners.clickOutside = null;
        this.navigationEventListeners.escapeKey = null;
      }
    },

    handleClickOutside(event) {
      // Only process if navigation is currently open
      if (!this.showNavigation) {
        return;
      }

      try {
        // Get the navigation panel and toggle button elements
        const navigationPanel = event.target.closest(
          '[role="navigation"][aria-label="Section navigation"]'
        );
        const toggleButton = event.target.closest(
          'button[aria-label="Toggle navigation menu"]'
        );

        // If click is inside navigation panel or on toggle button, don't close
        if (navigationPanel || toggleButton) {
          return;
        }

        // Click is outside navigation - close it
        this.showNavigation = false;
        this.announceToScreenReader("Navigation closed", "polite");

        // Clean up event listeners since navigation is now closed
        this.cleanupNavigationAutoClose();
      } catch (error) {
        // Handle DOM errors gracefully - log but don't break functionality
        console.warn("Error in handleClickOutside:", error);
      }
    },

    handleNavigationEscape(event) {
      // Only process escape key when navigation is open
      if (event.key === "Escape" && this.showNavigation) {
        event.preventDefault();
        this.showNavigation = false;
        this.announceToScreenReader("Navigation closed", "polite");

        // Clean up event listeners since navigation is now closed
        this.cleanupNavigationAutoClose();
      }
    },

    setupScrollSpy() {
      // Set up intersection observer for scroll spy functionality
      if ("IntersectionObserver" in window) {
        this.scrollSpyObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const sectionId = entry.target.id.replace("section-", "");
                this.currentActiveSection = sectionId;
              }
            });
          },
          {
            rootMargin: "-20% 0px -70% 0px",
            threshold: 0.1,
          }
        );

        // Observe all section elements
        this.$nextTick(() => {
          const sections = document.querySelectorAll('[id^="section-"]');
          sections.forEach((section) => {
            this.scrollSpyObserver.observe(section);
          });
        });
      }
    },

    // Mystery system methods
    hasMysteries(checkboxIds) {
      if (!checkboxIds || !this.data.checkboxes) return false;
      return checkboxIds.some((id) => {
        const checkbox = this.data.checkboxes[id];
        return (
          checkbox &&
          checkbox.unlockKeyword &&
          this.checkDependencies(
            checkbox.dependencies,
            checkbox.optionalDependencies
          ) &&
          !this.unlockedMysteries.includes(id)
        );
      });
    },

    getMysteryType(checkboxIds) {
      if (!checkboxIds || !this.data.sections) return "Mystery Discovery";

      // Check if there are any unrevealed mysteries in this scope first
      const hasUnrevealedMysteries = checkboxIds.some((checkboxId) => {
        const checkbox = this.data.checkboxes[checkboxId];
        return (
          checkbox &&
          checkbox.unlockKeyword &&
          this.checkDependencies(
            checkbox.dependencies,
            checkbox.optionalDependencies
          ) &&
          !this.unlockedMysteries.includes(checkboxId)
        );
      });

      if (!hasUnrevealedMysteries) return "Mystery Discovery";

      // Find the section or subsection that contains these checkboxes
      for (const section of this.data.sections) {
        // Check direct section
        if (
          section.checkboxes &&
          section.checkboxes.some((id) => checkboxIds.includes(id))
        ) {
          return section.mysteryType || "Mystery Discovery";
        }

        // Check subsections
        if (section.subsections) {
          for (const subsection of section.subsections) {
            if (
              subsection.checkboxes &&
              subsection.checkboxes.some((id) => checkboxIds.includes(id))
            ) {
              return (
                subsection.mysteryType ||
                section.mysteryType ||
                "Mystery Discovery"
              );
            }
          }
        }
      }

      return "Mystery Discovery";
    },

    tryUnlockMystery(input, checkboxIds) {
      if (!input || !checkboxIds || !this.data.checkboxes) return null;

      const searchTerm = input.toLowerCase().trim();
      if (!searchTerm) return null;

      // Search through all mystery checkboxes in this scope
      for (const checkboxId of checkboxIds) {
        const checkbox = this.data.checkboxes[checkboxId];
        if (
          checkbox &&
          checkbox.unlockKeyword &&
          !this.unlockedMysteries.includes(checkboxId) &&
          this.checkDependencies(
            checkbox.dependencies,
            checkbox.optionalDependencies
          )
        ) {
          // Check if input matches the unlock keyword (case-insensitive)
          // Support both string and array of strings for unlockKeyword
          const unlockKeywords = Array.isArray(checkbox.unlockKeyword)
            ? checkbox.unlockKeyword
            : [checkbox.unlockKeyword];

          let matchedKeyword = null;
          for (const keyword of unlockKeywords) {
            if (
              keyword &&
              (keyword.toLowerCase().includes(searchTerm) ||
                searchTerm.includes(keyword.toLowerCase()))
            ) {
              matchedKeyword = keyword;
              break;
            }
          }

          if (matchedKeyword) {
            // Unlock the mystery!
            this.unlockedMysteries.push(checkboxId);
            this.debouncedSaveState();

            // Show success message and announce the mystery unlock
            this.showMysteryMessage(
              `Mystery unlocked: ${checkbox.title}. New item is now available to complete.`,
              true // isSuccess = true
            );

            return {
              checkboxId: checkboxId,
              title: checkbox.title,
              matchedKeyword: matchedKeyword,
            };
          }
        }
      }

      // No mystery was unlocked, show failure message
      this.showMysteryMessage(
        "No matching mystery found for that keyword.",
        false // isSuccess = false
      );

      return null;
    },

    isMysteryUnlocked(checkboxId) {
      return this.unlockedMysteries.includes(checkboxId);
    },

    getMysteryTitle(checkboxId) {
      const checkbox = this.data.checkboxes[checkboxId];
      if (!checkbox) return "Unknown";

      // Handle regular items (non-mysteries)
      if (!checkbox.unlockKeyword) {
        if (this.checkedItems.includes(checkboxId)) {
          // Checked regular items show full title
          return checkbox.title || "Unknown";
        } else {
          // Unchecked regular items show hint
          return checkbox.hint || checkbox.title || "Unknown";
        }
      }

      // Handle mystery items
      if (!this.unlockedMysteries.includes(checkboxId)) {
        return "???";
      }

      if (this.checkedItems.includes(checkboxId)) {
        return checkbox.title || "Mystery Item";
      }

      return checkbox.hint || checkbox.title || "Mystery Item";
    },

    shouldShowMysteryContent(checkboxId) {
      const checkbox = this.data.checkboxes[checkboxId];
      if (!checkbox || !checkbox.unlockKeyword) {
        return true; // Not a mystery, always show
      }

      // For mysteries, only show full content when both unlocked AND checked
      return (
        this.unlockedMysteries.includes(checkboxId) &&
        this.checkedItems.includes(checkboxId)
      );
    },

    shouldShowMysteryDescription(checkboxId) {
      const checkbox = this.data.checkboxes[checkboxId];
      if (!checkbox) return false;

      if (!checkbox.unlockKeyword) {
        // Regular items: show description only when checked
        return this.checkedItems.includes(checkboxId);
      }

      // For mysteries, only show description when both unlocked AND checked
      return (
        this.unlockedMysteries.includes(checkboxId) &&
        this.checkedItems.includes(checkboxId)
      );
    },

    // Administrative functions
    resetAllProgress() {
      // Reset all state
      this.checkedItems = [];
      this.expandedSections = [];
      this.expandedSubsections = [];
      this.unlockedMysteries = [];

      // Remove the state from localStorage completely
      try {
        localStorage.removeItem("checklist-state");
      } catch (error) {
        console.error("Failed to remove state from localStorage:", error);
      }

      // Announce the reset
      this.announceToScreenReader(
        "All progress has been reset. All items are now unchecked and all sections collapsed.",
        "assertive"
      );

      // Reinitialize swipers after reset
      this.$nextTick(() => {
        this.initializeSwipers();
      });

      console.log("All progress has been reset");
    },

    resetProgress() {
      // Reset all state
      this.checkedItems = [];
      this.expandedSections = [];
      this.expandedSubsections = [];
      this.unlockedMysteries = [];

      // Save the reset state
      this.debouncedSaveState();

      // Announce the reset
      this.announceToScreenReader(
        "All progress has been reset. All items are now unchecked and all sections collapsed.",
        "assertive"
      );

      // Reinitialize swipers after reset
      this.$nextTick(() => {
        this.initializeSwipers();
      });

      console.log("All progress has been reset");
    },

    completeAllProgress() {
      // Check all checkboxes
      this.checkedItems = Object.keys(this.data.checkboxes || {});

      // Unlock all mysteries
      this.unlockedMysteries = Object.keys(this.data.checkboxes || {}).filter(
        (checkboxId) => {
          const checkbox = this.data.checkboxes[checkboxId];
          return checkbox && checkbox.unlockKeyword;
        }
      );

      // Expand all sections and subsections for full visibility
      this.expandedSections = (this.data.sections || []).map(
        (section) => section.id
      );
      this.expandedSubsections = [];
      (this.data.sections || []).forEach((section) => {
        if (section.subsections) {
          section.subsections.forEach((subsection) => {
            this.expandedSubsections.push(subsection.id);
          });
        }
      });

      // Save the state
      this.debouncedSaveState();

      // Announce the completion
      this.announceToScreenReader(
        "All progress completed! All items are now checked, all mysteries unlocked, and all sections expanded. Warning: All spoilers are now visible.",
        "assertive"
      );

      // Reinitialize swipers after completion
      this.$nextTick(() => {
        this.initializeSwipers();
      });

      console.log("All progress has been completed - all secrets revealed!");
    },
  };
}

// Initialize the app when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = checklistApp();
});

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = checklistApp;
}
    // Expand all sections
    expandAllSections() {
      const visibleSections = this.getVisibleSections();
      visibleSections.forEach(section => {
        if (!this.expandedSections.includes(section.id)) {
          this.expandedSections.push(section.id);
        }
      });
      this.debouncedSaveState();
      this.$nextTick(() => {
        this.initializeSwipers();
        this.announceToScreenReader("All sections expanded");
      });
    },

    // Collapse all sections
    collapseAllSections() {
      this.expandedSections = [];
      this.debouncedSaveState();
      this.announceToScreenReader("All sections collapsed");
    },// He
lper function to update navigation visibility for Swiper carousels
function updateNavigationVisibility(swiper) {
  const nextButton = swiper.navigation.nextEl;
  const prevButton = swiper.navigation.prevEl;
  
  if (!nextButton || !prevButton) return;
  
  if (swiper.isBeginning) {
    prevButton.classList.add('swiper-button-disabled');
    prevButton.setAttribute('aria-disabled', 'true');
  } else {
    prevButton.classList.remove('swiper-button-disabled');
    prevButton.setAttribute('aria-disabled', 'false');
  }
  
  if (swiper.isEnd) {
    nextButton.classList.add('swiper-button-disabled');
    nextButton.setAttribute('aria-disabled', 'true');
  } else {
    nextButton.classList.remove('swiper-button-disabled');
    nextButton.setAttribute('aria-disabled', 'false');
  }
  
  // Hide both buttons if there's only one slide
  if (swiper.slides.length <= 1) {
    nextButton.style.display = 'none';
    prevButton.style.display = 'none';
  } else {
    nextButton.style.display = '';
    prevButton.style.display = '';
  }
}    // Sho
w mystery message with stacking support
    showMysteryMessage(message, isSuccess = true) {
      const id = Date.now(); // Unique ID for the message
      
      // Create new message object
      const newMessage = {
        id,
        message,
        isSuccess,
        timestamp: Date.now()
      };
      
      // Add new message to the top of the stack
      this.mysteryMessages.unshift(newMessage);
      
      // Set timeout to remove this specific message
      setTimeout(() => {
        this.mysteryMessages = this.mysteryMessages.filter(msg => msg.id !== id);
      }, 5000); // 5 second timeout
      
      // Announce to screen reader
      this.announceToScreenReader(message, "assertive");
    },