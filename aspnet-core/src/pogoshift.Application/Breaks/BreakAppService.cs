using Abp.Application.Services;
using Abp.Authorization;
using Abp.Domain.Repositories;
using pogoshift.Authorization;
using pogoshift.Breaks.Dto;

namespace pogoshift.Breaks
{
    [AbpAuthorize(PermissionNames.Shifts_CrudAll)]
    public class BreakAppService : CrudAppService<Break, BreakDto>
    {

        public BreakAppService(
            IRepository<Break, int> repository
            ) : base(repository)
        {
        }

    }
}

