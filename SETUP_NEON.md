# Setup do Banco de Dados Neon

## Passo 1: Acessar Neon

1. Vá para https://console.neon.tech
2. Selecione seu projeto `neondb`
3. Vá para "SQL Editor"

## Passo 2: Executar Script SQL

Cole o SQL abaixo no editor e clique em "Run":

```sql
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DELETE FROM users;

INSERT INTO users (name, email, password_hash, created_at)
VALUES
  ('Fernando', 'fernando@jovensgenios.com', 'seedsalt99:c4b2f5078c890cc56729b0eb4423eb3f33b303ae4600c66703fc0c96d962c27d', NOW()),
  ('Nathália', 'nathalia@gmail.com', 'seedsalt99:c4b2f5078c890cc56729b0eb4423eb3f33b303ae4600c66703fc0c96d962c27d', NOW()),
  ('João', 'joao.figueroa@jovensgenios.com', 'seedsalt99:c4b2f5078c890cc56729b0eb4423eb3f33b303ae4600c66703fc0c96d962c27d', NOW());

SELECT * FROM users;
```

## Passo 3: Verificar Resultado

Se tudo funcionou, você deve ver uma tabela com 3 usuários:
- Fernando (fernando@jovensgenios.com)
- Nathália (nathalia@gmail.com)
- João (joao.figueroa@jovensgenios.com)

**Todos com a mesma senha: 123456**

## Passo 4: Acessar a Plataforma

1. Acesse http://localhost:3000/login
2. Entre com as credenciais:
   - Email: `fernando@jovensgenios.com`
   - Senha: `123456`
3. Clique em "Entrar"
4. Você será redirecionado para o dashboard em `/inicio`

## Credenciais para Testes

| Nome | Email | Senha |
|------|-------|-------|
| Fernando | fernando@jovensgenios.com | 123456 |
| Nathália | nathalia@gmail.com | 123456 |
| João | joao.figueroa@jovensgenios.com | 123456 |

## Troubleshooting

Se o login não funcionar:

1. **Verifique se a tabela foi criada:**
   - Na query editor do Neon, execute: `SELECT * FROM users;`
   - Você deve ver os 3 usuários

2. **Verifique se as credenciais estão corretas:**
   - Email deve estar exatamente como está na tabela
   - Senha deve ser: `123456`

3. **Limpe o cache do navegador:**
   - Pressione Ctrl+Shift+Delete (ou Cmd+Shift+Delete no Mac)
   - Limpe cookies e cache do site

4. **Reinicie o servidor:**
   - No terminal, pressione Ctrl+C
   - Execute novamente: `npm run dev`
