using System.Threading.Tasks;
using Abp.Application.Services;
using pogoshift.Sessions.Dto;

namespace pogoshift.Sessions
{
    public interface ISessionAppService : IApplicationService
    {
        Task<GetCurrentLoginInformationsOutput> GetCurrentLoginInformations();
    }
}
