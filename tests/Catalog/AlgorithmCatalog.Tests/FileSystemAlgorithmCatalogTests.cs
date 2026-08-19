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
        Assert.Equal(3, result.Algorithms.Count);
        Assert.Contains(result.Algorithms, algorithm => algorithm.Id == "kahn");
        Assert.Contains(result.Algorithms, algorithm => algorithm.Id == "binary-search");
        Assert.Contains(result.Algorithms, algorithm => algorithm.Id == "bubble-sort");
    }

    [Fact]
    public async Task GetAsync_ReturnsKahnDocumentationScenariosAndImplementations()
    {
        Assert.True(AlgorithmSlug.TryCreate("kahn", out AlgorithmSlug algorithm));

        var result = await _catalog.GetAsync(algorithm, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Contains("Kahn", result.Readme, StringComparison.OrdinalIgnoreCase);
        Assert.Equal("1.0", result.SchemaVersion);
        Assert.Equal("1.0.0", result.ContentVersion);
        Assert.Equal(11, result.Scenarios.GetArrayLength());
        Assert.Equal(4, result.Implementations.Count);
        Assert.Equal(4, result.Algorithm.AvailableLanguages.Count);
        Assert.NotEmpty(result.References);
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
        Assert.Contains("def test_kahn_returns_expected_result", result.Tests, StringComparison.Ordinal);
        Assert.Equal("kahn-python", result.ValidationProfile);
    }
}
