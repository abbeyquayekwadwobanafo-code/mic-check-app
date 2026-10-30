import { asapRockyQuestions } from "./asaprocky";
import { doomQuestions } from "./doom";
import { drakeQuestions } from "./drake";
import { eminemQuestions } from "./eminem";
import { jayzQuestions } from "./jayz";
import { jcoleQuestions } from "./jcole";
import { kendrickQuestions } from "./kendrick";
import { nasQuestions } from "./nas";
import { pushaTQuestions } from "./pushat";
import { schoolboyQQuestions } from "./schoolboyq";

export const rappers = [
  { id: "nas", name: "Nas", questions: nasQuestions },
  { id: "jcole", name: "J. Cole", questions: jcoleQuestions },
  { id: "jayz", name: "Jay-Z", questions: jayzQuestions },
  { id: "kendrick", name: "Kendrick Lamar", questions: kendrickQuestions },
  { id: "doom", name: "MF DOOM", questions: doomQuestions },
  { id: "drake", name: "Drake", questions: drakeQuestions },
  { id: "asaprocky", name: "A$AP Rocky", questions: asapRockyQuestions },
  { id: "pushat", name: "Pusha T", questions: pushaTQuestions },
  { id: "eminem", name: "Eminem", questions: eminemQuestions },
  { id: "schoolboyq", name: "ScHoolboy Q", questions: schoolboyQQuestions },
];