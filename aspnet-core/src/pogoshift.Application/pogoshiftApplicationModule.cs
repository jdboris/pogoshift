﻿using Abp.AutoMapper;
using Abp.Modules;
using Abp.Reflection.Extensions;
using pogoshift.Authorization;

namespace pogoshift
{
    [DependsOn(
        typeof(pogoshiftCoreModule), 
        typeof(AbpAutoMapperModule))]
    public class pogoshiftApplicationModule : AbpModule
    {
        public override void PreInitialize()
        {
            Configuration.Authorization.Providers.Add<pogoshiftAuthorizationProvider>();
        }

        public override void Initialize()
        {
            var thisAssembly = typeof(pogoshiftApplicationModule).GetAssembly();

            IocManager.RegisterAssemblyByConvention(thisAssembly);

            Configuration.Modules.AbpAutoMapper().Configurators.Add(
                // Scan the assembly for classes which inherit from AutoMapper.Profile
                cfg => cfg.AddMaps(thisAssembly)
            );
        }
    }
}
