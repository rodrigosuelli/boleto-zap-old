# Boleto Zap

Envio automático de boletos para clientes do eGestor via WhatsApp. A cada 24 horas, a aplicação busca quais boletos estão próximos do vencimento, em seguida avisa o cliente com uma mensagem e envia o boleto em pdf no WhatsApp do mesmo. O projeto utiliza a biblioteca [Venom](https://github.com/orkestral/venom) para fazer o envio de mensagens por WhatsApp.

## Instalação

### Clone o repositório

```bash
git clone https://github.com/rodrigosuelli/boleto-zap.git

cd boleto-zap
```

### Instale as dependências

```bash
npm install
```

### Crie um arquivo .env e substitua os campos `PERSONAL_TOKEN` e `TELEFONE_DESENVOLVEDOR`

```bash
cp .env.example .env
```

### Rode o projeto

```bash
npm run start
```
