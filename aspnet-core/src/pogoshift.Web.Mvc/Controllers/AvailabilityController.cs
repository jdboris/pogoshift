using Abp.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Mvc;
using pogoshift.Controllers;
using pogoshift.Sessions;
using pogoshift.Web.Models.Availability;
using System.Threading.Tasks;

namespace pogoshift.Web.Controllers
{
    [AbpMvcAuthorize]
    public class AvailabilityController : pogoshiftControllerBase
    {
        private readonly ISessionAppService _sessionAppService;
        public AvailabilityController(ISessionAppService sessionAppService)
        {
            _sessionAppService = sessionAppService;
        }

        public async Task<IActionResult> Index()
        {
            //var user = await _userAppService.GetAsync(new EntityDto<long>(userId));
            var model = new AvailabilityViewModel
            {
                LoginInformations = await _sessionAppService.GetCurrentLoginInformations()
            };

            return View(model);
        }

    }
}
