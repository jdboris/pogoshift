using System.ComponentModel.DataAnnotations;

namespace pogoshift.Users.Dto
{
    public class ChangeUserLanguageDto
    {
        [Required]
        public string LanguageName { get; set; }
    }
}