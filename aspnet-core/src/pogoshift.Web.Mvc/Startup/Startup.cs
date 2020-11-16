using Abp.AspNetCore;
using Abp.AspNetCore.Mvc.Antiforgery;
using Abp.AspNetCore.SignalR.Hubs;
using Abp.Castle.Logging.Log4Net;
using Abp.Dependency;
using Abp.Json;
using Castle.Facilities.Logging;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Serialization;
using pogoshift.Authentication.JwtBearer;
using pogoshift.Configuration;
using pogoshift.Identity;
using pogoshift.Web.Resources;
using System;
using System.IO;

namespace pogoshift.Web.Startup
{
    public class Startup
    {
        private readonly IConfigurationRoot _appConfiguration;

        public Startup(IWebHostEnvironment env)
        {
            _appConfiguration = env.GetAppConfiguration();
        }

        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            // MVC
            services.AddControllersWithViews(
                    options =>
                    {
                        options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());
                        options.Filters.Add(new AbpAutoValidateAntiforgeryTokenAttribute());
                    }
                )
                .AddRazorRuntimeCompilation()
                .AddNewtonsoftJson(options =>
                {
                    options.SerializerSettings.ContractResolver = new AbpMvcContractResolver(IocManager.Instance)
                    {
                        NamingStrategy = new CamelCaseNamingStrategy()
                    };
                });

            IdentityRegistrar.Register(services);
            AuthConfigurer.Configure(services, _appConfiguration);

            services.AddScoped<IWebResourceManager, WebResourceManager>();

            services.AddSignalR();

            // Configure Abp and Dependency Injection
            return services.AddAbp<pogoshiftWebMvcModule>(
                // Configure Log4Net logging
                options => options.IocManager.IocContainer.AddFacility<LoggingFacility>(
                    f => f.UseAbpLog4Net().WithConfig("log4net.config")
                )
            );
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
        {
            // NOTE: Must put this BEFORE UseAbp for it to catch all static files
            app.UseStaticFiles(new StaticFileOptions()
            {
                OnPrepareResponse = (context) =>
                {
                    var filePath = context.File.PhysicalPath;
                    var slash = Path.DirectorySeparatorChar;
                    //// Disable caching for all static files.
                    //context.Context.Response.Headers["Cache-Control"] = _appConfiguration["StaticFiles:Headers:Cache-Control"];
                    //context.Context.Response.Headers["Pragma"] = _appConfiguration["StaticFiles:Headers:Pragma"];
                    //context.Context.Response.Headers["Expires"] = _appConfiguration["StaticFiles:Headers:Expires"];

                    if (filePath.Contains($"wwwroot{slash}js{slash}") ||
                        filePath.Contains($"wwwroot{slash}css{slash}") ||
                        filePath.Contains($"wwwroot{slash}view-resources{slash}"))
                    {
                        // Expire every 10 minutes
                        context.Context.Response.Headers["Cache-Control"] = "max-age=600, must-revalidate";
                        context.Context.Response.Headers["Expires"] = "600";
                    }
                }
            });

            app.UseAbp(); // Initializes ABP framework.

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
            }

            app.UseRouting();

            app.UseAuthentication();

            app.UseJwtTokenMiddleware();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHub<AbpCommonHub>("/signalr");
                endpoints.MapControllerRoute("default", "{controller=Home}/{action=Index}/{id?}");
                endpoints.MapControllerRoute("defaultWithArea", "{area}/{controller=Home}/{action=Index}/{id?}");
            });




        }
    }
}
