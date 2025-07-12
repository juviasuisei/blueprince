window.checkboxesData = {
  obj01_1_room46: {
    title: "Enter Room 46",
    hint: "Enter Room 46",
    description: "You have fullfilled your uncle's challenge.",
    dependencies: [],
  },
  obj03_r1f3: {
    title: "Rank 1 • File 3: F",
    hint: "Rank 1 • File 3: ???",
    description: "[F]ACE",
    dependencies: [],
    images: [
      {
        url: "images/obj03_r1f3_L.jpeg",
        caption: "face"
      },
      {
        url: "images/obj03_r1f3_R.jpeg",
        caption: "ace"
      },
    ],
  },
  dir002_item_blueprint: {
    title: "Item: The Mount Holly Estate Blueprint",
    hint: "Item: ???",
    description: "This will serve as a useful map and inventory log during your adventure.",
    dependencies: [],
    images: [
      {
        url: "images/dir002_item_blueprint.jpeg",
        caption: "a brand new, empty Mount Holly Estate Blueprint"
      },
    ],
  },
  dir002_note_letter1: {
    title: "Letter: open only in the event of my death",
    hint: "Letter: ???",
    description: "Simon, Welcome to Mount Holly. You may not remember but I have fond memories of your many visits here as a young boy and I hope these rooms provide you with as much amusement as it did in those lost summer days. By the time you read this I will assume you are fully aware of my last wishes and all the details of the bequest. Please do not mistake my intentions in giving you this challenge as a lack of confidence. I assure you, nothing could have been further from my mind when I chose you as my heir. With that said, there are a few ground rules of this commision covered in the fine print of my will that I feel I should bring to your attention: NO TOOLS OR ITEMS MAY BE BROUGHT ONTO THE ESTATE FROM THE OUTSIDE. TOOLS & ITEMS FOUND ON THE ESTATE MAY NOT BE TAKEN OFF THE ESTATE. YOU MAY NOT STAY OVERNIGHT. I don't suspect that any of these stipulations should prove an impediment for someone as resourceful as yourself but it is very important to me that you \"start fresh\" each morning and not rely on the successes of the previous day. One final word of advice: Do not assume the rooms you find today will be the same rooms you find tomorrow. These grounds have provided me a home for the last half century and even I am uncertain of which room lies beyond any particular door. Your grandmother used to say, \"Don't go where the path leads. Abandon the path and go where you want it to lead.\" With all my love and wishes, Best of luck, Herbert S. Sinclair",
    dependencies: [],
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
  dir002_note_black: {
    title: "Black Note: SEARCHING THE ESTATE CAN BE EXHAUSTING",
    hint: "Black Note: ???",
    description: "EACH TIME YOU ENTER A ROOM YOU WILL LOSE 1 STEP. WHEN YOU NO LONGER HAVE ANY STEPS LEFT, YOU WILL BE TOO TIRED TO CONTINUE SEARCHING THE MANOR AND MUST CALL IT A DAY.",
    dependencies: [],
    images: [
      {
        url: "images/note003.jpeg",
        caption: "steps explainer"
      },
    ],
  },
  dir002_person1: {
    title: "Left Bust: TK",
    hint: "Identify the Bust on the Left",
    description: "TK",
    dependencies: [],
    images: [
      {
        url: "images/dir002_person1.jpeg",
        caption: "TK"
      },
    ],
  },
  dir002_person1: {
    title: "Right Bust: TK",
    hint: "Identify the Bust on the Right",
    description: "TK",
    dependencies: [],
    images: [
      {
        url: "images/dir002_person2.jpeg",
        caption: "TK"
      },
    ],
  },
  setup: {
    title: "Initial Setup",
    hint: "temp setup",
    description: "Complete the basic setup process to unlock more options.",
    dependencies: [],
  },
  "first-step": {
    title: "First Achievement",
    hint: "temp first-step",
    description: "Your first milestone on this journey.",
    dependencies: ["setup"],
    images: [
      {
        url: "https://picsum.photos/400/200?random=1",
        caption: "Congratulations on your first step!",
      },
    ],
  },
  "second-step": {
    title: "Building Momentum",
    hint: "temp second-step",
    description: "Now you're getting the hang of it.",
    dependencies: ["first-step"],
  },
  "third-step": {
    title: "Gaining Confidence",
    hint: "temp third-step",
    description: "You're really making progress now.",
    dependencies: ["second-step"],
    images: [
      {
        url: "https://picsum.photos/400/200?random=2",
        caption: "First example of your progress",
      },
      {
        url: "https://picsum.photos/400/200?random=3",
        caption: "Another view of your achievement",
      },
    ],
  },
  "skill-1": {
    title: "New Skill Unlocked",
    hint: "temp skill-1",
    description: "You've developed a valuable new ability.",
    dependencies: ["third-step"],
  },
  "skill-2": {
    title: "Skill Mastery",
    hint: "temp skill-2",
    description: "You're becoming quite skilled at this.",
    dependencies: ["skill-1"],
  },
  "mastery-1": {
    title: "Expert Level",
    hint: "temp mastery-1",
    description: "You've reached expert status in this area.",
    dependencies: ["skill-1", "skill-2"],
  },
  "mastery-2": {
    title: "Master Achievement",
    hint: "temp mastery-2",
    description: "The ultimate achievement - you've mastered everything!",
    dependencies: ["mastery-1"],
    images: [
      {
        url: "https://picsum.photos/400/200?random=4",
        caption: "You are now a master!",
      },
    ],
  },
  "secret-1": {
    title: "Ancient Knowledge",
    hint: "temp secret-1",
    type: "mystery",
    unlockKeyword: "ancient",
    description:
      "You've discovered something that was hidden from view. The ancient scrolls speak of forgotten wisdom.",
    dependencies: [],
    images: [
      {
        url: "https://picsum.photos/400/200?random=5",
        caption: "Mysteries of the past revealed",
      },
    ],
  },
  "secret-2": {
    title: "Forbidden Wisdom",
    hint: "temp secret-2",
    type: "mystery",
    unlockKeyword: "forbidden",
    description:
      "Knowledge that few have ever possessed. This wisdom was hidden for good reason.",
    dependencies: ["secret-1"],
  },
  "secret-3": {
    title: "Ultimate Truth",
    hint: "temp secret-3",
    type: "mystery",
    unlockKeyword: "truth",
    description:
      "The final piece of the puzzle. You now understand the true nature of everything.",
    dependencies: ["secret-2"],
    images: [
      {
        url: "https://picsum.photos/400/200?random=6",
        caption: "The journey is complete",
      },
    ],
  },
  "hidden-skill": {
    title: "Shadow Technique",
    hint: "temp hidden-skill",
    type: "mystery",
    unlockKeyword: "shadow",
    description:
      "A technique so advanced, it was thought to be legend. You can now move unseen.",
    dependencies: ["skill-2"],
    images: [
      {
        url: "https://picsum.photos/400/200?random=7",
        caption: "Master of shadows",
      },
    ],
  },
  "easter-egg": {
    title: "Developer's Secret",
    hint: "temp easter-egg",
    type: "mystery",
    unlockKeyword: "konami",
    description:
      "You found the developer's hidden easter egg! This wasn't supposed to be discoverable.",
    dependencies: [],
    images: [
      {
        url: "https://picsum.photos/400/200?random=8",
        caption: "Behind the scenes",
      },
    ],
  },
};
