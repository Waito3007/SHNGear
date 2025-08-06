import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LoyaltyExchange.css';

const LoyaltyExchange = ({ userId, onPointsUpdate }) => {
    const [userPoints, setUserPoints] = useState(0);
    const [spinHistory, setSpinHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (userId) {
            fetchUserPoints();
            fetchSpinHistory();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const fetchUserPoints = async () => {
        try {
            let apiBase = process.env.REACT_APP_API_BASE_URL;
            if (!apiBase) apiBase = window.location.origin;
            const response = await axios.get(`${apiBase}/api/LoyaltySpin/points/${userId}`);
            setUserPoints(response.data);
        } catch (error) {
            console.error('Error fetching user points:', error);
            setError('Không thể tải điểm của bạn');
        }
    };

    const fetchSpinHistory = async () => {
        try {
            setLoading(true);
            let apiBase = process.env.REACT_APP_API_BASE_URL;
            if (!apiBase) apiBase = window.location.origin;
            const response = await axios.get(`${apiBase}/api/LoyaltySpin/history/${userId}`);
            setSpinHistory(response.data);
        } catch (error) {
            console.error('Error fetching spin history:', error);
            setError('Không thể tải lịch sử quay');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <div className="exchange-container">
            <div className="points-display">
                <div className="points-card">
                    <h3>Điểm Loyalty hiện tại</h3>
                    <div className="points-value">{userPoints.toLocaleString()}</div>
                    <div className="points-label">điểm</div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="history-section">
                <h2>Lịch Sử Quay Thưởng</h2>
                
                {loading ? (
                    <div className="loading-message">
                        Đang tải lịch sử...
                    </div>
                ) : spinHistory.length === 0 ? (
                    <div className="empty-history">
                        <div className="empty-icon">🎰</div>
                        <h3>Chưa có lịch sử quay thưởng</h3>
                        <p>Hãy thử vận may của bạn tại mục "Quay Thưởng"!</p>
                    </div>
                ) : (
                    <div className="history-list">
                        {spinHistory.map((record, index) => (
                            <div key={record.id || index} className="history-item">
                                <div className="history-icon">🎁</div>
                                <div className="history-details">
                                    <div className="history-title">
                                        Lượt quay #{record.id}
                                    </div>
                                    <div className="history-time">
                                        {formatDate(record.spinAt)}
                                    </div>
                                    <div className="history-points">
                                        Đã sử dụng: {record.pointsUsed} điểm
                                    </div>
                                </div>
                                <div className="history-status">
                                    <span className="status-badge">Hoàn thành</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="exchange-info">
                <h3>Về Chương Trình Đổi Thưởng</h3>
                <div className="info-card">
                    <p>🎁 Tích lũy điểm qua các hoạt động mua sắm</p>
                    <p>🎰 Sử dụng điểm để quay thưởng</p>
                    <p>🎫 Nhận voucher và phần thưởng hấp dẫn</p>
                    <p>🍀 May mắn sẽ đến với bạn!</p>
                </div>
            </div>
        </div>
    );
};

export default LoyaltyExchange;
