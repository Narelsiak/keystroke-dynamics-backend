import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PasswordAttempt } from '../../keystroke/entities/passwordAttempt.entity';

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

  @Column({ name: 'secret_word', nullable: true, type: 'varchar' })
  secretWord: string | null;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PasswordAttempt, (attempt) => attempt.userId)
  passwordAttempts: PasswordAttempt[];
}
