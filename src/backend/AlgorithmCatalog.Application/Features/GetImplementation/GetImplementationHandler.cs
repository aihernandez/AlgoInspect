using AlgorithmAnalysis.Contracts;
using AlgorithmCatalog.Domain;

namespace AlgorithmCatalog.Application.Features.GetImplementation;

public sealed class GetImplementationHandler(IAlgorithmCatalog catalog)
{
    public ValueTask<ImplementationSourceContract?> HandleAsync(
        AlgorithmSlug algorithm,
        string language,
        CancellationToken cancellationToken) =>
        catalog.GetImplementationAsync(algorithm, language, cancellationToken);
}
