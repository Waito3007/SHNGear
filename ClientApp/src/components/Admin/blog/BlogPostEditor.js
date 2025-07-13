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
    const [images, setImages] = useState([]); // array of string
    const [imagesInput, setImagesInput] = useState(''); // textarea value
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isEditing = id !== undefined;

    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            let apiBase = process.env.REACT_APP_API_BASE_URL;
            if (!apiBase) apiBase = window.location.origin;
            axios.get(`${apiBase}/api/BlogPosts/${id}`)
                .then(response => {
                    setTitle(response.data.title);
                    setContent(response.data.content);
                    setIsPublished(response.data.isPublished);
                    setImages(response.data.images || []);
                    setImagesInput((response.data.images || []).join('\n'));
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

        // Parse images from textarea (split by line, trim, remove empty)
        const imagesArr = imagesInput.split('\n').map(s => s.trim()).filter(Boolean);
        const blogPostData = { title, content, isPublished, images: imagesArr };
        const token = localStorage.getItem('token');
        let apiBase = process.env.REACT_APP_API_BASE_URL;
        if (!apiBase) apiBase = window.location.origin;
        try {
            if (isEditing) {
                await axios.put(`${apiBase}/api/BlogPosts/${id}`, blogPostData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } else {
                await axios.post(`${apiBase}/api/BlogPosts`, blogPostData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
            navigate('/admin/blog');
        } catch (err) {
            setError('Failed to save blog post. Make sure you are logged in as an Admin.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) return <div>Loading blog post for editing...</div>;

    // Parse images from textarea (split by line, trim, remove empty) for preview
    const imagesArr = imagesInput.split('\n').map(s => s.trim()).filter(Boolean);
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
                <div>
                    <label htmlFor="images" className="block text-sm font-medium text-gray-700">Images (one URL or path per line)</label>
                    <textarea
                        id="images"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-gray-950"
                        rows={3}
                        value={imagesInput}
                        onChange={e => setImagesInput(e.target.value)}
                        placeholder="https://... or images/ten-anh.jpg"
                    />
                    {imagesArr && imagesArr.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {imagesArr.map((img, idx) => {
                                const src = (img.startsWith('http://') || img.startsWith('https://')) ? img : (img.startsWith('/') ? img : '/' + img);
                                return <img key={idx} src={src} alt={`Ảnh ${idx+1}`} className="h-14 w-14 object-cover rounded border" />;
                            })}
                        </div>
                    )}
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
