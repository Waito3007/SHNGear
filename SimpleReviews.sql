-- =============================================
-- Script: Tạo lại reviews với text không dấu
-- Tác giả: SHN Gear System
-- Ngày tạo: 2025-06-18
-- =============================================

-- Xóa tất cả reviews cũ
DELETE FROM Reviews;
DBCC CHECKIDENT ('Reviews', RESEED, 0);
PRINT 'Da xoa tat ca reviews cu';

-- Tạo reviews mới với text ASCII để tránh lỗi encoding
INSERT INTO Reviews (ProductId, UserId, Rating, Comment, CreatedAt, IsApproved) VALUES
-- Sản phẩm 1-5
(1, 1, 5, N'San pham tuyet voi! Chat luong cao, thiet ke dep mat.', DATEADD(day, -15, GETDATE()), 1),
(1, 3, 4, N'San pham tot, gia ca hop ly. Giao hang nhanh.', DATEADD(day, -12, GETDATE()), 1),
(1, 5, 5, N'Qua ung y! Se mua lai va gioi thieu cho ban be.', DATEADD(day, -8, GETDATE()), 1),
(1, 7, 4, N'Chat luong tot, dang dong tien bat gao. Hoi lau ship.', DATEADD(day, -5, GETDATE()), 1),
(1, 9, 3, N'San pham on, tuy nhien khong hoan hao nhu mong doi.', DATEADD(day, -2, GETDATE()), 1),

(2, 4, 5, N'Xuat sac! Hieu nang manh me, thiet ke hien dai.', DATEADD(day, -14, GETDATE()), 1),
(2, 6, 4, N'San pham chat luong, tinh nang da dang. Ho tro tot.', DATEADD(day, -11, GETDATE()), 1),
(2, 8, 5, N'Toi yeu san pham nay! Dung muot ma, ben bi.', DATEADD(day, -7, GETDATE()), 1),
(2, 10, 4, N'Tot trong tam gia, can cai thien mot so tinh nang nho.', DATEADD(day, -4, GETDATE()), 1),

(3, 11, 4, N'San pham co ty le gia/hieu nang tot. Dang mua.', DATEADD(day, -13, GETDATE()), 1),
(3, 1, 5, N'Rat hai long voi lua chon nay! Hieu nang on dinh.', DATEADD(day, -9, GETDATE()), 1),
(3, 3, 4, N'San pham tot trong tam gia. Dich vu hau mai tot.', DATEADD(day, -6, GETDATE()), 1),

(4, 5, 5, N'Tuyet voi! Vuot xa mong doi. Chat luong premium.', DATEADD(day, -16, GETDATE()), 1),
(4, 7, 4, N'San pham on, thiet ke dep. Mot so tinh nang co the cai thien.', DATEADD(day, -10, GETDATE()), 1),
(4, 9, 5, N'Hoan hao! Se gioi thieu cho moi nguoi.', DATEADD(day, -3, GETDATE()), 1),

(5, 4, 5, N'Sieu pham! Hieu nang vuot troi, thiet ke sang trong.', DATEADD(day, -17, GETDATE()), 1),
(5, 6, 4, N'Chat luong cao, tuy nhien gia hoi cao so voi doi thu.', DATEADD(day, -12, GETDATE()), 1),
(5, 8, 5, N'Qua ung y! Su dung muot ma, khong co loi nao.', DATEADD(day, -8, GETDATE()), 1),
(5, 10, 2, N'San pham dep nhung khong tuong thich voi nhu cau.', DATEADD(day, -4, GETDATE()), 1);

PRINT 'Da them thanh cong cac danh gia mau moi!';
PRINT 'Tong so reviews da them: ' + CAST(@@ROWCOUNT AS NVARCHAR(10));

-- Kiểm tra kết quả
SELECT TOP 5 
    r.Id,
    p.Name as ProductName,
    r.Rating,
    r.Comment
FROM Reviews r
INNER JOIN Products p ON r.ProductId = p.Id
WHERE r.IsApproved = 1
ORDER BY r.Id DESC;
