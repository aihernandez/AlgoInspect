using AlgorithmAnalysis.Contracts;
using AlgorithmCatalog.Domain;

namespace AlgorithmCatalog.Application;

public interface IAlgorithmCatalog
{
    ValueTask<CatalogOverviewContract> ListAsync(CancellationToken cancellationToken);

    ValueTask<AlgorithmDocumentContract?> GetAsync(
        AlgorithmSlug algorithm,
        CancellationToken cancellationToken);

    ValueTask<ImplementationSourceContract?> GetImplementationAsync(
        AlgorithmSlug algorithm,
        string language,
        CancellationToken cancellationToken);
}
