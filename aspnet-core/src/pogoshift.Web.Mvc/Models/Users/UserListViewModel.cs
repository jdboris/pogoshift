using System.Collections.Generic;
using pogoshift.Roles.Dto;

namespace pogoshift.Web.Models.Users
{
    public class UserListViewModel
    {
        public IReadOnlyList<RoleDto> Roles { get; set; }
    }
}
