import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { PasswordAttempt } from './passwordAttempt.entity';

@Entity()
export class KeystrokeEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  character: string;

  @Column()
  timestamp: number;

  @Column()
  eventType: 'keydown' | 'keyup';

  @Column()
  position: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => PasswordAttempt, (attempt) => attempt.keystrokes)
  attempt: PasswordAttempt;
}
