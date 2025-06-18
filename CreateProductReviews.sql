-- =============================================
-- Script: Tạo Reviews cho sản phẩm SHN Gear
-- Tác giả: SHN Gear System
-- Ngày tạo: 2025-06-18
-- =============================================

USE ShnGear;
GO

PRINT N'🚀 Bắt đầu tạo reviews cho sản phẩm SHN Gear...';

-- Kiểm tra dữ liệu hiện tại
DECLARE @ProductCount INT = (SELECT COUNT(*) FROM Products);
DECLARE @UserCount INT = (SELECT COUNT(*) FROM Users);

PRINT N'📊 Thông tin database:';
PRINT N'   - Số sản phẩm: ' + CAST(@ProductCount AS NVARCHAR(10));
PRINT N'   - Số người dùng: ' + CAST(@UserCount AS NVARCHAR(10));

IF @ProductCount = 0 OR @UserCount = 0
BEGIN
    PRINT N'❌ Không thể tạo reviews: Thiếu sản phẩm hoặc người dùng!';
    RETURN;
END

-- Bảng comments mẫu theo loại sản phẩm
DECLARE @PhoneComments TABLE (Comment NVARCHAR(500), Rating INT);
INSERT INTO @PhoneComments VALUES
(N'Điện thoại tuyệt vời! Camera sắc nét, pin trâu, hiệu năng mượt mà.', 5),
(N'Rất hài lòng với sản phẩm. Thiết kế đẹp, chất lượng tốt.', 4),
(N'Sản phẩm đúng như mô tả. Giao hàng nhanh, đóng gói cẩn thận.', 5),
(N'Điện thoại chất lượng cao, tính năng đầy đủ. Rất recommend!', 5),
(N'Dùng rất ổn, phù hợp với giá tiền. Màn hình đẹp, cảm ứng nhạy.', 4),
(N'Pin khá tốt, có thể dùng cả ngày. Camera chụp đêm ấn tượng.', 4),
(N'Thiết kế sang trọng, cầm nắm chắc tay. Hệ điều hành mượt mà.', 5),
(N'Sản phẩm tốt trong tầm giá. Hiệu năng ổn định cho nhu cầu hàng ngày.', 4),
(N'Chất lượng ok, tuy nhiên hơi nặng. Nhìn chung vẫn hài lòng.', 3),
(N'Flagship đỉnh cao! Mọi thứ đều hoàn hảo từ thiết kế đến hiệu năng.', 5);

DECLARE @LaptopComments TABLE (Comment NVARCHAR(500), Rating INT);
INSERT INTO @LaptopComments VALUES
(N'Laptop tuyệt vời cho công việc! Hiệu năng mạnh, pin lâu.', 5),
(N'Máy chạy mượt, không bị lag. Phù hợp cho lập trình và thiết kế.', 4),
(N'Màn hình đẹp, bàn phím gõ thoải mái. Rất hài lòng!', 5),
(N'Laptop gaming đỉnh! Chạy mọi game ở mức Ultra mượt mà.', 5),
(N'Thiết kế đẹp, nhỏ gọn dễ mang theo. Hiệu năng ổn định.', 4),
(N'Chất lượng build tốt, tản nhiệt hiệu quả. Đáng đồng tiền.', 4),
(N'Màn hình 4K tuyệt đẹp, âm thanh stereo chất lượng cao.', 5),
(N'Laptop văn phòng lý tưởng. Khởi động nhanh, đa nhiệm mượt.', 4),
(N'Hơi nặng một chút nhưng hiệu năng bù đắp. Tổng thể ok.', 3),
(N'MacBook Pro M3 quá đỉnh! Render video 4K không hề nóng máy.', 5);

DECLARE @HeadphoneComments TABLE (Comment NVARCHAR(500), Rating INT);
INSERT INTO @HeadphoneComments VALUES
(N'Tai nghe chất lượng cao! Âm thanh trong trẻo, bass sâu.', 5),
(N'Chống ồn tuyệt vời, phù hợp cho văn phòng ồn ào.', 4),
(N'Thiết kế đẹp, đeo thoải mái. Pin dùng lâu.', 5),
(N'AirPods Pro 2 xuất sắc! Kết nối nhanh, chất lượng âm thanh đỉnh.', 5),
(N'Tai nghe wireless tiện lợi. Chất lượng âm thanh ổn.', 4),
(N'Tính năng chống ồn thông minh. Rất thích!', 4),
(N'Âm thanh Hi-Res tuyệt vời, đáng từng đồng bỏ ra.', 5),
(N'Gaming headset tốt, micro rõ ràng. Phù hợp stream.', 4),
(N'Có thể rơi ra khỏi tai khi vận động mạnh. Nhìn chung ok.', 3),
(N'Sony không bao giờ làm tôi thất vọng! Âm bass sâu, treble trong.', 5);

