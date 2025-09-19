const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
app.use(express.json()); // Habilita o uso de JSON

// Conecta ao banco de dados SQLite
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  // Cria a tabela de produtos
  db.run("CREATE TABLE produtos (id INTEGER PRIMARY KEY, nome TEXT, preco REAL)");
});

// CREATE (POST) - Rota para adicionar um novo produto
app.post('/api/produtos', (req, res) => {
  const { nome, preco } = req.body;
  db.run("INSERT INTO produtos (nome, preco) VALUES (?, ?)", [nome, preco], function(err) {
    res.json({ id: this.lastID, nome, preco });
  });
});

// UPDATE (PUT) - Rota para atualizar um produto
app.put('/api/produtos/:id', (req, res) => {
    const { nome, preco } = req.body;
    db.run("UPDATE produtos SET nome = ?, preco = ? WHERE id = ?", [nome, preco, req.params.id], function(err) {
    res.send('Produto atualizado');
    });
   });
   
   // DELETE (DELETE) - Rota para remover um produto
   app.delete('/api/produtos/:id', (req, res) => {
    db.run("DELETE FROM produtos WHERE id = ?", req.params.id, function(err) {
    res.send('Produto deletado');
    });
   });
   
   app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
   // READ (GET) - Rota para listar todos os produtos
    app.get('/api/produtos', (req, res) => {
    db.all("SELECT * FROM produtos", [], (err, rows) => {
    res.json(rows);
    });
   });
   
   // READ (GET) - Rota para buscar um produto por ID
   app.get('/api/produtos/:id', (req, res) => {
    db.get("SELECT * FROM produtos WHERE id = ?", [req.params.id], (err, row) => {
    if (row) {
    res.json(row);
    } else {
    res.status(404).send('Produto não encontrado');
    }
    });
   });
   
   