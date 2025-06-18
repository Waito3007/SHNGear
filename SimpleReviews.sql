-- =============================================
-- Script đơn giản: Thêm đánh giá cơ bản
-- =============================================

-- Lưu ý: Thay đổi ProductId và UserId phù hợp với database của bạn

-- Thêm đánh giá cơ bản (5 đánh giá cho mỗi sản phẩm)
INSERT INTO Reviews (ProductId, UserId, Rating, Comment, CreatedAt, IsApproved) VALUES
-- Sản phẩm 1
(1, 1, 5, N'Sản phẩm tuyệt vời! Rất hài lòng với chất lượng.', GETDATE(), 1),
(1, 2, 4, N'Tốt, đúng như mô tả. Sẽ mua lại lần sau.', GETDATE(), 1),
(1, 3, 5, N'Chất lượng cao, giao hàng nhanh. Recommend!', GETDATE(), 1),

-- Sản phẩm 2  
(2, 1, 4, N'Sản phẩm ổn, giá cả hợp lý.', GETDATE(), 1),
(2, 2, 5, N'Xuất sắc! Vượt mong đợi của tôi.', GETDATE(), 1),
(2, 4, 3, N'Bình thường, không có gì đặc biệt.', GETDATE(), 1),

-- Sản phẩm 3
(3, 2, 5, N'Yêu thích sản phẩm này! Chất lượng tuyệt vời.', GETDATE(), 1),
(3, 3, 4, N'Tốt cho mức giá này. Sẽ giới thiệu bạn bè.', GETDATE(), 1),
(3, 5, 5, N'Hoàn hảo! Đúng như tôi mong đợi.', GETDATE(), 1);

-- Kiểm tra kết quả
SELECT 
    ProductId,
    COUNT(*) as TotalReviews,
    AVG(CAST(Rating AS FLOAT)) as AvgRating
FROM Reviews 
GROUP BY ProductId
ORDER BY ProductId;
