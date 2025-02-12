import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer', nullable: false })
  role_id: number;

  @Column({ type: 'varchar', length: 125, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 125 })
  password: string;

  @Column({ type: 'varchar', length: 125, nullable: true })
  phone_number: string;

  @Column({ type: 'varchar', length: 125, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profile_pic_url: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
  googleId: boolean | null;
  
}