using Draigara.Forge.Bootstrap;
using Spectre.Console;

namespace Draigara.Forge.Interaction;

public static class InteractionServiceFactory
{
    public static IInteractionService Create(
        TerminalProfile profile,
        BuildIdentity identity,
        TextWriter output,
        TextWriter error,
        TextReader input)
    {
        ArgumentNullException.ThrowIfNull(profile);
        ArgumentNullException.ThrowIfNull(identity);
        ArgumentNullException.ThrowIfNull(output);
        ArgumentNullException.ThrowIfNull(error);
        ArgumentNullException.ThrowIfNull(input);

        if (profile.PresentationMode == TerminalPresentationMode.Plain)
        {
            return new PlainInteractionService(identity, output, error, input, profile.IsInteractive);
        }

        return new SpectreInteractionService(
            identity,
            profile.PresentationMode,
            CreateConsole(output),
            CreateConsole(error));
    }

    private static IAnsiConsole CreateConsole(TextWriter writer) =>
        AnsiConsole.Create(new AnsiConsoleSettings
        {
            Out = new AnsiConsoleOutput(writer),
            Ansi = AnsiSupport.Yes,
            ColorSystem = ColorSystemSupport.TrueColor,
            Interactive = InteractionSupport.Yes,
        });
}
