using Draigara.Forge.Interaction;
using Xunit;

namespace Draigara.Forge.Cli.Tests.Interaction;

public sealed class TerminalProfileTests
{
    [Fact]
    public void Non_interactive_output_is_plain()
    {
        Assert.Equal(TerminalPresentationMode.Plain, new TerminalProfile(false, false, false, false, 120).PresentationMode);
    }

    [Fact]
    public void Redirected_output_is_plain()
    {
        Assert.Equal(TerminalPresentationMode.Plain, new TerminalProfile(true, true, false, false, 120).PresentationMode);
    }

    [Fact]
    public void No_color_output_is_plain()
    {
        Assert.Equal(TerminalPresentationMode.Plain, new TerminalProfile(true, false, false, true, 120).PresentationMode);
    }

    [Fact]
    public void Interactive_output_below_eighty_columns_is_compact()
    {
        Assert.Equal(TerminalPresentationMode.Compact, new TerminalProfile(true, false, false, false, 79).PresentationMode);
    }

    [Fact]
    public void Interactive_output_at_eighty_columns_is_wide()
    {
        Assert.Equal(TerminalPresentationMode.Wide, new TerminalProfile(true, false, false, false, 80).PresentationMode);
    }
}
