using System;
using System.IO;
using System.Threading.Tasks;
using CAFE_AI.DTOs;

namespace CAFE_AI.Services
{
    public interface IReportService
    {
        Task<ReportSummaryDto> GetReportSummaryAsync(DateTime? from, DateTime? to, string groupBy);
        Task<byte[]> ExportPdfReportAsync(DateTime? from, DateTime? to);
        Task<byte[]> ExportExcelReportAsync(DateTime? from, DateTime? to);
    }
}
