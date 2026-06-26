namespace Logic.Attributes;

/// <summary>
/// Marks a <c>GlobalConfigModel</c> property as backed by a global config row, mapping it to a
/// storage key and controlling whether it is publicly exposed or read-only (computed).
/// </summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class GlobalConfigColAttribute : Attribute
{
    /// <summary>The key used for the underlying <c>GlobalConfig</c> row.</summary>
    public required string Name { get; set; }

    /// <summary>Whether the value is exposed through the anonymous public endpoint.</summary>
    public bool Public { get; set; }

    /// <summary>Whether the value is computed and therefore never persisted/updated.</summary>
    public bool ReadOnly { get; set; }
}
