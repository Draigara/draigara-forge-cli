using Draigara.Forge.Bootstrap;
using Draigara.Forge.Commands;
using Microsoft.Extensions.Hosting;

var builder = Host.CreateEmptyApplicationBuilder(new HostApplicationBuilderSettings
{
    Args = args,
});

using var host = builder.Build();
var app = new ForgeCliApp(BuildIdentity.Current);
return await app.RunAsync(args, Console.Out, Console.Error, CancellationToken.None);
