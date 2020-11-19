using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using System;

namespace pogoshift.Availabilities.Dto
{
    [AutoMapFrom(typeof(Availability))]
    [AutoMapTo(typeof(Availability))]
    public class GetAllAvailabilityDto : EntityDto<int>
    {
        public DateTime Beginning { get; set; }
        public DateTime Ending { get; set; }
        public long UserId { get; set; }

        public String Note { get; set; }
    }
}
