using AlgorithmCatalog.Domain;
using AlgorithmCatalog.Infrastructure.FileSystem;

namespace AlgorithmCatalog.Tests;

public sealed class FileSystemAlgorithmCatalogTests
{
    private readonly FileSystemAlgorithmCatalog _catalog = new(
        new FileSystemCatalogOptions(RepositoryPaths.CatalogRoot));

    [Fact]
    public async Task ListAsync_ReturnsPlannedLanguagesAndImplementedAlgorithms()
    {
        var result = await _catalog.ListAsync(CancellationToken.None);

        Assert.Equal("1.0", result.SchemaVersion);
        Assert.Equal(10, result.Languages.Count);
        Assert.Contains(result.Algorithms, algorithm => algorithm.Id == "kahn");
    }

    [Fact]
    public async Task GetAsync_ReturnsKahnDocumentationScenariosAndImplementations()
    {
        Assert.True(AlgorithmSlug.TryCreate("kahn", out AlgorithmSlug algorithm));

        var result = await _catalog.GetAsync(algorithm, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Contains("Kahn", result.Readme, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(10, result.Scenarios.GetProperty("scenarios").GetArrayLength());
        Assert.Equal(4, result.Implementations.Count);
    }

    [Fact]
    public async Task GetImplementationAsync_ReturnsPythonSourceAndTests()
    {
        Assert.True(AlgorithmSlug.TryCreate("kahn", out AlgorithmSlug algorithm));

        var result = await _catalog.GetImplementationAsync(
            algorithm,
            "python",
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("kahn.py", result.FileName);
        Assert.Contains("def kahn", result.Source, StringComparison.Ordinal);
        Assert.Contains("test_orders_a_chain", result.Tests, StringComparison.Ordinal);
    }
}
