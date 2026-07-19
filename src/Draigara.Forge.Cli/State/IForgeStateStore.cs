namespace Draigara.Forge.State;

public interface IForgeStateStore
{
    Task<ForgeState> LoadAsync(CancellationToken cancellationToken);

    Task<ForgeState> CommitAsync(ForgeState state, long expectedRevision, CancellationToken cancellationToken);
}

public sealed class ForgeStateConflictException(string message) : Exception(message);

public sealed class ForgeStateLockTimeoutException(string lockFilePath, Exception innerException)
    : Exception($"Timed out waiting for the Forge state lock '{lockFilePath}'.", innerException);

public sealed class UnsupportedForgeStateSchemaException(int schemaVersion)
    : Exception($"Forge state schema version {schemaVersion} is not supported.");
