using Draigara.Forge.Marketplaces;
using Draigara.Forge.State;
using Xunit;

namespace Draigara.Forge.Cli.Tests.Marketplaces;

public sealed class MarketplaceReconcilerTests
{
    [Fact]
    public void Reconcile_labels_managed_unmanaged_missing_and_conflicting_registrations()
    {
        ManagedMarketplace[] managed =
        [
            Entry("managed", "https://example.test/managed"),
            Entry("missing", "https://example.test/missing"),
            Entry("conflict", "https://example.test/expected"),
        ];
        ApmMarketplace[] actual =
        [
            new("managed", "https://example.test/managed"),
            new("unmanaged", "https://example.test/unmanaged"),
            new("conflict", "https://example.test/actual"),
        ];

        var result = MarketplaceReconciler.Reconcile(managed, actual);

        Assert.Collection(
            result,
            item => Assert.Equal(("conflict", MarketplaceRegistrationStatus.Conflicting), (item.Id, item.Status)),
            item => Assert.Equal(("managed", MarketplaceRegistrationStatus.Managed), (item.Id, item.Status)),
            item => Assert.Equal(("missing", MarketplaceRegistrationStatus.Missing), (item.Id, item.Status)),
            item => Assert.Equal(("unmanaged", MarketplaceRegistrationStatus.Unmanaged), (item.Id, item.Status)));
    }

    private static ManagedMarketplace Entry(string id, string source) =>
        new(id, source, DateTimeOffset.UnixEpoch, "0.1.0", "0.26.0");
}
