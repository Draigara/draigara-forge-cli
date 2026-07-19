using System.Text;
using Draigara.Forge.State;
using Xunit;

namespace Draigara.Forge.Cli.Tests.State;

public sealed class ForgeStateStoreTests : IDisposable
{
    private readonly string directory = Path.Combine(Path.GetTempPath(), "forge-state-tests", Guid.NewGuid().ToString("N"));

    [Fact]
    public async Task LoadAsync_returns_empty_v1_state_when_file_is_missing()
    {
        var store = CreateStore();

        var state = await store.LoadAsync(CancellationToken.None);

        Assert.Equal(1, state.SchemaVersion);
        Assert.Equal(0, state.Revision);
        Assert.Empty(state.ManagedMarketplaces);
        Assert.Null(state.LastSuccessfulInitializationUtc);
    }

    [Fact]
    public async Task CommitAsync_round_trips_state_and_increments_revision()
    {
        var store = CreateStore();
        var state = ForgeState.Empty with
        {
            ManagedMarketplaces =
            [
                new ManagedMarketplace("draigara-open", "https://example.test/open", DateTimeOffset.Parse("2026-07-19T12:00:00Z"), "0.1.0", "0.26.0"),
            ],
        };

        var committed = await store.CommitAsync(state, expectedRevision: 0, CancellationToken.None);
        var loaded = await store.LoadAsync(CancellationToken.None);

        Assert.Equal(1, committed.Revision);
        Assert.Equal(committed.SchemaVersion, loaded.SchemaVersion);
        Assert.Equal(committed.Revision, loaded.Revision);
        Assert.Equal(committed.ManagedMarketplaces, loaded.ManagedMarketplaces);
        Assert.Equal(committed.LastSuccessfulInitializationUtc, loaded.LastSuccessfulInitializationUtc);
        Assert.True(File.Exists(Path.Combine(directory, "state.v1.json")));
        var repositoryRoot = Directory.GetParent(AppContext.BaseDirectory)!.Parent!.Parent!.Parent!.Parent!.Parent!.FullName;
        var golden = await File.ReadAllTextAsync(
            Path.Combine(repositoryRoot, "fixtures", "state", "state.v1.json"),
            TestContext.Current.CancellationToken);
        var actual = await File.ReadAllTextAsync(
            Path.Combine(directory, "state.v1.json"),
            TestContext.Current.CancellationToken);
        Assert.Equal(
            golden.ReplaceLineEndings("\n").TrimEnd('\n'),
            actual.ReplaceLineEndings("\n").TrimEnd('\n'));
    }

    [Fact]
    public async Task CommitAsync_rejects_a_stale_revision()
    {
        var store = CreateStore();
        await store.CommitAsync(ForgeState.Empty, expectedRevision: 0, CancellationToken.None);

        await Assert.ThrowsAsync<ForgeStateConflictException>(() =>
            store.CommitAsync(ForgeState.Empty, expectedRevision: 0, CancellationToken.None));
    }

    [Fact]
    public async Task LoadAsync_rejects_future_schema_without_rewriting_it()
    {
        Directory.CreateDirectory(directory);
        var path = Path.Combine(directory, "state.v1.json");
        const string future = "{\"schemaVersion\":2,\"revision\":7,\"managedMarketplaces\":[]}";
        await File.WriteAllTextAsync(path, future, Encoding.UTF8, TestContext.Current.CancellationToken);
        var store = CreateStore();

        await Assert.ThrowsAsync<UnsupportedForgeStateSchemaException>(() => store.LoadAsync(CancellationToken.None));

        Assert.Equal(future, await File.ReadAllTextAsync(path, Encoding.UTF8, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task LoadAsync_fails_after_a_bounded_wait_when_state_is_locked()
    {
        Directory.CreateDirectory(directory);
        await using var heldLock = new FileStream(
            Path.Combine(directory, "state.v1.lock"),
            FileMode.OpenOrCreate,
            FileAccess.ReadWrite,
            FileShare.None);
        var store = new ForgeStateStore(directory, TimeSpan.FromMilliseconds(100));

        await Assert.ThrowsAsync<ForgeStateLockTimeoutException>(() => store.LoadAsync(TestContext.Current.CancellationToken));
    }

    public void Dispose()
    {
        if (Directory.Exists(directory))
        {
            Directory.Delete(directory, recursive: true);
        }
    }

    private ForgeStateStore CreateStore() => new(directory, TimeSpan.FromSeconds(2));
}
