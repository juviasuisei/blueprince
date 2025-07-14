window.sectionsData = [
  {
    id: "obj01",
    title: "Objective: Discover the 46th Room",
    color: "blue",
    dependencies: [],
    information: ["obj01_info"],
    checkboxes: ["obj01_1_room46"],
  },
  {
    id: "obj03",
    title: "Objective: Solve the Paintings Puzzle",
    color: "blue",
    dependencies: ["TK"],
    information: [],
    checkboxes: [
      "obj03_r3f3",
      "obj03_r3f5",
      "obj03_r2f2",
      "obj03_r2f3",
      "obj03_r2f4",
      "obj03_r2f5",
      "obj03_r1f1",
      "obj03_r1f3",
      "obj03_r1f4",
    ]
  },
  {
    id: "obj02",
    title: "Objective: Complete the Mount Holly Directory",
    color: "blue",
    mysteryType: "room",
    dependencies: [],
    information: [],
    checkboxes: [
      "obj02_003_spareroom",
      "obj02_005_parlor",
      "obj02_012_storeroom",
      "obj02_021_pantry",
      "obj02_034_security",
      "obj02_045_antechamber",
      "obj02_046_room46",
      "obj02_047_bedroom",
      "obj02_055_hallway",
      "obj02_065_courtyard",
      "obj02_071_commissary",
      "obj02_079_lavatory",
      "obj02_080_chapel",
    ]
  },
  {
    id: "obj05",
    title: "Objective: Discover All the Items",
    color: "blue",
    mysteryType: "item",
    dependencies: [],
    information: [],
    checkboxes: ["obj05_01_sledgehammer"]
  },
  {
    id: "obj04",
    title: "Objective: Solve the Chess Puzzle",
    color: "blue",
    dependencies: ["TK"],
    information: [],
    checkboxes: [
      "obj04_002_entrance",
      "obj04_003_spareroom",
      "obj04_005_parlor",
      "obj04_012_storeroom",
      "obj04_021_pantry",
      "obj04_034_security",
      "obj04_047_bedroom",
    ]
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
        checkboxes: ["dir002_item_blueprint", "dir002_note_letter1", "dir002_note_black", "dir002_person1", "dir002_person2", "dir002_search"],
      },
      {
        id: "dir003",
        title: "003: Spare Room",
        color: "blue",
        dependencies: ["obj02_003_spareroom"],
        information: ["dir003_description"],
        checkboxes: ["dir003_search"],
      },
      {
        id: "dir005",
        title: "005: Parlor",
        color: "blue",
        dependencies: ["obj02_005_parlor"],
        information: ["dir005_description", "dir005_info", "dir005_chess"],
        checkboxes: ["dir005_item_windup", "dir005_note_letter", "dir005_search"],
      },
      {
        id: "dir012",
        title: "012: Storeroom",
        color: "blue",
        dependencies: ["obj02_012_storeroom"],
        information: ["dir012_description", "dir012_info", "dir012_chess"],
        checkboxes: ["dir012_search", "dir012_drawing_identify"],
      },
      {
        id: "dir021",
        title: "021: Pantry",
        color: "blue",
        dependencies: ["obj02_021_pantry"],
        information: ["dir021_description", "dir021_info"],
        checkboxes: ["dir021_note", "dir021_search"],
      },
      {
        id: "dir034",
        title: "034: Security",
        color: "blue",
        dependencies: ["obj02_034_security"],
        information: ["dir034_description", "dir034_info", "dir034_chess"],
        checkboxes: ["dir034_note_pad", "dir034_note_notice", "dir034_note_red", "dir034_note_blue", "obj_network_unlock", "dir034_search"],
      },
      {
        id: "dir045",
        title: "045: Antechamber",
        color: "blue",
        dependencies: ["obj02_045_antechamber"],
        information: ["dir045_description", "dir045_info"],
        checkboxes: [],
      },
      {
        id: "dir046",
        title: "046: Room 46",
        color: "blue",
        dependencies: ["obj02_046_room46"],
        information: ["dir046_description", "dir046_info"],
        checkboxes: [],
      },
      {
        id: "dir047",
        title: "047: Bedroom",
        color: "purple",
        dependencies: ["obj02_047_bedroom"],
        information: ["dir047_description", "dir047_info", "dir047_chess"],
        checkboxes: ["dir047_note_postcard", "dir047_photo", "dir047_photo_identify", "dir047_finger", "dir047_search"],
      },
      {
        id: "dir055",
        title: "055: Hallway",
        color: "orange",
        dependencies: ["obj02_055_hallway"],
        information: ["dir055_description"],
        checkboxes: ["dir055_note_red", "dir055_search"],
      },
      {
        id: "dir065",
        title: "065: Courtyard",
        color: "green",
        dependencies: ["obj02_065_courtyard"],
        information: ["dir065_description"],
        checkboxes: ["dir065_search"],
      },
      {
        id: "dir071",
        title: "071: Commissary",
        color: "gold",
        dependencies: ["obj02_071_commissary"],
        information: ["dir071_description"],
        checkboxes: ["dir071_note_flyer", "dir034_note_notice", "dir071_note_red", "dir071_search"],
      },
      {
        id: "dir079",
        title: "079: Lavatory",
        color: "red",
        dependencies: ["obj02_079_lavatory"],
        information: ["dir079_description", "dir079_info"],
        checkboxes: ["dir079_search"],
      },
      {
        id: "dir080",
        title: "080: Chapel",
        color: "red",
        dependencies: ["obj02_080_chapel"],
        information: ["dir080_description", "dir080_info"],
        checkboxes: ["dir080_search"],
      },
    ],
  },
  {
    id: "info_items",
    title: "Items",
    color: "blue",
    dependencies: [],
    subsections: [
      {
        id: "item01_sledgehammer",
        title: "Sledge Hammer",
        color: "blue",
        dependencies: [],
        information: ["item01_sledgehammer"],
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
        title: "Baron Herbert S. Sinclair",
        color: "blue",
        dependencies: [],
        information: ["person01_herbie_001"],
        checkboxes: [],
      },
      {
        id: "person02_baroness",
        title: "Baroness Auravei Sinclair",
        color: "blue",
        optionalDependencies: true,
        dependencies: ["dir047_photo_identify"],
        information: ["person02_baroness_001"],
        checkboxes: [],
      },
      {
        id: "person03_babbage",
        title: "House Manager Mrs. Babbage",
        color: "blue",
        optionalDependencies: true,
        dependencies: ["dir034_note_notice"],
        information: ["person03_babbage_001"],
        checkboxes: [],
      },
      {
        id: "person04_bridgette",
        title: "Maid Bridgette",
        color: "blue",
        optionalDependencies: true,
        dependencies: ["dir021_note"],
        information: ["person04_bridgette_001"],
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
        information: [
          "note002", // 002 - entrance hall
          "note006", // 005 - parlor
        ],
      },
      {
        id: "info_notes_cards",
        title: "Note Cards",
        color: "blue",
        dependencies: [],
        information: [
          "note001", // opening cinematic
          "note003", // 002 - entrance hall
          "note005", // 012 - storeroom
          "note007", // 021 - pantry
          "note008", // 034 - security
          "note009", // 034 - security
          "note010", // 034 - security
          "note011", // 034 - security
          "note012", // 047 - bedroom
          "note013", // 071 - commissary
          "note014", // 071 - commissary
          "note004", // 055 - hallway
        ],
      },
    ],
  },
];
