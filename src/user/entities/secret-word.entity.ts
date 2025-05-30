import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { KeystrokeAttempt } from '../../keystroke/entities/keystrokeAttempt.entity';
import { KeystrokeModelEntity } from 'src/keystroke/entities/keystrokeModel.entity';
import { PasswordCrackAttempt } from 'src/keystroke/entities/passwordCrackAttempt.entity';

@Entity()
export class SecretWord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  isActive: boolean;

  @Column()
  word: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.secretWords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => KeystrokeAttempt, (attempt) => attempt.secretWord)
  attempts: KeystrokeAttempt[];

  @OneToMany(() => KeystrokeModelEntity, (model) => model.secretWord)
  models: KeystrokeModelEntity[];

  @OneToMany(() => PasswordCrackAttempt, (attempt) => attempt.secretWord)
  passwordCrackAttempts: PasswordCrackAttempt[];
}
