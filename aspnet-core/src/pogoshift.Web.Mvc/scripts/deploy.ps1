# NOTE: Run the following in VS Code

$connectionString = "Server=tcp:pogoshiftdb.database.windows.net,1433;Initial Catalog=pogoshiftdb;Persist Security Info=False;User ID=joe;Password=MT86!siCZ85U;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

# Build Migrator
dotnet publish -c Release -o ".\dist\Migrator" -r "win-x64" /p:PublishSingleFile=true "aspnet-core\src\pogoshift.Migrator"


# Set up migration
Copy-Item .\aspnet-core\src\pogoshift.Migrator\log4net.config .\dist\Migrator


# Run Migrator
Push-Location
Set-Location .\dist\Migrator
$env:ConnectionStrings__Default = $connectionString
.\pogoshift.Migrator.exe - q
Pop-Location

# Build mvc
dotnet publish -c Release -o ".\dist\Mvc" "aspnet-core\src\pogoshift.Web.Mvc"

Compress-Archive -Path ".\dist\Mvc\*" -DestinationPath ".\dist\Mvc.zip" -Force
$appService = "pogoshift"
$resourceGroup = "pogoshift"
az webapp deployment source config-zip --src ".\dist\Mvc.zip" -n $appService -g $resourceGroup

az webapp config appsettings set -g $resourceGroup -n $appService --settings ConnectionStrings__Default=$connectionString

$url = "https://www.pogoshift.com"
az webapp config appsettings set -g $resourceGroup -n $appService --settings App__ServerRootAddress=$url App__ClientRootAddress=$url App_CorsOrigins=$url
