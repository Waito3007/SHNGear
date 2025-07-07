import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ endDate }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(endDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents = [];

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval] && timeLeft[interval] !== 0) {
            return;
        }

        timerComponents.push(
            <div key={interval} className="text-center">
                <div className="font-display text-3xl md:text-4xl font-bold text-neon-magenta">
                    {String(timeLeft[interval]).padStart(2, '0')}
                </div>
                <div className="text-xs uppercase text-light-gray">{interval}</div>
            </div>
        );
    });

    return (
        <div className="flex space-x-4">
            {timerComponents.length ? timerComponents : <span>Time's up!</span>}
        </div>
    );
};

const SpecialOfferSection = ({ data }) => {
    const imageUrl = data.image_url?.startsWith("http") 
        ? data.image_url 
        : `${process.env.REACT_APP_API_BASE_URL}/${data.image_url}`;

    return (
        <section className="py-16 md:py-24 bg-primary-dark">
            <div className="container mx-auto px-4">
                <div className="relative rounded-lg overflow-hidden bg-gray-900">
                    <img src={imageUrl} alt="Special Offer" className="absolute w-full h-full object-cover opacity-30" />
                    <div className="relative p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between">
                        <div className="text-center lg:text-left mb-8 lg:mb-0">
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-white uppercase">{data.headline}</h2>
                            <p className="mt-2 text-lg text-light-gray max-w-lg">{data.sub_text}</p>
                            <div className="mt-4 flex items-center justify-center lg:justify-start space-x-4">
                                {data.originalPrice && (
                                    <span className="text-2xl text-gray-500 line-through">
                                        {data.originalPrice.toLocaleString('vi-VN')}đ
                                    </span>
                                )}
                                {data.discountPrice && (
                                    <span className="text-4xl font-bold text-neon-magenta">
                                        {data.discountPrice.toLocaleString('vi-VN')}đ
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            {data.countdown_enabled && <CountdownTimer endDate={data.countdown_end_date} />}
                            <a href={data.cta_link} className="mt-6 font-sans uppercase font-semibold tracking-widest px-8 py-3 bg-neon-magenta text-primary-dark transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-neon-magenta focus:ring-opacity-50 rounded-md">
                                {data.cta_text}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SpecialOfferSection;
