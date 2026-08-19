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
            throw new DirectoryNotFoundException("No se encontró el catálogo configurado.");
        }
    }

    public async ValueTask<CatalogOverviewContract> ListAsync(CancellationToken cancellationToken)
    {
        CatalogFile catalog = await ReadCatalogAsync(cancellationToken);
        var algorithms = new List<AlgorithmSummaryContract>(catalog.Algorithms.Count);

        foreach (string algorithmId in catalog.Algorithms)
        {
            AlgorithmSlug slug = ParseSlug(algorithmId);
            AlgorithmFile algorithm = await ReadAlgorithmFileAsync(slug, cancellationToken);
            ValidateManifest(slug, algorithm);
            algorithms.Add(ToSummary(algorithm));
        }

        IReadOnlyList<LanguageContract> languages = catalog.Languages
            .Select(language => new LanguageContract(
                language.Id,
                language.DisplayName,
                language.FileExtension,
                language.IsInitialLanguage))
            .ToArray();

        return new CatalogOverviewContract(
            catalog.SchemaVersion,
            catalog.ContentVersion,
            languages,
            algorithms);
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
        ValidateManifest(algorithm, definition);
        string readme = await ReadRequiredTextAsync(algorithm, definition.Readme, cancellationToken);
        ScenarioFile scenarios = await ReadScenarioFileAsync(algorithm, definition, cancellationToken);

        return new AlgorithmDocumentContract(
            definition.SchemaVersion,
            definition.ContentVersion,
            ToSummary(definition),
            definition.Paradigm,
            definition.Difficulty,
            definition.Inputs,
            definition.Outputs,
            definition.Preconditions,
            definition.Assumptions,
            definition.Invariant,
            new ComplexityContract(
                definition.Complexity.Best,
                definition.Complexity.Average,
                definition.Complexity.Worst,
                definition.Complexity.Space),
            readme,
            scenarios.Scenarios.Clone(),
            definition.Implementations.Select(ToDescriptor).ToArray(),
            definition.References.Select(reference => new ReferenceContract(
                reference.Title,
                reference.Author,
                reference.Organization,
                reference.Year,
                reference.Url)).ToArray());
    }

    public async ValueTask<ScenarioDocumentContract?> GetScenariosAsync(
        AlgorithmSlug algorithm,
        CancellationToken cancellationToken)
    {
        string manifestPath = ResolveAlgorithmPath(algorithm, "algorithm.json");
        if (!File.Exists(manifestPath))
        {
            return null;
        }

        AlgorithmFile definition = await ReadJsonAsync<AlgorithmFile>(manifestPath, cancellationToken);
        ValidateManifest(algorithm, definition);
        ScenarioFile scenarios = await ReadScenarioFileAsync(algorithm, definition, cancellationToken);
        return new ScenarioDocumentContract(
            definition.SchemaVersion,
            definition.ContentVersion,
            definition.Id,
            scenarios.Scenarios.Clone());
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
        ValidateManifest(algorithm, definition);
        ImplementationFile? implementation = definition.Implementations.FirstOrDefault(
            candidate => string.Equals(candidate.Language, language, StringComparison.OrdinalIgnoreCase));

        if (implementation is null)
        {
            return null;
        }

        string sourcePath = ResolveAlgorithmPath(algorithm, implementation.Source);
        string testPath = ResolveAlgorithmPath(algorithm, implementation.Tests);
        string source = await File.ReadAllTextAsync(sourcePath, cancellationToken);
        string tests = await File.ReadAllTextAsync(testPath, cancellationToken);

        return new ImplementationSourceContract(
            definition.SchemaVersion,
            definition.ContentVersion,
            algorithm.Value,
            implementation.Language,
            implementation.MinimumVersion,
            implementation.EntryPoint,
            Path.GetFileName(sourcePath),
            source,
            Path.GetFileName(testPath),
            tests,
            implementation.ValidationProfile);
    }

    private async ValueTask<CatalogFile> ReadCatalogAsync(CancellationToken cancellationToken)
    {
        CatalogFile catalog = await ReadJsonAsync<CatalogFile>(ResolveCatalogPath("catalog.json"), cancellationToken);
        if (string.IsNullOrWhiteSpace(catalog.SchemaVersion) || string.IsNullOrWhiteSpace(catalog.ContentVersion))
        {
            throw new InvalidDataException("El catálogo debe declarar schemaVersion y contentVersion.");
        }

        return catalog;
    }

    private async ValueTask<ScenarioFile> ReadScenarioFileAsync(
        AlgorithmSlug algorithm,
        AlgorithmFile definition,
        CancellationToken cancellationToken)
    {
        ScenarioFile scenarios = await ReadJsonAsync<ScenarioFile>(
            ResolveAlgorithmPath(algorithm, definition.Scenarios),
            cancellationToken);
        if (!string.Equals(scenarios.AlgorithmId, definition.Id, StringComparison.Ordinal) ||
            !string.Equals(scenarios.Version, definition.ContentVersion, StringComparison.Ordinal))
        {
            throw new InvalidDataException(
                $"Los escenarios de '{definition.Id}' no coinciden con su identidad y versión de contenido.");
        }

        if (scenarios.Scenarios.ValueKind != JsonValueKind.Array || scenarios.Scenarios.GetArrayLength() == 0)
        {
            throw new InvalidDataException($"'{definition.Id}' debe declarar al menos un escenario.");
        }

        return scenarios;
    }

    private static void ValidateManifest(AlgorithmSlug slug, AlgorithmFile definition)
    {
        if (!string.Equals(slug.Value, definition.Id, StringComparison.Ordinal))
        {
            throw new InvalidDataException($"El manifiesto de '{slug.Value}' declara otra identidad.");
        }

        if (string.IsNullOrWhiteSpace(definition.SchemaVersion) ||
            string.IsNullOrWhiteSpace(definition.ContentVersion) ||
            string.IsNullOrWhiteSpace(definition.EnglishName) ||
            string.IsNullOrWhiteSpace(definition.Paradigm) ||
            string.IsNullOrWhiteSpace(definition.Difficulty) ||
            string.IsNullOrWhiteSpace(definition.Invariant) ||
            definition.Inputs.Count == 0 ||
            definition.Outputs.Count == 0 ||
            definition.Preconditions.Count == 0 ||
            definition.Assumptions.Count == 0 ||
            definition.References.Count == 0 ||
            definition.Implementations.Count == 0)
        {
            throw new InvalidDataException($"El manifiesto de '{slug.Value}' no contiene todos los campos obligatorios.");
        }

        if (definition.Implementations.Select(item => item.Language).Distinct(StringComparer.OrdinalIgnoreCase).Count() !=
            definition.Implementations.Count)
        {
            throw new InvalidDataException($"El manifiesto de '{slug.Value}' repite perfiles de lenguaje.");
        }
    }

    private static AlgorithmSummaryContract ToSummary(AlgorithmFile algorithm) =>
        new(
            algorithm.Id,
            algorithm.ContentVersion,
            algorithm.Name,
            algorithm.EnglishName,
            algorithm.Category,
            algorithm.Summary,
            algorithm.Implementations.Select(item => item.Language).ToArray());

    private static ImplementationDescriptorContract ToDescriptor(ImplementationFile implementation) =>
        new(
            implementation.Language,
            implementation.MinimumVersion,
            implementation.EntryPoint,
            implementation.Source,
            implementation.Tests,
            implementation.ValidationProfile);

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
        await ReadJsonAsync<AlgorithmFile>(ResolveAlgorithmPath(algorithm, "algorithm.json"), cancellationToken);

    private async ValueTask<string> ReadRequiredTextAsync(
        AlgorithmSlug algorithm,
        string relativePath,
        CancellationToken cancellationToken)
    {
        string path = ResolveAlgorithmPath(algorithm, relativePath);
        if (!File.Exists(path))
        {
            throw new InvalidDataException($"Falta un archivo declarado por '{algorithm.Value}'.");
        }

        return await File.ReadAllTextAsync(path, cancellationToken);
    }

    private static async ValueTask<T> ReadJsonAsync<T>(string path, CancellationToken cancellationToken)
    {
        await using FileStream stream = File.OpenRead(path);
        T? document = await JsonSerializer.DeserializeAsync<T>(stream, s_jsonOptions, cancellationToken);
        return document ?? throw new InvalidDataException("Un archivo del catálogo no contiene JSON válido.");
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
        string ContentVersion,
        IReadOnlyList<LanguageFile> Languages,
        IReadOnlyList<string> Algorithms);

    private sealed record LanguageFile(
        string Id,
        string DisplayName,
        string FileExtension,
        bool IsInitialLanguage);

    private sealed record AlgorithmFile(
        string SchemaVersion,
        string ContentVersion,
        string Id,
        string Name,
        string EnglishName,
        string Category,
        string Paradigm,
        string Difficulty,
        string Summary,
        string Invariant,
        IReadOnlyList<string> Inputs,
        IReadOnlyList<string> Outputs,
        IReadOnlyList<string> Preconditions,
        IReadOnlyList<string> Assumptions,
        ComplexityFile Complexity,
        string Readme,
        string Scenarios,
        IReadOnlyList<ImplementationFile> Implementations,
        IReadOnlyList<ReferenceFile> References);

    private sealed record ComplexityFile(string Best, string Average, string Worst, string Space);

    private sealed record ImplementationFile(
        string Language,
        string MinimumVersion,
        string EntryPoint,
        string Source,
        string Tests,
        string ValidationProfile);

    private sealed record ReferenceFile(
        string Title,
        string Author,
        string Organization,
        int Year,
        string Url);

    private sealed record ScenarioFile(string AlgorithmId, string Version, JsonElement Scenarios);
}
