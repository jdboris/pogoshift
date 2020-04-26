using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using pogoshift.Authorization.Users;
using pogoshift.Roles.Dto;
using System;
using System.Collections.Generic;

namespace pogoshift.Sessions.Dto
{
    [AutoMapFrom(typeof(User))]
    public class UserLoginInfoDto : EntityDto<long>
    {
        public string Name { get; set; }

        public string Surname { get; set; }

        public string UserName { get; set; }

        public string EmailAddress { get; set; }

        public DateTime BirthDate { get; set; }

        public string PhoneNumber { get; set; }

        public string AddressLine1 { get; set; }

        public string AddressLine2 { get; set; }

        public string PostalCode { get; set; }

        public string[] RoleNames { get; set; }

        public List<RoleDto> Roles { get; set; }
    }
}
