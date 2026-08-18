# Contributing to AlgoInspect

Thanks for considering a contribution. This project values evidence over
assertion, so most of what follows is about making a change verifiable.

## Before you write code

**Open an issue first.** Describe the problem you hit or the capability you
want, and wait for agreement on scope before writing code. This is not
bureaucracy: the catalog is a canonical source, and a change to it alters what
the application claims as verified truth.

Small, obvious fixes like a typo, a broken link or a failing assertion don't
need an issue. Just send the pull request.

## Setting up

| Tool | Version |
| --- | --- |
| .NET SDK | `10.0.302` |
| Node.js | `24` |
| Python | `3.13` with `pytest` |

```bash
npm install
npm run build:web
npm run dev        # http://127.0.0.1:4398
```

Everything runs on Linux, macOS and Windows.

## Verifying a change

Run these before opening a pull request. They are the same checks CI runs:

```bash
npm run validate:catalog      # catalog schema and content integrity
npm run validate:algorithms   # every implementation against its scenarios
npm test                      # .NET tests plus Playwright end-to-end tests
```

To confirm the verification can actually fail, run
`npm run validate:kahn:failure`. It introduces a deliberate error and requires
the matrix to find it. If a check has never failed, you don't really know it
works.

## Adding an algorithm

Follow the structure of an existing entry under `catalog/algorithms/`:

```
catalog/algorithms/<slug>/
├─ algorithm.json          # identity, classification, complexity, available files
├─ README.md               # theory, solution, history, references
├─ scenarios.json          # verifiable cases
├─ implementations/<language>/
└─ tests/<language>/
```

Requirements:

- The slug is lowercase ASCII letters, digits and interior hyphens. Nothing else
  is accepted. See `AlgorithmSlug` for the exact rule.
- Register the slug in `catalog/catalog.json`.
- **Every language you implement needs tests, and every implementation must pass
  the same scenarios.** A C# and a Python version that disagree fail the build.
- File names follow the conventions the runner derives: `<Slug>.CSharp.Tests.csproj`,
  `<slug>.test.js`, `<slug>.test.ts`, `test_<slug_with_underscores>.py`.

You do not have to implement every language. Adding one language to an existing
algorithm is a welcome contribution on its own.

## Working on a catalog algorithm

Catalog implementations are real, compiled code, not inert text. Each C# entry is
pulled into its test project with a `Compile Include`, so you get IntelliSense,
breakpoints and the test explorer.

| Language | How to work on it |
| --- | --- |
| C# | Open `AlgorithmCatalog.sln`. The catalog test projects appear under the `catalog` solution folder, so you can debug `Kahn.cs` and run its tests from the IDE. |
| Python | `python -m pytest catalog/algorithms/<slug>/tests/python/test_<slug>.py -v` |
| JavaScript | `node catalog/algorithms/<slug>/tests/javascript/<slug>.test.js` |
| TypeScript | `node --experimental-strip-types catalog/algorithms/<slug>/tests/typescript/<slug>.test.ts` |

To run every language for one algorithm at once:

```bash
npm run validate:algorithms -- --algorithm kahn
```

Note that `npm test` and `npm run validate:algorithms` both build the catalog's C#
test projects now, so a change there is checked twice. That is deliberate: the
matrix is what proves the four languages agree.

## Code and content conventions

- Keep catalog content, analysis and presentation separate. The catalog does not
  know the web application exists.
- Documentation must not claim a capability that is still a proposal. If a user
  story is marked `Estado: propuesta`, it is not built.
- Warnings are errors (`TreatWarningsAsErrors`), and nullable reference types are
  enabled. Code that compiles with warnings does not compile.
- Consider accessibility for any user-facing change.
- Most existing documentation is written in Spanish; new documentation in either
  Spanish or English is fine.

## Pull requests

Keep the change within the scope of its issue. Fill in the template, including
the output of the verification commands. If a change is user-visible, include a
before and after.

## Reporting security issues

Do not open a public issue. Follow [`SECURITY.md`](SECURITY.md).

## Code of Conduct

Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).
