window.checkboxesData = {
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
