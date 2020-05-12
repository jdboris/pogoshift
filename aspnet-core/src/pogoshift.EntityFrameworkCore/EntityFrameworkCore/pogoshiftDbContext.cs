using Abp.Zero.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using pogoshift.Authorization.Roles;
using pogoshift.Authorization.Users;
using pogoshift.Availabilities;
using pogoshift.MultiTenancy;
using pogoshift.Shifts;

namespace pogoshift.EntityFrameworkCore
{
    public class pogoshiftDbContext : AbpZeroDbContext<Tenant, Role, User, pogoshiftDbContext>
    {
        /* Define a DbSet for each entity of the application */
        public DbSet<Availability> Availabilities { get; set; }
        public DbSet<Shift> Shifts { get; set; }
        public DbSet<StoreHours.StoreHours> StoreHours { get; set; }

        public pogoshiftDbContext(DbContextOptions<pogoshiftDbContext> options)
            : base(options)
        {
        }

        /*
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Filter("UserFilter", (IHasUser entity, int personId) => entity.PersonId == personId, 0);
        }
        */
    }
}
