namespace Draigara.Forge.Interaction;

public interface IInteractionService
{
    Task WriteBrandHeaderAsync(CancellationToken cancellationToken);

    Task WriteWelcomeAsync(CancellationToken cancellationToken);

    Task WriteInitializationSuccessAsync(CancellationToken cancellationToken);

    Task WriteMessageAsync(InteractionMessage message, CancellationToken cancellationToken);

    Task<bool> ConfirmAsync(string prompt, bool defaultValue, CancellationToken cancellationToken);
}
