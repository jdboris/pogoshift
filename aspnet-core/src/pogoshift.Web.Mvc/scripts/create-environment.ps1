# NOTE: Run the following in VS Code

az login

$resourceGroup = "pogoshift"
$location = "southeastasia"

# Create Resource Group
az group create -l $location -n $resourceGroup

# Create database
$sqlServerName = "pogoshiftdb"
$username = "joe"
$password = "MT86!siCZ85U"
az sql server create -l $location -g $resourceGroup -n $sqlServerName -u $username -p $password

$sqlDbName = "pogoshiftdb"
az sql db create -g $resourceGroup -s $sqlServerName -n $sqlDbName -e GeneralPurpose -f Gen5 -c 2 --compute-model Serverless --auto-pause-delay 120 --backup-storage-redundancy Local

# Add a firewall rule to allow access from home
az sql server firewall-rule create -g $resourceGroup -s $sqlServerName -n "Home Access" --start-ip-address 208.102.74.104 --end-ip-address 208.102.74.104

# Add a firewall rules to allow access from your app
az sql server firewall-rule create -g $resourceGroup -s $sqlServerName -n "App Access" --start-ip-address 52.187.17.126 --end-ip-address 52.187.17.126
az sql server firewall-rule create -g $resourceGroup -s $sqlServerName -n "App Access 2" --start-ip-address 52.187.2.194 --end-ip-address 52.187.2.194
az sql server firewall-rule create -g $resourceGroup -s $sqlServerName -n "App Access 3" --start-ip-address 52.187.1.23 --end-ip-address 52.187.1.23
az sql server firewall-rule create -g $resourceGroup -s $sqlServerName -n "App Access 4" --start-ip-address 52.187.1.87 --end-ip-address 52.187.1.87
az sql server firewall-rule create -g $resourceGroup -s $sqlServerName -n "App Access 5" --start-ip-address 52.187.4.20 --end-ip-address 52.187.4.20
az sql server firewall-rule create -g $resourceGroup -s $sqlServerName -n "App Access 6" --start-ip-address 52.187.1.9 --end-ip-address 52.187.1.9
az sql server firewall-rule create -g $resourceGroup -s $sqlServerName -n "App Access 7" --start-ip-address 52.187.0.160 --end-ip-address 52.187.0.160

# Create app service
$appServicePlan = "pogoshiftplan"
az appservice plan create -n $appServicePlan -g $resourceGroup -l $location --sku Free

$appService = "pogoshift"
az webapp create -g $resourceGroup -p $appServicePlan -n $appService
