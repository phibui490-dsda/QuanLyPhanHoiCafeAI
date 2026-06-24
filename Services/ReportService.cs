using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ClosedXML.Excel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using CAFE_AI.Data;
using CAFE_AI.DTOs;
using CAFE_AI.Models;

namespace CAFE_AI.Services
{
    public class ReportService : IReportService
    {
        private readonly AppDbContext _context;

        public ReportService(AppDbContext context)
        {
            _context = context;
            // Setup QuestPDF License (Community tier is free for open source/community usage)
            try
            {
                QuestPDF.Settings.License = LicenseType.Community;
            }
            catch (Exception)
            {
                // Already set or error
            }
        }

        public async Task<ReportSummaryDto> GetReportSummaryAsync(DateTime? from, DateTime? to, string groupBy)
        {
            var query = _context.Feedbacks.AsQueryable();

            if (from.HasValue)
            {
                query = query.Where(f => f.CreatedAt >= from.Value.ToUniversalTime());
            }
            if (to.HasValue)
            {
                query = query.Where(f => f.CreatedAt <= to.Value.ToUniversalTime());
            }

            var feedbacks = await query.ToListAsync();
            var drinks = await _context.Drinks.ToListAsync();

            var totalFeedbacks = feedbacks.Count;
            var averageRating = totalFeedbacks > 0 ? feedbacks.Average(f => f.Rating) : 0.0;

            // Sentiment Distribution
            var sentimentGroups = feedbacks.GroupBy(f => f.SentimentLabel)
                .Select(g => new SentimentDistributionDto
                {
                    Label = g.Key,
                    Count = g.Count(),
                    Percentage = totalFeedbacks > 0 ? (double)g.Count() / totalFeedbacks * 100 : 0.0
                }).ToList();

            // Handle labels that might not be in the results yet
            var labels = new[] { "Tích cực", "Tiêu cực", "Trung lập" };
            foreach (var label in labels)
            {
                if (!sentimentGroups.Any(g => g.Label == label))
                {
                    sentimentGroups.Add(new SentimentDistributionDto { Label = label, Count = 0, Percentage = 0.0 });
                }
            }

            // Rank drinks based on comment mentions
            var drinkStats = new List<DrinkRatingStatsDto>();
            foreach (var drink in drinks)
            {
                // Find comments mentioning the drink name (case-insensitive)
                var mentions = feedbacks.Where(f => f.Comment.Contains(drink.Name, StringComparison.OrdinalIgnoreCase)).ToList();
                if (mentions.Count > 0)
                {
                    drinkStats.Add(new DrinkRatingStatsDto
                    {
                        DrinkId = drink.Id,
                        Name = drink.Name,
                        AverageRating = mentions.Average(m => m.Rating),
                        TotalRatings = mentions.Count
                    });
                }
                else
                {
                    // Default stats for unmentioned drinks
                    drinkStats.Add(new DrinkRatingStatsDto
                    {
                        DrinkId = drink.Id,
                        Name = drink.Name,
                        AverageRating = 0.0,
                        TotalRatings = 0
                    });
                }
            }

            var topRated = drinkStats.Where(d => d.TotalRatings > 0)
                .OrderByDescending(d => d.AverageRating)
                .ThenByDescending(d => d.TotalRatings)
                .Take(5)
                .ToList();

            var lowestRated = drinkStats.Where(d => d.TotalRatings > 0)
                .OrderBy(d => d.AverageRating)
                .ThenByDescending(d => d.TotalRatings)
                .Take(5)
                .ToList();

            // Grouping over time
            var timeGroups = new List<FeedbackTimeGroupDto>();
            if (totalFeedbacks > 0)
            {
                var grouped = feedbacks.GroupBy(f =>
                {
                    var date = f.CreatedAt.ToLocalTime();
                    return groupBy.ToLower() switch
                    {
                        "week" => $"W{GetIso8601WeekOfYear(date)}-{date.Year}",
                        "month" => date.ToString("yyyy-MM"),
                        _ => date.ToString("yyyy-MM-dd") // default day
                    };
                });

                timeGroups = grouped.Select(g => new FeedbackTimeGroupDto
                {
                    Period = g.Key,
                    Count = g.Count()
                }).OrderBy(tg => tg.Period).ToList();
            }

            return new ReportSummaryDto
            {
                TotalUsers = await _context.Users.CountAsync(),
                TotalDrinks = drinks.Count,
                TotalFeedbacks = totalFeedbacks,
                PositiveFeedbacks = feedbacks.Count(f => f.SentimentLabel == "Tích cực"),
                NegativeFeedbacks = feedbacks.Count(f => f.SentimentLabel == "Tiêu cực"),
                AverageRating = Math.Round(averageRating, 2),
                TotalFeedbacksPeriod = totalFeedbacks, // For now, use overall
                PositiveCount = feedbacks.Count(f => f.SentimentLabel == "Tích cực"),
                NegativeCount = feedbacks.Count(f => f.SentimentLabel == "Tiêu cực"),
                AverageRatingPeriod = Math.Round(averageRating, 2),
                TopRatedDrinks = topRated,
                LowestRatedDrinks = lowestRated,
                SentimentDistribution = sentimentGroups.OrderByDescending(g => g.Percentage).ToList(),
                FeedbackOverTime = timeGroups
            };
        }

