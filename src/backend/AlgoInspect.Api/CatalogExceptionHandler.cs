using Microsoft.AspNetCore.Diagnostics;

namespace AlgoInspect.Api;

internal sealed class CatalogExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not IOException and not InvalidDataException and not System.Text.Json.JsonException)
        {
            return false;
        }

        httpContext.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
        await Results.Problem(
            statusCode: StatusCodes.Status503ServiceUnavailable,
            title: "Catálogo no disponible",
            detail: "El contenido canónico no pudo validarse. Intenta nuevamente más tarde.",
            type: "urn:algoinspect:error:catalog-inconsistent",
            extensions: new Dictionary<string, object?> { ["code"] = "catalog-inconsistent" })
            .ExecuteAsync(httpContext);
        return true;
    }
}
