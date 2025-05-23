import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { DataSourceOptions } from 'typeorm';

export const ormConfig: DataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'keystroke-dynamics',
  entities: ['dist/**/*.entity.js'],
  synchronize: true,
  namingStrategy: new SnakeNamingStrategy(),
};
