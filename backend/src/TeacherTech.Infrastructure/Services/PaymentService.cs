using TeacherTech.Domain.Interfaces;

namespace TeacherTech.Infrastructure.Services;

public class PaymentDomainService : IPaymentDomainService
{
    public (decimal Amount, decimal PlatformFee, decimal ProfessorRevenue) CalculateSplit(decimal coursePrice)
    {
        decimal platformRate = 0.10m;
        decimal platformFee = Math.Round(coursePrice * platformRate, 2);
        decimal professorRevenue = coursePrice - platformFee;

        return (coursePrice, platformFee, professorRevenue);
    }

    public string GeneratePixPayload(Guid transactionId, decimal amount)
    {
        return $"00020126580014BR.GOV.BCB.PIX0136{transactionId}5204000053039865405{amount:F2}5802BR5915TeacherTech SaaS6009SAO PAULO62070503***6304ABCD";
    }
}
