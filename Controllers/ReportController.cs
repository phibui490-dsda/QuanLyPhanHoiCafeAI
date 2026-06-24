using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CAFE_AI.Services;

namespace CAFE_AI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Manager,Admin")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] string groupBy = "day")
        {
            if (groupBy != "day" && groupBy != "week" && groupBy != "month")
            {
                return BadRequest(new { message = "groupBy phải là 'day', 'week', hoặc 'month'." });
            }

            var summary = await _reportService.GetReportSummaryAsync(from, to, groupBy);
            return Ok(summary);
        }

        [HttpGet("export")]
        public async Task<IActionResult> Export(
            [FromQuery] string format,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            if (string.IsNullOrEmpty(format))
            {
                return BadRequest(new { message = "Vui lòng chọn định dạng xuất báo cáo ('pdf' hoặc 'excel')." });
            }

            if (format.ToLower() == "pdf")
            {
                var pdfBytes = await _reportService.ExportPdfReportAsync(from, to);
                return File(pdfBytes, "application/pdf", $"bao-cao-phan-hoi-{DateTime.Now:yyyyMMddHHmmss}.pdf");
            }
            else if (format.ToLower() == "excel")
            {
                var excelBytes = await _reportService.ExportExcelReportAsync(from, to);
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"bao-cao-phan-hoi-{DateTime.Now:yyyyMMddHHmmss}.xlsx");
            }

            return BadRequest(new { message = "Định dạng không được hỗ trợ. Chỉ hỗ trợ 'pdf' hoặc 'excel'." });
        }
    }
}
