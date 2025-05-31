import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { KeystrokeAttempt } from '../../keystroke/entities/keystrokeAttempt.entity';
import { SecretWord } from './secret-word.entity';
import { PasswordCrackAttempt } from 'src/modules/keystroke/entities/passwordCrackAttempt.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'first_name', nullable: true, type: 'varchar' })
  firstName: string | null;

  @Column({ name: 'last_name', nullable: true, type: 'varchar' })
  lastName: string | null;

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'password' })
  password: string;

  @OneToMany(() => SecretWord, (secretWord) => secretWord.user)
  secretWords?: SecretWord[];

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => KeystrokeAttempt, (attempt) => attempt.user)
  keystrokeAttempts: KeystrokeAttempt[];

  @OneToMany(() => PasswordCrackAttempt, (attempt) => attempt.user)
  passwordCrackAttempts: PasswordCrackAttempt[];

  @OneToMany(() => PasswordCrackAttempt, (attempt) => attempt.targetUser)
  passwordCrackTargets: PasswordCrackAttempt[];
}
