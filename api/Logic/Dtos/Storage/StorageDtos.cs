namespace Logic.Dtos.Storage;

public class UploadFileRequest
{
    public Stream Content { get; set; } = Stream.Null;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
}

public class UploadedFile
{
    public string StorageKey { get; set; } = string.Empty;
}

public class StorageObject
{
    public Stream Content { get; set; } = Stream.Null;
    public string ContentType { get; set; } = "application/octet-stream";
}
