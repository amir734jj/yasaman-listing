namespace Api.Streaming;

/// <summary>
/// A read-only, forward-only stream wrapper that enforces a maximum number of bytes.
/// Lets us stream an upload straight to storage while still rejecting oversized files
/// without ever buffering the whole payload in memory.
/// </summary>
public sealed class LimitedStream : Stream
{
    private readonly Stream _inner;
    private readonly long _limit;
    private long _read;

    public LimitedStream(Stream inner, long limit)
    {
        _inner = inner;
        _limit = limit;
    }

    public override int Read(byte[] buffer, int offset, int count)
    {
        var read = _inner.Read(buffer, offset, count);
        Track(read);
        return read;
    }

    public override async ValueTask<int> ReadAsync(Memory<byte> buffer, CancellationToken cancellationToken = default)
    {
        var read = await _inner.ReadAsync(buffer, cancellationToken);
        Track(read);
        return read;
    }

    public override async Task<int> ReadAsync(byte[] buffer, int offset, int count, CancellationToken cancellationToken)
    {
        var read = await _inner.ReadAsync(buffer.AsMemory(offset, count), cancellationToken);
        Track(read);
        return read;
    }

    private void Track(int read)
    {
        _read += read;
        if (_read > _limit)
        {
            throw new InvalidOperationException($"File is too large. Maximum size is {_limit / (1024 * 1024)} MB.");
        }
    }

    public override bool CanRead => true;
    public override bool CanSeek => false;
    public override bool CanWrite => false;
    public override long Length => throw new NotSupportedException();
    public override long Position
    {
        get => _read;
        set => throw new NotSupportedException();
    }

    public override void Flush()
    {
    }

    public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();
    public override void SetLength(long value) => throw new NotSupportedException();
    public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();
}
