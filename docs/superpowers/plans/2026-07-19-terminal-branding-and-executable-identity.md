# Terminal Branding and Executable Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a Native AOT executable named `forge` and give interactive human commands an accessible Draigara/Forge Spectre.Console presentation with wide, compact, and plain variants.

**Architecture:** `System.CommandLine` continues to own parsing and invocation. A new `IInteractionService` owns all human presentation and selects a renderer from an immutable terminal profile; commands and `ForgeCliApp` never call Spectre.Console directly. Terminal artwork is checked-in static text derived from the canonical SVG assets, so runtime code remains deterministic and AOT-safe.

**Tech Stack:** .NET 10, System.CommandLine 2.0.10, Spectre.Console 0.57.1, xUnit v3 3.2.2, Microsoft Testing Platform, Native AOT.

## Global Constraints

- The public command is `forge` on macOS/Linux and `forge.exe` on Windows.
- `DRAIGARA` is the brand; `FORGE` is the product.
- The dragon-D is the compact identifier; Draig appears only for first-run welcome and successful initialization.
- Redirected output, non-interactive mode, `NO_COLOR`, and `--no-color` render plain text without ANSI or cursor control.
- No result relies on color or decorative glyphs for meaning.
- Commands call only `IInteractionService`; they never call Spectre.Console directly.
- Runtime code does not parse SVG, rasterize images, or use terminal-specific image protocols.
- Production code remains warning-free under trim and AOT analyzers.

---

### Task 1: Produce the `forge` executable identity

**Files:**
- Modify: `src/Draigara.Forge.Cli/Draigara.Forge.Cli.csproj`
- Modify: `src/Draigara.Forge.Cli/Bootstrap/BuildIdentity.cs`
- Modify: `tests/Draigara.Forge.Cli.Tests/Bootstrap/BuildIdentityTests.cs`
- Create: `tests/Draigara.Forge.Cli.AcceptanceTests/ExecutableIdentityTests.cs`
- Modify: `tests/Draigara.Forge.Cli.AcceptanceTests/Draigara.Forge.Cli.AcceptanceTests.csproj`

**Interfaces:**
- Produces: `BuildIdentity.ProductDisplayName` with value `Draigara Forge`.
- Produces: published apphost `forge.exe`/`forge`.

- [ ] **Step 1: Write failing identity tests**

Add assertions that `BuildIdentity.ProductDisplayName == "Draigara Forge"`, `BuildIdentity.Display` begins with `Draigara Forge`, and the acceptance publish directory contains `forge.exe` on Windows or `forge` elsewhere rather than `Draigara.Forge.Cli`.

- [ ] **Step 2: Run tests and verify RED**

Run:

```powershell
dotnet test tests/Draigara.Forge.Cli.Tests/Draigara.Forge.Cli.Tests.csproj --filter-class '*BuildIdentityTests' --minimum-expected-tests 3
```

Expected: FAIL because `ProductDisplayName` does not exist and current display text begins with lowercase `forge`.

- [ ] **Step 3: Implement the executable and display identity**

Set `<AssemblyName>forge</AssemblyName>` while retaining `<RootNamespace>Draigara.Forge</RootNamespace>` and add:

```csharp
public const string ProductDisplayName = "Draigara Forge";

public string Display => $"{ProductDisplayName} {Version} ({Channel}, {Commit}, {RuntimeIdentifier})";
```

Update archive and smoke-test references that assume `Draigara.Forge.Cli.exe`.

- [ ] **Step 4: Verify GREEN and Native AOT output**

Run the unit test above, then publish `win-x64` with the configured MSVC environment and execute:

```powershell
artifacts/publish/win-x64/forge.exe --version
```

Expected: exit `0`, one line beginning `Draigara Forge`, and no `Draigara.Forge.Cli.exe` in the publish directory.

- [ ] **Step 5: Commit**

```powershell
git add src/Draigara.Forge.Cli/Draigara.Forge.Cli.csproj src/Draigara.Forge.Cli/Bootstrap tests
git commit -m "feat: publish the forge executable"
```

### Task 2: Introduce terminal capability and interaction contracts

**Files:**
- Create: `src/Draigara.Forge.Cli/Interaction/TerminalProfile.cs`
- Create: `src/Draigara.Forge.Cli/Interaction/IInteractionService.cs`
- Create: `src/Draigara.Forge.Cli/Interaction/InteractionMessage.cs`
- Create: `tests/Draigara.Forge.Cli.Tests/Interaction/TerminalProfileTests.cs`

**Interfaces:**
- Produces: `TerminalProfile(bool IsInteractive, bool IsOutputRedirected, bool IsErrorRedirected, bool NoColor, int Width)`.
- Produces: `TerminalPresentationMode` values `Wide`, `Compact`, and `Plain`.
- Produces: `IInteractionService.WriteBrandHeaderAsync`, `WriteWelcomeAsync`, `WriteInitializationSuccessAsync`, `WriteMessageAsync`, and `ConfirmAsync`.

