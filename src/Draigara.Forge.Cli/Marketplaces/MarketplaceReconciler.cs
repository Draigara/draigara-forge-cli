using Draigara.Forge.State;

namespace Draigara.Forge.Marketplaces;

public sealed record ApmMarketplace(string Id, string Source);

public enum MarketplaceRegistrationStatus
{
    Managed,
    Unmanaged,
    Missing,
    Conflicting,
}

public sealed record ReconciledMarketplace(
    string Id,
    string? RecordedSource,
    string? ActualSource,
    MarketplaceRegistrationStatus Status);

public static class MarketplaceReconciler
{
    public static IReadOnlyList<ReconciledMarketplace> Reconcile(
        IEnumerable<ManagedMarketplace> managedMarketplaces,
        IEnumerable<ApmMarketplace> actualMarketplaces)
    {
        ArgumentNullException.ThrowIfNull(managedMarketplaces);
        ArgumentNullException.ThrowIfNull(actualMarketplaces);

        var managed = managedMarketplaces.ToDictionary(item => item.Id, StringComparer.Ordinal);
        var actual = actualMarketplaces.ToDictionary(item => item.Id, StringComparer.Ordinal);
        var ids = managed.Keys.Concat(actual.Keys).Distinct(StringComparer.Ordinal).Order(StringComparer.Ordinal);
        var result = new List<ReconciledMarketplace>();

        foreach (var id in ids)
        {
            managed.TryGetValue(id, out var recorded);
            actual.TryGetValue(id, out var current);
            var status = (recorded, current) switch
            {
                (not null, null) => MarketplaceRegistrationStatus.Missing,
                (null, not null) => MarketplaceRegistrationStatus.Unmanaged,
                (not null, not null) when string.Equals(recorded.Source, current.Source, StringComparison.Ordinal) => MarketplaceRegistrationStatus.Managed,
                _ => MarketplaceRegistrationStatus.Conflicting,
            };

            result.Add(new ReconciledMarketplace(id, recorded?.Source, current?.Source, status));
        }

        return result;
    }
}
