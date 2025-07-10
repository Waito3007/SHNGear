-- Script để thêm tất cả các quan hệ Foreign Key vào database SHNGear
-- Chạy script này trong SQL Server Management Studio hoặc Azure Data Studio

USE [SHNGear]; -- Thay tên database nếu khác

-- ==============================================================================
-- THÊM FOREIGN KEY CONSTRAINTS
-- ==============================================================================

-- 1. Products -> Categories
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Products_Categories_CategoryId')
BEGIN
    ALTER TABLE [Products] 
    ADD CONSTRAINT [FK_Products_Categories_CategoryId] 
    FOREIGN KEY ([CategoryId]) REFERENCES [Categories]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: Products -> Categories';
END
ELSE
BEGIN
    PRINT 'FK Products -> Categories đã tồn tại';
END

-- 2. Products -> Brands
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Products_Brands_BrandId')
BEGIN
    ALTER TABLE [Products] 
    ADD CONSTRAINT [FK_Products_Brands_BrandId] 
    FOREIGN KEY ([BrandId]) REFERENCES [Brands]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: Products -> Brands';
END
ELSE
BEGIN
    PRINT 'FK Products -> Brands đã tồn tại';
END

-- 3. ProductImages -> Products
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ProductImages_Products_ProductId')
BEGIN
    ALTER TABLE [ProductImages] 
    ADD CONSTRAINT [FK_ProductImages_Products_ProductId] 
    FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: ProductImages -> Products';
END
ELSE
BEGIN
    PRINT 'FK ProductImages -> Products đã tồn tại';
END

-- 4. ProductVariants -> Products
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ProductVariants_Products_ProductId')
BEGIN
    ALTER TABLE [ProductVariants] 
    ADD CONSTRAINT [FK_ProductVariants_Products_ProductId] 
    FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: ProductVariants -> Products';
END
ELSE
BEGIN
    PRINT 'FK ProductVariants -> Products đã tồn tại';
END

-- 5. ProductSpecifications -> Products
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ProductSpecifications_Products_ProductId')
BEGIN
    ALTER TABLE [ProductSpecifications] 
    ADD CONSTRAINT [FK_ProductSpecifications_Products_ProductId] 
    FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: ProductSpecifications -> Products';
END
ELSE
BEGIN
    PRINT 'FK ProductSpecifications -> Products đã tồn tại';
END

-- 6. PhoneSpecifications -> Products
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_PhoneSpecifications_Products_ProductId')
BEGIN
    ALTER TABLE [PhoneSpecifications] 
    ADD CONSTRAINT [FK_PhoneSpecifications_Products_ProductId] 
    FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: PhoneSpecifications -> Products';
END
ELSE
BEGIN
    PRINT 'FK PhoneSpecifications -> Products đã tồn tại';
END

-- 7. LaptopSpecifications -> Products
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_LaptopSpecifications_Products_ProductId')
BEGIN
    ALTER TABLE [LaptopSpecifications] 
    ADD CONSTRAINT [FK_LaptopSpecifications_Products_ProductId] 
    FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: LaptopSpecifications -> Products';
END
ELSE
BEGIN
    PRINT 'FK LaptopSpecifications -> Products đã tồn tại';
END

-- 8. HeadphoneSpecifications -> Products
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_HeadphoneSpecifications_Products_ProductId')
BEGIN
    ALTER TABLE [HeadphoneSpecifications] 
    ADD CONSTRAINT [FK_HeadphoneSpecifications_Products_ProductId] 
    FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: HeadphoneSpecifications -> Products';
END
ELSE
BEGIN
    PRINT 'FK HeadphoneSpecifications -> Products đã tồn tại';
END

-- 9. Users -> Roles
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Users_Roles_RoleId')
BEGIN
    ALTER TABLE [Users] 
    ADD CONSTRAINT [FK_Users_Roles_RoleId] 
    FOREIGN KEY ([RoleId]) REFERENCES [Roles]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: Users -> Roles';
END
ELSE
BEGIN
    PRINT 'FK Users -> Roles đã tồn tại';
END

-- 10. Addresses -> Users
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Addresses_Users_UserId')
BEGIN
    ALTER TABLE [Addresses] 
    ADD CONSTRAINT [FK_Addresses_Users_UserId] 
    FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) 
    ON DELETE SET NULL;
    PRINT 'Đã thêm FK: Addresses -> Users';
