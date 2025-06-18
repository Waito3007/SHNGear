-- Thêm reviews cho các sản phẩm còn lại
INSERT INTO Reviews (ProductId, UserId, Rating, Comment, CreatedAt, IsApproved) VALUES

-- Sản phẩm 6-10 (Laptop & Tai nghe)
(6, 11, 4, N'Laptop tot, thiet ke dep. Phu hop cho van phong.', DATEADD(day, -15, GETDATE()), 1),
(6, 1, 4, N'May nho gon, de mang theo. Hieu nang on dinh.', DATEADD(day, -11, GETDATE()), 1),
(6, 3, 3, N'San pham ok, tuy nhien cong ket noi hoi it.', DATEADD(day, -7, GETDATE()), 1),

(7, 5, 5, N'Gaming laptop tuyet voi! Chay moi game muot ma.', DATEADD(day, -18, GETDATE()), 1),
(7, 7, 4, N'Hieu nang khung, tan nhiet tot. Hoi nang va on.', DATEADD(day, -9, GETDATE()), 1),
(7, 9, 5, N'RGB dep mat, ban phim co hoc tuyet voi!', DATEADD(day, -5, GETDATE()), 1),

(8, 4, 5, N'Tai nghe tuyet voi! Chong on hieu qua, am thanh trong.', DATEADD(day, -16, GETDATE()), 1),
(8, 6, 4, N'San pham tot, tuy nhien co the roi ra khi van dong.', DATEADD(day, -12, GETDATE()), 1),
(8, 8, 5, N'Hoan hao! Ket noi nhanh, chat luong am thanh cao.', DATEADD(day, -8, GETDATE()), 1),
(8, 10, 3, N'Tai nghe ok nhung de bi mat, case sac hay bi tray.', DATEADD(day, -4, GETDATE()), 1),

(9, 11, 5, N'Tai nghe chong on tot nhat! Pin lau, am thanh tuyet.', DATEADD(day, -14, GETDATE()), 1),
(9, 1, 4, N'Chat luong tot, deo lau hoi moi tai. Phu hop bay dai.', DATEADD(day, -10, GETDATE()), 1),
(9, 3, 5, N'Sony luon xuat sac! Am bass sau, treble trong.', DATEADD(day, -6, GETDATE()), 1),

(10, 5, 4, N'Loa bluetooth tuyet voi cho picnic. Chong nuoc tot.', DATEADD(day, -13, GETDATE()), 1),
(10, 7, 4, N'Thiet ke dep, de mang theo. Phu hop cho tiec nho.', DATEADD(day, -9, GETDATE()), 1),
(10, 9, 3, N'San pham on trong tam gia. Bass co the manh hon.', DATEADD(day, -5, GETDATE()), 1),

-- Sản phẩm 11-20
(11, 4, 5, N'San pham tuyet voi! Chat luong cao, thiet ke dep.', DATEADD(day, -11, GETDATE()), 1),
(11, 6, 4, N'Tot trong tam gia, dich vu ho tro khach hang tot.', DATEADD(day, -7, GETDATE()), 1),
(11, 8, 5, N'Cuc ky hai long! San pham vuot mong doi.', DATEADD(day, -4, GETDATE()), 1),

(12, 8, 5, N'Xuat sac! Hieu nang manh me, su dung muot ma.', DATEADD(day, -10, GETDATE()), 1),
(12, 10, 4, N'San pham chat luong, gia ca hop ly. Se mua lai.', DATEADD(day, -6, GETDATE()), 1),
(12, 1, 5, N'Tuyet voi! Dung nhu mo ta, giao hang nhanh.', DATEADD(day, -3, GETDATE()), 1),

(13, 11, 4, N'Thiet ke hien dai, tinh nang da dang. Phu hop nhu cau.', DATEADD(day, -9, GETDATE()), 1),
(13, 1, 5, N'Rat hai long! Vuot xa mong doi. Se gioi thieu ban be.', DATEADD(day, -5, GETDATE()), 1),
(13, 3, 4, N'San pham on dinh, hieu nang tot. Gia thanh hop ly.', DATEADD(day, -2, GETDATE()), 1),

