-- =============================================
-- CAFE AI - DỮ LIỆU MẪU (FIX VERSION)
-- =============================================
USE cafedb;
GO

-- Xóa dữ liệu cũ để tránh trùng lặp (giữ nguyên 3 user gốc ID 1,2,3)
DELETE FROM [FeedbackReplies];
DELETE FROM [OrderItems];
DELETE FROM [Orders];
DELETE FROM [Feedbacks];
DELETE FROM [Users] WHERE [Id] > 3;
DELETE FROM [Drinks] WHERE [Id] > 5;
GO

-- Reset identity seeds
DBCC CHECKIDENT ('[FeedbackReplies]', RESEED, 0);
DBCC CHECKIDENT ('[OrderItems]', RESEED, 0);
DBCC CHECKIDENT ('[Orders]', RESEED, 0);
DBCC CHECKIDENT ('[Feedbacks]', RESEED, 0);
GO

-- ============================================
-- 1. THÊM NGƯỜI DÙNG MẪU
-- ============================================
SET IDENTITY_INSERT [Users] ON;

INSERT INTO [Users] ([Id], [FullName], [Email], [PasswordHash], [Role], [CreatedAt])
VALUES 
(4, N'Trần Minh Tuấn', 'tuan.tran@gmail.com', '$2a$11$9/kP636/rS1iIqQk1Z4xueYd9G0fLwH5Bswp2iM.D4.yV5e3t.292', 'Customer', '2026-06-01T08:00:00'),
(5, N'Lê Thị Hồng', 'hong.le@gmail.com', '$2a$11$9/kP636/rS1iIqQk1Z4xueYd9G0fLwH5Bswp2iM.D4.yV5e3t.292', 'Customer', '2026-06-02T09:00:00'),
(6, N'Phạm Văn Đức', 'duc.pham@gmail.com', '$2a$11$9/kP636/rS1iIqQk1Z4xueYd9G0fLwH5Bswp2iM.D4.yV5e3t.292', 'Customer', '2026-06-03T10:00:00'),
(7, N'Nguyễn Thị Mai', 'mai.nguyen@gmail.com', '$2a$11$9/kP636/rS1iIqQk1Z4xueYd9G0fLwH5Bswp2iM.D4.yV5e3t.292', 'Customer', '2026-06-04T11:00:00'),
(8, N'Hoàng Anh Khoa', 'khoa.hoang@gmail.com', '$2a$11$9/kP636/rS1iIqQk1Z4xueYd9G0fLwH5Bswp2iM.D4.yV5e3t.292', 'Customer', '2026-06-05T12:00:00'),
(9, N'Võ Thanh Hằng', 'hang.vo@gmail.com', '$2a$11$9/kP636/rS1iIqQk1Z4xueYd9G0fLwH5Bswp2iM.D4.yV5e3t.292', 'Customer', '2026-06-06T13:00:00'),
(10, N'Đặng Quốc Bảo', 'bao.dang@gmail.com', '$2a$11$9/kP636/rS1iIqQk1Z4xueYd9G0fLwH5Bswp2iM.D4.yV5e3t.292', 'Customer', '2026-06-07T14:00:00'),
(11, N'Bùi Ngọc Lan', 'lan.bui@gmail.com', '$2a$11$9/kP636/rS1iIqQk1Z4xueYd9G0fLwH5Bswp2iM.D4.yV5e3t.292', 'Customer', '2026-06-08T15:00:00'),
(12, N'Trương Minh Nhật', 'nhat.truong@gmail.com', '$2a$11$9/kP636/rS1iIqQk1Z4xueYd9G0fLwH5Bswp2iM.D4.yV5e3t.292', 'Customer', '2026-06-10T16:00:00'),
(13, N'Lý Thị Tuyết', 'tuyet.ly@gmail.com', '$2a$11$9/kP636/rS1iIqQk1Z4xueYd9G0fLwH5Bswp2iM.D4.yV5e3t.292', 'Customer', '2026-06-12T17:00:00'),
(14, N'Nhân viên Pha chế', 'staff2@cafe.com', '$2a$11$9/kP636/rS1iIqQk1Z4xueYd9G0fLwH5Bswp2iM.D4.yV5e3t.292', 'Staff', '2026-06-01T08:00:00');

