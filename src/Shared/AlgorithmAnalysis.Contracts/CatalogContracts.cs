using System.Text.Json;

namespace AlgorithmAnalysis.Contracts;

public sealed record LanguageContract(
    string Id,
    string DisplayName,
    string FileExtension,
    bool IsInitialLanguage);

public sealed record AlgorithmSummaryContract(
    string Id,
    string Name,
    string Category,
    string Summary);

public sealed record CatalogOverviewContract(
    string SchemaVersion,
    IReadOnlyList<LanguageContract> Languages,
    IReadOnlyList<AlgorithmSummaryContract> Algorithms);

public sealed record ComplexityContract(
    string Best,
    string Average,
    string Worst,
    string Space);

public sealed record ImplementationDescriptorContract(
    string Language,
    string SourcePath,
    string? TestPath);

public sealed record AlgorithmDocumentContract(
    AlgorithmSummaryContract Algorithm,
    ComplexityContract Complexity,
    string Readme,
    JsonElement Scenarios,
    IReadOnlyList<ImplementationDescriptorContract> Implementations);

public sealed record ImplementationSourceContract(
    string AlgorithmId,
    string Language,
    string FileName,
    string Source,
    string? TestFileName,
    string? Tests);
