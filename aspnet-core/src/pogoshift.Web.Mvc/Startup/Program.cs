using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using pogoshift.Authorization.Users;
using pogoshift.Availabilities;
using pogoshift.Availabilities.Dto;
using pogoshift.Shifts;
using pogoshift.Shifts.Dto;
using pogoshift.Users.Dto;
using System;
using System.IO;
using System.Text.Json;


namespace pogoshift.Web.Startup
{
    public class Program
    {
        public static void Main(string[] args)
        {
            BuildWebHost(args).Run();
        }

        public static void BuildJavaScriptModel<ModelType, DtoType>() where DtoType : new()
        {
            Type modelType = typeof(ModelType);
            Type dtoType = typeof(DtoType);
            DtoType defaultObject = new DtoType();

            var props = dtoType.GetProperties();
            var serialized = JsonSerializer.Serialize(defaultObject, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            });

            var fileText = $"// NOTE: This code is auto-generated. Do not modify.{Environment.NewLine}{Environment.NewLine}";
            fileText += $"import {{ Model }} from '../model.js';{Environment.NewLine}";
            fileText += $"import {{ stringToDate, dateToString }} from '../utilities.js';{Environment.NewLine}{Environment.NewLine}";
            fileText += $"export class {modelType.Name} extends Model {{{Environment.NewLine}{Environment.NewLine}";

            fileText += $"\tconstructor( options = {serialized} ){{{Environment.NewLine}";
            fileText += $"\t\tsuper( options );{Environment.NewLine}";
            fileText += $"\t}}{Environment.NewLine}";

            fileText += $"\tbackToFront(){{{Environment.NewLine}";

            foreach (var prop in props)
            {
                var camelCased = char.ToLower(prop.Name[0]) + prop.Name.Substring(1);
                if (prop.PropertyType == typeof(DateTime) || prop.PropertyType == typeof(DateTimeOffset))
                {
                    fileText += $"\t\tthis.{camelCased} = '{camelCased}' in this ? stringToDate(this.{camelCased}) : null;{Environment.NewLine}";
                }
            }

            fileText += $"\t}}{Environment.NewLine}";

            fileText += $"\tfrontToBack(){{{Environment.NewLine}";

            foreach (var prop in props)
            {
                var camelCased = char.ToLower(prop.Name[0]) + prop.Name.Substring(1);
                if (prop.PropertyType == typeof(DateTime) || prop.PropertyType == typeof(DateTimeOffset))
                {
                    fileText += $"\t\tthis.{camelCased} = '{camelCased}' in this ? dateToString(this.{camelCased}) : null;{Environment.NewLine}";
                }
            }

            fileText += $"\t}}{Environment.NewLine}";

            fileText += $"}}";


            string path = @$"{Environment.CurrentDirectory}\wwwroot\js\models\{modelType.Name}.js";

            File.WriteAllText(path, fileText);
        }

        public static IWebHost BuildWebHost(string[] args)
        {
            // Delete old JavaScript Models
            DirectoryInfo di = new DirectoryInfo(@$"{Environment.CurrentDirectory}\wwwroot\js\models\");

            foreach (FileInfo file in di.GetFiles())
            {
                file.Delete();
            }

            // Generate new JavaScript Models
            BuildJavaScriptModel<User, UserDto>();
            BuildJavaScriptModel<Availability, AvailabilityDto>();
            BuildJavaScriptModel<Shift, ShiftDto>();


            return WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .Build();
        }
    }
}
