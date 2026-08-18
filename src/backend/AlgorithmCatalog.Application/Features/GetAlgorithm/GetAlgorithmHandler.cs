using AlgorithmAnalysis.Contracts;
using AlgorithmCatalog.Domain;

namespace AlgorithmCatalog.Application.Features.GetAlgorithm;

public sealed class GetAlgorithmHandler(IAlgorithmCatalog catalog)
{
    public ValueTask<AlgorithmDocumentContract?> HandleAsync(
        AlgorithmSlug algorithm,
        CancellationToken cancellationToken) =>
        catalog.GetAsync(algorithm, cancellationToken);
}
