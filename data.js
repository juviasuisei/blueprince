// Main data aggregator - combines data from separate files
window.checklistData = {
  version: "0.12.4",
  sections: window.sectionsData || [],
  checkboxes: window.checkboxesData || {},
  information: window.informationData || {},
};
