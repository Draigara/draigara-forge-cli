using Draigara.Forge.Bootstrap;
using Draigara.Forge.Interaction.Brand;

namespace Draigara.Forge.Interaction;

public sealed class PlainInteractionService : IInteractionService
{
    private readonly BuildIdentity _identity;
    private readonly TextWriter _output;
    private readonly TextWriter _error;
    private readonly TextReader _input;
    private readonly bool _isInteractive;

    public PlainInteractionService(
        BuildIdentity identity,
        TextWriter output,
        TextWriter error,
        TextReader input,
        bool isInteractive)
    {
        _identity = identity;
        _output = output;
        _error = error;
        _input = input;
        _isInteractive = isInteractive;
    }

    public Task WriteBrandHeaderAsync(CancellationToken cancellationToken) =>
        WriteLineAsync(_output, $"{BrandArtwork.PlainBrandText} {_identity.Version} ({_identity.Channel})", cancellationToken);

    public async Task WriteWelcomeAsync(CancellationToken cancellationToken)
    {
        await WriteBrandHeaderAsync(cancellationToken).ConfigureAwait(false);
        await WriteLineAsync(_output, "Welcome to Draigara Forge.", cancellationToken).ConfigureAwait(false);
    }

    public Task WriteInitializationSuccessAsync(CancellationToken cancellationToken) =>
        WriteLineAsync(_output, "Draigara Forge initialization completed successfully.", cancellationToken);

    public Task WriteMessageAsync(InteractionMessage message, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        var writer = message.Level is InteractionMessageLevel.Warning or InteractionMessageLevel.Error
            ? _error
            : _output;
        return WriteLineAsync(writer, $"{message.Code}: {message.Text}", cancellationToken);
    }

    public async Task<bool> ConfirmAsync(string prompt, bool defaultValue, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(prompt);
        cancellationToken.ThrowIfCancellationRequested();

        if (!_isInteractive)
        {
            throw new NonInteractiveInputRequiredException(prompt);
        }

        var suffix = defaultValue ? " [Y/n] " : " [y/N] ";
        await _output.WriteAsync(prompt.AsMemory(), cancellationToken).ConfigureAwait(false);
        await _output.WriteAsync(suffix.AsMemory(), cancellationToken).ConfigureAwait(false);
        var answer = await _input.ReadLineAsync(cancellationToken).ConfigureAwait(false);

        if (string.IsNullOrWhiteSpace(answer))
        {
            return defaultValue;
        }

        return answer.Trim().Equals("y", StringComparison.OrdinalIgnoreCase)
            || answer.Trim().Equals("yes", StringComparison.OrdinalIgnoreCase);
    }

    private static async Task WriteLineAsync(TextWriter writer, string value, CancellationToken cancellationToken)
    {
        await writer.WriteLineAsync(value.AsMemory(), cancellationToken).ConfigureAwait(false);
    }
}

public sealed class NonInteractiveInputRequiredException : InvalidOperationException
{
    public NonInteractiveInputRequiredException(string prompt)
        : base($"Confirmation is required but interaction is disabled: {prompt}")
    {
        Prompt = prompt;
    }

    public string Prompt { get; }
}