DECLARE @GeneralComments TABLE (Comment NVARCHAR(500), Rating INT);
INSERT INTO @GeneralComments VALUES
(N'Sản phẩm tuyệt vời! Rất hài lòng với chất lượng.', 5),
(N'Chất lượng tốt, giá cả hợp lý. Sẽ mua lại lần sau.', 4),
(N'Đúng như mô tả, giao hàng nhanh. Recommend!', 5),
(N'Sản phẩm ổn, phù hợp với nhu cầu sử dụng.', 4),
(N'Chất lượng cao, dịch vụ tốt. Cảm ơn shop!', 5),
(N'Rất hài lòng! Sẽ giới thiệu cho bạn bè.', 4),
(N'Tốt trong tầm giá, đáng để mua thử.', 4),
(N'Sản phẩm ok, không có gì đặc biệt.', 3),
(N'Xuất sắc! Vượt mong đợi của tôi.', 5),
(N'Bình thường, có thể tốt hơn.', 3);

-- =============================================
-- TẠO REVIEWS CHO TỪNG SẢN PHẨM
-- =============================================

DECLARE @ProductId INT, @ProductName NVARCHAR(255), @CategoryName NVARCHAR(100);
DECLARE @UserId INT, @ReviewCount INT = 0;
DECLARE @Comment NVARCHAR(500), @Rating INT;

-- Cursor để duyệt qua tất cả sản phẩm
DECLARE product_cursor CURSOR FOR 
SELECT p.Id, p.Name, c.Name as CategoryName
FROM Products p
INNER JOIN Categories c ON p.CategoryId = c.Id
ORDER BY p.Id;

OPEN product_cursor;
FETCH NEXT FROM product_cursor INTO @ProductId, @ProductName, @CategoryName;

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT N'📱 Tạo reviews cho: ' + @ProductName + N' (Category: ' + @CategoryName + N')';
    
    -- Tạo 3-7 reviews ngẫu nhiên cho mỗi sản phẩm
    DECLARE @ReviewsToCreate INT = 3 + (ABS(CHECKSUM(NEWID())) % 5); -- 3-7 reviews
    DECLARE @CurrentReview INT = 1;
    
    WHILE @CurrentReview <= @ReviewsToCreate
    BEGIN
        -- Chọn user ngẫu nhiên
        SELECT TOP 1 @UserId = Id 
        FROM Users 
        WHERE Id NOT IN (
            SELECT UserId FROM Reviews WHERE ProductId = @ProductId
        )
        ORDER BY NEWID();
        
        -- Nếu hết user thì dừng
        IF @UserId IS NULL
            BREAK;
            
        -- Chọn comment phù hợp theo category
        IF @CategoryName LIKE N'%phone%' OR @CategoryName LIKE N'%điện thoại%'
        BEGIN
            SELECT TOP 1 @Comment = Comment, @Rating = Rating 
            FROM @PhoneComments 
            ORDER BY NEWID();
        END
        ELSE IF @CategoryName LIKE N'%laptop%' OR @CategoryName LIKE N'%máy tính%'
        BEGIN
            SELECT TOP 1 @Comment = Comment, @Rating = Rating 
            FROM @LaptopComments 
            ORDER BY NEWID();
        END
        ELSE IF @CategoryName LIKE N'%headphone%' OR @CategoryName LIKE N'%tai nghe%'
        BEGIN
            SELECT TOP 1 @Comment = Comment, @Rating = Rating 
            FROM @HeadphoneComments 
            ORDER BY NEWID();
        END
        ELSE
        BEGIN
            SELECT TOP 1 @Comment = Comment, @Rating = Rating 
            FROM @GeneralComments 
            ORDER BY NEWID();
        END
        
        -- Insert review
        INSERT INTO Reviews (ProductId, UserId, Rating, Comment, CreatedAt, IsApproved)
        VALUES (
            @ProductId,
            @UserId,
            @Rating,
            @Comment,
            DATEADD(day, -ABS(CHECKSUM(NEWID()) % 60), GETDATE()), -- Random ngày trong 60 ngày qua
            1 -- Auto approve
        );
        
        SET @ReviewCount = @ReviewCount + 1;
        SET @CurrentReview = @CurrentReview + 1;
        SET @UserId = NULL; -- Reset
    END
    
    FETCH NEXT FROM product_cursor INTO @ProductId, @ProductName, @CategoryName;
