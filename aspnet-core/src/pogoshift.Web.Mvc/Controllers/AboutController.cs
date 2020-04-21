using Microsoft.AspNetCore.Mvc;
using Abp.AspNetCore.Mvc.Authorization;
using pogoshift.Controllers;

namespace pogoshift.Web.Controllers
{
    [AbpMvcAuthorize]
    public class AboutController : pogoshiftControllerBase
    {
        public ActionResult Index()
        {
            return View();
        }
	}
}
