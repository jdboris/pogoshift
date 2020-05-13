using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using pogoshift.Authorization;
using pogoshift.Availabilities.Dto;
using System.Collections.Generic;
using System.Linq;

namespace pogoshift.Availabilities
{
    [AbpAuthorize]
    public class AvailabilityAppService : CrudAppService<Availability, AvailabilityDto>
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        public AvailabilityAppService(IRepository<Availability, int> repository, IUnitOfWorkManager unitOfWorkManager) : base(repository)
        {
            _unitOfWorkManager = unitOfWorkManager;
        }

        protected override IQueryable<Availability> CreateFilteredQuery(PagedAndSortedResultRequestDto input)
        {
            return Repository.GetAllIncluding(p => p.User);
        }

        protected override Availability GetEntityById(int id)
        {
            var entity = Repository.GetAllIncluding(p => p.User).FirstOrDefault(p => p.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException(typeof(Availability), id);
            }

            return entity;
        }

        public ListResultDto<AvailabilityDto> GetAllByDate(int month, int year)
        {
            var availabilities = Repository.GetAllList().Where(p => p.Beginning.Month == month && p.Ending.Year == year);

            return new ListResultDto<AvailabilityDto>(ObjectMapper.Map<List<AvailabilityDto>>(availabilities));
        }

        [AbpAuthorize(PermissionNames.HasUser_CrudAll)]
        public ListResultDto<AvailabilityDto> GetAllOfAllUsersByDate(int month, int year)
        {
            using (_unitOfWorkManager.Current.DisableFilter("HasUser"))
            {
                var availabilities = Repository.GetAllList().Where(p => p.Beginning.Month == month && p.Ending.Year == year);

                return new ListResultDto<AvailabilityDto>(ObjectMapper.Map<List<AvailabilityDto>>(availabilities));
            }
        }
    }
}

