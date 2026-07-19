using Draigara.Forge.Bootstrap;
using Draigara.Forge.Interaction.Brand;
using Spectre.Console;

namespace Draigara.Forge.Interaction;

public sealed class SpectreInteractionService : IInteractionService
{
    private readonly BuildIdentity _identity;
    private readonly TerminalPresentationMode _mode;
    private readonly IAnsiConsole _output;
    private readonly IAnsiConsole _error;

    public SpectreInteractionService(
        BuildIdentity identity,
        TerminalPresentationMode mode,
        IAnsiConsole output,
        IAnsiConsole error)
    {
        if (mode == TerminalPresentationMode.Plain)
        {
            throw new ArgumentOutOfRangeException(nameof(mode), mode, "Spectre rendering requires an interactive presentation mode.");
        }

        _identity = identity;
        _mode = mode;
        _output = output;
        _error = error;
    }

    public Task WriteBrandHeaderAsync(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var artwork = _mode == TerminalPresentationMode.Wide
            ? BrandArtwork.WideMarkup
            : BrandArtwork.CompactMarkup;
        _output.MarkupLine(artwork);
        _output.MarkupLine($"[dim]{Markup.Escape(_identity.Version)} ({Markup.Escape(_identity.Channel)})[/]");
        return Task.CompletedTask;
    }

    public Task WriteWelcomeAsync(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        _output.MarkupLine(BrandArtwork.DraigMarkup);
        _output.MarkupLine("[bold]Welcome to Draigara Forge.[/]");
        return Task.CompletedTask;
    }

    public Task WriteInitializationSuccessAsync(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        _output.MarkupLine(BrandArtwork.DraigMarkup);
        _output.MarkupLine("[green]Draigara Forge initialization completed successfully.[/]");
        return Task.CompletedTask;
    }

    public Task WriteMessageAsync(InteractionMessage message, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        cancellationToken.ThrowIfCancellationRequested();

        var (console, color) = message.Level switch
        {
            InteractionMessageLevel.Information => (_output, "blue"),
            InteractionMessageLevel.Success => (_output, "green"),
            InteractionMessageLevel.Warning => (_error, "yellow"),
            InteractionMessageLevel.Error => (_error, "red"),
            _ => throw new ArgumentOutOfRangeException(nameof(message), message.Level, "Unknown interaction message level."),
        };

        console.MarkupLine($"[{color}]{Markup.Escape(message.Code)}[/]: {Markup.Escape(message.Text)}");
        return Task.CompletedTask;
    }

    public Task<bool> ConfirmAsync(string prompt, bool defaultValue, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(prompt);
        return _output.PromptAsync(
            new ConfirmationPrompt(Markup.Escape(prompt)) { DefaultValue = defaultValue },
            cancellationToken);
    }
}
