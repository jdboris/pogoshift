using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using pogoshift.Authorization;
using pogoshift.Shifts.Dto;
using System.Collections.Generic;
using System.Linq;

namespace pogoshift.Shifts
{
    [AbpAuthorize]
    public class ShiftAppService : CrudAppService<Shift, ShiftDto, int, ShiftDto, ShiftDto, UpdateShiftDto>
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        public ShiftAppService(IRepository<Shift, int> repository, IUnitOfWorkManager unitOfWorkManager) : base(repository)
        {
            _unitOfWorkManager = unitOfWorkManager;
        }

        protected override IQueryable<Shift> CreateFilteredQuery(ShiftDto input)
        {
            return Repository.GetAllIncluding(p => p.User);
        }

        protected override Shift GetEntityById(int id)
        {
            var entity = Repository.GetAllIncluding(p => p.User).FirstOrDefault(p => p.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException(typeof(Shift), id);
            }

            return entity;
        }

        public ListResultDto<ShiftDto> GetAllByDate(int month, int year)
        {
            var shifts = Repository.GetAllIncluding(p => p.User).Where(p => p.Beginning.Month == month && p.Ending.Year == year);

            return new ListResultDto<ShiftDto>(ObjectMapper.Map<List<ShiftDto>>(shifts));
        }

        [AbpAuthorize(PermissionNames.Shifts_ReadAll)]
        public ListResultDto<ShiftDto> GetAllOfAllUsersByDate(int month, int year)
        {
            using (_unitOfWorkManager.Current.DisableFilter("HasUser"))
            {
                var shifts = Repository.GetAllList().Where(p => p.Beginning.Month == month && p.Ending.Year == year);

                return new ListResultDto<ShiftDto>(ObjectMapper.Map<List<ShiftDto>>(shifts));
            }
        }
    }
}

