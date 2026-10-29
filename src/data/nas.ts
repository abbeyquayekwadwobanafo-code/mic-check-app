export type Question = {
  category: string;
  question: string;
  options: string[];
  answer: number; // position of the correct option, starting from 0
};

export const nasQuestions: Question[] = [
  {
    category: "Facts",
    question: "What is Nas's real first name?",
    options: ["Nasir", "Nathaniel", "Nelson", "Nathan"],
    answer: 0,
  },
  {
    category: "Facts",
    question: "Which housing project in Queens did Nas grow up in?",
    options: ["Marcy Houses", "Queensbridge Houses", "Polo Grounds", "Lefrak City"],
    answer: 1,
  },
  {
    category: "Discography",
    question: "What was Nas's debut studio album?",
    options: ["It Was Written", "Stillmatic", "Illmatic", "God's Son"],
    answer: 2,
  },
  {
    category: "Discography",
    question: "In what year was Illmatic released?",
    options: ["1992", "1996", "1999", "1994"],
    answer: 3,
  },
  {
    category: "Track Numbers",
    question: "What track number is \"N.Y. State of Mind\" on Illmatic?",
    options: ["1", "2", "3", "4"],
    answer: 1,
  },
  {
    category: "Track Numbers",
    question: "Which track opens Illmatic?",
    options: ["The Genesis", "N.Y. State of Mind", "Halftime", "One Love"],
    answer: 0,
  },
  {
    category: "Discography",
    question: "\"Ether\" appears on which Nas album?",
    options: ["Illmatic", "Nastradamus", "Stillmatic", "Hip Hop Is Dead"],
    answer: 2,
  },
  {
    category: "Discography",
    question: "Which album features \"If I Ruled the World (Imagine That)\"?",
    options: ["Illmatic", "It Was Written", "Nastradamus", "I Am..."],
    answer: 1,
  },
  {
    category: "Facts",
    question: "Nas's father, Olu Dara, is best known as a:",
    options: ["Jazz musician", "Football coach", "Film director", "Poet"],
    answer: 0,
  },
  {
    category: "Discography",
    question: "Nas teamed up with Damian Marley for which album?",
    options: ["Life Is Good", "Distant Relatives", "Untitled", "King's Disease"],
    answer: 1,
  },
];