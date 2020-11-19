using Abp.Domain.Entities;
using pogoshift.Authorization.Users;
using pogoshift.Filters;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace pogoshift.Availabilities
{
    public class Availability : Entity<int>, IMustHaveTenant, IHasUser
    {
        public int TenantId { get; set; }
        public DateTime Beginning { get; set; }
        public DateTime Ending { get; set; }


        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
        public long UserId { get; set; }
        public String Note { get; set; }
    }
}
