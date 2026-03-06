import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WeeklyReviewAnswers {
  went_well: string;
  challenges: string;
  priorities: string;
  energy_level: number; // 1-5
  notes: string;
}

export interface WeeklyReview {
  weekStart: string;   // "yyyy-MM-dd" (segunda-feira)
  answers: WeeklyReviewAnswers;
  completedAt: string; // ISO string
}

interface ReviewsState {
  reviews: WeeklyReview[];
  saveReview: (weekStart: string, answers: WeeklyReviewAnswers) => void;
  getReview: (weekStart: string) => WeeklyReview | undefined;
  getLastReview: (beforeWeekStart: string) => WeeklyReview | undefined;
}

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      reviews: [],

      saveReview: (weekStart, answers) =>
        set((state) => {
          const filtered = state.reviews.filter((r) => r.weekStart !== weekStart);
          return {
            reviews: [
              ...filtered,
              { weekStart, answers, completedAt: new Date().toISOString() },
            ].sort((a, b) => a.weekStart.localeCompare(b.weekStart)),
          };
        }),

      getReview: (weekStart) =>
        get().reviews.find((r) => r.weekStart === weekStart),

      getLastReview: (beforeWeekStart) => {
        const sorted = get()
          .reviews
          .filter((r) => r.weekStart < beforeWeekStart)
          .sort((a, b) => b.weekStart.localeCompare(a.weekStart));
        return sorted[0];
      },
    }),
    { name: "segna-reviews" }
  )
);
