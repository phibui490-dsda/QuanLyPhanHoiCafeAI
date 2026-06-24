using FluentValidation;
using CAFE_AI.DTOs;

namespace CAFE_AI.Validators
{
    public class RegisterDtoValidator : AbstractValidator<RegisterDto>
    {
        public RegisterDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email không được để trống")
                .EmailAddress().WithMessage("Email không đúng định dạng");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Mật khẩu không được để trống")
                .MinimumLength(6).WithMessage("Mật khẩu phải có ít nhất 6 ký tự");

            RuleFor(x => x.Role)
                .NotEmpty().WithMessage("Vai trò không được để trống")
                .Must(role => role == "Customer" || role == "Staff" || role == "Manager" || role == "Admin")
                .WithMessage("Vai trò phải là Customer, Staff, Manager, hoặc Admin");
        }
    }

    public class LoginDtoValidator : AbstractValidator<LoginDto>
    {
        public LoginDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email không được để trống")
                .EmailAddress().WithMessage("Email không đúng định dạng");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Mật khẩu không được để trống");
        }
    }

    public class DrinkCreateUpdateDtoValidator : AbstractValidator<DrinkCreateUpdateDto>
    {
        public DrinkCreateUpdateDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên đồ uống không được để trống");

            RuleFor(x => x.Price)
                .GreaterThan(0).WithMessage("Giá đồ uống phải lớn hơn 0");

            RuleFor(x => x.Category)
                .NotEmpty().WithMessage("Danh mục không được để trống");
        }
    }

    public class FeedbackCreateDtoValidator : AbstractValidator<FeedbackCreateDto>
    {
        public FeedbackCreateDtoValidator()
        {
            RuleFor(x => x.Rating)
                .InclusiveBetween(1, 5).WithMessage("Đánh giá phải từ 1 đến 5 sao");

            RuleFor(x => x.Comment)
                .NotEmpty().WithMessage("Bình luận không được để trống");
        }
    }

    public class FeedbackReplyCreateDtoValidator : AbstractValidator<FeedbackReplyCreateDto>
    {
        public FeedbackReplyCreateDtoValidator()
        {
            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("Nội dung phản hồi không được để trống");
        }
    }

    public class AIConfigDtoValidator : AbstractValidator<AIConfigDto>
    {
        public AIConfigDtoValidator()
        {
            RuleFor(x => x.SentimentThreshold)
                .InclusiveBetween(0.0, 1.0).WithMessage("Ngưỡng tin cậy phải từ 0.0 đến 1.0");

            RuleFor(x => x.MaxRecommendations)
                .GreaterThan(0).WithMessage("Số lượng gợi ý mặc định phải lớn hơn 0");
        }
    }
}
