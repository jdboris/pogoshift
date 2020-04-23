using Abp.Auditing;
using Abp.Authorization.Users;
using Abp.Extensions;
using pogoshift.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace pogoshift.Web.Models.Account
{
    public class RegisterViewModel : IValidatableObject
    {
        [Required]
        [StringLength(AbpUserBase.MaxUserNameLength)]
        public string UserName { get; set; }

        [StringLength(AbpUserBase.MaxPlainPasswordLength)]
        [DisableAuditing]
        public string Password { get; set; }

        [Required]
        [StringLength(AbpUserBase.MaxNameLength)]
        public string Name { get; set; }

        [Required]
        [StringLength(AbpUserBase.MaxSurnameLength)]
        public string Surname { get; set; }

        [Required]
        public DateTime BirthDate { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(AbpUserBase.MaxEmailAddressLength)]
        public string EmailAddress { get; set; }

        [Required]
        [Phone]
        [StringLength(AbpUserBase.MaxPhoneNumberLength)]
        public string PhoneNumber { get; set; }

        [Required]
        [StringLength(255)]
        public string AddressLine1 { get; set; }

        [Required]
        [StringLength(255)]
        public string AddressLine2 { get; set; }

        [Required]
        [StringLength(255)]
        public string PostalCode { get; set; }

        public bool IsExternalLogin { get; set; }

        public string ExternalLoginAuthSchema { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (!UserName.IsNullOrEmpty())
            {
                if (!UserName.Equals(EmailAddress) && ValidationHelper.IsEmail(UserName))
                {
                    yield return new ValidationResult("Username cannot be an email address unless it's the same as your email address!");
                }
            }
        }
    }
}
