using AlgorithmCatalog.Application.Features.GetAlgorithm;
using AlgorithmCatalog.Application.Features.GetImplementation;
using AlgorithmCatalog.Application.Features.GetScenarios;
using AlgorithmCatalog.Application.Features.ListAlgorithms;
using AlgorithmCatalog.Domain;

namespace AlgoInspect.Api;

internal static class CatalogEndpoints
{
    private const string SupportedSchemaMajor = "1";

    public static IEndpointRouteBuilder MapCatalogEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/catalog", ListCatalogAsync);
        endpoints.MapGet("/api/algorithms/{algorithmId}", GetAlgorithmAsync);
        endpoints.MapGet("/api/algorithms/{algorithmId}/scenarios", GetScenariosAsync);
        endpoints.MapGet(
            "/api/algorithms/{algorithmId}/implementations/{language}",
            GetImplementationAsync);

        return endpoints;
    }

    private static async Task<IResult> ListCatalogAsync(
        HttpRequest request,
        ListAlgorithmsHandler handler,
        CancellationToken cancellationToken)
    {
        IResult? incompatibility = CheckCompatibility(request);
        if (incompatibility is not null)
        {
            return incompatibility;
        }

        return Results.Ok(await handler.HandleAsync(cancellationToken));
    }

    private static async Task<IResult> GetAlgorithmAsync(
        HttpRequest request,
        string algorithmId,
        GetAlgorithmHandler handler,
        CancellationToken cancellationToken)
    {
        IResult? validation = ValidateRequest(request, algorithmId, out AlgorithmSlug algorithm);
        if (validation is not null)
        {
            return validation;
        }

        var document = await handler.HandleAsync(algorithm, cancellationToken);
        return document is null
            ? Problem(404, "algorithm-not-found", "Algoritmo no publicado", "El algoritmo solicitado no está publicado.")
            : Results.Ok(document);
    }

    private static async Task<IResult> GetScenariosAsync(
        HttpRequest request,
        string algorithmId,
        GetScenariosHandler handler,
        CancellationToken cancellationToken)
    {
        IResult? validation = ValidateRequest(request, algorithmId, out AlgorithmSlug algorithm);
        if (validation is not null)
        {
            return validation;
        }

        var scenarios = await handler.HandleAsync(algorithm, cancellationToken);
        return scenarios is null
            ? Problem(404, "algorithm-not-found", "Algoritmo no publicado", "El algoritmo solicitado no está publicado.")
            : Results.Ok(scenarios);
    }

    private static async Task<IResult> GetImplementationAsync(
        HttpRequest request,
        string algorithmId,
        string language,
        GetAlgorithmHandler algorithmHandler,
        GetImplementationHandler implementationHandler,
        CancellationToken cancellationToken)
    {
        IResult? validation = ValidateRequest(request, algorithmId, out AlgorithmSlug algorithm);
        if (validation is not null)
        {
            return validation;
        }

        if (string.IsNullOrWhiteSpace(language))
        {
            return Problem(400, "invalid-language", "Lenguaje inválido", "El identificador de lenguaje es obligatorio.");
        }

        var document = await algorithmHandler.HandleAsync(algorithm, cancellationToken);
        if (document is null)
        {
            return Problem(404, "algorithm-not-found", "Algoritmo no publicado", "El algoritmo solicitado no está publicado.");
        }

        var implementation = await implementationHandler.HandleAsync(algorithm, language, cancellationToken);
        return implementation is null
            ? Problem(
                404,
                "language-not-supported",
                "Lenguaje no disponible",
                $"{document.Algorithm.Name} no tiene una implementación publicada para el lenguaje solicitado.")
            : Results.Ok(implementation);
    }

    private static IResult? ValidateRequest(
        HttpRequest request,
        string algorithmId,
        out AlgorithmSlug algorithm)
    {
        algorithm = default;
        IResult? incompatibility = CheckCompatibility(request);
        if (incompatibility is not null)
        {
            return incompatibility;
        }

        return AlgorithmSlug.TryCreate(algorithmId, out algorithm)
            ? null
            : Problem(400, "invalid-algorithm-id", "Identificador inválido", "El identificador del algoritmo no es válido.");
    }

    private static IResult? CheckCompatibility(HttpRequest request)
    {
        string requestedVersion = request.Headers["X-AlgoInspect-Schema-Version"].ToString();
        if (string.IsNullOrWhiteSpace(requestedVersion))
        {
            return null;
        }

        string requestedMajor = requestedVersion.Split('.', 2)[0];
        return string.Equals(requestedMajor, SupportedSchemaMajor, StringComparison.Ordinal)
            ? null
            : Problem(
                409,
                "schema-version-incompatible",
                "Versión de contrato incompatible",
                $"La API admite la versión mayor {SupportedSchemaMajor} del contrato.");
    }

    internal static IResult Problem(int status, string code, string title, string detail) =>
        Results.Problem(
            statusCode: status,
            title: title,
            detail: detail,
            type: $"urn:algoinspect:error:{code}",
            extensions: new Dictionary<string, object?> { ["code"] = code });
}
