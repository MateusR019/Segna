"use client";
import { format, subDays } from "date-fns";
import { SmilePlus } from "lucide-react";
import { useMoodStore, MOOD_EMOJIS, MOOD_LABELS, MOOD_COLORS } from "@/store/moodStore";
import { MoodLevel } from "@/types";

const MOOD_LEVELS: MoodLevel[] = [1, 2, 3, 4, 5];

export function MoodWidget() {
  const { setMood, getMoodForDate } = useMoodStore();

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const todayEntry = getMoodForDate(todayKey);

  // Last 7 days (oldest → newest)
  const last7Days = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), 6 - i), "yyyy-MM-dd")
  );

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-[#06b6d4]/10 flex items-center justify-center">
          <SmilePlus size={12} className="text-[#06b6d4]" />
        </div>
        <span className="text-sm font-medium text-white">Humor de hoje</span>
      </div>

      {/* Mood selector or display */}
      {todayEntry ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl leading-none">{MOOD_EMOJIS[todayEntry.mood]}</span>
            <div>
              <p className="text-sm font-medium text-white">{MOOD_LABELS[todayEntry.mood]}</p>
              <p className="text-[10px] text-[#4a4a4a]">registrado hoje</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const { removeMood } = useMoodStore.getState();
              removeMood(todayKey);
            }}
            className="text-[10px] text-[#4a4a4a] hover:text-[#9ca3af] underline underline-offset-2 transition-colors cursor-pointer"
            aria-label="Mudar humor de hoje"
          >
            mudar
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-1">
          {MOOD_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setMood(todayKey, level)}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg hover:bg-[#2a2a2a] transition-colors cursor-pointer group"
              aria-label={MOOD_LABELS[level]}
              title={MOOD_LABELS[level]}
            >
              <span className="text-xl leading-none group-hover:scale-110 transition-transform">
                {MOOD_EMOJIS[level]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Last 7 days mini chart */}
      <div className="space-y-1">
        <p className="text-[10px] text-[#3a3a3a] uppercase tracking-wider">Últimos 7 dias</p>
        <div className="flex items-end gap-1">
          {last7Days.map((date) => {
            const entry = getMoodForDate(date);
            const isToday = date === todayKey;
            return (
              <div
                key={date}
                className="flex-1 flex flex-col items-center gap-0.5"
                title={entry ? `${MOOD_LABELS[entry.mood]} — ${date}` : date}
              >
                <div
                  className="w-full rounded-sm transition-all"
                  style={{
                    height: entry ? `${(entry.mood / 5) * 20 + 4}px` : "4px",
                    background: entry ? MOOD_COLORS[entry.mood] : "#2a2a2a",
                    opacity: isToday ? 1 : 0.7,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
