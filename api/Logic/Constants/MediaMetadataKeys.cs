namespace Logic.Constants;

/// <summary>
/// Keys used for the S3 object metadata attached to uploaded media files.
/// </summary>
public static class MediaMetadataKeys
{
    public const string ListingId = "listing-id";
    public const string ListingName = "listing-name";
    public const string OwnerId = "owner-id";
    public const string UploadedBy = "uploaded-by";
    public const string UploadedAt = "uploaded-at";
    public const string ContentType = "content-type";
    public const string OriginalFilename = "original-filename";
}
