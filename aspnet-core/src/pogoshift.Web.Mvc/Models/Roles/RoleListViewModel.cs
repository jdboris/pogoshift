using System.Collections.Generic;
using pogoshift.Roles.Dto;

namespace pogoshift.Web.Models.Roles
{
    public class RoleListViewModel
    {
        public IReadOnlyList<PermissionDto> Permissions { get; set; }
    }
}
