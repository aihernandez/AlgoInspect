using AlgorithmAnalysis.Contracts;

namespace AlgorithmCatalog.Application.Features.ListAlgorithms;

public sealed class ListAlgorithmsHandler(IAlgorithmCatalog catalog)
{
    public ValueTask<CatalogOverviewContract> HandleAsync(CancellationToken cancellationToken) =>
        catalog.ListAsync(cancellationToken);
}
