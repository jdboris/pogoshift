using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using pogoshift.Availabilities;
using pogoshift.Users.Dto;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace pogoshift.Shifts.Dto
{
    [AutoMapFrom(typeof(Shift))]
    [AutoMapTo(typeof(Shift))]
    public class ShiftDto : EntityDto<int>
    {
        public DateTime Beginning { get; set; }
        public DateTime Ending { get; set; }

        [ForeignKey(nameof(AvailabilityId))]
        public Availability? Availability { get; set; }
        public int AvailabilityId { get; set; }

        [ForeignKey(nameof(UserId))]
        public UserDto User { get; set; }
        public long UserId { get; set; }
    }
}
