using Abp.Application.Services.Dto;
using Abp.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Mvc;
using pogoshift.Authorization;
using pogoshift.Controllers;
using pogoshift.Sessions;
using pogoshift.Users;
using pogoshift.Users.Dto;
using pogoshift.Web.Models.Users;
using System.Threading.Tasks;

namespace pogoshift.Web.Controllers
{
    public class UsersController : pogoshiftControllerBase
    {
        private readonly UserAppService _userAppService;
        private readonly ISessionAppService _sessionAppService;

        public UsersController(UserAppService userAppService, ISessionAppService sessionAppService)
        {
            _userAppService = userAppService;
            _sessionAppService = sessionAppService;
        }

        [AbpMvcAuthorize(PermissionNames.Pages_Users)]
        public async Task<ActionResult> Index()
        {
            var roles = (await _userAppService.GetRoles()).Items;
            var model = new UserListViewModel
            {
                Roles = roles
            };
            return View(model);
        }

        [AbpMvcAuthorize(PermissionNames.Pages_Users)]
        public async Task<ActionResult> EditModal(long userId)
        {
            var user = await _userAppService.GetAsync(new EntityDto<long>(userId));
            var roles = (await _userAppService.GetRoles()).Items;
            var model = new EditUserModalViewModel
            {
                User = user,
                Roles = roles
            };
            return PartialView("_EditModal", model);
        }

        [AbpMvcAuthorize(PermissionNames.Pages_Users)]
        public ActionResult ChangePassword()
        {
            return View();
        }

        [AbpMvcAuthorize(PermissionNames.Users_UpdateSelf)]
        [HttpPost]
        public async Task<ActionResult> UpdateSelf(UserDto user)
        {
            user = await _userAppService.UpdateSelfAsync(user);

            return RedirectToAction("", "Account");
        }
    }
}
