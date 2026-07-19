using Draigara.Forge.Processes;
using Xunit;

namespace Draigara.Forge.Cli.Tests.Processes;

public sealed class ProcessRunnerTests
{
    [Fact]
    public async Task RunAsync_captures_standard_output_separately()
    {
        var runner = new ProcessRunner();

        var result = await runner.RunAsync(
            new ProcessRequest("dotnet", ["--version"], Environment.CurrentDirectory, TimeSpan.FromSeconds(30)),
            CancellationToken.None);

        Assert.Equal(0, result.ExitCode);
        Assert.Matches(@"^10\.0\.\d+", result.StandardOutput.Trim());
        Assert.Empty(result.StandardError);
        Assert.False(result.TimedOut);
    }

    [Fact]
    public async Task RunAsync_honours_cancellation_before_start()
    {
        var runner = new ProcessRunner();
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => runner.RunAsync(
            new ProcessRequest("dotnet", ["--version"], Environment.CurrentDirectory, TimeSpan.FromSeconds(30)),
            cancellation.Token));
    }
}
