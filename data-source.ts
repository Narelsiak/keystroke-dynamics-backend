import { User } from 'src/user/entities/user.entity';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'keystroke-dynamics',
  entities: [User],
  migrations: ['src/migrations/*.ts'],
});