        public async Task<byte[]> ExportPdfReportAsync(DateTime? from, DateTime? to)
        {
            var summary = await GetReportSummaryAsync(from, to, "day");
            var feedbacks = await _context.Feedbacks
                .Include(f => f.Customer)
                .Where(f => (!from.HasValue || f.CreatedAt >= from.Value.ToUniversalTime()) &&
                            (!to.HasValue || f.CreatedAt <= to.Value.ToUniversalTime()))
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Arial"));

                    page.Header()
                        .Text("BÁO CÁO PHẢN HỒI KHÁCH HÀNG - CAFE AI")
                        .SemiBold().FontSize(18).FontColor(Colors.Brown.Darken3);

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(column =>
                        {
                            column.Spacing(15);

                            // Date filter description
                            column.Item().Text($"Thời gian báo cáo: {(from.HasValue ? from.Value.ToLocalTime().ToString("dd/MM/yyyy") : "Bắt đầu")} - {(to.HasValue ? to.Value.ToLocalTime().ToString("dd/MM/yyyy") : "Hiện tại")}")
                                .Italic().FontSize(10);

                            // Section 1: Overview
                            column.Item().Text("1. Tổng quan").Bold().FontSize(14).FontColor(Colors.Brown.Darken2);
                            column.Item().Text($"Tổng số phản hồi: {summary.TotalFeedbacks}");
                            column.Item().Text($"Điểm đánh giá trung bình: {summary.AverageRating} / 5.0");

                            // Sentiment breakdown
                            column.Item().Text("Phân bổ cảm xúc:").Bold();
                            foreach (var s in summary.SentimentDistribution)
                            {
                                column.Item().Text($"- {s.Label}: {s.Count} phản hồi ({Math.Round(s.Percentage, 1)}%)");
                            }

                            // Section 2: Top drinks comments
                            column.Item().Text("2. Xếp hạng đồ uống (Qua lượt nhắc tới trong bình luận)").Bold().FontSize(14).FontColor(Colors.Brown.Darken2);
                            column.Item().Text("Top đồ uống đánh giá cao:");
                            foreach (var d in summary.TopRatedDrinks)
                            {
                                column.Item().Text($"- {d.Name}: {Math.Round(d.AverageRating, 1)} sao ({d.TotalRatings} lượt đánh giá)");
                            }
                            if (summary.TopRatedDrinks.Count == 0) column.Item().Text("- Chưa có dữ liệu đánh giá đồ uống");

                            // Section 3: Detailed Feedback Table
                            column.Item().PageBreak();
                            column.Item().Text("3. Danh sách phản hồi chi tiết").Bold().FontSize(14).FontColor(Colors.Brown.Darken2);

                            column.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn(1); // Date
                                    columns.RelativeColumn(2); // Customer
                                    columns.RelativeColumn(1); // Rating
                                    columns.RelativeColumn(3); // Comment
                                    columns.RelativeColumn(1.5f); // Sentiment
                                });

                                // Table Header
                                table.Header(header =>
                                {
                                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Ngày").Bold();
                                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Khách hàng").Bold();
                                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Sao").Bold();
                                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Ý kiến").Bold();
                                    header.Cell().Background(Colors.Grey.Lighten2).Padding(5).Text("Cảm xúc").Bold();
                                });

                                // Table Rows
                                foreach (var fb in feedbacks)
                                {
                                    table.Cell().Padding(5).Text(fb.CreatedAt.ToLocalTime().ToString("dd/MM/yyyy HH:mm"));
                                    table.Cell().Padding(5).Text(fb.Customer?.Email ?? "Ẩn danh");
                                    table.Cell().Padding(5).Text(fb.Rating.ToString());
                                    table.Cell().Padding(5).Text(fb.Comment);
                                    table.Cell().Padding(5).Text($"{fb.SentimentLabel} ({Math.Round(fb.SentimentConfidence * 100)}%)");
                                }
                            });
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Trang ");
                            x.CurrentPageNumber();
                        });
                });
            });

            return document.GeneratePdf();
        }

        public async Task<byte[]> ExportExcelReportAsync(DateTime? from, DateTime? to)
        {
            var summary = await GetReportSummaryAsync(from, to, "day");
            var feedbacks = await _context.Feedbacks
                .Include(f => f.Customer)
                .Where(f => (!from.HasValue || f.CreatedAt >= from.Value.ToUniversalTime()) &&
                            (!to.HasValue || f.CreatedAt <= to.Value.ToUniversalTime()))
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

            using (var workbook = new XLWorkbook())
            {
                var wsSummary = workbook.Worksheets.Add("Tổng quan");

                // Headers
                wsSummary.Cell("A1").Value = "BÁO CÁO PHẢN HỒI KHÁCH HÀNG - CAFE AI";
                wsSummary.Cell("A1").Style.Font.Bold = true;
                wsSummary.Cell("A1").Style.Font.FontSize = 16;

                wsSummary.Cell("A2").Value = $"Từ ngày: {(from.HasValue ? from.Value.ToLocalTime().ToString("dd/MM/yyyy") : "Bắt đầu")} - Đến ngày: {(to.HasValue ? to.Value.ToLocalTime().ToString("dd/MM/yyyy") : "Hiện tại")}";

                // Overview card
                wsSummary.Cell("A4").Value = "Chỉ số tổng quan";
                wsSummary.Cell("A4").Style.Font.Bold = true;
                wsSummary.Cell("A5").Value = "Tổng số phản hồi";
                wsSummary.Cell("B5").Value = summary.TotalFeedbacks;
                wsSummary.Cell("A6").Value = "Điểm đánh giá trung bình";
                wsSummary.Cell("B6").Value = summary.AverageRating;

                // Sentiment
                wsSummary.Cell("A8").Value = "Phân bổ cảm xúc";
                wsSummary.Cell("A8").Style.Font.Bold = true;
                wsSummary.Cell("A9").Value = "Cảm xúc";
                wsSummary.Cell("B9").Value = "Số lượng";
                wsSummary.Cell("C9").Value = "Tỷ lệ %";
                wsSummary.Range("A9:C9").Style.Font.Bold = true;

                int row = 10;
                foreach (var s in summary.SentimentDistribution)
                {
                    wsSummary.Cell(row, 1).Value = s.Label;
                    wsSummary.Cell(row, 2).Value = s.Count;
                    wsSummary.Cell(row, 3).Value = s.Percentage / 100.0;
                    wsSummary.Cell(row, 3).Style.NumberFormat.Format = "0.0%";
                    row++;
                }

                // Drink rankings
                row += 2;
                wsSummary.Cell(row, 1).Value = "Đồ uống được đánh giá cao nhất";
                wsSummary.Cell(row, 1).Style.Font.Bold = true;
                row++;
                wsSummary.Cell(row, 1).Value = "Tên đồ uống";
                wsSummary.Cell(row, 2).Value = "Đánh giá trung bình (Mentions)";
                wsSummary.Cell(row, 3).Value = "Số lượt nhắc tới";
                wsSummary.Range(row, 1, row, 3).Style.Font.Bold = true;
                row++;

                foreach (var d in summary.TopRatedDrinks.Where(d => d.TotalRatings > 0))
                {
                    wsSummary.Cell(row, 1).Value = d.Name;
                    wsSummary.Cell(row, 2).Value = d.AverageRating;
                    wsSummary.Cell(row, 3).Value = d.TotalRatings;
                    row++;
                }

                // Feedback Details sheet
                var wsDetails = workbook.Worksheets.Add("Chi tiết phản hồi");
                wsDetails.Cell("A1").Value = "Mã phản hồi";
                wsDetails.Cell("B1").Value = "Ngày tạo";
                wsDetails.Cell("C1").Value = "Khách hàng";
                wsDetails.Cell("D1").Value = "Điểm số (1-5)";
                wsDetails.Cell("E1").Value = "Bình luận";
                wsDetails.Cell("F1").Value = "Nhãn cảm xúc";
                wsDetails.Cell("G1").Value = "Độ tin cậy AI";
                wsDetails.Cell("H1").Value = "Trạng thái xử lý";
                wsDetails.Range("A1:H1").Style.Font.Bold = true;

                int detailRow = 2;
                foreach (var fb in feedbacks)
                {
                    wsDetails.Cell(detailRow, 1).Value = fb.Id;
                    wsDetails.Cell(detailRow, 2).Value = fb.CreatedAt.ToLocalTime().ToString("dd/MM/yyyy HH:mm:ss");
                    wsDetails.Cell(detailRow, 3).Value = fb.Customer?.Email ?? "Ẩn danh";
                    wsDetails.Cell(detailRow, 4).Value = fb.Rating;
                    wsDetails.Cell(detailRow, 5).Value = fb.Comment;
                    wsDetails.Cell(detailRow, 6).Value = fb.SentimentLabel;
                    wsDetails.Cell(detailRow, 7).Value = fb.SentimentConfidence;
                    wsDetails.Cell(detailRow, 7).Style.NumberFormat.Format = "0.0%";
                    wsDetails.Cell(detailRow, 8).Value = fb.Status;
                    detailRow++;
                }

                wsDetails.Columns().AdjustToContents();
                wsSummary.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return stream.ToArray();
                }
            }
        }

        private static int GetIso8601WeekOfYear(DateTime time)
        {
            DayOfWeek day = CultureInfo.InvariantCulture.Calendar.GetDayOfWeek(time);
            if (day >= DayOfWeek.Monday && day <= DayOfWeek.Wednesday)
            {
                time = time.AddDays(3);
            }
            return CultureInfo.InvariantCulture.Calendar.GetWeekOfYear(time, CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
        }
    }
}
