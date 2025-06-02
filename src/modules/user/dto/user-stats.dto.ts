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
  attackerId: number;
  attackerEmail: string;
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

      this.attacksOnMe.push({
        secretWordId: wordId,
        secretWord: [...attackerMap.values()][0][0].word,
        attackers,
      });
    }

    // === Attacks BY me ===
    const groupedByAttacker = new Map<number, Map<number, CrackEntry[]>>();

    for (const attempt of user.passwordCrackTargets) {
      if (!attempt.secretWord || !attempt.userId) continue;

      const wordId = attempt.secretWord.id;
      const attackerId = attempt.user.id;

      if (!groupedByAttacker.has(attackerId)) {
        groupedByAttacker.set(attackerId, new Map());
      }

      const wordMap = groupedByAttacker.get(attackerId)!;

      if (!wordMap.has(wordId)) {
        wordMap.set(wordId, []);
      }

      wordMap.get(wordId)!.push({
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

    for (const [attackerId, wordMap] of groupedByAttacker) {
      const words: WordStats[] = [];

      for (const [wordId, attempts] of wordMap) {
        const stats = this.computeStats(attempts);

        words.push({
          secretWordId: wordId,
          secretWord: attempts[0].word,
          attemptsCount: attempts.length,
          successCount: stats.successes,
          avgError: stats.avgError,
          avgSimilarity: stats.avgSimilarity,
          isMine: wordId === user.id,
          attempts,
        });
      }

      this.attacksByMe.push({
        attackerId,
        attackerEmail: [...wordMap.values()][0][0].attackerEmail ?? '',
        words,
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
