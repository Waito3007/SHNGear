-- =============================================
-- Script: Xóa và thêm lại reviews với encoding đúng
-- Tác giả: SHN Gear System
-- Ngày tạo: 2025-06-18
-- =============================================

-- Xóa tất cả reviews cũ
DELETE FROM Reviews;
PRINT N'🗑️ Đã xóa tất cả reviews cũ';

-- Reset Identity seed
DBCC CHECKIDENT ('Reviews', RESEED, 0);
PRINT N'🔄 Đã reset Identity seed';

-- Thêm reviews mới với encoding UTF-8 đúng
INSERT INTO Reviews (ProductId, UserId, Rating, Comment, CreatedAt, IsApproved) VALUES
-- Sản phẩm 1
(1, 1, 5, N'Sản phẩm tuyệt vời! Chất lượng cao, thiết kế đẹp mắt. Rất hài lòng với lựa chọn này.', DATEADD(day, -15, GETDATE()), 1),
(1, 3, 4, N'Sản phẩm tốt, giá cả hợp lý. Giao hàng nhanh, đóng gói cẩn thận.', DATEADD(day, -12, GETDATE()), 1),
(1, 5, 5, N'Quá ưng ý! Sẽ mua lại và giới thiệu cho bạn bè. Dịch vụ tuyệt vời.', DATEADD(day, -8, GETDATE()), 1),
(1, 7, 4, N'Chất lượng tốt, đáng đồng tiền bát gạo. Hơi lâu ship nhưng vẫn ok.', DATEADD(day, -5, GETDATE()), 1),
(1, 9, 3, N'Sản phẩm ổn, tuy nhiên không hoàn hảo như mong đợi. Giá hơi cao.', DATEADD(day, -2, GETDATE()), 1),

-- Sản phẩm 2
(2, 4, 5, N'Xuất sắc! Hiệu năng mạnh mẽ, thiết kế hiện đại. Đáng mua trong tầm giá.', DATEADD(day, -14, GETDATE()), 1),
(2, 6, 4, N'Sản phẩm chất lượng, tính năng đa dạng. Hỗ trợ khách hàng tốt.', DATEADD(day, -11, GETDATE()), 1),
(2, 8, 5, N'Tôi yêu sản phẩm này! Dùng mượt mà, bền bỉ. Sẽ mua thêm.', DATEADD(day, -7, GETDATE()), 1),
(2, 10, 4, N'Tốt trong tầm giá, tuy nhiên cần cải thiện một số tính năng nhỏ.', DATEADD(day, -4, GETDATE()), 1),

-- Sản phẩm 3
(3, 11, 4, N'Sản phẩm có tỷ lệ giá/hiệu năng tốt. Đáng mua cho người mới.', DATEADD(day, -13, GETDATE()), 1),
(3, 1, 5, N'Rất hài lòng với lựa chọn này! Hiệu năng ổn định, giá cả hợp lý.', DATEADD(day, -9, GETDATE()), 1),
(3, 3, 4, N'Sản phẩm tốt trong tầm giá. Dịch vụ hậu mãi chu đáo.', DATEADD(day, -6, GETDATE()), 1),

-- Sản phẩm 4
(4, 5, 5, N'Tuyệt vời! Vượt xa mong đợi. Chất lượng premium, xứng đáng từng đồng.', DATEADD(day, -16, GETDATE()), 1),
(4, 7, 4, N'Sản phẩm ổn, thiết kế đẹp. Một số tính năng có thể cải thiện thêm.', DATEADD(day, -10, GETDATE()), 1),
(4, 9, 5, N'Hoàn hảo! Sẽ giới thiệu cho mọi người. Dịch vụ chuyên nghiệp.', DATEADD(day, -3, GETDATE()), 1),

-- Sản phẩm 5
(5, 4, 5, N'Siêu phẩm! Hiệu năng vượt trội, thiết kế sang trọng. Đáng mua nhất.', DATEADD(day, -17, GETDATE()), 1),
(5, 6, 4, N'Sản phẩm chất lượng cao, tuy nhiên giá hơi cao so với đối thủ.', DATEADD(day, -12, GETDATE()), 1),
(5, 8, 5, N'Quá ưng ý! Sử dụng mượt mà, không có lỗi nào. Highly recommended!', DATEADD(day, -8, GETDATE()), 1),
(5, 10, 2, N'Sản phẩm đẹp nhưng không tương thích với nhu cầu của tôi.', DATEADD(day, -4, GETDATE()), 1),

-- Sản phẩm 6
(6, 11, 4, N'Laptop tốt, thiết kế đẹp. Phù hợp cho công việc văn phòng và học tập.', DATEADD(day, -15, GETDATE()), 1),
(6, 1, 4, N'Máy nhỏ gọn, dễ mang theo. Hiệu năng ổn định, pin tốt.', DATEADD(day, -11, GETDATE()), 1),
(6, 3, 3, N'Sản phẩm ok, tuy nhiên cổng kết nối hơi ít. Cần mua thêm hub.', DATEADD(day, -7, GETDATE()), 1),

