using Microsoft.EntityFrameworkCore;
using Abp.Zero.EntityFrameworkCore;
using pogoshift.Authorization.Roles;
using pogoshift.Authorization.Users;
using pogoshift.MultiTenancy;

namespace pogoshift.EntityFrameworkCore
{
    public class pogoshiftDbContext : AbpZeroDbContext<Tenant, Role, User, pogoshiftDbContext>
    {
        /* Define a DbSet for each entity of the application */
        
        public pogoshiftDbContext(DbContextOptions<pogoshiftDbContext> options)
            : base(options)
        {
        }
    }
}
