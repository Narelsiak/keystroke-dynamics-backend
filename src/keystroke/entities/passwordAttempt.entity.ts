import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { KeystrokeEvent } from './keystrokeEvent.entity';
@Entity()
export class PasswordAttempt {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => KeystrokeEvent, (ke) => ke.attempt, { cascade: true })
  keystrokes: KeystrokeEvent[];
}
