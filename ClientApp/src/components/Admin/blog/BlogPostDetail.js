import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const BlogPostDetail = () => {
    const { id } = useParams();
    const [blogPost, setBlogPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogPost = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/BlogPosts/${id}`);
                setBlogPost(response.data);
            } catch (err) {
                setError('Failed to fetch blog post.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogPost();
    }, [id]);

    if (loading) return <div>Loading blog post...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!blogPost) return <div>Blog post not found.</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-4">{blogPost.title}</h1>
            <p className="text-gray-600 text-sm mb-4">By {blogPost.authorName} on {new Date(blogPost.createdAt).toLocaleDateString()}</p>
            <div className="prose lg:prose-xl" dangerouslySetInnerHTML={{ __html: blogPost.content }}></div>
        </div>
    );
};

export default BlogPostDetail;
