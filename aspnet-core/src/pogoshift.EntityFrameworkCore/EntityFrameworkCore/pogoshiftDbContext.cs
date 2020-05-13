using Abp.Authorization;
using Abp.Zero.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using pogoshift.Authorization.Roles;
using pogoshift.Authorization.Users;
using pogoshift.Availabilities;
using pogoshift.Filters;
using pogoshift.MultiTenancy;
using pogoshift.Shifts;
using System;
using System.Linq.Expressions;

namespace pogoshift.EntityFrameworkCore
{
    public class pogoshiftDbContext : AbpZeroDbContext<Tenant, Role, User, pogoshiftDbContext>
    {
        /* Define a DbSet for each entity of the application */
        public DbSet<Availability> Availabilities { get; set; }
        public DbSet<Shift> Shifts { get; set; }
        public DbSet<StoreHours.StoreHours> StoreHours { get; set; }

        public IPermissionChecker PermissionChecker { get; set; }
        public UserManager UserManager { get; set; }

        protected virtual bool IsHasUserFilterEnabled => CurrentUnitOfWorkProvider?.Current?.IsFilterEnabled("HasUser") == true;

        public pogoshiftDbContext(DbContextOptions<pogoshiftDbContext> options)
            : base(options)
        {
        }

        protected override bool ShouldFilterEntity<TEntity>(IMutableEntityType entityType)
        {
            if (typeof(IHasUser).IsAssignableFrom(typeof(TEntity)))
            {
                return true;
            }
            return base.ShouldFilterEntity<TEntity>(entityType);
        }

        protected override Expression<Func<TEntity, bool>> CreateFilterExpression<TEntity>()
        {
            var expression = base.CreateFilterExpression<TEntity>();
            if (typeof(IHasUser).IsAssignableFrom(typeof(TEntity)))
            {
                Expression<Func<TEntity, bool>> hasUserFilter = e =>
                    IsHasUserFilterEnabled && ((IHasUser)e).UserId == AbpSession.UserId;

                expression = expression == null ? hasUserFilter : CombineExpressions(expression, hasUserFilter);
            }

            return expression;
        }
    }
}
