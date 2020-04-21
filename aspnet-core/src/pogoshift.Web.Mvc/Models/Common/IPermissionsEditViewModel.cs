using System.Collections.Generic;
using pogoshift.Roles.Dto;

namespace pogoshift.Web.Models.Common
{
    public interface IPermissionsEditViewModel
    {
        List<FlatPermissionDto> Permissions { get; set; }
    }
}