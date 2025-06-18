-- =============================================
-- Script: Thêm đánh giá mẫu cho sản phẩm
-- Tác giả: SHN Gear System
-- Ngày tạo: 2025-06-18
-- =============================================

-- Đảm bảo có dữ liệu người dùng trước khi thêm reviews
-- Nếu chưa có users, hãy tạo một số users mẫu trước

-- Thêm các đánh giá cho các sản phẩm (giả sử ProductId từ 1-10 và UserId từ 1-15)

-- ===========================================
-- ĐÁNH GIÁ CHO ĐIỆN THOẠI (ProductId 1-4)
-- ===========================================

-- iPhone 15 Pro Max (giả sử ProductId = 1)
INSERT INTO Reviews (ProductId, UserId, Rating, Comment, CreatedAt, IsApproved) VALUES
(1, 1, 5, N'iPhone 15 Pro Max thật sự ấn tượng! Camera cực kỳ sắc nét, hiệu năng mượt mà. Đặc biệt thích tính năng Action Button mới.', DATEADD(day, -15, GETDATE()), 1),
(1, 2, 4, N'Sản phẩm chất lượng cao, màn hình đẹp, pin trâu. Tuy nhiên giá hơi cao so với túi tiền.', DATEADD(day, -12, GETDATE()), 1),
(1, 3, 5, N'Quá tuyệt vời! Face ID nhanh, camera chụp đêm siêu đỉnh. Xứng đáng từng đồng bỏ ra.', DATEADD(day, -8, GETDATE()), 1),
(1, 4, 4, N'Thiết kế sang trọng, hiệu năng mạnh mẽ. Hơi nặng một chút nhưng vẫn ok.', DATEADD(day, -5, GETDATE()), 1),
(1, 5, 5, N'Flagship đỉnh cao! Mọi thứ đều hoàn hảo từ thiết kế đến hiệu năng.', DATEADD(day, -2, GETDATE()), 1);

-- Samsung Galaxy S24 Ultra (giả sử ProductId = 2)
INSERT INTO Reviews (ProductId, UserId, Rating, Comment, CreatedAt, IsApproved) VALUES
(2, 6, 5, N'Galaxy S24 Ultra xuất sắc! S Pen rất hữu ích, camera zoom 100x thật đáng kinh ngạc.', DATEADD(day, -14, GETDATE()), 1),
(2, 7, 4, N'Màn hình đẹp mê ly, hiệu năng khủng. Pin có thể tốt hơn một chút.', DATEADD(day, -11, GETDATE()), 1),
(2, 8, 5, N'Tôi yêu chiếc điện thoại này! Đa nhiệm mượt mà, camera chuyên nghiệp.', DATEADD(day, -7, GETDATE()), 1),
(2, 9, 4, N'Sản phẩm tốt, tuy nhiên hơi cồng kềnh. Phù hợp cho công việc chuyên nghiệp.', DATEADD(day, -4, GETDATE()), 1);

-- Xiaomi 14 Pro (giả sử ProductId = 3)
INSERT INTO Reviews (ProductId, UserId, Rating, Comment, CreatedAt, IsApproved) VALUES
(3, 10, 4, N'Xiaomi 14 Pro có tỷ lệ giá/hiệu năng rất tốt. Camera Leica ấn tượng!', DATEADD(day, -13, GETDATE()), 1),
(3, 11, 5, N'Quá hài lòng với lựa chọn này! Hiệu năng mạnh, giá cả hợp lý.', DATEADD(day, -9, GETDATE()), 1),
(3, 12, 4, N'Sản phẩm tốt trong tầm giá. MIUI 15 mượt mà hơn nhiều so với trước.', DATEADD(day, -6, GETDATE()), 1);

-- ===========================================
-- ĐÁNH GIÁ CHO LAPTOP (ProductId 5-7)
-- ===========================================

-- MacBook Pro M3 (giả sử ProductId = 5)
INSERT INTO Reviews (ProductId, UserId, Rating, Comment, CreatedAt, IsApproved) VALUES
(5, 1, 5, N'MacBook Pro M3 quá đỉnh! Hiệu năng vượt trội, pin sử dụng cả ngày không lo hết.', DATEADD(day, -16, GETDATE()), 1),
(5, 3, 5, N'Chip M3 thật sự ấn tượng. Render video 4K mà không hề nóng máy.', DATEADD(day, -10, GETDATE()), 1),
(5, 5, 4, N'Sản phẩm tuyệt vời cho công việc sáng tạo. Giá hơi cao nhưng đáng đồng tiền.', DATEADD(day, -3, GETDATE()), 1);

-- Dell XPS 13 (giả sử ProductId = 6)
INSERT INTO Reviews (ProductId, UserId, Rating, Comment, CreatedAt, IsApproved) VALUES
(6, 7, 4, N'Dell XPS 13 có thiết kế đẹp, màn hình sắc nét. Bàn phím gõ rất thoải mái.', DATEADD(day, -12, GETDATE()), 1),
(6, 9, 4, N'Laptop nhỏ gọn, phù hợp cho di động. Hiệu năng ổn định cho công việc văn phòng.', DATEADD(day, -8, GETDATE()), 1),
(6, 11, 3, N'Sản phẩm ok, tuy nhiên port kết nối hơi ít. Cần phải mua thêm hub.', DATEADD(day, -5, GETDATE()), 1);

