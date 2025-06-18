-- =============================================
-- Script: Tạo Users mẫu và Reviews
-- =============================================

-- Kiểm tra xem đã có users chưa
IF NOT EXISTS (SELECT 1 FROM Users)
BEGIN
    PRINT N'🔄 Tạo users mẫu...';
    
    -- Tạo một số users mẫu
    INSERT INTO Users (FirstName, LastName, Email, Phone, PasswordHash, CreatedAt, IsActive, Points) VALUES
    (N'Nguyễn', N'Văn A', 'nguyenvana@example.com', '0123456789', 'hashed_password_1', GETDATE(), 1, 0),
    (N'Trần', N'Thị B', 'tranthib@example.com', '0987654321', 'hashed_password_2', GETDATE(), 1, 0),
    (N'Lê', N'Minh C', 'leminhc@example.com', '0111222333', 'hashed_password_3', GETDATE(), 1, 0),
    (N'Phạm', N'Thu D', 'phamthud@example.com', '0444555666', 'hashed_password_4', GETDATE(), 1, 0),
    (N'Hoàng', N'Văn E', 'hoangvane@example.com', '0777888999', 'hashed_password_5', GETDATE(), 1, 0),
    (N'Đặng', N'Thị F', 'dangthif@example.com', '0333444555', 'hashed_password_6', GETDATE(), 1, 0),
    (N'Vũ', N'Minh G', 'vuminhg@example.com', '0666777888', 'hashed_password_7', GETDATE(), 1, 0),
    (N'Bùi', N'Thu H', 'buithuh@example.com', '0999000111', 'hashed_password_8', GETDATE(), 1, 0),
    (N'Dương', N'Văn I', 'duongvani@example.com', '0222333444', 'hashed_password_9', GETDATE(), 1, 0),
    (N'Lý', N'Thị K', 'lythik@example.com', '0555666777', 'hashed_password_10', GETDATE(), 1, 0);
    
    PRINT N'✅ Đã tạo ' + CAST(@@ROWCOUNT AS NVARCHAR(10)) + N' users mẫu';
END
ELSE
BEGIN
    PRINT N'ℹ️ Database đã có users, bỏ qua bước tạo users mẫu';
END

-- Kiểm tra Products
IF NOT EXISTS (SELECT 1 FROM Products)
BEGIN
    PRINT N'⚠️ Cảnh báo: Chưa có sản phẩm nào trong database!';
    PRINT N'💡 Hãy thêm sản phẩm trước khi chạy script reviews';
END
ELSE
BEGIN
    PRINT N'✅ Database đã có sản phẩm, có thể thêm reviews';
    
    -- Hiển thị danh sách sản phẩm để tham khảo
    SELECT TOP 10 
        Id, 
        Name,
        (SELECT COUNT(*) FROM Reviews WHERE ProductId = Products.Id) as ExistingReviews
    FROM Products
    ORDER BY Id;
END

-- Script thêm reviews thông minh dựa trên dữ liệu thực tế
DECLARE @ProductCount INT = (SELECT COUNT(*) FROM Products);
DECLARE @UserCount INT = (SELECT COUNT(*) FROM Users);

IF @ProductCount > 0 AND @UserCount > 0
BEGIN
    PRINT N'🎯 Bắt đầu thêm reviews...';
    
    -- Lấy danh sách ProductId và UserId thực tế
    DECLARE @CurrentProductId INT;
    DECLARE @CurrentUserId INT;
    DECLARE @Counter INT = 1;
    
    -- Cursor để duyệt qua các sản phẩm
    DECLARE product_cursor CURSOR FOR 
    SELECT TOP 5 Id FROM Products ORDER BY Id;
    
    OPEN product_cursor;
    FETCH NEXT FROM product_cursor INTO @CurrentProductId;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Thêm 3-5 reviews cho mỗi sản phẩm
        INSERT INTO Reviews (ProductId, UserId, Rating, Comment, CreatedAt, IsApproved)
        SELECT TOP 4
            @CurrentProductId,
            u.Id,
            ABS(CHECKSUM(NEWID()) % 3) + 3, -- Rating từ 3-5
            CASE ABS(CHECKSUM(NEWID()) % 8)
                WHEN 0 THEN N'Sản phẩm tuyệt vời! Rất hài lòng với chất lượng.'
                WHEN 1 THEN N'Chất lượng tốt, giá cả hợp lý. Sẽ mua lại.'
                WHEN 2 THEN N'Đúng như mô tả, giao hàng nhanh. Recommend!'
                WHEN 3 THEN N'Sản phẩm ổn, phù hợp với nhu cầu sử dụng.'
                WHEN 4 THEN N'Chất lượng cao, dịch vụ tốt. Cảm ơn shop!'
                WHEN 5 THEN N'Rất hài lòng! Sẽ giới thiệu cho bạn bè.'
                WHEN 6 THEN N'Tốt trong tầm giá, đáng để mua thử.'
                ELSE N'Sản phẩm ok, không có gì to complain.'
            END,
            DATEADD(day, -ABS(CHECKSUM(NEWID()) % 30), GETDATE()), -- Random ngày trong 30 ngày qua
            1
        FROM Users u
        WHERE u.Id NOT IN (
            SELECT UserId FROM Reviews WHERE ProductId = @CurrentProductId
        )
        ORDER BY NEWID(); -- Random user
        
        FETCH NEXT FROM product_cursor INTO @CurrentProductId;
    END
    
    CLOSE product_cursor;
    DEALLOCATE product_cursor;
END

-- Hiển thị kết quả cuối cùng
PRINT N'📊 === KẾT QUẢ CUỐI CÙNG ===';

SELECT 
    p.Name AS [Tên sản phẩm],
    COUNT(r.Id) AS [Số đánh giá],
    ROUND(AVG(CAST(r.Rating AS FLOAT)), 1) AS [Điểm TB],
    MIN(r.Rating) AS [Điểm thấp nhất],
    MAX(r.Rating) AS [Điểm cao nhất]
FROM Products p
LEFT JOIN Reviews r ON p.Id = r.ProductId AND r.IsApproved = 1
GROUP BY p.Id, p.Name
ORDER BY AVG(CAST(r.Rating AS FLOAT)) DESC;

PRINT N'✅ Hoàn thành script thêm reviews!';
