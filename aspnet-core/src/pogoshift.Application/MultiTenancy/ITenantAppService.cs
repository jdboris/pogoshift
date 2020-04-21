using Abp.Application.Services;
using pogoshift.MultiTenancy.Dto;

namespace pogoshift.MultiTenancy
{
    public interface ITenantAppService : IAsyncCrudAppService<TenantDto, int, PagedTenantResultRequestDto, CreateTenantDto, TenantDto>
    {
    }
}

