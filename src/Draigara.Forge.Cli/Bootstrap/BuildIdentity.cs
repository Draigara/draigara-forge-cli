using System.Runtime.InteropServices;

namespace Draigara.Forge.Bootstrap;

public sealed record BuildIdentity(string Version, string Channel, string Commit, string RuntimeIdentifier)
{
    public static BuildIdentity Current { get; } = new(
        Version: "0.1.0-local",
        Channel: "local",
        Commit: "unknown",
        RuntimeIdentifier: RuntimeInformation.RuntimeIdentifier);

    public string Display => $"forge {Version} ({Channel}, {Commit}, {RuntimeIdentifier})";
}
