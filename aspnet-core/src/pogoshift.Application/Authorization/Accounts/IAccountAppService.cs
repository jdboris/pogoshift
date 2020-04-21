using System.Threading.Tasks;
using Abp.Application.Services;
using pogoshift.Authorization.Accounts.Dto;

namespace pogoshift.Authorization.Accounts
{
    public interface IAccountAppService : IApplicationService
    {
        Task<IsTenantAvailableOutput> IsTenantAvailable(IsTenantAvailableInput input);

        Task<RegisterOutput> Register(RegisterInput input);
    }
}
