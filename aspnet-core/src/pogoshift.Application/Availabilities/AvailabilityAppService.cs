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
using pogoshift.Availabilities.Dto;
using pogoshift.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace pogoshift.Availabilities
{
    [AbpAuthorize]
    public class AvailabilityAppService : CrudAppService<Availability, AvailabilityDto, int, GetAllAvailabilityDto, AvailabilityDto, UpdateAvailabilityDto>
    {
        private readonly IUnitOfWorkManager _unitOfWorkManager;
        private readonly RoleManager _roleManager;
        private pogoshiftDbContext _ctx => _dbContextProvider.GetDbContext();
        private readonly IDbContextProvider<pogoshiftDbContext> _dbContextProvider;

        public AvailabilityAppService(
            IRepository<Availability, int> repository,
            IUnitOfWorkManager unitOfWorkManager,
            RoleManager roleManager,
            IDbContextProvider<pogoshiftDbContext> dbContextProvider
            ) : base(repository)
        {
            _unitOfWorkManager = unitOfWorkManager;
            _roleManager = roleManager;
            _dbContextProvider = dbContextProvider;
        }

        protected override IQueryable<Availability> CreateFilteredQuery(GetAllAvailabilityDto input)
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

        protected override AvailabilityDto MapToEntityDto(Availability availability)
        {
            var availabilityDto = base.MapToEntityDto(availability);

            if (availability.User != null && availability.User.Roles != null)
            {
                var roleIds = availability.User.Roles.Select(r => r.RoleId).ToArray();

                var roles = _roleManager.Roles.Where(r => roleIds.Contains(r.Id)).Select(r => r.NormalizedName);

                availabilityDto.User.RoleNames = roles.ToArray();
                //userDto.PermissionNames = user.Permissions.Select(x => x.Name).ToArray();
            }

            return availabilityDto;
        }

        public ListResultDto<AvailabilityDto> GetAllByDate(int month, int year)
        {
            var availabilities = _ctx.Availabilities
                   .Include(s => s.User)
                       .ThenInclude(u => u.Roles)
                   .Where(s => s.Beginning.Month == month && s.Ending.Year == year)
                   .ToArray();

            var list = new List<AvailabilityDto>();

            foreach (var availability in availabilities)
            {
                list.Add(MapToEntityDto(availability));
            }

            return new ListResultDto<AvailabilityDto>(list);
        }

        [AbpAuthorize(PermissionNames.HasUser_CrudAll)]
        public ListResultDto<AvailabilityDto> GetAllOfAllUsersByDate(int month, int year)
        {
            using (_unitOfWorkManager.Current.DisableFilter("HasUser"))
            {
                return GetAllByDate(month, year);
            }
        }
    }
}

