using System.Threading.Tasks;
using pogoshift.Configuration.Dto;

namespace pogoshift.Configuration
{
    public interface IConfigurationAppService
    {
        Task ChangeUiTheme(ChangeUiThemeInput input);
    }
}
