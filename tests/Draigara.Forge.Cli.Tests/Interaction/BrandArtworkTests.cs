using Draigara.Forge.Interaction.Brand;
using Spectre.Console;
using Xunit;

namespace Draigara.Forge.Cli.Tests.Interaction;

public sealed class BrandArtworkTests
{
    [Theory]
    [InlineData("wide-brand.txt", nameof(BrandArtwork.WideMarkup))]
    [InlineData("compact-brand.txt", nameof(BrandArtwork.CompactMarkup))]
    [InlineData("draig-welcome.txt", nameof(BrandArtwork.DraigMarkup))]
    public void Markup_matches_reviewed_golden_fixture(string fixtureName, string propertyName)
    {
        var markup = GetMarkup(propertyName);

        Assert.Equal(ReadFixture(fixtureName), Markup.Remove(markup));
    }

    [Theory]
    [InlineData(nameof(BrandArtwork.WideMarkup), 78)]
    [InlineData(nameof(BrandArtwork.CompactMarkup), 32)]
    [InlineData(nameof(BrandArtwork.DraigMarkup), 40)]
    public void Artwork_fits_its_terminal_width(string propertyName, int maximumWidth)
    {
        var lines = Markup.Remove(GetMarkup(propertyName)).Split('\n');

        Assert.All(lines, line => Assert.True(line.Length <= maximumWidth, $"'{line}' is {line.Length} columns wide."));
    }

    [Fact]
    public void Artwork_contains_no_terminal_control_characters()
    {
        foreach (var markup in AllMarkup())
        {
            Assert.DoesNotContain(markup, character => char.IsControl(character) && character != '\n');
        }
    }

    [Fact]
    public void Artwork_uses_only_the_approved_palette()
    {
        foreach (var markup in AllMarkup())
        {
            var withoutApprovedTags = markup
                .Replace("[#ff5a00]", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace("[#ff8500]", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace("[#ffb11b]", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace("[white]", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Replace("[/]", string.Empty, StringComparison.Ordinal);

            Assert.DoesNotContain('[', withoutApprovedTags);
            Assert.DoesNotContain(']', withoutApprovedTags);
        }
    }

    [Fact]
    public void Plain_brand_text_identifies_brand_and_product()
    {
        Assert.Equal("Draigara Forge", BrandArtwork.PlainBrandText);
    }

    private static IEnumerable<string> AllMarkup()
    {
        yield return BrandArtwork.WideMarkup;
        yield return BrandArtwork.CompactMarkup;
        yield return BrandArtwork.DraigMarkup;
    }

    private static string GetMarkup(string propertyName) => propertyName switch
    {
        nameof(BrandArtwork.WideMarkup) => BrandArtwork.WideMarkup,
        nameof(BrandArtwork.CompactMarkup) => BrandArtwork.CompactMarkup,
        nameof(BrandArtwork.DraigMarkup) => BrandArtwork.DraigMarkup,
        _ => throw new ArgumentOutOfRangeException(nameof(propertyName)),
    };

    private static string ReadFixture(string fileName)
    {
        var repositoryRoot = Directory.GetParent(AppContext.BaseDirectory)!.Parent!.Parent!.Parent!.Parent!.Parent!.FullName;
        return File.ReadAllText(Path.Combine(repositoryRoot, "fixtures", "terminal", fileName)).ReplaceLineEndings("\n").TrimEnd('\n');
    }
}
