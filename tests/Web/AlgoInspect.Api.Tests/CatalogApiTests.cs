using System.Net;
using System.Net.Http.Json;
using AlgorithmAnalysis.Contracts;
using Microsoft.AspNetCore.Mvc.Testing;

namespace AlgoInspect.Api.Tests;

public sealed class CatalogApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public CatalogApiTests(WebApplicationFactory<Program> application)
    {
        _client = application.CreateClient();
    }

    [Fact]
    public async Task GetCatalog_ReturnsLanguagesAndKahn()
    {
        var catalog = await _client.GetFromJsonAsync<CatalogOverviewContract>(
            "/api/catalog",
            CancellationToken.None);

        Assert.NotNull(catalog);
        Assert.Equal(10, catalog.Languages.Count);
        Assert.Contains(catalog.Algorithms, algorithm => algorithm.Id == "kahn");
    }

    [Fact]
    public async Task GetAlgorithm_ReturnsDocumentationAndScenarios()
    {
        var algorithm = await _client.GetFromJsonAsync<AlgorithmDocumentContract>(
            "/api/algorithms/kahn",
            CancellationToken.None);

        Assert.NotNull(algorithm);
        Assert.Contains("Kahn", algorithm.Readme, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(10, algorithm.Scenarios.GetProperty("scenarios").GetArrayLength());
    }

    [Fact]
    public async Task GetUnknownImplementation_ReturnsNotFound()
    {
        using HttpResponseMessage response = await _client.GetAsync(
            "/api/algorithms/kahn/implementations/rust",
            CancellationToken.None);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetRoot_ReturnsCanonicalWebApplication()
    {
        string html = await _client.GetStringAsync("/", CancellationToken.None);

        Assert.Contains("Laboratorio visual de algoritmos", html, StringComparison.Ordinal);
    }
}
