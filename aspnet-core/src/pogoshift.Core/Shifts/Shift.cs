﻿using Abp.Domain.Entities;
using pogoshift.Authorization.Users;
using pogoshift.Availabilities;
using pogoshift.Filters;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace pogoshift.Shifts
{
    public class Shift : Entity<int>, IMustHaveTenant, IHasUser
    {
        public int TenantId { get; set; }

        public DateTime Date { get; set; }
        public DateTime Beginning { get; set; }
        public DateTime Ending { get; set; }

        [ForeignKey(nameof(AvailabilityId))]
        public Availability? Availability { get; set; }
        public int AvailabilityId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
        public long UserId { get; set; }
    }
}