(14, 3, 4, N'San pham tot, dong goi can than. Giao hang dung hen.', DATEADD(day, -8, GETDATE()), 1),
(14, 5, 5, N'Tuyet voi! Chat luong premium, xung dang tung dong.', DATEADD(day, -4, GETDATE()), 1),
(14, 7, 4, N'Kha on trong tam gia. Dich vu cham soc khach hang tot.', DATEADD(day, -1, GETDATE()), 1),

(15, 7, 4, N'San pham on dinh, hieu nang tot. Co the cai thien them.', DATEADD(day, -7, GETDATE()), 1),
(15, 9, 5, N'Hoan hao! Su dung de dang, ben bi. Se mua them.', DATEADD(day, -3, GETDATE()), 1),

-- Một số đánh giá tiêu cực để cân bằng
(16, 4, 2, N'San pham khong nhu mong doi. Chat luong chua tuong xung.', DATEADD(day, -6, GETDATE()), 1),
(17, 6, 3, N'San pham ok nhung co mot so loi nho. Can cai thien.', DATEADD(day, -5, GETDATE()), 1),
(18, 8, 2, N'Khong hai long lam. San pham co van de, can doi tra.', DATEADD(day, -4, GETDATE()), 1),
(19, 10, 3, N'Trung binh, khong te nhung cung khong xuat sac.', DATEADD(day, -3, GETDATE()), 1),
(20, 11, 2, N'Gia cao so voi chat luong. Co the tim duoc tot hon.', DATEADD(day, -2, GETDATE()), 1),

-- Thêm reviews cho điện thoại
(21, 1, 5, N'iPhone moi tuyet voi! Camera sac net, hieu nang muot.', DATEADD(day, -12, GETDATE()), 1),
(21, 3, 4, N'San pham Apple luon chat luong. Gia hoi cao nhung dang.', DATEADD(day, -8, GETDATE()), 1),
(21, 5, 5, N'Face ID nhanh, pin trau. Rat hai long voi lua chon.', DATEADD(day, -4, GETDATE()), 1),

(22, 4, 4, N'Samsung Galaxy tot! Man hinh dep, S Pen huu ich.', DATEADD(day, -11, GETDATE()), 1),
(22, 6, 5, N'Tuyet voi! Camera zoom xa, da nhiem muot ma.', DATEADD(day, -7, GETDATE()), 1),
(22, 8, 4, N'San pham chat luong, tuy nhien hoi cong kenh.', DATEADD(day, -3, GETDATE()), 1),

(23, 7, 5, N'Xiaomi co ty le gia/hieu nang tuyet! Camera Leica tuyet.', DATEADD(day, -10, GETDATE()), 1),
(23, 9, 4, N'MIUI muot ma, hieu nang on dinh. Gia ca hop ly.', DATEADD(day, -6, GETDATE()), 1),
(23, 11, 5, N'Qua hai long! Dang mua trong phan khuc nay.', DATEADD(day, -2, GETDATE()), 1),

(24, 1, 4, N'Google Pixel camera tuyet! AI photography thong minh.', DATEADD(day, -9, GETDATE()), 1),
(24, 4, 5, N'Android thuan tuy, cap nhat nhanh. Rat thich!', DATEADD(day, -5, GETDATE()), 1),
(24, 6, 4, N'San pham tot, tuy nhien gia hoi cao o Viet Nam.', DATEADD(day, -1, GETDATE()), 1),

(25, 5, 5, N'OnePlus nhanh nhu chop! OxygenOS muot ma.', DATEADD(day, -8, GETDATE()), 1),
(25, 8, 4, N'Sac nhanh tuyet voi, thiet ke dep. Khuyen nghi!', DATEADD(day, -4, GETDATE()), 1);

PRINT 'Da them thanh cong them reviews!';
PRINT 'Tong so reviews da them: ' + CAST(@@ROWCOUNT AS NVARCHAR(10));

-- Kiểm tra tổng số reviews
SELECT COUNT(*) as TotalReviews FROM Reviews WHERE IsApproved = 1;
