using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using System;

namespace pogoshift.Breaks.Dto
{
    [AutoMapFrom(typeof(Break))]
    [AutoMapTo(typeof(Break))]
    public class BreakDto : EntityDto<int>
    {
        public DateTime Beginning { get; set; }
        public DateTime Ending { get; set; }

        public int ShiftId { get; set; }
    }
}