END
ELSE
BEGIN
    PRINT 'FK Addresses -> Users đã tồn tại';
END

-- 11. Carts -> Users
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Carts_Users_UserId')
BEGIN
    ALTER TABLE [Carts] 
    ADD CONSTRAINT [FK_Carts_Users_UserId] 
    FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: Carts -> Users';
END
ELSE
BEGIN
    PRINT 'FK Carts -> Users đã tồn tại';
END

-- 12. CartItems -> Carts
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_CartItems_Carts_CartId')
BEGIN
    ALTER TABLE [CartItems] 
    ADD CONSTRAINT [FK_CartItems_Carts_CartId] 
    FOREIGN KEY ([CartId]) REFERENCES [Carts]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: CartItems -> Carts';
END
ELSE
BEGIN
    PRINT 'FK CartItems -> Carts đã tồn tại';
END

-- 13. CartItems -> ProductVariants
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_CartItems_ProductVariants_ProductVariantId')
BEGIN
    ALTER TABLE [CartItems] 
    ADD CONSTRAINT [FK_CartItems_ProductVariants_ProductVariantId] 
    FOREIGN KEY ([ProductVariantId]) REFERENCES [ProductVariants]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: CartItems -> ProductVariants';
END
ELSE
BEGIN
    PRINT 'FK CartItems -> ProductVariants đã tồn tại';
END

-- 14. Orders -> Users
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Orders_Users_UserId')
BEGIN
    ALTER TABLE [Orders] 
    ADD CONSTRAINT [FK_Orders_Users_UserId] 
    FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) 
    ON DELETE SET NULL;
    PRINT 'Đã thêm FK: Orders -> Users';
END
ELSE
BEGIN
    PRINT 'FK Orders -> Users đã tồn tại';
END

-- 15. Orders -> Addresses
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Orders_Addresses_AddressId')
BEGIN
    ALTER TABLE [Orders] 
    ADD CONSTRAINT [FK_Orders_Addresses_AddressId] 
    FOREIGN KEY ([AddressId]) REFERENCES [Addresses]([Id]) 
    ON DELETE SET NULL;
    PRINT 'Đã thêm FK: Orders -> Addresses';
END
ELSE
BEGIN
    PRINT 'FK Orders -> Addresses đã tồn tại';
END

-- 16. Orders -> PaymentMethods
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Orders_PaymentMethods_PaymentMethodId')
BEGIN
    ALTER TABLE [Orders] 
    ADD CONSTRAINT [FK_Orders_PaymentMethods_PaymentMethodId] 
    FOREIGN KEY ([PaymentMethodId]) REFERENCES [PaymentMethods]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: Orders -> PaymentMethods';
END
ELSE
BEGIN
    PRINT 'FK Orders -> PaymentMethods đã tồn tại';
END

-- 17. Orders -> Vouchers
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Orders_Vouchers_VoucherId')
BEGIN
    ALTER TABLE [Orders] 
    ADD CONSTRAINT [FK_Orders_Vouchers_VoucherId] 
    FOREIGN KEY ([VoucherId]) REFERENCES [Vouchers]([Id]) 
    ON DELETE SET NULL;
    PRINT 'Đã thêm FK: Orders -> Vouchers';
END
ELSE
BEGIN
    PRINT 'FK Orders -> Vouchers đã tồn tại';
END

-- 18. OrderItems -> Orders
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_OrderItems_Orders_OrderId')
BEGIN
    ALTER TABLE [OrderItems] 
    ADD CONSTRAINT [FK_OrderItems_Orders_OrderId] 
    FOREIGN KEY ([OrderId]) REFERENCES [Orders]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: OrderItems -> Orders';
END
ELSE
BEGIN
    PRINT 'FK OrderItems -> Orders đã tồn tại';
END

-- 19. OrderItems -> ProductVariants
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_OrderItems_ProductVariants_ProductVariantId')
BEGIN
    ALTER TABLE [OrderItems] 
    ADD CONSTRAINT [FK_OrderItems_ProductVariants_ProductVariantId] 
    FOREIGN KEY ([ProductVariantId]) REFERENCES [ProductVariants]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: OrderItems -> ProductVariants';
END
ELSE
BEGIN
    PRINT 'FK OrderItems -> ProductVariants đã tồn tại';
END

