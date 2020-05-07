using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using pogoshift.Users.Dto;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace pogoshift.Availabilities.Dto
{
    [AutoMapFrom(typeof(Availability))]
    [AutoMapTo(typeof(Availability))]
    public class AvailabilityDto : EntityDto<int>
    {
        public DateTime Beginning { get; set; }
        public DateTime Ending { get; set; }

        [ForeignKey(nameof(UserId))]
        public UserDto User { get; set; }
        public long UserId { get; set; }
    }
}