-- Gaming Laptop ASUS ROG (giả sử ProductId = 7)
INSERT INTO Reviews (ProductId, UserId, Rating, Comment, CreatedAt, IsApproved) VALUES
(7, 2, 5, N'Laptop gaming tuyệt vời! Chạy mọi game ở mức Ultra mượt mà.', DATEADD(day, -15, GETDATE()), 1),
(7, 4, 4, N'Hiệu năng khủng, tản nhiệt tốt. Hơi nặng và ồn khi chạy game nặng.', DATEADD(day, -7, GETDATE()), 1),
(7, 6, 5, N'RGB đẹp mắt, keyboard cơ học rất thích. Xứng danh gaming beast!', DATEADD(day, -4, GETDATE()), 1);

-- ===========================================
-- ĐÁNH GIÁ CHO TAI NGHE (ProductId 8-10)
-- ===========================================

-- AirPods Pro 2 (giả sử ProductId = 8)
INSERT INTO Reviews (ProductId, UserId, Rating, Comment, CreatedAt, IsApproved) VALUES
(8, 8, 5, N'AirPods Pro 2 xuất sắc! Chống ồn tuyệt vời, âm thanh trong trẻo.', DATEADD(day, -14, GETDATE()), 1),
(8, 10, 4, N'Tai nghe tốt, tuy nhiên có thể rơi ra khỏi tai khi vận động mạnh.', DATEADD(day, -9, GETDATE()), 1),
(8, 12, 5, N'Hoàn hảo cho iPhone! Kết nối nhanh, chất lượng âm thanh đỉnh cao.', DATEADD(day, -6, GETDATE()), 1);

-- Sony WH-1000XM5 (giả sử ProductId = 9)
INSERT INTO Reviews (ProductId, UserId, Rating, Comment, CreatedAt, IsApproved) VALUES
(9, 1, 5, N'Tai nghe chống ồn tốt nhất từng dùng! Pin trâu, âm thanh Hi-Res tuyệt vời.', DATEADD(day, -13, GETDATE()), 1),
(9, 3, 4, N'Chất lượng tốt, đeo lâu hơi mỏi tai. Phù hợp cho chuyến bay dài.', DATEADD(day, -8, GETDATE()), 1),
(9, 7, 5, N'Sony không bao giờ làm tôi thất vọng! Âm bass sâu, treble trong.', DATEADD(day, -2, GETDATE()), 1);

-- JBL Flip 6 (giả sử ProductId = 10)
INSERT INTO Reviews (ProductId, UserId, Rating, Comment, CreatedAt, IsApproved) VALUES
(10, 5, 4, N'Loa bluetooth tuyệt vời cho picnic. Chống nước tốt, âm thanh to và rõ.', DATEADD(day, -11, GETDATE()), 1),
(10, 9, 4, N'Thiết kế đẹp, dễ mang theo. Phù hợp cho các buổi party nhỏ.', DATEADD(day, -5, GETDATE()), 1),
(10, 11, 3, N'Sản phẩm ok trong tầm giá. Bass có thể mạnh hơn một chút.', DATEADD(day, -3, GETDATE()), 1);

-- ===========================================
-- THÊM MỘT SỐ ĐÁNH GIÁ TIÊU CỰC ĐỂ CÂN BẰNG
-- ===========================================

INSERT INTO Reviews (ProductId, UserId, Rating, Comment, CreatedAt, IsApproved) VALUES
(1, 13, 2, N'Giá quá đắt so với những gì mang lại. Pin không như quảng cáo.', DATEADD(day, -1, GETDATE()), 1),
(2, 14, 3, N'Sản phẩm ok nhưng phần mềm còn nhiều lỗi. Cần cập nhật thêm.', DATEADD(day, -6, GETDATE()), 1),
(5, 15, 2, N'MacBook đẹp nhưng không tương thích với một số phần mềm Windows.', DATEADD(day, -4, GETDATE()), 1),
(8, 13, 3, N'Tai nghe dễ bị mất, case sạc hay bị trầy xước.', DATEADD(day, -7, GETDATE()), 1);

-- ===========================================
-- THÔNG BÁO HOÀN THÀNH
-- ===========================================

PRINT N'✅ Đã thêm thành công các đánh giá mẫu cho sản phẩm!';
PRINT N'📊 Tổng cong đã thêm: ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + N' đánh giá';
PRINT N'🎯 Bao gồm đánh giá cho điện thoại, laptop, tai nghe với rating từ 1-5 sao';
PRINT N'📝 Các đánh giá đều đã được approve sẵn để hiển thị';

-- Câu lệnh kiểm tra kết quả
SELECT 
    p.Name AS ProductName,
    COUNT(r.Id) AS TotalReviews,
    AVG(CAST(r.Rating AS FLOAT)) AS AvgRating,
    MIN(r.Rating) AS MinRating,
    MAX(r.Rating) AS MaxRating
FROM Products p
LEFT JOIN Reviews r ON p.Id = r.ProductId
WHERE r.IsApproved = 1
GROUP BY p.Id, p.Name
ORDER BY AVG(CAST(r.Rating AS FLOAT)) DESC;