-- 20. Deliveries -> Orders
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Deliveries_Orders_OrderId')
BEGIN
    ALTER TABLE [Deliveries] 
    ADD CONSTRAINT [FK_Deliveries_Orders_OrderId] 
    FOREIGN KEY ([OrderId]) REFERENCES [Orders]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: Deliveries -> Orders';
END
ELSE
BEGIN
    PRINT 'FK Deliveries -> Orders đã tồn tại';
END

-- 21. Reviews -> Products
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Reviews_Products_ProductId')
BEGIN
    ALTER TABLE [Reviews] 
    ADD CONSTRAINT [FK_Reviews_Products_ProductId] 
    FOREIGN KEY ([ProductId]) REFERENCES [Products]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: Reviews -> Products';
END
ELSE
BEGIN
    PRINT 'FK Reviews -> Products đã tồn tại';
END

-- 22. Reviews -> Users
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Reviews_Users_UserId')
BEGIN
    ALTER TABLE [Reviews] 
    ADD CONSTRAINT [FK_Reviews_Users_UserId] 
    FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: Reviews -> Users';
END
ELSE
BEGIN
    PRINT 'FK Reviews -> Users đã tồn tại';
END

-- 23. UserVouchers -> Users
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_UserVouchers_Users_UserId')
BEGIN
    ALTER TABLE [UserVouchers] 
    ADD CONSTRAINT [FK_UserVouchers_Users_UserId] 
    FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: UserVouchers -> Users';
END
ELSE
BEGIN
    PRINT 'FK UserVouchers -> Users đã tồn tại';
END

-- 24. UserVouchers -> Vouchers
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_UserVouchers_Vouchers_VoucherId')
BEGIN
    ALTER TABLE [UserVouchers] 
    ADD CONSTRAINT [FK_UserVouchers_Vouchers_VoucherId] 
    FOREIGN KEY ([VoucherId]) REFERENCES [Vouchers]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: UserVouchers -> Vouchers';
END
ELSE
BEGIN
    PRINT 'FK UserVouchers -> Vouchers đã tồn tại';
END

-- 25. ChatSessions -> Users (User)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ChatSessions_Users_UserId')
BEGIN
    ALTER TABLE [ChatSessions] 
    ADD CONSTRAINT [FK_ChatSessions_Users_UserId] 
    FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) 
    ON DELETE SET NULL;
    PRINT 'Đã thêm FK: ChatSessions -> Users (UserId)';
END
ELSE
BEGIN
    PRINT 'FK ChatSessions -> Users (UserId) đã tồn tại';
END

-- 26. ChatSessions -> Users (AssignedAdmin)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ChatSessions_Users_AssignedAdminId')
BEGIN
    ALTER TABLE [ChatSessions] 
    ADD CONSTRAINT [FK_ChatSessions_Users_AssignedAdminId] 
    FOREIGN KEY ([AssignedAdminId]) REFERENCES [Users]([Id]) 
    ON DELETE SET NULL;
    PRINT 'Đã thêm FK: ChatSessions -> Users (AssignedAdminId)';
END
ELSE
BEGIN
    PRINT 'FK ChatSessions -> Users (AssignedAdminId) đã tồn tại';
END

-- 27. ChatMessages -> ChatSessions
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ChatMessages_ChatSessions_ChatSessionId')
BEGIN
    ALTER TABLE [ChatMessages] 
    ADD CONSTRAINT [FK_ChatMessages_ChatSessions_ChatSessionId] 
    FOREIGN KEY ([ChatSessionId]) REFERENCES [ChatSessions]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: ChatMessages -> ChatSessions';
END
ELSE
BEGIN
    PRINT 'FK ChatMessages -> ChatSessions đã tồn tại';
END

-- 28. ChatMessages -> Users (SenderUser)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ChatMessages_Users_SenderId')
BEGIN
    ALTER TABLE [ChatMessages] 
    ADD CONSTRAINT [FK_ChatMessages_Users_SenderId] 
    FOREIGN KEY ([SenderId]) REFERENCES [Users]([Id]) 
    ON DELETE SET NULL;
    PRINT 'Đã thêm FK: ChatMessages -> Users (SenderId)';
END
ELSE
BEGIN
    PRINT 'FK ChatMessages -> Users (SenderId) đã tồn tại';
END

