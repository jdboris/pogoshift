using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using pogoshift.Authorization.Users;
using pogoshift.Availabilities;
using pogoshift.Availabilities.Dto;
using pogoshift.Shifts;
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

        public static void BuildJavaScriptModel<ModelType>(ModelType defaultObject)
        {
            Type type = typeof(ModelType);
            var props = type.GetProperties();
            var serialized = JsonSerializer.Serialize(defaultObject, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            });

            var fileText = $"// NOTE: This code is auto-generated. Do not modify.{Environment.NewLine}{Environment.NewLine}";
            fileText += $"import {{ Model }} from '../model.js';{Environment.NewLine}{Environment.NewLine}";
            fileText += $"export class {type.Name} extends Model {{{Environment.NewLine}{Environment.NewLine}";

            fileText += $"\tconstructor( options = {serialized} ){{{Environment.NewLine}";
            fileText += $"\t\tsuper( options );{Environment.NewLine}";

            /*
            foreach (var prop in props)
            {
                var camelCased = char.ToLower(prop.Name[0]) + prop.Name.Substring(1);
                fileText += $"\t\tthis.{camelCased} = options.{camelCased};{Environment.NewLine}";
            }
            */

            fileText += $"\t}}{Environment.NewLine}}}";


            string path = @$"{Environment.CurrentDirectory}\wwwroot\js\models\{type.Name}.js";

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
            BuildJavaScriptModel(new User());
            BuildJavaScriptModel(new Availability());
            BuildJavaScriptModel(new UpdateAvailabilityDto());
            BuildJavaScriptModel(new Shift());


            return WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .Build();
        }
    }
}
