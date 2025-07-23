import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SpinWheel from './SpinWheel';
import SpinResultModal from './SpinResultModal';
import './LoyaltySpinWheel.css';

const LoyaltySpinWheel = ({ userId, onPointsUpdate }) => {
    const [userPoints, setUserPoints] = useState(0);
    const [spinConfig, setSpinConfig] = useState(null);
    const [spinItems, setSpinItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [spinning, setSpinning] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [spinResults, setSpinResults] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (userId) {
                await fetchUserPoints();
                await fetchSpinConfig();
                await fetchSpinItems();
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // Watch spinResults để hiển thị modal khi có kết quả
    useEffect(() => {
        if (spinResults.length > 0 && !spinning) {
            console.log('🎯 SpinResults updated, showing modal:', spinResults);
            setShowResult(true);
        }
    }, [spinResults, spinning]);

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

    const fetchSpinConfig = async () => {
        try {
            let apiBase = process.env.REACT_APP_API_BASE_URL;
            if (!apiBase) apiBase = window.location.origin;
            const response = await axios.get(`${apiBase}/api/LoyaltySpin/config`);
            setSpinConfig(response.data);
        } catch (error) {
            console.error('Error fetching spin config:', error);
            setError('Không thể tải cấu hình vòng quay');
        }
    };

    const fetchSpinItems = async () => {
        try {
            let apiBase = process.env.REACT_APP_API_BASE_URL;
            if (!apiBase) apiBase = window.location.origin;
            const response = await axios.get(`${apiBase}/api/LoyaltySpin/items`);
            setSpinItems(response.data);
        } catch (error) {
            console.error('Error fetching spin items:', error);
            setError('Không thể tải danh sách phần thưởng');
        }
    };

    const handleSpin = async (times = 1) => {
        if (!userId || !spinConfig) {
            setError('Thiếu thông tin cần thiết để quay');
            return;
        }

        const totalCost = spinConfig.spinCost * times;
        if (userPoints < totalCost) {
            setError(`Bạn cần ít nhất ${totalCost} điểm để quay ${times} lần`);
            return;
        }

        setLoading(true);
        setSpinning(true);
        setError('');
        const results = [];

        try {
            let apiBase = process.env.REACT_APP_API_BASE_URL;
            if (!apiBase) apiBase = window.location.origin;
            
            for (let i = 0; i < times; i++) {
                const response = await axios.post(`${apiBase}/api/LoyaltySpin/spin/${userId}`);
                const spinResult = response.data;
                
                // Tìm item tương ứng
                const item = spinItems.find(item => item.id === spinResult.spinItemId);
                results.push({
                    ...spinResult,
                    item,
                    // Thông tin voucher từ backend
                    hasVoucher: spinResult.hasVoucher,
                    voucherCode: spinResult.voucherCode,
                    voucherAmount: spinResult.voucherAmount,
                    voucherExpiryDate: spinResult.voucherExpiryDate
                });

                // Delay để tạo hiệu ứng
                if (i < times - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            // Lưu kết quả để hiển thị sau khi bánh xe dừng
            setSpinResults(results);
            console.log('🎯 Spin results set:', results);
            
            // Refresh user points
            await fetchUserPoints();
            // Không gọi onPointsUpdate để tránh reload
            // if (onPointsUpdate) {
            //     onPointsUpdate();
            // }
        } catch (error) {
            console.error('Error spinning:', error);
            setError(error.response?.data || 'Có lỗi xảy ra khi quay');
            setSpinning(false);
        } finally {
            setLoading(false);
        }
    };

    // Hàm được gọi khi bánh xe quay xong
    const handleSpinComplete = () => {
        console.log('🎯 handleSpinComplete called');
        setSpinning(false);
        // Modal sẽ hiện thông qua useEffect khi spinResults có data và spinning = false
    };

    const closeResultModal = () => {
        setShowResult(false);
        setSpinResults([]);
    };

    return (
        <div className="spin-wheel-container">
            <div className="points-display">
                <div className="points-card">
                    <h3>Điểm Loyalty của bạn</h3>
                    <div className="points-value">{userPoints.toLocaleString()}</div>
                    <div className="points-label">điểm</div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="wheel-section">
                <h2>Vòng Quay May Mắn</h2>
                <SpinWheel 
                    items={spinItems}
                    spinning={spinning}
                    onSpinComplete={handleSpinComplete}
                />
                
                {spinConfig && (
                    <div className="spin-cost-info">
                        Mỗi lượt quay: <strong>{spinConfig.spinCost} điểm</strong>
                    </div>
                )}
            </div>

            <div className="spin-controls">
                {spinning && (
                    <div className="spinning-indicator">
                        <div className="spinner"></div>
                        <span>Đang quay...</span>
                    </div>
                )}
                
                <button
                    className="spin-btn spin-1"
                    onClick={() => handleSpin(1)}
                    disabled={loading || spinning || showResult || !spinConfig || userPoints < spinConfig?.spinCost}
                >
                    {loading ? 'Đang xử lý...' : 'Quay 1 lần'}
                </button>
                
                <button
                    className="spin-btn spin-10"
                    onClick={() => handleSpin(10)}
                    disabled={loading || spinning || showResult || !spinConfig || userPoints < (spinConfig?.spinCost * 10)}
                >
                    {loading ? 'Đang xử lý...' : 'Quay 10 lần'}
                </button>
            </div>

            {showResult && (
                <>
                    {console.log('🎯 Rendering SpinResultModal with showResult:', showResult, 'results:', spinResults)}
                    <SpinResultModal
                        results={spinResults}
                        onClose={closeResultModal}
                    />
                </>
            )}
        </div>
    );
};

export default LoyaltySpinWheel;