SET IDENTITY_INSERT [Users] OFF;
GO

-- ============================================
-- 2. THÊM ĐỒ UỐNG MỚI
-- ============================================
SET IDENTITY_INSERT [Drinks] ON;

INSERT INTO [Drinks] ([Id], [Name], [Description], [Price], [ImageUrl], [IsAvailable], [Category])
VALUES
(6, N'Matcha Latte', N'Trà xanh Nhật Bản pha sữa tươi', 48000, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=300', 1, 'Tea'),
(7, N'Socola đá xay', N'Socola Bỉ xay đá mịn béo ngậy', 52000, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=300', 1, 'Smoothie'),
(8, N'Nước ép cam', N'Cam tươi nguyên chất ép tại chỗ', 35000, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=300', 1, 'Juice'),
(9, N'Trà sữa trân châu', N'Trà sữa thơm ngon kèm trân châu đen', 42000, 'https://images.unsplash.com/photo-1558857563-b371033873b8?q=80&w=300', 1, 'Tea'),
(10, N'Americano', N'Cà phê espresso pha nước nóng đậm đà', 38000, 'https://images.unsplash.com/photo-1551030173-122aabc4489c?q=80&w=300', 1, 'Coffee');

SET IDENTITY_INSERT [Drinks] OFF;
GO

-- ============================================
-- 3. THÊM ĐÁNH GIÁ MẪU (20 đánh giá)
-- ============================================
INSERT INTO [Feedbacks] ([CustomerId], [DrinkId], [Rating], [Comment], [SentimentLabel], [SentimentConfidence], [Status], [CreatedAt])
VALUES
-- Tích cực (13 đánh giá)
(4, 1, 5, N'Cà phê sữa đá ở đây rất ngon, đậm đà và thơm. Sẽ quay lại!', N'Tích cực', 0.92, 'Processed', '2026-06-10T08:30:00'),
(5, 2, 5, N'Bạc xỉu tuyệt vời, sữa tươi béo ngậy hòa quyện với cà phê rất hài lòng', N'Tích cực', 0.95, 'Processed', '2026-06-10T09:15:00'),
(6, 3, 4, N'Cà phê trứng ngon, béo vừa phải, phục vụ nhanh chóng', N'Tích cực', 0.85, 'Processed', '2026-06-11T10:00:00'),
(7, 4, 5, N'Trà đào cam sả thơm ngon mát lạnh, uống rất sảng khoái', N'Tích cực', 0.90, 'Processed', '2026-06-11T14:20:00'),
(8, 5, 4, N'Sinh tố xoài tươi ngon, ngọt tự nhiên, rất thích', N'Tích cực', 0.88, 'Processed', '2026-06-12T11:45:00'),
(9, 1, 5, N'Quán view đẹp, cà phê chất lượng, nhân viên nhiệt tình chu đáo', N'Tích cực', 0.94, 'Processed', '2026-06-13T08:00:00'),
(10, 2, 4, N'Bạc xỉu ổn, giá cả phải chăng, không gian thoải mái', N'Tích cực', 0.82, 'Processed', '2026-06-13T16:30:00'),
(11, 4, 5, N'Trà đào xuất sắc! Uống một lần là nghiện luôn, sẽ giới thiệu bạn bè', N'Tích cực', 0.96, 'Processed', '2026-06-14T09:00:00'),
(12, 3, 5, N'Cà phê trứng ở đây ngon nhất mà tôi từng thử, tuyệt vời!', N'Tích cực', 0.93, 'Processed', '2026-06-15T10:30:00'),
(13, 5, 4, N'Sinh tố xoài ngon, phù hợp cho ngày hè nóng bức', N'Tích cực', 0.80, 'Processed', '2026-06-16T15:00:00'),
(4, 4, 5, N'Trà đào cam sả lần này quá đã, ngon tuyệt, sẽ quay lại hoài!', N'Tích cực', 0.97, 'Pending', '2026-06-22T08:00:00'),
(11, 1, 4, N'Cà phê sữa đá ngon như mọi khi, ổn định chất lượng', N'Tích cực', 0.86, 'Pending', '2026-06-22T14:00:00'),
(12, 5, 5, N'Sinh tố xoài tươi mát, giải khát tuyệt vời cho ngày nóng', N'Tích cực', 0.91, 'Pending', '2026-06-23T09:00:00'),

-- Trung lập (3 đánh giá)
(4, 3, 3, N'Cà phê trứng bình thường, không có gì đặc biệt lắm', N'Trung lập', 0.55, 'Processed', '2026-06-17T09:00:00'),
(6, 5, 3, N'Sinh tố xoài vừa vặn, có thể thêm chút đường thì ngon hơn', N'Trung lập', 0.50, 'Processed', '2026-06-17T14:00:00'),
(8, 2, 3, N'Bạc xỉu ở đây cũng tạm được, hơi ít cà phê', N'Trung lập', 0.52, 'Processed', '2026-06-18T10:30:00'),

-- Tiêu cực (4 đánh giá)
(5, 1, 2, N'Hôm nay cà phê hơi nhạt, không đậm đà như lần trước', N'Tiêu cực', 0.78, 'Processed', '2026-06-19T08:30:00'),
(7, 3, 1, N'Cà phê trứng lần này bị khét, rất thất vọng', N'Tiêu cực', 0.90, 'Processed', '2026-06-19T11:00:00'),
(9, 4, 2, N'Trà đào hôm nay quá ngọt, uống không nổi, phải bỏ dở', N'Tiêu cực', 0.85, 'Pending', '2026-06-20T16:00:00'),
(13, 2, 2, N'Phục vụ hơi chậm, phải đợi lâu mới có đồ uống', N'Tiêu cực', 0.75, 'Pending', '2026-06-21T09:30:00');
GO

-- ============================================
-- 4. THÊM PHẢN HỒI CỦA NHÂN VIÊN
-- (Cột tên là ReplyText theo model FeedbackReply)
-- ============================================
-- Cần lấy ID thực tế của Feedbacks vừa tạo
DECLARE @fb1 INT = (SELECT TOP 1 Id FROM Feedbacks WHERE Comment LIKE N'%Cà phê sữa đá ở đây rất ngon%');
DECLARE @fb2 INT = (SELECT TOP 1 Id FROM Feedbacks WHERE Comment LIKE N'%Bạc xỉu tuyệt vời%');
DECLARE @fb4 INT = (SELECT TOP 1 Id FROM Feedbacks WHERE Comment LIKE N'%Trà đào cam sả thơm ngon%');
DECLARE @fb17 INT = (SELECT TOP 1 Id FROM Feedbacks WHERE Comment LIKE N'%cà phê hơi nhạt%');
DECLARE @fb18 INT = (SELECT TOP 1 Id FROM Feedbacks WHERE Comment LIKE N'%trứng lần này bị khét%');

INSERT INTO [FeedbackReplies] ([FeedbackId], [StaffId], [ReplyText], [CreatedAt])
VALUES
(@fb1, 2, N'Cảm ơn bạn đã ghé thăm quán! Rất vui vì bạn thích cà phê của chúng tôi ạ', '2026-06-10T10:00:00'),
(@fb2, 2, N'Cảm ơn bạn rất nhiều! Bạc xỉu là món best-seller của quán đấy ạ', '2026-06-10T11:00:00'),
(@fb4, 14, N'Trà đào cam sả luôn được pha chế từ nguyên liệu tươi nhất! Cảm ơn bạn!', '2026-06-12T08:00:00'),
(@fb17, 2, N'Xin lỗi bạn vì trải nghiệm chưa tốt. Chúng tôi sẽ cải thiện ngay ạ!', '2026-06-19T10:00:00'),
(@fb18, 14, N'Chân thành xin lỗi bạn! Chúng tôi đã nhắc nhở đội pha chế và sẽ đảm bảo điều này không tái diễn.', '2026-06-19T14:00:00');
GO

-- ============================================
-- 5. THÊM ĐƠN HÀNG MẪU (25 đơn)
-- ============================================
INSERT INTO [Orders] ([CustomerId], [TotalPrice], [Status], [PaymentMethod], [CreatedAt])
VALUES
(3, 61000, 'Completed', 'Cash', '2026-06-01T08:15:00'),
(4, 29000, 'Completed', 'Momo', '2026-06-01T09:30:00'),
(5, 74000, 'Completed', 'Cash', '2026-06-02T10:00:00'),
(6, 45000, 'Completed', 'BankTransfer', '2026-06-03T11:20:00'),
(7, 81000, 'Completed', 'Cash', '2026-06-04T08:45:00'),
(8, 42000, 'Completed', 'Momo', '2026-06-05T14:00:00'),
(9, 68000, 'Completed', 'Cash', '2026-06-06T09:30:00'),
(10, 97000, 'Completed', 'BankTransfer', '2026-06-08T08:00:00'),
(11, 32000, 'Completed', 'Cash', '2026-06-09T10:15:00'),
(12, 116000, 'Completed', 'Momo', '2026-06-10T09:00:00'),
(13, 58000, 'Completed', 'Cash', '2026-06-11T11:30:00'),
(4, 87000, 'Completed', 'Cash', '2026-06-12T14:00:00'),
(5, 45000, 'Completed', 'Momo', '2026-06-13T08:30:00'),
(6, 71000, 'Completed', 'BankTransfer', '2026-06-14T16:00:00'),
(7, 103000, 'Completed', 'Cash', '2026-06-15T09:00:00'),
(8, 39000, 'Completed', 'Momo', '2026-06-16T10:30:00'),
(9, 84000, 'Completed', 'Cash', '2026-06-17T08:15:00'),
(10, 52000, 'Completed', 'BankTransfer', '2026-06-18T12:00:00'),
(11, 67000, 'Completed', 'Cash', '2026-06-19T09:45:00'),
(12, 145000, 'Completed', 'Momo', '2026-06-20T14:30:00'),
(13, 38000, 'Completed', 'Cash', '2026-06-21T11:00:00'),
(4, 93000, 'Completed', 'Cash', '2026-06-22T08:00:00'),
(5, 71000, 'Processing', 'Momo', '2026-06-22T15:00:00'),
(3, 126000, 'Processing', 'BankTransfer', '2026-06-23T09:30:00'),
(7, 48000, 'Pending', 'Cash', '2026-06-23T14:00:00');
GO

-- ============================================
-- 6. THÊM CHI TIẾT ĐƠN HÀNG
-- ============================================
-- Lấy ID thực tế của các đơn hàng vừa tạo
DECLARE @o1 INT, @o2 INT, @o3 INT, @o4 INT, @o5 INT;
DECLARE @o6 INT, @o7 INT, @o8 INT, @o9 INT, @o10 INT;
DECLARE @o11 INT, @o12 INT, @o13 INT, @o14 INT, @o15 INT;
DECLARE @o16 INT, @o17 INT, @o18 INT, @o19 INT, @o20 INT;
DECLARE @o21 INT, @o22 INT, @o23 INT, @o24 INT, @o25 INT;

SELECT @o1 = Id FROM Orders WHERE TotalPrice = 61000 AND CustomerId = 3;
SELECT @o2 = Id FROM Orders WHERE TotalPrice = 29000 AND CustomerId = 4;
SELECT @o3 = Id FROM Orders WHERE TotalPrice = 74000 AND CustomerId = 5;
SELECT @o4 = Id FROM Orders WHERE TotalPrice = 45000 AND CustomerId = 6;
SELECT @o5 = Id FROM Orders WHERE TotalPrice = 81000 AND CustomerId = 7;
SELECT @o6 = Id FROM Orders WHERE TotalPrice = 42000 AND CustomerId = 8;
SELECT @o7 = Id FROM Orders WHERE TotalPrice = 68000 AND CustomerId = 9;
SELECT @o8 = Id FROM Orders WHERE TotalPrice = 97000 AND CustomerId = 10;
SELECT @o9 = Id FROM Orders WHERE TotalPrice = 32000 AND CustomerId = 11;
SELECT @o10 = Id FROM Orders WHERE TotalPrice = 116000 AND CustomerId = 12;
SELECT @o11 = Id FROM Orders WHERE TotalPrice = 58000 AND CustomerId = 13;
SELECT @o12 = Id FROM Orders WHERE TotalPrice = 87000 AND CustomerId = 4;
SELECT @o13 = Id FROM Orders WHERE TotalPrice = 45000 AND CustomerId = 5 AND CreatedAt = '2026-06-13T08:30:00';
SELECT @o14 = Id FROM Orders WHERE TotalPrice = 71000 AND CustomerId = 6;
SELECT @o15 = Id FROM Orders WHERE TotalPrice = 103000 AND CustomerId = 7;
SELECT @o16 = Id FROM Orders WHERE TotalPrice = 39000 AND CustomerId = 8;
SELECT @o17 = Id FROM Orders WHERE TotalPrice = 84000 AND CustomerId = 9;
SELECT @o18 = Id FROM Orders WHERE TotalPrice = 52000 AND CustomerId = 10;
SELECT @o19 = Id FROM Orders WHERE TotalPrice = 67000 AND CustomerId = 11;
SELECT @o20 = Id FROM Orders WHERE TotalPrice = 145000 AND CustomerId = 12;
SELECT @o21 = Id FROM Orders WHERE TotalPrice = 38000 AND CustomerId = 13;
SELECT @o22 = Id FROM Orders WHERE TotalPrice = 93000 AND CustomerId = 4;
SELECT @o23 = Id FROM Orders WHERE TotalPrice = 71000 AND CustomerId = 5 AND Status = 'Processing';
SELECT @o24 = Id FROM Orders WHERE TotalPrice = 126000 AND CustomerId = 3;
SELECT @o25 = Id FROM Orders WHERE TotalPrice = 48000 AND CustomerId = 7 AND Status = 'Pending';

INSERT INTO [OrderItems] ([OrderId], [DrinkId], [Quantity], [Price])
VALUES
(@o1, 1, 1, 29000), (@o1, 2, 1, 32000),
(@o2, 1, 1, 29000),
(@o3, 2, 2, 32000),
(@o4, 3, 1, 45000),
(@o5, 4, 1, 39000), (@o5, 5, 1, 42000),
(@o6, 5, 1, 42000),
(@o7, 1, 1, 29000), (@o7, 4, 1, 39000),
(@o8, 2, 1, 32000), (@o8, 3, 1, 45000),
(@o9, 2, 1, 32000),
(@o10, 1, 2, 29000), (@o10, 4, 1, 39000),
(@o11, 1, 1, 29000), (@o11, 3, 1, 45000),
(@o12, 2, 1, 32000), (@o12, 5, 1, 42000),
(@o13, 3, 1, 45000),
(@o14, 1, 1, 29000), (@o14, 5, 1, 42000),
(@o15, 4, 2, 39000), (@o15, 1, 1, 29000),
(@o16, 4, 1, 39000),
(@o17, 2, 1, 32000), (@o17, 5, 1, 42000),
(@o18, 3, 1, 45000),
(@o19, 1, 1, 29000), (@o19, 4, 1, 39000),
(@o20, 3, 2, 45000), (@o20, 2, 1, 32000), (@o20, 5, 1, 42000),
(@o21, 4, 1, 39000),
(@o22, 1, 1, 29000), (@o22, 2, 1, 32000), (@o22, 5, 1, 42000),
(@o23, 1, 1, 29000), (@o23, 5, 1, 42000),
(@o24, 3, 2, 45000), (@o24, 2, 1, 32000), (@o24, 4, 1, 39000),
(@o25, 6, 1, 48000);
GO

PRINT N'Done! Sample data inserted successfully.';
GO
