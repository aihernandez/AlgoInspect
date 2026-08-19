using System.Net;
using System.Threading.RateLimiting;
using AlgoInspect.Api;
using AlgorithmCatalog.Application;
using AlgorithmCatalog.Application.Features.GetAlgorithm;
using AlgorithmCatalog.Application.Features.GetImplementation;
using AlgorithmCatalog.Application.Features.GetScenarios;
using AlgorithmCatalog.Application.Features.ListAlgorithms;
using AlgorithmCatalog.Infrastructure.FileSystem;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Desactivada por defecto: nada sale de la máquina salvo que se habilite.
builder.AddOptionalTelemetry();

ContentLayout contentLayout = RepositoryLayout.Find(
    builder.Environment.ContentRootPath,
    AppContext.BaseDirectory,
    builder.Environment.EnvironmentName,
    builder.Configuration["Content:CatalogRoot"],
    builder.Configuration["Content:WebRoot"],
    builder.Configuration["RepositoryRoot"]);

bool reverseProxyEnabled = builder.Configuration.GetValue<bool>("InternetHosting:ReverseProxy:Enabled");
string[] knownProxies = builder.Configuration
    .GetSection("InternetHosting:ReverseProxy:KnownProxies")
    .Get<string[]>() ?? [];

if (reverseProxyEnabled && knownProxies.Length == 0)
{
    throw new InvalidOperationException(
        "InternetHosting:ReverseProxy:KnownProxies debe contener al menos una IP cuando el proxy está habilitado.");
}

builder.WebHost.ConfigureKestrel(options =>
{
    options.AddServerHeader = false;
    options.Limits.MaxRequestBodySize = 1_048_576;
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.ForwardLimit = 1;

    foreach (string knownProxy in knownProxies)
    {
        options.KnownProxies.Add(IPAddress.Parse(knownProxy));
    }
});

builder.Services.AddSingleton<IAlgorithmCatalog>(
    new FileSystemAlgorithmCatalog(new FileSystemCatalogOptions(contentLayout.CatalogRoot)));
builder.Services.AddSingleton<ListAlgorithmsHandler>();
builder.Services.AddSingleton<GetAlgorithmHandler>();
builder.Services.AddSingleton<GetImplementationHandler>();
builder.Services.AddSingleton<GetScenariosHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<CatalogExceptionHandler>();
builder.Services.AddResponseCompression();
builder.Services.AddHttpLogging(options =>
{
    options.LoggingFields =
        HttpLoggingFields.RequestMethod |
        HttpLoggingFields.RequestPath |
        HttpLoggingFields.ResponseStatusCode |
        HttpLoggingFields.Duration;
});
builder.Services.AddHealthChecks()
    .AddCheck<CatalogHealthCheck>("canonical-catalog", tags: ["ready"]);

int permitLimit = builder.Configuration.GetValue("InternetHosting:RateLimit:PermitLimit", 120);
int windowSeconds = builder.Configuration.GetValue("InternetHosting:RateLimit:WindowSeconds", 60);
if (permitLimit <= 0 || windowSeconds <= 0)
{
    throw new InvalidOperationException("Los valores de InternetHosting:RateLimit deben ser mayores que cero.");
}

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        if (!context.Request.Path.StartsWithSegments("/api"))
        {
            return RateLimitPartition.GetNoLimiter("static-assets");
        }

        return RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permitLimit,
                Window = TimeSpan.FromSeconds(windowSeconds),
                QueueLimit = 0,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                AutoReplenishment = true,
            });
    });
});

var app = builder.Build();
var webFileProvider = new PhysicalFileProvider(contentLayout.WebRoot);

if (reverseProxyEnabled)
{
    app.UseForwardedHeaders();
}

app.UseExceptionHandler();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
    if (builder.Configuration.GetValue<bool>("InternetHosting:HttpsRedirectionEnabled"))
    {
        app.UseHttpsRedirection();
    }
}

app.UseHttpLogging();
app.UseResponseCompression();
app.UseSecurityHeaders();
app.UseRateLimiter();
app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = webFileProvider,
    DefaultFileNames = ["index.html"],
});
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = webFileProvider,
    OnPrepareResponse = StaticAssetCachePolicy.Apply,
});

app.MapCatalogEndpoints();
app.MapHealthChecks("/api/health", HealthEndpointOptions.Readiness).DisableRateLimiting();
app.MapHealthChecks("/api/health/ready", HealthEndpointOptions.Readiness).DisableRateLimiting();
app.MapHealthChecks("/api/health/live", HealthEndpointOptions.Liveness).DisableRateLimiting();

app.Run();

public partial class Program;
