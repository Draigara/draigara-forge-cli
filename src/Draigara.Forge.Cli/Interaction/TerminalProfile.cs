namespace Draigara.Forge.Interaction;

public enum TerminalPresentationMode
{
    Wide,
    Compact,
    Plain,
}

public sealed record TerminalProfile(
    bool IsInteractive,
    bool IsOutputRedirected,
    bool IsErrorRedirected,
    bool NoColor,
    int Width)
{
    public TerminalPresentationMode PresentationMode =>
        !IsInteractive || IsOutputRedirected || NoColor
            ? TerminalPresentationMode.Plain
            : Width < 80
                ? TerminalPresentationMode.Compact
                : TerminalPresentationMode.Wide;
}
