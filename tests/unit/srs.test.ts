import { describe, it, expect } from "vitest";
import { createReviewItem, schedule, getDue, getUpcoming, DAY_MS } from "@/lib/srs/scheduler";
import type { ReviewItem } from "@/lib/types";

function make(now = 0): ReviewItem {
  return createReviewItem({
    id: "1",
    nodeId: "n1",
    front: "Q",
    back: "A",
    source: "lesson",
    now,
  });
}

describe("SRS scheduler (SM-2 variant)", () => {
  it("creates an item due immediately with default ease", () => {
    const item = make(1000);
    expect(item.ease).toBe(2.5);
    expect(item.repetitions).toBe(0);
    expect(item.due).toBe(1000);
  });

  it("grows the interval on successive 'good' grades", () => {
    const now = 0;
    let item = make(now);
    item = schedule(item, 2, now); // rep 1 → 1 day
    expect(item.intervalDays).toBe(1);
    item = schedule(item, 2, now + DAY_MS); // rep 2 → ~4 days
    expect(item.intervalDays).toBeGreaterThanOrEqual(3);
    const prev = item.intervalDays;
    item = schedule(item, 2, now + 5 * DAY_MS); // rep 3 → prev * ease
    expect(item.intervalDays).toBeGreaterThan(prev);
  });

  it("resets reps and lowers ease on a lapse (grade 0)", () => {
    const now = 0;
    let item = make(now);
    item = schedule(item, 2, now);
    item = schedule(item, 2, now + DAY_MS);
    const easeBefore = item.ease;
    item = schedule(item, 0, now + 2 * DAY_MS);
    expect(item.repetitions).toBe(0);
    expect(item.lapses).toBe(1);
    expect(item.ease).toBeLessThan(easeBefore);
    expect(item.ease).toBeGreaterThanOrEqual(1.3); // ease floor
    // rescheduled very soon (same day)
    expect(item.due - (now + 2 * DAY_MS)).toBeLessThan(DAY_MS);
  });

  it("never drops ease below the 1.3 floor", () => {
    const now = 0;
    let item = make(now);
    for (let i = 0; i < 10; i++) item = schedule(item, 0, now + i * DAY_MS);
    expect(item.ease).toBeGreaterThanOrEqual(1.3);
  });

  it("partitions items into due and upcoming", () => {
    const now = 10 * DAY_MS;
    const dueItem = { ...make(0), due: now - DAY_MS };
    const futureItem = { ...make(0), id: "2", due: now + DAY_MS };
    expect(getDue([dueItem, futureItem], now).map((i) => i.id)).toEqual(["1"]);
    expect(getUpcoming([dueItem, futureItem], now).map((i) => i.id)).toEqual(["2"]);
  });

  it("easy grade schedules further out than hard grade", () => {
    const now = 0;
    const easy = schedule(make(now), 3, now);
    const hard = schedule(make(now), 1, now);
    expect(easy.intervalDays).toBeGreaterThanOrEqual(hard.intervalDays);
  });
});
