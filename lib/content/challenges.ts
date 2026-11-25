// =============================================================================
// Catalog of external intellectual activities. Users do these ANYWHERE and
// self-report completion to earn XP (honor system). Points reward effort, not
// mastery. URLs are real, well-known providers; nothing is fetched or verified.
// =============================================================================

import type { ExternalActivity, ExternalCategory } from "@/lib/types";

export const CATEGORY_META: Record<
  ExternalCategory,
  { label: string; blurb: string; color: string }
> = {
  word: { label: "Word & language", blurb: "Vocabulary, pattern-finding, lateral thinking", color: "world-write" },
  logic: { label: "Logic & puzzles", blurb: "Deduction, planning, spatial reasoning", color: "world-think" },
  math: { label: "Math & quant", blurb: "Numeric reasoning and proof", color: "world-research" },
  coding: { label: "Coding", blurb: "Algorithms and problem decomposition", color: "world-learn" },
  knowledge: { label: "Knowledge intake", blurb: "Reading, lectures, deep sources", color: "world-read" },
  memory: { label: "Memory & recall", blurb: "Retrieval practice anywhere", color: "world-research" },
  creative: { label: "Creative & reflective", blurb: "Writing, sketching, thinking on paper", color: "world-write" },
};

export const challengeCatalog: ExternalActivity[] = [
  // Word
  { id: "wordle", title: "Wordle", provider: "NYT", category: "word", url: "https://www.nytimes.com/games/wordle/index.html", points: 15, cadence: "daily", detailLabel: "Guesses (1–6)", description: "Deduce the 5-letter word. Trains hypothesis testing under constraints." },
  { id: "connections", title: "Connections", provider: "NYT", category: "word", url: "https://www.nytimes.com/games/connections", points: 20, cadence: "daily", detailLabel: "Mistakes (0–4)", description: "Group 16 words into four hidden categories. Trains categorization and seeing past red herrings." },
  { id: "mini-crossword", title: "The Mini crossword", provider: "NYT", category: "word", url: "https://www.nytimes.com/crosswords/game/mini", points: 10, cadence: "daily", detailLabel: "Time (mm:ss)", description: "A quick crossword. Trains retrieval and lateral word association." },

  // Logic
  { id: "lichess-puzzle", title: "Daily chess puzzle", provider: "Lichess", category: "logic", url: "https://lichess.org/training", points: 20, cadence: "repeatable", detailLabel: "Puzzle rating", description: "Find the best move. Trains calculation, pattern recognition, and foresight." },
  { id: "sudoku", title: "Sudoku", provider: "sudoku.com", category: "logic", url: "https://sudoku.com/", points: 15, cadence: "repeatable", detailLabel: "Difficulty", description: "Constraint-satisfaction logic. Trains systematic elimination and patience." },
  { id: "setgame", title: "Set (daily)", provider: "SET", category: "logic", url: "https://www.setgame.com/set/puzzle", points: 15, cadence: "daily", description: "Spot valid sets by attribute. Trains parallel feature comparison." },

  // Math
  { id: "project-euler", title: "A Project Euler problem", provider: "Project Euler", category: "math", url: "https://projecteuler.net/", points: 40, cadence: "repeatable", detailLabel: "Problem #", description: "Math + programming problems that reward insight over brute force." },
  { id: "brilliant-daily", title: "Brilliant daily challenge", provider: "Brilliant", category: "math", url: "https://brilliant.org/", points: 20, cadence: "daily", description: "A bite-size quantitative reasoning problem." },

  // Coding
  { id: "leetcode-daily", title: "LeetCode daily problem", provider: "LeetCode", category: "coding", url: "https://leetcode.com/problemset/", points: 30, cadence: "daily", detailLabel: "Difficulty", description: "Algorithmic problem-solving. Trains decomposition and complexity reasoning." },
  { id: "advent-of-code", title: "Advent of Code puzzle", provider: "AoC", category: "coding", url: "https://adventofcode.com/", points: 35, cadence: "repeatable", detailLabel: "Day", description: "Story-driven programming puzzles of rising difficulty." },

  // Knowledge
  { id: "read-paper", title: "Read a research paper", provider: "arXiv / journals", category: "knowledge", url: "https://arxiv.org/", points: 35, cadence: "repeatable", detailLabel: "Title / one takeaway", description: "Read a primary source closely and note one takeaway. Trains analytical reading." },
  { id: "watch-lecture", title: "Watch a lecture or talk", provider: "Anywhere", category: "knowledge", points: 20, cadence: "repeatable", detailLabel: "Topic", description: "Watch a substantive lecture and summarize one idea from memory." },
  { id: "read-chapter", title: "Read a nonfiction chapter", provider: "Anywhere", category: "knowledge", points: 20, cadence: "repeatable", detailLabel: "Book / chapter", description: "Read deeply and write a one-line summary without looking back." },

  // Memory
  { id: "anki-reviews", title: "Clear your Anki reviews", provider: "Anki", category: "memory", url: "https://apps.ankiweb.net/", points: 15, cadence: "daily", detailLabel: "Cards reviewed", description: "External spaced-repetition reviews count too." },

  // Creative
  { id: "freewrite", title: "10-minute freewrite", provider: "Anywhere", category: "creative", points: 15, cadence: "repeatable", detailLabel: "What about?", description: "Think on the page for ten unfiltered minutes." },
  { id: "explain-aloud", title: "Teach someone a concept", provider: "Anywhere", category: "creative", points: 20, cadence: "repeatable", detailLabel: "What concept?", description: "The Feynman test in the wild — explain something you learned to another person." },
];
