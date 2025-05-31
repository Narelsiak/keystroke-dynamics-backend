import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

interface CrackAttempt {
  similarity: number;
  success: boolean;
  error: number;
  createdAt: Date;
}

interface WordEntry {
  secretWordId: number;
  secretWord: string;
  attempts: CrackAttempt[];
}

interface AttackerEntry {
  attackerId: number;
  attackerEmail: string;
  attemptsBySecretWord: Map<number, WordEntry>;
}

export class UserResponseExtendDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  secretWord: string | null;

  @ApiProperty()
  hasModel: boolean;

  @ApiProperty({ nullable: true })
  firstName: string | null;

  @ApiProperty({ nullable: true })
  lastName: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  modelCount: number;

  @ApiProperty()
  crackAttemptsMade: number;

  crackAttemptsReceived: { attackerId: number; attackerEmail: string }[];

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.isActive = user.isActive;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;

    this.secretWord = null;
    this.hasModel = false;

    if (user.secretWords?.length) {
      const secretWord = user.secretWords.find((word) => word.isActive);
      if (secretWord) {
        this.secretWord = secretWord.word;
        this.hasModel = !!secretWord.models?.find((model) => model.isActive);
      }
    }

    this.modelCount =
      user.secretWords?.flatMap((w) => w.models).filter((m) => m?.isActive)
        .length ?? 0;

    this.crackAttemptsMade = user.passwordCrackAttempts.length;

    const received = user.passwordCrackTargets;

    const groupedByAttacker = new Map<number, AttackerEntry>();

    for (const attempt of received) {
      const attacker = attempt.user;

      let attackerEntry = groupedByAttacker.get(attacker.id);
      if (!attackerEntry) {
        attackerEntry = {
          attackerId: attacker.id,
          attackerEmail: attacker.email,
          attemptsBySecretWord: new Map<number, WordEntry>(),
        };
        groupedByAttacker.set(attacker.id, attackerEntry);
      }

      const word = attempt.secretWord;
      if (!word) continue;

      let wordEntry = attackerEntry.attemptsBySecretWord.get(word.id);
      if (!wordEntry) {
        wordEntry = {
          secretWordId: word.id,
          secretWord: word.word,
          attempts: [],
        };
        attackerEntry.attemptsBySecretWord.set(word.id, wordEntry);
      }

      wordEntry.attempts.push({
        similarity: attempt.similarity,
        success: attempt.success,
        error: attempt.error ?? 0,
        createdAt: attempt.createdAt,
      });
    }

    this.crackAttemptsReceived = Array.from(groupedByAttacker.values()).map(
      (entry) => ({
        attackerId: entry.attackerId,
        attackerEmail: entry.attackerEmail,
        attemptsBySecretWord: Array.from(
          entry.attemptsBySecretWord.values(),
        ).map((group) => {
          const avgSimilarity =
            group.attempts.reduce((sum, a) => sum + a.similarity, 0) /
            group.attempts.length;

          return {
            ...group,
            avgSimilarity: parseFloat(avgSimilarity.toFixed(2)),
          };
        }),
      }),
    );
  }
}
