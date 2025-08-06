import React from 'react';
import './SpinResultModal.css';

const SpinResultModal = ({ results, onClose }) => {
    console.log('🎯 SpinResultModal rendered with results:', results);
    
    if (!results || results.length === 0) {
        console.log('🎯 No results, not rendering modal');
        return null;
    }

    const getTotalVouchers = () => {
        return results.filter(result => result.item?.voucherCode).length;
    };

    const getUniqueItems = () => {
        const itemCounts = {};
        results.forEach(result => {
            const itemName = result.item?.name || 'Vật phẩm không xác định';
            itemCounts[itemName] = (itemCounts[itemName] || 0) + 1;
        });
        return itemCounts;
    };

    const formatSpinTime = (spinAt) => {
        return new Date(spinAt).toLocaleString('vi-VN');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🎉 Kết Quả Quay Thưởng</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="results-summary">
                        <div className="summary-item">
                            <span className="summary-label">Tổng lượt quay:</span>
                            <span className="summary-value">{results.length}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Voucher nhận được:</span>
                            <span className="summary-value voucher-count">{getTotalVouchers()}</span>
                        </div>
                    </div>

                    <div className="items-summary">
                        <h3>Phần thưởng nhận được:</h3>
                        <div className="items-grid">
                            {Object.entries(getUniqueItems()).map(([itemName, count]) => {
                                const sampleResult = results.find(r => r.item?.name === itemName);
                                const isVoucher = sampleResult?.item?.voucherCode;
                                const isLucky = sampleResult?.item?.isLuckyNextTime;
                                
                                return (
                                    <div key={itemName} className={`item-card ${isVoucher ? 'voucher' : ''} ${isLucky ? 'lucky' : ''}`}>
                                        <div className="item-icon">
                                            {isVoucher ? '🎫' : isLucky ? '🍀' : '🎁'}
                                        </div>
                                        <div className="item-details">
                                            <div className="item-name">{itemName}</div>
                                            <div className="item-count">x{count}</div>
                                            {isVoucher && (
                                                <div className="voucher-code">
                                                    Mã: <span>{sampleResult.item.voucherCode}</span>
                                                </div>
                                            )}
                                            {sampleResult?.item?.description && (
                                                <div className="item-description">
                                                    {sampleResult.item.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {results.length > 1 && (
                        <div className="detailed-results">
                            <h3>Chi tiết từng lượt quay:</h3>
                            <div className="results-list">
                                {results.map((result, index) => (
                                    <div key={index} className="result-item">
                                        <div className="result-number">#{index + 1}</div>
                                        <div className="result-details">
                                            <div className="result-item-name">{result.item?.name || 'Vật phẩm không xác định'}</div>
                                            <div className="result-time">{formatSpinTime(result.spinAt)}</div>
                                        </div>
                                        <div className="result-points">-{result.pointsUsed} điểm</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="confirm-btn" onClick={onClose}>
                        Tuyệt vời! 🎊
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpinResultModal;
