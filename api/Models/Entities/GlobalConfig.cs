using System.ComponentModel.DataAnnotations;
using Models.Interfaces;

namespace Models.Entities;

/// <summary>
/// A single global configuration entry stored as a key/value row. The strongly-typed
/// <c>GlobalConfigModel</c> projects these rows into named, typed settings.
/// </summary>
public class GlobalConfig : IEntity
{
    [Key]
    public Guid Id { get; set; }

    [MaxLength(256)]
    public string Key { get; set; } = string.Empty;

    public string Value { get; set; } = string.Empty;
}
