using System.Threading.Tasks;
using Abp.Authorization;
using Abp.Runtime.Session;
using pogoshift.Configuration.Dto;

namespace pogoshift.Configuration
{
    [AbpAuthorize]
    public class ConfigurationAppService : pogoshiftAppServiceBase, IConfigurationAppService
    {
        public async Task ChangeUiTheme(ChangeUiThemeInput input)
        {
            await SettingManager.ChangeSettingForUserAsync(AbpSession.ToUserIdentifier(), AppSettingNames.UiTheme, input.Theme);
        }
    }
}
