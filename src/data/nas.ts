export type Question = {
  category: string;
  question: string;
  options: string[];
  answer: number; // position of the correct option, starting from 0
};

export const nasQuestions: Question[] = [
  // Facts
  { category: "Facts", question: "What is Nas's real name?", options: ["Nasir Jones", "Nathan Jones", "Nelson Jones", "Nasim Jones"], answer: 0 },
  { category: "Facts", question: "Which housing project did Nas grow up in?", options: ["Marcy Houses", "Polo Grounds", "Queensbridge Houses", "Lefrak City"], answer: 2 },
  { category: "Facts", question: "In which NYC borough was Nas born?", options: ["Manhattan", "Brooklyn", "Queens", "The Bronx"], answer: 1 },
  { category: "Facts", question: "Which instrument is his father, Olu Dara, famous for playing?", options: ["Saxophone", "Cornet", "Drums", "Piano"], answer: 1 },
  { category: "Facts", question: "In which year was Nas born?", options: ["1971", "1973", "1975", "1977"], answer: 1 },
  { category: "Facts", question: "Which label released Illmatic?", options: ["Def Jam", "Columbia Records", "Bad Boy", "Roc-A-Fella"], answer: 1 },
  { category: "Facts", question: "How old was Nas in the photo on the Illmatic cover?", options: ["7", "5", "10", "12"], answer: 0 },
  { category: "Facts", question: "The Source magazine gave Illmatic how many mics?", options: ["3", "4", "5", "6"], answer: 2 },
  { category: "Facts", question: "On which 1991 Main Source track did Nas make his recorded debut?", options: ["Looking at the Front Door", "Live at the BBQ", "Just Hangin' Out", "Peace Is Not the Word to Play"], answer: 1 },
  { category: "Facts", question: "What name was Nas credited under on that track?", options: ["Nasty Nas", "Nas Escobar", "Nasir Jones", "Mr. Queens"], answer: 0 },
  { category: "Facts", question: "Which university named a hip-hop fellowship after him in 2013?", options: ["Yale", "Columbia", "NYU", "Harvard"], answer: 3 },
  { category: "Facts", question: "What is the name of the venture capital firm Nas co-founded?", options: ["Illmatic Capital", "Mass Appeal Ventures", "QueensBridge Venture Partners", "Escobar Group"], answer: 2 },
  { category: "Facts", question: "Nas's younger brother Jungle was part of which group?", options: ["Dipset", "Bravehearts", "Boot Camp Clik", "Juice Crew"], answer: 1 },
  { category: "Facts", question: "What is the name of Nas's father, a jazz musician?", options: ["Max Roach", "Olu Dara", "Miles Davis", "Quincy Jones"], answer: 1 },
  { category: "Facts", question: "Which alias did Nas use on It Was Written?", options: ["Nas Capone", "Nas Escobar", "Nasty Nick", "Nasir Gotti"], answer: 1 },

  // Discography
  { category: "Discography", question: "What was Nas's debut studio album?", options: ["Illmatic", "It Was Written", "Stillmatic", "God's Son"], answer: 0 },
  { category: "Discography", question: "In which year was Illmatic released?", options: ["1992", "1994", "1996", "1998"], answer: 1 },
  { category: "Discography", question: "How many tracks are on Illmatic?", options: ["8", "9", "10", "12"], answer: 2 },
  { category: "Discography", question: "In which year was It Was Written released?", options: ["1995", "1996", "1997", "1999"], answer: 1 },
  { category: "Discography", question: "In which year was Stillmatic released?", options: ["2001", "2000", "2002", "2004"], answer: 0 },
  { category: "Discography", question: "In which year was God's Son released?", options: ["2000", "2001", "2002", "2003"], answer: 2 },
  { category: "Discography", question: "In which year was Nastradamus released?", options: ["1998", "1999", "2000", "2001"], answer: 1 },
  { category: "Discography", question: "Which 2006 album declared a genre dead?", options: ["Hip Hop Is Dead", "Untitled", "Street's Disciple", "Life Is Good"], answer: 0 },
  { category: "Discography", question: "In which year was Life Is Good released?", options: ["2010", "2012", "2014", "2016"], answer: 1 },
  { category: "Discography", question: "Which reggae artist joined him for Distant Relatives?", options: ["Damian Marley", "Ziggy Marley", "Stephen Marley", "Wyclef Jean"], answer: 0 },
  { category: "Discography", question: "Which producer made the 2018 album Nasir?", options: ["Pharrell Williams", "Kanye West", "Hit-Boy", "DJ Khaled"], answer: 1 },
  { category: "Discography", question: "Which Nas album won the Grammy for Best Rap Album?", options: ["Nasir", "Life Is Good", "King's Disease", "Magic"], answer: 2 },
  { category: "Discography", question: "Which producer worked on the King's Disease series?", options: ["Hit-Boy", "Metro Boomin", "Mike WiLL Made-It", "Zaytoven"], answer: 0 },
  { category: "Discography", question: "In which year was King's Disease released?", options: ["2019", "2020", "2021", "2022"], answer: 1 },
  { category: "Discography", question: "In which year was King's Disease II released?", options: ["2020", "2021", "2022", "2023"], answer: 1 },

  // Songs
  { category: "Songs", question: "Which singer is featured on \"If I Ruled the World (Imagine That)\"?", options: ["Lauryn Hill", "Mary J. Blige", "Alicia Keys", "Faith Evans"], answer: 0 },
  { category: "Songs", question: "\"Ether\" was a response to which Jay-Z track?", options: ["Takeover", "99 Problems", "Dirt Off Your Shoulder", "Empire State of Mind"], answer: 0 },
  { category: "Songs", question: "\"Made You Look\" is from which album?", options: ["God's Son", "Stillmatic", "Street's Disciple", "Untitled"], answer: 0 },
  { category: "Songs", question: "\"I Can\" samples which classical piece?", options: ["Für Elise", "Moonlight Sonata", "The Four Seasons", "Clair de Lune"], answer: 0 },
  { category: "Songs", question: "Which artist is featured on \"Hate Me Now\"?", options: ["Puff Daddy", "Jay-Z", "Jadakiss", "DMX"], answer: 0 },
  { category: "Songs", question: "\"The Message\" is from which album?", options: ["Illmatic", "It Was Written", "Stillmatic", "I Am..."], answer: 1 },
  { category: "Songs", question: "\"The World Is Yours\" is from which album?", options: ["Stillmatic", "It Was Written", "Illmatic", "God's Son"], answer: 2 },
  { category: "Songs", question: "Which producer made \"N.Y. State of Mind\"?", options: ["Pete Rock", "DJ Premier", "Large Professor", "Q-Tip"], answer: 1 },
  { category: "Songs", question: "Which A Tribe Called Quest member produced \"One Love\"?", options: ["Ali Shaheed Muhammad", "Phife Dawg", "Jarobi", "Q-Tip"], answer: 3 },
  { category: "Songs", question: "\"Street Dreams\" is from which album?", options: ["Illmatic", "It Was Written", "I Am...", "Stillmatic"], answer: 1 },
  { category: "Songs", question: "\"One Mic\" is from which album?", options: ["Stillmatic", "God's Son", "Street's Disciple", "Untitled"], answer: 0 },
  { category: "Songs", question: "\"Nas Is Like\" is from which album?", options: ["Illmatic", "It Was Written", "I Am...", "Nastradamus"], answer: 2 },
  { category: "Songs", question: "Which artist is featured on \"Hip Hop Is Dead\"?", options: ["Pharrell", "Timbaland", "Swizz Beatz", "will.i.am"], answer: 3 },
  { category: "Track Numbers", question: "What track number is \"The World Is Yours\" on Illmatic?", options: ["2", "3", "4", "5"], answer: 2 },
  { category: "Track Numbers", question: "Which song closes Illmatic?", options: ["One Love", "Represent", "Halftime", "It Ain't Hard to Tell"], answer: 3 },
];