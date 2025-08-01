import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import PostList from './components/PostList';
import PostForm from './components/PostForm';
import PostDetail from './components/PostDetail';
import './styles.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('https://nova-pasta-actz.onrender.com/posts');
      // O backend já retorna os posts ordenados, então não precisa ordenar no frontend
      setPosts(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Erro ao carregar as publicações. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPost = async (post) => {
    try {
      await axios.post('https://nova-pasta-actz.onrender.com/posts', post);
      fetchPosts(); // Atualiza a lista após criar novo post
      setShowForm(false); // Fecha o formulário
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Erro ao criar a publicação. Verifique os dados e tente novamente.');
    }
  };

  const handleUpdatePost = async (postId, updatedPost) => {
    try {
      await axios.put(`https://nova-pasta-actz.onrender.com/posts/${postId}`, updatedPost);
      fetchPosts(); // Atualiza a lista após atualizar o post
    } catch (error) {
      console.error('Error updating post:', error);
      setError('Erro ao atualizar a publicação. Verifique os dados e tente novamente.');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`https://nova-pasta-actz.onrender.com/posts/${postId}`);
      fetchPosts(); // Atualiza a lista após deletar
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Erro ao excluir a publicação.');
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Blog de Responsabilidade Socioambiental</h1>
        <p>Compartilhe ideias e ações para um mundo melhor</p>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={
            <>
              {showForm && (
                <div className="form-container">
                  <PostForm 
                    onSubmit={handleNewPost} 
                    onCancel={() => setShowForm(false)}
                  />
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              {isLoading ? (
                <div className="loading">Carregando publicações...</div>
              ) : (
                <>
                  <h2 className="section-title">Últimas Publicações</h2>
                  {posts.length === 0 ? (
                    <p className="no-posts">Nenhuma publicação encontrada. Seja o primeiro a compartilhar!</p>
                  ) : (
                    <PostList 
                      posts={posts} 
                      onDelete={handleDeletePost} 
                    />
                  )}
                  <div className="action-bar" style={{marginTop: '30px'}}>
                    <button 
                      className="new-post-button"
                      onClick={() => setShowForm(!showForm)}
                    >
                      {showForm ? 'Cancelar' : 'Nova Publicação'}
                    </button>
                  </div>
                </>
              )}
            </>
          } />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/post/:id/edit" element={
            <EditPostWrapper 
              onUpdate={handleUpdatePost} 
            />
          } />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Blog Socioambiental - Todos os direitos reservados</p>
      </footer>
    </div>
  );
}

function EditPostWrapper({ onUpdate }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://nova-pasta-actz.onrender.com/posts/${id}`);
        setPost(response.data);
        setError(null);
      } catch (err) {
        setError('Erro ao carregar a publicação para edição.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleSubmit = async (updatedPost) => {
    await onUpdate(id, updatedPost);
    navigate(`/post/${id}`);
  };

  if (loading) {
    return <div className="loading">Carregando publicação para edição...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!post) {
    return <div className="error-message">Publicação não encontrada.</div>;
  }

  return (
    <PostForm 
      post={post} 
      onSubmit={handleSubmit} 
      onCancel={() => navigate(`/post/${id}`)} 
    />
  );
}

export default App;
