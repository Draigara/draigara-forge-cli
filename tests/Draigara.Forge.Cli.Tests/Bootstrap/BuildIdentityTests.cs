using Draigara.Forge.Bootstrap;
using Xunit;

namespace Draigara.Forge.Cli.Tests.Bootstrap;

public sealed class BuildIdentityTests
{
    [Fact]
    public void Product_display_name_is_Draigara_Forge()
    {
        Assert.Equal("Draigara Forge", BuildIdentity.ProductDisplayName);
    }

    [Fact]
    public void Current_has_local_channel_for_local_builds()
    {
        Assert.Equal("local", BuildIdentity.Current.Channel);
        Assert.NotEmpty(BuildIdentity.Current.Version);
        Assert.NotEmpty(BuildIdentity.Current.Commit);
    }

    [Fact]
    public void Display_includes_version_channel_commit_and_rid()
    {
        var identity = new BuildIdentity("1.2.3", "preview", "abc123", "linux-x64");

        Assert.StartsWith("Draigara Forge", identity.Display, StringComparison.Ordinal);
        Assert.Equal("Draigara Forge 1.2.3 (preview, abc123, linux-x64)", identity.Display);
    }
}
