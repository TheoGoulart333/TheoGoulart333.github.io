const API_BASE = 'http://localhost:3000';

const Api = {
    async getFeels() {
        const res = await fetch(`${API_BASE}/feels`);
        if (!res.ok) throw new Error('Falha ao buscar feels');
        return await res.json();
    },

    async buscarFeelPorId(id) {
        const res = await fetch(`${API_BASE}/feels/${id}`);
        if (!res.ok) throw new Error('Feel não encontrado');
        return await res.json();
    },

    async criarFeel(novoFeel) {
        const res = await fetch(`${API_BASE}/feels`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoFeel)
        });
        if (!res.ok) throw new Error('Falha ao publicar feel');
        return await res.json();
    },

    async updateLike(id, novasCurtidas) {
        const res = await fetch(`${API_BASE}/feels/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ curtidas: novasCurtidas })
        });
        if (!res.ok) throw new Error('Falha ao atualizar curtidas');
        return await res.json();
    },

    async login(email, senha) {
        const res = await fetch(`${API_BASE}/usuarios?email=${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error('Falha ao consultar usuários');
        const usuarios = await res.json();
        const user = usuarios.find(u => u.email === email && u.senha === senha);
        return user || null;
    }
};
