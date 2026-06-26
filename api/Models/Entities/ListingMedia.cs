using System.ComponentModel.DataAnnotations;
using Models.Enums;
using Models.Interfaces;

namespace Models.Entities;

public class ListingMedia : IEntity
{
    [Key]
    public Guid Id { get; set; }

    public Guid ListingId { get; set; }

    public Listing? Listing { get; set; }

    public MediaType Type { get; set; }

    /// <summary>
    /// Object key in the storage bucket.
    /// </summary>
    [MaxLength(500)]
    public string StorageKey { get; set; } = string.Empty;

    public int Order { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
