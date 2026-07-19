using Draigara.Forge.Bootstrap;
using Draigara.Forge.Commands;
using Xunit;

namespace Draigara.Forge.Cli.Tests.Commands;

public sealed class ForgeCliAppTests
{
    [Fact]
    public async Task Version_writes_build_identity_to_standard_output()
    {
        var output = new StringWriter();
        var error = new StringWriter();
        var identity = new BuildIdentity("1.2.3", "preview", "abc123", "linux-x64");
        var app = new ForgeCliApp(identity);

        var exitCode = await app.RunAsync(["--version"], output, error, CancellationToken.None);

        Assert.Equal(0, exitCode);
        Assert.Equal($"{identity.Display}{Environment.NewLine}", output.ToString());
        Assert.Empty(error.ToString());
    }

    [Fact]
    public async Task Help_lists_global_options_and_v1_commands()
    {
        var output = new StringWriter();
        var app = new ForgeCliApp(BuildIdentity.Current);

        var exitCode = await app.RunAsync(["--help"], output, new StringWriter(), CancellationToken.None);

        Assert.Equal(0, exitCode);
        Assert.Contains("--non-interactive", output.ToString(), StringComparison.Ordinal);
        Assert.Contains("marketplace", output.ToString(), StringComparison.Ordinal);
        Assert.Contains("plugin", output.ToString(), StringComparison.Ordinal);
        Assert.Contains("doctor", output.ToString(), StringComparison.Ordinal);
        Assert.Contains("init", output.ToString(), StringComparison.Ordinal);
    }
}
