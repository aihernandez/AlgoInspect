using AlgoInspect.Api;
using AlgorithmCatalog.Application;
using AlgorithmCatalog.Application.Features.GetAlgorithm;
using AlgorithmCatalog.Application.Features.GetImplementation;
using AlgorithmCatalog.Application.Features.ListAlgorithms;
using AlgorithmCatalog.Infrastructure.FileSystem;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

ContentLayout contentLayout = RepositoryLayout.Find(
    builder.Environment.ContentRootPath,
    AppContext.BaseDirectory,
    builder.Configuration["RepositoryRoot"]);

builder.Services.AddSingleton<IAlgorithmCatalog>(
    new FileSystemAlgorithmCatalog(new FileSystemCatalogOptions(contentLayout.CatalogRoot)));
builder.Services.AddSingleton<ListAlgorithmsHandler>();
builder.Services.AddSingleton<GetAlgorithmHandler>();
builder.Services.AddSingleton<GetImplementationHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();
var webFileProvider = new PhysicalFileProvider(contentLayout.WebRoot);

app.UseExceptionHandler();
app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = webFileProvider,
    DefaultFileNames = ["index.html"],
});
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = webFileProvider,
});

app.MapCatalogEndpoints();
app.MapGet("/api/health", () => Results.Ok(new { status = "ready" }));

app.Run();

public partial class Program;
