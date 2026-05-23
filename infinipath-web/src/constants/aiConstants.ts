interface QuestionCategory {
  category: string;
  questions: string[];
}

export const questionData: QuestionCategory[] = [
  {
    category: "Seekers info",
    questions: [
      "What are the basic details of the seeker (age, gender, city, phone, email)",
      // "Who is the roommate preference of seeker?",
    ],
  },
  {
    category: "Age and date of birth",
    questions: [
      "List of registered seekers for this program who's birthday falls in the range from 17th November to 22nd November?",
      "List of registered seekers for this program from a specific city, age, gender, DOB?",
      "Age distribution graph of registered seekers for this program?",
    ],
  },
  {
    category: "Location",
    questions: [
      "Top 10 cities graph distribution by registered seekers for this program?",
    ],
  },
  {
    category: "HDB/MSD Program stats",
    questions: [
      // "How many times has the seeker been allocated a seat in comparison to registrations?",
      "How many HDBs did seeker attend?",
      "List of seekers applied for the first time?",
      // "List of seekers who have applied for more than n times but have not been allocated a seat?",
      "List of seekers who have requested for swap in this program?",
    ],
  },
];
