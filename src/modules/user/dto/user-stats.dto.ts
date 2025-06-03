import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

interface CrackEntry {
  similarity: number;
  success: boolean;
  error: number;
  createdAt: Date;
  word: string;
  wordId: number;
  attackerId?: number;
  attackerEmail?: string;
  targetId?: number;
  targetEmail?: string;
}

class AttackerStats {
  attackerId: number;
  attackerEmail: string;
  attemptsCount: number;
  successCount: number;
  avgError: number;
  avgSimilarity: number;
  attempts: CrackEntry[];
  isMine: boolean;
}

class AttackOnMeEntry {
  secretWordId: number;
  secretWord: string;
  attackers: AttackerStats[];

  totalAttempts: number;
  totalSuccesses: number;
  maxSimilarity: number;
  minSimilarity: number;
  maxError: number;
  minError: number;
}

class WordStats {
  secretWordId: number;
  secretWord: string;
  attemptsCount: number;
  successCount: number;
  avgError: number;
  avgSimilarity: number;
  attempts: CrackEntry[];
  isMine: boolean;
}

class AttacksByUserEntry {
  targetId: number;
  targetEmail: string;
  words: WordStats[];
}

export class UserStatsDto {
  @ApiProperty({ type: () => AttackOnMeEntry, isArray: true })
  attacksOnMe: AttackOnMeEntry[];

  @ApiProperty({ type: () => AttacksByUserEntry, isArray: true })
  attacksByMe: AttacksByUserEntry[];

  constructor(user: User) {
    this.attacksOnMe = [];
    this.attacksByMe = [];

    // === Attacks ON me ===
    const groupedByWord = new Map<number, Map<number, CrackEntry[]>>();

    for (const attempt of user.passwordCrackTargets) {
      if (!attempt.secretWord || !attempt.userId) continue;

      const wordId = attempt.secretWord.id;
      const attackerId = attempt.user.id;

      if (!groupedByWord.has(wordId)) {
        groupedByWord.set(wordId, new Map());
      }

      const attackerMap = groupedByWord.get(wordId)!;

      if (!attackerMap.has(attackerId)) {
        attackerMap.set(attackerId, []);
      }

      attackerMap.get(attackerId)!.push({
        similarity: attempt.similarity,
        success: attempt.success,
        error: attempt.error ?? 0,
        createdAt: attempt.createdAt,
        attackerId,
        attackerEmail: attempt.user.email,
        word: attempt.secretWord.word,
        wordId,
      });
    }

    for (const [wordId, attackerMap] of groupedByWord) {
      const attackers: AttackerStats[] = [];

      for (const [attackerId, attempts] of attackerMap) {
        const stats = this.computeStats(attempts);

        attackers.push({
          attackerId,
          attackerEmail: attempts[0].attackerEmail ?? '',
          attemptsCount: attempts.length,
          successCount: stats.successes,
          avgError: stats.avgError,
          avgSimilarity: stats.avgSimilarity,
          isMine: attackerId === user.id,
          attempts,
        });
      }

      const allAttempts = [...attackerMap.values()].flat();

      this.attacksOnMe.push({
        secretWordId: wordId,
        secretWord: allAttempts[0].word,
        attackers,
        totalAttempts: allAttempts.length,
        totalSuccesses: allAttempts.filter((a) => a.success).length,
        maxSimilarity: Math.max(...allAttempts.map((a) => a.similarity)),
        minSimilarity: Math.min(...allAttempts.map((a) => a.similarity)),
        maxError: Math.max(...allAttempts.map((a) => a.error)),
        minError: Math.min(...allAttempts.map((a) => a.error)),
      });
    }

    // === Attacks BY me ===
    const groupedByTarget = new Map<
      number,
      { targetEmail: string; words: Map<number, CrackEntry[]> }
    >();

    for (const attempt of user.passwordCrackAttempts) {
      if (!attempt.secretWord || !attempt.targetUserId) continue;

      const targetId = attempt.targetUserId;
      const wordId = attempt.secretWord.id;

      if (!groupedByTarget.has(targetId)) {
        groupedByTarget.set(targetId, {
          targetEmail: attempt.targetUser.email,
          words: new Map<number, CrackEntry[]>(),
        });
      }

      const targetGroup = groupedByTarget.get(targetId)!;

      if (!targetGroup.words.has(wordId)) {
        targetGroup.words.set(wordId, []);
      }

      targetGroup.words.get(wordId)!.push({
        similarity: attempt.similarity,
        success: attempt.success,
        error: attempt.error ?? 0,
        createdAt: attempt.createdAt,
        attackerId: attempt.user.id,
        attackerEmail: attempt.user.email,
        targetId,
        targetEmail: attempt.targetUser.email,
        word: attempt.secretWord.word,
        wordId,
      });
    }

    for (const [targetId, { targetEmail, words }] of groupedByTarget) {
      const wordStats: WordStats[] = [];

      for (const [wordId, attempts] of words) {
        const stats = this.computeStats(attempts);

        wordStats.push({
          secretWordId: wordId,
          secretWord: attempts[0].word,
          attemptsCount: attempts.length,
          successCount: stats.successes,
          avgError: stats.avgError,
          avgSimilarity: stats.avgSimilarity,
          isMine: targetId == attempts[0].attackerId,
          attempts,
        });
      }

      this.attacksByMe.push({
        targetId,
        targetEmail,
        words: wordStats,
      });
    }
  }

  private computeStats(attempts: CrackEntry[]) {
    const successes = attempts.filter((a) => a.success).length;
    const avgError = parseFloat(
      (attempts.reduce((sum, a) => sum + a.error, 0) / attempts.length).toFixed(
        2,
      ),
    );
    const avgSimilarity = parseFloat(
      (
        attempts.reduce((sum, a) => sum + a.similarity, 0) / attempts.length
      ).toFixed(2),
    );
    return { successes, avgError, avgSimilarity };
  }
}
