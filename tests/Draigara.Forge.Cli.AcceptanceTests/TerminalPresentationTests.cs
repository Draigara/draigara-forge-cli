using System.Diagnostics;
using Xunit;

namespace Draigara.Forge.Cli.AcceptanceTests;

public sealed class TerminalPresentationTests
{
    [Fact]
    public async Task Redirected_help_is_plain_branded_and_uses_public_executable_name()
    {
        var result = await RunForgeAsync("--help");

        Assert.Equal(0, result.ExitCode);
        Assert.StartsWith("Draigara Forge ", result.StandardOutput, StringComparison.Ordinal);
        Assert.Equal(1, CountOccurrences(result.StandardOutput, "Draigara Forge "));
        Assert.Contains("Usage:", result.StandardOutput, StringComparison.Ordinal);
        Assert.Contains("forge", result.StandardOutput, StringComparison.Ordinal);
        Assert.DoesNotContain("Draigara.Forge.Cli", result.StandardOutput, StringComparison.Ordinal);
        Assert.DoesNotContain('\u001b', result.StandardOutput);
    }

    [Fact]
    public async Task Version_is_exactly_one_plain_line()
    {
        var result = await RunForgeAsync("--version");

        Assert.Equal(0, result.ExitCode);
        Assert.Single(result.StandardOutput.Split(Environment.NewLine, StringSplitOptions.RemoveEmptyEntries));
        Assert.StartsWith("Draigara Forge ", result.StandardOutput, StringComparison.Ordinal);
        Assert.DoesNotContain('\u001b', result.StandardOutput);
    }

    [Fact]
    public async Task Redirected_subcommand_help_has_no_brand_header()
    {
        var result = await RunForgeAsync("marketplace", "list", "--help");

        Assert.Equal(0, result.ExitCode);
        Assert.DoesNotContain("Draigara Forge ", result.StandardOutput, StringComparison.Ordinal);
        Assert.Contains("Usage:", result.StandardOutput, StringComparison.Ordinal);
        Assert.DoesNotContain('\u001b', result.StandardOutput);
    }

    private static async Task<ProcessResult> RunForgeAsync(params string[] arguments)
    {
        var assemblyPath = typeof(Draigara.Forge.Commands.ForgeCliApp).Assembly.Location;
        var startInfo = new ProcessStartInfo("dotnet")
        {
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
        };
        startInfo.ArgumentList.Add(assemblyPath);
        foreach (var argument in arguments)
        {
            startInfo.ArgumentList.Add(argument);
        }

        using var process = Process.Start(startInfo) ?? throw new InvalidOperationException("Failed to start Forge.");
        var output = process.StandardOutput.ReadToEndAsync(TestContext.Current.CancellationToken);
        var error = process.StandardError.ReadToEndAsync(TestContext.Current.CancellationToken);
        await process.WaitForExitAsync(TestContext.Current.CancellationToken);
        return new ProcessResult(process.ExitCode, await output, await error);
    }

    private static int CountOccurrences(string value, string match) =>
        (value.Length - value.Replace(match, string.Empty, StringComparison.Ordinal).Length) / match.Length;

    private sealed record ProcessResult(int ExitCode, string StandardOutput, string StandardError);
}
