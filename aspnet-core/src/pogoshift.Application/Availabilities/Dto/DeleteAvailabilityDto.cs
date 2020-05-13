using Abp.Application.Services.Dto;
using Abp.AutoMapper;

namespace pogoshift.Availabilities.Dto
{
    [AutoMapFrom(typeof(Availability))]
    [AutoMapTo(typeof(Availability))]
    public class DeleteAvailabilityDto : EntityDto<int>
    {

    }
}
