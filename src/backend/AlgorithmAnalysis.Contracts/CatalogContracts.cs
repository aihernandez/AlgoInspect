using System.Text.Json;

namespace AlgorithmAnalysis.Contracts;

public sealed record LanguageContract(
    string Id,
    string DisplayName,
    string FileExtension,
    bool IsInitialLanguage);

public sealed record AlgorithmSummaryContract(
    string Id,
    string ContentVersion,
    string Name,
    string EnglishName,
    string Category,
    string Summary,
    IReadOnlyList<string> AvailableLanguages);

public sealed record CatalogOverviewContract(
    string SchemaVersion,
    string ContentVersion,
    IReadOnlyList<LanguageContract> Languages,
    IReadOnlyList<AlgorithmSummaryContract> Algorithms);

public sealed record ComplexityContract(
    string Best,
    string Average,
    string Worst,
    string Space);

public sealed record ReferenceContract(
    string Title,
    string Author,
    string Organization,
    int Year,
    string Url);

public sealed record ImplementationDescriptorContract(
    string Language,
    string MinimumVersion,
    string EntryPoint,
    string SourcePath,
    string TestPath,
    string ValidationProfile);

public sealed record AlgorithmDocumentContract(
    string SchemaVersion,
    string ContentVersion,
    AlgorithmSummaryContract Algorithm,
    string Paradigm,
    string Difficulty,
    IReadOnlyList<string> Inputs,
    IReadOnlyList<string> Outputs,
    IReadOnlyList<string> Preconditions,
    IReadOnlyList<string> Assumptions,
    string Invariant,
    ComplexityContract Complexity,
    string Readme,
    JsonElement Scenarios,
    IReadOnlyList<ImplementationDescriptorContract> Implementations,
    IReadOnlyList<ReferenceContract> References);

public sealed record ScenarioDocumentContract(
    string SchemaVersion,
    string ContentVersion,
    string AlgorithmId,
    JsonElement Scenarios);

public sealed record ImplementationSourceContract(
    string SchemaVersion,
    string ContentVersion,
    string AlgorithmId,
    string Language,
    string MinimumVersion,
    string EntryPoint,
    string FileName,
    string Source,
    string TestFileName,
    string Tests,
    string ValidationProfile);
