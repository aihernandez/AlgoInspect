using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AlgorithmAnalysis.Contracts;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace AlgoInspect.Api.Tests;

public sealed class CatalogApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _application;
    private readonly HttpClient _client;

    public CatalogApiTests(WebApplicationFactory<Program> application)
    {
        _application = application;
        _client = application.CreateClient();
    }

    [Fact]
    public async Task GetCatalog_ReturnsLanguagesAndCanonicalAlgorithms()
    {
        var catalog = await _client.GetFromJsonAsync<CatalogOverviewContract>(
            "/api/catalog",
            CancellationToken.None);

        Assert.NotNull(catalog);
        Assert.Equal("1.0.0", catalog.ContentVersion);
        Assert.Equal(10, catalog.Languages.Count);
        Assert.Equal(3, catalog.Algorithms.Count);
        Assert.Contains(catalog.Algorithms, algorithm => algorithm.Id == "kahn");
        Assert.Contains(catalog.Algorithms, algorithm => algorithm.Id == "binary-search");
        Assert.Contains(catalog.Algorithms, algorithm => algorithm.Id == "bubble-sort");
    }

    [Theory]
    [InlineData("binary-search", "Búsqueda binaria")]
    [InlineData("bubble-sort", "Ordenamiento burbuja")]
    public async Task GetExpandedAlgorithm_ReturnsDocumentationAndElevenScenarios(
        string algorithmId,
        string expectedTitle)
    {
        var algorithm = await _client.GetFromJsonAsync<AlgorithmDocumentContract>(
            $"/api/algorithms/{algorithmId}",
            CancellationToken.None);

        Assert.NotNull(algorithm);
        Assert.Contains(expectedTitle, algorithm.Readme, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(11, algorithm.Scenarios.GetArrayLength());
        Assert.Equal(4, algorithm.Implementations.Count);
    }

    [Fact]
    public async Task GetAlgorithm_ReturnsDocumentationAndScenarios()
    {
        var algorithm = await _client.GetFromJsonAsync<AlgorithmDocumentContract>(
            "/api/algorithms/kahn",
            CancellationToken.None);

        Assert.NotNull(algorithm);
        Assert.Contains("Kahn", algorithm.Readme, StringComparison.OrdinalIgnoreCase);
        Assert.Equal("1.0.0", algorithm.ContentVersion);
        Assert.Equal(11, algorithm.Scenarios.GetArrayLength());
        Assert.Equal(4, algorithm.Implementations.Count);
    }

    [Fact]
    public async Task GetUnknownImplementation_ReturnsNotFound()
    {
        using HttpResponseMessage response = await _client.GetAsync(
            "/api/algorithms/kahn/implementations/rust",
            CancellationToken.None);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        JsonElement problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("language-not-supported", problem.GetProperty("code").GetString());
    }

    [Fact]
    public async Task GetScenarios_ReturnsCanonicalVersionAndMatrix()
    {
        var scenarios = await _client.GetFromJsonAsync<ScenarioDocumentContract>(
            "/api/algorithms/kahn/scenarios",
            CancellationToken.None);

        Assert.NotNull(scenarios);
        Assert.Equal("1.0.0", scenarios.ContentVersion);
        Assert.Equal(11, scenarios.Scenarios.GetArrayLength());
    }

    [Fact]
    public async Task InvalidAlgorithmId_ReturnsTypedBadRequest()
    {
        using HttpResponseMessage response = await _client.GetAsync(
            "/api/algorithms/-kahn",
            CancellationToken.None);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        JsonElement problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("invalid-algorithm-id", problem.GetProperty("code").GetString());
    }

    [Fact]
    public async Task IncompatibleSchemaVersion_ReturnsTypedConflict()
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/catalog");
        request.Headers.Add("X-AlgoInspect-Schema-Version", "2.0");
        using HttpResponseMessage response = await _client.SendAsync(request, CancellationToken.None);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        JsonElement problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("schema-version-incompatible", problem.GetProperty("code").GetString());
    }

    [Fact]
    public async Task GetRoot_ReturnsCanonicalWebApplication()
    {
        string html = await _client.GetStringAsync("/", CancellationToken.None);

        Assert.Contains("Laboratorio visual de algoritmos", html, StringComparison.Ordinal);
    }

    [Fact]
    public async Task HealthEndpoints_DistinguishReadinessAndLiveness()
    {
        using HttpResponseMessage ready = await _client.GetAsync("/api/health/ready", CancellationToken.None);
        using HttpResponseMessage live = await _client.GetAsync("/api/health/live", CancellationToken.None);

        Assert.Equal(HttpStatusCode.OK, ready.StatusCode);
        Assert.Equal(HttpStatusCode.OK, live.StatusCode);

        JsonElement readyPayload = await ready.Content.ReadFromJsonAsync<JsonElement>();
        JsonElement livePayload = await live.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("healthy", readyPayload.GetProperty("status").GetString());
        Assert.Contains(
            readyPayload.GetProperty("checks").EnumerateArray(),
            check => check.GetProperty("name").GetString() == "canonical-catalog");
        Assert.Empty(livePayload.GetProperty("checks").EnumerateArray());
    }

    [Fact]
    public async Task PublicResponses_IncludeDefensiveHeaders()
    {
        using HttpResponseMessage response = await _client.GetAsync("/", CancellationToken.None);

        Assert.True(response.Headers.TryGetValues("Content-Security-Policy", out var policies));
        Assert.Contains("default-src 'self'", Assert.Single(policies), StringComparison.Ordinal);
        Assert.Equal("nosniff", Assert.Single(response.Headers.GetValues("X-Content-Type-Options")));
        Assert.Equal(
            "strict-origin-when-cross-origin",
            Assert.Single(response.Headers.GetValues("Referrer-Policy")));
    }

    [Fact]
    public async Task PrototypeData_IsNotPubliclyServed()
    {
        using HttpResponseMessage response = await _client.GetAsync(
            "/src/data/prototype-catalog.js",
            CancellationToken.None);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UnknownHost_IsRejected()
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/catalog");
        request.Headers.Host = "unexpected.example";

        using HttpResponseMessage response = await _client.SendAsync(request, CancellationToken.None);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ProductionHttpsResponse_IncludesHsts()
    {
        using WebApplicationFactory<Program> productionApplication = _application.WithWebHostBuilder(
            builder => builder
                .UseEnvironment("Production")
                .UseSetting("AllowedHosts", "algoinspect.example"));
        using HttpClient client = productionApplication.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://algoinspect.example"),
        });

        using HttpResponseMessage response = await client.GetAsync("/", CancellationToken.None);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(response.Headers.Contains("Strict-Transport-Security"));
    }
}
