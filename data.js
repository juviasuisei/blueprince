// Main data aggregator - combines data from separate files
window.checklistData = {
  version: "0.17.2",
  sections: window.sectionsData || [],
  checkboxes: window.checkboxesData || {},
  information: window.informationData || {},
};
