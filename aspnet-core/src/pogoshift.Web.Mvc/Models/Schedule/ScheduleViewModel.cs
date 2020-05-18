using pogoshift.Sessions.Dto;
using System.Text.Json;

namespace pogoshift.Web.Models.Schedule
{
    public class ScheduleViewModel
    {
        public GetCurrentLoginInformationsOutput LoginInformations { get; set; }

        public string JsonSerialize<ObjectType>(ObjectType obj)
        {
            return JsonSerializer.Serialize(obj, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            });
        }
    }
}
