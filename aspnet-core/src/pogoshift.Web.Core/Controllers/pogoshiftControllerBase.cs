using Abp.AspNetCore.Mvc.Controllers;
using Abp.IdentityFramework;
using Microsoft.AspNetCore.Identity;

namespace pogoshift.Controllers
{
    public abstract class pogoshiftControllerBase: AbpController
    {
        protected pogoshiftControllerBase()
        {
            LocalizationSourceName = pogoshiftConsts.LocalizationSourceName;
        }

        protected void CheckErrors(IdentityResult identityResult)
        {
            identityResult.CheckErrors(LocalizationManager);
        }
    }
}
