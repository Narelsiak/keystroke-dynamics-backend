import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { KeystrokeAttempt } from '../../keystroke/entities/keystrokeAttempt.entity';

@Entity()
export class SecretWord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  word: string;

  @ManyToOne(() => User, (user) => user.secretWords, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => KeystrokeAttempt, (attempt) => attempt.secretWord)
  attempts: KeystrokeAttempt[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
