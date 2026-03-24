# GenieConnect - Setup Final

## 1. Criar a tabela no Neon

Copie e execute o SQL abaixo no dashboard do Neon (Menu > SQL Editor):

```sql
CREATE TABLE IF NOT EXISTS speed_tests (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  connection_type VARCHAR(50),
  effective_type VARCHAR(50),
  ping_ms NUMERIC,
  jitter_ms NUMERIC,
  download_mbps NUMERIC,
  upload_mbps NUMERIC,
  ip_address VARCHAR(50),
  user_agent TEXT,
  score NUMERIC,
  quiz_results JSONB,
  min_ping_ms NUMERIC,
  max_ping_ms NUMERIC,
  school_name VARCHAR(255)
);

CREATE INDEX idx_speed_tests_created_at ON speed_tests(created_at DESC);
```

## 2. Variáveis de ambiente (.env.local)

O arquivo já foi criado. Verifique se tem:

```
DATABASE_URL=postgresql://...seu-neon-url...
SESSION_SECRET=gc-secret-key-change-in-production-32chars
ADMIN_EMAIL=usuario@escola.edu.br
ADMIN_PASSWORD=genie2024
```

## 3. Executar o projeto

```bash
cd /Users/fernandorodrigues/Claude/speedtest
npm run dev
```

Acesse: **http://localhost:3000/login**

### Credenciais de demo:
- Email: `usuario@escola.edu.br`
- Senha: `genie2024`

## 4. Fluxo da aplicação

**Login** → **Início (Dashboard)** → **Diagnostico (Info page)** → **Teste (Quiz com 50 questões)** → **Relatório detalhado**

## Principais features:

✅ **Autenticação JWT** com login/logout
✅ **50 questões automáticas** durante o teste
✅ **Medição em tempo real** de ping, jitter, download
✅ **Editar nome da escola** em cada relatório
✅ **Relatórios** em CSV, XLSX e PDF
✅ **Detecção automática de rede** (Wi-Fi, 4G, 5G, etc.)
✅ **Dashboard** com histórico e gráficos
✅ **Design GenieConnect** com mascote

---

**Pronto para usar!** 🚀
