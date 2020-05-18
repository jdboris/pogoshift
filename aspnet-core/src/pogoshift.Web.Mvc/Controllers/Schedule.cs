using Abp.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Mvc;
using pogoshift.Controllers;
using pogoshift.Sessions;
using pogoshift.Web.Models.Schedule;
using System.Threading.Tasks;

namespace pogoshift.Web.Controllers
{
    [AbpMvcAuthorize]
    public class ScheduleController : pogoshiftControllerBase
    {
        private readonly ISessionAppService _sessionAppService;
        public ScheduleController(ISessionAppService sessionAppService)
        {
            _sessionAppService = sessionAppService;
        }

        public async Task<IActionResult> Index()
        {
            //var user = await _userAppService.GetAsync(new EntityDto<long>(userId));
            var model = new ScheduleViewModel
            {
                LoginInformations = await _sessionAppService.GetCurrentLoginInformations()
            };

            return View(model);
        }

    }
}
