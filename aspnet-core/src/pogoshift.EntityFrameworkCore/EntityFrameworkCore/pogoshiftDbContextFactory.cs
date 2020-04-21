using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using pogoshift.Configuration;
using pogoshift.Web;

namespace pogoshift.EntityFrameworkCore
{
    /* This class is needed to run "dotnet ef ..." commands from command line on development. Not used anywhere else */
    public class pogoshiftDbContextFactory : IDesignTimeDbContextFactory<pogoshiftDbContext>
    {
        public pogoshiftDbContext CreateDbContext(string[] args)
        {
            var builder = new DbContextOptionsBuilder<pogoshiftDbContext>();
            var configuration = AppConfigurations.Get(WebContentDirectoryFinder.CalculateContentRootFolder());

            pogoshiftDbContextConfigurer.Configure(builder, configuration.GetConnectionString(pogoshiftConsts.ConnectionStringName));

            return new pogoshiftDbContext(builder.Options);
        }
    }
}
