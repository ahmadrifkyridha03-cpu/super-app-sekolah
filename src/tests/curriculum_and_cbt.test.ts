import { describe, it, expect } from "vitest";
import { generateCurriculumNarrative, generateExamToken } from "../lib/utils";
import { hashPassword, verifyPassword } from "../lib/auth";

describe("Kurikulum Merdeka Narrative Generator", () => {
  it("should generate a comprehensive narrative based on TP mastery", () => {
    const scores = [
      { score: 92, code: "TP-1", description: "memahami konsep eksponen dan logaritma" },
      { score: 78, code: "TP-2", description: "menganalisis barisan dan deret aritmetika" },
    ];

    const narrative = generateCurriculumNarrative("Ahmad Fauzi", scores, 75.0);
    expect(narrative).toContain("Menunjukkan penguasaan yang sangat baik dalam memahami konsep eksponen dan logaritma");
    expect(narrative).toContain("serta terampil dalam menganalisis barisan dan deret aritmetika");
  });

  it("should handle empty assessment list gracefully", () => {
    const narrative = generateCurriculumNarrative("Ahmad Fauzi", [], 75.0);
    expect(narrative).toBe("Ahmad Fauzi telah mengikuti kegiatan pembelajaran dengan baik.");
  });
});

describe("Exam Token Generator", () => {
  it("should generate a 6-character uppercase token", () => {
    const token = generateExamToken();
    expect(token).toHaveLength(6);
    expect(token).toMatch(/^[A-Z0-9]{6}$/);
  });
});

describe("Password Security & Bcrypt Hashing", () => {
  it("should hash and verify passwords correctly with salt", async () => {
    const plaintext = "guru123";
    const hash = await hashPassword(plaintext);
    
    expect(hash).not.toBe(plaintext);
    expect(hash.startsWith("$2")).toBe(true);

    const isValid = await verifyPassword(plaintext, hash);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword("wrongpass", hash);
    expect(isInvalid).toBe(false);
  });
});
