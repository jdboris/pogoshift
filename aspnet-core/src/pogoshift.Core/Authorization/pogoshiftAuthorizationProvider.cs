using Abp.Authorization;
using Abp.Localization;
using Abp.MultiTenancy;

namespace pogoshift.Authorization
{
    public class pogoshiftAuthorizationProvider : AuthorizationProvider
    {
        public override void SetPermissions(IPermissionDefinitionContext context)
        {
            context.CreatePermission(PermissionNames.Pages_Users, L("Users"));
            context.CreatePermission(PermissionNames.Pages_Roles, L("Roles"));
            context.CreatePermission(PermissionNames.Pages_Tenants, L("Tenants"), multiTenancySides: MultiTenancySides.Host);
            context.CreatePermission(PermissionNames.Users_UpdateSelf, L("Update Self"));
            context.CreatePermission(PermissionNames.HasUser_CrudAll, L("CRUD All Entities with Users"));
            context.CreatePermission(PermissionNames.Shifts_CrudAll, L("CRUD All Shifts"));
            context.CreatePermission(PermissionNames.Shifts_ReadAll, L("Read All Shifts"));
            context.CreatePermission(PermissionNames.Users_CrudAdmins, L("CRUD Admins"));
        }

        private static ILocalizableString L(string name)
        {
            return new LocalizableString(name, pogoshiftConsts.LocalizationSourceName);
        }
    }
}
