import { ormConfig } from 'ormconfig';
import { DataSource } from 'typeorm';
import { createDatabase } from 'typeorm-extension';

export default new DataSource(ormConfig);

// Automatyczne tworzenie bazy przy inicjalizacji
void (async () => {
  await createDatabase({
    options: {
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'keystroke-dynamics',
    },
    ifNotExist: true, // Tylko jeśli nie istnieje
  });
})();
