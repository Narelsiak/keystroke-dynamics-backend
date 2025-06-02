// src/keystroke/entities/keystrokeModel.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SecretWord } from 'src/modules/user/entities/secret-word.entity';

@Entity('keystroke_models')
export class KeystrokeModelEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'secret_word_id' })
  secretWordId: number;

  @Column({ name: 'model_name' })
  modelName: string;

  @Column({ name: 'is_active', default: false })
  isActive: boolean;

  @CreateDateColumn({ name: 'trained_at' })
  trainedAt: Date;

  @Column({ name: 'acceptance_threshold', type: 'float', default: 80 })
  acceptanceThreshold: number;

  @Column({ name: 'samples_used' })
  samplesUsed: number;

  @Column({ type: 'float' })
  loss: number;

  @ManyToOne(() => SecretWord, (secretWord) => secretWord.models, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'secret_word_id' })
  secretWord: SecretWord;
}
