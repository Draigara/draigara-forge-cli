using Draigara.Forge.Bootstrap;
using Spectre.Console;
using Xunit;

namespace Draigara.Forge.Interaction;

public sealed class InteractionServiceTests
{
    private static readonly BuildIdentity Identity = new("1.2.3", "preview", "abc123", "win-x64");

    [Fact]
    public async Task Wide_header_contains_brand_version_and_channel()
    {
        using var writer = new StringWriter();
        var service = CreateSpectreService(TerminalPresentationMode.Wide, writer);

        await service.WriteBrandHeaderAsync(TestContext.Current.CancellationToken);

        var output = writer.ToString();
        Assert.Contains("DRAIGARA", output);
        Assert.Contains("FORGE", output);
        Assert.Contains("1.2.3", output);
        Assert.Contains("preview", output);
    }

    [Fact]
    public async Task Compact_header_contains_product_name()
    {
        using var writer = new StringWriter();
        var service = CreateSpectreService(TerminalPresentationMode.Compact, writer);

        await service.WriteBrandHeaderAsync(TestContext.Current.CancellationToken);

        Assert.Contains("Draigara Forge", writer.ToString());
    }

    [Fact]
    public async Task Plain_header_is_exactly_one_line_without_ansi()
    {
        using var output = new StringWriter();
        using var error = new StringWriter();
        var service = new PlainInteractionService(Identity, output, error, TextReader.Null, isInteractive: false);

        await service.WriteBrandHeaderAsync(TestContext.Current.CancellationToken);

        Assert.Equal($"Draigara Forge 1.2.3 (preview){Environment.NewLine}", output.ToString());
        Assert.DoesNotContain('\u001b', output.ToString());
    }

    [Fact]
    public void Factory_selects_plain_service_for_plain_profile()
    {
        var profile = new TerminalProfile(false, true, true, true, 120);

        var service = InteractionServiceFactory.Create(profile, Identity, TextWriter.Null, TextWriter.Null, TextReader.Null);

        Assert.IsType<PlainInteractionService>(service);
    }

    [Fact]
    public async Task Plain_non_interactive_confirmation_fails_without_reading_input()
    {
        var input = new ThrowingTextReader();
        var service = new PlainInteractionService(Identity, TextWriter.Null, TextWriter.Null, input, isInteractive: false);

        var exception = await Assert.ThrowsAsync<NonInteractiveInputRequiredException>(
            () => service.ConfirmAsync("Continue?", defaultValue: false, TestContext.Current.CancellationToken));

        Assert.Equal("Continue?", exception.Prompt);
        Assert.False(input.WasRead);
    }

    [Fact]
    public async Task Dynamic_message_markup_is_rendered_literally_and_warnings_use_stderr()
    {
        using var outputWriter = new StringWriter();
        using var errorWriter = new StringWriter();
        var service = CreateSpectreService(TerminalPresentationMode.Wide, outputWriter, errorWriter);

        await service.WriteMessageAsync(
            new InteractionMessage(InteractionMessageLevel.Warning, "unsafe[/]", "value [red]not markup[/]"),
            TestContext.Current.CancellationToken);

        Assert.Empty(outputWriter.ToString());
        Assert.Contains("unsafe[/]", errorWriter.ToString());
        Assert.Contains("value [red]not markup[/]", errorWriter.ToString());
    }

    private static SpectreInteractionService CreateSpectreService(
        TerminalPresentationMode mode,
        TextWriter outputWriter,
        TextWriter? errorWriter = null)
    {
        var output = CreateAnsiConsole(outputWriter);
        var error = CreateAnsiConsole(errorWriter ?? TextWriter.Null);
        return new SpectreInteractionService(Identity, mode, output, error);
    }

    private static IAnsiConsole CreateAnsiConsole(TextWriter writer) =>
        AnsiConsole.Create(new AnsiConsoleSettings
        {
            Out = new AnsiConsoleOutput(writer),
            Ansi = AnsiSupport.No,
            ColorSystem = ColorSystemSupport.NoColors,
        });

    private sealed class ThrowingTextReader : TextReader
    {
        public bool WasRead { get; private set; }

        public override string? ReadLine()
        {
            WasRead = true;
            throw new InvalidOperationException("Input must not be read.");
        }
    }
}