-- Sản phẩm 7
(7, 5, 5, N'Gaming laptop tuyệt vời! Chạy mọi game mượt mà ở cấu hình cao.', DATEADD(day, -18, GETDATE()), 1),
(7, 7, 4, N'Hiệu năng khủng, tản nhiệt tốt. Hơi nặng và ồn khi chơi game.', DATEADD(day, -9, GETDATE()), 1),
(7, 9, 5, N'RGB đẹp mắt, bàn phím cơ học tuyệt vời. Xứng danh gaming beast!', DATEADD(day, -5, GETDATE()), 1),

-- Sản phẩm 8
(8, 4, 5, N'Tai nghe tuyệt vời! Chống ồn hiệu quả, âm thanh trong trẻo.', DATEADD(day, -16, GETDATE()), 1),
(8, 6, 4, N'Sản phẩm tốt, tuy nhiên có thể rơi ra khi vận động mạnh.', DATEADD(day, -12, GETDATE()), 1),
(8, 8, 5, N'Hoàn hảo! Kết nối nhanh, chất lượng âm thanh đỉnh cao.', DATEADD(day, -8, GETDATE()), 1),
(8, 10, 3, N'Tai nghe ok nhưng dễ bị mất, case sạc hay bị trầy xước.', DATEADD(day, -4, GETDATE()), 1),

-- Sản phẩm 9
(9, 11, 5, N'Tai nghe chống ồn tốt nhất! Pin lâu, âm thanh Hi-Res tuyệt vời.', DATEADD(day, -14, GETDATE()), 1),
(9, 1, 4, N'Chất lượng tốt, đeo lâu hơi mỏi tai. Phù hợp cho chuyến bay dài.', DATEADD(day, -10, GETDATE()), 1),
(9, 3, 5, N'Sony luôn xuất sắc! Âm bass sâu, treble trong. Đáng mua!', DATEADD(day, -6, GETDATE()), 1),

-- Sản phẩm 10
(10, 5, 4, N'Loa bluetooth tuyệt vời cho picnic. Chống nước tốt, âm thanh to rõ.', DATEADD(day, -13, GETDATE()), 1),
(10, 7, 4, N'Thiết kế đẹp, dễ mang theo. Phù hợp cho các buổi tiệc nhỏ.', DATEADD(day, -9, GETDATE()), 1),
(10, 9, 3, N'Sản phẩm ổn trong tầm giá. Bass có thể mạnh hơn một chút.', DATEADD(day, -5, GETDATE()), 1),

-- Thêm reviews cho các sản phẩm khác (11-25)
(11, 4, 5, N'Sản phẩm tuyệt vời! Chất lượng cao, thiết kế đẹp. Rất đáng mua.', DATEADD(day, -11, GETDATE()), 1),
(11, 6, 4, N'Tốt trong tầm giá, dịch vụ hỗ trợ khách hàng chu đáo.', DATEADD(day, -7, GETDATE()), 1),
(11, 8, 5, N'Cực kỳ hài lòng! Sản phẩm vượt mong đợi. Sẽ mua thêm.', DATEADD(day, -4, GETDATE()), 1),

(12, 8, 5, N'Xuất sắc! Hiệu năng mạnh mẽ, sử dụng mượt mà. Highly recommended!', DATEADD(day, -10, GETDATE()), 1),
(12, 10, 4, N'Sản phẩm chất lượng, giá cả hợp lý. Sẽ mua lại nếu cần.', DATEADD(day, -6, GETDATE()), 1),
(12, 1, 5, N'Tuyệt vời! Đúng như mô tả, giao hàng nhanh chóng.', DATEADD(day, -3, GETDATE()), 1),

(13, 11, 4, N'Thiết kế hiện đại, tính năng đa dạng. Phù hợp với nhu cầu.', DATEADD(day, -9, GETDATE()), 1),
(13, 1, 5, N'Rất hài lòng! Vượt xa mong đợi. Sẽ giới thiệu cho bạn bè.', DATEADD(day, -5, GETDATE()), 1),
(13, 3, 4, N'Sản phẩm ổn định, hiệu năng tốt. Giá thành hợp lý.', DATEADD(day, -2, GETDATE()), 1),

(14, 3, 4, N'Sản phẩm tốt, đóng gói cẩn thận. Giao hàng đúng hẹn.', DATEADD(day, -8, GETDATE()), 1),
(14, 5, 5, N'Tuyệt vời! Chất lượng premium, xứng đáng từng đồng bỏ ra.', DATEADD(day, -4, GETDATE()), 1),
(14, 7, 4, N'Khá ổn trong tầm giá. Dịch vụ chăm sóc khách hàng tốt.', DATEADD(day, -1, GETDATE()), 1),

