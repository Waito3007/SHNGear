import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import LoyaltySpinWheel from '../../components/Loyalty/LoyaltySpinWheel';
import LoyaltyExchange from '../../components/Loyalty/LoyaltyExchange';
import './LoyaltyPage.css';

const LoyaltyPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('spin'); // 'spin' hoặc 'exchange'
    const [userId, setUserId] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Lấy userId từ token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Kiểm tra token còn hạn không
                const currentTime = Date.now() / 1000;
                if (decoded.exp > currentTime) {
                    setUserId(decoded.sub);
                    setIsLoggedIn(true);
                } else {
                    // Token hết hạn
                    localStorage.removeItem('token');
                    setIsLoggedIn(false);
                }
                console.log('Decoded token:', decoded);
            } catch (error) {
                console.error('Error decoding token:', error);
                localStorage.removeItem('token');
                setIsLoggedIn(false);
            }
        } else {
            setIsLoggedIn(false);
        }
        
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSidebarOpen(false); // Đóng sidebar khi chọn tab
    };

    const refreshUserPoints = () => {
        // Không cần reload trang, component tự refresh
        // window.location.reload(); // Bỏ dòng này
    };

    // Nếu chưa đăng nhập, hiển thị trang yêu cầu đăng nhập
    if (!isLoggedIn || !userId) {
        return (
            <div className="loyalty-page">
                <div className="main-content">
                    <div className="login-required">
                        <div className="login-card">
                            <div className="login-icon">🔐</div>
                            <h2>Đăng nhập để tiếp tục</h2>
                            <p>Bạn cần đăng nhập để sử dụng tính năng Loyalty Program</p>
                            <button 
                                className="login-btn"
                                onClick={() => navigate('/')}
                            >
                                Về trang chủ để đăng nhập
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="loyalty-page">
            {/* Hamburger Menu Button */}
            <button 
                className="hamburger-btn"
                onClick={toggleSidebar}
                aria-label="Menu"
            >
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
            </button>

            {/* Overlay */}
            {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}

            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-header">
                    <h2>Loyalty Program</h2>
                </div>
                <nav className="sidebar-nav">
                    <button 
                        className={`nav-item ${activeTab === 'spin' ? 'active' : ''}`}
                        onClick={() => handleTabChange('spin')}
                    >
                        <span className="nav-icon">🎰</span>
                        Quay Thưởng
                    </button>
                    <button 
                        className={`nav-item ${activeTab === 'exchange' ? 'active' : ''}`}
                        onClick={() => handleTabChange('exchange')}
                    >
                        <span className="nav-icon">🎁</span>
                        Đổi Thưởng
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {activeTab === 'spin' && (
                    <LoyaltySpinWheel 
                        userId={userId} 
                        onPointsUpdate={refreshUserPoints}
                    />
                )}
                {activeTab === 'exchange' && (
                    <LoyaltyExchange 
                        userId={userId}
                        onPointsUpdate={refreshUserPoints}
                    />
                )}
            </div>
        </div>
    );
};

export default LoyaltyPage;
