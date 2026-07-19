namespace Draigara.Forge.Interaction;

public enum InteractionMessageLevel
{
    Information,
    Success,
    Warning,
    Error,
}

public sealed record InteractionMessage(InteractionMessageLevel Level, string Code, string Text);
