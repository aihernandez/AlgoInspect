using System.Text.Json;
using AlgorithmCatalog.Application;
using AlgorithmCatalog.Domain;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace AlgoInspect.Api;

internal sealed class CatalogHealthCheck(IAlgorithmCatalog catalog) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var overview = await catalog.ListAsync(cancellationToken);
            if (overview.Algorithms.Count == 0)
            {
                return HealthCheckResult.Unhealthy("El catálogo canónico no contiene algoritmos publicados.");
            }

            var implementationCount = 0;
            foreach (var summary in overview.Algorithms)
            {
                if (!AlgorithmSlug.TryCreate(summary.Id, out AlgorithmSlug algorithm))
                {
                    return HealthCheckResult.Unhealthy($"El identificador {summary.Id} no es válido.");
                }

                var document = await catalog.GetAsync(algorithm, cancellationToken);
                var scenarios = await catalog.GetScenariosAsync(algorithm, cancellationToken);
                if (document is null || scenarios is null || document.Implementations.Count == 0)
                {
                    return HealthCheckResult.Unhealthy($"La vertical canónica {summary.Id} está incompleta.");
                }

                foreach (var implementation in document.Implementations)
                {
                    if (await catalog.GetImplementationAsync(algorithm, implementation.Language, cancellationToken) is null)
                    {
                        return HealthCheckResult.Unhealthy(
                            $"La implementación {implementation.Language} de {summary.Id} no está disponible.");
                    }
                    implementationCount++;
                }
            }

            return HealthCheckResult.Healthy(
                "Todas las verticales declaradas del catálogo canónico están disponibles.",
                new Dictionary<string, object>
                {
                    ["contentVersion"] = overview.ContentVersion,
                    ["algorithmCount"] = overview.Algorithms.Count,
                    ["implementationCount"] = implementationCount,
                });
        }
        catch (Exception exception) when (exception is IOException or InvalidDataException or JsonException)
        {
            return HealthCheckResult.Unhealthy(
                "El catálogo canónico no se puede leer o validar.",
                exception);
        }
    }
}
