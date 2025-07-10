-- Script để thêm các cột Flash Sale vào bảng Products
-- Chạy script này trong SQL Server Management Studio hoặc Azure Data Studio

USE [SHNGear]; -- Thay tên database nếu khác

-- Kiểm tra và thêm cột IsFlashSale
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND name = 'IsFlashSale')
BEGIN
    ALTER TABLE [Products] ADD [IsFlashSale] bit NOT NULL DEFAULT 0;
    PRINT 'Đã thêm cột IsFlashSale';
END
ELSE
BEGIN
    PRINT 'Cột IsFlashSale đã tồn tại';
END

-- Kiểm tra và thêm cột FlashSalePrice
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND name = 'FlashSalePrice')
BEGIN
    ALTER TABLE [Products] ADD [FlashSalePrice] decimal(18,2) NULL;
    PRINT 'Đã thêm cột FlashSalePrice';
END
ELSE
BEGIN
    PRINT 'Cột FlashSalePrice đã tồn tại';
END

-- Kiểm tra và thêm cột FlashSaleStartDate
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND name = 'FlashSaleStartDate')
BEGIN
    ALTER TABLE [Products] ADD [FlashSaleStartDate] datetime2(7) NULL;
    PRINT 'Đã thêm cột FlashSaleStartDate';
END
ELSE
BEGIN
    PRINT 'Cột FlashSaleStartDate đã tồn tại';
END

-- Kiểm tra và thêm cột FlashSaleEndDate
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND name = 'FlashSaleEndDate')
BEGIN
    ALTER TABLE [Products] ADD [FlashSaleEndDate] datetime2(7) NULL;
    PRINT 'Đã thêm cột FlashSaleEndDate';
END
ELSE
BEGIN
    PRINT 'Cột FlashSaleEndDate đã tồn tại';
END

-- Kiểm tra và thêm cột IsBestSeller (nếu chưa có)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND name = 'IsBestSeller')
BEGIN
    ALTER TABLE [Products] ADD [IsBestSeller] bit NOT NULL DEFAULT 0;
    PRINT 'Đã thêm cột IsBestSeller';
END
ELSE
BEGIN
    PRINT 'Cột IsBestSeller đã tồn tại';
END

-- Tạo index cho IsFlashSale để tối ưu hiệu suất truy vấn
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND name = N'IX_Products_IsFlashSale')
BEGIN
    CREATE INDEX [IX_Products_IsFlashSale] ON [Products] ([IsFlashSale]);
    PRINT 'Đã tạo index IX_Products_IsFlashSale';
END
ELSE
BEGIN
    PRINT 'Index IX_Products_IsFlashSale đã tồn tại';
END

-- Tạo index cho IsBestSeller để tối ưu hiệu suất truy vấn
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[Products]') AND name = N'IX_Products_IsBestSeller')
BEGIN
    CREATE INDEX [IX_Products_IsBestSeller] ON [Products] ([IsBestSeller]);
    PRINT 'Đã tạo index IX_Products_IsBestSeller';
END
ELSE
BEGIN
    PRINT 'Index IX_Products_IsBestSeller đã tồn tại';
END

-- Kiểm tra kết quả
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Products' 
AND COLUMN_NAME IN ('IsFlashSale', 'FlashSalePrice', 'FlashSaleStartDate', 'FlashSaleEndDate', 'IsBestSeller')
ORDER BY COLUMN_NAME;

PRINT 'Hoàn thành thêm các cột Flash Sale vào bảng Products!';
