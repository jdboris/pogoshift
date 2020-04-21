using Abp.AspNetCore.Mvc.ViewComponents;

namespace pogoshift.Web.Views
{
    public abstract class pogoshiftViewComponent : AbpViewComponent
    {
        protected pogoshiftViewComponent()
        {
            LocalizationSourceName = pogoshiftConsts.LocalizationSourceName;
        }
    }
}
