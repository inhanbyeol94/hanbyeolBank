import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Trade } from './trade.entity';

@Entity()
export class Log {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  status: number;

  @Column()
  context: string;

  @Column()
  result: boolean;

  @Column()
  createdAt: Date;

  @ManyToOne(() => Trade, (trade) => trade.logs)
  trade: Trade[];
}
