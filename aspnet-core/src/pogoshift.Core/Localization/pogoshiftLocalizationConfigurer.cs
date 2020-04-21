using Abp.Configuration.Startup;
using Abp.Localization.Dictionaries;
using Abp.Localization.Dictionaries.Xml;
using Abp.Reflection.Extensions;

namespace pogoshift.Localization
{
    public static class pogoshiftLocalizationConfigurer
    {
        public static void Configure(ILocalizationConfiguration localizationConfiguration)
        {
            localizationConfiguration.Sources.Add(
                new DictionaryBasedLocalizationSource(pogoshiftConsts.LocalizationSourceName,
                    new XmlEmbeddedFileLocalizationDictionaryProvider(
                        typeof(pogoshiftLocalizationConfigurer).GetAssembly(),
                        "pogoshift.Localization.SourceFiles"
                    )
                )
            );
        }
    }
}
