using System.ComponentModel.DataAnnotations;
using Models.Enums;
using Models.Interfaces;

namespace Models.Entities;

public class Listing : IEntity
{
    [Key]
    public Guid Id { get; set; }

    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(300)]
    public string Location { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Price { get; set; } = string.Empty;

    /// <summary>
    /// Optional free-form tags (stored as a JSON array of strings in a jsonb column).
    /// </summary>
    public List<string> Tags { get; set; } = new();

    public ListingStatus Status { get; set; } = ListingStatus.Available;

    /// <summary>
    /// Set when the listing is marked as sold. Used to auto-expire to Unavailable after 7 days.
    /// </summary>
    public DateTimeOffset? SoldAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Guid OwnerId { get; set; }

    public User? Owner { get; set; }

    /// <summary>
    /// Ordered ids of the media files for this listing. Each id maps to an object in storage;
    /// the file's mime type and other info live as object metadata. Stored as a jsonb array.
    /// </summary>
    public List<Guid> MediaFileIds { get; set; } = new();
}
