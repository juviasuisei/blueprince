window.sectionsData = [
  {
    id: "obj01",
    title: "Objective: Discover the 46th Room",
    color: "blue",
    dependencies: [],
    information: ["obj01_info"]
  },
  {
    id: "obj03",
    title: "Objective: Solve the Paintings Puzzle",
    color: "blue",
    dependencies: ["TK"],
    checkboxes: ["obj03_r1f3"]
  },
  {
    id: "obj02",
    title: "Objective: Complete the Mount Holly Directory",
    color: "blue",
    mysteryType: "room",
    dependencies: [],
    information: ["obj02_info"],
    checkboxes: ["obj02_045", "obj02_046"]
  },
  {
    id: "info_house",
    title: "Mount Holly Directory",
    color: "blue",
    dependencies: [],
    subsections: [
      {
        id: "dir002",
        title: "002: Entrance Hall",
        color: "blue",
        dependencies: [],
        information: ["dir002_description", "dir002_info"],
        checkboxes: ["dir002_item_blueprint", "dir002_note_letter1", "dir002_note_black", "dir002_person1", "dir002_person2"],
      },
      {
        id: "dir045",
        title: "045: Antechamber",
        color: "blue",
        dependencies: ["obj02_045"],
        information: ["dir045_description", "dir045_info"],
        checkboxes: [],
      },
      {
        id: "dir046",
        title: "046: Room 46",
        color: "blue",
        dependencies: ["obj02_046"],
        information: ["dir046_description", "dir046_info"],
        checkboxes: [],
      },
      {
        id: "dir055",
        title: "055: Antechamber",
        color: "orange",
        dependencies: ["obj02_055"],
        information: ["dir055_description", "dir055_info"],
        checkboxes: [],
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
