using System.Text.Json;
using Draigara.Forge.Serialization;

namespace Draigara.Forge.State;

public sealed class ForgeStateStore(string stateDirectory, TimeSpan lockTimeout) : IForgeStateStore
{
    private readonly string statePath = Path.Combine(stateDirectory, "state.v1.json");
    private readonly string lockPath = Path.Combine(stateDirectory, "state.v1.lock");
    private readonly string backupPath = Path.Combine(stateDirectory, "state.v1.json.bak");

    public async Task<ForgeState> LoadAsync(CancellationToken cancellationToken)
    {
        await using var stateLock = await AcquireLockAsync(cancellationToken).ConfigureAwait(false);
        return await LoadUnlockedAsync(cancellationToken).ConfigureAwait(false);
    }

    public async Task<ForgeState> CommitAsync(ForgeState state, long expectedRevision, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(state);
        await using var stateLock = await AcquireLockAsync(cancellationToken).ConfigureAwait(false);
        var current = await LoadUnlockedAsync(cancellationToken).ConfigureAwait(false);
        if (current.Revision != expectedRevision)
        {
            throw new ForgeStateConflictException($"Expected state revision {expectedRevision}, but found {current.Revision}.");
        }

        if (state.SchemaVersion != ForgeState.CurrentSchemaVersion)
        {
            throw new UnsupportedForgeStateSchemaException(state.SchemaVersion);
        }

        var committed = state with { Revision = checked(expectedRevision + 1) };
        await WriteAtomicallyAsync(committed, cancellationToken).ConfigureAwait(false);
        return committed;
    }

    private async Task<ForgeState> LoadUnlockedAsync(CancellationToken cancellationToken)
    {
        if (!File.Exists(statePath))
        {
            return ForgeState.Empty;
        }

        await using var stream = new FileStream(statePath, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, FileOptions.Asynchronous | FileOptions.SequentialScan);
        var state = await JsonSerializer.DeserializeAsync(stream, ForgeJsonContext.Default.ForgeState, cancellationToken).ConfigureAwait(false)
            ?? throw new JsonException("Forge state is empty.");
        if (state.SchemaVersion != ForgeState.CurrentSchemaVersion)
        {
            throw new UnsupportedForgeStateSchemaException(state.SchemaVersion);
        }

        return state;
    }

    private async Task WriteAtomicallyAsync(ForgeState state, CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(stateDirectory);
        var temporaryPath = Path.Combine(stateDirectory, $".{Path.GetFileName(statePath)}.{Guid.NewGuid():N}.tmp");
        try
        {
            await using (var stream = new FileStream(temporaryPath, FileMode.CreateNew, FileAccess.Write, FileShare.None, 4096, FileOptions.Asynchronous | FileOptions.WriteThrough))
            {
                await JsonSerializer.SerializeAsync(stream, state, ForgeJsonContext.Default.ForgeState, cancellationToken).ConfigureAwait(false);
                await stream.FlushAsync(cancellationToken).ConfigureAwait(false);
                stream.Flush(flushToDisk: true);
            }

            if (File.Exists(statePath))
            {
                File.Copy(statePath, backupPath, overwrite: true);
            }

            File.Move(temporaryPath, statePath, overwrite: true);
        }
        finally
        {
            if (File.Exists(temporaryPath))
            {
                File.Delete(temporaryPath);
            }
        }
    }

    private async Task<FileStream> AcquireLockAsync(CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(stateDirectory);
        var deadline = DateTime.UtcNow + lockTimeout;
        while (true)
        {
            cancellationToken.ThrowIfCancellationRequested();
            try
            {
                return new FileStream(lockPath, FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.None, 1, FileOptions.Asynchronous);
            }
            catch (IOException exception)
            {
                if (DateTime.UtcNow >= deadline)
                {
                    throw new ForgeStateLockTimeoutException(lockPath, exception);
                }

                await Task.Delay(TimeSpan.FromMilliseconds(50), cancellationToken).ConfigureAwait(false);
            }
        }
    }
}
