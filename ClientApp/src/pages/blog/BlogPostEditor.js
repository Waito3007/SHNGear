import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

const BlogPostEditor = () => {
    const { id } = useParams(); // For editing existing posts
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isEditing = id !== undefined;

    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/BlogPosts/${id}`)
                .then(response => {
                    setTitle(response.data.title);
                    setContent(response.data.content);
                    setIsPublished(response.data.isPublished);
                })
                .catch(err => {
                    setError('Failed to load blog post for editing.');
                    console.error(err);
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const blogPostData = { title, content, isPublished };
        const token = localStorage.getItem('token'); // Assuming you store JWT token in localStorage

        try {
            if (isEditing) {
                await axios.put(`/api/BlogPosts/${id}`, blogPostData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } else {
                await axios.post('/api/BlogPosts', blogPostData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
            navigate('/admin/blog'); // Redirect to blog list after save
        } catch (err) {
            setError('Failed to save blog post. Make sure you are logged in as an Admin.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) return <div>Loading blog post for editing...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">{isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        id="title"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                    <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        className="mt-1"
                        modules={BlogPostEditor.modules}
                        formats={BlogPostEditor.formats}
                    />
                </div>
                <div className="flex items-center">
                    <input
                        id="isPublished"
                        name="isPublished"
                        type="checkbox"
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                    />
                    <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                        Publish Post
                    </label>
                </div>
                <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
                </button>
            </form>
        </div>
    );
};

BlogPostEditor.modules = {
    toolbar: [
        [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' },
        { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image', 'video'],
        ['clean']
    ],
    clipboard: {
        // toggle to add extra newline when pasting HTML: https://quilljs.com/docs/modules/clipboard/
        matchVisual: false,
    },
};

BlogPostEditor.formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
];

export default BlogPostEditor;
