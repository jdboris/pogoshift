
using Abp.Domain.Entities;
using pogoshift.Authorization.Users;
using pogoshift.Breaks;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace pogoshift.Shifts
{
    public class Shift : Entity<int>, IMustHaveTenant//, IHasUser
    {
        public int TenantId { get; set; }

        public DateTime Date { get; set; }
        public DateTime Beginning { get; set; }
        public DateTime Ending { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
        public long UserId { get; set; }

        public List<Break> Breaks { get; set; }
    }
}