(15, 7, 4, N'Sản phẩm ổn định, hiệu năng tốt. Một số tính năng có thể cải thiện.', DATEADD(day, -7, GETDATE()), 1),
(15, 9, 5, N'Hoàn hảo! Sử dụng dễ dàng, bền bỉ. Sẽ mua thêm cho gia đình.', DATEADD(day, -3, GETDATE()), 1),

-- Thêm một số đánh giá tiêu cực để cân bằng
(16, 4, 2, N'Sản phẩm không như mong đợi. Chất lượng chưa tương xứng với giá.', DATEADD(day, -6, GETDATE()), 1),
(17, 6, 3, N'Sản phẩm ok nhưng có một số lỗi nhỏ. Cần cải thiện thêm.', DATEADD(day, -5, GETDATE()), 1),
(18, 8, 2, N'Không hài lòng lắm. Sản phẩm có vấn đề, cần đổi trả.', DATEADD(day, -4, GETDATE()), 1),
(19, 10, 3, N'Trung bình, không tệ nhưng cũng không xuất sắc. Tạm được.', DATEADD(day, -3, GETDATE()), 1),
(20, 11, 2, N'Giá cao so với chất lượng. Có thể tìm được sản phẩm tốt hơn.', DATEADD(day, -2, GETDATE()), 1),

-- Thêm reviews cho sản phẩm 21-30
(21, 1, 5, N'iPhone mới tuyệt vời! Camera sắc nét, hiệu năng mượt mà.', DATEADD(day, -12, GETDATE()), 1),
(21, 3, 4, N'Sản phẩm Apple luôn chất lượng. Giá hơi cao nhưng đáng đồng tiền.', DATEADD(day, -8, GETDATE()), 1),
(21, 5, 5, N'Face ID nhanh, pin trâu. Rất hài lòng với lựa chọn này.', DATEADD(day, -4, GETDATE()), 1),

(22, 4, 4, N'Samsung Galaxy tốt! Màn hình đẹp, S Pen hữu ích.', DATEADD(day, -11, GETDATE()), 1),
(22, 6, 5, N'Tuyệt vời! Camera zoom xa, đa nhiệm mượt mà.', DATEADD(day, -7, GETDATE()), 1),
(22, 8, 4, N'Sản phẩm chất lượng, tuy nhiên hơi cồng kềnh.', DATEADD(day, -3, GETDATE()), 1),

(23, 7, 5, N'Xiaomi có tỷ lệ giá/hiệu năng tuyệt vời! Camera Leica ấn tượng.', DATEADD(day, -10, GETDATE()), 1),
(23, 9, 4, N'MIUI mượt mà, hiệu năng ổn định. Giá cả hợp lý.', DATEADD(day, -6, GETDATE()), 1),
(23, 11, 5, N'Quá hài lòng! Đáng mua trong phân khúc này.', DATEADD(day, -2, GETDATE()), 1),

(24, 1, 4, N'Google Pixel camera tuyệt vời! AI photography thông minh.', DATEADD(day, -9, GETDATE()), 1),
(24, 4, 5, N'Android thuần túy, cập nhật nhanh. Rất thích!', DATEADD(day, -5, GETDATE()), 1),
(24, 6, 4, N'Sản phẩm tốt, tuy nhiên giá hơi cao ở Việt Nam.', DATEADD(day, -1, GETDATE()), 1),

(25, 5, 5, N'OnePlus nhanh như chớp! OxygenOS mượt mà.', DATEADD(day, -8, GETDATE()), 1),
(25, 8, 4, N'Sạc nhanh tuyệt vời, thiết kế đẹp. Khuyến nghị!', DATEADD(day, -4, GETDATE()), 1);

-- ===========================================
-- THÔNG BÁO HOÀN THÀNH
-- ===========================================

PRINT N'✅ Đã thêm thành công các đánh giá mẫu mới!';
PRINT N'📊 Tổng số reviews đã thêm: ' + CAST(@@ROWCOUNT AS NVARCHAR(10));
PRINT N'🎯 Tất cả reviews đều sử dụng Unicode chính xác';
PRINT N'📝 Các đánh giá đều đã được approve để hiển thị';

-- Kiểm tra kết quả
SELECT 
    COUNT(*) as TotalReviews,
    AVG(CAST(Rating AS FLOAT)) as OverallAvgRating
FROM Reviews 
WHERE IsApproved = 1;

PRINT N'🔍 Hiển thị 5 reviews mới nhất để kiểm tra encoding:';

SELECT TOP 5 
    r.Id,
    p.Name as ProductName,
    r.Rating,
    LEFT(r.Comment, 50) + N'...' as CommentPreview
FROM Reviews r
INNER JOIN Products p ON r.ProductId = p.Id
WHERE r.IsApproved = 1
ORDER BY r.Id DESC;
