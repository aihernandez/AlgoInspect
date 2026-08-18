using AlgorithmAnalysis.Contracts;
using AlgorithmCatalog.Domain;

namespace AlgorithmCatalog.Application.Features.GetScenarios;

public sealed class GetScenariosHandler(IAlgorithmCatalog catalog)
{
    public ValueTask<ScenarioDocumentContract?> HandleAsync(
        AlgorithmSlug algorithm,
        CancellationToken cancellationToken) =>
        catalog.GetScenariosAsync(algorithm, cancellationToken);
}
