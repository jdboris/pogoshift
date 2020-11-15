using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Entities;
using Abp.Domain.Repositories;
using Abp.Domain.Uow;
using Abp.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using pogoshift.Authorization;
using pogoshift.Authorization.Roles;
using pogoshift.EntityFrameworkCore;
using pogoshift.Shifts.Dto;
using System.Collections.Generic;
using System.Linq;

namespace pogoshift.Shifts
{
    [AbpAuthorize(PermissionNames.Shifts_CrudAll)]
    public class ShiftAppService : CrudAppService<Shift, ShiftDto, int, ShiftDto, ShiftDto, UpdateShiftDto>
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly RoleManager _roleManager;
        private pogoshiftDbContext _ctx => _dbContextProvider.GetDbContext();
        private readonly IDbContextProvider<pogoshiftDbContext> _dbContextProvider;

        public ShiftAppService(
            IRepository<Shift, int> repository,
            IUnitOfWorkManager unitOfWorkManager,
            RoleManager roleManager,
            IDbContextProvider<pogoshiftDbContext> dbContextProvider
            ) : base(repository)
        {
            _unitOfWorkManager = unitOfWorkManager;
            _roleManager = roleManager;
            _dbContextProvider = dbContextProvider;
        }

        protected override IQueryable<Shift> CreateFilteredQuery(ShiftDto input)
        {
            return Repository.GetAllIncluding(p => p.User, p => p.Breaks);
        }

        protected override Shift GetEntityById(int id)
        {
            var entity = Repository.GetAllIncluding(p => p.User, p => p.Breaks).FirstOrDefault(p => p.Id == id);
            if (entity == null)
            {
                throw new EntityNotFoundException(typeof(Shift), id);
            }

            return entity;
        }

        protected override ShiftDto MapToEntityDto(Shift shift)
        {
            var shiftDto = base.MapToEntityDto(shift);

            if (shift.User != null && shift.User.Roles != null)
            {
                var roleIds = shift.User.Roles.Select(r => r.RoleId).ToArray();

                var roles = _roleManager.Roles.Where(r => roleIds.Contains(r.Id)).Select(r => r.NormalizedName);

                shiftDto.User.RoleNames = roles.ToArray();
                //userDto.PermissionNames = user.Permissions.Select(x => x.Name).ToArray();
            }

            return shiftDto;
        }

        [AbpAllowAnonymous]
        public ListResultDto<ShiftDto> GetAllByDate(int month, int year)
        {
            var shifts = _ctx.Shifts
                .Include(s => s.Breaks)
                .Include(s => s.User)
                    .ThenInclude(u => u.Roles)
                .Where(s => s.Beginning.Month == month && s.Ending.Year == year)
                .ToArray();

            var list = new List<ShiftDto>();

            foreach (var shift in shifts)
            {
                list.Add(MapToEntityDto(shift));
            }

            return new ListResultDto<ShiftDto>(list);
        }

        [AbpAllowAnonymous]
        [AbpAuthorize(PermissionNames.Shifts_ReadAll)]
        public ListResultDto<ShiftDto> GetAllOfAllUsersByDate(int month, int year)
        {
            using (_unitOfWorkManager.Current.DisableFilter("HasUser"))
            {
                return GetAllByDate(month, year);
            }
        }
    }
}

