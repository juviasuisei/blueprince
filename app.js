function checklistApp() {
  return {
    data: {},
    checkedItems: [],
    expandedSections: [],
    expandedSubsections: [],
    swipers: {},
    dataLoadError: false,
    unlockedMysteries: [],
    showResetConfirm: false,

    async init() {
      await this.loadData();
      this.loadState();
      this.$nextTick(() => {
        this.initializeSwipers();
      });
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
        this.data = { sections: [], checkboxes: {} }; // Empty structure to prevent errors
        return;
      }

      console.log("Data loaded from data.js:", this.data);
      this.dataLoadError = false;
    },

    loadState() {
      const saved = localStorage.getItem("checklist-state");
      if (saved) {
        const state = JSON.parse(saved);
        this.checkedItems = state.checkedItems || [];
        this.expandedSections = state.expandedSections || [];
        this.expandedSubsections = state.expandedSubsections || [];
        this.unlockedMysteries = state.unlockedMysteries || [];
      }
    },

    saveState() {
      const state = {
        checkedItems: this.checkedItems,
        expandedSections: this.expandedSections,
        expandedSubsections: this.expandedSubsections,
        unlockedMysteries: this.unlockedMysteries,
      };
      localStorage.setItem("checklist-state", JSON.stringify(state));
    },

    toggleCheckbox(checkboxId) {
      const index = this.checkedItems.indexOf(checkboxId);
      if (index > -1) {
        this.checkedItems.splice(index, 1);
      } else {
        this.checkedItems.push(checkboxId);
      }

      // Handle cloned checkboxes - if this checkbox appears in multiple sections
      const checkbox = this.data.checkboxes[checkboxId];
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

      this.saveState();
      this.$nextTick(() => {
        this.initializeSwipers();
      });
    },

    toggleSection(sectionId) {
      const index = this.expandedSections.indexOf(sectionId);
      if (index > -1) {
        this.expandedSections.splice(index, 1);
      } else {
        this.expandedSections.push(sectionId);
      }
      this.saveState();
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
      this.saveState();
      this.$nextTick(() => {
        this.initializeSwipers();
      });
    },

    checkDependencies(dependencies) {
      if (!dependencies || dependencies.length === 0) return true;
      return dependencies.every((dep) => this.checkedItems.includes(dep));
    },

    getVisibleSections() {
      if (!this.data.sections) return [];
      return this.data.sections.filter((section) =>
        this.checkDependencies(section.dependencies)
      );
    },

    getVisibleSubsections(sectionId) {
      const section = this.data.sections?.find((s) => s.id === sectionId);
      if (!section || !section.subsections) return [];
      return section.subsections.filter((subsection) =>
        this.checkDependencies(subsection.dependencies)
      );
    },

    getVisibleCheckboxes(checkboxIds) {
      if (!checkboxIds || !this.data.checkboxes) return [];
      return checkboxIds.filter((id) => {
        const checkbox = this.data.checkboxes[id];
        return checkbox && this.checkDependencies(checkbox.dependencies);
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

    initializeSwiper(swiperId, color) {
      // Initialize a specific Swiper instance
      if (!this.swipers[swiperId]) {
        // Use a longer timeout and check for slide count
        setTimeout(() => {
          const swiperEl = document.getElementById(swiperId);
          if (swiperEl) {
            const slides = swiperEl.querySelectorAll(".swiper-slide");
            const slideCount = slides.length;

            console.log(
              "Initializing Swiper:",
              swiperId,
              "with",
              slideCount,
              "slides",
              "color:",
              color
            );

            // Apply dynamic colors to swiper controls
            if (color) {
              const nextBtn = swiperEl.querySelector(".swiper-button-next");
              const prevBtn = swiperEl.querySelector(".swiper-button-prev");
              if (nextBtn) nextBtn.style.color = color;
              if (prevBtn) prevBtn.style.color = color;
            }

            // Only enable loop if we have more than 2 slides
            const enableLoop = slideCount > 2;

            this.swipers[swiperId] = new Swiper(`#${swiperId}`, {
              navigation: {
                nextEl: `#${swiperId} .swiper-button-next`,
                prevEl: `#${swiperId} .swiper-button-prev`,
              },
              pagination: {
                el: `#${swiperId} .swiper-pagination`,
                clickable: true,
              },
              loop: enableLoop,
              autoHeight: true,
              spaceBetween: 10,
              // Ensure proper initialization
              observer: true,
              observeParents: true,
              // Add some resistance for better UX when not looping
              resistance: true,
              resistanceRatio: 0.85,
              // Custom pagination styling
              on: {
                init: function () {
                  if (color) {
                    // Apply color to active pagination bullet
                    const activeBullet = swiperEl.querySelector(
                      ".swiper-pagination-bullet-active"
                    );
                    if (activeBullet) {
                      activeBullet.style.backgroundColor = color;
                    }
                  }
                },
                slideChange: function () {
                  if (color) {
                    // Apply color to active pagination bullet on slide change
                    const activeBullet = swiperEl.querySelector(
                      ".swiper-pagination-bullet-active"
                    );
                    if (activeBullet) {
                      activeBullet.style.backgroundColor = color;
                    }
                  }
                },
              },
            });

            // Force update after initialization
            setTimeout(() => {
              if (
                this.swipers[swiperId] &&
                typeof this.swipers[swiperId].update === "function"
              ) {
                this.swipers[swiperId].update();
              }
              // Apply colors again after update
              if (color) {
                const nextBtn = swiperEl.querySelector(".swiper-button-next");
                const prevBtn = swiperEl.querySelector(".swiper-button-prev");
                const activeBullet = swiperEl.querySelector(
                  ".swiper-pagination-bullet-active"
                );
                if (nextBtn) nextBtn.style.color = color;
                if (prevBtn) prevBtn.style.color = color;
                if (activeBullet) activeBullet.style.backgroundColor = color;
              }
            }, 50);
          }
        }, 200); // Increased timeout for better reliability
      }
    },

    initializeSwipers() {
      // Initialize Swiper for any new carousels
      document.querySelectorAll(".swiper").forEach((swiperEl) => {
        const id = swiperEl.id;
        if (!this.swipers[id]) {
          this.initializeSwiper(id);
        }
      });
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

    // Mystery functionality
    hasMysteries(checkboxIds) {
      if (!checkboxIds || !this.data.checkboxes) return false;
      return checkboxIds.some((id) => {
        const checkbox = this.data.checkboxes[id];
        return (
          checkbox &&
          checkbox.type === "mystery" &&
          this.checkDependencies(checkbox.dependencies) &&
          !this.unlockedMysteries.includes(id) // Only show input if there are unrevealed mysteries
        );
      });
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
          checkbox.type === "mystery" &&
          !this.unlockedMysteries.includes(checkboxId) &&
          this.checkDependencies(checkbox.dependencies)
        ) {
          // Check if input matches the unlock keyword (case-insensitive)
          if (
            checkbox.unlockKeyword &&
            (checkbox.unlockKeyword.toLowerCase().includes(searchTerm) ||
              searchTerm.includes(checkbox.unlockKeyword.toLowerCase()))
          ) {
            // Unlock the mystery!
            this.unlockedMysteries.push(checkboxId);
            this.saveState();
            return {
              checkboxId: checkboxId,
              title: checkbox.title,
              matchedKeyword: checkbox.unlockKeyword,
            };
          }
        }
      }

      return null;
    },

    isMysteryUnlocked(checkboxId) {
      return this.unlockedMysteries.includes(checkboxId);
    },

    getMysteryTitle(checkboxId) {
      const checkbox = this.data.checkboxes[checkboxId];
      if (!checkbox) return "";

      // For mysteries: show "???" if not unlocked, otherwise follow normal logic
      if (checkbox.type === "mystery" && !this.isMysteryUnlocked(checkboxId)) {
        return "???";
      }

      // For all checkboxes (including unlocked mysteries): show hint when unchecked, title when checked
      if (this.checkedItems.includes(checkboxId)) {
        return checkbox.title;
      } else {
        return checkbox.hint || checkbox.title;
      }
    },

    shouldShowMysteryContent(checkboxId) {
      const checkbox = this.data.checkboxes[checkboxId];
      if (!checkbox) return false;

      // For mysteries: only show content if unlocked AND checked
      if (checkbox.type === "mystery") {
        return (
          this.isMysteryUnlocked(checkboxId) &&
          this.checkedItems.includes(checkboxId)
        );
      }

      // For regular checkboxes: only show content when checked
      return this.checkedItems.includes(checkboxId);
    },

    getMysteryType(checkboxIds) {
      if (!checkboxIds || !this.data.sections) return "Mystery Discovery";

      // Check if there are any unrevealed mysteries in this scope first
      const hasUnrevealedMysteries = checkboxIds.some((checkboxId) => {
        const checkbox = this.data.checkboxes[checkboxId];
        return (
          checkbox &&
          checkbox.type === "mystery" &&
          this.checkDependencies(checkbox.dependencies) &&
          !this.unlockedMysteries.includes(checkboxId)
        );
      });

      if (!hasUnrevealedMysteries) return "Mystery Discovery";

      // Find which section/subsection contains these checkboxes
      for (const section of this.data.sections) {
        // Check if this is a section with direct checkboxes
        if (
          section.checkboxes &&
          checkboxIds.every((id) => section.checkboxes.includes(id))
        ) {
          return section.mysteryType || "Mystery Discovery";
        }

        // Check subsections
        if (section.subsections) {
          for (const subsection of section.subsections) {
            if (
              subsection.checkboxes &&
              checkboxIds.every((id) => subsection.checkboxes.includes(id))
            ) {
              return subsection.mysteryType || "Mystery Discovery";
            }
          }
        }
      }

      return "Mystery Discovery"; // Fallback
    },

    resetAllProgress() {
      // Clear all progress
      this.checkedItems = [];
      this.unlockedMysteries = [];
      this.expandedSections = [];
      this.expandedSubsections = [];

      // Clear localStorage
      localStorage.removeItem("checklist-state");

      // Reinitialize swipers after reset
      this.$nextTick(() => {
        this.initializeSwipers();
      });

      console.log("All progress has been reset");
    },
  };
}
