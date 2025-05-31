import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { KeystrokeAttempt } from './keystrokeAttempt.entity';

@Entity()
export class KeystrokeEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'attempt_id' })
  keystrokeAttemptId: number;

  @Column()
  character: string;

  // kiedy wciśnięto (timestamp jako liczba milisekund)
  @Column('datetime', { nullable: true, precision: 3 })
  pressedAt: Date;

  @Column('datetime', { nullable: true, precision: 3 })
  releasedAt: Date;

  // ile trwało wciśnięcie w ms
  @Column()
  pressDuration: number;

  // czas od poprzedniego zwolnienia klawisza do wciśnięcia tego w ms
  @Column()
  waitDuration: number;

  // modyfikatory (shift, ctrl, alt, meta) - możemy zapisać jako JSON
  @Column('simple-json')
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => KeystrokeAttempt, (attempt) => attempt.keystrokes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attempt_id' })
  attempt: KeystrokeAttempt; // relacja do KeystrokeAttempt
}
