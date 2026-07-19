using Draigara.Forge.Bootstrap;
using Draigara.Forge.Commands;
using Draigara.Forge.Interaction;
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
        var interaction = new RecordingInteractionService(output);
        var app = new ForgeCliApp(identity, interaction);

        var exitCode = await app.RunAsync(["--version"], output, error, CancellationToken.None);

        Assert.Equal(0, exitCode);
        Assert.Equal($"{identity.Display}{Environment.NewLine}", output.ToString());
        Assert.Empty(error.ToString());
        Assert.Equal(0, interaction.BrandHeaderCount);
    }

    [Fact]
    public async Task Help_lists_global_options_and_v1_commands()
    {
        var output = new StringWriter();
        var interaction = new RecordingInteractionService(output);
        var app = new ForgeCliApp(BuildIdentity.Current, interaction);

        var exitCode = await app.RunAsync(["--help"], output, new StringWriter(), CancellationToken.None);

        Assert.Equal(0, exitCode);
        Assert.Contains("--non-interactive", output.ToString(), StringComparison.Ordinal);
        Assert.Contains("marketplace", output.ToString(), StringComparison.Ordinal);
        Assert.Contains("plugin", output.ToString(), StringComparison.Ordinal);
        Assert.Contains("doctor", output.ToString(), StringComparison.Ordinal);
        Assert.Contains("init", output.ToString(), StringComparison.Ordinal);
        Assert.Equal(1, interaction.BrandHeaderCount);
        Assert.StartsWith($"BRAND{Environment.NewLine}", output.ToString(), StringComparison.Ordinal);
        Assert.Contains("Usage:", output.ToString(), StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("--no-color", "--help")]
    [InlineData("--help", "--non-interactive")]
    [InlineData("--verbose", "-h", "--no-color")]
    public async Task Root_help_with_global_options_writes_brand_header(params string[] args)
    {
        var output = new StringWriter();
        var interaction = new RecordingInteractionService(output);
        var app = new ForgeCliApp(BuildIdentity.Current, interaction);

        var exitCode = await app.RunAsync(args, output, new StringWriter(), CancellationToken.None);

        Assert.Equal(0, exitCode);
        Assert.Equal(1, interaction.BrandHeaderCount);
        Assert.StartsWith($"BRAND{Environment.NewLine}", output.ToString(), StringComparison.Ordinal);
    }

    [Fact]
    public async Task Subcommand_help_does_not_write_brand_header()
    {
        var output = new StringWriter();
        var interaction = new RecordingInteractionService(output);
        var app = new ForgeCliApp(BuildIdentity.Current, interaction);

        var exitCode = await app.RunAsync(["marketplace", "list", "--help"], output, new StringWriter(), CancellationToken.None);

        Assert.Equal(0, exitCode);
        Assert.Equal(0, interaction.BrandHeaderCount);
        Assert.Contains("Usage:", output.ToString(), StringComparison.Ordinal);
    }

    private sealed class RecordingInteractionService(TextWriter output) : IInteractionService
    {
        public int BrandHeaderCount { get; private set; }

        public async Task WriteBrandHeaderAsync(CancellationToken cancellationToken)
        {
            BrandHeaderCount++;
            await output.WriteLineAsync("BRAND".AsMemory(), cancellationToken);
        }

        public Task WriteWelcomeAsync(CancellationToken cancellationToken) => Task.CompletedTask;

        public Task WriteInitializationSuccessAsync(CancellationToken cancellationToken) => Task.CompletedTask;

        public Task WriteMessageAsync(InteractionMessage message, CancellationToken cancellationToken) => Task.CompletedTask;

        public Task<bool> ConfirmAsync(string prompt, bool defaultValue, CancellationToken cancellationToken) => Task.FromResult(defaultValue);
    }
}
