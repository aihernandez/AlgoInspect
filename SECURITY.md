# Security Policy

## Supported versions

AlgoInspect has not reached a stable release yet. Security fixes are applied to
the `main` branch only.

| Version | Supported |
| --- | --- |
| `main` | ✅ |
| Any tagged pre-release | ❌ |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues,
discussions, or pull requests.**

Report privately through GitHub's
[private vulnerability reporting](https://github.com/aihernandez/AlgoInspect/security/advisories/new).
This keeps the report visible only to the maintainers until a fix is available.

> Private vulnerability reporting must be enabled in **Settings → Code security
> and analysis** for that link to work. If it is not yet enabled, contact
> **<CONTACT_EMAIL>** instead.

### What to include

The more of this you can provide, the faster the issue can be confirmed:

- the type of issue (for example: path traversal, XSS, deserialization flaw);
- the full paths of the source files related to the issue;
- the affected commit or branch;
- any special configuration required to reproduce it;
- step-by-step instructions to reproduce it;
- proof-of-concept code, if you have it;
- the impact, including how an attacker might exploit it.

### What to expect

AlgoInspect is maintained by one person in their own time, so this policy does
not promise a response time it cannot keep. In practice:

- **Acknowledgement** as soon as the report is seen, usually within a couple of
  weeks.
- **An assessment** once the report has been reproduced: confirmed, needs more
  information, or out of scope.
- **Progress updates** as the fix develops.
- **Credit** in the published advisory, unless you prefer to stay anonymous.

If you have had no reply after a month, please send a reminder; the report was
most likely missed rather than ignored.

Please give us reasonable time to release a fix before disclosing the issue
publicly.

## Scope

The following are in scope:

- the AlgoInspect Web API (`src/backend/AlgoInspect.Api`) and its HTTP hardening;
- catalog loading and validation (`src/backend`), including handling of
  untrusted or malformed catalog content;
- the web lab (`src/frontend`), including how catalog code and traces are rendered
  in the browser;
- the build and release pipeline, including vendored browser libraries.

The following are **out of scope**:

- vulnerabilities in third-party dependencies that already have a public
  advisory. Please report those upstream, though a heads-up here is welcome;
- findings that require an attacker to already have local access to the machine
  running the app;
- missing hardening on a deployment that this repository does not control. The
  repository ships hardening defaults, but TLS, DNS, proxy and observability are
  the responsibility of whoever hosts it.

## Security practices in this repository

CI runs `npm audit` and `dotnet list package --vulnerable --include-transitive`
on every push and pull request. The browser loads no libraries from a CDN
either. D3, Cytoscape, Mermaid and Monaco are all bundled from pinned local
dependencies at build time.
