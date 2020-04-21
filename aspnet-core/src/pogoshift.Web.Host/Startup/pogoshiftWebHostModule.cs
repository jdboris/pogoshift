using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Abp.Modules;
using Abp.Reflection.Extensions;
using pogoshift.Configuration;

namespace pogoshift.Web.Host.Startup
{
    [DependsOn(
       typeof(pogoshiftWebCoreModule))]
    public class pogoshiftWebHostModule: AbpModule
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfigurationRoot _appConfiguration;

        public pogoshiftWebHostModule(IWebHostEnvironment env)
        {
            _env = env;
            _appConfiguration = env.GetAppConfiguration();
        }

        public override void Initialize()
        {
            IocManager.RegisterAssemblyByConvention(typeof(pogoshiftWebHostModule).GetAssembly());
        }
    }
}
