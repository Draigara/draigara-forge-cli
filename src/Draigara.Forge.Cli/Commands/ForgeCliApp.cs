using Draigara.Forge.Bootstrap;
using Draigara.Forge.Interaction;
using System.CommandLine;

namespace Draigara.Forge.Commands;

public sealed class ForgeCliApp(BuildIdentity buildIdentity, IInteractionService interactionService)
{
    public async Task<int> RunAsync(
        string[] args,
        TextWriter output,
        TextWriter error,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(args);
        ArgumentNullException.ThrowIfNull(output);
        ArgumentNullException.ThrowIfNull(error);

        if (args.Contains("--version", StringComparer.Ordinal))
        {
            await output.WriteLineAsync(buildIdentity.Display).ConfigureAwait(false);
            return 0;
        }

        if (IsRootHelp(args))
        {
            await interactionService.WriteBrandHeaderAsync(cancellationToken).ConfigureAwait(false);
        }

        var root = CreateRootCommand();
        var configuration = new InvocationConfiguration
        {
            Output = output,
            Error = error,
            EnableDefaultExceptionHandler = false,
            ProcessTerminationTimeout = TimeSpan.FromSeconds(5),
        };

        return await root.Parse(args).InvokeAsync(configuration, cancellationToken).ConfigureAwait(false);
    }

    private static bool IsRootHelp(string[] args)
    {
        var hasHelpOption = false;

        foreach (var argument in args)
        {
            if (argument is "--help" or "-h" or "-?")
            {
                hasHelpOption = true;
                continue;
            }

            if (argument is not ("--non-interactive" or "--verbose" or "--no-color"))
            {
                return false;
            }
        }

        return hasHelpOption;
    }

    private static RootCommand CreateRootCommand()
    {
        var root = new RootCommand("Onboard coding hosts to Microsoft APM with Draigara Forge.");
        root.Options.Add(new Option<bool>("--non-interactive")
        {
            Description = "Prohibit prompts and require all choices as arguments.",
            Recursive = true,
        });
        root.Options.Add(new Option<bool>("--verbose")
        {
            Description = "Show diagnostic details.",
            Recursive = true,
        });
        root.Options.Add(new Option<bool>("--no-color")
        {
            Description = "Disable ANSI styling.",
            Recursive = true,
        });

        root.Subcommands.Add(new Command("init", "Initialize Forge through APM."));
        root.Subcommands.Add(CreateGroup("marketplace", "Manage Forge-added APM marketplaces.", "add", "list", "update", "remove"));
        root.Subcommands.Add(CreateGroup("plugin", "Manage the Forge plugin through APM.", "install", "list", "update", "remove"));
        root.Subcommands.Add(new Command("doctor", "Diagnose Forge and APM state without repairing it."));
        return root;
    }

    private static Command CreateGroup(string name, string description, params string[] children)
    {
        var command = new Command(name, description);
        foreach (var child in children)
        {
            command.Subcommands.Add(new Command(child));
        }

        return command;
    }
}
