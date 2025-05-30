// src/keystroke/entities/passwordCrackAttempt.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SecretWord } from 'src/user/entities/secret-word.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('password_crack_attempts')
export class PasswordCrackAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'target_user_id' })
  targetUserId: number;

  @Column({ name: 'secret_word_id', nullable: true })
  secretWordId?: number;

  @Column({ type: 'float' })
  similarity: number;

  @Column({ type: 'boolean' })
  success: boolean;

  @Column({ type: 'float', nullable: true })
  error: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_user_id' })
  targetUser: User;

  @ManyToOne(() => SecretWord, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'secret_word_id' })
  secretWord?: SecretWord;
}
