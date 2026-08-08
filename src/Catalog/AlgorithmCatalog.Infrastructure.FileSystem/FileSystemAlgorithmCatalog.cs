using System.Text.Json;
using AlgorithmAnalysis.Contracts;
using AlgorithmCatalog.Application;
using AlgorithmCatalog.Domain;

namespace AlgorithmCatalog.Infrastructure.FileSystem;

public sealed class FileSystemAlgorithmCatalog : IAlgorithmCatalog
{
    private static readonly JsonSerializerOptions s_jsonOptions = new(JsonSerializerDefaults.Web);
    private readonly string _catalogRoot;

    public FileSystemAlgorithmCatalog(FileSystemCatalogOptions options)
    {
        ArgumentNullException.ThrowIfNull(options);

        _catalogRoot = Path.GetFullPath(options.RootPath);
        if (!Directory.Exists(_catalogRoot))
        {
            throw new DirectoryNotFoundException($"No se encontró el catálogo configurado: {_catalogRoot}");
        }
    }

    public async ValueTask<CatalogOverviewContract> ListAsync(CancellationToken cancellationToken)
    {
        CatalogFile catalog = await ReadJsonAsync<CatalogFile>(
            ResolveCatalogPath("catalog.json"),
            cancellationToken);

        var algorithms = new List<AlgorithmSummaryContract>(catalog.Algorithms.Count);
        foreach (string algorithmId in catalog.Algorithms)
        {
            AlgorithmSlug slug = ParseSlug(algorithmId);
            AlgorithmFile algorithm = await ReadAlgorithmFileAsync(slug, cancellationToken);
            algorithms.Add(ToSummary(algorithm));
        }

        IReadOnlyList<LanguageContract> languages = catalog.Languages
            .Select(language => new LanguageContract(
                language.Id,
                language.DisplayName,
                language.FileExtension,
                language.IsInitialLanguage))
            .ToArray();

        return new CatalogOverviewContract(catalog.SchemaVersion, languages, algorithms);
    }

    public async ValueTask<AlgorithmDocumentContract?> GetAsync(
        AlgorithmSlug algorithm,
        CancellationToken cancellationToken)
    {
        string manifestPath = ResolveAlgorithmPath(algorithm, "algorithm.json");
        if (!File.Exists(manifestPath))
        {
            return null;
        }

        AlgorithmFile definition = await ReadJsonAsync<AlgorithmFile>(manifestPath, cancellationToken);
        string readme = await File.ReadAllTextAsync(
            ResolveAlgorithmPath(algorithm, definition.Readme),
            cancellationToken);
        string scenariosText = await File.ReadAllTextAsync(
            ResolveAlgorithmPath(algorithm, definition.Scenarios),
            cancellationToken);

        using JsonDocument scenariosDocument = JsonDocument.Parse(scenariosText);
        ComplexityContract complexity = new(
            definition.Complexity.Best,
            definition.Complexity.Average,
            definition.Complexity.Worst,
            definition.Complexity.Space);
        IReadOnlyList<ImplementationDescriptorContract> implementations = definition.Implementations
            .Select(implementation => new ImplementationDescriptorContract(
                implementation.Language,
                implementation.Source,
                implementation.Tests))
            .ToArray();

        return new AlgorithmDocumentContract(
            ToSummary(definition),
            complexity,
            readme,
            scenariosDocument.RootElement.Clone(),
            implementations);
    }

    public async ValueTask<ImplementationSourceContract?> GetImplementationAsync(
        AlgorithmSlug algorithm,
        string language,
        CancellationToken cancellationToken)
    {
        string manifestPath = ResolveAlgorithmPath(algorithm, "algorithm.json");
        if (!File.Exists(manifestPath))
        {
            return null;
        }

        AlgorithmFile definition = await ReadJsonAsync<AlgorithmFile>(manifestPath, cancellationToken);
        ImplementationFile? implementation = definition.Implementations.FirstOrDefault(
            candidate => string.Equals(candidate.Language, language, StringComparison.OrdinalIgnoreCase));

        if (implementation is null)
        {
            return null;
        }

        string sourcePath = ResolveAlgorithmPath(algorithm, implementation.Source);
        string source = await File.ReadAllTextAsync(sourcePath, cancellationToken);
        string? tests = null;
        string? testFileName = null;

        if (!string.IsNullOrWhiteSpace(implementation.Tests))
        {
            string testPath = ResolveAlgorithmPath(algorithm, implementation.Tests);
            tests = await File.ReadAllTextAsync(testPath, cancellationToken);
            testFileName = Path.GetFileName(testPath);
        }

        return new ImplementationSourceContract(
            algorithm.Value,
            implementation.Language,
            Path.GetFileName(sourcePath),
            source,
            testFileName,
            tests);
    }

    private static AlgorithmSummaryContract ToSummary(AlgorithmFile algorithm) =>
        new(algorithm.Id, algorithm.Name, algorithm.Category, algorithm.Summary);

    private static AlgorithmSlug ParseSlug(string candidate)
    {
        if (!AlgorithmSlug.TryCreate(candidate, out AlgorithmSlug slug))
        {
            throw new InvalidDataException($"El identificador de algoritmo '{candidate}' no es válido.");
        }

        return slug;
    }

    private async ValueTask<AlgorithmFile> ReadAlgorithmFileAsync(
        AlgorithmSlug algorithm,
        CancellationToken cancellationToken) =>
        await ReadJsonAsync<AlgorithmFile>(
            ResolveAlgorithmPath(algorithm, "algorithm.json"),
            cancellationToken);

    private static async ValueTask<T> ReadJsonAsync<T>(
        string path,
        CancellationToken cancellationToken)
    {
        await using FileStream stream = File.OpenRead(path);
        T? document = await JsonSerializer.DeserializeAsync<T>(stream, s_jsonOptions, cancellationToken);
        return document ?? throw new InvalidDataException($"El archivo '{path}' no contiene JSON válido.");
    }

    private string ResolveAlgorithmPath(AlgorithmSlug algorithm, string relativePath) =>
        ResolveCatalogPath(Path.Combine("algorithms", algorithm.Value, relativePath));

    private string ResolveCatalogPath(string relativePath)
    {
        string resolvedPath = Path.GetFullPath(Path.Combine(_catalogRoot, relativePath));
        string allowedPrefix = _catalogRoot + Path.DirectorySeparatorChar;
        if (!resolvedPath.StartsWith(allowedPrefix, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidDataException("El catálogo contiene una ruta fuera de su directorio permitido.");
        }

        return resolvedPath;
    }

    private sealed record CatalogFile(
        string SchemaVersion,
        IReadOnlyList<LanguageFile> Languages,
        IReadOnlyList<string> Algorithms);

    private sealed record LanguageFile(
        string Id,
        string DisplayName,
        string FileExtension,
        bool IsInitialLanguage);

    private sealed record AlgorithmFile(
        string Id,
        string Name,
        string Category,
        string Summary,
        ComplexityFile Complexity,
        string Readme,
        string Scenarios,
        IReadOnlyList<ImplementationFile> Implementations);

    private sealed record ComplexityFile(
        string Best,
        string Average,
        string Worst,
        string Space);

    private sealed record ImplementationFile(
        string Language,
        string Source,
        string? Tests);
}
