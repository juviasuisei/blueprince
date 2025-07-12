window.sectionsData = [
  {
    id: "obj01",
    title: "Objective: Discover the 46th Room",
    color: "blue",
    dependencies: [],
    information: ["obj01_info"]
  },
  {
    id: "info_house",
    title: "Mount Holly Directory",
    color: "blue",
    mysteryType: "room",
    dependencies: [],
    subsections: [
      {
        id: "dir2",
        title: "002: Entrance Hall",
        color: "blue",
        dependencies: [],
        information: ["dir002_description", "dir002_info"],
        checkboxes: ["dir002_item_blueprint", "dir002_note_letter1", "dir002_note_black"],
      },
    ],
  },
  {
    id: "info_people",
    title: "Who's Who?",
    color: "blue",
    dependencies: [],
    subsections: [
      {
        id: "person01_herbie",
        title: "Herbert S. Sinclair",
        color: "blue",
        dependencies: [],
        information: ["person01_herbie_001"],
        checkboxes: [],
      },
    ],
  },
  {
    id: "info_timeline",
    title: "The Timeline",
    color: "blue",
    dependencies: [],
    information: ["date001"],
    checkboxes: [],
  },
  {
    id: "info_notes",
    title: "Letters & Notes",
    color: "blue",
    dependencies: [],
    subsections: [
      {
        id: "info_notes_letters",
        title: "Letters",
        color: "blue",
        dependencies: ["dir002_note_letter1"],
        information: ["note002"],
      },
      {
        id: "info_notes_cards",
        title: "Note Cards",
        color: "blue",
        dependencies: [],
        information: ["note001", "note003"],
      },
    ],
  },
];
