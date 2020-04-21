using Abp.AspNetCore.Mvc.Views;
using Abp.Runtime.Session;
using Microsoft.AspNetCore.Mvc.Razor.Internal;

namespace pogoshift.Web.Views
{
    public abstract class pogoshiftRazorPage<TModel> : AbpRazorPage<TModel>
    {
        [RazorInject]
        public IAbpSession AbpSession { get; set; }

        protected pogoshiftRazorPage()
        {
            LocalizationSourceName = pogoshiftConsts.LocalizationSourceName;
        }
    }
}