- [ ] **Step 1: Write failing profile-selection tests**

Test these exact rules:

```csharp
Assert.Equal(TerminalPresentationMode.Plain, new TerminalProfile(false, false, false, false, 120).PresentationMode);
Assert.Equal(TerminalPresentationMode.Plain, new TerminalProfile(true, true, false, false, 120).PresentationMode);
Assert.Equal(TerminalPresentationMode.Plain, new TerminalProfile(true, false, false, true, 120).PresentationMode);
Assert.Equal(TerminalPresentationMode.Compact, new TerminalProfile(true, false, false, false, 79).PresentationMode);
Assert.Equal(TerminalPresentationMode.Wide, new TerminalProfile(true, false, false, false, 80).PresentationMode);
```

- [ ] **Step 2: Run tests and verify RED**

Expected: compile failure because `TerminalProfile` is absent.

- [ ] **Step 3: Implement immutable contracts**

Implement the mode rules above. Define `InteractionMessage` as a record containing `InteractionMessageLevel`, stable code, and text. Define confirmation as:

```csharp
Task<bool> ConfirmAsync(string prompt, bool defaultValue, CancellationToken cancellationToken);
```

The interface must not expose Spectre.Console types.

- [ ] **Step 4: Run tests and verify GREEN**

Run the filtered interaction tests with `--minimum-expected-tests 5` and expect all five to pass.

- [ ] **Step 5: Commit**

```powershell
git add src/Draigara.Forge.Cli/Interaction tests/Draigara.Forge.Cli.Tests/Interaction
git commit -m "feat: define terminal interaction profiles"
```

### Task 3: Add reviewed static Draigara terminal assets

**Files:**
- Create: `src/Draigara.Forge.Cli/Interaction/Brand/BrandArtwork.cs`
- Create: `tests/Draigara.Forge.Cli.Tests/Interaction/BrandArtworkTests.cs`
- Create: `fixtures/terminal/wide-brand.txt`
- Create: `fixtures/terminal/compact-brand.txt`
- Create: `fixtures/terminal/draig-welcome.txt`
- Create: `tools/brand-art/README.md`

**Interfaces:**
- Produces: `BrandArtwork.WideMarkup`, `CompactMarkup`, `DraigMarkup`, and plain brand text.

- [ ] **Step 1: Create failing golden tests**

Test that markup stripped with `Markup.Remove` equals the three UTF-8 golden fixtures, the wide art is at most 78 columns, compact art at most 32 columns, Draig art at most 40 columns, and none contain control characters other than newline.

- [ ] **Step 2: Verify RED**

Expected: compile failure because `BrandArtwork` is absent.

- [ ] **Step 3: Derive and hand-tune terminal art**

Use `C:\Projects\draigara\assets\logo-glyph.svg`, `logo-wordmark.svg`, and `draig.svg` only as design inputs. Check in static half-block artwork using the palette `#ff5a00`, `#ff8500`, `#ffb11b`, white, and default background. Wide art must show `DRAIGARA` with subordinate `FORGE`; compact art must show the dragon-D with `Draigara Forge`; Draig must remain recognizable without texture-dependent shading.

Document in `tools/brand-art/README.md` that SVG conversion is design-time only and snapshots are the accepted terminal representation.

- [ ] **Step 4: Verify GREEN**

Run brand-art tests with `--minimum-expected-tests 6`; inspect rendered output in a real terminal at 120 and 79 columns.

- [ ] **Step 5: Commit**

```powershell
git add src/Draigara.Forge.Cli/Interaction/Brand fixtures/terminal tools/brand-art tests/Draigara.Forge.Cli.Tests/Interaction
git commit -m "feat: add Draigara terminal artwork"
```

### Task 4: Implement Spectre and plain interaction services

**Files:**
- Create: `src/Draigara.Forge.Cli/Interaction/SpectreInteractionService.cs`
- Create: `src/Draigara.Forge.Cli/Interaction/PlainInteractionService.cs`
- Create: `src/Draigara.Forge.Cli/Interaction/InteractionServiceFactory.cs`
- Create: `tests/Draigara.Forge.Cli.Tests/Interaction/InteractionServiceTests.cs`

**Interfaces:**
- Consumes: `TerminalProfile`, `BrandArtwork`, `BuildIdentity`.
- Produces: an `IInteractionService` selected without leaking Spectre types to commands.

- [ ] **Step 1: Write failing renderer tests**

Using `AnsiConsole.Create(new AnsiConsoleSettings { Out = new AnsiConsoleOutput(writer), Ansi = AnsiSupport.No, ColorSystem = ColorSystemSupport.NoColors })`, assert:

