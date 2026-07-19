namespace Draigara.Forge.State;

public sealed record ForgeState(
    int SchemaVersion,
    long Revision,
    IReadOnlyList<ManagedMarketplace> ManagedMarketplaces,
    DateTimeOffset? LastSuccessfulInitializationUtc)
{
    public const int CurrentSchemaVersion = 1;

    public static ForgeState Empty { get; } = new(CurrentSchemaVersion, 0, [], null);
}

public sealed record ManagedMarketplace(
    string Id,
    string Source,
    DateTimeOffset AddedUtc,
    string ForgeVersion,
    string ApmVersion);
