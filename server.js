// Importa o framework Express e a biblioteca SQLite3
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// Middleware para processar requisições com corpo JSON
app.use(express.json());

// Conecta ao banco de dados em memória
// Usar ':memory:' é ideal para testes e aprendizado,
// pois o banco de dados é recriado a cada execução
const db = new sqlite3.Database(':memory:');

// Middleware para permitir requisições de outras origens (CORS)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// A função db.serialize garante que as operações rodem em sequência
db.serialize(() => {
    // Cria a tabela 'produtos' com as colunas id, nome e preco
    db.run("CREATE TABLE produtos (id INTEGER PRIMARY KEY, nome TEXT, preco REAL)");

    // Adiciona alguns dados iniciais para não começar com a tabela vazia
    const stmt = db.prepare("INSERT INTO produtos (nome, preco) VALUES (?, ?)");
    stmt.run("Smartphone X", 1200);
    stmt.run("Laptop Gamer", 5500);
    stmt.run("Fone Bluetooth", 150);
    stmt.finalize();
});

// Rota para a operação READ (listar todos os produtos)
app.get('/api/produtos', (req, res) => {
    db.all("SELECT * FROM produtos", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Rota para a operação READ (buscar um produto por ID)
app.get('/api/produtos/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM produtos WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).send("Produto não encontrado.");
            return;
        }
        res.json(row);
    });
});

// Rota para a operação CREATE (criar um novo produto)
app.post('/api/produtos', (req, res) => {
    const { nome, preco } = req.body;
    db.run("INSERT INTO produtos (nome, preco) VALUES (?, ?)", [nome, preco], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, nome, preco });
    });
});

// Rota para a operação UPDATE (atualizar um produto)
app.put('/api/produtos/:id', (req, res) => {
    const { id } = req.params;
    const { nome, preco } = req.body;
    db.run("UPDATE produtos SET nome = ?, preco = ? WHERE id = ?", [nome, preco, id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).send("Produto não encontrado.");
            return;
        }
        res.json({ message: "Produto atualizado com sucesso." });
    });
});

// Rota para a operação DELETE (deletar um produto)
app.delete('/api/produtos/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM produtos WHERE id = ?", [id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).send("Produto não encontrado.");
            return;
        }
        res.json({ message: "Produto deletado com sucesso." });
    });
});

// Define a porta do servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});