- wide header contains `DRAIGARA`, `FORGE`, version, and channel;
- compact header contains `Draigara Forge`;
- plain header is exactly one line;
- redirected/no-color output contains no `\u001b`;
- `ConfirmAsync` throws `NonInteractiveInputRequiredException` in plain non-interactive mode instead of reading stdin.

- [ ] **Step 2: Verify RED**

Expected: compile failure for missing services.

- [ ] **Step 3: Implement minimal renderers**

Spectre renders only static trusted markup from `BrandArtwork`; all dynamic strings pass through `Markup.Escape`. Plain rendering uses `TextWriter` directly. The factory returns plain mode whenever `TerminalProfile.PresentationMode == Plain`.

- [ ] **Step 4: Verify GREEN**

Run interaction tests and require the exact expected count with zero warnings.

- [ ] **Step 5: Commit**

```powershell
git add src/Draigara.Forge.Cli/Interaction tests/Draigara.Forge.Cli.Tests/Interaction
git commit -m "feat: render branded terminal interactions"
```

### Task 5: Wire branded help and first-run presentation

**Files:**
- Modify: `src/Draigara.Forge.Cli/Commands/ForgeCliApp.cs`
- Modify: `src/Draigara.Forge.Cli/Program.cs`
- Modify: `tests/Draigara.Forge.Cli.Tests/Commands/ForgeCliAppTests.cs`
- Create: `tests/Draigara.Forge.Cli.AcceptanceTests/TerminalPresentationTests.cs`

**Interfaces:**
- Consumes: `IInteractionService` and `BuildIdentity`.
- Produces: branded top-level help while preserving System.CommandLine parsing and exit codes.

- [ ] **Step 1: Write failing application tests**

Inject a recording `IInteractionService`. Assert top-level `--help` writes one brand header before System.CommandLine help; routine `marketplace list --help` does not write the wide banner; `--version` remains a single plain line; and usage shows `forge`, never `Draigara.Forge.Cli`.

- [ ] **Step 2: Verify RED**

Expected: constructor mismatch because `ForgeCliApp` does not accept `IInteractionService`.

- [ ] **Step 3: Wire composition**

Create the empty host as before, add only `FORGE_` environment configuration, construct `TerminalProfile` from console redirection, width, `NO_COLOR`, `--no-color`, and `--non-interactive`, then inject the selected service into `ForgeCliApp`. The Task 1 assembly/apphost name makes System.CommandLine report `forge` as the executable name; verify this through the acceptance test rather than attempting to set the read-only `RootCommand.ExecutableName` property.

- [ ] **Step 4: Verify all managed and native checks**

Run:

```powershell
dotnet restore Draigara.Forge.slnx
dotnet build Draigara.Forge.slnx -c Release --no-restore
dotnet test tests/Draigara.Forge.Cli.Tests/Draigara.Forge.Cli.Tests.csproj -c Release --no-build --minimum-expected-tests 32
dotnet test tests/Draigara.Forge.Cli.AcceptanceTests/Draigara.Forge.Cli.AcceptanceTests.csproj -c Release --no-build --minimum-expected-tests 4
```

If test decomposition produces more than 32 unit tests or 4 acceptance tests, raise the minimum to the actual count; never lower it. Publish Native AOT `win-x64`, run `forge.exe --help`, `forge.exe --version`, and redirected `forge.exe --help > help.txt`; assert redirected output contains no ESC byte.

- [ ] **Step 5: Commit**

```powershell
git add src tests fixtures docs
git commit -m "feat: add Draigara Forge terminal presentation"
```

### Task 6: Update UX and release documentation

**Files:**
- Modify: `docs/terminal-ux.md`
- Modify: `docs/release-engineering.md`
- Modify: `README.md`
- Modify: `.github/workflows/build.yml`
- Modify: `.github/workflows/release.yml`

**Interfaces:**
- Documents the public `forge` executable and presentation variants.

- [ ] **Step 1: Add documentation assertions**

Extend the docs workflow or a repository test to reject `Draigara.Forge.Cli(.exe)` in user command examples and published archive contents while permitting the project path.

- [ ] **Step 2: Verify the assertion fails on current documentation/workflows**

Run the repository docs validation command and record the matching stale references.

- [ ] **Step 3: Update documentation and workflows**

Document the wide/compact/plain rules, Draig placement, accessibility behavior, System.CommandLine/Spectre boundary, `forge` archive layout, and per-user PATH installation. Update release packaging to archive `forge`/`forge.exe` and keep symbols outside archives.

- [ ] **Step 4: Run complete verification**

Run Release build, all unit and acceptance tests, docs checks, and Native AOT smoke tests. Expected: zero warnings, zero failed tests, and published binary named `forge`.

- [ ] **Step 5: Commit**

```powershell
git add README.md docs .github
git commit -m "docs: specify Forge branding and executable identity"
```
