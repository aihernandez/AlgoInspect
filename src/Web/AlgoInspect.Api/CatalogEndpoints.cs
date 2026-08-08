using AlgorithmCatalog.Application.Features.GetAlgorithm;
using AlgorithmCatalog.Application.Features.GetImplementation;
using AlgorithmCatalog.Application.Features.ListAlgorithms;
using AlgorithmCatalog.Domain;

namespace AlgoInspect.Api;

internal static class CatalogEndpoints
{
    public static IEndpointRouteBuilder MapCatalogEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/catalog", ListCatalogAsync);
        endpoints.MapGet("/api/algorithms/{algorithmId}", GetAlgorithmAsync);
        endpoints.MapGet(
            "/api/algorithms/{algorithmId}/implementations/{language}",
            GetImplementationAsync);

        return endpoints;
    }

    private static async Task<IResult> ListCatalogAsync(
        ListAlgorithmsHandler handler,
        CancellationToken cancellationToken)
    {
        var catalog = await handler.HandleAsync(cancellationToken);
        return Results.Ok(catalog);
    }

    private static async Task<IResult> GetAlgorithmAsync(
        string algorithmId,
        GetAlgorithmHandler handler,
        CancellationToken cancellationToken)
    {
        if (!AlgorithmSlug.TryCreate(algorithmId, out AlgorithmSlug algorithm))
        {
            return Results.BadRequest(new { error = "El identificador del algoritmo no es válido." });
        }

        var document = await handler.HandleAsync(algorithm, cancellationToken);
        return document is null ? Results.NotFound() : Results.Ok(document);
    }

    private static async Task<IResult> GetImplementationAsync(
        string algorithmId,
        string language,
        GetImplementationHandler handler,
        CancellationToken cancellationToken)
    {
        if (!AlgorithmSlug.TryCreate(algorithmId, out AlgorithmSlug algorithm))
        {
            return Results.BadRequest(new { error = "El identificador del algoritmo no es válido." });
        }

        var implementation = await handler.HandleAsync(algorithm, language, cancellationToken);
        return implementation is null ? Results.NotFound() : Results.Ok(implementation);
    }
}
