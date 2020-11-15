using Abp.Domain.Entities;
using System;

namespace pogoshift.Breaks
{
    public class Break : Entity<int>, IMustHaveTenant
    {
        public int TenantId { get; set; }
        public DateTime Beginning { get; set; }
        public DateTime Ending { get; set; }

        public int ShiftId { get; set; }
    }
}
