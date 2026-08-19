using AlgoInspect.Api;

namespace AlgoInspect.Api.Tests;

/// <summary>
/// Fija el orden de resolución del contenido. Es la pieza que decide si la
/// aplicación arranca, y la única que depende de la estructura de carpetas.
/// </summary>
public sealed class RepositoryLayoutTests : IDisposable
{
    private const string Production = "Production";

    private readonly string _root;

    public RepositoryLayoutTests()
    {
        _root = CreateTemporaryDirectory("raiz");
    }

    public void Dispose()
    {
        if (Directory.Exists(_root))
        {
            Directory.Delete(_root, recursive: true);
        }
    }

    private static string CreateTemporaryDirectory(string prefix)
    {
        string path = Path.Combine(Path.GetTempPath(), $"algoinspect-{prefix}-{Guid.NewGuid():N}");
        Directory.CreateDirectory(path);
        return path;
    }

    /// <summary>Crea un par catálogo/web válido bajo <paramref name="root"/>.</summary>
    private static (string CatalogRoot, string WebRoot) CreateContent(
        string root,
        string catalogFolder = "catalog",
        string webFolder = "web")
    {
        string catalogRoot = Path.Combine(root, catalogFolder);
        string webRoot = Path.Combine(root, webFolder);

        Directory.CreateDirectory(catalogRoot);
        Directory.CreateDirectory(webRoot);
        File.WriteAllText(Path.Combine(catalogRoot, "catalog.json"), "{}");
        File.WriteAllText(Path.Combine(webRoot, "index.html"), "<!doctype html>");

        return (catalogRoot, webRoot);
    }

    [Fact]
    public void Find_PrefersExplicitContentPaths()
    {
        (string catalogRoot, string webRoot) = CreateContent(_root);

        ContentLayout layout = RepositoryLayout.Find(
            contentRoot: _root,
            applicationBaseDirectory: _root,
            environmentName: Production,
            configuredCatalogRoot: catalogRoot,
            configuredWebRoot: webRoot,
            configuredRepositoryRoot: null);

        Assert.Equal(Path.GetFullPath(catalogRoot), layout.CatalogRoot);
        Assert.Equal(Path.GetFullPath(webRoot), layout.WebRoot);
    }

    /// <summary>
    /// La configuración explícita gana incluso en desarrollo: es lo que permite mover
    /// carpetas sin recompilar ni depender del descubrimiento automático.
    /// </summary>
    [Theory]
    [InlineData("Development")]
    [InlineData(Production)]
    public void Find_PrefersExplicitContentPathsInEveryEnvironment(string environmentName)
    {
        (string catalogRoot, string webRoot) = CreateContent(_root);

        ContentLayout layout = RepositoryLayout.Find(
            _root, _root, environmentName, catalogRoot, webRoot, null);

        Assert.Equal(Path.GetFullPath(catalogRoot), layout.CatalogRoot);
    }

    [Fact]
    public void Find_ResolvesRelativeContentPathsAgainstContentRoot()
    {
        CreateContent(_root);

        ContentLayout layout = RepositoryLayout.Find(
            contentRoot: _root,
            applicationBaseDirectory: Path.GetTempPath(),
            environmentName: Production,
            configuredCatalogRoot: "catalog",
            configuredWebRoot: "web",
            configuredRepositoryRoot: null);

        Assert.Equal(Path.Combine(_root, "catalog"), layout.CatalogRoot);
        Assert.Equal(Path.Combine(_root, "web"), layout.WebRoot);
    }

    [Theory]
    [InlineData("catalog", null)]
    [InlineData(null, "web")]
    public void Find_RejectsHalfConfiguredContentPaths(string? catalogRoot, string? webRoot)
    {
        CreateContent(_root);

        InvalidOperationException error = Assert.Throws<InvalidOperationException>(
            () => RepositoryLayout.Find(_root, _root, Production, catalogRoot, webRoot, null));

        Assert.Contains("juntos", error.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Find_RejectsConfiguredPathsWithoutExpectedContent()
    {
        string empty = Path.Combine(_root, "vacio");
        Directory.CreateDirectory(empty);

        Assert.Throws<DirectoryNotFoundException>(
            () => RepositoryLayout.Find(_root, _root, Production, empty, empty, null));
    }

    /// <summary>
    /// <c>RepositoryRoot</c> deriva ambas rutas de la raíz del repositorio,
    /// donde la aplicación web vive en <c>src/frontend</c>.
    /// </summary>
    [Fact]
    public void Find_DerivesBothPathsFromConfiguredRepositoryRoot()
    {
        CreateContent(_root, webFolder: Path.Combine("src", "frontend"));

        ContentLayout layout = RepositoryLayout.Find(
            _root, _root, Production, null, null, _root);

        Assert.Equal(Path.Combine(_root, "catalog"), layout.CatalogRoot);
        Assert.Equal(Path.Combine(_root, "src", "frontend"), layout.WebRoot);
    }

    [Fact]
    public void Find_UsesPublishedOutputConventionWhenNothingIsConfigured()
    {
        // La salida de `npm run publish:app` coloca catalog/ y web/ junto al ejecutable.
        (string catalogRoot, string webRoot) = CreateContent(_root);
        string unrelated = CreateTemporaryDirectory("sin-contenido");

        try
        {
            ContentLayout layout = RepositoryLayout.Find(
                contentRoot: unrelated,
                applicationBaseDirectory: _root,
                environmentName: Production,
                configuredCatalogRoot: null,
                configuredWebRoot: null,
                configuredRepositoryRoot: null);

            Assert.Equal(catalogRoot, layout.CatalogRoot);
            Assert.Equal(webRoot, layout.WebRoot);
        }
        finally
        {
            Directory.Delete(unrelated, recursive: true);
        }
    }

    [Fact]
    public void Find_ThrowsWithActionableMessageWhenContentCannotBeLocated()
    {
        string isolated = CreateTemporaryDirectory("aislado");

        try
        {
            DirectoryNotFoundException error = Assert.Throws<DirectoryNotFoundException>(
                () => RepositoryLayout.Find(isolated, isolated, Production, null, null, null));

            // El mensaje debe indicar la salida, no solo el problema.
            Assert.Contains("Content:CatalogRoot", error.Message, StringComparison.Ordinal);
        }
        finally
        {
            Directory.Delete(isolated, recursive: true);
        }
    }
}
