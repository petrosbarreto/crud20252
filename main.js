document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-produto');
    const nomeInput = document.getElementById('nome');
    const precoInput = document.getElementById('preco');
    const produtoIdInput = document.getElementById('produto-id');
    const submitBtn = document.getElementById('btn-submit');
    const listaProdutos = document.getElementById('lista-produtos');
    const API_URL = 'http://localhost:3000/api/produtos';

    // Função para carregar e exibir os produtos (READ)
    const carregarProdutos = async () => {
        try {
            const response = await fetch(API_URL);
            const produtos = await response.json();
            listaProdutos.innerHTML = ''; // Limpa a lista antes de recarregar
            produtos.forEach(produto => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${produto.nome} - R$ ${produto.preco.toFixed(2)}
                    <button class="edit-btn" data-id="${produto.id}" data-nome="${produto.nome}" data-preco="${produto.preco}">Editar</button>
                    <button class="delete-btn" data-id="${produto.id}">Deletar</button>
                `;
                listaProdutos.appendChild(li);
            });
        } catch (error) {
            console.error('Erro ao carregar os produtos:', error);
        }
    };

    // Lida com o envio do formulário (CREATE e UPDATE)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = produtoIdInput.value;
        const nome = nomeInput.value;
        const preco = parseFloat(precoInput.value);

        if (id) {
            // Se o ID existe, é uma operação de UPDATE
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, preco })
            });
            // Limpa o formulário e o ID oculto
            produtoIdInput.value = '';
            submitBtn.textContent = 'Adicionar Produto';
        } else {
            // Se não, é uma operação de CREATE
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, preco })
            });
        }
        form.reset();
        carregarProdutos(); // Recarrega a lista
    });

    // Lida com os cliques nos botões de Editar e Deletar
    listaProdutos.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;

        if (e.target.classList.contains('delete-btn')) {
            // DELETAR
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            carregarProdutos(); // Recarrega a lista
        } else if (e.target.classList.contains('edit-btn')) {
            // EDITAR (preenche o formulário)
            const nome = e.target.dataset.nome;
            const preco = e.target.dataset.preco;
            produtoIdInput.value = id;
            nomeInput.value = nome;
            precoInput.value = preco;
            submitBtn.textContent = 'Atualizar Produto';
        }
    });

    // Carrega os produtos ao iniciar a página
    carregarProdutos();
});