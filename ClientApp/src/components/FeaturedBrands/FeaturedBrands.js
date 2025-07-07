import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Spin, Alert, Typography } from 'antd';
import Slider from 'react-slick';
import './FeaturedBrands.css';

const { Title } = Typography;

const FeaturedBrands = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/Brand`);
                // Assuming the API returns an array of brand objects with `id`, `name`, and `logoUrl`
                setBrands(response.data);
            } catch (err) {
                setError('Failed to load brands.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, []);

    const sliderSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 4,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 2,
                }
            }
        ]
    };

    if (loading) {
        return <div className="text-center p-4"><Spin /></div>;
    }

    if (error) {
        return <div className="p-4"><Alert message={error} type="error" /></div>;
    }

    return (
        <div className="featured-brands-section">
            <Title level={3} className="text-center section-title">Trusted by the Best</Title>
            <Slider {...sliderSettings}>
                {brands.map(brand => (
                    <div key={brand.id} className="brand-logo-container">
                        <img src={brand.logoUrl} alt={brand.name} className="brand-logo" />
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default FeaturedBrands;
