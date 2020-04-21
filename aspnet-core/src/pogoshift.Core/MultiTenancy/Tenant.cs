using Abp.MultiTenancy;
using pogoshift.Authorization.Users;

namespace pogoshift.MultiTenancy
{
    public class Tenant : AbpTenant<User>
    {
        public int StoreNumber { get; set; }
        public string PostalCode { get; set; }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public int DailyAssociateMinimum { get; set; }
        public int DailyManagerMinimum { get; set; }
        public string Description { get; set; }

        public Tenant()
        {
        }

        public Tenant(string tenancyName, string name)
            : base(tenancyName, name)
        {
        }
    }
}
