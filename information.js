window.informationData = {
  obj01_info: {
    title: "Your Uncle's Will Has a Challenge In It",
    description: "I, Herbert S. Sinclair, of the Mount Holly Estate at Reddington, do publish, and declare this instrument, my last will and testament, and hereby revoke all wills and codicils heretofore made my me. I give and bequeath to my grandnephew, Simon P. Jones, son of my dear niece Mary Matthew, all of my right, title and interest in and to the house and land which I own near Mount Holly. The above provision and bequest is contingent on my aforementioned grandnephew discovering the location of the 46th room of my forty-five room estate. The location of the room has been kept a secret from all of the staff and servants of the manor, but I am confident that any heir worthy of the Sinclair legacy should have no trouble uncovering its whereabouts within a timely manner. Should my grandnephew fail to uncover this room or provide proof of his discovery to the executors of my will then this gift shall lapse. In witness whereof, I have hereunto set my hand this 18th day of March, 1993.",
    dependencies: [],
  },
  obj02_info: {
    title: "Gotta Catch 'Em All",
    description: "To prevent spoilers the list of checkboxes for each room are not shown by default. As you see rooms in your drafting pool, type their name below to add them to the tracker.",
    dependencies: [],
  },
  dir002_description: {
    title: "Description",
    description: "Past the steps and beyond the grand doors, admission to Mount Holly is granted by way of a dark and garish lobby, suitably called the Entrance Hall. From here, each guest's adventure begins; however, the three doors that proceed onward do not always lead to the same adjoining rooms....",
    dependencies: [],
    images: [
      {
        url: "images/dir002_description.jpeg",
        caption: "room directory entry"
      },
    ],
  },
  dir002_info: {
    title: "Classification",
    description: "TYPE: Permanent",
    dependencies: [],
  },
  dir003_description: {
    title: "Description",
    description: "An unfurnished, unfinished, and otherwise unremarkable empty room. If there had at some point been plans for this spare room, it would seem those designs are now long forgotten.",
    dependencies: [],
    images: [
      {
        url: "images/dir003_description.jpeg",
        caption: "room directory entry"
      },
    ],
  },
  dir005_description: {
    title: "Description",
    description: "This cozy lounge furnished with couches and armchairs serves as the perfect social setting for receptions and after parties. Consequently this was one of the most popular rooms for entertaining and the late H. S. Sinclair was known to supply a myriad of parlor games to encourage his guests to think and conversate.",
    dependencies: [],
    images: [
      {
        url: "images/dir005_description.jpeg",
        caption: "room directory entry"
      },
    ],
  },
  dir005_info: {
    title: "Classification",
    description: "TYPE: Puzzle",
    dependencies: [],
  },
  dir005_chess: {
    title: "Chess Piece",
    description: "Black Pawn",
    dependencies: ["obj04_005_parlor"],
    images: [
      {
        url: "images/obj04_005_parlor.jpeg",
        caption: "black pawn"
      },
    ],
  },
  dir012_description: {
    title: "Description",
    description: "A dedicated storage space filled from end to end with a surplus of chairs, carpets, paintings, and a handful of other things that had at one time been in vogue and on display elsewhere in the house.",
    dependencies: [],
    images: [
      {
        url: "images/dir012_description.jpeg",
        caption: "room directory entry"
      },
    ],
  },
  dir012_info: {
    title: "Classification",
    description: "TYPE: Dead End",
    dependencies: [],
  },
  dir012_chess: {
    title: "Chess Piece",
    description: "White Pawn",
    dependencies: ["obj04_012_storeroom"],
    images: [
      {
        url: "images/obj04_012_storeroom.jpeg",
        caption: "white pawn"
      },
    ],
  },
  dir045_description: {
    title: "Description",
    description: "From its root meaning \"The Room Before\", all signs and paths point toward the Antechamber. This mysterious sealed room — resting on the 9th Rank — may prove, however, quite an initial challenge to even reach, let alone enter. Still, you can't help but draw a connection between this chamber and Room 46.",
    dependencies: [],
    images: [
      {
        url: "images/dir045_description.jpeg",
        caption: "room directory entry"
      },
    ],
  },
  dir045_info: {
    title: "Classification",
    description: "TYPE: Objective",
    dependencies: [],
  },
  dir046_description: {
    title: "Description",
    description: "The mysterious room mentioned in H. S. Sinclair's will, named only by a number. Despite the house's official blueprint only showing a total of 45 rooms, the words of the legal document make it apparent that a 46th room in the house in fact exists. Finding this room is your primary objective while on the estate. It is after all, your bequest.",
    dependencies: [],
    images: [
      {
        url: "images/dir046_description.jpeg",
        caption: "room directory entry"
      },
    ],
  },
  dir046_info: {
    title: "Classification",
    description: "TYPE: Objective",
    dependencies: [],
  },
  dir055_description: {
    title: "Description",
    description: "One of the many nondescript hallways snaking through the estate and providing elegant causeways between the more noteworthy destinations that the house has to offer.",
    dependencies: [],
    images: [
      {
        url: "images/dir055_description.jpeg",
        caption: "room directory entry"
      },
    ],
  },
  dir055_info: {
    title: "Classification",
    description: "TYPE: Hallway",
    dependencies: [],
  },
  note001: {
    title: "Recital Invitation",
    description: "",
    dependencies: [],
    images: [
      {
        url: "images/note001.jpeg",
        caption: "from the opening cinematic"
      },
    ],
  },
  note002: {
    title: "open only in the event of my death",
    description: "",
    dependencies: ["dir002_note_letter1"],
    images: [
      {
        url: "images/note002_1.jpeg",
        caption: "envelope"
      },
      {
        url: "images/note002_2.jpeg",
        caption: "page 1"
      },
      {
        url: "images/note002_3.jpeg",
        caption: "page 2"
      },
      {
        url: "images/note002_4.jpeg",
        caption: "page 3"
      },
    ],
  },
  note003: {
    title: "Black Note: SEARCHING THE ESTATE CAN BE EXHAUSTING",
    description: "",
    dependencies: ["dir002_note_black"],
    images: [
      {
        url: "images/note003.jpeg",
        caption: "steps explainer"
      },
    ],
  },
  note004: {
    title: "Red Note: Hallway",
    description: "",
    dependencies: ["dir004_note_red"],
    images: [
      {
        url: "images/note004.jpeg",
        caption: "a red typed note"
      },
    ],
  },
  note005: {
    title: "Drawing: Swimbird",
    description: "This is from the children's book Swimbird by our mother.",
    dependencies: ["dir012_drawing_identify"],
    images: [
      {
        url: "images/note005.jpeg",
        caption: "a hand drawn color depiction of a blue bird wearing a swim cap and a blue-striped swimsuit "
      },
    ],
  },
  note006: {
    title: "Parlor Game Rules",
    description: "",
    dependencies: ["dir005_note_letter"],
    images: [
      {
        url: "images/note006_1.jpeg",
        caption: "letter"
      },
      {
        url: "images/note006_2.jpeg",
        caption: "parlor game rules"
      },
    ],
  },
  person01_herbie_001: {
    title: "Initial Information",
    description: "Herbert S. Sinclair is our granduncle and prior to his death, he was the owner of the Mount Holly Estate. He left us the estate in his will if we complete his challenge.",
    dependencies: [],
    images: [
      {
        url: "images/person01_herbie.jpeg",
        caption: "portrait of Herbert S. Sinclair"
      },
    ]
  },
  date001: {
    title: "Thursday, 18 March 1993",
    description: "Herbert S. Sinclair updates his will.",
    dependencies: [],
  },
};
