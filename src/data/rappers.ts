import { asapRockyQuestions } from "./asaprocky";
import { doomQuestions } from "./doom";
import { drakeQuestions } from "./drake";
import { eminemQuestions } from "./eminem";
import { jayzQuestions } from "./jayz";
import { jcoleQuestions } from "./jcole";
import { kendrickQuestions } from "./kendrick";
import { nasQuestions, type Question } from "./nas";
import { pushaTQuestions } from "./pushat";
import { schoolboyQQuestions } from "./schoolboyq";

// "Track Numbers" questions are shown under "Songs", because on their own
// there were only 1 or 2 per artist.
function group(questions: Question[]): Question[] {
  return questions.map((q) =>
    q.category === "Track Numbers" ? { ...q, category: "Songs" } : q
  );
}

export const rappers = [
  { id: "nas", name: "Nas", questions: group(nasQuestions) },
  { id: "jcole", name: "J. Cole", questions: group(jcoleQuestions) },
  { id: "jayz", name: "Jay-Z", questions: group(jayzQuestions) },
  { id: "kendrick", name: "Kendrick Lamar", questions: group(kendrickQuestions) },
  { id: "doom", name: "MF DOOM", questions: group(doomQuestions) },
  { id: "drake", name: "Drake", questions: group(drakeQuestions) },
  { id: "asaprocky", name: "A$AP Rocky", questions: group(asapRockyQuestions) },
  { id: "pushat", name: "Pusha T", questions: group(pushaTQuestions) },
  { id: "eminem", name: "Eminem", questions: group(eminemQuestions) },
  { id: "schoolboyq", name: "ScHoolboy Q", questions: group(schoolboyQQuestions) },
];