-- 29. BlogPosts -> Users (Author)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_BlogPosts_Users_AuthorId')
BEGIN
    ALTER TABLE [BlogPosts] 
    ADD CONSTRAINT [FK_BlogPosts_Users_AuthorId] 
    FOREIGN KEY ([AuthorId]) REFERENCES [Users]([Id]) 
    ON DELETE CASCADE;
    PRINT 'Đã thêm FK: BlogPosts -> Users (AuthorId)';
END
ELSE
BEGIN
    PRINT 'FK BlogPosts -> Users (AuthorId) đã tồn tại';
END

-- ==============================================================================
-- TẠO CÁC INDEX ĐỂ TỐI ƯU HIỆU SUẤT
-- ==============================================================================

-- Index cho Products
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND name = N'IX_Products_CategoryId')
BEGIN
    CREATE INDEX [IX_Products_CategoryId] ON [Products] ([CategoryId]);
    PRINT 'Đã tạo index IX_Products_CategoryId';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND name = N'IX_Products_BrandId')
BEGIN
    CREATE INDEX [IX_Products_BrandId] ON [Products] ([BrandId]);
    PRINT 'Đã tạo index IX_Products_BrandId';
END

-- Index cho ProductVariants
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[ProductVariants]') AND name = N'IX_ProductVariants_ProductId')
BEGIN
    CREATE INDEX [IX_ProductVariants_ProductId] ON [ProductVariants] ([ProductId]);
    PRINT 'Đã tạo index IX_ProductVariants_ProductId';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[ProductVariants]') AND name = N'IX_ProductVariants_Price')
BEGIN
    CREATE INDEX [IX_ProductVariants_Price] ON [ProductVariants] ([Price]);
    PRINT 'Đã tạo index IX_ProductVariants_Price';
END

-- Index cho Users
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = N'IX_Users_RoleId')
BEGIN
    CREATE INDEX [IX_Users_RoleId] ON [Users] ([RoleId]);
    PRINT 'Đã tạo index IX_Users_RoleId';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = N'IX_Users_PhoneNumber')
BEGIN
    CREATE UNIQUE INDEX [IX_Users_PhoneNumber] ON [Users] ([PhoneNumber]);
    PRINT 'Đã tạo unique index IX_Users_PhoneNumber';
END

-- Index cho Orders
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = N'IX_Orders_UserId')
BEGIN
    CREATE INDEX [IX_Orders_UserId] ON [Orders] ([UserId]);
    PRINT 'Đã tạo index IX_Orders_UserId';
END

-- Index cho Reviews
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[Reviews]') AND name = N'IX_Reviews_ProductId')
BEGIN
    CREATE INDEX [IX_Reviews_ProductId] ON [Reviews] ([ProductId]);
    PRINT 'Đã tạo index IX_Reviews_ProductId';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[Reviews]') AND name = N'IX_Reviews_UserId')
BEGIN
    CREATE INDEX [IX_Reviews_UserId] ON [Reviews] ([UserId]);
    PRINT 'Đã tạo index IX_Reviews_UserId';
END

-- ==============================================================================
-- KIỂM TRA KẾT QUẢ
-- ==============================================================================

-- Hiển thị tất cả Foreign Key constraints đã được tạo
SELECT 
    FK.CONSTRAINT_NAME AS 'Foreign Key Name',
    FK.TABLE_NAME AS 'Table Name',
    CU.COLUMN_NAME AS 'Column Name',
    PK.TABLE_NAME AS 'Referenced Table',
    PT.COLUMN_NAME AS 'Referenced Column'
FROM 
    INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS FK
    INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS TC ON FK.CONSTRAINT_NAME = TC.CONSTRAINT_NAME
    INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE CU ON FK.CONSTRAINT_NAME = CU.CONSTRAINT_NAME
    INNER JOIN (
        SELECT i1.TABLE_NAME, i2.COLUMN_NAME 
        FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS i1
        INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE i2 ON i1.UNIQUE_CONSTRAINT_NAME = i2.CONSTRAINT_NAME
    ) PT ON PT.TABLE_NAME = FK.UNIQUE_CONSTRAINT_NAME
    INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS PK ON FK.UNIQUE_CONSTRAINT_NAME = PK.CONSTRAINT_NAME
ORDER BY FK.TABLE_NAME, FK.CONSTRAINT_NAME;

PRINT '==============================================================================';
PRINT 'HOÀN THÀNH: Đã thiết lập tất cả các quan hệ Foreign Key cho database SHNGear!';
PRINT '==============================================================================';
