using System.Data.Common;
using Microsoft.EntityFrameworkCore;

namespace pogoshift.EntityFrameworkCore
{
    public static class pogoshiftDbContextConfigurer
    {
        public static void Configure(DbContextOptionsBuilder<pogoshiftDbContext> builder, string connectionString)
        {
            builder.UseSqlServer(connectionString);
        }

        public static void Configure(DbContextOptionsBuilder<pogoshiftDbContext> builder, DbConnection connection)
        {
            builder.UseSqlServer(connection);
        }
    }
}
