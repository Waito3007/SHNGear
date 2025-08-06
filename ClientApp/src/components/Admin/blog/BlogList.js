import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BlogList = () => {
    const [blogPosts, setBlogPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogPosts = async () => {
            try {
                let apiBase = process.env.REACT_APP_API_BASE_URL;
                if (!apiBase) {
                    apiBase = window.location.origin;
                }
                const response = await axios.get(`${apiBase}/api/BlogPosts`);
                setBlogPosts(response.data);
            } catch (err) {
                setError('Failed to fetch blog posts.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogPosts();
    }, []);

    if (loading) return <div>Loading blog posts...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
            <Link to="/admin/blog/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block">
                Create New Post
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogPosts.map((post) => {
                    return (
                        <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                            <p className="text-gray-600 text-sm mb-2">By {post.authorName} on {new Date(post.createdAt).toLocaleDateString()}</p>
                            <div className="text-gray-800 mb-4" dangerouslySetInnerHTML={{ __html: post.content.substring(0, 150) + '...' }}></div>
                            <Link to={`/blog/${post.id}`} className="text-blue-500 hover:underline">
                                Read More
                            </Link>
                            <Link to={`/admin/blog/edit/${post.id}`} className="ml-4 text-green-500 hover:underline">
                                Edit
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BlogList;
