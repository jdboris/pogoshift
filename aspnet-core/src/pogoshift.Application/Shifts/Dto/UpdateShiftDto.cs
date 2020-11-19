using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using System;

namespace pogoshift.Shifts.Dto
{
    [AutoMapFrom(typeof(Shift))]
    [AutoMapTo(typeof(Shift))]
    public class UpdateShiftDto : EntityDto<int>
    {
        public DateTime Date { get; set; }
        public DateTime Beginning { get; set; }
        public DateTime Ending { get; set; }

        public String Note { get; set; }
    }
}
