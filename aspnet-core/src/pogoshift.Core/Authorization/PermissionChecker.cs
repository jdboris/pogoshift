using Abp.Authorization;
using pogoshift.Authorization.Roles;
using pogoshift.Authorization.Users;

namespace pogoshift.Authorization
{
    public class PermissionChecker : PermissionChecker<Role, User>
    {
        public PermissionChecker(UserManager userManager)
            : base(userManager)
        {
        }
    }
}
