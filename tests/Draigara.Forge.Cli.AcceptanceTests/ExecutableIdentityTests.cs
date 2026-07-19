using System.Diagnostics;
using Xunit;

namespace Draigara.Forge.Cli.AcceptanceTests;

public sealed class ExecutableIdentityTests
{
    private static readonly TimeSpan PublishTimeout = TimeSpan.FromMinutes(2);

    [Fact]
    public async Task Publish_produces_the_public_forge_executable_name()
    {
        var repositoryRoot = FindRepositoryRoot();
        var publishDirectory = Path.Combine(Path.GetTempPath(), $"forge-identity-{Guid.NewGuid():N}");
        Process? process = null;

        try
        {
            var startInfo = new ProcessStartInfo("dotnet")
            {
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
            };
            startInfo.ArgumentList.Add("publish");
            startInfo.ArgumentList.Add(Path.Combine(repositoryRoot, "src", "Draigara.Forge.Cli", "Draigara.Forge.Cli.csproj"));
            startInfo.ArgumentList.Add("--no-restore");
            startInfo.ArgumentList.Add("-p:PublishAot=false");
            startInfo.ArgumentList.Add("-o");
            startInfo.ArgumentList.Add(publishDirectory);

            process = Process.Start(startInfo) ?? throw new InvalidOperationException("Failed to start dotnet publish.");
            using var cancellation = CancellationTokenSource.CreateLinkedTokenSource(TestContext.Current.CancellationToken);
            cancellation.CancelAfter(PublishTimeout);
            using var termination = cancellation.Token.Register(() => KillProcessTree(process));
            var standardOutput = process.StandardOutput.ReadToEndAsync(cancellation.Token);
            var standardError = process.StandardError.ReadToEndAsync(cancellation.Token);

            try
            {
                await process.WaitForExitAsync(cancellation.Token);
            }
            catch (OperationCanceledException)
            {
                KillProcessTree(process);
                await process.WaitForExitAsync(CancellationToken.None);
                throw;
            }

            Assert.True(process.ExitCode == 0, $"dotnet publish failed.{Environment.NewLine}{await standardOutput}{Environment.NewLine}{await standardError}");

            var executableName = OperatingSystem.IsWindows() ? "forge.exe" : "forge";
            var oldExecutableName = OperatingSystem.IsWindows() ? "Draigara.Forge.Cli.exe" : "Draigara.Forge.Cli";
            Assert.True(File.Exists(Path.Combine(publishDirectory, executableName)));
            Assert.False(File.Exists(Path.Combine(publishDirectory, oldExecutableName)));
        }
        finally
        {
            if (process is not null)
            {
                KillProcessTree(process);
                process.Dispose();
            }

            if (Directory.Exists(publishDirectory))
            {
                Directory.Delete(publishDirectory, recursive: true);
            }
        }
    }

    private static void KillProcessTree(Process process)
    {
        try
        {
            if (!process.HasExited)
            {
                process.Kill(entireProcessTree: true);
            }
        }
        catch (InvalidOperationException)
        {
            // The process exited between the state check and termination request.
        }
    }

    private static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Draigara.Forge.slnx")))
        {
            directory = directory.Parent;
        }

        return directory?.FullName ?? throw new InvalidOperationException("Could not find the repository root.");
    }
}
