using Abp.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Mvc;
using pogoshift.Controllers;

namespace pogoshift.Web.Controllers
{
    [AbpMvcAuthorize]
    public class HomeController : pogoshiftControllerBase
    {
        public ActionResult Index()
        {
            return Redirect("Schedule");
        }
    }
}
