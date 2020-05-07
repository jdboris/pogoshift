using Abp.Domain.Entities;
using System;

namespace pogoshift.StoreHours
{
    public class StoreHours : Entity<int>, IMustHaveTenant
    {
        public int TenantId { get; set; }

        public DateTime Beginning { get; set; }
        public DateTime Ending { get; set; }

    }
}