END

CLOSE product_cursor;
DEALLOCATE product_cursor;

-- =============================================
-- THÊM MỘT SỐ REVIEWS TIÊU CỰC ĐỂ CÂN BẰNG
-- =============================================

PRINT N'⚖️ Thêm một số reviews tiêu cực để cân bằng...';

DECLARE @NegativeComments TABLE (Comment NVARCHAR(500), Rating INT);
INSERT INTO @NegativeComments VALUES
(N'Sản phẩm không như mong đợi. Chất lượng có thể tốt hơn.', 2),
(N'Giá hơi cao so với chất lượng thực tế.', 2),
(N'Có một số lỗi nhỏ, cần cải thiện thêm.', 3),
(N'Sản phẩm bình thường, không có gì đặc biệt.', 3),
(N'Giao hàng hơi chậm, sản phẩm ok.', 3),
(N'Chất lượng ok nhưng không vượt trội.', 3),
(N'Pin không như quảng cáo, tụt nhanh.', 2),
(N'Thiết kế đẹp nhưng dùng không được lâu.', 2);

-- Thêm 10-15 reviews tiêu cực ngẫu nhiên
DECLARE @NegativeCount INT = 10 + (ABS(CHECKSUM(NEWID())) % 6); -- 10-15 reviews
DECLARE @CurrentNegative INT = 1;

WHILE @CurrentNegative <= @NegativeCount
BEGIN
    -- Chọn sản phẩm ngẫu nhiên
    SELECT TOP 1 @ProductId = Id FROM Products ORDER BY NEWID();
    
    -- Chọn user ngẫu nhiên chưa review sản phẩm này
    SELECT TOP 1 @UserId = Id 
    FROM Users 
    WHERE Id NOT IN (
        SELECT UserId FROM Reviews WHERE ProductId = @ProductId
    )
    ORDER BY NEWID();
    
    IF @UserId IS NOT NULL
    BEGIN
        -- Chọn comment tiêu cực
        SELECT TOP 1 @Comment = Comment, @Rating = Rating 
        FROM @NegativeComments 
        ORDER BY NEWID();
        
        INSERT INTO Reviews (ProductId, UserId, Rating, Comment, CreatedAt, IsApproved)
        VALUES (
            @ProductId,
            @UserId,
            @Rating,
            @Comment,
            DATEADD(day, -ABS(CHECKSUM(NEWID()) % 30), GETDATE()),
            1
        );
        
        SET @ReviewCount = @ReviewCount + 1;
    END
    
    SET @CurrentNegative = @CurrentNegative + 1;
END

-- =============================================
-- THÔNG BÁO KẾT QUẢ
-- =============================================

PRINT N'✅ Hoàn thành tạo reviews!';
PRINT N'📊 Tổng số reviews đã tạo: ' + CAST(@ReviewCount AS NVARCHAR(10));

-- Hiển thị thống kê
SELECT 
    N'📈 THỐNG KÊ REVIEWS' as [Report],
    COUNT(*) as [Tổng Reviews],
    AVG(CAST(Rating AS FLOAT)) as [Rating Trung Bình],
    MIN(Rating) as [Rating Thấp Nhất],
    MAX(Rating) as [Rating Cao Nhất]
FROM Reviews;

-- Top 10 sản phẩm có nhiều reviews nhất
SELECT TOP 10
    p.Name as [Tên Sản Phẩm],
    COUNT(r.Id) as [Số Reviews],
    AVG(CAST(r.Rating AS FLOAT)) as [Rating TB],
    c.Name as [Danh Mục]
FROM Products p
LEFT JOIN Reviews r ON p.Id = r.ProductId
LEFT JOIN Categories c ON p.CategoryId = c.Id
GROUP BY p.Id, p.Name, c.Name
ORDER BY COUNT(r.Id) DESC, AVG(CAST(r.Rating AS FLOAT)) DESC;

-- Phân bố rating
SELECT 
    Rating as [Rating],
    COUNT(*) as [Số Lượng],
    CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Reviews) AS DECIMAL(5,2)) as [Phần Trăm]
FROM Reviews
GROUP BY Rating
ORDER BY Rating DESC;

PRINT N'🎯 Script hoàn tất! Database đã có đầy đủ reviews cho sản phẩm.';
GO
