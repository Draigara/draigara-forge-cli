using Draigara.Forge.Bootstrap;
using Draigara.Forge.Commands;
using Draigara.Forge.Interaction;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateEmptyApplicationBuilder(new HostApplicationBuilderSettings
{
    Args = args,
});
builder.Configuration.AddEnvironmentVariables("FORGE_");

using var host = builder.Build();
var noColor = args.Contains("--no-color", StringComparer.Ordinal)
    || Environment.GetEnvironmentVariable("NO_COLOR") is not null;
var nonInteractive = args.Contains("--non-interactive", StringComparer.Ordinal);
var profile = new TerminalProfile(
    IsInteractive: !nonInteractive && !Console.IsInputRedirected,
    IsOutputRedirected: Console.IsOutputRedirected,
    IsErrorRedirected: Console.IsErrorRedirected,
    NoColor: noColor,
    Width: GetConsoleWidth());
var interaction = InteractionServiceFactory.Create(profile, BuildIdentity.Current, Console.Out, Console.Error, Console.In);
var app = new ForgeCliApp(BuildIdentity.Current, interaction);
return await app.RunAsync(args, Console.Out, Console.Error, CancellationToken.None);

static int GetConsoleWidth()
{
    try
    {
        return Console.WindowWidth;
    }
    catch (IOException)
    {
        return 0;
    }
    catch (PlatformNotSupportedException)
    {
        return 0;
    }
}
