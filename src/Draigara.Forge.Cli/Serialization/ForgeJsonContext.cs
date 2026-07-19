using System.Text.Json.Serialization;
using Draigara.Forge.State;

namespace Draigara.Forge.Serialization;

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    WriteIndented = true,
    GenerationMode = JsonSourceGenerationMode.Metadata)]
[JsonSerializable(typeof(ForgeState))]
internal sealed partial class ForgeJsonContext : JsonSerializerContext;
